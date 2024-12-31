"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { PresenceSelector } from "./PresenceSelector";
import { usePresence } from "@/hooks/events/use-presence";

interface PresenceCalendarProps {
  eventId: string;
  startDate: Date;
  endDate: Date;
}

export function PresenceCalendar({ eventId, startDate, endDate }: PresenceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { presence, updatePresence, isLoading } = usePresence(eventId);

  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-4">Calendrier des présences</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < startDate || date > endDate}
            locale={fr}
          />
        </div>

        {selectedDate && (
          <div>
            <h4 className="font-medium mb-4">
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </h4>
            <PresenceSelector
              date={selectedDate}
              presence={presence[format(selectedDate, "yyyy-MM-dd")] || {}}
              onChange={(value) => {
                updatePresence(selectedDate, value);
              }}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </Card>
  );
}