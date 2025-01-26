/* eslint-disable react/no-unescaped-entities */
"use client";

import { Activity } from '@prisma/client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface SubscribeActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
}

export function SubscribeActivityModal({
  isOpen,
  onClose,
  activity,
}: SubscribeActivityModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-8 text-gray-900 shadow w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {activity.title}
            </Dialog.Title>
            <button
              className="rounded-full p-1 hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center py-8">
            <p className="text-gray-500">
              Cette fonctionnalité sera bientôt disponible !
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Fermer
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
