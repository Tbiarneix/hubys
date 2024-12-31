import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Participant {
  id: string;
  partnerId: string | null;
}

export const generateSecretSantaPairs = async (
  participants: Participant[],
  groupId: string
): Promise<Array<{ giverId: string; receiverId: string }>> => {
  // Récupérer les assignations des 2 dernières années
  const previousAssignments = await prisma.secretSantaAssignment.findMany({
    where: {
      secretSanta: {
        groupId,
        createdAt: {
          gte: new Date(new Date().getFullYear() - 2, 0, 1),
        },
      },
    },
    select: {
      giverId: true,
      receiverId: true,
    },
  });

  const shuffle = (array: Participant[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const isValidAssignment = (giver: Participant, receiver: Participant): boolean => {
    // Vérifie si ce n'est pas le même utilisateur
    if (giver.id === receiver.id) return false;

    // Vérifie si ce n'est pas le partenaire
    if (giver.partnerId === receiver.id) return false;

    // Vérifie si cette assignation n'a pas eu lieu dans les 2 dernières années
    return !previousAssignments.some(
      (assignment) =>
        assignment.giverId === giver.id && assignment.receiverId === receiver.id
    );
  };

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const shuffledParticipants = shuffle([...participants]);
    const assignments: Array<{ giverId: string; receiverId: string }> = [];
    let valid = true;

    for (let i = 0; i < participants.length; i++) {
      const giver = shuffledParticipants[i];
      const receiver = shuffledParticipants[(i + 1) % participants.length];

      if (!isValidAssignment(giver, receiver)) {
        valid = false;
        break;
      }

      assignments.push({ giverId: giver.id, receiverId: receiver.id });
    }

    if (valid) return assignments;
  }

  throw new Error('Impossible de générer des paires valides pour le Secret Santa');
};