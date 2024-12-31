"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { WishlistItem } from "@/types/wishlist";

export function usePublicWishlist(userId: string) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/wishlist`
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste de souhaits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reserveItem = async (itemId: string, reservedByName: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/wishlist/${itemId}/reserve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reservedByName }),
        }
      );

      if (!response.ok) throw new Error();

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isReserved: true, reservedByName }
            : item
        )
      );

      toast({
        title: "Article réservé",
        description: "L'article a été réservé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réserver l'article",
        variant: "destructive",
      });
    }
  };

  const unreserveItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/wishlist/${itemId}/unreserve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error();

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isReserved: false, reservedByName: undefined }
            : item
        )
      );

      toast({
        title: "Réservation annulée",
        description: "La réservation a été annulée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la réservation",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [userId]);

  return {
    items,
    isLoading,
    reserveItem,
    unreserveItem,
  };
}