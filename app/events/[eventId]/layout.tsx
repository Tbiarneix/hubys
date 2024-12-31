import { EventLayout } from "@/components/events/layout/EventLayout";

interface EventPageLayoutProps {
  params: {
    eventId: string;
  };
  children: React.ReactNode;
}

export default function EventPageLayout({ 
  params: { eventId }, 
  children 
}: EventPageLayoutProps) {
  return (
    <EventLayout eventId={eventId}>
      {children}
    </EventLayout>
  );
}