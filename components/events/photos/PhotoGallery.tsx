"use client";

import { useState } from "react";
import { usePhotos } from "@/hooks/events/use-photos";
import { PhotoGrid } from "./PhotoGrid";
import { PhotoUpload } from "./PhotoUpload";
import { PhotoDialog } from "./PhotoDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface PhotoGalleryProps {
  eventId: string;
}

export function PhotoGallery({ eventId }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const { photos, isLoading, uploadPhoto } = usePhotos(eventId);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Photos de l'événement</h3>
        <PhotoUpload onUpload={uploadPhoto}>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Ajouter des photos
          </Button>
        </PhotoUpload>
      </div>

      <PhotoGrid
        photos={photos}
        isLoading={isLoading}
        onPhotoClick={setSelectedPhoto}
      />

      <PhotoDialog
        photo={photos.find(p => p.url === selectedPhoto)}
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </Card>
  );
}