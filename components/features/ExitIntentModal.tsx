"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Sparkles, ShieldCheck, Truck, MessageCircle, ArrowRight } from "lucide-react";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import { trackVisitorArrival, getVisitorVisitCount } from "@/lib/visitorTracker";

interface ExitIntentModalProps {
  slug: string;
  productTitle?: string;
  productImage?: string;
  originalPrice?: number;
  discountPrice?: number;
  discountAmount?: number;
  giftText?: string;
  whatsappNumber?: string;
  storageKey?: string;
}

export default function ExitIntentModal({
  slug,
  productTitle: customTitle,
  productImage: customImage,
  originalPrice: customOriginalPrice,
  discountPrice: customDiscountPrice,
  discountAmount: customDiscountAmount,
  giftText: customGiftText,
  whatsappNumber = "2290192901817",
  storageKey = "isivente_exit_intent_claimed",
}: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visitCount, setVisitCount] = useState(1);
  const hasTriggeredRef = useRef(false);

  // Récupération automatique des données du produit via le catalogue par défaut
  const catalogProduct = DEFAULT_CATALOG_MAP[slug?.toLowerCase()] || {};
  const productTitle = customTitle || catalogProduct.shortTitle || catalogProduct.title || "ce produit";
  const productImage = customImage || catalogProduct.image_url || catalogProduct.image || "/images/brosse-spray-hero.jpg";
  const originalPrice = customOriginalPrice || catalogProduct.price || 14900;
  
  // Réduction par défaut de 1 500 FCFA
  const discountAmount = customDiscountAmount || 1500;
  const discountPrice = customDiscountPrice || Math.max(0, originalPrice - discountAmount);

  // Avantage honnête : réduction directe et traitement prioritaire (aucun faux cadeau promis)
  const defaultPerk = "Remise immédiate déduite + Expédition 24h prioritaire";
  const perkText = customGiftText || defaultPerk;

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  useEffect(() => {
    // 1. Enregistrement de la visite
    const history = trackVisitorArrival(slug);
    setVisitCount(history.visitCount);

    // 2. Vérifier si déjà affiché lors de cette session
    if (typeof window !== "undefined") {
      const alreadyShown = sessionStorage.getItem(storageKey);
      if (alreadyShown) {
        hasTriggeredRef.current = true;
        return;
      }
    }

    // 3. Déclencheur Desktop (la souris monte vers la barre d'onglets pour fermer)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && !hasTriggeredRef.current) {
        triggerModal();
      }
    };

    // 4. Déclencheur Mobile (Interception de l'historique lors d'un clic "Retour")
    if (typeof window !== "undefined") {
      window.history.pushState({ isiventeExitIntent: true }, "");

      const handlePopState = () => {
        if (!hasTriggeredRef.current) {
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
  }, [storageKey, slug]);

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

  const handleClaimOffer = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("isivente_exit_perk_active", "true");
      // Émission d'un événement global pour que la page active la réduction
      window.dispatchEvent(new CustomEvent("isivente:perk_claimed", { 
        detail: { discountAmount, perkText, discountPrice } 
      }));
    }

    // Scroll fluide vers le formulaire de commande
    const orderSection = document.getElementById("commander");
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const phoneInput = orderSection.querySelector("input[type='tel'], input[name='phone']") as HTMLInputElement | null;
        if (phoneInput) {
          phoneInput.focus();
        }
      }, 500);
    }
  };

  if (!isOpen) return null;

  const whatsappMsg = `Bonjour Isivente, je m'apprêtais à quitter la page de ${productTitle}. Pouvez-vous me réserver l'offre spéciale et la livraison pour la semaine prochaine ?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200 select-none text-slate-800"
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

        {/* En-tête de l'offre */}
        <div className="space-y-3 pt-1">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Remise exclusive avant de partir ⚡</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Attendez ! Ne partez pas sans votre réduction.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pour vous remercier de votre visite {visitCount > 1 ? `(votre ${visitCount}e visite !)` : ""}, nous déduisons immédiatement <strong className="text-rose-600 font-bold">{fmt(discountAmount)} FCFA</strong> sur votre commande aujourd'hui.
            </p>
          </div>

          {/* Carte Produit & Tarif Avantageux */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
              <img src={productImage} alt={productTitle} className="w-full h-full object-contain p-1" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="text-xs font-bold text-slate-900 line-clamp-1">{productTitle}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-mono font-bold text-pink-600 tabular-nums">
                  {fmt(discountPrice)} FCFA
                </span>
                <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                  {fmt(originalPrice)} FCFA
                </span>
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-200">
                Remise immédiate : -{fmt(discountAmount)} FCFA
              </div>
            </div>
          </div>

          {/* Avantage réel appliqué */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-amber-900">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold">Privilège appliqué immédiatement :</p>
              <p className="text-[11px] text-amber-800">{perkText}</p>
            </div>
          </div>

          {/* Garanties */}
          <div className="space-y-1 text-xs text-slate-600 pt-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Contrôle et test du colis avec le livreur avant tout paiement</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Livraison express 24h à Cotonou, Calavi & départements</span>
            </div>
          </div>

          {/* Bouton Principal CTA 1-Clic */}
          <button
            onClick={handleClaimOffer}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 active:scale-[0.98] rounded-xl shadow-lg shadow-pink-600/25 transition-all cursor-pointer"
          >
            <span>Profiter de l'offre à {fmt(discountPrice)} F & Commander</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Échappatoire WhatsApp */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-500 mb-1">
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
