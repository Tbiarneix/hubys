import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string; memberId: string }>
}

export async function PATCH(
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

    // Only admins can promote members
    if (currentUserMember.role !== "ADMIN") {
      return new NextResponse("Not authorized to promote members", { status: 403 });
    }

    // Don't promote if already admin
    if (targetMember.role === "ADMIN") {
      return new NextResponse("Member is already an admin", { status: 400 });
    }

    // Promote the member to admin
    await prisma.groupMember.update({
      where: {
        id: memberId
      },
      data: {
        role: "ADMIN"
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[MEMBER_PROMOTE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
