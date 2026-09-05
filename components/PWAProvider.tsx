"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // N'afficher la bannière d'installation QUE sur l'espace d'administration (/admin), jamais sur les pages de vente (/p/)
  const isAdminRoute = pathname?.startsWith("/admin") || pathname === "/login";

  useEffect(() => {
    // 1. Enregistrement du Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => {
            console.warn("PWA Service Worker registration notice:", err);
          });
      });
    }

    // 2. Écoute de l'événement BeforeInstallPrompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* La bannière d'installation ne s'affiche JAMAIS sur les pages de vente client */}
      {isInstallable && isAdminRoute && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3.5 px-4 rounded-2xl shadow-2xl border border-[#0E7C8C]/40 flex items-center gap-3.5 backdrop-blur-md">
          <img
            src="/icons/icon-192x192.png"
            alt="Logo Isivente"
            className="w-9 h-9 rounded-xl shadow-sm shrink-0 border border-white/10"
          />
          <div className="text-xs">
            <p className="font-bold text-white tracking-tight">Installer Isivente</p>
            <p className="text-slate-400 text-[11px]">Accès rapide & notifications en temps réel</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-[#0E7C8C] hover:bg-[#0b6471] text-white text-xs font-bold py-1.5 px-3.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer ml-1"
          >
            Installer
          </button>
          <button
            onClick={() => setIsInstallable(false)}
            className="text-slate-400 hover:text-white text-xs ml-1 cursor-pointer p-1"
            title="Fermer"
          >
            ✕
          </button>
        </div>
      )}
      {children}
    </>
  );
}
