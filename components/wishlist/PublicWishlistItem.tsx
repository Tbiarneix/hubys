"use client";

import { useState } from "react";
import { WishlistItem } from "@/types/wishlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PublicWishlistItemProps {
  item: WishlistItem;
  onReserve: (itemId: string, reservedBy: string) => Promise<void>;
  onUnreserve: (itemId: string) => Promise<void>;
  showReservation: boolean;
}

export function PublicWishlistItem({ 
  item, 
  onReserve, 
  onUnreserve,
  showReservation
}: PublicWishlistItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");

  const handleReserve = async () => {
    if (!name.trim()) return;
    await onReserve(item.id, name);
    setIsDialogOpen(false);
    setName("");
  };

  return (
    <>
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
          </div>
        </div>

        {showReservation ? (
          item.isReserved ? (
            <div className="text-sm text-muted-foreground">
              Réservé par {item.reservedByName}
              {item.reservedBy === name && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnreserve(item.id)}
                  className="ml-2"
                >
                  Annuler
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="default"
              onClick={() => setIsDialogOpen(true)}
            >
              <Gift className="w-4 h-4 mr-2" />
              Réserver
            </Button>
          )
        ) : (
          <Button
            variant={item.isReserved ? "secondary" : "default"}
            onClick={() => setIsDialogOpen(true)}
          >
            <Gift className="w-4 h-4 mr-2" />
            {item.isReserved ? "Déjà réservé" : "Réserver"}
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réserver {item.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Votre nom
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez votre nom"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleReserve}
                disabled={!name.trim()}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}