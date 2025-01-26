"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

interface Event {
  id: string;
  name: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  hasRental: boolean;
  hasCalendar: boolean;
  hasMenus: boolean;
  hasShopping: boolean;
  hasActivities: boolean;
  hasPhotos: boolean;
  hasAccounts: boolean;
}

interface EventListProps {
  groupId: string;
}

export default function EventList({ groupId }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}/events`);
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Erreur lors du chargement des événements");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-32 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun événement pour le moment</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/groups/${groupId}/events/${event.id}`}
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {event.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Du {format(new Date(event.startDate), "dd/MM/yy", { locale: fr })} au {format(new Date(event.endDate), "dd/MM/yy", { locale: fr })}
              </p>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {event.hasRental && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                Rental
              </span>
            )}
            {event.hasCalendar && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                Calendrier
              </span>
            )}
            {event.hasMenus && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                Menus
              </span>
            )}
            {event.hasShopping && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                Courses
              </span>
            )}
            {event.hasActivities && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                Activités
              </span>
            )}
            {event.hasPhotos && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                Photos
              </span>
            )}
            {event.hasAccounts && (
              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                Comptes
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
