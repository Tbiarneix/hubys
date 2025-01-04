/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET /api/profile/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  try {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: { params: any }
) {
  const { id } = await params;
  try {
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
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Supprimer toutes les données associées à l'utilisateur
    await prisma.$transaction(async (tx) => {
      // Supprimer les invitations de partenaire
      await tx.partnerInvitation.deleteMany({
        where: {
          OR: [
            { fromUserId: id },
            { toUserId: id }
          ]
        }
      });

      // Gérer les enfants
      const children = await tx.child.findMany({
        where: {
          parents: {
            some: {
              id: id
            }
          }
        },
        include: {
          parents: true
        }
      });

      // Pour chaque enfant
      for (const child of children) {
        if (child.parents.length <= 1) {
          // Si c'est le seul parent, supprimer l'enfant
          await tx.child.delete({
            where: {
              id: child.id
            }
          });
        } else {
          // Sinon retirer juste la relation avec ce parent
          await tx.child.update({
            where: {
              id: child.id
            },
            data: {
              parents: {
                disconnect: {
                  id: id
                }
              }
            }
          });
        }
      }

      // Supprimer les wishlists et leurs items
      const wishlists = await tx.wishList.findMany({
        where: {
          userId: id
        },
        select: {
          id: true
        }
      });

      const wishlistIds = wishlists.map(w => w.id);

      await tx.wishlistItem.deleteMany({
        where: {
          wishlistId: {
            in: wishlistIds
          }
        }
      });

      await tx.wishList.deleteMany({
        where: {
          userId: id
        }
      });

      // Supprimer l'utilisateur
      await tx.user.delete({
        where: {
          id: id
        }
      });
    });

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
