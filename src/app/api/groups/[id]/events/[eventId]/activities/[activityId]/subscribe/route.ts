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

export async function POST(
  request: Request,
  context: Params
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les IDs des participants à inscrire
    const { userIds } = await request.json();
    console.log("[SUBSCRIBE_ACTIVITY] IDs reçus:", userIds);

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "Les IDs des participants sont requis" },
        { status: 400 }
      );
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

    console.log("[SUBSCRIBE_ACTIVITY] Activité trouvée:", activity.title);

    // Récupérer les sous-groupes pour identifier les adultes et les enfants
    const subgroup = await prisma.subgroup.findFirst({
      where: {
        eventId: params.eventId,
        OR: [
          { adults: { has: session.user.id } },
          { children: { has: session.user.id } }
        ]
      },
    });

    if (!subgroup) {
      return NextResponse.json(
        { error: "Sous-groupe non trouvé" },
        { status: 404 }
      );
    }

    console.log("[SUBSCRIBE_ACTIVITY] Sous-groupe trouvé avec:", {
      adultes: subgroup.adults.length,
      enfants: subgroup.children.length
    });

    // Séparer les IDs entre adultes et enfants
    const adultIds = userIds.filter(id => subgroup.adults.includes(id));
    const childIds = userIds.filter(id => subgroup.children.includes(id));

    console.log("[SUBSCRIBE_ACTIVITY] IDs séparés:", {
      adultes: adultIds,
      enfants: childIds
    });

    // Récupérer les participants existants pour ce sous-groupe et cette activité
    const existingAdultParticipants = await prisma.activityParticipant.findMany({
      where: {
        activityId: params.activityId,
        userId: {
          in: subgroup.adults
        }
      }
    });

    const existingChildParticipants = await prisma.activityParticipant.findMany({
      where: {
        activityId: params.activityId,
        childId: {
          in: subgroup.children
        }
      }
    });

    console.log("[SUBSCRIBE_ACTIVITY] Participants existants:", {
      adultes: existingAdultParticipants.length,
      enfants: existingChildParticipants.length
    });

    // Déterminer quels adultes doivent être ajoutés ou supprimés
    const adultIdsToAdd = adultIds.filter(id => 
      !existingAdultParticipants.some(p => p.userId === id)
    );
    
    const adultIdsToRemove = existingAdultParticipants
      .filter(p => !adultIds.includes(p.userId as string))
      .map(p => p.id);

    // Déterminer quels enfants doivent être ajoutés ou supprimés
    const childIdsToAdd = childIds.filter(id => 
      !existingChildParticipants.some(p => p.childId === id)
    );
    
    const childIdsToRemove = existingChildParticipants
      .filter(p => !childIds.includes(p.childId as string))
      .map(p => p.id);

    console.log("[SUBSCRIBE_ACTIVITY] Modifications à effectuer:", {
      adultesToAdd: adultIdsToAdd.length,
      adultesToRemove: adultIdsToRemove.length,
      enfantsToAdd: childIdsToAdd.length,
      enfantsToRemove: childIdsToRemove.length
    });

    // Exécuter toutes les opérations dans une transaction
    const operations = [];

    // Ajouter les nouveaux adultes
    if (adultIdsToAdd.length > 0) {
      operations.push(
        ...adultIdsToAdd.map(userId =>
          prisma.activityParticipant.create({
            data: {
              activityId: params.activityId,
              userId,
            },
          })
        )
      );
    }

    // Ajouter les nouveaux enfants
    if (childIdsToAdd.length > 0) {
      operations.push(
        ...childIdsToAdd.map(childId =>
          prisma.activityParticipant.create({
            data: {
              activityId: params.activityId,
              childId,
            },
          })
        )
      );
    }

    // Supprimer les adultes et enfants qui ne sont plus sélectionnés
    if (adultIdsToRemove.length > 0 || childIdsToRemove.length > 0) {
      const idsToRemove = [...adultIdsToRemove, ...childIdsToRemove];
      operations.push(
        prisma.activityParticipant.deleteMany({
          where: {
            id: {
              in: idsToRemove
            }
          }
        })
      );
    }

    // Exécuter les opérations
    if (operations.length > 0) {
      await prisma.$transaction(operations);
      console.log("[SUBSCRIBE_ACTIVITY] Modifications effectuées avec succès");
    } else {
      console.log("[SUBSCRIBE_ACTIVITY] Aucune modification nécessaire");
    }

    // Récupérer l'activité mise à jour avec tous les participants
    const updatedActivity = await prisma.activity.findUnique({
      where: {
        id: params.activityId,
      },
      include: {
        participants: {
          include: {
            user: true,
            child: true,
          },
        },
      },
    });

    console.log("[SUBSCRIBE_ACTIVITY] Activité mise à jour avec", updatedActivity?.participants.length, "participants");

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("[SUBSCRIBE_ACTIVITY]", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription à l'activité" }, { status: 500 });
  }
}
