import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SubgroupCard } from "./SubgroupCard";
import { redirect } from "next/navigation";

interface EventPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

export default async function EventPage(props: EventPageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <div>Non autorisé</div>;
  }

  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
    include: {
      subgroups: true,
      group: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  children: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!event) {
    redirect(`/groups/${params.id}`);
  }

  const startDate = new Date(event.startDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const endDate = new Date(event.endDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  // Créer un mapping des utilisateurs pour un accès facile
  const userMap = new Map();
  event.group.members.forEach(member => {
    userMap.set(member.userId, {
      name: member.user.name || 'Sans nom',
      children: member.user.children,
    });
  });

  return (
    <div className="mt-4 pb-20">
      <p className="text-gray-600 mb-8">{startDate} - {endDate}</p>

      <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5" />
          Qui sera là ?
        </h2>
        <div className="flex flex-wrap -mx-2">
          {event.subgroups.map((subgroup) => (
            <SubgroupCard
              key={subgroup.id}
              subgroup={subgroup}
              userMap={userMap}
              currentUserId={session.user.id}
              eventId={params.eventId}
              groupId={params.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
