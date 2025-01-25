import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TodoList } from "./TodoList";

interface TodoListPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

export default async function TodoListPage(props: TodoListPageProps) {
  const params = await props.params;
  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
    include: {
      subgroups: true,
    },
  });

  if (!event?.hasTodoList) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
  }

  // Récupérer tous les adultes actifs de l'événement
  const activeAdults = event.subgroups
    .flatMap((subgroup) => subgroup.adults)
    .filter((userId, index, self) => self.indexOf(userId) === index);

  // Récupérer les informations des utilisateurs
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: activeAdults,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return <TodoList activeAdults={users} />;
}
