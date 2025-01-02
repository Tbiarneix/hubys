'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
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

export default function WishlistPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<WishList | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

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
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au profil
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">{wishlist.title}</h1>
          {isOwner && (
            <div className="mt-4 flex gap-3">
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
                  <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
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
    </div>
  );
}
