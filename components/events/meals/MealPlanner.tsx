"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MealDialog } from "./MealDialog";
import { MealList } from "./MealList";
import { useMeals } from "@/hooks/events/use-meals";

interface MealPlannerProps {
  eventId: string;
  date: Date;
}

export function MealPlanner({ eventId, date }: MealPlannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { meals, isLoading } = useMeals(eventId, date);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">
          Repas du {format(date, "EEEE d MMMM", { locale: fr })}
        </h3>
        <Button onClick={() => setIsDialogOpen(true)} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un repas
        </Button>
      </div>

      <MealList meals={meals} isLoading={isLoading} />

      <MealDialog
        eventId={eventId}
        date={date}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
}