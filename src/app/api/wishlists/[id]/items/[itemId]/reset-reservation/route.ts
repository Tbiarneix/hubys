import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = {
  params: Promise<{ id: string; itemId: string }>
}

export async function POST(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    // Réinitialisation de l'état de réservation
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: params.itemId },
      data: { 
        isReserved: false,
        reserverName: ''
      },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la réservation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
