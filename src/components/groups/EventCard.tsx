/* eslint-disable react/no-unescaped-entities */
"use client";

import { CreateEventModal } from "./CreateEventModal";
import { useState } from "react";

export default function EventCard({groupId}: {groupId: string}) {                                                                                                                                                       
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  return (
    <>
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Événements</h3>
        <button
          onClick={() => setShowCreateEventModal(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
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
