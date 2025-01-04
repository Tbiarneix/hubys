import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email } = await request.json();
    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Check if partner exists
    const partnerUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Create partner invitation
    const invitation = await prisma.partnerInvitation.create({
      data: {
        fromUserId: session.user.id,
        email,
        status: "PENDING",
        ...(partnerUser && { toUserId: partnerUser.id }),
      },
    });

    // If user exists, create notification (to be implemented later)
    if (partnerUser) {
      // TODO: Create notification for existing user
    } else {
      // TODO: Send email to non-existing user
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("[PARTNER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Chercher d'abord une invitation acceptée
    const acceptedPartnership = await prisma.partnerInvitation.findFirst({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id },
        ],
        status: "ACCEPTED",
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (acceptedPartnership) {
      return NextResponse.json(acceptedPartnership);
    }

    // Si pas de partenariat accepté, chercher une invitation en attente envoyée
    const sentInvitation = await prisma.partnerInvitation.findFirst({
      where: {
        fromUserId: session.user.id,
        status: "PENDING",
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (sentInvitation) {
      return NextResponse.json(sentInvitation);
    }

    // Enfin, chercher une invitation reçue en attente
    const receivedInvitation = await prisma.partnerInvitation.findFirst({
      where: {
        toUserId: session.user.id,
        status: "PENDING",
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(receivedInvitation);
  } catch (error) {
    console.error("[PARTNER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { invitationId, status } = await request.json();
    if (!invitationId || !status) {
      return new NextResponse("InvitationId and status are required", { status: 400 });
    }

    // Update invitation status
    const invitation = await prisma.partnerInvitation.update({
      where: {
        id: invitationId,
        toUserId: session.user.id,
      },
      data: { status },
      include: {
        fromUser: {
          include: {
            children: {
              include: {
                parents: true
              }
            }
          }
        }
      }
    });

    // Si accepté, ajouter le partenaire comme parent des enfants
    if (status === "ACCEPTED" && invitation.fromUser.children.length > 0) {
      // Mettre à jour chaque enfant pour ajouter le nouveau parent
      await Promise.all(
        invitation.fromUser.children.map(child =>
          prisma.child.update({
            where: { id: child.id },
            data: {
              parents: {
                connect: { id: session.user.id }
              }
            }
          })
        )
      );
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("[PARTNER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { invitationId } = await request.json();

    // Supprimer uniquement l'invitation de partenariat
    await prisma.partnerInvitation.delete({
      where: {
        id: invitationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PARTNER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
