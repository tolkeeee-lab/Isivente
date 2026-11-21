"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Users,
  Store,
  ExternalLink,
  Wallet,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ActiveTenantContext,
  clearStoredTenantContext,
  getCurrentUserStore,
  isFounderEmail,
  setStoredTenantContext,
} from "@/lib/storesStorage";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [tenantCtx, setTenantCtx] = useState<ActiveTenantContext | null>(null);

  // Verrouillage strict + résolution du contexte multi-boutiques AVANT tout rendu enfant
  useEffect(() => {
    let mounted = true;

    async function checkAuthAndTenant() {
      try {
        localStorage.setItem("isivente_is_admin", "true");
        sessionStorage.setItem("isivente_is_admin", "true");
        document.cookie = "isivente_admin=true; path=/; max-age=31536000; SameSite=Lax";
      } catch {}

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          clearStoredTenantContext();
          router.replace("/login");
          return;
        }

        const isFounder = isFounderEmail(user.email);
        const { store } = await getCurrentUserStore();

        if (!mounted) return;

        const ctx: ActiveTenantContext = {
          isFounder,
          storeId: store?.id || null,
          storeName: store?.name || (isFounder ? "Isivente" : "Ma Boutique"),
          storeActive: store ? store.is_active !== false : true,
          storePlan: store?.plan || "trial",
          email: user.email || null,
        };
        setStoredTenantContext(ctx);
        setTenantCtx(ctx);
        setAuthReady(true);
      } catch {
        if (!mounted) return;
        router.replace("/login");
      }
    }

    checkAuthAndTenant();
    return () => {
      mounted = false;
    };
  }, [router]);

  // ── 6 PÔLES MAJEURS ÉPURÉS ──
  const navItems = [
    {
      href: "/admin",
      label: "Tableau de Bord",
      icon: LayoutDashboard,
      matcher: (p: string) => p === "/admin",
    },
    {
      href: "/admin/orders",
      label: "Commandes",
      icon: Package,
      matcher: (p: string) => p.startsWith("/admin/orders"),
    },
    {
      href: "/admin/finances",
      label: "Finances",
      icon: Wallet,
      matcher: (p: string) => p.startsWith("/admin/finances"),
    },
    {
      href: "/admin/prospects",
      label: "Relances",
      icon: Users,
      matcher: (p: string) => p.startsWith("/admin/prospects") || p.startsWith("/admin/whatsapp"),
    },
    {
      href: "/admin/clicks",
      label: "Performances",
      icon: BarChart3,
      matcher: (p: string) => p.startsWith("/admin/clicks") || p.startsWith("/admin/tracker"),
    },
    {
      href: "/admin/landings",
      label: "Pages Produits",
      icon: Store,
      matcher: (p: string) => p.startsWith("/admin/landings") || p.startsWith("/admin/studio"),
    },
  ];

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-600 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin mb-3" />
        <p className="text-xs font-semibold">Vérification sécurisée de votre espace vendeur...</p>
      </div>
    );
  }

  // Verrouillage immédiat si la boutique du vendeur a été mise en PAUSE par le fondateur
  if (tenantCtx && !tenantCtx.isFounder && tenantCtx.storeId && !tenantCtx.storeActive) {
    const waPayUrl = `https://wa.me/2290192901817?text=${encodeURIComponent(
      `Bonjour Isivente, ma boutique "${tenantCtx.storeName}" (${tenantCtx.email}) est en pause. Je souhaite régler mon abonnement Mobile Money pour la réactiver.`
    )}`;
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto font-black text-xl">
            ⏸
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">
              Votre boutique est en pause
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              L&apos;accès à votre espace vendeur et vos pages produits sont temporairement suspendus en attente du règlement de votre abonnement Isivente.
            </p>
          </div>
          <a
            href={waPayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>Activer mon abonnement sur WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={async () => {
              clearStoredTenantContext();
              await supabase.auth.signOut();
              router.replace("/login");
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const displayBrand = tenantCtx?.storeName || "Isivente";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* ── TOPBAR NAVIGATION ADMIN UNIFIÉE ET ÉPURÉE ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16 gap-2">
            {/* Logo / Marque de la boutique connectée */}
            <div className="flex items-center gap-2 shrink-0 min-w-0">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
                  {displayBrand.slice(0, 2).toUpperCase()}
                </span>
                <span className="font-display font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate max-w-[140px]">
                  {displayBrand}
                </span>
                <span className="hidden lg:inline-block text-indigo-600 font-bold text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">
                  {tenantCtx?.isFounder ? "Fondateur" : "Vendeur"}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation épurée */}
            <nav className="hidden md:flex items-center gap-1 py-1">
              {navItems.map((item) => {
                const isActive = item.matcher(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

            {/* Réglages SaaS & Lien boutique */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/admin/settings"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all shadow-2xs ${
                  pathname.startsWith("/admin/settings")
                    ? "bg-slate-900 text-white border-slate-900"
                    : "text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                }`}
                title="Réglages de ma boutique & compte vendeur"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Ma Boutique</span>
              </Link>
              {tenantCtx?.isFounder && (
                <Link
                  href="/p/voiture-camera"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs"
                  title="Ouvrir la boutique"
                >
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              )}
            </div>
          </div>

          {/* Ligne 2 : Navigation mobile scrollable propre */}
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

      {/* Bandeau d'onboarding doux si nouvel utilisateur sans boutique configurée */}
      {tenantCtx && !tenantCtx.storeId && !pathname.startsWith("/admin/settings") && (
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-950">
            <span>
              <strong>Bienvenue !</strong> Finalisez les réglages de votre boutique (nom, WhatsApp, pays) pour publier vos premières pages produits.
            </span>
            <Link
              href="/admin/settings"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold whitespace-nowrap self-start sm:self-auto"
            >
              Configurer ma boutique
            </Link>
          </div>
        </div>
      )}

      {/* Contenu principal de chaque section */}
      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
