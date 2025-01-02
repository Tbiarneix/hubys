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

  const wishlist = await prisma.WishList.findUnique({
    where: { id: params.id },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  // Verify ownership
  if (wishlist.userId !== user.id) {
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

  const wishlist = await prisma.WishList.findUnique({
    where: { id: params.id },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  // Verify ownership
  if (wishlist.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, description } = await request.json();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const updatedWishlist = await prisma.WishList.update({
    where: { id: params.id },
    data: { title, description },
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

  const wishlist = await prisma.WishList.findUnique({
    where: { id: params.id },
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  // Verify ownership
  if (wishlist.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.WishList.delete({
    where: { id: params.id },
  });

  return new NextResponse(null, { status: 204 });
}
