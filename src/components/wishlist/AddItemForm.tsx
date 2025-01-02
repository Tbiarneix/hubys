import { useState } from 'react';
import { X } from 'lucide-react';
import { addItem } from '../../lib/services/wishlistService';

interface AddItemFormProps {
  categoryId?: string;
  userId: string;
  wishlistId: string;
  onItemAdded: () => void;
  onCancel: () => void;
}

export function AddItemForm({ 
  categoryId, 
  userId, 
  wishlistId,
  onItemAdded, 
  onCancel 
}: AddItemFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addItem({
        name,
        url,
        category_id: categoryId,
        user_id: userId,
        wishlist_id: wishlistId
      });
      onItemAdded();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
          Nom du cadeau
        </label>
        <input
          type="text"
          id="itemName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="itemUrl" className="block text-sm font-medium text-gray-700">
          Lien (optionnel)
        </label>
        <input
          type="url"
          id="itemUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          placeholder="https://"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          {isLoading ? "Ajout..." : "Ajouter"}
        </button>
      </div>
    </form>
  );
}