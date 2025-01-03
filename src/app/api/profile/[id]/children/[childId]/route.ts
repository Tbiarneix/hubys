import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; childId: string } }
) {
  const { id, childId } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { deleteCompletely } = await request.json();

    // Récupérer l'enfant avec ses relations parent
    const child = await prisma.child.findUnique({
      where: {
        id: childId,
      },
      include: {
        parent: true,
      },
    });

    if (!child) {
      return new NextResponse("Child not found", { status: 404 });
    }

    if (deleteCompletely) {
      // Suppression complète de l'enfant
      await prisma.child.delete({
        where: {
          id: childId,
        },
      });
    } else {
      // Si c'est le seul parent, on supprime l'enfant
      if (!child.parent) {
        await prisma.child.delete({
          where: {
            id: childId,
          },
        });
      } else {
        // Sinon on retire juste la relation avec ce parent
        await prisma.child.update({
          where: {
            id: childId,
          },
          data: {
            parentId: null,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHILDREN_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
