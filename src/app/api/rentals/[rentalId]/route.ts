import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{ rentalId: string }>
}

export async function DELETE(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Vérifier si la rental existe et récupérer l'eventId
    const rental = await prisma.rental.findUnique({
      where: {
        id: params.rentalId,
      },
      include: {
        event: {
          include: {
            group: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!rental) {
      return new NextResponse("Rental not found", { status: 404 });
    }

    // Vérifier si l'utilisateur est membre du groupe
    const isMember = rental.event.group.members.some(
      (member: { userId: string }) => member.userId === session.user.id
    );

    if (!isMember) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Supprimer la rental
    await prisma.rental.delete({
      where: {
        id: params.rentalId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[RENTAL_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 