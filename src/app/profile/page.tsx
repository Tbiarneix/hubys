/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Pencil, Trash2, Plus, Loader2, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { useState, useEffect } from 'react';
import { CreateWishlistModal } from '@/components/wishlists/CreateWishlistModal';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';
import { ImageUpload } from '@/components/ImageUpload';
import { AccountForm } from '@/components/profile/AccountForm';
import { generateAvatarUrl } from '@/utils/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

interface WishList {
  id: string;
  title: string;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  createdAt: string;
}

interface ProfileFormData {
  name: string;
  bio: string;
  image: string;
  birthDate: string;
}

interface UserProfile {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  email: string;
  birthDate: string | null;
}

interface Child {
  id: string;
  firstName: string;
  birthDate: string;
  createdAt: string;
}

interface Partner {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

interface PartnerInvitation {
  id: string;
  fromUser: Partner;
  toUser: Partner | null;
  email: string;
  status: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [wishlists, setWishlists] = useState<WishList[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [newChild, setNewChild] = useState({ firstName: '', birthDate: '' });
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    bio: "",
    image: "",
    birthDate: "",
  });
  const [isAddChildFormVisible, setIsAddChildFormVisible] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);
  const [partnerInvitation, setPartnerInvitation] = useState<PartnerInvitation | null>(null);
  const [partnerToRemove, setPartnerToRemove] = useState<PartnerInvitation | null>(null);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        try {
          const [profileRes, childrenRes, partnerRes, wishlistsRes, groupsRes] = await Promise.all([
            fetch(`/api/profile/${session.user.id}`),
            fetch(`/api/profile/${session.user.id}/children`),
            fetch(`/api/profile/${session.user.id}/partner`),
            fetch('/api/wishlists'),
            fetch('/api/groups')
          ]);
          
          if (profileRes.ok) {
            const profile = await profileRes.json();
            setUserProfile(profile);
            setFormData({
              name: profile.name || "",
              bio: profile.bio || "",
              image: profile.avatar || "",
              birthDate: profile.birthDate || "",
            });
          }

          if (childrenRes.ok) {
            const childrenData = await childrenRes.json();
            setChildren(childrenData);
          }

          if (partnerRes.ok) {
            const partnerData = await partnerRes.json();
            setPartnerInvitation(partnerData);
          }

          if (wishlistsRes.ok) {
            const data = await wishlistsRes.json();
            setWishlists(data);
          }

          if (groupsRes.ok) {
            const data = await groupsRes.json();
            setGroups(data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/profile/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
      toast.success("Profil mis à jour avec succès");
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/profile/${session.user.id}/children`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChild),
      });

      if (res.ok) {
        const child = await res.json();
        setChildren([...children, child]);
        setNewChild({ firstName: '', birthDate: '' });
        toast.success('Enfant ajouté avec succès');
      } else {
        toast.error("Erreur lors de l'ajout de l'enfant");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChild = async (deleteCompletely: boolean) => {
    if (!session?.user?.id || !childToDelete) return;

    try {
      const res = await fetch(`/api/profile/${session.user.id}/children/${childToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteCompletely }),
      });

      if (res.ok) {
        setChildren((prev) => prev.filter((child) => child.id !== childToDelete.id));
        setChildToDelete(null);
        toast.success(deleteCompletely ? 'Enfant supprimé' : 'Enfant retiré de votre profil');
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleEditChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !editingChild) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/profile/${session.user.id}/children/${editingChild.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editingChild.firstName,
          birthDate: editingChild.birthDate,
        }),
      });

      if (res.ok) {
        const updatedChild = await res.json();
        setChildren(children.map(child => 
          child.id === editingChild.id ? updatedChild : child
        ));
        setEditingChild(null);
        toast.success('Enfant modifié avec succès');
      } else {
        toast.error("Erreur lors de la modification de l'enfant");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsSubmittingPartner(true);
    try {
      const res = await fetch(`/api/profile/${session.user.id}/partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: partnerEmail }),
      });

      if (res.ok) {
        const invitation = await res.json();
        setPartnerInvitation(invitation);
        setPartnerEmail("");
        toast.success('Invitation envoyée avec succès');
      } else {
        toast.error("Erreur lors de l'envoi de l'invitation");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmittingPartner(false);
    }
  };

  const handleCancelPartnerInvitation = async () => {
    if (!session?.user?.id || !partnerInvitation) return;

    try {
      const res = await fetch(`/api/profile/${session.user.id}/partner`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPartnerInvitation(null);
        toast.success('Invitation annulée');
      } else {
        toast.error("Erreur lors de l'annulation de l'invitation");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handlePartnerInvitationResponse = async (invitationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/profile/${session.user.id}/partner`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationId, status }),
      });

      if (res.ok) {
        const updatedInvitation = await res.json();
        setPartnerInvitation(updatedInvitation);
        toast.success(status === 'ACCEPTED' ? 'Invitation acceptée' : 'Invitation refusée');
      } else {
        toast.error("Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleRemovePartner = async () => {
    if (!session?.user?.id || !partnerToRemove) return;

    try {
      const res = await fetch(`/api/profile/${session.user.id}/partner`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationId: partnerToRemove.id }),
      });

      if (res.ok) {
        setPartnerInvitation(null);
        setPartnerToRemove(null);
        toast.success('Partenaire retiré avec succès');
      } else {
        toast.error("Erreur lors de la suppression du partenaire");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "SUPPRIMER" || !session?.user?.id) return;
    
    setIsDeletingAccount(true);
    try {
      const response = await fetch(`/api/profile/${session.user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du compte');
      }

      // Déconnexion et redirection vers la page d'accueil
      signOut({ callbackUrl: '/' });
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression du compte");
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteAccountModalOpen(false);
    }
  };

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
                <Dialog.Root open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                  <Dialog.Trigger asChild>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Pencil className="h-4 w-4 mr-2" />
                      Éditer mon profil
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="bg-black/30 fixed inset-0 z-[60]" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[61] focus:outline-none">
                      <div className="flex justify-between items-center mb-6">
                        <Dialog.Title className="text-xl font-semibold text-gray-900">
                          Modifier mon profil
                        </Dialog.Title>
                        <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100">
                          <X className="h-4 w-4 text-gray-500" />
                        </Dialog.Close>
                      </div>

                      <Tabs.Root defaultValue="profile" className="flex flex-col w-full">
                        <Tabs.List className="flex space-x-4 border-b border-gray-200 mb-6">
                          <Tabs.Trigger
                            value="profile"
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black"
                          >
                            Profil
                          </Tabs.Trigger>
                          <Tabs.Trigger
                            value="relations"
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black"
                          >
                            Relations
                          </Tabs.Trigger>
                          <Tabs.Trigger
                            value="account"
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black"
                          >
                            Compte
                          </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="profile" className="focus:outline-none">
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center">
                              <ImageUpload
                                currentImage={formData.image || generateAvatarUrl(formData.name)}
                                onImageSelect={(base64) => setFormData(prev => ({ ...prev, image: base64 }))}
                              />
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                  Nom
                                </label>
                                <input
                                  id="name"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                />
                              </div>

                              <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                  Date de naissance
                                </label>
                                <input
                                  type="date"
                                  id="birthDate"
                                  name="birthDate"
                                  value={formData.birthDate}
                                  onChange={handleInputChange}
                                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                />
                              </div>

                              <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                  Bio
                                </label>
                                <textarea
                                  id="bio"
                                  name="bio"
                                  value={formData.bio}
                                  onChange={handleInputChange}
                                  rows={3}
                                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none resize-none"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                              <Dialog.Close asChild>
                                <button
                                  type="button"
                                  className="w-full px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                  Annuler
                                </button>
                              </Dialog.Close>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enregistrement...
                                  </>
                                ) : (
                                  'Enregistrer'
                                )}
                              </button>
                            </div>
                          </form>
                        </Tabs.Content>

                        <Tabs.Content value="relations" className="focus:outline-none">
                          <div className="space-y-8">
                            {/* Section Partenaire */}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Mon Partenaire</h3>
                              
                              {partnerInvitation ? (
                                <div className="bg-white rounded-lg shadow p-4">
                                  {partnerInvitation.status === "PENDING" ? (
                                    partnerInvitation.toUserId === session?.user?.id ? (
                                      <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                            <Image
                                              src={partnerInvitation.fromUser?.avatar || generateAvatarUrl(partnerInvitation.fromUser?.name || '')}
                                              alt={partnerInvitation.fromUser?.name || "Partner"}
                                              width={48}
                                              height={48}
                                              className="object-cover"
                                            />
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-gray-900">
                                              {partnerInvitation.fromUser?.name || partnerInvitation.fromUser?.email}
                                            </h4>
                                            <p className="text-sm text-gray-500">souhaite vous ajouter comme partenaire</p>
                                          </div>
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                          <button
                                            onClick={() => handlePartnerInvitationResponse(partnerInvitation.id, 'REJECTED')}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                          >
                                            Refuser
                                          </button>
                                          <button
                                            onClick={() => handlePartnerInvitationResponse(partnerInvitation.id, 'ACCEPTED')}
                                            className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                          >
                                            Accepter
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-center">
                                        <div className="text-gray-500">
                                          Invitation en attente pour {partnerInvitation.email}
                                        </div>
                                        <button
                                          onClick={handleCancelPartnerInvitation}
                                          className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded-full w-6 h-6 text-gray-500"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )
                                  ) : partnerInvitation.status === "ACCEPTED" ? (
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                            <Image
                                              src={
                                                session?.user?.id === partnerInvitation.fromUser.id
                                                  ? (partnerInvitation.toUser?.avatar || generateAvatarUrl(partnerInvitation.toUser?.name || ''))
                                                  : (partnerInvitation.fromUser?.avatar || generateAvatarUrl(partnerInvitation.fromUser?.name || ''))
                                              }
                                              alt="Partner"
                                              width={48}
                                              height={48}
                                              className="object-cover"
                                            />
                                          </div>
                                          <div>
                                            <h4 className="font-medium text-gray-900">
                                              {session?.user?.id === partnerInvitation.fromUser.id
                                                ? (partnerInvitation.toUser?.name || partnerInvitation.toUser?.email)
                                                : (partnerInvitation.fromUser?.name || partnerInvitation.fromUser?.email)
                                              }
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                              {session?.user?.id === partnerInvitation.fromUser.id
                                                ? partnerInvitation.toUser?.email
                                                : partnerInvitation.fromUser?.email
                                              }
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => setPartnerToRemove(partnerInvitation)}
                                          className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded-full w-8 h-8 text-red-500"
                                        >
                                          <Trash2 className="h-5 w-5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <form onSubmit={handlePartnerInvite} className="space-y-4">
                                  <div>
                                    <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                      Email du partenaire
                                    </label>
                                    <input
                                      type="email"
                                      id="partnerEmail"
                                      value={partnerEmail}
                                      onChange={(e) => setPartnerEmail(e.target.value)}
                                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                      required
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={isSubmittingPartner}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSubmittingPartner ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      'Inviter un partenaire'
                                    )}
                                  </button>
                                </form>
                              )}
                            </div>

                            {/* Section Enfants */}
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Mes enfants</h3>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => setIsAddChildFormVisible(true)}
                                        className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded-full w-8 h-8 text-gray-500"
                                      >
                                        <Plus className="h-5 w-5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Ajouter un enfant</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              
                              {/* Liste des enfants */}
                              <div className="space-y-4 mb-6">
                                {children.map((child) => (
                                  <div key={child.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
                                    <div>
                                      <p className="text-gray-800 font-medium">
                                        {child.firstName}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {new Date(child.birthDate).toLocaleDateString('fr-FR')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              onClick={() => setEditingChild(child)}
                                              className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded w-6 h-6 text-gray-500"
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Modifier l'enfant</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              onClick={() => setChildToDelete(child)}
                                              className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded-full w-6 h-6 text-red-500"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Supprimer l'enfant</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Formulaire d'ajout d'enfant */}
                              {isAddChildFormVisible && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-medium text-gray-900">Ajouter un enfant</h4>
                                    <button
                                      onClick={() => setIsAddChildFormVisible(false)}
                                      className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded-full w-6 h-6 text-gray-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <form onSubmit={(e) => {
                                    handleAddChild(e);
                                    setIsAddChildFormVisible(false);
                                  }} className="space-y-4">
                                    <div>
                                      <label htmlFor="childFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Prénom
                                      </label>
                                      <input
                                        type="text"
                                        id="childFirstName"
                                        value={newChild.firstName}
                                        onChange={(e) => setNewChild({ ...newChild, firstName: e.target.value })}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="childBirthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de naissance
                                      </label>
                                      <input
                                        type="date"
                                        id="childBirthDate"
                                        value={newChild.birthDate}
                                        onChange={(e) => setNewChild({ ...newChild, birthDate: e.target.value })}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                        required
                                      />
                                    </div>
                                    <button
                                      type="submit"
                                      disabled={isSubmitting}
                                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                      ) : (
                                        'Ajouter un enfant'
                                      )}
                                    </button>
                                  </form>
                                </div>
                              )}
                              {editingChild && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-medium text-gray-900">Modifier l'enfant</h4>
                                    <button
                                      onClick={() => setEditingChild(null)}
                                      className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded-full w-6 h-6 text-gray-500"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <form onSubmit={(e) => {
                                    handleEditChild(e);
                                    setEditingChild(null);
                                  }} className="space-y-4">
                                    <div>
                                      <label htmlFor="editingChildFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Prénom
                                      </label>
                                      <input
                                        type="text"
                                        id="editingChildFirstName"
                                        value={editingChild.firstName}
                                        onChange={(e) => setEditingChild({ ...editingChild, firstName: e.target.value })}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="editingChildBirthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Date de naissance
                                      </label>
                                      <input
                                        type="date"
                                        id="editingChildBirthDate"
                                        value={editingChild.birthDate}
                                        onChange={(e) => setEditingChild({ ...editingChild, birthDate: e.target.value })}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                                        required
                                      />
                                    </div>
                                    <button
                                      type="submit"
                                      disabled={isSubmitting}
                                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                      ) : (
                                        'Modifier l\'enfant'
                                      )}
                                    </button>
                                  </form>
                                </div>
                              )}
                            </div>
                          </div>
                        </Tabs.Content>

                        <Tabs.Content value="account" className="focus:outline-none">
                          <AccountForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                          
                          <div className="mt-8 border-t pt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone de danger</h3>
                            <button
                              onClick={() => setIsDeleteAccountModalOpen(true)}
                              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer mon compte
                            </button>
                          </div>
                        </Tabs.Content>
                      </Tabs.Root>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
                {/* Informations */}
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={userProfile?.avatar || generateAvatarUrl(userProfile?.name || '')}
                        alt={userProfile?.name || "Avatar"}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {userProfile?.name || "Sans nom"}
                      </h2>
                      <p className="text-sm text-gray-500">{userProfile?.email}</p>
                      {userProfile?.bio && (
                        <p className="mt-1 text-gray-600 italic">
                          &quot;{userProfile.bio}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Relations */}
                {(children.length > 0 || partnerInvitation?.status === 'ACCEPTED') && (                
                <div className="mt-8 border-t pt-6 flex start">
                  {/* Partenaire */}
                  {partnerInvitation?.status === 'ACCEPTED' && (
                    <div className="w-1/2">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Partenaire</h2>
                      <Link
                        href={`/profile/${partnerInvitation.toUser?.id === session?.user?.id ? partnerInvitation.fromUser.id : partnerInvitation.toUser?.id}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-gray-900"
                      >
                        {partnerInvitation.toUser?.id === session?.user?.id ? (
                          <>
                            {partnerInvitation.fromUser.avatar && (
                              <Image
                                src={partnerInvitation.fromUser.avatar}
                                alt={partnerInvitation.fromUser.name || ''}
                                width={45}
                                height={45}
                                className="object-cover"
                              />
                            )}
                            <span className="text-gray-900">{partnerInvitation.fromUser.name}</span>
                          </>
                        ) : (
                          <>
                            {partnerInvitation.toUser?.avatar && (
                              <Image
                                src={partnerInvitation.toUser.avatar}
                                alt={partnerInvitation.toUser.name || ''}
                                width={45}
                                height={45}
                                className="object-cover"
                              />
                            )}
                            <span className="text-gray-900">{partnerInvitation.toUser?.name}</span>
                          </>
                        )}
                      </Link>
                  </div>
                  )}
                  
                  {/* Enfants */}
                  {children.length > 0 && (
                    <div className="w-1/2">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 mt-0">Enfants</h2>
                    <div className="space-y-3">
                        {children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/children/${child.id}`}
                            className="flex items-center justify-between p-3 rounded-lg border hover:border-gray-400 transition-colors"
                          >
                            <div>
                              <h3 className="font-medium text-gray-900">{child.firstName}</h3>
                              <p className="text-sm text-gray-500">
                                {format(new Date(child.birthDate), 'dd MMMM yyyy', { locale: fr })}
                              </p>
                            </div>
                            <div className="text-gray-400">→</div>
                          </Link>
                        ))}
                      </div>
                  </div>
                  )}
                </div>
                )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">Listes de souhaits</h2>
                <button 
                  onClick={() => setIsWishlistModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une liste
                </button>
              </div>
              <div className="mt-4">
                {isLoading ? (
                  <p className="text-gray-500">Chargement...</p>
                ) : wishlists.length === 0 ? (
                  <p className="text-gray-500 italic">Pas de liste de souhait</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {wishlists.map((wishlist) => (
                      <div key={wishlist.id} className="flex justify-between items-center py-4">
                        <span className="text-gray-800">{wishlist.title}</span>
                        <Link
                          href={`/wishlists/${wishlist.id}`}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Gérer la liste
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">Groupe</h2>
                <button 
                  onClick={() => setIsGroupModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un groupe
                </button>
              </div>
              <div className="mt-4">
                {isLoading ? (
                  <p className="text-gray-500">Chargement...</p>
                ) : groups.length === 0 ? (
                  <p className="text-gray-500 italic">Pas de groupe</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {groups.map((group) => (
                      <div key={group.id} className="flex justify-between items-center py-4">
                        <span className="text-gray-800">{group.name}</span>
                        <Link
                          href={`/groups/${group.id}`}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Accéder au groupe
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateWishlistModal 
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
      />

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />

      {/* Modal de confirmation de suppression */}
      <Dialog.Root open={childToDelete !== null} onOpenChange={(open) => !open && setChildToDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/30 fixed inset-0 z-[60]" />
          <Dialog.Content className="fixed top-[50%] left-[50%] h-[600px] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[61] focus:outline-none">
            <div className="h-full flex flex-col">
              <div className="flex-grow space-y-6">
                <div className="space-y-4">
                  <Dialog.Title className="text-2xl font-semibold text-gray-900">
                    Que souhaitez-vous faire ?
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-500 text-base">
                    Vous pouvez soit retirer {childToDelete?.firstName} de votre profil tout en le conservant dans la base de données (recommandé pour les familles recomposées), soit le supprimer définitivement.
                  </Dialog.Description>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => handleDeleteChild(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Retirer de mon profil uniquement
                </button>
                <button
                  onClick={() => handleDeleteChild(true)}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Supprimer définitivement
                </button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Annuler
                  </button>
                </Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de confirmation de suppression du partenaire */}
      <Dialog.Root open={partnerToRemove !== null} onOpenChange={(open) => !open && setPartnerToRemove(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/30 fixed inset-0 z-[60]" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[61] focus:outline-none">
            <div className="space-y-6">
              <div className="space-y-2">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Confirmer la suppression
                </Dialog.Title>
                <Dialog.Description className="text-gray-500">
                  Êtes-vous sûr de vouloir retirer ce partenaire ? Cette action est irréversible mais les enfants seront conservés.
                </Dialog.Description>
              </div>

              <div className="flex justify-end space-x-3">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleRemovePartner}
                  className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de suppression de compte */}
      <Dialog.Root open={isDeleteAccountModalOpen} onOpenChange={(open) => !open && setIsDeleteAccountModalOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/30 fixed inset-0 z-[60]" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[61] focus:outline-none">
            <div className="space-y-6">
              <div className="space-y-2">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Confirmer la suppression du compte
                </Dialog.Title>
                <Dialog.Description className="text-gray-500">
                  Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et entraînera la suppression de toutes vos données.
                </Dialog.Description>
              </div>

              <div className="space-y-2">
                <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmez la suppression en écrivant "SUPPRIMER" dans le champ ci-dessous
                </label>
                <input
                  type="text"
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirmation !== "SUPPRIMER"}
                  className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isDeletingAccount ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
