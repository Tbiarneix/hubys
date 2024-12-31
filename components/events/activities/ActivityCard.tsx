"use client";

import { Activity } from "@/types/activity";
import { Card } from "@/components/ui/card";
import { ExternalLink, MapPin, Euro } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <h5 className="font-medium">{activity.title}</h5>
        {activity.link && (
          <a
            href={activity.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {activity.location && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <MapPin className="w-4 h-4" />
          <span>{activity.location}</span>
        </div>
      )}

      {(activity.priceAdult || activity.priceChild || activity.priceBaby) && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <Euro className="w-4 h-4" />
          <div className="space-x-4">
            {activity.priceAdult && (
              <span>Adulte: {formatPrice(activity.priceAdult)}</span>
            )}
            {activity.priceChild && (
              <span>Enfant: {formatPrice(activity.priceChild)}</span>
            )}
            {activity.priceBaby && (
              <span>Bébé: {formatPrice(activity.priceBaby)}</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}