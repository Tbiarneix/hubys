import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { locationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Vérifier si la location existe et récupérer l'eventId
    const location = await prisma.location.findUnique({
      where: {
        id: params.locationId,
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

    if (!location) {
      return new NextResponse("Location not found", { status: 404 });
    }

    // Vérifier si l'utilisateur est membre du groupe
    const isMember = location.event.group.members.some(
      (member: { userId: string }) => member.userId === session.user.id
    );

    if (!isMember) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Supprimer la location
    await prisma.location.delete({
      where: {
        id: params.locationId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LOCATION_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 