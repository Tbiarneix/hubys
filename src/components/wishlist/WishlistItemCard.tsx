import { useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import type { WishlistItem } from '../../lib/types/wishlist';
import { deleteItem, updateItemComment } from '../../lib/services/wishlistService';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { WishlistComment } from './WishlistComment';

interface WishlistItemCardProps {
  item: WishlistItem;
  onDelete: () => void;
}

export function WishlistItemCard({ item, onDelete }: WishlistItemCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    await deleteItem(item.id);
    setIsDeleteModalOpen(false);
    onDelete();
  };

  const handleCommentUpdate = async (comment: string | null) => {
    await updateItemComment(item.id, comment);
    onDelete(); // Recharge la liste pour afficher le nouveau commentaire
  };

  return (
    <>
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
            <div className="mt-1 flex items-center space-x-4">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Voir le lien
                </a>
              )}
              <div className="flex-1">
                <WishlistComment
                  comment={item.comment}
                  onSave={handleCommentUpdate}
                  placeholder="Ajouter des précisions (taille, couleur, etc.)"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={item.name}
      />
    </>
  );
}