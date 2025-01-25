import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
    eventId: string;
    menuId: string;
  }>;
};

// Récupérer tous les items de la liste de courses d'un menu
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

    const shoppingItems = await prisma.shoppingItem .findMany({
      where: {
        menuId: params.menuId,
      },
    });

    return Response.json(shoppingItems);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de la récupération des items" },
      { status: 500 }
    );
  }
}

// Ajouter un nouvel item à la liste de courses
export async function POST(
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

    const shoppingItem = await prisma.shoppingItem.create({
      data: {
        menuId: params.menuId,
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
      { error: "Erreur lors de la création de l'item" },
      { status: 500 }
    );
  }
}
