'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();

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
              <h2 className="text-xl font-semibold text-black">Informations personnelles</h2>
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
