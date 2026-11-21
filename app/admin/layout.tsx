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
  LogOut,
  Menu,
  X,
  PauseCircle,
  Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ActiveTenantContext,
  clearStoredTenantContext,
  getCurrentUserStore,
  isFounderEmail,
  setStoredTenantContext,
} from "@/lib/storesStorage";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matcher: (p: string) => boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [tenantCtx, setTenantCtx] = useState<ActiveTenantContext | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Fermer le tiroir mobile lors d'un changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // ── NAVIGATION STRUCTURÉE PAR PÔLES (STANDARD LINEAR / SHOPIFY ADMIN) ──
  const navGroups: NavGroup[] = [
    {
      title: "Opérations",
      items: [
        {
          href: "/admin",
          label: "Tableau de bord",
          icon: LayoutDashboard,
          matcher: (p) => p === "/admin",
        },
        {
          href: "/admin/orders",
          label: "Commandes",
          icon: Package,
          matcher: (p) => p.startsWith("/admin/orders"),
        },
        {
          href: "/admin/prospects",
          label: "Relances",
          icon: Users,
          matcher: (p) => p.startsWith("/admin/prospects") || p.startsWith("/admin/whatsapp"),
        },
      ],
    },
    {
      title: "Croissance",
      items: [
        {
          href: "/admin/landings",
          label: "Pages Produits",
          icon: Store,
          matcher: (p) => p.startsWith("/admin/landings") || p.startsWith("/admin/studio"),
        },
        {
          href: "/admin/clicks",
          label: "Performances",
          icon: BarChart3,
          matcher: (p) => p.startsWith("/admin/clicks") || p.startsWith("/admin/tracker"),
        },
        {
          href: "/admin/finances",
          label: "Finances",
          icon: Wallet,
          matcher: (p) => p.startsWith("/admin/finances"),
        },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);

  const handleSignOut = async () => {
    clearStoredTenantContext();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6 text-slate-600 font-sans">
        <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500">
          Chargement de votre espace vendeur...
        </p>
      </div>
    );
  }

  // Verrouillage immédiat si la boutique du vendeur a été mise en PAUSE par le fondateur
  if (tenantCtx && !tenantCtx.isFounder && tenantCtx.storeId && !tenantCtx.storeActive) {
    const waPayUrl = `https://wa.me/2290192901817?text=${encodeURIComponent(
      `Bonjour Isivente, ma boutique "${tenantCtx.storeName}" (${tenantCtx.email}) est en pause. Je souhaite régler mon abonnement Mobile Money pour la réactiver.`
    )}`;
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <PauseCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
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
            className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>Activer mon abonnement sur WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const displayBrand = tenantCtx?.storeName || "Isivente";

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* En-tête Boutique */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/70 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
            {displayBrand.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <span className="font-bold text-sm text-slate-950 tracking-tight truncate block leading-tight">
              {displayBrand}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              {tenantCtx?.isFounder ? "Fondateur" : "Espace Vendeur"}
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Fermer le menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bouton action rapide */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/admin/landings"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle page produit</span>
        </Link>
      </div>

      {/* Groupes de navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.matcher(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                      isActive
                        ? "bg-slate-900/5 text-slate-950 font-bold"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-slate-950 stroke-[2.2]" : "text-slate-400 stroke-[1.75]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pied de Sidebar : Réglages & Déconnexion */}
      <div className="p-3 border-t border-slate-200/70 space-y-1 shrink-0 bg-white">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            pathname.startsWith("/admin/settings")
              ? "bg-slate-900/5 text-slate-950 font-bold"
              : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/70"
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Ma Boutique</span>
        </Link>

        {tenantCtx?.isFounder && (
          <Link
            href="/p/voiture-camera"
            target="_blank"
            className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-[13px] font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-all"
          >
            <span className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-slate-400" />
              <span>Voir la vitrine</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans antialiased flex">
      {/* ── SIDEBAR DESKTOP FIXE (240px) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-slate-200/80 z-40">
        {renderSidebarContent()}
      </aside>

      {/* ── TIROIR MOBILE (DRAWER) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white h-full shadow-xl border-r border-slate-200 z-10">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* ── ZONE PRINCIPALE ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* Barre supérieure Mobile / Tablette uniquement */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
          <div className="px-3 sm:px-5 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/admin" className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-extrabold text-[11px] shrink-0">
                  {displayBrand.slice(0, 2).toUpperCase()}
                </span>
                <span className="font-bold text-sm text-slate-950 tracking-tight truncate max-w-[140px]">
                  {displayBrand}
                </span>
              </Link>
            </div>

            <Link
              href="/admin/settings"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50"
              title="Réglages de ma boutique"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          {/* Raccourcis horizontaux rapides sur mobile */}
          <div className="border-t border-slate-100 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            {allNavItems.map((item) => {
              const isActive = item.matcher(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:text-slate-950 bg-slate-100/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </header>

        {/* Bandeau d'onboarding doux si nouvel utilisateur sans boutique configurée */}
        {tenantCtx && !tenantCtx.storeId && !pathname.startsWith("/admin/settings") && (
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
            <div className="bg-slate-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
              <span className="text-slate-200 leading-relaxed">
                <strong className="text-white">Bienvenue sur Isivente.</strong> Finalisez les réglages de votre boutique (nom, WhatsApp, pays) pour publier vos premières pages produits.
              </span>
              <Link
                href="/admin/settings"
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold whitespace-nowrap self-start sm:self-auto transition-colors"
              >
                Configurer ma boutique
              </Link>
            </div>
          </div>
        )}

        {/* Contenu principal aéré */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
