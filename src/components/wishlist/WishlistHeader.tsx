import { Plus, Share2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WishlistTitle } from './WishlistTitle';

interface WishlistHeaderProps {
  wishlistId: string;
  title: string;
  onAddItem: () => void;
  onViewPublic: () => void;
  onUpdate: () => void;
}

export function WishlistHeader({ 
  wishlistId,
  title,
  onAddItem, 
  onViewPublic,
  onUpdate
}: WishlistHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Revenir à mon tableau de bord
      </Link>

      <div className="flex items-center justify-between">
        <WishlistTitle
          id={wishlistId}
          title={title}
          onUpdate={onUpdate}
        />
        <div className="flex items-center space-x-3">
          <button
            onClick={onViewPublic}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Vue publique
          </button>
          <button
            onClick={onAddItem}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un cadeau
          </button>
        </div>
      </div>
    </div>
  );
}