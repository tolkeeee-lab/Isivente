"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
  Sparkles,
  Wallet
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import OrderRealtimeListener from "@/components/features/OrderRealtimeListener";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
    { name: "Bénéfice Réel & Finance", href: "/admin/finance", icon: Wallet },
    { name: "Commandes", href: "/admin/orders", icon: ShoppingBag },
    { name: "Produits & Liens", href: "/admin/products", icon: Package },
    { name: "Paramètres", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 flex font-sans text-slate-900 antialiased selection:bg-indigo-500/10 selection:text-indigo-600">
      
      {/* MOBILE SIDEBAR OVERLAY WITH BACKDROP BLUR */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* LOGO & BRAND */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-150">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-slate-900 block leading-none">Isivente</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Commerce Pro</span>
            </div>
          </Link>

          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* NAVIGATION */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Menu Principal
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10' 
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-4 h-4 stroke-[1.75] ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* QUICK CLIENT LINK & LOGOUT */}
        <div className="p-3.5 border-t border-slate-100 space-y-1.5">
          <a 
            href="/p/umei"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Voir la boutique</span>
            </span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">Live</span>
          </a>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2 w-full text-left rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 stroke-[1.75]" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-18 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Espace de gestion</span>
              <h2 className="font-display font-bold text-lg text-slate-900 leading-none">Console Marchand</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Listener Temps Réel & Contrôle Audio */}
            <OrderRealtimeListener />

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/60">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  AD
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">Administrateur</div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">Boutique Active</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
