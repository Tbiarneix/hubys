import LocationClient from "./LocationClient";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Subgroup as LocationSubgroup, Location, LocationSettings } from "@/types/location";

interface EventPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

interface LocationData {
  locations: Location[];
  subgroups: LocationSubgroup[];
  settings: LocationSettings;
}

async function getData(context: EventPageProps): Promise<LocationData> {
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
      subgroups: true,
      group: {
        include: {
          members: {
            include: {
              user: true,
              children: true
            }
          }
        }
      }
    }
  });

  const locationsubgroups = await prisma.subgroup.findMany({
    where: {
      eventId: params.eventId
    },
    select: {
      id: true,
      activeAdults: true,
      activeChildren: true,
    }
  });

  // Récupérer tous les enfants actifs en une seule requête
  const activeChildren = await prisma.child.findMany({
    where: {
      id: {
        in: locationsubgroups.flatMap(s => s.activeChildren)
      }
    },
    select: {
      id: true,
      firstName: true
    }
  });

  const childrenMap = new Map(activeChildren.map(child => [child.id, child]));

  const transformedSubgroups: LocationSubgroup[] = locationsubgroups.map(subgroup => {
    // Trouver les utilisateurs adultes correspondants
    const adults = subgroup.activeAdults.map(userId => {
      const member = event?.group.members.find(m => m.userId === userId);
      return {
        id: userId,
        name: member?.user.name || 'Sans nom'
      };
    });
  
    // Utiliser la Map pour accéder directement aux infos des enfants
    const children = subgroup.activeChildren.map(childId => {
      const child = childrenMap.get(childId);
      return {
        id: childId,
        name: child?.firstName || 'Sans nom'
      };
    });
  
    return {
      id: subgroup.id,
      adults,
      children
    };
  });

  if (!event) {
    redirect(`/groups/${params.id}`);
  }

  if (!event.hasLocation) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
  }

  return {
    locations: event.locations,
    subgroups: transformedSubgroups,
    settings: {
      adultShare: event.adultShare,
      childShare: event.childShare
    }
  };
}

export default async function LocationPage({ 
  params 
}: EventPageProps) {
  const { eventId, id } = await params;
  const data = await getData({ params });

  return (
    <LocationClient 
      initialData={{
        locations: data.locations,
        subgroups: data.subgroups,
        settings: data.settings
      }} 
      eventId={eventId} 
      groupId={id} 
    />
  );
}
