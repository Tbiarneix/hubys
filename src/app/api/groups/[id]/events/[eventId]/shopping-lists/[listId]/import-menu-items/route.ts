import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; eventId: string, listId: string }>
}

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
    const { menuIds } = data;

    // Récupérer les items des menus qui ne sont pas déjà dans la liste
    const menuItems = await prisma.shoppingItem.findMany({
      where: {
        menuId: {
          in: menuIds
        },
        shoppingListId: null // Seulement les items qui ne sont pas déjà dans une liste
      }
    });

    // Ajouter les items à la liste de courses
    const updatedList = await prisma.shoppingList.update({
      where: {
        id: params.listId,
      },
      data: {
        items: {
          connect: menuItems.map(item => ({ id: item.id }))
        }
      },
      include: {
        items: {
          include: {
            menu: true
          }
        }
      }
    });

    return Response.json(updatedList);
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Erreur lors de l'importation des items" },
      { status: 500 }
    );
  }
}
