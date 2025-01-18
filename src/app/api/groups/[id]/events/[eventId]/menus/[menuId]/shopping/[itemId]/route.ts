import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
    eventId: string;
    menuId: string;
    itemId: string;
  }>;
};

// Récupérer un item spécifique
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

    const shoppingItem = await prisma.shoppingItem.findUnique({
      where: {
        id: params.itemId,
      },
    });

    if (!shoppingItem) {
      return Response.json({ error: "Item non trouvé" }, { status: 404 });
    }

    return Response.json(shoppingItem);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la récupération de l'item" },
      { status: 500 }
    );
  }
}

// Mettre à jour un item
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

    const shoppingItem = await prisma.shoppingItem.update({
      where: {
        id: params.itemId,
      },
      data: {
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        type: data.type,
      },
    });

    return Response.json(shoppingItem);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la mise à jour de l'item" },
      { status: 500 }
    );
  }
}

// Supprimer un item
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
