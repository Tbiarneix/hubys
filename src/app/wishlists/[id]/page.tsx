'use client';

import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Share2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AddItemModal } from '@/components/wishlists/AddItemModal';
import { AddCategoryModal } from '@/components/wishlists/AddCategoryModal';
import { DraggableItem } from '@/components/wishlists/DraggableItem';
import { EditItemModal } from '@/components/wishlists/EditItemModal';
import { EditWishlistModal } from '@/components/wishlists/EditWishlistModal';
import { EditCategoryModal } from '@/components/wishlists/EditCategoryModal';
import { DeleteConfirmationModal } from '@/components/wishlists/DeleteConfirmationModal';
import { ResetReservationModal } from '@/components/wishlists/ResetReservationModal';

interface WishList {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  order: number;
}

interface WishlistItem {
  id: string;
  name: string;
  url: string | null;
  comment: string | null;
  order: number;
  categoryId: string | null;
}

export default function WishlistPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<WishList | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [isEditWishlistModalOpen, setIsEditWishlistModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [selectedItemToReset, setSelectedItemToReset] = useState<WishlistItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isOwner = wishlist?.userId === session?.user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wishlistRes, categoriesRes, itemsRes] = await Promise.all([
          fetch(`/api/wishlists/${params.id}`),
          fetch(`/api/wishlists/${params.id}/categories`),
          fetch(`/api/wishlists/${params.id}/items`),
        ]);

        if (!wishlistRes.ok) throw new Error('Failed to fetch wishlist');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        if (!itemsRes.ok) throw new Error('Failed to fetch items');

        const [wishlistData, categoriesData, itemsData] = await Promise.all([
          wishlistRes.json(),
          categoriesRes.json(),
          itemsRes.json(),
        ]);

        setWishlist(wishlistData);
        setCategories(categoriesData);
        setItems(itemsData);
      } catch (err) {
        setError('Une erreur est survenue lors du chargement de la liste');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [params.id, session]);

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!event.active || !event.over || !isOwner) return;

    const oldIndex = items.findIndex(item => item.id === event.active.id);
    const newIndex = items.findIndex(item => item.id === event.over?.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Update orders in the backend
    try {
      await fetch(`/api/wishlists/${params.id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: newItems.map((item, index) => ({
            id: item.id,
            order: index,
            categoryId: item.categoryId,
          })),
        }),
      });
    } catch (error) {
      console.error('Error updating item orders:', error);
      // Revert the UI if the API call fails
      setItems(items);
    }
  };

  const handleAddItem = async (itemData: { name: string; url?: string; comment?: string; categoryId?: string }) => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) throw new Error('Failed to add item');

      const newItem = await response.json();
      setItems([...items, newItem]);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to add category');

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEditItem = async (item: WishlistItem) => {
    setSelectedItem(item);
    setIsEditItemModalOpen(true);
  };

  const handleSaveEditedItem = async (editedItem: { id: string; name: string; url?: string; comment?: string; categoryId?: string }) => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}/items/${editedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedItem),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const updatedItem = await response.json();
      setItems(items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleSaveWishlist = async (data: { title: string; description: string | null }) => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update wishlist');

      const updatedWishlist = await response.json();
      setWishlist(updatedWishlist);
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: { id: string; name: string; description: string | null }) => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}/categories/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update category');

      const updatedCategory = await response.json();
      setCategories(categories.map(category => 
        category.id === updatedCategory.id ? updatedCategory : category
      ));
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmationOpen(true);
  };

  const handleDeleteWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete wishlist');

      // Rediriger vers la page de profil
      window.location.href = '/profile';
    } catch (err) {
      console.error('Error deleting wishlist:', err);
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}/share`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du partage de la liste');
      }
      
      const { publicId } = await response.json();
      const shareUrl = `${window.location.origin}/shared/${publicId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      window.open(`/shared/${publicId}`, '_blank');
    } catch (error) {
      console.error('Error sharing wishlist:', error);
    }
  };

  const handleResetReservation = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}/items/${itemId}/reset-reservation`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        throw new Error('Failed to reset reservation');
      }

      // Refresh the data
      const fetchData = async () => {
        try {
          const [wishlistRes, categoriesRes, itemsRes] = await Promise.all([
            fetch(`/api/wishlists/${params.id}`),
            fetch(`/api/wishlists/${params.id}/categories`),
            fetch(`/api/wishlists/${params.id}/items`),
          ]);

          if (!wishlistRes.ok) throw new Error('Failed to fetch wishlist');
          if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
          if (!itemsRes.ok) throw new Error('Failed to fetch items');

          const [wishlistData, categoriesData, itemsData] = await Promise.all([
            wishlistRes.json(),
            categoriesRes.json(),
            itemsRes.json(),
          ]);

          setWishlist(wishlistData);
          setCategories(categoriesData);
          setItems(itemsData);
        } catch (err) {
          setError('Une erreur est survenue lors du chargement de la liste');
          console.error('Error fetching data:', err);
        } finally {
          setIsLoading(false);
        }
      };

      if (session) {
        fetchData();
      }
    } catch (error) {
      console.error('Error resetting reservation:', error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-900">Chargement...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/");
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-900">Liste introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au profil
            </Link>
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer la liste
              </button>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-black">{wishlist.title}</h1>
                {isOwner && (
                  <button
                    onClick={() => setIsEditWishlistModalOpen(true)}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil className="h-5 w-5 text-gray-500" />
                  </button>
                )}
              </div>
              {wishlist.description && (
                <p className="mt-2 text-gray-600">{wishlist.description}</p>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="mt-4 flex justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un cadeau
                </button>
                <button
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une catégorie
                </button>
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager la liste
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map(category => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                        {isOwner && (
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1.5 hover:bg-gray-100 rounded-full"
                          >
                            <Pencil className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                      {category.description && (
                        <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  </div>
                  {items
                    .filter(item => item.categoryId === category.id)
                    .map(item => (
                      <DraggableItem
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        url={item.url}
                        comment={item.comment}
                        onDelete={isOwner ? () => handleDeleteItem(item.id) : undefined}
                        onEdit={isOwner ? () => handleEditItem(item) : undefined}
                        onResetReservation={isOwner ? () => setSelectedItemToReset(item) : undefined}
                        isOwner={isOwner}
                      />
                    ))}
                </div>
              ))}

              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Sans catégorie</h2>
                {items
                  .filter(item => !item.categoryId)
                  .map(item => (
                    <DraggableItem
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      url={item.url}
                      comment={item.comment}
                      onDelete={isOwner ? () => handleDeleteItem(item.id) : undefined}
                      onEdit={isOwner ? () => handleEditItem(item) : undefined}
                      onResetReservation={isOwner ? () => setSelectedItemToReset(item) : undefined}
                      isOwner={isOwner}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
        categories={categories}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAdd={handleAddCategory}
      />

      <EditItemModal
        isOpen={isEditItemModalOpen}
        onClose={() => {
          setIsEditItemModalOpen(false);
          setSelectedItem(null);
        }}
        onEdit={handleSaveEditedItem}
        categories={categories}
        item={selectedItem}
      />

      <EditWishlistModal
        isOpen={isEditWishlistModalOpen}
        onClose={() => setIsEditWishlistModalOpen(false)}
        onEdit={handleSaveWishlist}
        wishlist={wishlist}
      />

      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        onEdit={handleSaveCategory}
        category={selectedCategory}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={handleDeleteWishlist}
        title="Supprimer la liste"
        description="Êtes-vous sûr de vouloir supprimer cette liste ? Cette action est irréversible et supprimera tous les cadeaux et catégories associés."
      />

      {selectedItemToReset && (
        <ResetReservationModal
          isOpen={!!selectedItemToReset}
          onClose={() => setSelectedItemToReset(null)}
          onConfirm={() => {
            handleResetReservation(selectedItemToReset.id);
            setSelectedItemToReset(null);
          }}
          itemName={selectedItemToReset.name}
        />
      )}
    </div>
  );
}
