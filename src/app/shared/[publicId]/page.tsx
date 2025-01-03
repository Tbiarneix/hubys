'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import prisma from '@/lib/prisma';

interface WishlistItem {
  id: string;
  name: string;
  url: string | null;
  comment: string | null;
  categoryId: string | null;
  isReserved: boolean;
  reserverName: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface SharedWishlist {
  title: string;
  description: string | null;
  categories: Category[];
  items: WishlistItem[];
}

export default function SharedWishlistPage({ params }: { params: { publicId: string } }) {
  const [wishlist, setWishlist] = useState<SharedWishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserverNames, setReserverNames] = useState<{ [key: string]: string }>({});
  const [showNameInput, setShowNameInput] = useState<{ [key: string]: boolean }>({});
  const [nameErrors, setNameErrors] = useState<{ [key: string]: string }>({});
  const [showReservations, setShowReservations] = useState(false);

  const handleCheckboxChange = async (itemId: string, checked: boolean) => {
    if (!checked) {
      // Si on décoche, on envoie directement la requête avec reserverName: null
      handleReserveItem(itemId, null);
    } else {
      // Si on coche, on affiche l'input pour le nom
      setShowNameInput(prev => ({ ...prev, [itemId]: true }));
      // Réinitialiser l'erreur quand on affiche l'input
      setNameErrors(prev => ({ ...prev, [itemId]: '' }));
    }
  };

  const handleNameSubmit = async (itemId: string) => {
    const name = reserverNames[itemId];
    if (!name?.trim()) {
      setNameErrors(prev => ({ ...prev, [itemId]: 'Veuillez entrer votre nom' }));
      return;
    }

    setNameErrors(prev => ({ ...prev, [itemId]: '' }));
    await handleReserveItem(itemId, name.trim());
    setShowNameInput(prev => ({ ...prev, [itemId]: false }));
  };

  const handleReserveItem = async (itemId: string, reserverName: string | null) => {
    try {
      const response = await fetch(`/api/shared/items/${itemId}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reserverName: reserverName }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la réservation');
      }

      const updatedItem = await response.json();
      
      // Mettre à jour l'état local
      setWishlist(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === itemId
              ? { ...item, isReserved: updatedItem.isReserved, reserverName: updatedItem.reserverName }
              : item
          ),
        };
      });

      // Réinitialiser le nom si la réservation est annulée
      if (!updatedItem.isReserved) {
        setReserverNames(prev => {
          const newNames = { ...prev };
          delete newNames[itemId];
          return newNames;
        });
      }
    } catch (error) {
      console.error('Error reserving item:', error);
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`/api/shared/${params.publicId}`);
        if (!response.ok) {
          throw new Error('Liste non trouvée');
        }
        const data = await response.json();
        setWishlist(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [params.publicId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-900">Chargement...</p>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500">{error || 'Liste introuvable'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <Gift className="h-4 w-4 mr-2" />
            Une liste créée avec Hubidays, vous aussi créez la vôtre !
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">{wishlist.title}</h1>
              {wishlist.description && (
                <p className="mt-2 text-gray-600">{wishlist.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowReservations(!showReservations)}
              className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
            >
              {showReservations ? "Masquer" : "Afficher"} les réservations
            </button>
          </div>

          <div className="space-y-6">
            {wishlist.categories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                  {category.description && (
                    <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                  )}
                </div>
                {wishlist.items
                  .filter((item) => item.categoryId === category.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {item.name}
                            </a>
                          ) : (
                            item.name
                          )}
                        </h3>
                        {item.comment && (
                          <p className="mt-1 text-sm text-gray-600">{item.comment}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {showNameInput[item.id] ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Votre nom"
                                className={`px-2 py-1 border rounded text-sm text-gray-800 ${
                                  nameErrors[item.id] ? 'border-red-500' : ''
                                }`}
                                value={reserverNames[item.id] || ''}
                                onChange={(e) => {
                                  setReserverNames(prev => ({
                                    ...prev,
                                    [item.id]: e.target.value
                                  }));
                                  // Effacer l'erreur quand l'utilisateur commence à taper
                                  if (nameErrors[item.id]) {
                                    setNameErrors(prev => ({ ...prev, [item.id]: '' }));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleNameSubmit(item.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleNameSubmit(item.id)}
                                className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800"
                              >
                                OK
                              </button>
                            </div>
                            {nameErrors[item.id] && (
                              <p className="text-red-500 text-xs">{nameErrors[item.id]}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {showReservations ? (
                              <>
                                <input
                                  type="checkbox"
                                  checked={item.isReserved}
                                  onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                                  className="w-4 h-4 text-black rounded border-gray-300 focus:ring-gray-500"
                                  disabled={item.isReserved && item.reserverName}
                                />
                                <span className="text-sm text-gray-700">
                                  {item.isReserved && item.reserverName
                                    ? `Réservé par ${item.reserverName}`
                                    : 'Réserver'}
                                </span>
                              </>
                            ) : (
                              <div className="w-32 h-4 bg-black"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ))}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Sans catégorie</h2>
              {wishlist.items
                .filter((item) => !item.categoryId)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {item.name}
                          </a>
                        ) : (
                          item.name
                        )}
                      </h3>
                      {item.comment && (
                        <p className="mt-1 text-sm text-gray-600">{item.comment}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {showNameInput[item.id] ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Votre nom"
                              className={`px-2 py-1 border rounded text-sm text-gray-800 ${
                                nameErrors[item.id] ? 'border-red-500' : ''
                              }`}
                              value={reserverNames[item.id] || ''}
                              onChange={(e) => {
                                setReserverNames(prev => ({
                                  ...prev,
                                  [item.id]: e.target.value
                                }));
                                // Effacer l'erreur quand l'utilisateur commence à taper
                                if (nameErrors[item.id]) {
                                  setNameErrors(prev => ({ ...prev, [item.id]: '' }));
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleNameSubmit(item.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleNameSubmit(item.id)}
                              className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800"
                            >
                              OK
                            </button>
                          </div>
                          {nameErrors[item.id] && (
                            <p className="text-red-500 text-xs">{nameErrors[item.id]}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {showReservations ? (
                            <>
                              <input
                                type="checkbox"
                                checked={item.isReserved}
                                onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                                className="w-4 h-4 text-black rounded border-gray-300 focus:ring-gray-500"
                                disabled={item.isReserved && item.reserverName}
                              />
                              <span className="text-sm text-gray-700">
                                {item.isReserved && item.reserverName
                                  ? `Réservé par ${item.reserverName}`
                                  : 'Réserver'}
                              </span>
                            </>
                          ) : (
                            <div className="w-32 h-4 bg-black"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
