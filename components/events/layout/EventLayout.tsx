"use client";

import { EventTabs } from "./EventTabs";

interface EventLayoutProps {
  eventId: string;
  children: React.ReactNode;
}

export function EventLayout({ eventId, children }: EventLayoutProps) {
  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-screen-xl mx-auto p-4">
        {children}
      </main>
      <EventTabs eventId={eventId} />
    </div>
  );
}