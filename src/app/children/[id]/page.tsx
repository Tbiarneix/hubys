'use client';

import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { CreateWishlistModal } from '@/components/wishlists/CreateWishlistModal';
import { Plus } from 'lucide-react';

interface Child {
  id: string;
  firstName: string;
  birthDate: string;
  parents: {
    id: string;
    name: string | null;
    avatar: string | null;
  }[];
  wishlists: {
    id: string;
    title: string;
    createdAt: string;
  }[];
}

export default function ChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const [child, setChild] = useState<Child | null>(null);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      const response = await fetch(`/api/children/${id}`);
      if (response.ok) {
        const data = await response.json();
        setChild(data);
      }
    };

    fetchChild();
  }, [id]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Enfant non trouvé</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-black">{child.firstName}</h1>
      <div className="bg-gray-50 rounded-lg shadow-sm border p-6 mb-8">
        <p className="text-gray-600 mb-4">
          Né(e) le {format(new Date(child.birthDate), 'dd MMMM yyyy', { locale: fr })}
        </p>
        <div>
          <h2 className="text-lg text-gray-800 font-medium mb-2">Parents</h2>
          <div className="flex gap-4">
            {child.parents.map((parent) => (
              <Link
                key={parent.id}
                href={`/profile/${parent.id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <span>{parent.name || parent.id}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-gray-800 font-medium">Listes de souhaits</h2>
          <button
            onClick={() => setIsWishlistModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-9 px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer une liste
          </button>
        </div>

        {child.wishlists.length === 0 ? (
          <p className="text-gray-500">Aucune liste de souhaits</p>
        ) : (
          <div className="space-y-4">
            {child.wishlists.map((wishlist) => (
              <Link
                key={wishlist.id}
                href={`/wishlists/${wishlist.id}`}
                className="block p-4 rounded-lg border hover:border-gray-400 transition-colors"
              >
                <h3 className="font-medium mb-1 text-gray-800">{wishlist.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateWishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        childId={child.id}
        onCreated={(newWishlist) => {
          setChild((prev) => prev ? {
            ...prev,
            wishlists: [...prev.wishlists, newWishlist]
          } : null);
          setIsWishlistModalOpen(false);
        }}
      />
    </div>
  );
}
