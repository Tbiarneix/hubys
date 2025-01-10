/* eslint-disable react/no-unescaped-entities */
import prisma from "@/lib/prisma";

interface EventPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

export default async function EventPage(props: EventPageProps) {
  const params = await props.params;
  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
  });

  if (!event) {
    return <div>Événement non trouvé</div>;
  }

  const startDate = new Date(event.startDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const endDate = new Date(event.endDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="mt-4 pb-20">
      <p>{startDate} - {endDate}</p>
      <p className="text-gray-700">"Aucune description"</p>
    </div>
  );
}
