import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string; eventId: string }>;
};

// GET /api/groups/[id]/events/[eventId]/todo
export async function GET(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const todoItems = await prisma.todoItem.findMany({
      where: {
        eventId: params.eventId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { assignedToId: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(todoItems);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/groups/[id]/events/[eventId]/todo
export async function POST(
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
    const { title, assignedToId } = json;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const todoItem = await prisma.todoItem.create({
      data: {
        title,
        assignedToId: assignedToId || null,
        eventId: params.eventId,
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
