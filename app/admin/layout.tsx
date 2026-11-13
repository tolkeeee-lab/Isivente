"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Users,
  Store,
  ExternalLink,
  Wallet,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Marquer définitivement ce navigateur comme administrateur pour exclure à 100% ses visites
  useEffect(() => {
    try {
      localStorage.setItem("isivente_is_admin", "true");
      sessionStorage.setItem("isivente_is_admin", "true");
      document.cookie = "isivente_admin=true; path=/; max-age=31536000; SameSite=Lax";
    } catch {}
  }, []);

  // ── 5 PÔLES MAJEURS ÉPURÉS (Fini l'encombrement des 8 onglets) ──
  const navItems = [
    {
      href: "/admin",
      label: "Tableau de Bord",
      icon: LayoutDashboard,
      matcher: (p: string) => p === "/admin",
    },
    {
      href: "/admin/orders",
      label: "Commandes & Livraisons",
      icon: Package,
      matcher: (p: string) => p.startsWith("/admin/orders"),
    },
    {
      href: "/admin/finances",
      label: "Finances & Bénéfices",
      icon: Wallet,
      matcher: (p: string) => p.startsWith("/admin/finances"),
    },
    {
      href: "/admin/prospects",
      label: "Relances WhatsApp",
      icon: Users,
      matcher: (p: string) => p.startsWith("/admin/prospects") || p.startsWith("/admin/whatsapp"),
    },
    {
      href: "/admin/clicks",
      label: "Performances & Pubs",
      icon: BarChart3,
      matcher: (p: string) => p.startsWith("/admin/clicks") || p.startsWith("/admin/tracker"),
    },
    {
      href: "/admin/landings",
      label: "Catalogue & Pages",
      icon: Store,
      matcher: (p: string) => p.startsWith("/admin/landings") || p.startsWith("/admin/studio"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* ── TOPBAR NAVIGATION ADMIN UNIFIÉE ET ÉPURÉE ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
          
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">
            {/* Logo / Marque */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-2xs">
                  IS
                </span>
                <span className="font-display font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Isivente <span className="text-indigo-600 font-bold text-xs uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">Admin</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation épurée */}
            <nav className="hidden md:flex items-center gap-1.5 py-1">
              {navItems.map((item) => {
                const isActive = item.matcher(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Lien boutique */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/p/voiture-camera"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs"
              >
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Voir la boutique</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Ligne 2 : Navigation mobile scrollable propre (5 onglets nets) */}
          <div className="md:hidden border-t border-slate-100 -mx-3 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = item.matcher(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 bg-slate-100/70"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </header>

      {/* Contenu principal de chaque section */}
      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
