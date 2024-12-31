"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Child } from "@/types/user";

export function useChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  const addChild = async (data: Omit<Child, "id">) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      const newChild = await response.json();
      setChildren((prev) => [...prev, newChild]);

      toast({
        title: "Enfant ajouté",
        description: "L'enfant a été ajouté à votre profil",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'enfant",
        variant: "destructive",
      });
    }
  };

  const removeChild = async (childId: string) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/children/${childId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      setChildren((prev) => prev.filter((child) => child.id !== childId));

      toast({
        title: "Enfant supprimé",
        description: "L'enfant a été retiré de votre profil",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'enfant",
        variant: "destructive",
      });
    }
  };

  return {
    children,
    isLoading,
    addChild,
    removeChild,
  };
}