"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Truck, LogOut, Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
    { name: "Commandes", href: "/admin/orders", icon: ShoppingBag },
    { name: "Livreurs", href: "/admin/delivery", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-panel flex flex-col md:flex-row font-sans text-ink">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r-2 border-ink md:min-h-screen flex flex-col">
        <div className="p-6 border-b-2 border-ink flex items-center gap-3">
          <div className="w-8 h-8 bg-magenta text-white rounded-lg flex items-center justify-center font-display font-bold text-lg shadow-sm">
            I
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Isivente</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                  isActive 
                  ? "bg-ink text-white shadow-sm" 
                  : "text-ink-soft hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-magenta" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t-2 border-ink">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
