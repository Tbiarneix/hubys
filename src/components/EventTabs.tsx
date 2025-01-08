/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteEventModal } from "./groups/DeleteEventModal";

interface EventTabsProps {
  event: any;
  groupId: string;
}

export default function EventTabs({ event, groupId }: EventTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const tabStyle = (isActive: boolean) =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="w-full">
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={tabStyle(activeTab === "overview")}
        >
          Vue d'ensemble
        </button>
        {event.hasLocation && (
          <button
            onClick={() => setActiveTab("location")}
            className={tabStyle(activeTab === "location")}
          >
            Location
          </button>
        )}
        {event.hasCalendar && (
          <button
            onClick={() => setActiveTab("calendar")}
            className={tabStyle(activeTab === "calendar")}
          >
            Calendrier des présences
          </button>
        )}
        {event.hasMenus && (
          <button
            onClick={() => setActiveTab("menus")}
            className={tabStyle(activeTab === "menus")}
          >
            Menus
          </button>
        )}
        {event.hasShopping && (
          <button
            onClick={() => setActiveTab("shopping")}
            className={tabStyle(activeTab === "shopping")}
          >
            Liste de courses
          </button>
        )}
        {event.hasActivities && (
          <button
            onClick={() => setActiveTab("activities")}
            className={tabStyle(activeTab === "activities")}
          >
            Activités
          </button>
        )}
        {event.hasPhotos && (
          <button
            onClick={() => setActiveTab("photos")}
            className={tabStyle(activeTab === "photos")}
          >
            Album photo
          </button>
        )}
        {event.hasAccounts && (
          <button
            onClick={() => setActiveTab("accounts")}
            className={tabStyle(activeTab === "accounts")}
          >
            Comptes
          </button>
        )}
        <div className="ml-auto">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="mt-4 pb-20">
        {activeTab === "overview" && (
          <div>
            <p className="text-gray-700">{event.description || "Aucune description"}</p>
          </div>
        )}
        {activeTab === "location" && event.hasLocation && (
          <div>
            <p className="text-gray-700">Configuration de la location</p>
          </div>
        )}
        {activeTab === "calendar" && event.hasCalendar && (
          <div>
            <p className="text-gray-700">Calendrier des présences</p>
          </div>
        )}
        {activeTab === "menus" && event.hasMenus && (
          <div>
            <p className="text-gray-700">Gestion des menus</p>
          </div>
        )}
        {activeTab === "shopping" && event.hasShopping && (
          <div>
            <p className="text-gray-700">Liste de courses</p>
          </div>
        )}
        {activeTab === "activities" && event.hasActivities && (
          <div>
            <p className="text-gray-700">Gestion des activités</p>
          </div>
        )}
        {activeTab === "photos" && event.hasPhotos && (
          <div>
            <p className="text-gray-700">Album photo</p>
          </div>
        )}
        {activeTab === "accounts" && event.hasAccounts && (
          <div>
            <p className="text-gray-700">Gestion des comptes</p>
          </div>
        )}
      </div>

      <DeleteEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        eventId={event.id}
        groupId={groupId}
      />
    </div>
  );
}
