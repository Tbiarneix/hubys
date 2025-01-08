import LocationClient from "./LocationClient";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface LocationPageProps {
  params: {
    id: string;
    eventId: string;
  };
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
              user: true,
              partner: true,
              children: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    redirect(`/groups/${id}`);
  }

  if (!event.hasLocation) {
    redirect(`/groups/${id}/events/${eventId}`);
  }

  // Transform members into subgroups
  const subgroups = event.group.members.map(member => ({
    id: member.id,
    adults: [
      { id: member.userId, name: member.user.name },
      ...(member.partner ? [{ id: member.partnerId!, name: member.partner.name! }] : []),
    ],
    children: member.children.map(child => ({
      id: child.id,
      name: child.firstName,
    })),
  }));

  return {
    locations: event.locations,
    subgroups,
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const data = await getData(params);

  return <LocationClient initialData={data} eventId={params.eventId} groupId={params.id} />;
}
