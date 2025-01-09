import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string; itemId: string }> }
) {
  const params = await props.params;
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
