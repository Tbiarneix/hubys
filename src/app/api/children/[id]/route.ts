import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const child = await prisma.child.findUnique({
      where: {
        id: id,
      },
      include: {
        parents: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        wishlists: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
    });

    if (!child) {
      return new NextResponse("Child not found", { status: 404 });
    }

    // Vérifier que l'utilisateur est bien un parent de l'enfant
    if (!child.parents.some(parent => parent.id === session.user.id)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(child);
  } catch (error) {
    console.error("[CHILD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
