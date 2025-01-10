import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const child = await prisma.child.findUnique({
      where: {
        id: params.id,
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

    if (!child.parents.some((parent: { id: string }) => parent.id === session.user.id)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(child);
  } catch (error) {
    console.error("[CHILD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
