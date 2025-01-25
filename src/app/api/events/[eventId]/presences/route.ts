import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{ eventId: string }>
}

type RequestBody = {
  subgroupId: string;
  date: string;
  type: 'lunch' | 'dinner';
  lunchNumber: number;
  dinnerNumber: number;
};

type SubgroupPresenceFields = {
  lunch: boolean;
  dinner: boolean;
  lunchNumber: number;
  dinnerNumber: number;
};

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

    const { subgroupId, date, type, lunchNumber, dinnerNumber }: RequestBody = await request.json();

    // Vérifier que l'utilisateur a accès à l'événement
    const event = await prisma.event.findFirst({
      where: {
        id: params.eventId,
        group: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    // Récupérer la présence existante
    const existingPresence = await prisma.subgroupPresence.findFirst({
      where: {
        subgroupId,
        eventId: params.eventId,
        date: new Date(date),
      },
    });

    // Cas 1: Mise à jour des nombres (lunchNumber ou dinnerNumber sont définis)
    if (lunchNumber !== undefined || dinnerNumber !== undefined) {
      const presence = await prisma.subgroupPresence.upsert({
        where: {
          id: existingPresence?.id || '',
        },
        create: {
          subgroupId,
          eventId: params.eventId,
          date: new Date(date),
          lunch: type === 'lunch',
          dinner: type === 'dinner',
          lunchNumber: lunchNumber || 0,
          dinnerNumber: dinnerNumber || 0,
        },
        update: {
          ...(lunchNumber !== undefined && { lunchNumber }),
          ...(dinnerNumber !== undefined && { dinnerNumber }),
        },
      });
      return NextResponse.json(presence);
    }

    // Cas 2: Toggle de présence (aucun nombre n'est défini)
    const presence = await prisma.subgroupPresence.upsert({
      where: {
        id: existingPresence?.id || '',
      },
      create: {
        subgroupId,
        eventId: params.eventId,
        date: new Date(date),
        [type]: true,
        lunchNumber: 0,
        dinnerNumber: 0,
      },
      update: {
        [type as keyof SubgroupPresenceFields]: !existingPresence?.[type as keyof SubgroupPresenceFields],
      },
    });
    return NextResponse.json(presence);
  } catch (error) {
    console.error("[PRESENCES_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
