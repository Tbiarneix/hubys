"use client";

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus } from 'lucide-react';
import { Recipe, Unit, IngredientType, Menu } from '@/types/group';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

const getUnitLabel = (unit: Unit): string => {
  const labels: Record<Unit, string> = {
    NONE: '-',
    GRAM: 'g',
    KILOGRAM: 'kg',
    MILLILITER: 'ml',
    CENTILITER: 'cl',
    LITER: 'L',
    SPOON: 'cuillère(s)',
    BUNCH: 'botte(s)',
    PACK: 'paquet(s)',
  };
  return labels[unit];
};

interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: Unit;
  type: IngredientType;
  shoppingListId?: string;
}

interface UpdateMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: Menu;
  recipes: Recipe[];
  onUpdate?: () => void;
  shoppingListId?: string;
}

export function UpdateMealModal({ 
  isOpen, 
  onClose, 
  menu,
  recipes,
  onUpdate,
  shoppingListId
}: UpdateMealModalProps) {
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealUrl, setMealUrl] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipesList, setShowRecipesList] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState<Unit>('NONE');
  const [newItemType, setNewItemType] = useState<IngredientType>('OTHER');

  // Initialiser les états avec les données du menu existant
  useEffect(() => {
    if (menu) {
      setMealName(menu.name);
      setMealUrl(menu.url || '');
      setShoppingList(menu.shoppingItems);
      if (menu.recipe) {
        setSelectedRecipe(menu.recipe);
      }
    }
  }, [menu]);

  const handleRecipeSelect = (recipe: Recipe) => {
    setMealName(recipe.name);
    setMealUrl(recipe.url || '');
    setSelectedRecipe(recipe);
    setShowRecipesList(false);

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      // Ajuster les quantités en fonction du nombre de personnes
      const adjustedIngredients = recipe.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity ? 
          (ingredient.quantity * (menu.numberOfPeople / recipe.servings)) : 
          undefined,
        unit: ingredient.unit || 'NONE',
        type: ingredient.type || 'OTHER',
        shoppingListId: shoppingListId
      }));
      setShoppingList(adjustedIngredients);
    }
  };

  const handleAddShoppingItem = () => {
    if (newItemName.trim()) {
      setShoppingList([
        ...shoppingList,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: newItemName.trim(),
          quantity: newItemQuantity ? parseFloat(newItemQuantity) : undefined,
          unit: newItemUnit,
          type: newItemType,
          shoppingListId: shoppingListId
        }
      ]);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemUnit('NONE');
      setNewItemType('OTHER');
    }
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mealName.trim()) {
      toast.error("Le nom du repas est requis");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/groups/${params.id}/events/${params.eventId}/menus/${menu.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: mealName,
            url: mealUrl || null,
            recipeId: selectedRecipe?.id || null,
            shoppingItems: shoppingList,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la modification du repas");
      }

      toast.success("Repas modifié avec succès");
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Impossible de modifier le repas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Modifier le repas
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Nombre de personnes : {menu.numberOfPeople}
              </p>
            </div>

            <div>
              <label
                htmlFor="mealName"
                className="block text-sm font-medium text-gray-700"
              >
                Nom du repas
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="mealName"
                  value={mealName}
                  autoComplete="off"
                  onFocus={() => setShowRecipesList(true)}
                  onChange={(e) => {
                    setMealName(e.target.value);
                    if (selectedRecipe && e.target.value !== selectedRecipe.name) {
                      setSelectedRecipe(null);
                    }
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="Entrez le nom du repas"
                />
                {showRecipesList && recipes.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                    <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                      {recipes
                        .filter(recipe => 
                          !mealName || recipe.name.toLowerCase().includes(mealName.toLowerCase())
                        )
                        .map(recipe => (
                          <li
                            key={recipe.id}
                            className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
                              selectedRecipe?.id === recipe.id ? 'bg-gray-50' : ''
                            }`}
                            onClick={() => handleRecipeSelect(recipe)}
                          >
                            {recipe.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="mealUrl"
                className="block text-sm font-medium text-gray-700"
              >
                URL de la recette (optionnel)
              </label>
              <input
                type="url"
                id="mealUrl"
                value={mealUrl}
                onChange={(e) => setMealUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
              >
                Liste de courses
              </label>
              <div className="mt-2 space-y-3">
                {shoppingList.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.name}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        value={item.quantity !== undefined ? item.quantity : ''}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        value={item.unit ? getUnitLabel(item.unit) : '-'}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveShoppingItem(item.id)}
                      className="p-2 text-gray-500 hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Nom de l'ingrédient"
                      className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      placeholder="Quantité"
                      min="0"
                      step="any"
                      className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div className="w-32">
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value as Unit)}
                      className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="NONE">Sans unité</option>
                      <option value="GRAM">Grammes</option>
                      <option value="KILOGRAM">Kilogrammes</option>
                      <option value="MILLILITER">Millilitres</option>
                      <option value="CENTILITER">Centilitres</option>
                      <option value="LITER">Litres</option>
                      <option value="SPOON">Cuillère</option>
                      <option value="BUNCH">Botte</option>
                      <option value="PACK">Paquet</option>
                    </select>
                  </div>
                  <div className="w-32">
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value as IngredientType)}
                      className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="VEGETABLE">Légumes</option>
                      <option value="FRUIT">Fruits</option>
                      <option value="MEAT">Viande</option>
                      <option value="FISH">Poisson</option>
                      <option value="DAIRY">Produits laitiers</option>
                      <option value="GROCERY">Épicerie</option>
                      <option value="BAKERY">Boulangerie</option>
                      <option value="BEVERAGE">Boissons</option>
                      <option value="CONDIMENT">Condiments</option>
                      <option value="OTHER">Sans categorie</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddShoppingItem}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? "Modification..." : "Modifier"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
