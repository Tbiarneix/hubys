import { supabase } from '../supabase';
import toast from 'react-hot-toast';

// Types
interface CreateWishlistData {
  title: string;
  user_id: string;
  comment?: string;
}

interface UpdateWishlistData {
  title?: string;
  comment?: string;
}

interface AddCategoryData {
  name: string;
  user_id: string;
  wishlist_id: string;
  order?: number;
}

interface AddItemData {
  name: string;
  url?: string;
  category_id?: string;
  user_id: string;
  wishlist_id: string;
  order?: number;
}

interface UpdateOrderData {
  id: string;
  order: number;
}

// Gestion des listes
export async function createWishlist(data: CreateWishlistData) {
  try {
    const { error } = await supabase
      .from('wishlists')
      .insert(data);

    if (error) throw error;
    toast.success("Liste créée");
  } catch (error) {
    toast.error("Erreur lors de la création de la liste");
    throw error;
  }
}

export async function updateWishlist(id: string, data: UpdateWishlistData) {
  try {
    const { error } = await supabase
      .from('wishlists')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    toast.success("Liste mise à jour");
  } catch (error) {
    toast.error("Erreur lors de la mise à jour de la liste");
    throw error;
  }
}

export async function deleteWishlist(id: string) {
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success("Liste supprimée");
  } catch (error) {
    toast.error("Erreur lors de la suppression de la liste");
    throw error;
  }
}

// Gestion des commentaires
export async function updateWishlistComment(userId: string, comment: string | null) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ wishlist_comment: comment })
      .eq('id', userId);

    if (error) throw error;
    toast.success("Commentaire mis à jour");
  } catch (error) {
    toast.error("Erreur lors de la mise à jour du commentaire");
    throw error;
  }
}

export async function updateCategoryComment(categoryId: string, comment: string | null) {
  try {
    const { error } = await supabase
      .from('wishlist_categories')
      .update({ comment })
      .eq('id', categoryId);

    if (error) throw error;
    toast.success("Commentaire mis à jour");
  } catch (error) {
    toast.error("Erreur lors de la mise à jour du commentaire");
    throw error;
  }
}

export async function updateItemComment(itemId: string, comment: string | null) {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .update({ comment })
      .eq('id', itemId);

    if (error) throw error;
    toast.success("Commentaire mis à jour");
  } catch (error) {
    toast.error("Erreur lors de la mise à jour du commentaire");
    throw error;
  }
}

// Gestion des catégories
export async function addCategory(data: AddCategoryData) {
  try {
    const { error } = await supabase
      .from('wishlist_categories')
      .insert(data);

    if (error) throw error;
    toast.success("Catégorie ajoutée");
  } catch (error) {
    toast.error("Erreur lors de l'ajout de la catégorie");
    throw error;
  }
}

export async function updateCategoryOrder(categories: UpdateOrderData[]) {
  try {
    const { error } = await supabase
      .from('wishlist_categories')
      .upsert(
        categories.map(({ id, order }) => ({
          id,
          order,
          updated_at: new Date().toISOString(),
        }))
      );

    if (error) throw error;
  } catch (error) {
    toast.error("Erreur lors de la réorganisation des catégories");
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await supabase
      .from('wishlist_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success("Catégorie supprimée");
  } catch (error) {
    toast.error("Erreur lors de la suppression de la catégorie");
    throw error;
  }
}

// Gestion des items
export async function addItem(data: AddItemData) {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .insert(data);

    if (error) throw error;
    toast.success("Cadeau ajouté");
  } catch (error) {
    toast.error("Erreur lors de l'ajout du cadeau");
    throw error;
  }
}

export async function updateItemOrder(items: UpdateOrderData[]) {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .upsert(
        items.map(({ id, order }) => ({
          id,
          order,
          updated_at: new Date().toISOString(),
        }))
      );

    if (error) throw error;
  } catch (error) {
    toast.error("Erreur lors de la réorganisation des cadeaux");
    throw error;
  }
}

export async function deleteItem(id: string) {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast.success("Cadeau supprimé");
  } catch (error) {
    toast.error("Erreur lors de la suppression du cadeau");
    throw error;
  }
}

export async function toggleItemSelection(
  itemId: string,
  isSelected: boolean,
  selectorName?: string
) {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .update({ 
        is_selected: isSelected,
        selector_name: isSelected ? selectorName : null 
      })
      .eq('id', itemId);

    if (error) throw error;
    toast.success(isSelected ? "Cadeau sélectionné" : "Cadeau désélectionné");
  } catch (error) {
    toast.error("Erreur lors de la mise à jour du cadeau");
    throw error;
  }
}