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
import { trackVisitorArrival, getVisitorVisitCount } from "@/lib/visitorTracker";
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
    id: "price",
    icon: Tag,
    title: "Le prix est un peu trop élevé",
    subtitle: "Discuter d'une réduction ou facilité",
    generateMsg: (title, price) => 
      `Bonjour Isivente, je m'intéresse au ${title} (${new Intl.NumberFormat("fr-FR").format(price)} F), mais le prix dépasse un peu mon budget. Avez-vous une remise ou une facilité de paiement ?`,
  },
  {
    id: "delivery",
    icon: MapPin,
    title: "Livraison dans ma ville / commune ?",
    subtitle: "Vérifier le délai et la faisabilité",
    generateMsg: (title) => 
      `Bonjour Isivente, je souhaite commander le ${title}, mais je veux vérifier si vous livrez dans ma ville/commune et quel est le délai exact ?`,
  },
  {
    id: "quality",
    icon: ShieldCheck,
    title: "Doute sur la qualité ou l'usage",
    subtitle: "Demander une vidéo ou des détails",
    generateMsg: (title) => 
      `Bonjour Isivente, j'ai vu votre offre sur le ${title}. Pouvez-vous m'envoyer plus de détails/vidéos réelles et m'expliquer la garantie et le test avec le livreur ?`,
  },
  {
    id: "direct_order",
    icon: ShoppingBag,
    title: "Commander par message",
    subtitle: "Passer commande directement sur WhatsApp",
    generateMsg: (title, price) => 
      `Bonjour Isivente, je souhaite passer commande du ${title} (${new Intl.NumberFormat("fr-FR").format(price)} F) directement ici par message avec vous.`,
  },
];

export default function ExitIntentModal({
  slug,
  productTitle: customTitle,
  productImage: customImage,
  originalPrice: customOriginalPrice,
  whatsappNumber = "2290192901817",
  storageKey = "isivente_exit_intent_shown_v2",
}: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const hasTriggeredRef = useRef(false);

  // Récupération des infos produit
  const catalogProduct = DEFAULT_CATALOG_MAP[slug?.toLowerCase()] || {};
  const productTitle = customTitle || catalogProduct.shortTitle || catalogProduct.title || "ce produit";
  const productImage = customImage || catalogProduct.image_url || catalogProduct.image || "/images/brosse-spray-hero.jpg";
  const price = customOriginalPrice || catalogProduct.price || 14900;

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");

  useEffect(() => {
    trackVisitorArrival(slug);

    if (typeof window !== "undefined") {
      const alreadyShown = sessionStorage.getItem(storageKey);
      if (alreadyShown) {
        hasTriggeredRef.current = true;
        return;
      }
    }

    // 1. Déclencheur Desktop : la souris monte vers la barre d'onglets pour quitter
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 12 && !hasTriggeredRef.current) {
        triggerModal();
      }
    };

    // 2. Déclencheur Mobile : interception du bouton retour
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
    trackCustomEvent("ExitModal_Viewed", { slug, product: productTitle });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const openWhatsAppWithMessage = (message: string, optionId: string) => {
    trackCustomEvent("ExitWhatsApp_Redirect", { 
      slug, 
      product: productTitle, 
      option: optionId, 
      message 
    });

    // Envoi discret en arrière-plan pour analyse des objections
    try {
      if (typeof window !== "undefined") {
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: `exit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            product_slug: `${slug}_exit_${optionId}`,
            duration_seconds: 1,
            clicked: true,
          }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    setIsOpen(false);
    window.open(url, "_blank");
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
    setIsOpen(false);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-t-[28px] sm:rounded-3xl bg-white border-t sm:border border-slate-200 shadow-2xl p-5 sm:p-6 pb-8 sm:pb-6 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 sm:duration-200 select-none text-slate-800 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
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

        <div className="space-y-4 pt-0.5">
          {/* Badge statut en ligne */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Service Client Isivente • En ligne</span>
            <span className="text-emerald-600/70 text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" /> Répond en 3 min
            </span>
          </div>

          {/* En-tête */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Une question ou une hésitation avant de partir ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dites-nous ce qui vous bloque, nous vous répondons <strong>directement sur WhatsApp</strong> :
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
              Choisissez votre situation :
            </p>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleQuickOptionClick(opt)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 bg-white transition-all flex items-center gap-3 group cursor-pointer active:scale-[0.99]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/70 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 transition-colors">
                      <IconComponent className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                        {opt.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {opt.subtitle}
                      </p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question libre si pas dans la liste */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Votre question n'est pas dans la liste ?</span>
            </div>

            <form onSubmit={handleCustomQuestionSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Écrivez votre question ici (ex: accessoires, garantie...)"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={!customQuestion.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Poser ma question sur WhatsApp</span>
              </button>
            </form>
          </div>

          {/* Lien retour au formulaire de commande classique */}
          <div className="pt-1 text-center">
            <button
              onClick={handleGoToOrderForm}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Non merci, je préfère commander directement sur le site</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

