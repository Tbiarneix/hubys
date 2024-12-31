"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Photo } from "@/types/photo";

export function usePhotos(eventId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchPhotos = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/photos`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les photos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!session?.accessToken) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error();

      const newPhoto = await response.json();
      setPhotos((prev) => [newPhoto, ...prev]);

      toast({
        title: "Photo ajoutée",
        description: "La photo a été ajoutée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la photo",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [eventId, session]);

  return {
    photos,
    isLoading,
    uploadPhoto,
  };
}