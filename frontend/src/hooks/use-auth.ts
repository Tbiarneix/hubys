"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const user: User | undefined = session?.user ? {
    id: session.user.id,
    email: session.user.email || "",
    firstName: session.user.name?.split(" ")[0] || "",
    lastName: session.user.name?.split(" ").slice(1).join(" ") || undefined,
    avatar: session.user.image || undefined,
    children: [] // Ajout du tableau children requis par l'interface User
  } : undefined;

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Erreur",
          description: "Identifiants incorrects",
          variant: "destructive",
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return {
    user,
    isAuthenticated: !!session,
    login,
    logout,
  };
}
