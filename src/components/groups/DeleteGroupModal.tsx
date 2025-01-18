/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

interface DeleteGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
}

export function DeleteGroupModal({
  isOpen,
  onClose,
  groupId,
}: DeleteGroupModalProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteGroup = async () => {
    if (deleteConfirmation !== "SUPPRIMER") return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete group");
      }

      toast.success("Groupe supprimé");
      router.refresh();
      router.push(`/profile`);
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Erreur lors de la suppression du groupe");
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/30 fixed inset-0 z-[60]" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[61] focus:outline-none">
          <div className="space-y-6">
            <div className="space-y-2">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Confirmer la suppression du groupe
              </Dialog.Title>
              <Dialog.Description className="text-gray-500">
                Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est
                irréversible et entraînera la suppression de toutes les données
                associées.
              </Dialog.Description>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="deleteConfirmation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmez la suppression en écrivant "SUPPRIMER" dans le champ
                ci-dessous
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
                onClick={handleDeleteGroup}
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
  );
}
