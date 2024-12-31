"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { ShoppingItem } from "@/types/shopping";

export const DEFAULT_CATEGORIES = [
  "Fruits et Légumes",
  "Viandes et Poissons",
  "Crémerie",
  "Épicerie",
  "Boissons",
  "Autre",
];

export function useShoppingList(eventId: string) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchItems = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/shopping`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste de courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (data: {
    name: string;
    quantity?: string;
    category: string;
  }) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/shopping`,
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

      const newItem = await response.json();
      setItems((prev) => [...prev, newItem]);

      toast({
        title: "Article ajouté",
        description: "L'article a été ajouté à la liste",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article",
        variant: "destructive",
      });
    }
  };

  const toggleItem = async (itemId: string, checked: boolean) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/shopping/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ checked }),
        }
      );

      if (!response.ok) throw new Error();

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, checked } : item
        )
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [eventId, session]);

  return {
    items,
    categories: DEFAULT_CATEGORIES,
    isLoading,
    addItem,
    toggleItem,
  };
}