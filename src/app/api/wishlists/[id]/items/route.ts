import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET /api/wishlists/[id]/items - Get all items for a wishlist
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    wishlist.editors.some(editor => editor.id === user.id) || // Éditeur
    (wishlist.childId && wishlist.child?.parents.some(parent => parent.id === user.id)); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { wishlistId: params.id },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(items);
}

// POST /api/wishlists/[id]/items - Create a new item
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    wishlist.editors.some(editor => editor.id === user.id) || // Éditeur
    (wishlist.childId && wishlist.child?.parents.some(parent => parent.id === user.id)); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, url, comment, categoryId } = await request.json();

  // Get the highest order value
  const highestOrder = await prisma.wishlistItem.findFirst({
    where: { wishlistId: params.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const item = await prisma.wishlistItem.create({
    data: {
      name,
      url,
      comment,
      categoryId,
      wishlistId: params.id,
      order: (highestOrder?.order || 0) + 1,
    },
  });

  return NextResponse.json(item);
}

// PATCH /api/wishlists/[id]/items/reorder - Reorder items
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    wishlist.editors.some(editor => editor.id === user.id) || // Éditeur
    (wishlist.child && wishlist.child.parents.some(parent => parent.id === user.id) && wishlist.userId === wishlist.child.id); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items } = await request.json();

  // Update each item's order
  await Promise.all(
    items.map((item: { id: string; order: number }) =>
      prisma.wishlistItem.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
