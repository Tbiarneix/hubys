import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface ActivitiesPageProps {
  params: {
    id: string;
    eventId: string;
  };
}

export default async function ActivitiesPage({ params }: ActivitiesPageProps) {
  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
  });

  if (!event?.hasActivities) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
  }

  return (
    <div className="mt-4 pb-20">
      <div>
        <p className="text-gray-700">Gestion des activités</p>
      </div>
    </div>
  );
}
