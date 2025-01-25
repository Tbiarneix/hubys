import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MenuCalendar from "./MenuCalendar";
import {
  Recipe,
  RecipeCategory,
  Menu,
  MealType,
  Unit,
  IngredientType,
} from "@/types/group";

interface MenusPageProps {
  params: Promise<{
    id: string;
    eventId: string;
  }>;
}

export default async function MenusPage(props: MenusPageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      groupId: params.id,
    },
    include: {
      group: {
        include: {
          recipes: {
            include: {
              ingredients: true,
              favorites: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      subgroups: {
        include: {
          presences: true,
        },
      },
      presences: true,
      menus: {
        select: {
          id: true,
          name: true,
          date: true,
          type: true,
          numberOfPeople: true,
          eventId: true,
          recipeId: true,
          url: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          recipe: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          shoppingItems: {
            select: {
              id: true,
              menuId: true,
              name: true,
              quantity: true,
              unit: true,
              type: true,
              checked: true,
              shoppingListId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      shoppingList: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!event) {
    redirect(`/groups/${params.id}`);
  }

  if (!event.hasMenus) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
  }

  if (!event.shoppingList) {
    redirect(`/groups/${params.id}/events/${params.eventId}`);
  }

  // Convertir les dates et formater les recettes selon notre type Recipe
  const formattedRecipes: Recipe[] = event.group.recipes.map((recipe) => {
    // S'assurer que l'auteur a un nom valide
    const authorName = recipe.author?.name || "Utilisateur inconnu";

    return {
      id: recipe.id,
      name: recipe.name,
      url: recipe.url,
      description: recipe.description,
      servings: recipe.servings,
      steps: recipe.steps,
      groupId: recipe.groupId,
      authorId: recipe.authorId,
      category: recipe.category as RecipeCategory,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
      ingredients: recipe.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit as Unit,
        type: ingredient.type,
        recipeId: ingredient.recipeId,
        createdAt: ingredient.createdAt.toISOString(),
        updatedAt: ingredient.updatedAt.toISOString(),
      })),
      favorites: recipe.favorites.map((favorite) => ({
        id: favorite.id,
        userId: favorite.userId,
        recipeId: favorite.recipeId,
        createdAt: favorite.createdAt.toISOString(),
      })),
      author: {
        id: recipe.author?.id || recipe.authorId,
        name: authorName,
      },
    };
  });

  // Convertir les menus au bon format
  const formattedMenus: Menu[] = event.menus.map((menu) => ({
    id: menu.id,
    eventId: menu.eventId,
    date: menu.date.toISOString(),
    type: menu.type as MealType,
    numberOfPeople: menu.numberOfPeople,
    name: menu.name,
    recipeId: menu.recipeId || undefined,
    url: menu.url || undefined,
    userId: menu.userId,
    recipe: menu.recipe
      ? {
          id: menu.recipe.id,
          name: menu.recipe.name,
          url: menu.recipe.url,
          description: menu.recipe.description,
          servings: menu.recipe.servings,
          steps: menu.recipe.steps,
          groupId: menu.recipe.groupId,
          authorId: menu.recipe.authorId,
          category: menu.recipe.category as RecipeCategory,
          createdAt: menu.recipe.createdAt.toISOString(),
          updatedAt: menu.recipe.updatedAt.toISOString(),
          ingredients: [], // La recette dans le menu n'a pas besoin des ingrédients
          favorites: [], // La recette dans le menu n'a pas besoin des favoris
          author: menu.recipe.author
            ? {
                id: menu.recipe.author.id,
                name: menu.recipe.author.name || "Utilisateur inconnu",
              }
            : {
                id: menu.recipe.authorId,
                name: "Utilisateur inconnu",
              },
        }
      : undefined,
    user: {
      id: menu.user.id,
      name: menu.user.name || "Utilisateur inconnu",
    },
    shoppingItems: menu.shoppingItems.map((item) => ({
      id: item.id,
      menuId: item.menuId || menu.id,
      name: item.name,
      quantity: item.quantity || undefined,
      unit: (item.unit as Unit) || undefined,
      type: item.type as IngredientType,
      checked: item.checked,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    shoppingListId: event.shoppingList?.id,
    createdAt: menu.createdAt.toISOString(),
    updatedAt: menu.updatedAt.toISOString(),
  }));

  const shoppingListId = event.shoppingList.id;

  return (
    <MenuCalendar
      startDate={event.startDate}
      endDate={event.endDate}
      recipes={formattedRecipes}
      menus={formattedMenus}
      subgroups={event.subgroups}
      presences={event.presences}
      groupMembers={event.group.members.map((member) => ({
        user: {
          id: member.user.id,
          name: member.user.name || "Inconnu",
        },
      }))}
      shoppingListId={shoppingListId}
    />
  );
}
