'use client';

import { useState } from 'react';
import { Gift, Eye, EyeOff, RotateCw, X } from 'lucide-react';
import SecretSantaModal from './SecretSantaModal';
import CancelSecretSantaModal from './CancelSecretSantaModal';

interface SecretSantaCardProps {
  groupId: string;
  groupName: string;
  currentUserId: string;
  secretSanta: {
    id: string;
    year: number;
    assignments: {
      id: string;
      receiver: {
        id: string;
        name: string;
      };
    }[];
  } | null;
  onLaunch: () => Promise<void>;
  onRelaunch: () => Promise<void>;
  onCancel: () => Promise<void>;
}

export default function SecretSantaCard({
  groupId,
  groupName,
  currentUserId,
  secretSanta,
  onLaunch,
  onRelaunch,
  onCancel,
}: SecretSantaCardProps) {
  const [showResult, setShowResult] = useState(false);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isRelaunchModalOpen, setIsRelaunchModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const assignment = secretSanta?.assignments.find(
    (a) => a.receiver.id !== currentUserId
  );

  const toggleResult = () => setShowResult(!showResult);

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="px-6 py-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Secret Santa {secretSanta?.year || currentYear}
          </h2>
        <div className="p-6">
          {!secretSanta ? (
            <div>
              <p className="text-gray-600 mb-4">
                Aucun Secret Santa n'a encore été lancé pour cette année.
              </p>
              <button
                onClick={() => setIsLaunchModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900"
              >
                <Gift className="h-4 w-4" />
                Lancer le Secret Santa
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 rounded-lg">
                {assignment ? (
                  <>
                    <p className="mb-2 text-gray-600">
                      Votre Secret Santa pour {secretSanta.year}:
                    </p>
                    <button
                      onClick={toggleResult}
                      className="inline-flex items-center gap-2 px-4 py-2 mb-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {showResult ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Masquer
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Révéler
                        </>
                      )}
                    </button>
                    {showResult && (
                      <p className="text-xl font-bold text-blue-500">
                        {assignment.receiver.name}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">
                    Vous n'avez pas encore été assigné à quelqu'un.
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsRelaunchModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <RotateCw className="h-4 w-4" />
                  Relancer
                </button>
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SecretSantaModal
        groupName={groupName}
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        onConfirm={onLaunch}
        type="launch"
      />
      <SecretSantaModal
        groupName={groupName}
        isOpen={isRelaunchModalOpen}
        onClose={() => setIsRelaunchModalOpen(false)}
        onConfirm={onRelaunch}
        type="relaunch"
      />
      <CancelSecretSantaModal
        groupName={groupName}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={onCancel}
      />
    </>
  );
}
