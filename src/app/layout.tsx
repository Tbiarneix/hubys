import type { Metadata } from "next";
import { luciole } from "@/font/custom-font";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Hubys",
  description: "Simplifiez votre vie quotidienne et vos moments partagés",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${luciole.className} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
