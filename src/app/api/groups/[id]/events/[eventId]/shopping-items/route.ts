import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string; }>
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

    // Récupérer la shopping list de l'événement
    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        eventId: params.eventId,
      },
    });

    if (!shoppingList) {
      return Response.json({ error: "Liste de courses introuvable" }, { status: 404 });
    }

    // Créer le nouvel item
    const newItem = await prisma.shoppingItem.create({
      data: {
        name: data.name,
        quantity: data.quantity || null,
        unit: data.unit || null,
        type: data.type || "OTHER",
        menuId: data.menuId || null,
        shoppingListId: shoppingList.id,
      },
    });

    return Response.json(newItem);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
