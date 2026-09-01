import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Isivente - Plateforme de Gestion & Vente",
  description: "Solution moderne de point de vente, gestion des stocks et suivi des ventes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
