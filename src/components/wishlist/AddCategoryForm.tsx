import { useState } from 'react';
import { addCategory } from '../../lib/services/wishlistService';

interface AddCategoryFormProps {
  userId: string;
  wishlistId: string;
  onCategoryAdded: () => void;
}

export function AddCategoryForm({ userId, wishlistId, onCategoryAdded }: AddCategoryFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addCategory({
        name,
        user_id: userId,
        wishlist_id: wishlistId
      });
      setName('');
      onCategoryAdded();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
          Nom de la catégorie
        </label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          placeholder="Ex: Livres, Jeux vidéo, etc."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
      >
        {isLoading ? "Création..." : "Créer la catégorie"}
      </button>
    </form>
  );
}