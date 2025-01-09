/* eslint-disable react/no-unescaped-entities */
'use client';

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface CancelSecretSantaModalProps {
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelSecretSantaModal({
  groupName,
  isOpen,
  onClose,
  onConfirm,
}: CancelSecretSantaModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg p-6 w-[90vw] max-w-[450px] shadow-lg z-50">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-700">
              Annuler le Secret Santa
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-700" />
            </Dialog.Close>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir annuler le Secret Santa pour le groupe "{groupName}" ?
            </p>
            <p className="mt-4 text-sm text-gray-500 italic">
              Note: Cette action est irréversible.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900"
            >
              Confirmer
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
