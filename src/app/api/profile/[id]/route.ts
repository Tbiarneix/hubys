/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

type Params = {
  params: Promise<{ id: string }>
}

// GET /api/profile/[id]
export async function GET(
  request: Request,
  context: Params
) {
  try {
    const { id } = await context.params;
    const profile = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        birthDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching profile" },
      { status: 500 }
    );
  }
}

// PUT /api/profile/[id]
export async function PUT(
  request: Request,
  context: Params
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.id !== id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, bio, image, birthDate } = body;

    const updatedProfile = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        bio: bio,
        avatar: image,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        birthDate: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/[id]
export async function DELETE(
  request: Request,
  context: Params
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.id !== id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        groupMemberships: true,
        groupMessages: true,
        groupDeletionVotes: true,
        sentGroupInvitations: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Supprimer toutes les données associées à l'utilisateur
    const result = await prisma.$transaction(async (tx) => {
      // 1. Supprimer les appartenances aux groupes
      await tx.groupMember.deleteMany({
        where: { userId: id }
      });

      // 2. Supprimer les messages de groupe
      await tx.groupMessage.deleteMany({
        where: { userId: id }
      });

      // 3. Supprimer les votes de suppression de groupe
      await tx.groupDeletionVote.deleteMany({
        where: { userId: id }
      });

      // 4. Supprimer les invitations de groupe
      await tx.groupInvitation.deleteMany({
        where: { fromUserId: id }
      });

      // 5. Supprimer les invitations de partenaire
      await tx.partnerInvitation.deleteMany({
        where: {
          OR: [
            { fromUserId: id },
            { toUserId: id }
          ]
        }
      });

      // 6. Gérer les enfants
      const children = await tx.child.findMany({
        where: {
          parents: {
            some: { id }
          }
        },
        include: {
          parents: true,
          wishlists: {
            include: {
              items: true,
              categories: true
            }
          }
        }
      });

      for (const child of children) {
        if (child.parents.length <= 1) {
          // Supprimer d'abord les items et catégories des wishlists
          for (const wishlist of child.wishlists) {
            await tx.wishlistItem.deleteMany({
              where: { wishlistId: wishlist.id }
            });
            await tx.category.deleteMany({
              where: { wishlistId: wishlist.id }
            });
          }
          
          // Puis supprimer les wishlists
          await tx.wishList.deleteMany({
            where: { childId: child.id }
          });
          
          // Enfin supprimer l'enfant
          await tx.child.delete({
            where: { id: child.id }
          });
        } else {
          // Sinon retirer juste la relation avec ce parent
          await tx.child.update({
            where: { id: child.id },
            data: {
              parents: {
                disconnect: { id }
              }
            }
          });
        }
      }

      // 7. Supprimer les wishlists de l'utilisateur
      const userWishlists = await tx.wishList.findMany({
        where: { userId: id },
        include: {
          items: true,
          categories: true
        }
      });

      for (const wishlist of userWishlists) {
        await tx.wishlistItem.deleteMany({
          where: { wishlistId: wishlist.id }
        });
        await tx.category.deleteMany({
          where: { wishlistId: wishlist.id }
        });
      }

      await tx.wishList.deleteMany({
        where: { userId: id }
      });

      // 8. Finalement, supprimer l'utilisateur
      return await tx.user.delete({
        where: { id }
      });
    });

    if (!result) {
      throw new Error("Failed to delete user");
    }

    return NextResponse.json(
      { message: "Profile and associated data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { error: "Error deleting profile" },
      { status: 500 }
    );
  }
}
