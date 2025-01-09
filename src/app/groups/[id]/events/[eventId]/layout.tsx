import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EventTabs from "@/components/EventTabs";

interface EventLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

export default async function EventLayout(props: EventLayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

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

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.name}</h1>
            {children}
            <EventTabs event={event} groupId={params.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
