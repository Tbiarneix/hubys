import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
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
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est bien le destinataire
    if (invitation.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Marquer l'invitation comme refusée
    await prisma.groupInvitation.update({
      where: { id: invitationId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({ message: 'Invitation rejected successfully' });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
