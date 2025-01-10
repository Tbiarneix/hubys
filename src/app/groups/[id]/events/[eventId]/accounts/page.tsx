import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface AccountsPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

export default async function AccountsPage(props: AccountsPageProps) {
  const params = await props.params;
  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
  });

  if (!event?.hasAccounts) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
  }

  return (
    <div className="mt-4 pb-20">
      <div>
        <p className="text-gray-700">Gestion des comptes</p>
      </div>
    </div>
  );
}
