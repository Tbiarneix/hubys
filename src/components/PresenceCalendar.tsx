import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import React from "react";
import { Check, X } from "lucide-react";

interface SubgroupWithUsers {
  id: string;
  activeAdults: string[]; // IDs des utilisateurs adultes actifs
  activeChildren: string[]; // IDs des enfants actifs
}

interface PresenceCalendarProps {
  startDate: Date;
  endDate: Date;
  subgroups: SubgroupWithUsers[];
  userMap: Map<string, {
    name: string;
    children: Array<{ id: string; firstName: string; }>;
  }>;
  currentUserId: string;
}

export function PresenceCalendar({
  startDate,
  endDate,
  subgroups,
  userMap,
  currentUserId,
}: PresenceCalendarProps) {
  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  return (
    <div className="space-y-4 bg-gray-50 rounded-lg shadow-sm border p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-900">
        Calendrier des présences
      </h2>
      <div className="grid grid-cols-[auto,1fr]">
        <div>
          {/* Labels de gauche pour les sous-groupes */}
          <div className="h-12" /> {/* Espace pour l'en-tête des dates */}
          {subgroups.map((subgroup) => (
            <div key={subgroup.id} className="flex justify-between">
              <div
                className="h-16 px-2 w-full flex flex-col justify-center text-sm font-medium text-gray-700 border">
                <p>
                  {subgroup.activeAdults.map((userId, index) => (
                    <span key={userId}>
                      {index > 0 && <span key={`sep-${userId}`}> & </span>}
                      <span key={userId}>{userMap.get(userId)?.name || 'Sans nom'}</span>
                    </span>
                  ))}
                </p>
                <p>
                  {subgroup.activeChildren.map((childId, index) => {
                    const child = Array.from(userMap.values())
                      .flatMap(u => u.children)
                      .find(c => c.id === childId);
                    return (
                      <span key={childId}>
                        {index > 0 && <span key={`sep-${childId}`}>, </span>}
                        <span key={childId} className="text-sm text-gray-700">{child?.firstName}</span>
                      </span>
                    );
                  })}
                </p>
              </div>
              <div>
                <div className={cn("h-8 px-2 border flex items-center justify-center hover:bg-gray-50 text-gray-700")}>
                  Midi
                </div>
                <div className={cn("h-8 px-2 border flex items-center justify-center hover:bg-gray-50 text-gray-700")}>
                  Soir
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {/* En-tête des dates */}
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="h-12 px-2 flex items-center justify-center border-b text-sm font-medium text-gray-700"
              >
                {format(day, "EEE d", { locale: fr })}
              </div>
            ))}
            {/* Grille des présences */}
            {subgroups.map((subgroup) => (
              <React.Fragment key={subgroup.id}>
                {days.map((day) => {
                  const isUserActive =
                    subgroup.activeAdults.includes(currentUserId) ||
                    subgroup.activeChildren.includes(currentUserId);

                  return (
                    <>
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "h-8 border flex items-center justify-center cursor-pointer hover:bg-gray-50",
                          isUserActive && "bg-green-500 hover:bg-green-200",
                          !isUserActive && "bg-red-500 hover:bg-red-200 "
                        )}
                      >
                        {isUserActive ? <Check /> : <X />}
                      </div>
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "h-8 border flex items-center justify-center cursor-pointer hover:bg-gray-50",
                          isUserActive && "bg-green-500 hover:bg-green-200",
                          !isUserActive && "bg-red-500 hover:bg-red-200 "
                        )}
                      >
                        {isUserActive ? <Check /> : <X />}
                      </div>
                    </>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
