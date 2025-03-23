'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Group, SecretSanta } from '@/types/group';
import Image from 'next/image';
import Link from 'next/link';
import { generateAvatarUrl } from '@/utils/avatar';
import { Share2, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { InviteModal } from '@/components/groups/InviteModal';
import { EditGroupModal } from '@/components/groups/EditGroupModal';
import { DeleteGroupModal } from '@/components/groups/DeleteGroupModal';
import SecretSantaCard from '@/components/groups/SecretSantaCard';
import EventCard from '@/components/groups/EventCard';
import RecipeCard from '@/components/groups/RecipeCard';
import { ChatSidebar } from '@/components/groups/ChatSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useOptimistic, startTransition } from "react";

export default function GroupPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogProps, setConfirmDialogProps] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);
  const [secretSanta, setSecretSanta] = useState<SecretSanta | null>(null);

  const [optimisticGroup, updateOptimisticGroup] = useOptimistic(
    group,
    (state, removedMemberId: string) => {
      if (!state) return state;
      return {
        ...state,
        members: state.members.filter((member) => member.id !== removedMemberId)
      };
    }
  );

  const fetchGroup = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/groups/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch group');
      }
      const data = await response.json();
      setGroup(data);
      
      // Fetch secret santa if exists
      const ssResponse = await fetch(`/api/groups/${id}/secret-santa`);
      if (ssResponse.ok) {
        const ssData = await ssResponse.json();
        setSecretSanta(ssData);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Erreur lors du chargement du groupe');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session?.user?.id]);

  const handleLaunchSecretSanta = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/secret-santa`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to launch Secret Santa');
      }

      const data = await response.json();
      setSecretSanta(data);
    } catch (error) {
      console.error('Error launching Secret Santa:', error);
      throw error;
    }
  };

  const handleRelaunchSecretSanta = async () => {
    try {
      await handleCancelSecretSanta();
      await handleLaunchSecretSanta();
    } catch (error) {
      console.error('Error relaunching Secret Santa:', error);
      throw error;
    }
  };

  const handleCancelSecretSanta = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/secret-santa`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel Secret Santa');
      }

      setSecretSanta(null);
      toast.success('Secret Santa annulé');
    } catch (error) {
      console.error('Error canceling Secret Santa:', error);
      throw error;
    }
  };

  const handleLeaveGroup = async (memberId: string) => {
    try {
      startTransition(() => {
        updateOptimisticGroup(memberId);
      });
      
      const response = await fetch(`/api/groups/${id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 204) {
          throw new Error('Failed to leave group');
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Failed to leave group');
        }
      }

      if (session?.user?.id === optimisticGroup?.members.find(m => m.id === memberId)?.userId) {
        router.push('/groups');
        toast.success('Vous avez quitté le groupe');
      } else {
        toast.success('Membre supprimé du groupe');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Erreur lors de la sortie du groupe');
      // Recharger les données en cas d'erreur
      fetchGroup();
    }
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      const response = await fetch(`/api/groups/${id}/members/${memberId}/promote`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to promote member');
      }

      fetchGroup();
      toast.success('Membre promu administrateur');
    } catch (error) {
      console.error('Error promoting member:', error);
      toast.error('Erreur lors de la promotion du membre');
    }
  };

  const handleConfirmAction = (title: string, description: string, action: () => Promise<void>) => {
    setConfirmDialogProps({ title, description, action });
    setShowConfirmDialog(true);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-900">Chargement...</p>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f6f2ef]">
      <div className="flex h-screen">
        {/* Main content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-black">{group.name}</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Inviter
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Modifier
                </button>
                {group.members.find(
                  (member) =>
                    member.userId === session?.user?.id && member.role === "ADMIN"
                ) && (
                  <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                  <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </button>
                )}
              </div>
            </div>

            {/* Members grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {optimisticGroup?.members
                .sort((a, b) => a.user.name.localeCompare(b.user.name))
                .map((member) => {
                  const isCurrentUser = member.userId === session?.user?.id;
                  const isAdmin = group.members.find(m => m.userId === session?.user?.id)?.role === "ADMIN";
                  const showSettings = isCurrentUser || isAdmin;
                  const otherAdminsExist = group.members.some(m => m.role === "ADMIN" && m.userId !== session?.user?.id);

                  return (
                    <div
                      key={member.id}
                      className="relative p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      {showSettings && (
                        <div className="absolute top-4 right-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-gray-100 rounded-full">
                              <Settings className="h-4 w-4 text-gray-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isCurrentUser ? (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (member.role === "ADMIN" && !otherAdminsExist) {
                                      handleConfirmAction(
                                        "Impossible de quitter le groupe",
                                        "Veuillez nommer un administrateur d'abord",
                                        async () => {}
                                      );
                                    } else {
                                      handleConfirmAction(
                                        "Quitter le groupe",
                                        "Êtes-vous sûr de vouloir quitter le groupe ?",
                                        () => handleLeaveGroup(member.id)
                                      );
                                    }
                                  }}
                                >
                                  Quitter le groupe
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleConfirmAction(
                                        "Supprimer du groupe",
                                        `Êtes-vous sûr de vouloir supprimer ${member.user.name} du groupe ?`,
                                        () => handleLeaveGroup(member.id)
                                      );
                                    }}
                                  >
                                    Supprimer du groupe
                                  </DropdownMenuItem>
                                  {member.role !== "ADMIN" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleConfirmAction(
                                          "Nommer administrateur",
                                          `Êtes-vous sûr de vouloir nommer ${member.user.name} administrateur du groupe ?`,
                                          () => handlePromoteToAdmin(member.id)
                                        );
                                      }}
                                    >
                                      Nommer Administrateur
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      <Link href={`/profile/${member.userId}`}>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden">
                            <Image
                              src={member.user.avatar || generateAvatarUrl(member.user.name)}
                              alt={member.user.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {member.user.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Membre depuis {format(new Date(member.joinedAt), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
            </div>

            {/* Cartes */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              {group.showEvents && (
                <div className="col-span-1">
                  <EventCard id={id} />
                </div>
              )}
              {group.showSecretSanta && (
                <div className="col-span-1">
                  <SecretSantaCard
                    groupId={id}
                    groupName={group.name}
                    currentUserId={session?.user?.id || ''}
                    secretSanta={secretSanta}
                    onLaunch={handleLaunchSecretSanta}
                    onRelaunch={handleRelaunchSecretSanta}
                    onCancel={handleCancelSecretSanta}
                  />
                </div>
              )}
              {group.showRecipes && (
                <div className="col-span-1">
                  <RecipeCard groupId={id} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        <ChatSidebar
          groupId={id}
          messages={group.messages}
          currentUserId={session?.user?.id || ''}
          onMessagesUpdate={(messages) =>
            setGroup((prevGroup) =>
              prevGroup
                ? {
                    ...prevGroup,
                    messages: messages.map((msg) => ({
                      ...msg,
                      groupId: id,
                    })),
                  }
                : null
            )
          }
        />
      </div>

      {/* Modales */}
      {showInviteModal && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          groupId={id}
        />
      )}

      {showEditModal && (
        <EditGroupModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          group={group}
          onGroupUpdate={(updatedGroup) => setGroup(updatedGroup)}
        />
      )}

      {showDeleteModal && (
        <DeleteGroupModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          groupId={id}
        />
      )}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialogProps?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialogProps?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            {confirmDialogProps?.title !== "Impossible de quitter le groupe" && (
              <AlertDialogAction
                onClick={async () => {
                  if (confirmDialogProps?.action) {
                    await confirmDialogProps.action();
                  }
                }}
              >
                Confirmer
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
