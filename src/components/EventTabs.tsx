"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface EventTabsProps {
  event: any;
  groupId: string;
}

export default function EventTabs({ event, groupId }: EventTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteEvent = async () => {
    if (deleteConfirmation !== "SUPPRIMER") return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      toast.success("Événement supprimé");
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Erreur lors de la suppression de l'événement");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

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

      {/* Modal de suppression de l'événement */}
      <Dialog.Root open={isDeleteModalOpen} onOpenChange={(open) => !open && setIsDeleteModalOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/30 fixed inset-0 z-[60]" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[61] focus:outline-none">
            <div className="space-y-6">
              <div className="space-y-2">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Confirmer la suppression de l'événement
                </Dialog.Title>
                <Dialog.Description className="text-gray-500">
                  Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible et entraînera la suppression de toutes les données associées.
                </Dialog.Description>
              </div>

              <div className="space-y-2">
                <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmez la suppression en écrivant "SUPPRIMER" dans le champ ci-dessous
                </label>
                <input
                  type="text"
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDeleteEvent}
                  disabled={isDeleting || deleteConfirmation !== "SUPPRIMER"}
                  className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
