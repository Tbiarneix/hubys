"use client";

import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { X, Pencil, Check, ChevronUp, ChevronDown } from "lucide-react";
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

  const handlePresenceChange = async (subgroupId: string, date: Date, type: PresenceType) => {
    try {
      const response = await fetch(`/api/events/${eventId}/presences/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subgroupId,
          date: date.toISOString(),
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update presence');
      }

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
          {subgroups.map((subgroup) => (
            <div key={subgroup.id} className="flex justify-between">
              <div className="h-16 px-2 w-full flex flex-col justify-center text-sm font-medium text-gray-700 border relative">
                <p>
                  {subgroup.activeAdults.map((userId, index) => (
                    <span key={userId}>
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
                      <span key={childId}>
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
            {subgroups.map((subgroup) => (
              <React.Fragment key={`${subgroup.id}`}>
                {days.map((day) => {
                  const isEditing = editingSubgroupId === subgroup.id;
                  const canEdit = subgroup.activeAdults.includes(currentUserId) || 
                    subgroup.activeChildren.includes(currentUserId);

                  return (
                    <>
                      <div
                        key={`${day.toISOString()}-lunch`}
                        className={cn(
                          "h-8 border flex items-center justify-center relative",
                          isEditing 
                            ? "cursor-pointer bg-yellow-50 hover:bg-yellow-100"
                            : [
                                "cursor-default",
                                isPresent(subgroup.id, day, 'lunch') ? "bg-green-500" : "bg-gray-300"
                              ]
                        )}
                        onClick={() => {
                          if (isEditing && canEdit) {
                            handlePresenceChange(subgroup.id, day, 'lunch');
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
                      <div
                        key={`${day.toISOString()}-dinner`}
                        className={cn(
                          "h-8 border flex items-center justify-center relative",
                          isEditing 
                            ? "cursor-pointer bg-yellow-50 hover:bg-yellow-100"
                            : [
                                "cursor-default",
                                isPresent(subgroup.id, day, 'dinner') ? "bg-green-500" : "bg-gray-300"
                              ]
                        )}
                        onClick={() => {
                          if (isEditing && canEdit) {
                            handlePresenceChange(subgroup.id, day, 'dinner');
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
                    </>
                  );
                })}
              </React.Fragment>
            ))}
            {/* Ligne des totaux */}
            <div className="col-span-full border-t-2 border-gray-300" />
            {days.map((day) => {
              const totalLunch = subgroups.reduce((acc, subgroup) => 
                acc + getPresenceNumber(subgroup.id, day, 'lunch'), 0);
              const totalDinner = subgroups.reduce((acc, subgroup) => 
                acc + getPresenceNumber(subgroup.id, day, 'dinner'), 0);
              return (
                <React.Fragment key={`total-${day.toISOString()}`}>
                  <div className="h-8 border flex items-center justify-center bg-white font-medium text-gray-900">
                    {totalLunch}
                  </div>
                  <div className="h-8 border flex items-center justify-center bg-white font-medium text-gray-900">
                    {totalDinner}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
