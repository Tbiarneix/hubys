/* eslint-disable react/no-unescaped-entities */
"use client";

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MapPin, Link as LinkIcon, Calendar, Clock, Euro, Users, Trash2, Plus } from 'lucide-react';
import { Activity } from '@prisma/client';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface SubgroupMember {
  id: string;
  name: string;
  birthDate: Date | null;
  ageCategory: 'BABY' | 'CHILD' | 'ADULT';
}

interface SubscribeActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
}

const durationLabels = {
  HALF_DAY: 'Demi-journée',
  FULL_DAY: 'Journée entière',
} as const;

const getAgeCategory = (birthDate: Date | null): 'BABY' | 'CHILD' | 'ADULT' => {
  if (!birthDate) return 'ADULT';
  const age = differenceInYears(new Date(), birthDate);
  if (age < 3) return 'BABY';
  if (age < 12) return 'CHILD';
  return 'ADULT';
};

const formatPrice = (price: number | null) => {
  if (price === null) return 'Gratuit';
  return `${price.toFixed(2)} €`;
};

export default function SubscribeActivityModal({
  isOpen,
  onClose,
  activity,
}: SubscribeActivityModalProps) {
  const params = useParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedMembers, setSelectedMembers] = React.useState<SubgroupMember[]>([]);
  const [allSubgroupMembers, setAllSubgroupMembers] = React.useState<SubgroupMember[]>([]);
  const [step, setStep] = React.useState<'info' | 'subscribe'>('info');
  const [participants, setParticipants] = React.useState<{
    id: string;
    adults: { id: string; name: string; isPresent: boolean }[];
    children: { id: string; name: string; isPresent: boolean }[];
  }[]>([]);
  const [isUserAlreadySubscribed, setIsUserAlreadySubscribed] = React.useState(false);
  const [currentParticipantIds, setCurrentParticipantIds] = React.useState<string[]>([]);

  const fetchParticipants = React.useCallback(async () => {
    if (!activity) return;
    try {
      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/activities/${activity.id}/participants`);
      if (!response.ok) throw new Error('Failed to fetch participants');
      const data = await response.json();
      setParticipants(data);
      
      // Collecter tous les IDs des participants actuels
      const participantIds: string[] = [];
      data.forEach((subgroup: { 
        id: string; 
        adults: { id: string; name: string; isPresent: boolean }[]; 
        children: { id: string; name: string; isPresent: boolean }[] 
      }) => {
        subgroup.adults.forEach(adult => participantIds.push(adult.id));
        subgroup.children.forEach(child => participantIds.push(child.id));
      });
      
      // Vérifier si l'utilisateur actuel est déjà inscrit
      const isSubscribed = data.some((subgroup: { 
        id: string; 
        adults: { id: string; name: string; isPresent: boolean }[]; 
        children: { id: string; name: string; isPresent: boolean }[] 
      }) => 
        subgroup.adults.some((adult: { id: string; name: string; isPresent: boolean }) => 
          allSubgroupMembers.some(member => member.id === adult.id)
        ) ||
        subgroup.children.some((child: { id: string; name: string; isPresent: boolean }) => 
          allSubgroupMembers.some(member => member.id === child.id)
        )
      );
      setIsUserAlreadySubscribed(isSubscribed);

      // Si l'utilisateur est déjà inscrit, mettre à jour les membres sélectionnés
      if (isSubscribed) {
        setCurrentParticipantIds(participantIds);
        const currentMemberIds = new Set(participantIds);
        const updatedSelectedMembers = allSubgroupMembers.filter(member => 
          currentMemberIds.has(member.id)
        );
        setSelectedMembers(updatedSelectedMembers);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error("Une erreur est survenue lors de la récupération des participants");
    }
  }, [activity, params.id, params.eventId, allSubgroupMembers]);

  // Charger les membres du sous-groupe
  const fetchSubgroupMembers = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/subgroup-members`);
      if (!response.ok) throw new Error('Failed to fetch subgroup members');
      const data = await response.json();
      
      // Convertir les utilisateurs en membres avec leur catégorie d'âge
      const members: SubgroupMember[] = data.map((user: { id: string; name: string; birthDate: string | null }) => ({
        ...user,
        birthDate: user.birthDate ? new Date(user.birthDate) : null,
        ageCategory: getAgeCategory(user.birthDate ? new Date(user.birthDate) : null),
      }));

      setAllSubgroupMembers(members);
    } catch (error) {
      console.error('Error fetching subgroup members:', error);
      toast.error("Une erreur est survenue lors de la récupération des membres");
    }
  }, [params.id, params.eventId]);

  React.useEffect(() => {
    if (isOpen) {
      fetchSubgroupMembers();
    } else {
      setStep('info');
      setSelectedMembers([]);
      setAllSubgroupMembers([]);
      setIsUserAlreadySubscribed(false);
      setCurrentParticipantIds([]);
    }
  }, [isOpen, fetchSubgroupMembers]);

  React.useEffect(() => {
    if (isOpen && activity && allSubgroupMembers.length > 0 && !isUserAlreadySubscribed) {
      fetchParticipants();
    }
  }, [isOpen, activity, fetchParticipants, allSubgroupMembers, isUserAlreadySubscribed]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => {
      const isMemberSelected = prev.some(m => m.id === memberId);
      
      if (isMemberSelected) {
        // Retirer le membre
        return prev.filter(m => m.id !== memberId);
      } else {
        // Ajouter le membre
        const memberToAdd = allSubgroupMembers.find(m => m.id === memberId);
        if (memberToAdd) {
          return [...prev, memberToAdd];
        }
        return prev;
      }
    });
  };

  const handleSubscribe = async () => {
    if (!activity) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/activities/${activity.id}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedMembers.map(member => member.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      toast.success(isUserAlreadySubscribed 
        ? "Votre inscription a été mise à jour avec succès" 
        : "Inscription réussie");
      onClose();
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!activity) return 0;
    if (activity.uniquePrice !== null) {
      return selectedMembers.length * activity.uniquePrice;
    }

    return selectedMembers.reduce((total, member) => {
      switch (member.ageCategory) {
        case "BABY":
          return total + (activity.babyPrice || 0);
        case "CHILD":
          return total + (activity.childPrice || 0);
        case "ADULT":
          return total + (activity.adultPrice || 0);
      }
    }, 0);
  };

  if (!activity) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-lg p-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {activity.title}
            </Dialog.Title>
            <Dialog.Close className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {step === "info" ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>
                  {format(new Date(activity.date), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>
                  {format(new Date(activity.date), "HH:mm", { locale: fr })} -{" "}
                  {durationLabels[activity.duration]}
                </span>
              </div>

              {activity.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{activity.location}</span>
                </div>
              )}

              {activity.url && (
                <div className="flex items-center gap-2 text-gray-600">
                  <LinkIcon className="h-5 w-5" />
                  <a 
                    href={activity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:underline"
                  >
                    Plus d'informations
                  </a>
                </div>
              )}

              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Prix
                </h3>
                {activity.uniquePrice !== null ? (
                  <p className="text-gray-600">Prix unique : {formatPrice(activity.uniquePrice)}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-600">Bébés : {formatPrice(activity.babyPrice)}</p>
                    <p className="text-gray-600">Enfants : {formatPrice(activity.childPrice)}</p>
                    <p className="text-gray-600">Adultes : {formatPrice(activity.adultPrice)}</p>
                  </div>
                )}
              </div>

              {participants.length > 0 && (
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants inscrits
                  </h3>
                  <div className="space-y-3">
                    {participants.map((subgroup) => (
                      <div 
                        key={subgroup.id}
                        className="p-3 rounded-lg border border-gray-200 space-y-2"
                      >
                        <div className="flex gap-2 justify-between">
                          {/* Adultes */}
                          <div className="flex gap-2">
                            <div>
                              {subgroup.adults.map((adult, index) => (
                                <div key={adult.id} className="text-sm text-gray-700">
                                  {adult.name}
                                  {!adult.isPresent && (
                                    <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                      En attente
                                    </span>
                                  )}
                                  {index < subgroup.adults.length - 1 && " & "}
                                </div>
                              ))}
                            </div>

                            {/* Enfants */}
                            {subgroup.children.length > 0 && (
                              <div className="text-sm text-gray-700">
                                + {subgroup.children.length} enfant{subgroup.children.length > 1 ? "s" : ""}
                                <div className="text-sm text-gray-600 pl-2">
                                  {subgroup.children.map((child, index) => (
                                    <span key={child.id}>
                                      {child.name}
                                      {!child.isPresent && (
                                        <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                          En attente
                                        </span>
                                      )}
                                      {index < subgroup.children.length - 1 && ", "}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setStep('subscribe')}
                  className="w-full bg-gray-900 text-white rounded-lg py-3 font-medium hover:bg-gray-800 transition-colors"
                >
                  {isUserAlreadySubscribed ? "Modifier mon inscription" : "S'inscrire à l'activité"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5" />
                <h3 className="text-lg font-medium">Participants</h3>
              </div>

              <div className="space-y-3">
                {allSubgroupMembers.map(member => {
                  const isSelected = selectedMembers.some(m => m.id === member.id);
                  const wasParticipant = currentParticipantIds.includes(member.id);
                  
                  return (
                    <div key={member.id} className={`flex items-center justify-between p-3 rounded-lg ${isSelected ? 'bg-gray-100' : 'bg-gray-50'} ${wasParticipant && !isSelected ? 'border border-orange-200' : ''}`}>
                      <div>
                        <p>{member.name}</p>
                        <p className="text-sm text-gray-500">
                          {member.ageCategory === 'BABY' && 'Bébé'}
                          {member.ageCategory === 'CHILD' && 'Enfant'}
                          {member.ageCategory === 'ADULT' && 'Adulte'}
                          {wasParticipant && !isSelected && (
                            <span className="ml-2 text-xs text-orange-600">(précédemment inscrit)</span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className={`p-1.5 rounded-full ${
                          isSelected 
                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' 
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {isSelected ? (
                          <Trash2 className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-lg font-medium">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotalPrice())}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={isLoading || selectedMembers.length === 0}
                  className="w-full bg-gray-900 text-white rounded-lg py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isLoading 
                    ? "En cours..." 
                    : isUserAlreadySubscribed 
                      ? "Modifier l'inscription" 
                      : "Confirmer l'inscription"
                  }
                </button>
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="w-full text-gray-600 hover:text-gray-900"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
