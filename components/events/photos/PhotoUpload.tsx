"use client";

import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  onUpload: (file: File) => Promise<void>;
  children: React.ReactNode;
}

export function PhotoUpload({ onUpload, children }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    // Vérification de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      await onUpload(file);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  };

  return (
    <div onClick={handleClick}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />
      {children}
    </div>
  );
}