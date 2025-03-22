import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ActivityDuration } from "@prisma/client";

type Params = {
  params: Promise<{
    groupId: string;
    eventId: string;
    activityId: string;
  }>
};

// PATCH - Modifier une activité
export async function PATCH(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { title, duration, url, rental, uniquePrice, babyPrice, childPrice, adultPrice, date } = body;

    if (duration && !Object.values(ActivityDuration).includes(duration)) {
      return NextResponse.json(
        { error: "La durée spécifiée n'est pas valide" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.update({
      where: {
        id: params.activityId,
        eventId: params.eventId,
        event: {
          groupId: params.groupId,
        },
      },
      data: {
        ...(title && { title }),
        ...(duration && { duration }),
        ...(url !== undefined && { url }),
        ...(rental !== undefined && { rental }),
        ...(uniquePrice !== undefined && { uniquePrice }),
        ...(babyPrice !== undefined && { babyPrice }),
        ...(childPrice !== undefined && { childPrice }),
        ...(adultPrice !== undefined && { adultPrice }),
        ...(date && { date: new Date(date) }),
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Erreur lors de la modification de l'activité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'activité" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une activité
export async function DELETE(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await prisma.activity.delete({
      where: {
        id: params.activityId,
        eventId: params.eventId,
        event: {
          groupId: params.groupId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'activité:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'activité" },
      { status: 500 }
    );
  }
}
