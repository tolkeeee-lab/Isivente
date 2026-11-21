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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
          label: "Pages produits",
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
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-[#525252] font-sans">
        <div className="w-6 h-6 rounded-full border-2 border-black/[0.08] border-t-[#171717] animate-spin mb-3" />
        <p className="text-[13px] font-normal text-[#737373]">
          Chargement de votre espace vendeur
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
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 font-sans text-[#171717]">
        <div className="max-w-md w-full bg-white rounded-[16px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-8 text-center space-y-5">
          <div className="w-10 h-10 rounded-[10px] bg-[#f4f4f5] text-[#dc2626] flex items-center justify-center mx-auto">
            <PauseCircle className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-[20px] font-medium text-[#171717] leading-snug">
              Boutique en pause
            </h1>
            <p className="text-[14px] text-[#525252] leading-relaxed">
              L&apos;accès à votre espace vendeur et vos pages produits sont temporairement suspendus en attente du règlement de votre abonnement Isivente.
            </p>
          </div>
          <a
            href={waPayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 px-4 rounded-[8px] bg-[#15803d] hover:bg-[#166534] text-white font-medium text-[14px] inline-flex items-center justify-center transition-colors duration-150"
          >
            Activer mon abonnement sur WhatsApp
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-[13px] font-normal text-[#737373] hover:text-[#171717] transition-colors duration-150 cursor-pointer"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const displayBrand = tenantCtx?.storeName || "Isivente";

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête Boutique */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-black/[0.08] shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-[6px] bg-[#171717] text-white flex items-center justify-center font-medium text-[12px] shrink-0">
            {displayBrand.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <span className="font-medium text-[15px] text-[#171717] truncate block leading-none">
              {displayBrand}
            </span>
            <span className="text-[12px] font-normal text-[#737373] block mt-1 leading-none">
              {tenantCtx?.isFounder ? "Fondateur" : "Vendeur"}
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-[8px] text-[#737373] hover:text-[#171717] hover:bg-[#f4f4f5] transition-colors duration-150"
          aria-label="Fermer le menu"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Action principale */}
      <div className="px-4 pt-4">
        <Link
          href="/admin/landings"
          className="w-full h-9 inline-flex items-center justify-center gap-2 px-3 rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium transition-colors duration-150"
        >
          <Plus className="w-4 h-4 stroke-[1.5]" />
          <span>Nouvelle page produit</span>
        </Link>
      </div>

      {/* Groupes de navigation : 24px au-dessus du titre, 8px en-dessous, lignes 36px */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mt-6">
            <div className="px-2.5 mb-2 text-[12px] font-normal text-[#737373]">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.matcher(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`h-9 flex items-center gap-2.5 px-2.5 rounded-[8px] text-[14px] transition-colors duration-150 ${
                      isActive
                        ? "bg-[#f4f4f5] text-[#171717] font-medium"
                        : "text-[#525252] hover:text-[#171717] hover:bg-[#f4f4f5]/60 font-normal"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 stroke-[1.5] ${
                        isActive ? "text-[#171717]" : "text-[#737373]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pied de Sidebar */}
      <div className="p-4 border-t border-black/[0.08] space-y-1 shrink-0">
        <Link
          href="/admin/settings"
          className={`h-9 flex items-center gap-2.5 px-2.5 rounded-[8px] text-[14px] transition-colors duration-150 ${
            pathname.startsWith("/admin/settings")
              ? "bg-[#f4f4f5] text-[#171717] font-medium"
              : "text-[#525252] hover:text-[#171717] hover:bg-[#f4f4f5]/60 font-normal"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0 stroke-[1.5] text-[#737373]" />
          <span>Ma boutique</span>
        </Link>

        {tenantCtx?.isFounder && (
          <Link
            href="/p/voiture-camera"
            target="_blank"
            className="h-9 flex items-center justify-between gap-2 px-2.5 rounded-[8px] text-[14px] font-normal text-[#525252] hover:text-[#171717] hover:bg-[#f4f4f5]/60 transition-colors duration-150"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Store className="w-4 h-4 shrink-0 stroke-[1.5] text-[#737373]" />
              <span className="truncate">Vitrine publique</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 stroke-[1.5] text-[#737373]" />
          </Link>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full h-9 flex items-center gap-2.5 px-2.5 rounded-[8px] text-[14px] font-normal text-[#737373] hover:text-[#dc2626] hover:bg-[#f4f4f5]/60 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 stroke-[1.5]" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-sans antialiased flex">
      {/* Sidebar desktop 256px */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-black/[0.08] z-40">
        {renderSidebarContent()}
      </aside>

      {/* Tiroir mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/25"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white h-full border-r border-black/[0.08] z-10">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Barre supérieure mobile uniquement */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-black/[0.08]">
          <div className="px-4 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-[8px] text-[#525252] hover:text-[#171717] hover:bg-[#f4f4f5] transition-colors duration-150"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-4 h-4 stroke-[1.5]" />
              </button>
              <Link href="/admin" className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-[6px] bg-[#171717] text-white flex items-center justify-center font-medium text-[11px] shrink-0">
                  {displayBrand.slice(0, 2).toUpperCase()}
                </span>
                <span className="font-medium text-[15px] text-[#171717] truncate max-w-[150px]">
                  {displayBrand}
                </span>
              </Link>
            </div>

            <Link
              href="/admin/settings"
              className="p-2 rounded-[8px] border border-black/[0.08] text-[#525252] hover:text-[#171717] hover:bg-[#f4f4f5] transition-colors duration-150"
              title="Réglages de ma boutique"
            >
              <Settings className="w-4 h-4 stroke-[1.5]" />
            </Link>
          </div>

          <div className="border-t border-black/[0.06] px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            {allNavItems.map((item) => {
              const isActive = item.matcher(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-[8px] text-[13px] transition-colors duration-150 shrink-0 whitespace-nowrap ${
                    isActive
                      ? "bg-[#171717] text-white font-medium"
                      : "text-[#525252] hover:text-[#171717] bg-[#f4f4f5] font-normal"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 stroke-[1.5]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </header>

        {/* Bandeau d'onboarding si boutique non configurée */}
        {tenantCtx && !tenantCtx.storeId && !pathname.startsWith("/admin/settings") && (
          <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-white border border-black/[0.08] rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <span className="text-[#525252]">
                <strong className="font-medium text-[#171717]">Configuration requise</strong> — renseignez le nom de votre boutique et votre numéro WhatsApp pour publier vos pages produits
              </span>
              <Link
                href="/admin/settings"
                className="h-9 px-4 rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white font-medium text-[13px] inline-flex items-center justify-center whitespace-nowrap self-start sm:self-auto transition-colors duration-150"
              >
                Configurer ma boutique
              </Link>
            </div>
          </div>
        )}

        {/* Contenu principal fluide */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
