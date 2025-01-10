import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// DELETE /api/wishlists/[id]/items/[itemId] - Delete an item
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
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
    (wishlist.child && wishlist.child.parents.some((parent: { id: string }) => parent.id === user.id) && wishlist.userId === wishlist.child.id); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const item = await prisma.wishlistItem.findUnique({
    where: { id: params.itemId },
  });

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  if (item.wishlistId !== params.id) {
    return NextResponse.json({ error: 'Item does not belong to this wishlist' }, { status: 400 });
  }

  await prisma.wishlistItem.delete({
    where: { id: params.itemId },
  });

  return new NextResponse(null, { status: 204 });
}

// PUT /api/wishlists/[id]/items/[itemId] - Update an item
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
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
    (wishlist.child && wishlist.child.parents.some((parent: { id: string }) => parent.id === user.id) && wishlist.userId === wishlist.child.id); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const item = await prisma.wishlistItem.findUnique({
    where: { id: params.itemId },
  });

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  if (item.wishlistId !== params.id) {
    return NextResponse.json({ error: 'Item does not belong to this wishlist' }, { status: 400 });
  }

  const data = await request.json();

  const updatedItem = await prisma.wishlistItem.update({
    where: { id: params.itemId },
    data: {
      name: data.name,
      url: data.url || null,
      comment: data.comment || null,
      categoryId: data.categoryId || null,
    },
  });

  return NextResponse.json(updatedItem);
}
