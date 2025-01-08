import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface PhotosPageProps {
  params: {
    id: string;
    eventId: string;
  };
}

export default async function PhotosPage({ params }: PhotosPageProps) {
  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
  });

  if (!event?.hasPhotos) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
  }

  return (
    <div className="mt-4 pb-20">
      <div>
        <p className="text-gray-700">Album photo</p>
      </div>
    </div>
  );
}
