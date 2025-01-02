import { useState } from 'react';
import type { WishlistCategoryWithItems } from '../../lib/types/wishlist';
import { WishlistCategory } from './WishlistCategory';
import { updateCategoryOrder } from '../../lib/services/wishlistService';

interface WishlistCategoryListProps {
  categories: WishlistCategoryWithItems[];
  userId: string;
  onOrderChange: () => void;
}

export function WishlistCategoryList({ categories, userId, onOrderChange }: WishlistCategoryListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (categoryId: string) => {
    setDraggingId(categoryId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;

    const oldIndex = categories.findIndex(c => c.id === draggingId);
    const newIndex = categories.findIndex(c => c.id === targetId);

    const reorderedCategories = [...categories];
    const [movedCategory] = reorderedCategories.splice(oldIndex, 1);
    reorderedCategories.splice(newIndex, 0, movedCategory);

    const updates = reorderedCategories.map((category, index) => ({
      id: category.id,
      order: index,
    }));

    await updateCategoryOrder(updates);
    onOrderChange();
    setDraggingId(null);
  };

  if (categories.length === 0) {
    return (
      <p className="text-gray-500 italic">Aucune catégorie créée</p>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div
          key={category.id}
          draggable
          onDragStart={() => handleDragStart(category.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(category.id)}
          className={`transition-opacity ${draggingId === category.id ? 'opacity-50' : ''}`}
        >
          <WishlistCategory 
            category={category}
            userId={userId}
            onUpdate={onOrderChange}
          />
        </div>
      ))}
    </div>
  );
}