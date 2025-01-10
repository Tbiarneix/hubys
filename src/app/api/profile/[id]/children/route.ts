/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string; childId: string }>
}

// GET /api/profile/[id]/children
export async function GET(
  request: Request,
  context: Params
) {
  const params = await context.params;
  const { id } = params;
  try {
    const children = await prisma.child.findMany({
      where: {
        parents: {
          some: {
            id: id
          }
        }
      },
      orderBy: {
        birthDate: 'desc',
      },
      include: {
        parents: true
      }
    });

    return NextResponse.json(children);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching children" },
      { status: 500 }
    );
  }
}

// POST /api/profile/[id]/children
export async function POST(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Chercher si l'utilisateur a un partenaire
    const partnership = await prisma.partnerInvitation.findFirst({
      where: {
        OR: [
          { fromUserId: params.id },
          { toUserId: params.id }
        ],
        status: "ACCEPTED"
      },
      include: {
        fromUser: {
          select: {
            id: true
          }
        },
        toUser: {
          select: {
            id: true
          }
        }
      }
    });

    const body = await request.json();
    const { firstName, birthDate } = body;

    // Préparer les parents de l'enfant
    const parentIds = [{ id: params.id }];
    if (partnership && partnership.toUser && partnership.fromUser) {
      const partnerId = partnership.fromUser.id === params.id 
        ? partnership.toUser.id 
        : partnership.fromUser.id;
      parentIds.push({ id: partnerId });
    }

    const child = await prisma.child.create({
      data: {
        firstName,
        birthDate: new Date(birthDate),
        parents: {
          connect: parentIds
        }
      },
      include: {
        parents: true
      }
    });

    return NextResponse.json(child);
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating child" },
      { status: 500 }
    );
  }
}

// PUT /api/profile/[id]/children/[childId]
export async function PUT(
  request: Request,
  context: Params
) {
  const params = await context.params;

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, birthDate } = body;

    // Vérifier que l'utilisateur est bien un parent de l'enfant
    const child = await prisma.child.findFirst({
      where: {
        id: params.childId,
        parents: {
          some: {
            id: params.id
          }
        }
      }
    });

    if (!child) {
      return NextResponse.json(
        { error: "Child not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedChild = await prisma.child.update({
      where: {
        id: params.childId,
      },
      data: {
        firstName,
        birthDate: new Date(birthDate),
      },
      include: {
        parents: true
      }
    });

    return NextResponse.json(updatedChild);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating child" },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/[id]/children/[childId]
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

    if (deleteCompletely) {
      // Suppression complète de l'enfant
      await prisma.child.delete({
        where: {
          id: params.childId,
        },
      });
    } else {
      // Suppression de la relation parent-enfant uniquement
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHILDREN_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
