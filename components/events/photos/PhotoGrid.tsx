"use client";

import { Photo } from "@/types/photo";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
  onPhotoClick: (url: string) => void;
}

export function PhotoGrid({ photos, isLoading, onPhotoClick }: PhotoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="w-full h-48" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aucune photo n'a encore été ajoutée
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="cursor-pointer group relative overflow-hidden rounded-lg"
          onClick={() => onPhotoClick(photo.url)}
        >
          <AspectRatio ratio={1}>
            <Image
              src={photo.url}
              alt={`Photo du ${new Date(photo.date).toLocaleDateString()}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </AspectRatio>
        </div>
      ))}
    </div>
  );
}