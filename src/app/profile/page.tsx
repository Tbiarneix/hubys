'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Pencil, X, Plus, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect } from 'react';
import { CreateWishlistModal } from '@/components/wishlists/CreateWishlistModal';
import Link from 'next/link';
import { toast } from "sonner";
import { ImageUpload } from '@/components/ImageUpload';
import { generateAvatarUrl } from '@/utils/avatar';

interface WishList {
  id: string;
  title: string;
  createdAt: string;
}

interface ProfileFormData {
  name: string;
  bio: string;
  image: string;
}

interface UserProfile {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  email: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [wishlists, setWishlists] = useState<WishList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    bio: "",
    image: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/profile/${session.user.id}`);
          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
            setFormData({
              name: profile.name || "",
              bio: profile.bio || "",
              image: profile.avatar || "",
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [session?.user?.id]);

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

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const response = await fetch('/api/wishlists');
        if (!response.ok) {
          throw new Error('Failed to fetch wishlists');
        }
        const data = await response.json();
        setWishlists(data);
      } catch (error) {
        console.error('Error fetching wishlists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchWishlists();
    }
  }, [session]);

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
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <Dialog.Close asChild>
                            <button
                              type="button"
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Annuler
                            </button>
                          </Dialog.Close>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
              <div className="flex items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={userProfile?.avatar || generateAvatarUrl(userProfile?.name || '')}
                    alt={userProfile?.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4 space-y-2">
                  <p className="text-gray-900">
                    <span className="font-medium">Nom:</span>{" "}
                    {userProfile?.name || "Non renseigné"}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Email:</span>{" "}
                    {userProfile?.email}
                  </p>
                </div>
              </div>
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
      </div>

      <CreateWishlistModal 
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
      />
    </div>
  );
}
