import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string, listId: string, itemId: string }>
}

// Mettre à jour un item de la liste de courses (par exemple pour cocher/décocher)
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

    const item = await prisma.shoppingItem.update({
      where: {
        id: params.itemId,
      },
      data: {
        checked: data.checked,
        quantity: data.quantity || null,
        unit: data.unit || null,
        type: data.type || 'OTHER',
      },
    });

    return Response.json(item);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la mise à jour de l'item" },
      { status: 500 }
    );
  }
}

// Mettre à jour le statut d'un item
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

// Supprimer un item de la liste de courses
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

    await prisma.shoppingItem.delete({
      where: {
        id: params.itemId,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la suppression de l'item" },
      { status: 500 }
    );
  }
}
