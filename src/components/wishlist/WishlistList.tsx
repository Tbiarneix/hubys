import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWishlists } from '../../lib/hooks/useWishlists';
import { WishlistCard } from './WishlistCard';
import { CreateWishlistModal } from './CreateWishlistModal';

interface WishlistListProps {
  userId: string;
}

export function WishlistList({ userId }: WishlistListProps) {
  const { wishlists, loading, reloadWishlists } = useWishlists(userId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mes listes de souhaits</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle liste
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wishlists.map(wishlist => (
          <WishlistCard
            key={wishlist.id}
            wishlist={wishlist}
            onUpdate={reloadWishlists}
          />
        ))}
      </div>

      <CreateWishlistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={userId}
        onCreated={reloadWishlists}
      />
    </div>
  );
}