"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Photo } from "@/types/photo";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PhotoDialogProps {
  photo: Photo | undefined;
  open: boolean;
  onClose: () => void;
}

export function PhotoDialog({ photo, open, onClose }: PhotoDialogProps) {
  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <div className="relative w-full h-[60vh]">
          <Image
            src={photo.url}
            alt={`Photo du ${format(new Date(photo.date), "d MMMM yyyy", { locale: fr })}`}
            fill
            className="object-contain"
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Photo ajoutée le {format(new Date(photo.date), "d MMMM yyyy", { locale: fr })}
        </p>
      </DialogContent>
    </Dialog>
  );
}