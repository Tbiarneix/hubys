"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export interface Meal {
  id: string;
  title: string;
  recipeLink?: string;
  isLunch: boolean;
  ingredients: string[];
}

export function useMeals(eventId: string, date: Date) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const addMeal = async (mealData: Omit<Meal, "id">) => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          ...mealData,
          date,
        }),
      });

      if (!response.ok) throw new Error();

      const newMeal = await response.json();
      setMeals((prev) => [...prev, newMeal]);

      toast({
        title: "Repas ajouté",
        description: "Le repas a été ajouté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le repas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    meals,
    addMeal,
    isLoading,
  };
}