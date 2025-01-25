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
  number: number;
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
    const { subgroupId, date, type, number } = body;

    // On utilise directement la date reçue
    const presenceDate = new Date(date);

    // Récupérer la présence existante
    const existingPresence = await prisma.subgroupPresence.findFirst({
      where: {
        subgroupId,
        eventId: params.eventId,
        date: presenceDate,
      },
    });

    if (!existingPresence) {
      return new NextResponse("Presence not found", { status: 404 });
    }

    // Mettre à jour uniquement le nombre
    const presence = await prisma.subgroupPresence.update({
      where: {
        id: existingPresence.id,
      },
      data: {
        ...(type === 'lunch' && { lunchNumber: number }),
        ...(type === 'dinner' && { dinnerNumber: number }),
      },
    });

    return NextResponse.json(presence);
  } catch (error) {
    console.error("[PRESENCES_ADJUST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
