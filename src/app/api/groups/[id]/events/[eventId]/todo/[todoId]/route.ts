import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string; eventId: string; todoId: string }>;
};

// PATCH /api/groups/[id]/events/[eventId]/todo/[todoId]
export async function PATCH(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const { title, completed, assignedToId } = json;

    const todoItem = await prisma.todoItem.update({
      where: {
        id: params.todoId,
        eventId: params.eventId,
      },
      data: {
        title,
        completed,
        assignedToId: assignedToId || null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(todoItem);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/groups/[id]/events/[eventId]/todo/[todoId]
export async function DELETE(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.todoItem.delete({
      where: {
        id: params.todoId,
        eventId: params.eventId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
