"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingBag, CheckCircle2, Truck, Zap, ChevronRight, Sparkles, X } from "lucide-react";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";

export interface DynamicNotificationPayload {
  title: string;
  subtitle: string;
  badge?: string;
  price?: string | number;
  icon?: "order" | "shipping" | "stock" | "custom";
  accentColor?: string;
  duration?: number;
}

const BENIN_CITIES = ["Cotonou", "Calavi", "Porto-Novo", "Parakou", "Bohicon", "Ouidah"];
const BUYER_NAMES = [
  "Prosper K.",
  "Reine A.",
  "Marcel D.",
  "Gérard M.",
  "Christelle T.",
  "Rodrigue S.",
  "Amina B.",
  "Dossou F.",
  "Estelle N.",
];

export function triggerDynamicIsland(payload: DynamicNotificationPayload) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("isivente:dynamic-island", { detail: payload }));
  }
}

export default function DynamicIsland({ slug }: { slug?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<DynamicNotificationPayload | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const product = slug ? DEFAULT_CATALOG_MAP[slug.toLowerCase()] : null;
  const productPrice = product?.price
    ? new Intl.NumberFormat("fr-FR").format(product.price) + " F"
    : "14 900 F";

  const showNotification = useCallback((payload: DynamicNotificationPayload) => {
    if (dismissed) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    setCurrentNotification(payload);
    setIsOpen(true);

    const dur = payload.duration || 5500;
    hideTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, dur);
  }, [dismissed]);

  // Écoute des événements personnalisés déclenchés depuis l'app
  useEffect(() => {
    const handleCustomNotify = (e: Event) => {
      const customEvent = e as CustomEvent<DynamicNotificationPayload>;
      if (customEvent.detail) {
        showNotification(customEvent.detail);
      }
    };

    window.addEventListener("isivente:dynamic-island", handleCustomNotify);
    return () => window.removeEventListener("isivente:dynamic-island", handleCustomNotify);
  }, [showNotification]);

  // Boucle de preuves sociales (Social Proof)
  useEffect(() => {
    if (dismissed) return;

    const generateRandomSocialProof = (): DynamicNotificationPayload => {
      const randomBuyer = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
      const randomCity = BENIN_CITIES[Math.floor(Math.random() * BENIN_CITIES.length)];
      const randomMinutes = Math.floor(Math.random() * 8) + 1;

      return {
        title: `${randomBuyer} (${randomCity})`,
        subtitle: `Vient de commander • Il y a ${randomMinutes} min`,
        badge: "Commande validée",
        price: productPrice,
        icon: "order",
        accentColor: "#10b981",
      };
    };

    // Premier affichage après 6 secondes
    const initialTimer = setTimeout(() => {
      showNotification(generateRandomSocialProof());
    }, 6000);

    // Répétition toutes les 38 secondes
    loopTimerRef.current = setInterval(() => {
      showNotification(generateRandomSocialProof());
    }, 38000);

    return () => {
      clearTimeout(initialTimer);
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [productPrice, showNotification, dismissed]);

  const handleClick = () => {
    const orderSection = document.getElementById("commander");
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (dismissed) return null;

  return (
    <aside
      aria-label="Notifications Isivente en direct"
      className={`fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none max-w-[94vw] ${
        isOpen
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "-translate-y-14 opacity-0 scale-90 pointer-events-none"
      }`}
    >
      <div
        onClick={handleClick}
        className="cursor-pointer relative bg-black/95 text-white backdrop-blur-xl border border-white/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_20px_45px_-10px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden w-[360px] sm:w-[410px] max-w-[94vw] p-3 sm:p-3.5 rounded-3xl"
      >
        {/* Lueur d'ambiance Apple Dynamic Island */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-40" />

        {/* CONTENU DE LA NOTIFICATION DÉPLOYÉE */}
        {currentNotification && (
          <div className="relative flex items-center justify-between gap-3 text-left">
            {/* Icône / Avatar interactif */}
            <div className="relative shrink-0 w-9 h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              {currentNotification.icon === "order" && (
                <ShoppingBag className="w-4 h-4 text-emerald-400 stroke-[2]" />
              )}
              {currentNotification.icon === "shipping" && (
                <Truck className="w-4 h-4 text-blue-400 stroke-[2]" />
              )}
              {currentNotification.icon === "stock" && (
                <Zap className="w-4 h-4 text-amber-400 stroke-[2]" />
              )}
              {currentNotification.icon === "custom" && (
                <Sparkles className="w-4 h-4 text-purple-400 stroke-[2]" />
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full" />
            </div>

            {/* Titre & Subtitle */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight truncate">
                  {currentNotification.title}
                </span>
                {currentNotification.badge && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {currentNotification.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {currentNotification.subtitle}
              </p>
            </div>

            {/* Prix & Action */}
            <div className="shrink-0 flex items-center gap-1.5">
              {currentNotification.price && (
                <span className="text-xs font-black font-mono text-amber-400 tabular-nums">
                  {currentNotification.price}
                </span>
              )}
              <div className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors">
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Bouton fermer discret */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Fermer la notification"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
