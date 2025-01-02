import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { useWishlist } from '../../lib/hooks/useWishlist';
import { WishlistCategoryList } from './WishlistCategoryList';
import { AddCategoryForm } from './AddCategoryForm';
import { AddItemForm } from './AddItemForm';
import { WishlistItemList } from './WishlistItemList';
import { PublicWishlist } from './PublicWishlist';
import { WishlistHeader } from './WishlistHeader';

interface WishlistSectionProps {
  user?: User;
  ownerId: string;
}

export function WishlistSection({ user, ownerId }: WishlistSectionProps) {
  const { categories, uncategorizedItems, comment, wishlistId, title, loading, reloadWishlist } = useWishlist(ownerId);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showPublicView, setShowPublicView] = useState(false);

  const isOwner = user?.id === ownerId;

  if (!isOwner || showPublicView) {
    return (
      <div className="space-y-4">
        {isOwner && (
          <button
            onClick={() => setShowPublicView(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Retour à ma liste
          </button>
        )}
        <PublicWishlist
          categories={categories}
          uncategorizedItems={uncategorizedItems}
          loading={loading}
          title={title}
          comment={comment}
          onUpdate={reloadWishlist}
        />
      </div>
    );
  }

  if (!wishlistId || !title) {
    return <div>Chargement...</div>;
  }

  return (
    <section className="space-y-6">
      <WishlistHeader 
        wishlistId={wishlistId}
        title={title}
        onAddItem={() => setIsAddingItem(true)}
        onViewPublic={() => setShowPublicView(true)}
        onUpdate={reloadWishlist}
      />

      {isAddingItem && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un cadeau</h3>
          <AddItemForm
            userId={user.id}
            wishlistId={wishlistId}
            onItemAdded={() => {
              reloadWishlist();
              setIsAddingItem(false);
            }}
            onCancel={() => setIsAddingItem(false)}
          />
        </div>
      )}
      
      {uncategorizedItems.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Autre</h3>
          </div>
          <WishlistItemList 
            items={uncategorizedItems}
            onUpdate={reloadWishlist}
          />
        </div>
      )}
      
      <WishlistCategoryList 
        categories={categories}
        userId={user.id}
        wishlistId={wishlistId}
        onOrderChange={reloadWishlist}
      />
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter une catégorie</h3>
        <AddCategoryForm 
          userId={user.id}
          wishlistId={wishlistId}
          onCategoryAdded={reloadWishlist}
        />
      </div>
    </section>
  );
}