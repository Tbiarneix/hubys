"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Location, LocationSettings, Subgroup } from "@/types/location";
import { Plus } from "lucide-react";
import { AddLocationModal } from "@/components/location/AddLocationModal";
import { LocationCard } from "@/components/location/LocationCard";
import { LocationSidebar } from "@/components/location/LocationSidebar";

interface LocationClientProps {
  initialData: {
    locations: Location[];
    subgroups: Subgroup[];
  };
  eventId: string;
  groupId: string;
}

export default function LocationClient({ initialData, eventId, groupId }: LocationClientProps) {
  const [locations, setLocations] = useState(initialData.locations);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [settings, setSettings] = useState<LocationSettings>({
    adultShare: 1,
    childShare: 0.5,
  });

  useEffect(() => {
    setLocations(initialData.locations);
  }, [initialData.locations]);

  // Sort locations by points
  const sortedLocations = [...locations].sort((a, b) => {
    const pointsA = a.votes.reduce((sum, vote) => sum + vote.value, 0);
    const pointsB = b.votes.reduce((sum, vote) => sum + vote.value, 0);
    return pointsB - pointsA;
  });

  return (
    <div className="flex">
      <div className="flex-1 p-6 pr-28">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Propositions de location</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une location
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {sortedLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onSelect={setSelectedLocation}
              isSelected={selectedLocation?.id === location.id}
            />
          ))}
        </div>

        <AddLocationModal
          isOpen={isAddModalOpen}
          setIsOpen={setIsAddModalOpen}
          eventId={eventId}
          groupId={groupId}
        />
      </div>

      <LocationSidebar
        settings={settings}
        onSettingsChange={setSettings}
        selectedLocation={selectedLocation}
        subgroups={initialData.subgroups}
        eventId={eventId}
      />
    </div>
  );
}
