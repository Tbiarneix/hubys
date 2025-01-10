import LocationClient from "./LocationClient";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface GroupMember {
  id: string;
  userId: string;
  user: {
    name: string | null;
    children: Array<{
      id: string;
      firstName: string;
    }>;
    sentInvitations: Array<{
      toUser: { id: string; name: string | null } | null;
    }>;
    receivedInvitations: Array<{
      fromUser: { id: string; name: string | null } | null;
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

type Params = {
  params: Promise<{ id: string; eventId: string }>
}

async function getData(context: Params) {
  const params = await context.params;
  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
    include: {
      locations: {
        include: {
          votes: true
        }
      },
      group: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  children: true,
                  sentInvitations: {
                    where: { status: 'ACCEPTED' },
                    include: { toUser: true }
                  },
                  receivedInvitations: {
                    where: { status: 'ACCEPTED' },
                    include: { fromUser: true }
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
    redirect(`/groups/${params.id}`);
  }

  if (!event.hasLocation) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
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
        { id: member.userId, name: member.user.name || 'Sans nom' },
        ...(partner ? [{ id: partner.id, name: partner.name || 'Sans nom' }] : []),
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
      childShare: event.childShare
    }
  };
}

export default async function LocationPage({ 
  params 
}: Params) {
  const { eventId, id } = await params;
  const data = await getData({ params });

  return <LocationClient initialData={data} eventId={eventId} groupId={id} />;
}
