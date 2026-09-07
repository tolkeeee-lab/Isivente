"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getProductUpsellConfig, OfferItem } from "@/lib/upsellConfig";
import { upgradeOrderWithUpsell } from "@/lib/ordersStorage";
import { trackCustomEvent } from "@/lib/metaPixel";
import { 
  Check, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  X,
  PackageCheck,
  Zap
} from "lucide-react";

const PRODUCT_THEMES: Record<
  string,
  {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
    textPrimary: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  umei: {
    primary: "#FF5C93",
    primaryHover: "#E13D74",
    primaryLight: "#FFF1F5",
    border: "#FECDD6",
    textPrimary: "#831843",
    badgeBg: "#FFE4EC",
    badgeText: "#BE185D",
  },
  eraclean: {
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    primaryLight: "#EFF6FF",
    border: "#BFDBFE",
    textPrimary: "#1E3A8A",
    badgeBg: "#DBEAFE",
    badgeText: "#1E40AF",
  },
  turbofan: {
    primary: "#059669",
    primaryHover: "#047857",
    primaryLight: "#ECFDF5",
    border: "#A7F3D0",
    textPrimary: "#064E3B",
    badgeBg: "#D1FAE5",
    badgeText: "#065F46",
  },
  peeler: {
    primary: "#0047AB",
    primaryHover: "#003580",
    primaryLight: "#F0F5FF",
    border: "#BCD0F7",
    textPrimary: "#002B66",
    badgeBg: "#E0ECFF",
    badgeText: "#003A8C",
  },
  chefpeel: {
    primary: "#0047AB",
    primaryHover: "#003580",
    primaryLight: "#F0F5FF",
    border: "#BCD0F7",
    textPrimary: "#002B66",
    badgeBg: "#E0ECFF",
    badgeText: "#003A8C",
  },
  stabilisateur: {
    primary: "#D97706",
    primaryHover: "#B45309",
    primaryLight: "#FFFBEB",
    border: "#FDE68A",
    textPrimary: "#78350F",
    badgeBg: "#FEF3C7",
    badgeText: "#92400E",
  },
  veilleuse: {
    primary: "#4F46E5",
    primaryHover: "#4338CA",
    primaryLight: "#EEF2FF",
    border: "#C7D2FE",
    textPrimary: "#312E81",
    badgeBg: "#E0E7FF",
    badgeText: "#3730A3",
  },
  camera: {
    primary: "#059669",
    primaryHover: "#047857",
    primaryLight: "#ECFDF5",
    border: "#A7F3D0",
    textPrimary: "#064E3B",
    badgeBg: "#D1FAE5",
    badgeText: "#065F46",
  },
};

function UpsellContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = (params.slug as string) || "umei";
  const orderRef = searchParams.get("order") || "";
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "";
  const initialTotal = Number(searchParams.get("total") || 0);

  const config = getProductUpsellConfig(slug);
  const offer: OfferItem | undefined = config.upsell;

  const theme = PRODUCT_THEMES[slug.toLowerCase()] || {
    primary: "#0F172A",
    primaryHover: "#000000",
    primaryLight: "#F8FAFC",
    border: "#E2E8F0",
    textPrimary: "#0F172A",
    badgeBg: "#F1F5F9",
    badgeText: "#334155",
  };

  // Compte à rebours psychologique (10 minutes)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  // Si pas d'upsell configuré, aller directement sur success
  useEffect(() => {
    if (!offer) {
      router.replace(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}&total=${encodeURIComponent(String(initialTotal))}`);
    }
  }, [offer, router, slug, orderRef, phone, name, initialTotal]);

  if (!offer) return null;

  // Accepter l'Upsell en 1 Clic
  const handleAccept = async () => {
    setIsProcessing(true);
    const finalTotal = initialTotal + offer.price;
    try {
      if (orderRef) {
        await upgradeOrderWithUpsell(orderRef, offer.price, offer.title);
      }
      trackCustomEvent("AcceptUpsell", {
        product_slug: slug,
        upsell_id: offer.id,
        upsell_price: offer.price,
        order_ref: orderRef,
      });
    } catch (e) {
      console.error("Upsell upgrade error:", e);
    } finally {
      router.push(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}&total=${encodeURIComponent(String(finalTotal))}&upsell=1`);
    }
  };

  // Refuser l'Offre -> Direction immédiate page de confirmation finale
  const handleDecline = () => {
    trackCustomEvent("DeclineUpsell", {
      product_slug: slug,
      upsell_id: offer.id,
      order_ref: orderRef,
    });
    router.push(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}&total=${encodeURIComponent(String(initialTotal))}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between font-sans antialiased selection:bg-slate-200">
      
      {/* 🌟 HEADER DE STATUT DE COMMANDE SÉCURISÉE (FOND CLAIR) */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md py-3.5 px-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">
              Commande #{orderRef || "Reçue"} validée avec succès
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* 🌟 CONTENEUR PRINCIPAL LUMINEUX */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-10 space-y-6">
        
        {/* BANNIÈRE D'ALERTE SOBRE */}
        <div className="text-center space-y-2">
          <div 
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs"
            style={{
              backgroundColor: theme.primaryLight,
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span>Offre Spéciale — 2ème Pièce Réduite</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight leading-tight">
            Offrez un 2ème exemplaire à un proche !
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Votre colis est en cours de préparation. Profitez de cette opportunité unique pour ajouter un 2ème exemplaire à tarif très réduit dans le même colis sans frais de livraison en plus.
          </p>
        </div>

        {/* 🌟 CARTE DE L'OFFRE UPSELL FIGMA-GRADE (FOND BLANC CLAIR) */}
        <div className="relative rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] overflow-hidden">
          
          {/* Badge Offre Thématique */}
          {offer.badge && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide mb-4 border"
              style={{
                backgroundColor: theme.badgeBg,
                borderColor: theme.border,
                color: theme.badgeText,
              }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{offer.badge}</span>
            </div>
          )}

          {/* Image & Titre */}
          <div className="space-y-4">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 leading-snug">
                {offer.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {offer.subtitle}
              </p>
            </div>
          </div>

          {/* Avantages sous forme de puces */}
          {offer.benefits && offer.benefits.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
              {offer.benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">{b}</span>
                </div>
              ))}
            </div>
          )}

          {/* 🏷️ TARIFICATION SPÉCIALE CLAIRE */}
          <div 
            className="mt-6 p-4 rounded-2xl border flex items-center justify-between"
            style={{
              backgroundColor: theme.primaryLight,
              borderColor: theme.border,
            }}
          >
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tarif régulier boutique</div>
              <div className="font-mono text-sm line-through text-slate-400 tabular-nums">
                {fmt(offer.originalPrice)} FCFA
              </div>
            </div>
            <div className="text-right">
              <div 
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: theme.textPrimary }}
              >
                Offre Spéciale 1-Clic
              </div>
              <div 
                className="font-mono font-black text-2xl sm:text-3xl tabular-nums"
                style={{ color: theme.primary }}
              >
                +{fmt(offer.price)} <span className="text-xs font-sans font-normal text-slate-600">FCFA</span>
              </div>
            </div>
          </div>

          {/* 🚀 BOUTONS D'ACTION CLAIRS & BIEN VISIBLES */}
          <div className="mt-6 space-y-3">
            {/* BOUTON 1 : ACCEPTER (COULEUR PRIMAIRE DU SITE) */}
            <button
              type="button"
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full text-white font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 10px 25px -5px ${theme.primary}55`,
              }}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Ajout en cours à votre colis...</span>
                </span>
              ) : (
                <>
                  <span>OUI, AJOUTER À MON COLIS (+{fmt(offer.price)} FCFA)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* BOUTON 2 : REFUSER (CLAIREMENT VISIBLE ET HARMONISÉ SELON LE PRODUIT) */}
            <button
              type="button"
              onClick={handleDecline}
              disabled={isProcessing}
              className="w-full bg-white hover:bg-slate-50 font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl border-2 transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              style={{
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <X className="w-4 h-4 stroke-[2.5]" style={{ color: theme.primary }} />
              <span>Non merci, refuser cette offre et garder ma commande initiale</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-600" /> Même livreur, 0 F de port</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Paiement à la réception</span>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER CLAIR */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>Paiement 100% sécurisé à la livraison • Isivente Bénin</p>
      </footer>

    </div>
  );
}

export default function UpsellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <UpsellContent />
    </Suspense>
  );
}
