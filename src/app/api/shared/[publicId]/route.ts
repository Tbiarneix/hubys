import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ publicId: string }> }) {
  const params = await props.params;
  try {
    const wishlist = await prisma.wishList.findUnique({
      where: { publicId: params.publicId },
      select: {
        title: true,
        description: true,
        categories: {
          select: {
            id: true,
            name: true,
            description: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            url: true,
            comment: true,
            categoryId: true,
            isReserved: true,
            reserverName: true
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 });
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error fetching shared wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
