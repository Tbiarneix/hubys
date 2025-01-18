"use client";

import {
  UtensilsCrossed,
  ChevronRight,
  Heart,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Recipe, RecipeCategory } from "@/types/group";
import { toast } from "sonner";

interface RecipeCardProps {
  groupId: string;
  recipe?: Recipe;
  currentUserId?: string;
  onToggleFavorite?: (recipeId: string) => void;
}

const getCategoryLabel = (category: RecipeCategory): string => {
  switch (category) {
    case "STARTER":
      return "Entrée";
    case "MAIN":
      return "Plat principal";
    case "DESSERT":
      return "Dessert";
    case "SIDE":
      return "Accompagnement";
    case "BREAKFAST":
      return "Petit-déjeuner";
    case "SNACK":
      return "En-cas";
    case "DRINK":
      return "Boisson";
    case "OTHER":
      return "Autre";
  }
};

export default function RecipeCard({
  groupId,
  recipe,
  currentUserId,
  onToggleFavorite,
}: RecipeCardProps) {
  if (!recipe) {
    return (
      <div className="bg-gray-50 px-6 py-4 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Livre de recettes
          </h2>
          <div className="flex items-center gap-2">
            <Link href={`/groups/${groupId}/recipes`}>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Accéder aux recettes
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFavorited =
    (currentUserId &&
      recipe.favorites?.some((f) => f.userId === currentUserId)) ||
    false;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId || !onToggleFavorite) return;

    try {
      const response = await fetch(
        `/api/groups/${groupId}/recipes/${recipe.id}/favorite`,
        {
          method: isFavorited ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: currentUserId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      onToggleFavorite(recipe.id);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Impossible de modifier les favoris");
    }
  };

  return (
    <div className="block relative group p-4 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors ">
      <Link
        href={`/groups/${groupId}/recipes/${recipe.id}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{recipe.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {getCategoryLabel(recipe.category)} • Ajoutée par{" "}
              {recipe.author.name}
            </p>
          </div>
          {currentUserId && (
            <button
              onClick={handleFavoriteClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorited
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
            </button>
          )}
        </div>
        {recipe.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {recipe.description}
          </p>
        )}
      </Link>
      {recipe.url && (
        <div className="absolute bottom-4 right-4">
          <a
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Voir
          </a>
        </div>
      )}
    </div>
  );
}
