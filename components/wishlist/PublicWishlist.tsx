"use client";

import { useState } from "react";
import { usePublicWishlist } from "@/hooks/use-public-wishlist";
import { PublicWishlistItem } from "./PublicWishlistItem";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface PublicWishlistProps {
  userId: string;
}

export function PublicWishlist({ userId }: PublicWishlistProps) {
  const [showReservations, setShowReservations] = useState(false);
  const { items, isLoading, reserveItem, unreserveItem } = usePublicWishlist(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Cette liste de souhaits est vide
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReservations(!showReservations)}
        >
          {showReservations ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Masquer les réservations
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Afficher les réservations
            </>
          )}
        </Button>
      </div>

      {items.map((item) => (
        <PublicWishlistItem
          key={item.id}
          item={item}
          onReserve={reserveItem}
          onUnreserve={unreserveItem}
          showReservation={showReservations}
        />
      ))}
    </div>
  );
}