import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { updateWishlist } from '../../lib/services/wishlistService';
import type { Wishlist } from '../../lib/types/wishlist';

interface EditWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Wishlist;
  onUpdated: () => void;
}

export function EditWishlistModal({
  isOpen,
  onClose,
  wishlist,
  onUpdated
}: EditWishlistModalProps) {
  const [title, setTitle] = useState(wishlist.title);
  const [comment, setComment] = useState(wishlist.comment || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateWishlist(wishlist.id, {
        title,
        comment: comment || undefined
      });
      onUpdated();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier la liste"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            required
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Description (optionnelle)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}