import { Database } from '../database.types';

export type Wishlist = Database['public']['Tables']['wishlists']['Row'];

export type WishlistCategory = Database['public']['Tables']['wishlist_categories']['Row'] & {
  comment?: string | null;
};

export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'] & {
  is_selected: boolean;
  selector_name: string | null;
  comment?: string | null;
};

export interface WishlistCategoryWithItems extends WishlistCategory {
  items: WishlistItem[];
}

export interface WishlistWithDetails extends Wishlist {
  categories: WishlistCategoryWithItems[];
  uncategorizedItems: WishlistItem[];
}