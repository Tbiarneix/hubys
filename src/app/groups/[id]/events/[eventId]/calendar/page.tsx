import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

interface CalendarPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

export default async function CalendarPage(props: CalendarPageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
  });

  if (!event) {
    redirect(`/groups/${params.id}`);
  }

  if (!event.hasCalendar) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
  }

  return (
    <div className="mt-4 pb-20">
      <div>
        <p className="text-gray-700">Calendrier des présences</p>
      </div>
    </div>
  );
}
