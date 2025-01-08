"use client";

import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { CreateEventModal } from "./CreateEventModal";

interface EventCardProps {
  groupId: string;
}

export default function EventCard({ groupId }: EventCardProps) {
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  return (
    <>
      <div className="bg-gray-50 px-6 py-4 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Événements
          </h2>
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Créer un événement
          </button>
        </div>
        <p className="text-sm text-gray-500">Aucun événement actuellement</p>
      </div>

      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        groupId={groupId}
      />
    </>
  );
}
