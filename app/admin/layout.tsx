"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MousePointerClick,
  Users,
  Target,
  ExternalLink,
  Store,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Vue d'ensemble",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/orders",
      label: "Commandes & Dispatch",
      icon: Package,
    },
    {
      href: "/admin/clicks",
      label: "Clics & Entonnoir Ads",
      icon: MousePointerClick,
    },
    {
      href: "/admin/prospects",
      label: "Paniers Abandonnés",
      icon: Users,
    },
    {
      href: "/admin/tracker",
      label: "Tracker UTM & ROI",
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans">
      {/* ── TOPBAR NAVIGATION ADMIN UNIFIÉE ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Logo / Marque */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                  IS
                </span>
                <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight hidden sm:inline">
                  Isivente <span className="text-indigo-600 font-bold text-xs uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">Admin</span>
                </span>
              </Link>
            </div>

            {/* Onglets de navigation principaux */}
            <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {navItems.map((item) => {
                const isActive = item.href === "/admin" 
                  ? pathname === "/admin" 
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Lien direct boutique */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Link
                href="/p/microscope"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Voir la boutique</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Contenu principal de chaque section */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
