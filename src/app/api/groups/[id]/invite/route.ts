import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import { sendEmail } from '@/lib/email';

type Params = {
  params: Promise<{ id: string }>
}

// POST /api/groups/[id]/invite - Créer une invitation
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

    const groupId = await Promise.resolve(params.id);

    // Vérifier que l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let email: string | undefined;
    
    try {
      const body = await request.json();
      email = body.email;
    } catch (error) {
      // Si pas de body ou body invalide, on continue sans email
      // C'est le cas quand on génère juste un lien d'invitation
      console.log('Error creating invitation:', error);
    }

    // Générer un token unique
    const token = randomBytes(32).toString('hex');
    const expiresAt = addDays(new Date(), 2); // Expire dans 48 heures

    // Si un email est fourni, vérifier si l'utilisateur existe
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      // Créer l'invitation
      const invitation = await prisma.groupInvitation.create({
        data: {
          groupId,
          email,
          token,
          expiresAt,
          status: 'PENDING',
          fromUserId: session.user.id,
        },
        include: {
          group: true,
        },
      });

      if (existingUser) {
        // L'utilisateur existe déjà, pas besoin d'envoyer un email
        return NextResponse.json({ 
          message: 'Invitation envoyée à un utilisateur existant',
          token 
        });
      } else {
        // L'utilisateur n'existe pas, envoyer un email
        const inviteUrl = `${process.env.NEXTAUTH_URL}/groups/join/${token}`;
        await sendEmail({
          to: email,
          subject: `Invitation à rejoindre le groupe ${invitation.group.name}`,
          text: `Vous avez été invité à rejoindre le groupe ${invitation.group.name}. Cliquez sur ce lien pour rejoindre le groupe : ${inviteUrl}`,
          html: `
            <h1>Invitation à rejoindre un groupe</h1>
            <p>Vous avez été invité à rejoindre le groupe <strong>${invitation.group.name}</strong>.</p>
            <p>Ce lien expirera dans 48 heures.</p>
            <a href="${inviteUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Rejoindre le groupe
            </a>
          `,
        });

        return NextResponse.json({ 
          message: 'Email d\'invitation envoyé',
          token 
        });
      }
    } else {
      // Pas d'email fourni, générer simplement un lien d'invitation
      const invitation = await prisma.groupInvitation.create({
        data: {
          groupId,
          token,
          expiresAt,
          status: 'PENDING',
          fromUserId: session.user.id,
        },
      });
      console.log('Invitation created:', invitation);

      return NextResponse.json({ token });
    }
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
