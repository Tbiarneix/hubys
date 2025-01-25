"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Minus, Save, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Unit, IngredientType } from "@prisma/client";
import { Recipe } from "@/types/group";

interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: Unit | null;
  type: IngredientType;
}

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const recipeId = params.recipeId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: 0, unit: null, type: "OTHER" },
  ]);
  const [steps, setSteps] = useState<string[]>([""]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(
          `/api/groups/${groupId}/recipes/${recipeId}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la recette");
        }
        const recipe: Recipe = await response.json();

        setName(recipe.name);
        setUrl(recipe.url || "");
        setDescription(recipe.description || "");
        setServings(recipe.servings);
        setIngredients(recipe.ingredients);
        setSteps(recipe.steps);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Impossible de charger la recette");
        router.push(`/groups/${groupId}/recipes/${recipeId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [groupId, recipeId, router]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 0, unit: null, type: "OTHER" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: Ingredient[keyof Ingredient]
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de base
    if (!name.trim()) {
      toast.error("Le nom de la recette est requis");
      return;
    }

    // Filtrer les ingrédients vides
    const validIngredients = ingredients.filter(i => i.name.trim() !== "");
    // Filtrer les étapes vides
    const validSteps = steps.filter(s => s.trim() !== "");

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/recipes/${recipeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            url: url || null,
            description: description || null,
            servings,
            ingredients: validIngredients.map((i) => ({
              name: i.name.trim(),
              quantity: parseFloat(i.quantity.toString()),
              unit: i.unit,
              type: i.type,
            })),
            steps: validSteps,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la modification de la recette");
      }

      toast.success("Recette modifiée avec succès");
      router.push(`/groups/${groupId}/recipes/${recipeId}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Impossible de modifier la recette");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Link
        href={`/groups/${groupId}/recipes/${recipeId}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour à la recette
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6" />
            Modifier la recette
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom de la recette *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL de la recette originale
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Quelques infos sur la recette ?
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label
                htmlFor="servings"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de parts
              </label>
              <input
                type="number"
                id="servings"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value))}
                min="1"
                className="w-32 px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Ingrédients
          </h2>
          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    placeholder="Nom de l'ingrédient"
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      updateIngredient(
                        index,
                        "quantity",
                        parseFloat(e.target.value)
                      )
                    }
                    min="0"
                    step="any"
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div className="w-40">
                  <select
                    value={ingredient.unit || "NONE"}
                    onChange={(e) =>
                      updateIngredient(
                        index,
                        "unit",
                        e.target.value === "NONE" ? null : e.target.value
                      )
                    }
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
                <div className="w-40">
                  <select
                    value={ingredient.type}
                    onChange={(e) =>
                      updateIngredient(index, "type", e.target.value)
                    }
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
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-gray-500 hover:text-red-600"
                  disabled={ingredients.length === 1}
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter un ingrédient
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Étapes</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <span className="mt-2 text-gray-500 w-6">{index + 1}.</span>
                <div className="flex-1">
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-2 text-gray-500 hover:text-red-600"
                  disabled={steps.length === 1}
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter une étape
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href={`/groups/${groupId}/recipes/${recipeId}`}>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
