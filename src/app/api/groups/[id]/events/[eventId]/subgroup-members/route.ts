import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Récupérer le sous-groupe de l'utilisateur pour cet événement
    const subgroup = await prisma.subgroup.findFirst({
      where: {
        eventId,
        OR: [
          { adults: { has: session.user.id } },
          { children: { has: session.user.id } }
        ]
      },
    });

    if (!subgroup) {
      return new NextResponse("No subgroup found", { status: 404 });
    }

    // Récupérer les adultes (Users)
    const adultUsers = await prisma.user.findMany({
      where: {
        id: {
          in: subgroup.adults
        }
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
      },
    });

    // Récupérer les enfants (Child)
    const children = await prisma.child.findMany({
      where: {
        id: {
          in: subgroup.children
        }
      },
      select: {
        id: true,
        firstName: true,
        birthDate: true,
      },
    });

    // Transformer les enfants pour avoir le même format que les adultes
    const childUsers = children.map(child => ({
      id: child.id,
      name: child.firstName,
      birthDate: child.birthDate,
    }));

    const allUsers = [...adultUsers, ...childUsers];

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("[SUBGROUP_MEMBERS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
