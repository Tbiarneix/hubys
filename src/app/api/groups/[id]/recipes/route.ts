import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ingredientSchema = z.object({
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
  category: z.enum(["STARTER", "MAIN", "DESSERT", "SIDE", "BREAKFAST", "SNACK", "DRINK", "OTHER"]).default("OTHER"),
  ingredients: z.array(ingredientSchema).optional().default([]),
});

type Params = {
  params: Promise<{ id: string }>
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

    const groupId = params.id;

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

    const recipes = await prisma.recipe.findMany({
      where: {
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
        favorites: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("[RECIPES_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const groupId = params.id;

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

    const json = await request.json();
    const body = recipeSchema.parse(json);

    const recipe = await prisma.recipe.create({
      data: {
        name: body.name,
        url: body.url,
        description: body.description,
        servings: body.servings,
        steps: body.steps,
        category: body.category,
        group: {
          connect: { id: groupId },
        },
        author: {
          connect: { id: session.user.id },
        },
        ingredients: {
          create: body.ingredients.map((ingredient) => ({
            ...ingredient,
            userId: session.user.id,
          })),
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

    return NextResponse.json(recipe);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 });
    }

    console.error("[RECIPES_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
