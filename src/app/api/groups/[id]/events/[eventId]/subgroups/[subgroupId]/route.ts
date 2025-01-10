import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Params {
  id: string;
  eventId: string;
  subgroupId: string;
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<Params> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activeAdults, activeChildren } = await request.json();

    // Vérifier si l'utilisateur fait partie du sous-groupe
    const subgroup = await prisma.subgroup.findUnique({
      where: {
        id: params.subgroupId,
        eventId: params.eventId,
      },
    });

    if (!subgroup) {
      return NextResponse.json(
        { error: "Subgroup not found" },
        { status: 404 }
      );
    }

    if (!subgroup.adults.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Not authorized to edit this subgroup" },
        { status: 403 }
      );
    }

    // Vérifier que les membres actifs font partie du sous-groupe
    const invalidActiveAdults = activeAdults.filter((id: string) => !subgroup.adults.includes(id));
    const invalidActiveChildren = activeChildren.filter((id: string) => !subgroup.children.includes(id));

    if (invalidActiveAdults.length > 0 || invalidActiveChildren.length > 0) {
      return NextResponse.json(
        { error: "Invalid active members" },
        { status: 400 }
      );
    }

    // Mettre à jour le sous-groupe
    const updatedSubgroup = await prisma.subgroup.update({
      where: {
        id: params.subgroupId,
      },
      data: {
        activeAdults,
        activeChildren,
      },
    });

    return NextResponse.json(updatedSubgroup);
  } catch (error) {
    console.error("Error updating subgroup:", error);
    return NextResponse.json(
      { error: "Failed to update subgroup" },
      { status: 500 }
    );
  }
}
