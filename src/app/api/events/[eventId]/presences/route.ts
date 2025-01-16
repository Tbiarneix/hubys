import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{ eventId: string }>
}

export async function GET(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const presences = await prisma.subgroupPresence.findMany({
      where: {
        eventId: params.eventId,
      },
      include: {
        subgroup: true,
      },
    });

    return NextResponse.json(presences);
  } catch (error) {
    console.error("[PRESENCES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { subgroupId, date, type } = body;

    // Vérifier que l'utilisateur fait partie du sous-groupe
    const subgroup = await prisma.subgroup.findUnique({
      where: { id: subgroupId },
    });

    if (!subgroup) {
      return new NextResponse("Subgroup not found", { status: 404 });
    }

    if (!subgroup.activeAdults.includes(session.user.id) && 
        !subgroup.activeChildren.includes(session.user.id)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Mettre à jour ou créer la présence
    const presence = await prisma.subgroupPresence.upsert({
      where: {
        subgroupId_eventId_date: {
          subgroupId,
          eventId: params.eventId,
          date: new Date(date),
        },
      },
      update: {
        [type]: true,
      },
      create: {
        subgroupId,
        eventId: params.eventId,
        date: new Date(date),
        [type]: true,
      },
    });

    return NextResponse.json(presence);
  } catch (error) {
    console.error("[PRESENCES_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
