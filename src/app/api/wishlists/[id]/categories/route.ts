import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET /api/wishlists/[id]/categories - Get all categories for a wishlist
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  // Vérifier l'accès
  const hasAccess = 
    wishlist.userId === user.id || // Propriétaire
    wishlist.editors.some((editor: { id: string }) => editor.id === user.id) || // Éditeur
    (wishlist.childId && wishlist.child?.parents.some((parent: { id: string }) => parent.id === user.id)); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { wishlistId: params.id },
    orderBy: { order: 'asc' },
    include: {
      items: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return NextResponse.json(categories);
}

// POST /api/wishlists/[id]/categories - Create a new category
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  // Vérifier l'accès
  const hasAccess = 
    wishlist.userId === user.id || // Propriétaire
    wishlist.editors.some((editor: { id: string }) => editor.id === user.id) || // Éditeur
    (wishlist.childId && wishlist.child?.parents.some((parent: { id: string }) => parent.id === user.id)); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description } = await request.json();

  // Get the highest order value
  const highestOrder = await prisma.category.findFirst({
    where: { wishlistId: params.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const category = await prisma.category.create({
    data: {
      name,
      description,
      wishlistId: params.id,
      order: (highestOrder?.order || 0) + 1,
    },
  });

  return NextResponse.json(category);
}

// PATCH /api/wishlists/[id]/categories - Reorder categories
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  // Vérifier l'accès
  const hasAccess = 
    wishlist.userId === user.id || // Propriétaire
    wishlist.editors.some((editor: { id: string }) => editor.id === user.id) || // Éditeur
    (wishlist.childId && wishlist.child?.parents.some((parent: { id: string }) => parent.id === user.id)); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { categories } = await request.json();

  // Update each category's order
  await Promise.all(
    categories.map((category: { id: string; order: number }) =>
      prisma.category.update({
        where: { id: category.id },
        data: { order: category.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
