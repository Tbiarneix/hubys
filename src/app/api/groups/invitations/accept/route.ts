import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { invitationId } = body;

    // Récupérer l'invitation
    const invitation = await prisma.groupInvitation.findUnique({
      where: { id: invitationId },
      include: {
        group: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est bien le destinataire
    if (invitation.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Créer le membre du groupe
    await prisma.groupMember.create({
      data: {
        groupId: invitation.groupId,
        userId: session.user.id,
        role: 'MEMBER',
      },
    });

    // Marquer l'invitation comme acceptée
    await prisma.groupInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' },
    });

    return NextResponse.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
