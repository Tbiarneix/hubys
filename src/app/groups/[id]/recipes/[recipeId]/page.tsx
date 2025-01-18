/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  UtensilsCrossed,
  Edit,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { Recipe } from "@/types/group";
import { toast } from "sonner";

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [portions, setPortions] = useState<number | null>(null);

  const groupId = params.id as string;
  const recipeId = params.recipeId as string;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(
          `/api/groups/${groupId}/recipes/${recipeId}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la recette");
        }
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Impossible de charger la recette");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [groupId, recipeId]);

  useEffect(() => {
    if (recipe && portions === null) {
      setPortions(recipe.servings);
    }
  }, [recipe]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/groups/${groupId}/recipes/${recipeId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success("Recette supprimée");
      router.push(`/groups/${groupId}/recipes`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Impossible de supprimer la recette");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Recette non trouvée</p>
      </div>
    );
  }

  const isAuthor = session?.user?.id === recipe.author.id;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Link
        href={`/groups/${groupId}/recipes`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux recettes
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6" />
            {recipe.name}
          </h1>
        </div>
        {isAuthor && (
          <div className="flex items-center gap-2">
            <Link href={`/groups/${groupId}/recipes/${recipeId}/edit`}>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <Edit className="h-4 w-4" />
                Modifier
              </button>
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {recipe.description && (
          <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Description
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {recipe.description}
            </p>
          </div>
        )}

        {recipe.url && (
          <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Source</h2>
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Voir la recette originale
            </a>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Ingrédients</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPortions((prev) =>
                    prev !== null ? Math.max(1, prev - 1) : null
                  )
                }
                className="p-1 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-gray-600">{portions} parts</span>
              <button
                onClick={() =>
                  setPortions((prev) => (prev !== null ? prev + 1 : null))
                }
                className="p-1 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex items-center text-gray-700"
              >
                <span className="font-medium">{ingredient.name}</span>
                <span className="mx-2">:</span>
                <span>
                  {portions !== null
                    ? Math.round(
                        ingredient.quantity * (portions / recipe.servings)
                      )
                    : ingredient.quantity}{" "}
                  {ingredient.unit?.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Étapes</h2>
          <ol className="space-y-4 list-decimal list-inside">
            {recipe.steps.map((step, index) => (
              <li key={index} className="text-gray-700 pl-2">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="text-sm text-gray-500 mt-8">
          Ajoutée par {recipe.author.name} le{" "}
          {new Date(recipe.createdAt).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
