"use client";

import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

// type ActivityType = "morning" | "afternoon";

interface ActivitiesCalendarProps {
  startDate: Date;
  endDate: Date;
}

export default function ActivitiesCalendar({
  startDate,
  endDate,
}: ActivitiesCalendarProps) {
  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  return (
    <div className="space-y-4 bg-gray-50 rounded-lg shadow-sm border p-6 mt-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Planning</h2>
        </div>
        <div className="grid grid-cols-[auto,1fr]">
          <div>
            {/* Labels de gauche */}
            <div className="h-12" /> {/* Espace pour l'en-tête des dates */}
            <div className="flex justify-between">
              <div className="h-48 px-2 w-full flex flex-col justify-center text-sm font-medium bg-white text-gray-700 border relative">
                <p>Activités</p>
              </div>
              <div>
                <div
                  className={cn(
                    "h-24 px-2 border flex items-center justify-center bg-white text-gray-700"
                  )}
                >
                  Matin
                </div>
                <div
                  className={cn(
                    "h-24 px-2 border flex items-center justify-center bg-white text-gray-700"
                  )}
                >
                  Après-midi
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
              {/* En-tête avec les dates */}
              {days.map((day, index) => (
                <div
                  key={`${day.toISOString()}-${index}`}
                  className="h-12 px-2 flex items-center justify-center border-b text-sm font-medium text-gray-700"
                >
                  {format(day, "EEE d", { locale: fr })}
                </div>
              ))}
              {/* Ligne des activités du matin */}
              {days.map((day, index) => (
                <div
                  key={`${day.toISOString()}-${index}-morning`}
                  className={cn(
                    "h-24 border flex items-center justify-between p-1 text-sm bg-gray-100"
                  )}
                >
                </div>
              ))}
              {/* Ligne des activités de l'après-midi */}
              {days.map((day, index) => (
                <div
                  key={`${day.toISOString()}-${index}-afternoon`}
                  className={cn(
                    "h-24 border flex items-center justify-between p-1 text-sm bg-gray-100"
                  )}
                >
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
