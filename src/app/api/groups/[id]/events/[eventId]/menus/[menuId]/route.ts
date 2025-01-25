import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string, menuId: string }>;
};

interface ShoppingListItem {
  name: string;
  quantity?: number;
  unit?: string;
  type?: string;
  checked?: boolean;
  shoppingListId?: string;
}

// Récupérer un menu spécifique
export async function GET(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const menu = await prisma.menu.findUnique({
      where: {
        id: params.menuId,
      },
      include: {
        recipe: true,
        shoppingItems: true,
      },
    });

    if (!menu) {
      return Response.json({ error: "Menu non trouvé" }, { status: 404 });
    }

    return Response.json(menu);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la récupération du menu" },
      { status: 500 }
    );
  }
}

// Mettre à jour un menu
export async function PUT(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();

    // Vérifier que l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const menu = await prisma.menu.update({
      where: {
        id: params.menuId,
      },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        type: data.type,
        numberOfPeople: data.numberOfPeople,
        name: data.name,
        recipeId: data.recipeId,
        url: data.url,
        shoppingItems: {
          deleteMany: {},
          createMany: {
            data: data.shoppingItems.map((item: ShoppingListItem) => ({
              name: item.name,
              quantity: item.quantity || null,
              unit: item.unit || null,
              type: item.type || 'OTHER',
              shoppingListId: item.shoppingListId
            })),
          },
        },
      },
      include: {
        recipe: true,
        shoppingItems: true,
      },
    });

    return Response.json(menu);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la mise à jour du menu" },
      { status: 500 }
    );
  }
}

// Supprimer un menu
export async function DELETE(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.id,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    await prisma.menu.delete({
      where: {
        id: params.menuId,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la suppression du menu" },
      { status: 500 }
    );
  }
}
