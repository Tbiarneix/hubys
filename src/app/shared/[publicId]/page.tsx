'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import prisma from '@/lib/prisma';

interface WishlistItem {
  id: string;
  name: string;
  url: string | null;
  comment: string | null;
  categoryId: string | null;
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">{wishlist.title}</h1>
          {wishlist.description && (
            <p className="mt-2 text-gray-600">{wishlist.description}</p>
          )}
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
                    <div>
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
                  <div>
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
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
