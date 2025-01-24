import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string; }>
}

// Mettre à jour les quantités des menus et des ingrédients
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
    const { date, type, numberOfPeople } = data;

    console.log('Updating menu quantities:', { date, type, numberOfPeople, eventId: params.eventId });

    // Récupérer le menu pour cette date et ce type
    const menu = await prisma.menu.findFirst({
      where: {
        eventId: params.eventId,
        date: new Date(date),
        type,
      },
      include: {
        shoppingItems: true,
      },
    });

    console.log('Found menu:', menu);

    if (!menu) {
      return Response.json({ error: "Menu introuvable" }, { status: 404 });
    }

    // Calculer le ratio pour ajuster les quantités
    const ratio = numberOfPeople / (menu.numberOfPeople || 1);

    console.log('Updating quantities with ratio:', ratio);

    // Mettre à jour le menu et ses ingrédients
    const updatedMenu = await prisma.menu.update({
      where: {
        id: menu.id,
      },
      data: {
        numberOfPeople: Math.round(numberOfPeople),
        shoppingItems: {
          updateMany: menu.shoppingItems.map(item => ({
            where: { id: item.id },
            data: {
              quantity: item.quantity ? Math.round((item.quantity * ratio) * 100) / 100 : null,
            },
          })),
        },
      },
      include: {
        shoppingItems: true,
      },
    });

    console.log('Updated menu:', updatedMenu);

    return Response.json(updatedMenu);
  } catch (error) {
    console.error('Error updating quantities:', error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
