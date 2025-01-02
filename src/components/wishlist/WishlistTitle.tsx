import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { updateWishlist } from '../../lib/services/wishlistService';

interface WishlistTitleProps {
  id: string;
  title: string;
  onUpdate: () => void;
}

export function WishlistTitle({ id, title, onUpdate }: WishlistTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editedTitle.trim()) return;
    
    setIsLoading(true);
    try {
      await updateWishlist(id, { title: editedTitle });
      onUpdate();
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none"
          autoFocus
        />
        <button
          onClick={() => {
            setEditedTitle(title);
            setIsEditing(false);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={handleSave}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center space-x-2">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}