import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string }>
}

// Obtenir la liste de courses de l'événement
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

    // Obtenir la liste de courses avec tous les items
    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        eventId: params.eventId,
      },
      include: {
        items: {
          include: {
            menu: true
          }
        }
      }
    });

    // Si la liste n'existe pas, la créer
    if (!shoppingList) {
      const newShoppingList = await prisma.shoppingList.create({
        data: {
          eventId: params.eventId,
        },
        include: {
          items: {
            include: {
              menu: true
            }
          }
        }
      });
      return Response.json(newShoppingList);
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

// Mettre à jour un item de la liste de courses
export async function PUT(request: NextRequest, context: Params) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const { itemId, ...updateData } = data;

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

    const updatedItem = await prisma.shoppingItem.update({
      where: {
        id: itemId,
      },
      data: updateData,
    });

    return Response.json(updatedItem);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la mise à jour de l'item" },
      { status: 500 }
    );
  }
}
