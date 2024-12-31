"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { WishlistItem } from "@/types/wishlist";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  const addItem = async (data: Pick<WishlistItem, "name" | "link" | "category">) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      const newItem = await response.json();
      setItems((prev) => [...prev, newItem]);

      toast({
        title: "Article ajouté",
        description: "L'article a été ajouté à votre liste",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/wishlist/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      setItems((prev) => prev.filter((item) => item.id !== itemId));

      toast({
        title: "Article supprimé",
        description: "L'article a été retiré de votre liste",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive",
      });
    }
  };

  const reorderItems = async (startIndex: number, endIndex: number) => {
    if (!session?.accessToken) return;

    const newItems = [...items];
    const [removed] = newItems.splice(startIndex, 1);
    newItems.splice(endIndex, 0, removed);

    setItems(newItems);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/wishlist/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          itemId: removed.id,
          newOrder: endIndex,
        }),
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réorganiser la liste",
        variant: "destructive",
      });
    }
  };

  return {
    items,
    isLoading,
    addItem,
    removeItem,
    reorderItems,
  };
}