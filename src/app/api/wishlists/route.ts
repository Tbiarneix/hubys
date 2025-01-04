import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET /api/wishlists - Get all wishlists for the current user
export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Récupérer les listes personnelles et les listes des enfants dont l'utilisateur est parent
  const wishlists = await prisma.wishList.findMany({
    where: {
      OR: [
        { userId: user.id },
        {
          child: {
            parents: {
              some: {
                id: user.id
              }
            }
          }
        }
      ]
    },
    include: {
      child: {
        select: {
          firstName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(wishlists);
}

// POST /api/wishlists - Create a new wishlist
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { title, description, childId } = await request.json();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  if (childId) {
    // Vérifier que l'utilisateur est bien parent de l'enfant
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        parents: {
          select: { id: true }
        }
      }
    });

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    if (!child.parents.some(parent => parent.id === user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Créer une liste pour l'enfant
    const wishlist = await prisma.wishList.create({
      data: {
        title,
        description,
        childId,
        editors: {
          connect: child.parents.map(parent => ({ id: parent.id }))
        }
      },
    });

    return NextResponse.json(wishlist);
  } else {
    // Créer une liste personnelle
    const wishlist = await prisma.wishList.create({
      data: {
        title,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(wishlist);
  }
}
