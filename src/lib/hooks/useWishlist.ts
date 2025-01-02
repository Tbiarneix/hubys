import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { WishlistCategoryWithItems, WishlistItem } from '../types/wishlist';
import toast from 'react-hot-toast';

export function useWishlist(userId: string) {
  const [categories, setCategories] = useState<WishlistCategoryWithItems[]>([]);
  const [uncategorizedItems, setUncategorizedItems] = useState<WishlistItem[]>([]);
  const [comment, setComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, [userId]);

  async function loadWishlist() {
    try {
      // Charger la liste de souhaits par défaut
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (wishlistError) throw wishlistError;
      
      setWishlistId(wishlistData.id);
      setTitle(wishlistData.title);
      setComment(wishlistData.comment);

      // Charger les catégories avec leurs items
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('wishlist_categories')
        .select(`
          *,
          items:wishlist_items(*)
        `)
        .eq('wishlist_id', wishlistData.id)
        .order('order');

      if (categoriesError) throw categoriesError;

      // Charger les items sans catégorie
      const { data: uncategorizedData, error: uncategorizedError } = await supabase
        .from('wishlist_items')
        .select('*')
        .is('category_id', null)
        .eq('wishlist_id', wishlistData.id)
        .order('order');

      if (uncategorizedError) throw uncategorizedError;

      const categoriesWithSortedItems = categoriesData.map(category => ({
        ...category,
        items: [...category.items].sort((a, b) => a.order - b.order),
      }));

      setCategories(categoriesWithSortedItems);
      setUncategorizedItems(uncategorizedData);
    } catch (error) {
      toast.error("Erreur lors du chargement de la liste de souhaits");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { 
    categories, 
    uncategorizedItems, 
    comment, 
    wishlistId, 
    title,
    loading, 
    reloadWishlist: loadWishlist 
  };
}