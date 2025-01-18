import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

type Params = {
  params: Promise<{ id: string; recipeId: string }>
}

export async function POST(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { id: groupId, recipeId } = params;

    // Vérifier que la recette existe et appartient au groupe
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        groupId,
      },
    });

    if (!recipe) {
      return new NextResponse('Recipe not found', { status: 404 });
    }

    // Vérifier que l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId,
        groupId,
      },
    });

    if (!membership) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Créer le favori
    const favorite = await prisma.recipeFavorite.create({
      data: {
        userId,
        recipeId,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('[RECIPE_FAVORITE_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { id: groupId, recipeId } = params;

    // Vérifier que la recette existe et appartient au groupe
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        groupId,
      },
    });

    if (!recipe) {
      return new NextResponse('Recipe not found', { status: 404 });
    }

    // Supprimer le favori
    await prisma.recipeFavorite.deleteMany({
      where: {
        userId,
        recipeId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[RECIPE_FAVORITE_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
