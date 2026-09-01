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
        <div className="fixed bottom-4 right-4 z-50 bg-[#241B36] text-white p-3.5 px-4 rounded-2xl shadow-2xl border border-[#8B6FE0]/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FF5C93] flex items-center justify-center font-bold text-xs">
            ISI
          </div>
          <div className="text-xs">
            <p className="font-bold">Installer l'application Isivente</p>
            <p className="text-gray-300 text-[11px]">Accès rapide aux commandes</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-[#FF5C93] hover:bg-[#E13D74] text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Installer
          </button>
          <button
            onClick={() => setIsInstallable(false)}
            className="text-gray-400 hover:text-white text-xs ml-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      {children}
    </>
  );
}
