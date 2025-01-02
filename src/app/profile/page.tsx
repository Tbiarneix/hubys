'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Pencil, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-900">Chargement...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black">Mon Profil</h1>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">Informations personnelles</h2>
                <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <Dialog.Trigger asChild>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Pencil className="h-4 w-4 mr-2" />
                      Éditer mon profil
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg p-6 w-[90vw] max-w-[450px] shadow-lg z-50">
                      <div className="flex justify-between items-center mb-6">
                        <Dialog.Title className="text-xl font-semibold text-gray-700">
                          Modifier mon profil
                        </Dialog.Title>
                        <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100">
                          <X className="h-4 w-4 text-gray-700" />
                        </Dialog.Close>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-900">
                          Enregistrer
                        </button>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-gray-900">
                  <span className="font-medium">Nom:</span>{" "}
                  {session?.user?.name || "Non renseigné"}
                </p>
                <p className="text-gray-900">
                  <span className="font-medium">Email:</span>{" "}
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
