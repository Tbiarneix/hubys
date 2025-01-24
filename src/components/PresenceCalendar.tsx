"use client";

import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { X, Pencil, Check, ChevronUp, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

type PresenceType = 'lunch' | 'dinner';

interface Presence {
  id: string;
  date: string;
  lunch: boolean;
  dinner: boolean;
  lunchNumber: number;
  dinnerNumber: number;
  subgroupId: string;
  eventId: string;
}

interface SubgroupWithUsers {
  id: string;
  activeAdults: string[]; // IDs des utilisateurs adultes actifs
  activeChildren: string[]; // IDs des enfants actifs
}

interface PresenceCalendarProps {
  startDate: Date;
  endDate: Date;
  subgroups: SubgroupWithUsers[];
  userMap: Map<string, {
    name: string;
    children: Array<{ id: string; firstName: string; }>;
  }>;
  currentUserId: string;
  eventId: string;
}

export function PresenceCalendar({
  startDate,
  endDate,
  subgroups,
  userMap,
  currentUserId,
  eventId,
}: PresenceCalendarProps) {
  const params = useParams();
  const [editingSubgroupId, setEditingSubgroupId] = useState<string | null>(null);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  useEffect(() => {
    const fetchPresences = async () => {
      try {
        const response = await axios.get(`/api/events/${eventId}/presences`);
        setPresences(response.data);
      } catch (error) {
        console.error("Failed to fetch presences:", error);
        toast.error("Erreur lors du chargement des présences");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresences();
  }, [eventId]);

  const isPresent = (subgroupId: string, date: Date, type: PresenceType): boolean => {
    const presence = presences.find(p => 
      p.subgroupId === subgroupId && 
      new Date(p.date).toDateString() === date.toDateString()
    );
    return presence ? presence[type] : false;
  };

  const getPresenceNumber = (subgroupId: string, date: Date, type: PresenceType): number => {
    const presence = presences.find(p => 
      p.subgroupId === subgroupId && 
      new Date(p.date).toDateString() === date.toDateString()
    );
    return presence ? (type === 'lunch' ? presence.lunchNumber : presence.dinnerNumber) : 0;
  };

  const calculateTotalPeople = (date: Date, type: 'lunch' | 'dinner', updatedPresence: Presence) => {
    return subgroups.reduce((total, subgroup) => {
      // Vérifier si le sous-groupe est présent pour cette date et ce type
      const isPresent = presences.some(
        (p) =>
          p.subgroupId === subgroup.id &&
          new Date(p.date).toDateString() === date.toDateString() &&
          // Si c'est le sous-groupe qui vient d'être mis à jour, utiliser la nouvelle valeur
          (p.subgroupId === updatedPresence.subgroupId
            ? updatedPresence[type]
            : p[type])
      );

      if (isPresent) {
        // Ajouter le nombre d'adultes et d'enfants du sous-groupe
        return total + subgroup.activeAdults.length + subgroup.activeChildren.length;
      }
      return total;
    }, 0);
  };

  const updatePresence = async (date: Date, type: 'lunch' | 'dinner', subgroupId: string) => {
    try {
      // Récupérer la présence actuelle
      const currentPresence = presences.find(
        (p) =>
          p.subgroupId === subgroupId &&
          new Date(p.date).toDateString() === date.toDateString()
      );

      // Créer ou mettre à jour la présence
      const response = await fetch(`/api/events/${eventId}/presences/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subgroupId,
          date: date.toISOString(),
          type,
          value: currentPresence ? !currentPresence[type] : true,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des présences');
      }

      // Récupérer la présence mise à jour
      const updatedPresence = await response.json();

      // Mettre à jour l'état local
      setPresences(prev => {
        const newPresences = [...prev];
        const index = newPresences.findIndex(p => 
          p.subgroupId === subgroupId && 
          new Date(p.date).toDateString() === date.toDateString()
        );
        
        if (index !== -1) {
          newPresences[index] = updatedPresence;
        } else {
          newPresences.push(updatedPresence);
        }
        
        return newPresences;
      });

      // Calculer le nombre total de personnes présentes
      const totalPeople = calculateTotalPeople(date, type, updatedPresence);

      // Mettre à jour les quantités des menus et ingrédients
      await updateMenuQuantities(date, type, totalPeople);

      toast.success('Présence mise à jour avec succès');
    } catch (error) {
      console.error('Error updating presence:', error);
      toast.error('Une erreur est survenue lors de la mise à jour des présences');
    }
  };

  const handleNumberAdjustment = async (subgroupId: string, date: Date, type: PresenceType, increment: boolean) => {
    try {
      const presence = presences.find(p => 
        p.subgroupId === subgroupId && 
        new Date(p.date).toDateString() === date.toDateString()
      );

      if (!presence || !presence[type]) return;

      const currentNumber = type === 'lunch' ? presence.lunchNumber : presence.dinnerNumber;
      const newNumber = increment ? currentNumber + 1 : Math.max(0, currentNumber - 1);

      const response = await fetch(`/api/events/${eventId}/presences/adjust`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subgroupId,
          date: date.toISOString(),
          type,
          number: newNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update presence number');
      }

      const updatedPresence = await response.json();

      // Mettre à jour l'état local
      setPresences(prev => prev.map(p => {
        if (
          p.subgroupId === subgroupId && 
          new Date(p.date).toDateString() === date.toDateString()
        ) {
          return updatedPresence;
        }
        return p;
      }));
    } catch (error) {
      console.error('Error updating presence number:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du nombre de présents');
    }
  };

  const updateMenuQuantities = async (date: Date, type: string, numberOfPeople: number) => {
    try {
      // D'abord vérifier s'il y a un menu pour cette date
      const response = await fetch(`/api/groups/${params.id}/events/${eventId}/menus?date=${date.toISOString()}&type=${type}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du menu');
      }
      const menus = await response.json();

      // Ne mettre à jour que s'il y a un menu
      if (menus && menus.length > 0) {
        const updateResponse = await fetch(`/api/groups/${params.id}/events/${eventId}/menus/update-quantities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: date.toISOString(),
            type,
            numberOfPeople,
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Erreur lors de la mise à jour des quantités');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour les quantités des menus");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>;
  }

  return (
    <div className="space-y-4 bg-gray-50 rounded-lg shadow-sm border p-6 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Calendrier des présences
        </h2>
        {subgroups.some(subgroup => 
          subgroup.activeAdults.includes(currentUserId) || 
          subgroup.activeChildren.includes(currentUserId)
        ) && (
          <button 
            onClick={() => setEditingSubgroupId(editingSubgroupId ? null : 
              subgroups.find(s => 
                s.activeAdults.includes(currentUserId) || 
                s.activeChildren.includes(currentUserId)
              )?.id || null
            )}
            className="inline-flex items-center px-3 py-2 gap-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50                     "
          >
            <Pencil className="w-4 h-4 text-gray-700" />
            <span className="text-gray-700 text-sm">
              {editingSubgroupId ? "Terminer l'édition" : "Éditer mes présences"}
            </span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-[auto,1fr]">
        <div>
          {/* Labels de gauche pour les sous-groupes */}
          <div className="h-12" /> {/* Espace pour l'en-tête des dates */}
          {subgroups.map((subgroup, index) => (
            <div key={`${subgroup.id}-${index}`} className="flex justify-between">
              <div className="h-16 px-2 w-full flex flex-col justify-center text-sm font-medium text-gray-700 border relative">
                <p>
                  {subgroup.activeAdults.map((userId, index) => (
                    <span key={`${userId}-${index}`}>
                      {index > 0 && <span key={`sep-${userId}`}> & </span>}
                      <span key={userId}>{userMap.get(userId)?.name || 'Sans nom'}</span>
                    </span>
                  ))}
                </p>
                <p>
                  {subgroup.activeChildren.map((childId, index) => {
                    const child = Array.from(userMap.values())
                      .flatMap(u => u.children)
                      .find(c => c.id === childId);
                    return (
                      <span key={`${childId}-${index}`}>
                        {index > 0 && <span key={`sep-${childId}`}>, </span>}
                        <span key={childId} className="text-sm text-gray-700">{child?.firstName}</span>
                      </span>
                    );
                  })}
                </p>
              </div>
              <div>
                <div className={cn("h-8 px-2 border flex items-center justify-center hover:bg-gray-50 text-gray-700")}>
                  Déjeuner
                </div>
                <div className={cn("h-8 px-2 border flex items-center justify-center hover:bg-gray-50 text-gray-700")}>
                  Dîner
                </div>
              </div>
            </div>
          ))}
          {/* Label Total */}
          <div className="flex justify-between border-t-2 border-gray-300">
            <div className="h-16 px-2 w-full flex flex-col justify-center text-sm font-medium text-gray-700 border">
              <p className="text-base">Total</p>
            </div>
            <div>
              <div className={cn("h-8 px-2 border flex items-center justify-center hover:bg-gray-50 text-gray-700")}>
                Déjeuner
              </div>
              <div className={cn("h-8 px-2 border flex items-center justify-center hover:bg-gray-50 text-gray-700")}>
                Dîner
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
          >
            {/* En-tête des dates */}
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="h-12 px-2 flex items-center justify-center border-b text-sm font-medium text-gray-700"
              >
                {format(day, "EEE d", { locale: fr })}
              </div>
            ))}
            {/* Grille des présences */}
            {subgroups.map((subgroup, index) => (
              <React.Fragment key={`${subgroup.id}-${index}`}>
                {/* Ligne des déjeuners */}
                {days.map((day) => {
                  const isEditing = editingSubgroupId === subgroup.id;
                  const canEdit = subgroup.activeAdults.includes(currentUserId) || 
                    subgroup.activeChildren.includes(currentUserId);

                  return (
                    <div
                      key={`${day.toISOString()}-${index}-lunch`}
                      className={cn(
                        "h-8 border-[1px] border-gray-200 flex items-center justify-center relative",
                        isEditing 
                          ? "cursor-pointer bg-yellow-50 hover:bg-yellow-100"
                          : [
                              "cursor-default",
                              isPresent(subgroup.id, day, 'lunch') ? "bg-green-500" : "bg-gray-100"
                            ]
                      )}
                      onClick={() => {
                        if (isEditing && canEdit) {
                          updatePresence(day, 'lunch', subgroup.id);
                        }
                      }}
                    >
                      {isEditing ? (
                        isPresent(subgroup.id, day, 'lunch') ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )
                      ) : (
                        <div className="relative flex items-center justify-center space-x-1">
                          {isPresent(subgroup.id, day, 'lunch') && canEdit && !isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNumberAdjustment(subgroup.id, day, 'lunch', false);
                              }}
                              className="text-white"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                          <span className={cn(
                            "bold min-w-[20px] text-center",
                            isEditing ? "text-gray-900" : "text-white"
                          )}>
                            {isPresent(subgroup.id, day, 'lunch') ? getPresenceNumber(subgroup.id, day, 'lunch') : ""}
                          </span>
                          {isPresent(subgroup.id, day, 'lunch') && canEdit && !isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNumberAdjustment(subgroup.id, day, 'lunch', true);
                              }}
                              className="text-white"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Ligne des dîners */}
                {days.map((day) => {
                  const isEditing = editingSubgroupId === subgroup.id;
                  const canEdit = subgroup.activeAdults.includes(currentUserId) || 
                    subgroup.activeChildren.includes(currentUserId);

                  return (
                    <div
                      key={`${day.toISOString()}-${index}-dinner`}
                      className={cn(
                        "h-8 border-[1px] border-gray-200 flex items-center justify-center relative",
                        isEditing 
                          ? "cursor-pointer bg-yellow-50 hover:bg-yellow-100"
                          : [
                              "cursor-default",
                              isPresent(subgroup.id, day, 'dinner') ? "bg-green-500" : "bg-gray-100"
                            ]
                      )}
                      onClick={() => {
                        if (isEditing && canEdit) {
                          updatePresence(day, 'dinner', subgroup.id);
                        }
                      }}
                    >
                      {isEditing ? (
                        isPresent(subgroup.id, day, 'dinner') ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )
                      ) : (
                        <div className="relative flex items-center justify-center space-x-1">
                          {isPresent(subgroup.id, day, 'dinner') && canEdit && !isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNumberAdjustment(subgroup.id, day, 'dinner', false);
                              }}
                              className="text-white"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                          <span className={cn(
                            "bold min-w-[20px] text-center",
                            isEditing ? "text-gray-900" : "text-white"
                          )}>
                            {isPresent(subgroup.id, day, 'dinner') ? getPresenceNumber(subgroup.id, day, 'dinner') : ""}
                          </span>
                          {isPresent(subgroup.id, day, 'dinner') && canEdit && !isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNumberAdjustment(subgroup.id, day, 'dinner', true);
                              }}
                              className="text-white"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            {/* Totaux */}
            {days.map((day) => {
              const totalLunch = subgroups.reduce((acc, subgroup) => 
                acc + getPresenceNumber(subgroup.id, day, 'lunch'), 0);
              return (
                <div key={`total-lunch-${day.toISOString()}`} className="h-8 border-[1px] border-gray-300 flex items-center justify-center bg-white font-medium text-gray-900">
                  {totalLunch}
                </div>
              );
            })}
            {days.map((day) => {
              const totalDinner = subgroups.reduce((acc, subgroup) => 
                acc + getPresenceNumber(subgroup.id, day, 'dinner'), 0);
              return (
                <div key={`total-dinner-${day.toISOString()}`} className="h-8 border-[1px] border-gray-300 flex items-center justify-center bg-white font-medium text-gray-900">
                  {totalDinner}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
