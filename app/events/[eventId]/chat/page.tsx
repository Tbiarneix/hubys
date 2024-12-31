import { GroupChat } from "@/components/chat/GroupChat";

interface ChatPageProps {
  params: {
    eventId: string;
  };
}

export default function ChatPage({ params: { eventId } }: ChatPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chat de groupe</h1>
      <GroupChat groupId={eventId} />
    </div>
  );
}