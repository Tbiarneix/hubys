import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string }>;
};

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  type: string;
  shoppingListId: string;
}

// Récupérer les menus
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

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const type = searchParams.get('type');

    // Construire la requête avec les filtres optionnels
    const where: {
      eventId: string;
      date?: Date;
      type?: string;
    } = {
      eventId: params.eventId,
    };

    if (date) {
      where.date = new Date(date);
    }

    if (type) {
      where.type = type;
    }

    // Récupérer les menus
    const menus = await prisma.menu.findMany({
      where,
      include: {
        recipe: true,
        shoppingItems: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return Response.json(menus);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la récupération des menus" },
      { status: 500 }
    );
  }
}

// Créer un nouveau menu
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

    const menu = await prisma.menu.create({
      data: {
        eventId: params.eventId,
        date: new Date(data.date),
        type: data.type,
        numberOfPeople: data.numberOfPeople,
        name: data.name,
        recipeId: data.recipeId,
        url: data.url,
        userId: session.user.id,
        shoppingItems: {
          create: data.shoppingItems.map((item: ShoppingItem) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            type: item.type,
            shoppingListId: item.shoppingListId
          }))
        },
      },
      include: {
        recipe: true,
        shoppingItems: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return Response.json(menu);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la création du menu" },
      { status: 500 }
    );
  }
}
