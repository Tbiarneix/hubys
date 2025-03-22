"use client";

import { useState, useEffect } from "react";
import { Rental, RentalSettings, Subgroup } from "@/types/rental";
import { Plus } from "lucide-react";
import { AddRentalModal } from "@/components/rental/AddRentalModal";
import { RentalCard } from "@/components/rental/RentalCard";
import { RentalSidebar } from "@/components/rental/RentalSidebar";

interface RentalClientProps {
  initialData: {
    rentals: Rental[];
    subgroups: Subgroup[];
    settings: RentalSettings;
  };
  eventId: string;
  groupId: string;
}

export default function RentalClient({ initialData, eventId, groupId }: RentalClientProps) {
  const [rentals, setRentals] = useState(initialData.rentals);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [settings, setSettings] = useState<RentalSettings>(initialData.settings);

  useEffect(() => {
    setRentals(initialData.rentals);
  }, [initialData.rentals]);

  // Sort rentals by points
  const sortedRentals = [...rentals].sort((a, b) => {
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
          {sortedRentals.map((rental) => (
            <RentalCard
              key={rental.id}
              rental={rental}
              onSelect={setSelectedRental}
              isSelected={selectedRental?.id === rental.id}
            />
          ))}
        </div>

        <AddRentalModal
          isOpen={isAddModalOpen}
          setIsOpen={setIsAddModalOpen}
          eventId={eventId}
          groupId={groupId}
        />
      </div>

      <RentalSidebar
        settings={settings}
        onSettingsChange={setSettings}
        selectedRental={selectedRental}
        subgroups={initialData.subgroups}
        eventId={eventId}
      />
    </div>
  );
}
