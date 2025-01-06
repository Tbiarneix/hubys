import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET /api/wishlists/[id] - Get a specific wishlist
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

  return NextResponse.json(wishlist);
}

// PATCH /api/wishlists/[id] - Update a wishlist
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
    (wishlist.childId && wishlist.child?.parents.some(parent => parent.id === user.id)); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description } = await request.json();

  const updatedWishlist = await prisma.wishList.update({
    where: { id: params.id },
    data: {
      title,
      description,
    },
    include: {
      editors: true,
      child: {
        include: {
          parents: true
        }
      }
    }
  });

  return NextResponse.json(updatedWishlist);
}

// DELETE /api/wishlists/[id] - Delete a wishlist
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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
    (wishlist.child && wishlist.child.parents.some(parent => parent.id === user.id && wishlist.userId === wishlist.child.id)); // Parent de l'enfant

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.wishList.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
