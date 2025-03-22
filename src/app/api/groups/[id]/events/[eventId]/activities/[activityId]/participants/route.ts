import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{
    id: string;
    eventId: string;
    activityId: string;
  }>;
}

export async function GET(
  request: Request,
  context: Params
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'activité existe et appartient à l'événement
    const activity = await prisma.activity.findUnique({
      where: {
        id: params.activityId,
        eventId: params.eventId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activité non trouvée" },
        { status: 404 }
      );
    }

    console.log("[PARTICIPANTS_GET] Activité trouvée:", activity.title);

    // Vérifier que l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de ce groupe" },
        { status: 401 }
      );
    }

    // Récupérer tous les sous-groupes de l'événement
    const subgroups = await prisma.subgroup.findMany({
      where: {
        eventId: params.eventId,
      },
    });

    // Récupérer les participants de l'activité
    const participants = await prisma.activityParticipant.findMany({
      where: {
        activityId: params.activityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        child: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
    });

    console.log("[PARTICIPANTS_GET] Participants trouvés:", participants.length);

    // Récupérer tous les utilisateurs adultes
    const adults = await prisma.user.findMany({
      where: {
        id: {
          in: participants
            .filter(p => p.userId !== null)
            .map(p => p.userId as string)
        }
      },
      select: {
        id: true,
        name: true,
      }
    });

    // Récupérer tous les enfants
    const children = await prisma.child.findMany({
      where: {
        id: {
          in: participants
            .filter(p => p.childId !== null)
            .map(p => p.childId as string)
        }
      },
      select: {
        id: true,
        firstName: true,
      }
    });

    // Organiser les participants par sous-groupe
    const participantsBySubgroup = subgroups.map(subgroup => {
      // Trouver les adultes de ce sous-groupe qui sont participants
      const subgroupAdults = adults.filter(adult => 
        subgroup.adults.includes(adult.id) && 
        participants.some(p => p.userId === adult.id)
      ).map(adult => ({
        id: adult.id,
        name: adult.name || "Sans nom",
        isPresent: participants.find(p => p.userId === adult.id)?.isPresent || false
      }));

      // Trouver les enfants de ce sous-groupe qui sont participants
      const subgroupChildren = children.filter(child => 
        subgroup.children.includes(child.id) && 
        participants.some(p => p.childId === child.id)
      ).map(child => ({
        id: child.id,
        name: child.firstName,
        isPresent: participants.find(p => p.childId === child.id)?.isPresent || false
      }));

      return {
        id: subgroup.id,
        adults: subgroupAdults,
        children: subgroupChildren
      };
    }).filter(subgroup => subgroup.adults.length > 0 || subgroup.children.length > 0);

    console.log("[PARTICIPANTS_GET] Sous-groupes avec participants:", participantsBySubgroup.length);

    return NextResponse.json(participantsBySubgroup);
  } catch (error) {
    console.error("[PARTICIPANTS_GET]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des participants" },
      { status: 500 }
    );
  }
}
