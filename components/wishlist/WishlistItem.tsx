"use client";

import { WishlistItem as WishlistItemType } from "@/types/wishlist";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove: (id: string) => Promise<void>;
}

export function WishlistItem({ item, onRemove }: WishlistItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{item.name}</h3>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="flex gap-2 text-sm text-muted-foreground">
          {item.category && (
            <span className="bg-secondary px-2 py-0.5 rounded-full">
              {item.category}
            </span>
          )}
          <span>
            Ajouté le {format(new Date(item.createdAt), "d MMMM yyyy", { locale: fr })}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}