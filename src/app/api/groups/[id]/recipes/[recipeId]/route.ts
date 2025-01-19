import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ingredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  quantity: z.number().min(0, "La quantité doit être positive"),
  unit: z.enum(["NONE", "GRAM", "KILOGRAM", "MILLILITER", "CENTILITER", "LITER", "SPOON", "BUNCH", "PACK"]).nullable(),
  type: z.enum(["VEGETABLE", "FRUIT", "MEAT", "FISH", "DAIRY", "GROCERY", "BAKERY", "BEVERAGE", "CONDIMENT", "OTHER"]).default("OTHER"),
});

const recipeSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  url: z.string().url().nullable(),
  description: z.string().nullable(),
  servings: z.number().min(1, "Le nombre de parts doit être au moins 1"),
  steps: z.array(z.string()).optional().default([]),
  ingredients: z.array(ingredientSchema).optional().default([]),
});

type Params = {
  params: Promise<{ id: string; recipeId: string }>
}

export async function GET(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { id: groupId, recipeId } = params;

    // Vérifier si l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
        groupId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        ingredients: true,
      },
    });

    if (!recipe) {
      return new NextResponse("Recette non trouvée", { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("[RECIPE_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { id: groupId, recipeId } = params;

    // Vérifier si l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    // Vérifier si la recette existe et appartient à l'utilisateur
    const existingRecipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
        groupId,
      },
    });

    if (!existingRecipe) {
      return new NextResponse("Recette non trouvée", { status: 404 });
    }

    if (existingRecipe.authorId !== session.user.id) {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    const json = await request.json();
    const body = recipeSchema.parse(json);

    // Mettre à jour la recette et ses ingrédients
    const recipe = await prisma.$transaction(async (tx) => {
      // Supprimer les ingrédients existants
      await tx.ingredient.deleteMany({
        where: {
          recipeId,
        },
      });

      // Mettre à jour la recette avec les nouveaux ingrédients
      return tx.recipe.update({
        where: {
          id: recipeId,
        },
        data: {
          name: body.name,
          url: body.url,
          description: body.description,
          servings: body.servings,
          steps: body.steps,
          ingredients: {
            create: body.ingredients,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          ingredients: true,
        },
      });
    });

    return NextResponse.json(recipe);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 });
    }

    console.error("[RECIPE_PUT]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { id: groupId, recipeId } = params;

    // Vérifier si l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    // Vérifier si la recette existe et appartient à l'utilisateur
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
        groupId,
      },
    });

    if (!recipe) {
      return new NextResponse("Recette non trouvée", { status: 404 });
    }

    if (recipe.authorId !== session.user.id) {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    await prisma.recipe.delete({
      where: {
        id: recipeId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[RECIPE_DELETE]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
