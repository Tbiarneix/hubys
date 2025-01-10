import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

type Params = {
  params: Promise<{ id: string }>
}

// POST /api/groups/[id]/vote-deletion - Voter pour la suppression
export async function POST(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.groupDeletionVote.findFirst({
      where: {
        groupId: params.id,
        userId: session.user.id,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted' },
        { status: 400 }
      );
    }

    // Ajouter le vote
    await prisma.groupDeletionVote.create({
      data: {
        groupId: params.id,
        userId: session.user.id,
      },
    });

    // Vérifier si le seuil de 50% est atteint
    const [votesCount, membersCount] = await Promise.all([
      prisma.groupDeletionVote.count({
        where: { groupId: params.id },
      }),
      prisma.groupMember.count({
        where: { groupId: params.id },
      }),
    ]);

    const votePercentage = (votesCount / membersCount) * 100;

    // Si plus de 50% des membres ont voté pour la suppression, supprimer le groupe
    if (votePercentage >= 50) {
      await prisma.group.delete({
        where: { id: params.id },
      });

      return NextResponse.json({ deleted: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing deletion vote:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
