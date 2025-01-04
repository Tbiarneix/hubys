import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    // Vérifier si l'utilisateur a accès à la liste
    const wishlist = await prisma.wishList.findUnique({
      where: { id: params.id },
      include: {
        editors: true,
        child: {
          include: {
            parents: true
          }
        }
      }
    });

    if (!wishlist) {
      return new NextResponse('Liste non trouvée', { status: 404 });
    }

    // Vérifier l'accès
    const hasAccess = 
      wishlist.userId === user.id || // Propriétaire
      wishlist.editors.some(editor => editor.id === user.id) || // Éditeur
      (wishlist.child && wishlist.child.parents.some(parent => parent.id === user.id) && wishlist.userId === wishlist.child.id); // Parent de l'enfant

    if (!hasAccess) {
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
