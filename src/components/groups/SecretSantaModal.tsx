'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface SecretSantaModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onConfirm: () => Promise<void>;
  isRelaunch?: boolean;
}

export default function SecretSantaModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  onConfirm,
  isRelaunch = false,
}: SecretSantaModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      toast.success(isRelaunch ? "Secret Santa relancé !" : "Secret Santa créé !");
      onClose();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la création du Secret Santa.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg p-6 w-[90vw] max-w-[450px] shadow-lg z-50">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-700">
              {isRelaunch ? "Relancer le Secret Santa" : "Lancer un Secret Santa"}
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-700" />
            </Dialog.Close>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              {isRelaunch
                ? `Vous vous apprêtez à relancer le Secret Santa pour votre groupe "${groupName}", pour l'année ${currentYear}.`
                : `Vous vous apprêtez à lancer un Secret Santa pour votre groupe "${groupName}", pour l'année ${currentYear}.`}
            </p>
            {isRelaunch && (
              <p className="mt-4 text-sm text-gray-500 italic">
                Note: Une nouvelle distribution aléatoire sera effectuée en respectant les règles précédentes.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'En cours...' : 'Confirmer'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
