import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; childId: string }>
}

export async function GET(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== params.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const child = await prisma.child.findUnique({
      where: {
        id: params.childId,
      },
      include: {
        parents: true,
      },
    });

    if (!child) {
      return new NextResponse("Child not found", { status: 404 });
    }

    // Vérifier que l'utilisateur est bien un parent de l'enfant
    if (!child.parents.some((parent: { id: string }) => parent.id === params.id)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(child);
  } catch (error) {
    console.error("[CHILDREN_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== params.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { deleteCompletely } = await request.json();

    const child = await prisma.child.findUnique({
      where: {
        id: params.childId,
      },
      include: {
        parents: true,
      },
    });

    if (!child) {
      return new NextResponse("Child not found", { status: 404 });
    }

    if (!child.parents.some((parent: { id: string }) => parent.id === params.id)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (deleteCompletely) {
      await prisma.child.delete({
        where: {
          id: params.childId,
        },
      });
    } else {
      if (child.parents.length <= 1) {
        await prisma.child.delete({
          where: {
            id: params.childId,
          },
        });
      } else {
        await prisma.child.update({
          where: {
            id: params.childId,
          },
          data: {
            parents: {
              disconnect: {
                id: params.id
              }
            }
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
