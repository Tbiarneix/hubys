import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string; listId: string; itemId?: string; }>
}

// Ajouter un nouvel item à la liste de courses
export async function POST(request: NextRequest, context: Params) {
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

    const data = await request.json();

    // Créer le nouvel item
    const newItem = await prisma.shoppingItem.create({
      data: {
        name: data.name,
        quantity: data.quantity === null ? null : Number(data.quantity),
        unit: data.unit,
        type: data.type || 'OTHER',
        menuId: data.menuId,
        shoppingListId: params.listId,
      },
    });

    return Response.json(newItem);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Récupérer les items d'une liste de courses
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

    // Récupérer les items de la liste
    const items = await prisma.shoppingItem.findMany({
      where: {
        shoppingListId: params.listId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json(items);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Mettre à jour un item de la liste de courses
export async function PATCH(request: NextRequest, context: Params) {
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

    const data = await request.json();

    // Mettre à jour l'item
    const updatedItem = await prisma.shoppingItem.update({
      where: {
        id: params.itemId,
      },
      data: {
        checked: data.checked,
      },
    });

    return Response.json(updatedItem);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
