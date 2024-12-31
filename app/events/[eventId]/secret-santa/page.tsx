import { SecretSantaCard } from "@/components/secretSanta/SecretSantaCard";

interface SecretSantaPageProps {
  params: {
    eventId: string;
  };
}

export default function SecretSantaPage({ params: { eventId } }: SecretSantaPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Secret Santa</h1>
      <SecretSantaCard groupId={eventId} />
    </div>
  );
}