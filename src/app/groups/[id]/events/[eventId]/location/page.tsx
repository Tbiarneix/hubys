import LocationClient from "./LocationClient";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface LocationPageProps {
  params: {
    id: string;
    eventId: string;
  };
}

interface User {
  id: string;
  name: string;
}

interface GroupMember {
  id: string;
  userId: string;
  user: {
    name: string;
    children: Array<{
      id: string;
      firstName: string;
    }>;
    sentInvitations: Array<{
      toUser: User;
    }>;
    receivedInvitations: Array<{
      fromUser: User;
    }>;
  };
}

interface Subgroup {
  id: string;
  adults: Array<{
    id: string;
    name: string;
  }>;
  children: Array<{
    id: string;
    name: string;
  }>;
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
  const subgroups = event.group.members.map((member: GroupMember): Subgroup => {
    // Trouver le partenaire via les invitations
    const partnerFromSent = member.user.sentInvitations[0]?.toUser;
    const partnerFromReceived = member.user.receivedInvitations[0]?.fromUser;
    const partner = partnerFromSent || partnerFromReceived;

    return {
      id: member.id,
      adults: [
        { id: member.userId, name: member.user.name },
        ...(partner ? [{ id: partner.id, name: partner.name }] : []),
      ],
      children: member.user.children.map(child => ({
        id: child.id,
        name: child.firstName,
      })),
    };
  });

  // Filtrer les doublons de couples
  const processedPartners = new Set<string>();
  const uniqueSubgroups = subgroups.filter((subgroup: Subgroup) => {
    if (subgroup.adults.length === 1) return true;
    
    const partnerIds = subgroup.adults.map(adult => adult.id).sort().join('-');
    if (processedPartners.has(partnerIds)) return false;
    
    processedPartners.add(partnerIds);
    return true;
  });

  return {
    locations: event.locations,
    subgroups: uniqueSubgroups,
    settings: {
      adultShare: event.adultShare,
      childShare: event.childShare,
    }
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const data = await getData(params);

  return <LocationClient initialData={data} eventId={params.eventId} groupId={params.id} />;
}
