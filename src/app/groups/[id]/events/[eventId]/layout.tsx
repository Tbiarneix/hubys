import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventTabs from "@/components/EventTabs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
            <Link href={`/groups/${params.id}`}
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au groupe
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.name}</h1>
            {children}
            <EventTabs event={event} groupId={params.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
