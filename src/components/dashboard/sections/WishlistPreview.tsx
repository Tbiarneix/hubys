import { User } from '@supabase/supabase-js';
import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../lib/hooks/useWishlist';

interface WishlistPreviewProps {
  user: User;
}

export function WishlistPreview({ user }: WishlistPreviewProps) {
  const { categories, uncategorizedItems, loading } = useWishlist(user.id);

  const totalItems = (categories?.reduce((acc, cat) => acc + cat.items.length, 0) || 0) + 
    (uncategorizedItems?.length || 0);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white h-24 rounded-lg border border-gray-200"></div>
      </div>
    );
  }

  return (
    <Link
      to="/wishlist"
      className="block w-full bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Gift className="h-6 w-6 text-gray-400" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Ma liste de souhaits</h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalItems} cadeau{totalItems > 1 ? 'x' : ''} dans {categories.length} catégorie{categories.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <span className="text-sm text-gray-500">Gérer ma liste →</span>
      </div>
    </Link>
  );
}