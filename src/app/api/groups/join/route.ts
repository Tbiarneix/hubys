import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

// POST /api/groups/join - Rejoindre un groupe via un token d'invitation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await req.json();

    // Trouver l'invitation
    const invitation = await prisma.groupInvitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        group: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur est déjà membre du groupe
    const existingMembership = await prisma.groupMember.findFirst({
      where: {
        groupId: invitation.groupId,
        userId: session.user.id,
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Already a member' },
        { status: 400 }
      );
    }

    // Créer l'adhésion au groupe et mettre à jour le statut de l'invitation
    const [membership] = await prisma.$transaction([
      prisma.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: session.user.id,
          role: 'MEMBER',
        },
      }),
      prisma.groupInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      }),
    ]);

    return NextResponse.json({
      groupId: invitation.groupId,
      membership,
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
