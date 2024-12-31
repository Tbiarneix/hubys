"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "@/types/activity";

export function useActivities(eventId: string, selectedDate?: Date) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!session?.accessToken || !selectedDate) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/activities?date=${selectedDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les activités",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = async (data: Omit<Activity, "id">) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error();

      const newActivity = await response.json();
      setActivities((prev) => [...prev, newActivity]);

      toast({
        title: "Activité ajoutée",
        description: "L'activité a été ajoutée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'activité",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchActivities();
    }
  }, [eventId, selectedDate, session]);

  return {
    activities,
    isLoading,
    addActivity,
  };
}