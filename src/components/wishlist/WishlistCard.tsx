import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Pencil, Trash2 } from 'lucide-react';
import type { Wishlist } from '../../lib/types/wishlist';
import { deleteWishlist } from '../../lib/services/wishlistService';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { EditWishlistModal } from './EditWishlistModal';

interface WishlistCardProps {
  wishlist: Wishlist;
  onUpdate: () => void;
}

export function WishlistCard({ wishlist, onUpdate }: WishlistCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    await deleteWishlist(wishlist.id);
    setIsDeleteModalOpen(false);
    onUpdate();
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Gift className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{wishlist.title}</h3>
              {wishlist.comment && (
                <p className="mt-1 text-sm text-gray-500">{wishlist.comment}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              aria-label="Modifier"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Link
          to={`/wishlist/${wishlist.id}`}
          className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          Voir la liste →
        </Link>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={wishlist.title}
      />

      <EditWishlistModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        wishlist={wishlist}
        onUpdated={onUpdate}
      />
    </>
  );
}