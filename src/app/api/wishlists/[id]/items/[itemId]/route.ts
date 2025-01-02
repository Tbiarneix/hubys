import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// DELETE /api/wishlists/[id]/items/[itemId] - Delete an item
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; itemId: string }> }
) {
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
  });

  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }

  if (wishlist.userId !== user.id) {
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
