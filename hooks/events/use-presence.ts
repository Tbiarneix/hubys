"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

interface Presence {
  [date: string]: {
    lunch?: boolean;
    dinner?: boolean;
  };
}

export function usePresence(eventId: string) {
  const [presence, setPresence] = useState<Presence>({});
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const updatePresence = async (date: Date, value: { lunch?: boolean; dinner?: boolean }) => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/presence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          date: dateStr,
          ...value,
        }),
      });

      if (!response.ok) throw new Error();

      setPresence((prev) => ({
        ...prev,
        [dateStr]: value,
      }));

      toast({
        title: "Présence mise à jour",
        description: "Vos disponibilités ont été enregistrées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos présences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    presence,
    updatePresence,
    isLoading,
  };
}