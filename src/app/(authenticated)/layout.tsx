'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    redirect("/");
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <Header />
      <main className="min-h-screen w-full pl-0 transition-all duration-300 ml-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}
