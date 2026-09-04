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
  AlertCircle
} from "lucide-react";

function UpsellContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = (params.slug as string) || "umei";
  const orderRef = searchParams.get("order") || "";
  const phone = searchParams.get("phone") || "";

  const config = getProductUpsellConfig(slug);
  const offer: OfferItem | undefined = config.upsell;

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
      router.replace(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}`);
    }
  }, [offer, router, slug, orderRef, phone]);

  if (!offer) return null;

  // Accepter l'Upsell en 1 Clic
  const handleAccept = async () => {
    setIsProcessing(true);
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
      router.push(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}&upsell=1`);
    }
  };

  // Refuser l'Upsell -> Proposer le Downsell
  const handleDecline = () => {
    trackCustomEvent("DeclineUpsell", {
      product_slug: slug,
      upsell_id: offer.id,
      order_ref: orderRef,
    });
    // Redirection vers le downsell s'il existe, sinon success
    if (config.downsell) {
      router.push(`/p/${slug}/downsell?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}`);
    } else {
      router.push(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500/20">
      
      {/* HEADER DE STATUT DE COMMANDE SÉCURISÉE */}
      <header className="border-b border-white/10 bg-[#161922] py-3 px-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">
              Commande initiale #{orderRef || "Reçue"} validée avec succès
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* CONTENEUR PRINCIPAL */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-10 space-y-6">
        
        {/* BANNIÈRE D'ALERTE */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offre Exclusive — Étape 2/2</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            ATTENDEZ ! Ne partez pas les mains vides...
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Votre colis est en cours de préparation à notre entrepôt. Profitez de cette opportunité unique pour ajouter ceci à votre commande sans frais de livraison supplémentaires !
          </p>
        </div>

        {/* CARTE DE L'OFFRE UPSELL FIGMA-GRADE */}
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#1A1D27] to-[#12141C] p-5 sm:p-7 shadow-2xl overflow-hidden">
          
          {/* Liseré supérieur biseauté */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

          {/* Badge Offre */}
          {offer.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wide mb-4">
              <Sparkles className="w-3 h-3" />
              <span>{offer.badge}</span>
            </div>
          )}

          {/* Image & Titre */}
          <div className="space-y-4">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-800/80 border border-white/10 relative">
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-transparent to-transparent opacity-60" />
            </div>

            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white leading-snug">
                {offer.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {offer.subtitle}
              </p>
            </div>
          </div>

          {/* Avantages sous forme de puces */}
          {offer.benefits && offer.benefits.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
              {offer.benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          )}

          {/* TARIFICATION SPECIALE */}
          <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Tarif régulier boutique</div>
              <div className="font-mono text-sm line-through text-slate-500 tabular-nums">
                {fmt(offer.originalPrice)} FCFA
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Offre Spéciale 1-Clic</div>
              <div className="font-mono font-extrabold text-2xl sm:text-3xl text-emerald-400 tabular-nums">
                +{fmt(offer.price)} <span className="text-xs font-sans text-slate-400 font-normal">FCFA</span>
              </div>
            </div>
          </div>

          {/* BOUTON D'ACTION 1-CLIC */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Ajout en cours à votre colis...</span>
                </span>
              ) : (
                <>
                  <span>OUI, AJOUTER À MON COLIS (+{fmt(offer.price)} FCFA)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-400" /> Même livreur, 0 F de port</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Paiement à la réception</span>
            </div>
          </div>

        </div>

        {/* BOUTON DE DÉCLIN SUBTIL */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleDecline}
            disabled={isProcessing}
            className="text-xs text-slate-500 hover:text-slate-400 underline underline-offset-4 transition-colors cursor-pointer p-2"
          >
            Non merci, je refuse cette offre exceptionnelle et je poursuis sans réduction
          </button>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        <p>Paiement sécurisé à la livraison • Satisfaction client Isivente</p>
      </footer>

    </div>
  );
}

export default function UpsellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F1117]" />}>
      <UpsellContent />
    </Suspense>
  );
}
