import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Vérifier si l'utilisateur est propriétaire de la liste
    const wishlist = await prisma.wishList.findUnique({
      where: { id: params.id },
      select: { userId: true, publicId: true }
    });

    if (!wishlist) {
      return new NextResponse('Liste non trouvée', { status: 404 });
    }

    if (wishlist.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Si la liste n'a pas déjà un publicId, en générer un
    if (!wishlist.publicId) {
      const updatedWishlist = await prisma.wishList.update({
        where: { id: params.id },
        data: { publicId: undefined }, // Cela déclenchera la génération automatique du publicId
        select: { publicId: true }
      });
      return NextResponse.json({ publicId: updatedWishlist.publicId });
    }

    // Si la liste a déjà un publicId, le renvoyer
    return NextResponse.json({ publicId: wishlist.publicId });
  } catch (error) {
    console.error('Error sharing wishlist:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
