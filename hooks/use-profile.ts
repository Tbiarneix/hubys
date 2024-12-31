"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";

interface ProfileUpdateData {
  firstName: string;
  lastName?: string;
  birthDate?: Date;
  bio?: string;
}

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, update } = useSession();
  const { toast } = useToast();

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      const updatedUser = await response.json();
      await update({ user: updatedUser });

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (file: File) => {
    if (!session?.accessToken) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error();

      const updatedUser = await response.json();
      await update({ user: updatedUser });

      toast({
        title: "Avatar mis à jour",
        description: "Votre photo de profil a été modifiée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'avatar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: session?.user as User | undefined,
    isLoading,
    updateProfile,
    updateAvatar,
  };
}