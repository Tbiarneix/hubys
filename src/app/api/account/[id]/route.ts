import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash, compare } from "bcrypt";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.id !== id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, email } = body;

    // Récupérer l'utilisateur actuel
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    if (currentPassword) {
      const isPasswordValid = await compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect" },
          { status: 400 }
        );
      }
    }

    // Préparer les données à mettre à jour
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    // Mettre à jour l'email si fourni et différent
    if (email && email !== user.email) {
      // Vérifier si l'email n'est pas déjà utilisé
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // Mettre à jour le mot de passe si fourni
    if (newPassword) {
      updateData.password = await hash(newPassword, 10);
    }

    // Si aucune donnée à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Aucune modification effectuée" },
        { status: 200 }
      );
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du compte" },
      { status: 500 }
    );
  }
}
