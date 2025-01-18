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
};

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

    const body = await request.json() as RequestBody;
    const { subgroupId, date, type } = body;

    // On utilise directement la date reçue
    const presenceDate = new Date(date);

    // Récupérer le subgroup pour calculer le nombre total
    const subgroup = await prisma.subgroup.findUnique({
      where: { id: subgroupId },
      select: {
        activeAdults: true,
        activeChildren: true,
      }
    });

    if (!subgroup) {
      return new NextResponse("Subgroup not found", { status: 404 });
    }

    const totalActive = subgroup.activeAdults.length + subgroup.activeChildren.length;

    // Récupérer la présence existante
    const existingPresence = await prisma.subgroupPresence.findFirst({
      where: {
        subgroupId,
        eventId: params.eventId,
        date: presenceDate,
      },
    });

    // Mettre à jour ou créer la présence
    const presence = await prisma.subgroupPresence.upsert({
      where: {
        id: existingPresence?.id || '',
      },
      create: {
        subgroupId,
        eventId: params.eventId,
        date: presenceDate,
        [type]: true,
        lunchNumber: type === 'lunch' ? totalActive : 0,
        dinnerNumber: type === 'dinner' ? totalActive : 0,
      },
      update: {
        [type]: !existingPresence?.[type],
        ...(type === 'lunch' && { 
          lunchNumber: existingPresence?.[type] ? 0 : totalActive 
        }),
        ...(type === 'dinner' && { 
          dinnerNumber: existingPresence?.[type] ? 0 : totalActive 
        }),
      },
    });

    return NextResponse.json(presence);
  } catch (error) {
    console.error("[PRESENCES_TOGGLE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
