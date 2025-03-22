"use client";

import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Activity } from "@prisma/client";
import { useParams } from "next/navigation";
import { CreateActivityModal } from "./CreateActivityModal";
import { UpdateActivityModal } from "./UpdateActivityModal";
import SubscribeActivityModal from "./SubscribeActivityModal";
import { Pencil, Plus } from "lucide-react";

interface ActivitiesCalendarProps {
  startDate: Date;
  endDate: Date;
}

export default function ActivitiesCalendar({
  startDate,
  endDate,
}: ActivitiesCalendarProps) {
  const params = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const fetchActivities = async () => {
    try {
      const response = await fetch(
        `/api/groups/${params.id}/events/${params.eventId}/activities`
      );
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [params.id, params.eventId]);

  const handleEditClick = (e: React.MouseEvent, activity: Activity) => {
    if (activity) {
      e.stopPropagation();
      setSelectedActivity(activity);
      setIsUpdateModalOpen(true);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity) {
      setSelectedActivity(activity);
      setIsSubscribeModalOpen(true);
    }
  };

  const getActivitiesForPeriod = (date: Date, isMorning: boolean) => {
    return activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      const isSameTimeOfDay = isMorning
        ? activityDate.getHours() < 12
        : activityDate.getHours() >= 12;
      return isSameDay(activityDate, date) && isSameTimeOfDay;
    });
  };

  return (
    <div className="space-y-4 bg-gray-50 rounded-lg shadow-sm border p-6 mt-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Planning</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Ajouter une activité
          </button>
        </div>
        <div className="space-y-4">
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
                      "h-24 border flex flex-col gap-1 p-1 text-sm bg-gray-100"
                    )}
                  >
                    {getActivitiesForPeriod(day, true).map((activity) => (
                      <div
                        key={activity.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivityClick(activity);
                        }}
                        className="flex items-center justify-between bg-white rounded px-2 py-1 border border-gray-200 hover:border-gray-300"
                      >
                        <span className="truncate">{activity.title}</span>
                        <button
                          onClick={(e) => handleEditClick(e, activity)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
                {/* Ligne des activités de l'après-midi */}
                {days.map((day, index) => (
                  <div
                    key={`${day.toISOString()}-${index}-afternoon`}
                    className={cn(
                      "h-24 border flex flex-col gap-1 p-1 text-sm bg-gray-100"
                    )}
                  >
                    {getActivitiesForPeriod(day, false).map((activity) => (
                      <div
                        key={activity.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivityClick(activity);
                        }}
                        className="flex items-center justify-between bg-white rounded px-2 py-1 border border-gray-200 hover:border-gray-300"
                      >
                        <span className="truncate">{activity.title}</span>
                        <button
                          onClick={(e) => handleEditClick(e, activity)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateActivityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAdd={fetchActivities}
        startDate={startDate}
        endDate={endDate}
      />

      <SubscribeActivityModal
        isOpen={isSubscribeModalOpen}
        onClose={() => {
          setIsSubscribeModalOpen(false);
          setSelectedActivity(null);
        }}
        activity={selectedActivity!}
      />

      <UpdateActivityModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedActivity(null);
        }}
        activity={selectedActivity!}
        onUpdate={fetchActivities}
      />
    </div>
  );
}
