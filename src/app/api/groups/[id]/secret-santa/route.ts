import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface PrismaGroupMember {
  userId: string;
  user: {
    id: string;
    email: string | null;
    receivedInvitations: Array<{
      fromUserId: string;
    }>;
    sentInvitations: Array<{
      toUserId: string | null;
    }>;
  };
}

// Fonction pour générer les assignments du Secret Santa
async function generateSecretSantaAssignments(
  members: { id: string; partnerId?: string | null }[],
  previousAssignments: { giverId: string; receiverId: string }[] = []
) {
  // Fonction pour vérifier si un assignment est valide
  const isValidAssignment = (giver: string, receiver: string, currentAssignments: { giverId: string; receiverId: string }[]) => {
    // Vérifie si le giver n'est pas le receiver
    if (giver === receiver) return false;

    // Vérifie si le giver n'a pas déjà eu ce receiver l'année précédente
    if (previousAssignments.some(a => a.giverId === giver && a.receiverId === receiver)) {
      return false;
    }

    // Vérifie que le giver n'est pas assigné au partenaire
    const giverMember = members.find(m => m.id === giver);
    if (giverMember?.partnerId === receiver) return false;

    // Vérifie que le receiver n'a pas déjà été assigné dans la distribution actuelle
    if (currentAssignments.some(a => a.receiverId === receiver)) {
      return false;
    }

    return true;
  };

  // Fonction pour générer une distribution aléatoire
  const generateDistribution = () => {
    const assignments: { giverId: string; receiverId: string }[] = [];
    const availableReceivers = new Set(members.map(m => m.id));

    for (const giver of members) {
      // Filtrer les receivers valides pour ce giver
      const validReceivers = Array.from(availableReceivers).filter(
        receiverId => isValidAssignment(giver.id, receiverId, assignments)
      );

      if (validReceivers.length === 0) {
        // Si aucun receiver valide, on recommence
        return null;
      }

      // Choisir un receiver au hasard parmi les valides
      const randomIndex = Math.floor(Math.random() * validReceivers.length);
      const receiverId = validReceivers[randomIndex];

      assignments.push({ giverId: giver.id, receiverId });
      // Retirer le receiver choisi de la liste des disponibles
      availableReceivers.delete(receiverId);
    }

    return assignments;
  };

  // Essayer de générer une distribution valide (max 100 tentatives)
  for (let i = 0; i < 100; i++) {
    const distribution = generateDistribution();
    if (distribution) {
      return distribution;
    }
  }

  throw new Error("Impossible de générer une distribution valide");
}

type Params = {
  params: Promise<{ id: string }>
}

// POST /api/groups/[id]/secret-santa - Créer un nouveau Secret Santa
export async function POST(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    console.log("Début de la route POST Secret Santa");

    // Vérifier que le client Prisma est disponible
    if (!prisma || !prisma.secretSanta) {
      console.error("Client Prisma non initialisé correctement");
      return NextResponse.json(
        { error: "Erreur de configuration du serveur" },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("Pas de session utilisateur");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // S'assurer que params.id est disponible
    if (!params?.id) {
      console.error("ID du groupe manquant");
      return NextResponse.json(
        { error: "ID du groupe manquant" },
        { status: 400 }
      );
    }

    const groupId = params.id;
    const currentYear = new Date().getFullYear();
    console.log("GroupId:", groupId, "Year:", currentYear);

    // Vérifier si l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });
    console.log("Membership:", membership);

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de ce groupe" },
        { status: 403 }
      );
    }

    // Vérifier si un Secret Santa existe déjà pour cette année
    const existingSecretSanta = await prisma.secretSanta.findUnique({
      where: {
        groupId_year: {
          groupId,
          year: currentYear,
        },
      },
    });
    console.log("Existing Secret Santa:", existingSecretSanta);

    if (existingSecretSanta) {
      return NextResponse.json(
        { error: "Un Secret Santa existe déjà pour cette année" },
        { status: 400 }
      );
    }

    // Récupérer tous les membres du groupe avec leurs partenaires
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            receivedInvitations: {
              where: { status: "ACCEPTED" },
              select: { fromUserId: true },
            },
            sentInvitations: {
              where: { status: "ACCEPTED" },
              select: { toUserId: true },
            },
          },
        },
      },
    });
    console.log("Members:", JSON.stringify(members, null, 2));

    // Préparer les données des membres avec leurs partenaires
    const membersWithPartners = members.map((member: PrismaGroupMember) => {
      const partnerId = 
        member.user.receivedInvitations[0]?.fromUserId ||
        member.user.sentInvitations[0]?.toUserId ||
        undefined;
      return {
        id: member.userId,
        partnerId,
      };
    });
    console.log("Members with partners:", JSON.stringify(membersWithPartners, null, 2));

    // Générer les assignments
    console.log("Génération des assignments...");
    const assignments = await generateSecretSantaAssignments(membersWithPartners);
    console.log("Assignments générés:", JSON.stringify(assignments, null, 2));

    // Créer le Secret Santa et ses assignments
    console.log("Création du Secret Santa...");
    const secretSanta = await prisma.secretSanta.create({
      data: {
        year: currentYear,
        groupId,
        assignments: {
          create: assignments.map(assignment => ({
            giverId: assignment.giverId,
            receiverId: assignment.receiverId,
          })),
        },
      },
      include: {
        assignments: {
          include: {
            receiver: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    console.log("Secret Santa créé avec succès:", JSON.stringify(secretSanta, null, 2));

    return NextResponse.json(secretSanta);
  } catch (error) {
    console.error("Erreur détaillée lors de la création du Secret Santa:", error);
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json(
      { error: "Erreur lors de la création du Secret Santa" },
      { status: 500 }
    );
  }
}

// GET /api/groups/[id]/secret-santa - Récupérer le Secret Santa actuel
export async function GET(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const groupId = params.id;
    const currentYear = new Date().getFullYear();

    // Vérifier si l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de ce groupe" },
        { status: 403 }
      );
    }

    // Récupérer le Secret Santa actuel
    const secretSanta = await prisma.secretSanta.findUnique({
      where: {
        groupId_year: {
          groupId,
          year: currentYear,
        },
      },
      include: {
        assignments: {
          where: {
            giverId: session.user.id,
          },
          include: {
            receiver: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(secretSanta);
  } catch (error) {
    console.error("Erreur lors de la récupération du Secret Santa:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du Secret Santa" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id]/secret-santa - Annuler le Secret Santa actuel
export async function DELETE(
  request: NextRequest,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const groupId = params.id;
    const currentYear = new Date().getFullYear();

    // Vérifier si l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de ce groupe" },
        { status: 403 }
      );
    }

    // Supprimer le Secret Santa actuel
    await prisma.secretSanta.delete({
      where: {
        groupId_year: {
          groupId,
          year: currentYear,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du Secret Santa:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du Secret Santa" },
      { status: 500 }
    );
  }
}
