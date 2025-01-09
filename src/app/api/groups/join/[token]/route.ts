import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

// POST /api/groups/join/[token] - Rejoindre un groupe via une invitation
export async function POST(req: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer l'invitation
    const invitation = await prisma.groupInvitation.findUnique({
      where: { token: params.token },
      include: { group: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation already used' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Vérifier si l'utilisateur est déjà membre du groupe
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId: invitation.groupId,
        user: { email: session.user.email },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ajouter l'utilisateur au groupe et marquer l'invitation comme acceptée
    const [member] = await prisma.$transaction([
      prisma.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: user.id,
          role: 'MEMBER',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.groupInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      }),
    ]);

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
