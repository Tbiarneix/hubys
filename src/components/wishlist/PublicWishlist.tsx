import type { WishlistCategoryWithItems, WishlistItem } from '../../lib/types/wishlist';
import { ExternalLink } from 'lucide-react';
import { ItemSelection } from './ItemSelection';

interface PublicWishlistProps {
  categories: WishlistCategoryWithItems[];
  uncategorizedItems: WishlistItem[];
  loading: boolean;
  ownerName?: string;
  comment?: string | null;
  onUpdate: () => void;
}

export function PublicWishlist({ 
  categories, 
  uncategorizedItems, 
  loading, 
  ownerName,
  comment,
  onUpdate 
}: PublicWishlistProps) {
  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
      ))}
    </div>;
  }

  const ItemCard = ({ item }: { item: WishlistItem }) => (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
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
          {item.comment && (
            <span className="text-sm text-gray-500">{item.comment}</span>
          )}
        </div>
      </div>
      <ItemSelection
        itemId={item.id}
        isSelected={item.is_selected}
        selectorName={item.selector_name}
        onUpdate={onUpdate}
      />
    </div>
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {ownerName ? `Liste de souhaits de ${ownerName}` : 'Liste de souhaits'}
        </h2>
        {comment && (
          <p className="mt-2 text-gray-600">{comment}</p>
        )}
      </div>
      
      {uncategorizedItems.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Autre</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {uncategorizedItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              {category.comment && (
                <p className="mt-1 text-sm text-gray-500">{category.comment}</p>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              {category.items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}