"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  X, 
  MessageCircle, 
  Send, 
  MapPin, 
  Tag, 
  ShieldCheck, 
  ShoppingBag, 
  ArrowRight,
  HelpCircle,
  Clock
} from "lucide-react";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import { trackVisitorArrival } from "@/lib/visitorTracker";
import { trackCustomEvent } from "@/lib/metaPixel";

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

interface QuickOption {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  generateMsg: (title: string, price: number) => string;
}

const QUICK_OPTIONS: QuickOption[] = [
  {
    id: "promo_duo",
    icon: Tag,
    title: "Avez-vous une remise si j'en prends 2 ?",
    subtitle: "Prix préférentiel pour 2 exemplaires ou offre duo",
    generateMsg: (title, price) => 
      `Bonjour Isivente, je m'intéresse au ${title} (affiché à ${new Intl.NumberFormat("fr-FR").format(price)} F). Avez-vous une réduction ou un tarif spécial si je prends 2 pièces ?`,
  },
  {
    id: "compatibility",
    icon: ShieldCheck,
    title: "Est-ce bien compatible avec mon matériel / voiture ?",
    subtitle: "Vérifier la compatibilité (iPhone, Android, modèles)",
    generateMsg: (title) => 
      `Bonjour Isivente, je souhaite vérifier la compatibilité du ${title} avant de commander. Est-ce bien adapté à mes appareils et garanti ?`,
  },
  {
    id: "delivery_test",
    icon: MapPin,
    title: "Livraison dans ma ville & paiement après vérification ?",
    subtitle: "Cotonou, Calavi, Porto-Novo, Parakou (délai & test)",
    generateMsg: (title) => 
      `Bonjour Isivente, je souhaite savoir si vous livrez le ${title} dans ma ville/commune, quel est le délai exact et si je peux bien vérifier le colis avant de régler le livreur ?`,
  },
  {
    id: "direct_order",
    icon: ShoppingBag,
    title: "Je préfère commander directement ici sur WhatsApp",
    subtitle: "Finaliser simplement par message sans remplir le formulaire",
    generateMsg: (title, price) => 
      `Bonjour Isivente, je souhaite commander directement le ${title} (${new Intl.NumberFormat("fr-FR").format(price)} F) ici par message avec vous sur WhatsApp.`,
  },
];

