'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UtensilsCrossed, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Recipe, RecipeCategory } from '@/types/group';
import RecipeCard from '@/components/groups/RecipeCard';
import RecipeFilters from '@/components/groups/RecipeFilters';
import {toast} from 'sonner';

export default function RecipesPage() {
  const { data: session } = useSession();
  const params = useParams();
  const groupId = params.id as string;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'ALL' | 'FAVORITES'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}/recipes`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Impossible de charger les recettes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [groupId]);

  const handleToggleFavorite = (recipeId: string) => {
    const userId = session?.user?.id;
    if (!userId) return; // Don't proceed if user is not authenticated

    setRecipes(recipes.map(recipe => {
      if (recipe.id !== recipeId) return recipe;

      const isFavorited = recipe.favorites.some(f => f.userId === userId);
      const updatedFavorites = isFavorited
        ? recipe.favorites.filter(f => f.userId !== userId)
        : [...recipe.favorites, {
            id: Math.random().toString(), // Temporaire, sera remplacé par le serveur
            userId,
            recipeId,
            createdAt: new Date().toISOString(),
          }];

      return {
        ...recipe,
        favorites: updatedFavorites,
      };
    }));
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedCategory === 'FAVORITES') {
      return matchesSearch && recipe.favorites?.some(f => f.userId === session?.user?.id);
    }
    
    const matchesCategory = selectedCategory === 'ALL' || recipe.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-6 max-w-4xl">
        <Link className='inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900' href={`/groups/${groupId}`}>
          <ArrowLeft className="h-4 w-4" />
          Retour au groupe
        </Link>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6" />
          Livre de recettes
        </h1>
        <Link
          href={`/groups/${groupId}/recipes/new`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
          Nouvelle recette
        </Link>
      </div>

      <RecipeFilters
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        currentUserId={session?.user?.id}
      />

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              groupId={groupId}
              currentUserId={session?.user?.id}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery || selectedCategory !== 'ALL'
              ? "Aucune recette ne correspond à vos critères de recherche."
              : "Aucune recette n'a encore été ajoutée."}
          </p>
        </div>
      )}
    </div>
  );
}
