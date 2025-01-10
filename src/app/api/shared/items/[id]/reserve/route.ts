import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const reserverName = body?.reserverName || null;

    const item = await prisma.wishlistItem.findUnique({
      where: { id: params.id },
      select: { 
        id: true,
        isReserved: true,
        reserverName: true
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item non trouvé' }, { status: 404 });
    }

    // Si on ne fournit pas de nom, on annule la réservation
    if (!reserverName) {
      const updatedItem = await prisma.wishlistItem.update({
        where: { id: params.id },
        data: {
          isReserved: false,
          reserverName: null
        },
        select: { 
          id: true, 
          isReserved: true, 
          reserverName: true 
        }
      });
      return NextResponse.json(updatedItem);
    }

    // Si l'item est déjà réservé
    if (item.isReserved) {
      return NextResponse.json({ error: 'Item déjà réservé' }, { status: 400 });
    }

    // Réserver l'item avec le nom fourni
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: params.id },
      data: {
        isReserved: true,
        reserverName: reserverName
      },
      select: { 
        id: true, 
        isReserved: true, 
        reserverName: true 
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error reserving item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
