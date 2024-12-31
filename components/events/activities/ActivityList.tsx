"use client";

import { Activity } from "@/types/activity";
import { ActivityCard } from "./ActivityCard";
import { Loader2 } from "lucide-react";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
}

export function ActivityList({ activities, isLoading }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-muted-foreground text-center p-4">
        Aucune activité prévue pour cette date
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}