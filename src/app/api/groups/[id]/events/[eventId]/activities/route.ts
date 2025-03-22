import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ActivityDuration } from "@prisma/client";
import { z } from "zod";

const createActivitySchema = z.object({
  title: z.string().min(1),
  duration: z.enum([ActivityDuration.HALF_DAY, ActivityDuration.FULL_DAY]),
  url: z.string().url().nullable(),
  location: z.string().nullable(),
  babyPrice: z.number().nullable(),
  childPrice: z.number().nullable(),
  adultPrice: z.number().nullable(),
  uniquePrice: z.number().nullable(),
  date: z.string().datetime(),
});

type Params = {
  params: Promise<{
  groupId: string;
  eventId: string;
  }>
}

// GET - Récupérer toutes les activités d'un événement
export async function GET(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      where: {
        eventId: params.eventId,
        event: {
          groupId: params.groupId,
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            child: {
              select: {
                id: true,
                firstName: true,
              }
            }
          }
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transformer les données pour avoir un format uniforme
    const formattedActivities = activities.map(activity => ({
      ...activity,
      participants: activity.participants.map(participant => ({
        id: participant.id,
        name: participant.user?.name || participant.child?.firstName || '',
        email: participant.user?.email || null,
        isPresent: participant.isPresent,
      }))
    }));

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error("[GET_ACTIVITIES]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des activités" },
      { status: 500 }
    );
  }
}

// POST - Créer une activité
export async function POST(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received body:", body);

    const result = await createActivitySchema.safeParseAsync(body);
    if (!result.success) {
      console.error("Validation error:", result.error.issues);
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, duration, url, location, babyPrice, childPrice, adultPrice, uniquePrice, date } = result.data;

    // Vérifier que l'événement existe et appartient au groupe
    const event = await prisma.event.findFirst({
      where: {
        id: params.eventId,
        groupId: params.groupId,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "L'événement n'existe pas ou n'appartient pas à ce groupe" },
        { status: 404 }
      );
    }

    // Vérifier que la date est dans la plage de l'événement
    const activityDate = new Date(date);

    // Créer l'activité
    const activity = await prisma.activity.create({
      data: {
        title,
        duration,
        url,
        location,
        babyPrice,
        childPrice,
        adultPrice,
        uniquePrice,
        date: activityDate,
        eventId: params.eventId,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'activité" },
      { status: 500 }
    );
  }
}
