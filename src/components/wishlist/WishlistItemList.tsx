import { useState } from 'react';
import type { WishlistItem } from '../../lib/types/wishlist';
import { WishlistItemCard } from './WishlistItemCard';
import { updateItemOrder } from '../../lib/services/wishlistService';

interface WishlistItemListProps {
  items: WishlistItem[];
  onUpdate: () => void;
}

export function WishlistItemList({ items, onUpdate }: WishlistItemListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (itemId: string) => {
    setDraggingId(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;

    const oldIndex = items.findIndex(item => item.id === draggingId);
    const newIndex = items.findIndex(item => item.id === targetId);

    const reorderedItems = [...items];
    const [movedItem] = reorderedItems.splice(oldIndex, 1);
    reorderedItems.splice(newIndex, 0, movedItem);

    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    await updateItemOrder(updates);
    onUpdate();
    setDraggingId(null);
  };

  if (items.length === 0) {
    return (
      <p className="p-4 text-gray-500 italic">Aucun cadeau dans cette catégorie</p>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(item.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(item.id)}
          className={`transition-opacity ${draggingId === item.id ? 'opacity-50' : ''}`}
        >
          <WishlistItemCard 
            item={item}
            onDelete={onUpdate}
          />
        </div>
      ))}
    </div>
  );
}