export default function ExitIntentModal({
  slug,
  productTitle: customTitle,
  productImage: customImage,
  originalPrice: customOriginalPrice,
  whatsappNumber = "2290192901817",
  storageKey,
}: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const hasTriggeredRef = useRef(false);
  const isOpenRef = useRef(false);

  const finalStorageKey = storageKey ? `${storageKey}_${slug}` : `isivente_exit_shown_${slug || "default"}`;

  // Récupération des infos produit
  const catalogProduct = DEFAULT_CATALOG_MAP[slug?.toLowerCase()] || {};
  const productTitle = customTitle || catalogProduct.shortTitle || catalogProduct.title || "ce produit";
  const productImage = customImage || catalogProduct.image_url || catalogProduct.image || "/images/brosse-spray-hero.jpg";
  const price = customOriginalPrice || catalogProduct.price || 16900;

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");

  const triggerModal = () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    isOpenRef.current = true;

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(finalStorageKey, "true");
      } catch (_) {}
    }

    setIsOpen(true);
    trackCustomEvent("ExitModal_Viewed", { slug, product: productTitle });
  };

  const handleClose = () => {
    isOpenRef.current = false;
    setIsOpen(false);
  };

  useEffect(() => {
    trackVisitorArrival(slug);

    if (typeof window === "undefined") return;

    const alreadyShown = sessionStorage.getItem(finalStorageKey);
    if (alreadyShown) {
      hasTriggeredRef.current = true;
      return;
    }

    // ── 1. DÉCLENCHEUR DESKTOP : Curseur souris qui quitte vers la barre d'onglets ──
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && !hasTriggeredRef.current) {
        triggerModal();
      }
    };

    // ── 2. DÉCLENCHEUR MOBILE BLINDÉ : Interception du bouton retour ──
    // Pousser un premier état dans l'historique
    try {
      window.history.pushState({ isiventeExitIntent: true }, "");
    } catch (_) {}

    // Pousser un second état dès le premier contact tactile pour valider le verrouillage navigateur
    const ensureHistoryLocked = () => {
      try {
        window.history.pushState({ isiventeExitIntent: true }, "");
      } catch (_) {}
    };
    window.addEventListener("touchstart", ensureHistoryLocked, { once: true, passive: true });

    const handlePopState = () => {
      if (!hasTriggeredRef.current) {
        // Bloquer la sortie : on réinjecte l'état pour que la page ne se décharge pas
        try {
          window.history.pushState({ isiventeExitIntent: true }, "");
        } catch (_) {}
        triggerModal();
      } else if (isOpenRef.current) {
        handleClose();
      }
    };

    // ── 3. DÉCLENCHEUR MOBILE CRO : Remontée rapide vers le haut après lecture ──
    let maxScrollY = 0;
    let lastScrollY = window.scrollY;
    let scrollUpVelocity = 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > maxScrollY) {
        maxScrollY = currentY;
      }

      // Si le visiteur a scrollé à plus de 450px (il a vu le produit / offre)
      // et remonte rapidement vers les 100 premiers pixels
      if (maxScrollY > 450 && currentY < lastScrollY) {
        scrollUpVelocity += (lastScrollY - currentY);
        if (currentY <= 100 && scrollUpVelocity > 180 && !hasTriggeredRef.current) {
          triggerModal();
        }
      } else if (currentY > lastScrollY) {
        scrollUpVelocity = 0;
      }
      lastScrollY = currentY;
    };

    // ── 4. DÉCLENCHEUR VISIBILITÉ : Changement d'onglet / mise en veille ──
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && maxScrollY > 300 && !hasTriggeredRef.current) {
        // L'utilisateur quitte l'onglet après avoir exploré : préparer la modale au retour
        hasTriggeredRef.current = true;
        setIsOpen(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("touchstart", ensureHistoryLocked);
    };
  }, [finalStorageKey, slug]);

  const openWhatsAppWithMessage = (message: string, optionId: string) => {
    trackCustomEvent("WhatsApp_Contact", { slug, product: productTitle, option: optionId });
    trackCustomEvent("ExitWhatsApp_Redirect", { 
      slug, 
      product: productTitle, 
      option: optionId, 
      message 
    });

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    handleClose();

    // Blindage Mobile : sur iOS Safari, Chrome Android et les Webviews Facebook/Instagram,
    // window.open est souvent bloqué par le popup blocker.
    // window.location.href ouvre directement l'application WhatsApp à 100% sans échec !
    const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  };

  const handleQuickOptionClick = (option: QuickOption) => {
    const msg = option.generateMsg(productTitle, price);
    openWhatsAppWithMessage(msg, option.id);
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customQuestion.trim();
    if (!trimmed) return;

    const fullMsg = `Bonjour Isivente, concernant le ${productTitle} (${fmt(price)} F) : ${trimmed}`;
    openWhatsAppWithMessage(fullMsg, "custom_question");
  };

  const handleGoToOrderForm = () => {
    handleClose();
    const orderSection = document.getElementById("commander");
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const phoneInput = orderSection.querySelector("input[type='tel'], input[name='phone']") as HTMLInputElement | null;
        if (phoneInput) phoneInput.focus();
      }, 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-t-[28px] sm:rounded-3xl bg-white border-t sm:border border-slate-200 shadow-2xl p-5 sm:p-6 pb-8 sm:pb-6 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 sm:duration-200 select-none text-slate-800 max-h-[92vh] sm:max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poignée de tirage / drag pill pour le format Pull-Up mobile */}
        <div className="sm:hidden flex justify-center pb-2.5 -mt-1 cursor-grab">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Bouton fermeture */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="space-y-3.5 pt-0.5">
          {/* Badge statut en ligne */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Service Client Isivente • En direct</span>
            <span className="text-emerald-600/80 text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" /> Répond en 3 min
            </span>
          </div>

          {/* En-tête */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Une question ou une hésitation avant de partir ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ne restez pas avec un doute : choisissez votre situation pour discuter <strong>directement sur WhatsApp</strong> :
            </p>
          </div>

          {/* Mini-carte produit résumé */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center p-1">
              <img src={productImage} alt={productTitle} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{productTitle}</p>
              <p className="text-sm font-extrabold text-emerald-600 font-mono">
                {fmt(price)} FCFA <span className="text-[11px] font-medium text-slate-500 ml-1">(Paiement à la livraison)</span>
              </p>
            </div>
          </div>

          {/* Liste des options fréquentes en 1-clic */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Choisissez votre question en 1 clic :
            </p>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleQuickOptionClick(opt)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 bg-white transition-all flex items-center gap-3 group cursor-pointer active:scale-[0.98] shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 transition-colors">
                      <IconComponent className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 leading-snug">
                        {opt.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {opt.subtitle}
                      </p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 opacity-80 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question libre si pas dans la liste */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Autre question personnalisée ?</span>
            </div>

            <form onSubmit={handleCustomQuestionSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Posez votre question ici..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={!customQuestion.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer ma question sur WhatsApp</span>
              </button>
            </form>
          </div>

          {/* Lien retour au formulaire de commande classique */}
          <div className="pt-1 text-center">
            <button
              onClick={handleGoToOrderForm}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Non merci, je valide ma commande sur le site</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
