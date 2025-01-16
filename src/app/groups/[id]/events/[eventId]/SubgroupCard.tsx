'use client';

import { User, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SubgroupCardProps {
  subgroup: {
    id: string;
    adults: string[];
    children: string[];
    activeAdults: string[];
    activeChildren: string[];
  };
  userMap: Map<string, {
    name: string;
    children: Array<{ id: string; firstName: string; }>;
  }>;
  currentUserId: string;
  eventId: string;
  groupId: string;
}

export function SubgroupCard({ subgroup, userMap, currentUserId, eventId, groupId }: SubgroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeAdults, setActiveAdults] = useState(subgroup.activeAdults);
  const [activeChildren, setActiveChildren] = useState(subgroup.activeChildren);
  const canEdit = subgroup.adults.includes(currentUserId);
  const router = useRouter();

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/events/${eventId}/subgroups/${subgroup.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activeAdults,
          activeChildren,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subgroup');
      }

      toast.success('Sous-groupe mis à jour avec succès');
      setIsEditing(false);
      router.refresh(); // Rafraîchit la page pour mettre à jour les données
    } catch (error) {
      console.error('Error updating subgroup:', error);
      toast.error("Erreur lors de la mise à jour du sous-groupe");
    }
  };

  const toggleMember = (id: string, type: 'adult' | 'child') => {
    if (type === 'adult') {
      setActiveAdults(prev => 
        prev.includes(id) 
          ? prev.filter(adultId => adultId !== id)
          : [...prev, id]
      );
    } else {
      setActiveChildren(prev =>
        prev.includes(id)
          ? prev.filter(childId => childId !== id)
          : [...prev, id]
      );
    }
  };

  return (
    <div className="w-1/3 p-2">
      <div className="border rounded-lg p-4 h-full bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-700" />
            <h3 className="font-medium space-x-2 text-gray-700">
              {subgroup.activeAdults.map((userId, index) => (
                <span key={userId}>
                  {index > 0 && <span key={`sep-${userId}`}> & </span>}
                  <span key={userId}>{userMap.get(userId)?.name || 'Sans nom'}</span>
                </span>
              ))}
              {subgroup.activeAdults.length === 0 && (
                <span className="text-gray-500">Aucun adulte actif</span>
              )}
            </h3>
          </div>
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-700 hover:text-gray-900"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex-1 mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Adultes</h4>
                <div className="space-y-2">
                  {subgroup.adults.map(userId => (
                    <label key={userId} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeAdults.includes(userId)}
                        onChange={() => toggleMember(userId, 'adult')}
                        className="rounded border-gray-300 checked:bg-black checked:hover:bg-black checked:focus:bg-black text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">{userMap.get(userId)?.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {subgroup.children.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Enfants</h4>
                  <div className="space-y-2">
                    {subgroup.children.map(childId => {
                      const child = Array.from(userMap.values())
                        .flatMap(u => u.children)
                        .find(c => c.id === childId);
                      return (
                        <label key={childId} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={activeChildren.includes(childId)}
                            onChange={() => toggleMember(childId, 'child')}
                            className="rounded border-gray-300 checked:bg-black checked:hover:bg-black checked:focus:bg-black text-black focus:ring-black"
                          />
                          <span className="text-sm text-gray-700">{child?.firstName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setActiveAdults(subgroup.activeAdults);
                    setActiveChildren(subgroup.activeChildren);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm text-white bg-black rounded-md hover:bg-gray-800"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        ) : (
          subgroup.children.length > 0 && (
            <div className="flex-1 pl-6">
              <p className="text-sm text-gray-700">
                {subgroup.activeChildren.length > 0 && (
                  <>
                    Enfants : {subgroup.activeChildren.map((childId, index) => {
                      const child = Array.from(userMap.values())
                        .flatMap(u => u.children)
                        .find(c => c.id === childId);
                      return (
                        <span key={childId}>
                          {index > 0 && ", "}
                          <span key={childId}>{child?.firstName || 'Sans nom'}</span>
                        </span>
                      );
                    })}
                  </>
                )}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
