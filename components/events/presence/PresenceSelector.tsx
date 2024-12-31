"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PresenceSelectorProps {
  date: Date;
  presence: {
    lunch?: boolean;
    dinner?: boolean;
  };
  onChange: (value: { lunch?: boolean; dinner?: boolean }) => void;
  isLoading?: boolean;
}

export function PresenceSelector({ presence, onChange, isLoading }: PresenceSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="lunch"
          checked={presence.lunch}
          onCheckedChange={(checked) => onChange({ ...presence, lunch: checked })}
          disabled={isLoading}
        />
        <Label htmlFor="lunch">Présent au déjeuner</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="dinner"
          checked={presence.dinner}
          onCheckedChange={(checked) => onChange({ ...presence, dinner: checked })}
          disabled={isLoading}
        />
        <Label htmlFor="dinner">Présent au dîner</Label>
      </div>
    </div>
  );
}