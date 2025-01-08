import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EventTabs from "@/components/EventTabs";
// import { ChatSidebar } from "@/components/groups/ChatSidebar";

interface EventPageProps {
  params: {
    groupId: string;
    eventId: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
    },
  });

  if (!event) {
    redirect(`/groups/${params.groupId}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Main content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.name}</h1>
            <EventTabs event={event} groupId={params.groupId} />
          </div>
        </div>
        
        {/* Chat sidebar */}
        {/* <ChatSidebar groupId={params.groupId} /> */}
      </div>
    </div>
  );
}
