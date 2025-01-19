"use client";

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus } from 'lucide-react';
import { Recipe, Unit, MealType, IngredientType, RecipeCategory } from '@/types/group';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { Switch } from '@headlessui/react';

const UNITS: Unit[] = ['NONE', 'GRAM', 'KILOGRAM', 'MILLILITER', 'CENTILITER', 'LITER', 'SPOON', 'BUNCH', 'PACK'];

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
}

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  mealType: MealType;
  recipes: Recipe[];
  numberOfPeople: number;
  onAdd?: () => void;
}

export function AddMealModal({ 
  isOpen, 
  onClose, 
  date, 
  mealType,
  recipes,
  numberOfPeople,
  onAdd 
}: AddMealModalProps) {
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
  const [addToRecipes, setAddToRecipes] = useState(false);

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
          (ingredient.quantity * (numberOfPeople / recipe.servings)) : 
          undefined,
        unit: ingredient.unit || 'NONE',
        type: 'OTHER' as IngredientType // Par défaut, on met OTHER car on n'a pas cette info dans la recette
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
          type: newItemType
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

    try {
      setIsSubmitting(true);

      // Si on doit créer une nouvelle recette
      if (addToRecipes && !selectedRecipe) {
        const recipeResponse = await fetch(`/api/groups/${params.id}/recipes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: mealName,
            url: mealUrl || null,
            description: null,
            servings: numberOfPeople,
            steps: [],
            category: 'OTHER' as RecipeCategory,
          }),
        });

        if (!recipeResponse.ok) {
          throw new Error("Erreur lors de la création de la recette");
        }

        const newRecipe = await recipeResponse.json();
        setSelectedRecipe(newRecipe);
      }

      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date.toISOString(),
          type: mealType,
          numberOfPeople,
          name: mealName,
          url: mealUrl || null,
          recipeId: selectedRecipe?.id,
          shoppingItems: shoppingList.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            type: item.type
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du menu");
      }

      toast.success("Menu ajouté avec succès");
      onAdd?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erreur lors de la création du menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-8 text-gray-900 shadow max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold">
              Ajouter un repas
            </Dialog.Title>
            <button
              className="rounded-full p-1 hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Nombre de personnes : {numberOfPeople}
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
                  onChange={(e) => {
                    setMealName(e.target.value);
                    setShowRecipesList(true);
                    if (selectedRecipe && e.target.value !== selectedRecipe.name) {
                      setSelectedRecipe(null);
                    }
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="Entrez le nom du repas"
                />
                {showRecipesList && mealName && recipes.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                    <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                      {recipes
                        .filter(recipe => 
                          recipe.name.toLowerCase().includes(mealName.toLowerCase())
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

            {!selectedRecipe && (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={addToRecipes}
                  onChange={setAddToRecipes}
                  className={`${
                    addToRecipes ? 'bg-gray-800' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      addToRecipes ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
                <label className="text-sm text-gray-700">
                  Ajouter cette recette au livre de recettes
                </label>
              </div>
            )}

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
              >
                Liste de courses
              </label>
              <div className="mt-2 space-y-3">
                {shoppingList.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm">
                      {item.quantity && item.unit ? 
                        `${item.name} - ${item.quantity} ${getUnitLabel(item.unit)}` : 
                        item.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveShoppingItem(item.id)}
                      className="rounded-full p-1 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Nom de l'ingrédient"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                  <input
                    type="text"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="Qté"
                    className="w-16 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as Unit)}
                    className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>
                        {getUnitLabel(unit)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as IngredientType)}
                    className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
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
                  <button
                    type="button"
                    onClick={handleAddShoppingItem}
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Ajout en cours..." : "Ajouter"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
