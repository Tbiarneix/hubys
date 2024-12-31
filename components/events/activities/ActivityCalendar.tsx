"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ActivityList } from "./ActivityList";
import { ActivityDialog } from "./ActivityDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useActivities } from "@/hooks/events/use-activities";

interface ActivityCalendarProps {
  eventId: string;
  startDate: Date;
  endDate: Date;
}

export function ActivityCalendar({ eventId, startDate, endDate }: ActivityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { activities, isLoading } = useActivities(eventId, selectedDate);

  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-4">Calendrier des activités</h3>
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
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">
                {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
              </h4>
              <Button onClick={() => setIsDialogOpen(true)} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une activité
              </Button>
            </div>
            <ActivityList activities={activities} isLoading={isLoading} />
          </div>
        )}
      </div>

      <ActivityDialog
        eventId={eventId}
        date={selectedDate}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
}