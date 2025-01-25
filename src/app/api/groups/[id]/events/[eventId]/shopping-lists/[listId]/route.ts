import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string, listId: string }>
}

interface ShoppingListItem {
  name: string;
  quantity?: number;
  unit?: string;
  type?: string;
  checked?: boolean;
}

// Récupérer une liste de courses spécifique
export async function GET(request: NextRequest, context: Params) {
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

    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        id: params.listId,
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!shoppingList) {
      return Response.json({ error: "Liste de courses non trouvée" }, { status: 404 });
    }

    return Response.json(shoppingList);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la récupération de la liste de courses" },
      { status: 500 }
    );
  }
}

// Mettre à jour une liste de courses
export async function PUT(request: NextRequest, context: Params) {
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

    const shoppingList = await prisma.shoppingList.update({
      where: {
        id: params.listId,
      },
      data: {
        name: data.name,
        items: {
          deleteMany: {},
          createMany: {
            data: data.items.map((item: ShoppingListItem) => ({
              name: item.name,
              quantity: item.quantity || null,
              unit: item.unit || null,
              type: item.type || 'OTHER',
              checked: item.checked || false,
            })),
          },
        },
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return Response.json(shoppingList);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la mise à jour de la liste de courses" },
      { status: 500 }
    );
  }
}

// Supprimer une liste de courses
export async function DELETE(request: NextRequest, context: Params) {
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

    await prisma.shoppingList.delete({
      where: {
        id: params.listId,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la suppression de la liste de courses" },
      { status: 500 }
    );
  }
}
