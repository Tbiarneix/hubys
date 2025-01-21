import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string }>;
};

interface ShoppingListItem {
  name: string;
  quantity?: number;
  unit?: string;
  type?: string;
  checked?: boolean;
}

// Récupérer toutes les listes de courses d'un événement
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

    const shoppingLists = await prisma.shoppingList.findMany({
      where: {
        eventId: params.eventId,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return Response.json(shoppingLists);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la récupération des listes de courses" },
      { status: 500 }
    );
  }
}

// Créer une nouvelle liste de courses
export async function POST(request: NextRequest, context: Params) {
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

    const shoppingList = await prisma.shoppingList.create({
      data: {
        eventId: params.eventId,
        name: data.name,
        items: {
          create:
            data.items?.map((item: ShoppingListItem) => ({
              name: item.name,
              quantity: item.quantity || null,
              unit: item.unit || null,
              type: item.type || "OTHER",
              checked: item.checked || false,
            })) || [],
        },
      },
      include: {
        items: true,
      },
    });

    return Response.json(shoppingList);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la création de la liste de courses" },
      { status: 500 }
    );
  }
}
