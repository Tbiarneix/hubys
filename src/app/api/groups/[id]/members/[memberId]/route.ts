import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; memberId: string }>
}

export async function DELETE(
  request: Request,
  context: Params
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, memberId } = params;

    // Get the group and check if the user is authorized
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            OR: [
              { userId: session.user.id },
              { id: memberId }
            ]
          }
        }
      }
    });

    if (!group) {
      return new NextResponse("Group not found", { status: 404 });
    }

    const currentUserMember = group.members.find(m => m.userId === session.user.id);
    const targetMember = group.members.find(m => m.id === memberId);

    if (!currentUserMember) {
      return new NextResponse("User is not a member of this group", { status: 403 });
    }

    if (!targetMember) {
      return new NextResponse("Target member not found", { status: 404 });
    }

    // Check if user is authorized to remove the member
    const isAdmin = currentUserMember.role === "ADMIN";
    const isSelfRemoval = currentUserMember.id === memberId;

    if (!isAdmin && !isSelfRemoval) {
      return new NextResponse("Not authorized to remove this member", { status: 403 });
    }

    // If the member being removed is the last admin, prevent removal
    if (targetMember.role === "ADMIN") {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: id,
          role: "ADMIN"
        }
      });

      if (adminCount === 1) {
        return new NextResponse(
          "Cannot remove the last admin. Please promote another member to admin first.",
          { status: 400 }
        );
      }
    }

    // Remove the member from event subgroups first
    const groupEvents = await prisma.event.findMany({
      where: {
        groupId: id
      },
      select: {
        id: true,
        subgroups: {
          select: {
            id: true,
            adults: true,
            children: true,
            activeAdults: true,
            activeChildren: true
          }
        }
      }
    });

    // Update each subgroup to remove the user from all arrays and delete associated presences
    for (const event of groupEvents) {
      for (const subgroup of event.subgroups) {
        const userInSubgroup = subgroup.adults.includes(targetMember.userId) ||
                             subgroup.children.includes(targetMember.userId) ||
                             subgroup.activeAdults.includes(targetMember.userId) ||
                             subgroup.activeChildren.includes(targetMember.userId);

        if (userInSubgroup) {
          // Delete all presences for this subgroup
          await prisma.subgroupPresence.deleteMany({
            where: {
              subgroupId: subgroup.id,
              eventId: event.id
            }
          });

          // Update the subgroup arrays
          await prisma.subgroup.update({
            where: {
              id: subgroup.id
            },
            data: {
              adults: subgroup.adults.filter(id => id !== targetMember.userId),
              children: subgroup.children.filter(id => id !== targetMember.userId),
              activeAdults: subgroup.activeAdults.filter(id => id !== targetMember.userId),
              activeChildren: subgroup.activeChildren.filter(id => id !== targetMember.userId)
            }
          });
        }
      }
    }

    // Remove the member from the main group
    await prisma.groupMember.delete({
      where: {
        id: memberId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEMBER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
