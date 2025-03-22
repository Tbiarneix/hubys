import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientActivities from "./ClientActivities";
// import Map from "./Map";

interface ActivitiesPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

export default async function ActivitiesPage(props: ActivitiesPageProps) {
  const params = await props.params;
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
    <div className="flex flex-col mt-4 pb-20 gap-4">
      <ClientActivities startDate={event.startDate} endDate={event.endDate} />
      {/* <Map /> */}
    </div>
  );
}
