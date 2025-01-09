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

  return (
    <div className="mt-4 pb-20">
      <p className="text-gray-700">{event?.description || "Aucune description"}</p>
    </div>
  );
}
