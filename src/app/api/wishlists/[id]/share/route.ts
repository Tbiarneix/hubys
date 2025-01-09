import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface Editor {
  id: string;
}

interface Parent {
  id: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id: wishlistId } = await params;

    const wishlist = await prisma.wishList.findUnique({
      where: { id: wishlistId },
      include: {
        child: {
          include: {
            parents: true,
          },
        },
        editors: true,
      },
    });

    if (!wishlist) {
      return NextResponse.json({ message: 'Liste non trouvée' }, { status: 404 });
    }

    // Vérifier si l'utilisateur est autorisé
    const isOwner = wishlist.userId === session.user.id;
    const isEditor = wishlist.editors.some((editor: Editor) => editor.id === session.user.id);
    const isParentOfChild = wishlist.childId && wishlist.child?.parents.some((parent: Parent) => parent.id === session.user.id);

    if (!isOwner && !isEditor && !isParentOfChild) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Si la liste n'a pas déjà un publicId, en générer un
    if (!wishlist.publicId) {
      const updatedWishlist = await prisma.wishList.update({
        where: { id: wishlistId },
        data: { publicId: undefined }, // Cela déclenchera la génération automatique du publicId
      });
      return NextResponse.json({ publicId: updatedWishlist.publicId });
    }

    // Si la liste a déjà un publicId, le renvoyer
    return NextResponse.json({ publicId: wishlist.publicId });
  } catch (error) {
    console.error('Error in share wishlist:', error);
    return NextResponse.json(
      { message: 'Erreur lors du partage de la liste' },
      { status: 500 }
    );
  }
}
