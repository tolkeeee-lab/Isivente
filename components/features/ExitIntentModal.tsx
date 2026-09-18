"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Sparkles, ShieldCheck, Truck, Clock, MessageCircle, ArrowRight, Tag } from "lucide-react";

interface ExitIntentModalProps {
  productTitle: string;
  productImage: string;
  originalPrice: number;
  discountPrice: number;
  discountAmount: number;
  whatsappNumber?: string;
  whatsappPrefill?: string;
  onClaimDiscount: () => void;
  storageKey?: string;
}

export default function ExitIntentModal({
  productTitle,
  productImage,
  originalPrice,
  discountPrice,
  discountAmount,
  whatsappNumber = "2290192901817",
  whatsappPrefill,
  onClaimDiscount,
  storageKey = "isivente_exit_intent_claimed",
}: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasTriggeredRef = useRef(false);

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  useEffect(() => {
    // Vérifier si déjà affiché lors de cette session
    if (typeof window !== "undefined") {
      const alreadyShown = sessionStorage.getItem(storageKey);
      if (alreadyShown) {
        hasTriggeredRef.current = true;
        return;
      }
    }

    // 1. Déclencheur Desktop (la souris monte vers le haut pour fermer ou changer d'onglet)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && !hasTriggeredRef.current) {
        triggerModal();
      }
    };

    // 2. Déclencheur Mobile (Interception de l'historique lors d'un clic "Retour")
    if (typeof window !== "undefined") {
      // Pousse un état factice dans l'historique pour pouvoir intercepter le bouton retour
      window.history.pushState({ exitIntentReady: true }, "");
      
      const handlePopState = (e: PopStateEvent) => {
        if (!hasTriggeredRef.current) {
          e.preventDefault();
          triggerModal();
        }
      };

      window.addEventListener("popstate", handlePopState);
      document.documentElement.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [storageKey]);

  const triggerModal = () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "true");
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAccept = () => {
    setIsOpen(false);
    onClaimDiscount();
  };

  if (!isOpen) return null;

  const defaultWhatsappMsg = whatsappPrefill || `Bonjour Isivente, j'hésite sur le ${productTitle}. Est-il possible de réserver mon exemplaire pour une livraison la semaine prochaine ?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(defaultWhatsappMsg)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-200 animate-in fade-in"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_25px_50px_-12px_rgba(0,0,0,0.25)] p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200 select-none text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermeture discret */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Contenu de l'offre */}
        <div className="space-y-4 pt-1">
          {/* Badge Offre de sortie */}
          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
            <span>Offre Spéciale Dernière Chance</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              Attendez ! Ne repartez pas les yeux fatigués
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Profitez d'un bon de réduction exclusif de <strong className="text-slate-900 font-bold">{fmt(discountAmount)} FCFA</strong> valable uniquement sur cette session pour soulager votre regard dès demain.
            </p>
          </div>

          {/* Carte Produit avec Tarif Réduit */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300/50 shrink-0">
              <img src={productImage} alt={productTitle} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="text-xs font-bold text-slate-900 line-clamp-1">{productTitle}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-mono font-bold text-indigo-600 tabular-nums">
                  {fmt(discountPrice)} FCFA
                </span>
                <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                  {fmt(originalPrice)} FCFA
                </span>
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-200/60">
                Économie immédiate : -{fmt(discountAmount)} FCFA
              </div>
            </div>
          </div>

          {/* 3 Garanties Réassurantes */}
          <div className="space-y-1.5 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
              <span>Testez et allumez l'appareil avec le coursier avant de payer</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0 stroke-[1.75]" />
              <span>Livraison express 24h à Cotonou, Calavi & environs</span>
            </div>
          </div>

          {/* Bouton Principal CTA 1-Clic */}
          <button
            onClick={handleAccept}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_4px_14px_-2px_rgba(99,102,241,0.5)] transition-all cursor-pointer"
          >
            <span>Profiter des -{fmt(discountAmount)} F ({fmt(discountPrice)} FCFA)</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Échappatoire WhatsApp Réservation pour plus tard */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-500 mb-1.5">
              Vous n'avez pas de liquidités aujourd'hui ?
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 stroke-[2]" />
              <span>Réserver gratuitement sur WhatsApp pour plus tard</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
