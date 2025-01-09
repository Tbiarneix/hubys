import LocationClient from "./LocationClient";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface LocationPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

// D'abord, définissons les interfaces pour le typage
interface Member {
  id: string;
  userId: string;
  partnerId: string | null;
  user: {
    name: string;
  };
  partner: {
    name: string;
  } | null;
  children: {
    id: string;
    firstName: string;
  }[];
}

interface Subgroup {
  id: string;
  adults: {
    id: string;
    name: string;
  }[];
  children: {
    id: string;
    name: string;
  }[];
}

async function getData({ id, eventId }: { id: string; eventId: string }) {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
      groupId: id,
    },
    include: {
      locations: {
        include: {
          votes: true,
        },
      },
      group: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  children: true,
                  sentInvitations: {
                    where: {
                      status: 'ACCEPTED'
                    },
                    include: {
                      toUser: true
                    }
                  },
                  receivedInvitations: {
                    where: {
                      status: 'ACCEPTED'
                    },
                    include: {
                      fromUser: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!event) {
    redirect(`/groups/${id}`);
  }

  if (!event.hasLocation) {
    redirect(`/groups/${id}/events/${eventId}`);
  }

  // Regrouper les membres en sous-groupes (couples/familles)
  const subgroups = event.group.members.map((member) => {
    // Trouver le partenaire via les invitations
    const partnerFromSent = member.user.sentInvitations[0]?.toUser;
    const partnerFromReceived = member.user.receivedInvitations[0]?.fromUser;
    const partner = partnerFromSent || partnerFromReceived;

    // Récupérer les enfants liés à ce membre
    const children = member.user.children;

    return {
      id: member.id,
      adults: [
        { id: member.user.id, name: member.user.name },
        ...(partner ? [{ id: partner.id, name: partner.name! }] : []),
      ],
      children: children.map(child => ({
        id: child.id,
        name: child.firstName,
      })),
    };
  });

  // Filtrer les doublons de couples
  const processedPartners = new Set<string>();
  const uniqueSubgroups = subgroups.filter(subgroup => {
    if (subgroup.adults.length === 1) return true;
    
    const partnerIds = subgroup.adults.map(adult => adult.id).sort().join('-');
    if (processedPartners.has(partnerIds)) return false;
    
    processedPartners.add(partnerIds);
    return true;
  });

  console.log(uniqueSubgroups);
  return {
    locations: event.locations,
    subgroups: uniqueSubgroups,
  };
}

export default async function LocationPage(props: LocationPageProps) {
  const params = await props.params;
  const data = await getData(params);

  return <LocationClient initialData={data} eventId={params.eventId} groupId={params.id} />;
}
