import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string }>;
};

// Récupérer tous les menus d'un événement
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

    const menus = await prisma.menu.findMany({
      where: {
        eventId: params.eventId,
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
          create: data.shoppingItems,
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
