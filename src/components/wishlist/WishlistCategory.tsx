import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { WishlistCategoryWithItems } from '../../lib/types/wishlist';
import { WishlistItemList } from './WishlistItemList';
import { AddItemForm } from './AddItemForm';
import { deleteCategory, updateCategoryComment } from '../../lib/services/wishlistService';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { WishlistComment } from './WishlistComment';

interface WishlistCategoryProps {
  category: WishlistCategoryWithItems;
  userId: string;
  wishlistId: string;
  onUpdate: () => void;
}

export function WishlistCategory({ category, userId, wishlistId, onUpdate }: WishlistCategoryProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    await deleteCategory(category.id);
    setIsDeleteModalOpen(false);
    onUpdate();
  };

  const handleCommentUpdate = async (comment: string | null) => {
    await updateCategoryComment(category.id, comment);
    onUpdate();
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 space-y-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                aria-label="Ajouter un cadeau"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                aria-label="Supprimer la catégorie"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <WishlistComment
            comment={category.comment}
            onSave={handleCommentUpdate}
            placeholder="Ajouter un commentaire pour cette catégorie..."
          />
        </div>

        <WishlistItemList 
          items={category.items}
          onUpdate={onUpdate}
        />

        {isAddingItem && (
          <div className="p-4 border-t border-gray-200">
            <AddItemForm
              categoryId={category.id}
              userId={userId}
              wishlistId={wishlistId}
              onItemAdded={() => {
                onUpdate();
                setIsAddingItem(false);
              }}
              onCancel={() => setIsAddingItem(false)}
            />
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={category.name}
      />
    </>
  );
}