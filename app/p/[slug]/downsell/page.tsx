"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getProductUpsellConfig, OfferItem } from "@/lib/upsellConfig";
import { upgradeOrderWithUpsell } from "@/lib/ordersStorage";
import { trackCustomEvent } from "@/lib/metaPixel";
import { 
  Check, 
  Tag, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  AlertTriangle
} from "lucide-react";

function DownsellContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = (params.slug as string) || "umei";
  const orderRef = searchParams.get("order") || "";
  const phone = searchParams.get("phone") || "";

  const config = getProductUpsellConfig(slug);
  const offer: OfferItem | undefined = config.downsell;

  const [isProcessing, setIsProcessing] = useState(false);
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  // Si pas de downsell configuré, rediriger immédiatement vers success
  useEffect(() => {
    if (!offer) {
      router.replace(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}`);
    }
  }, [offer, router, slug, orderRef, phone]);

  if (!offer) return null;

  // Accepter le Downsell en 1 Clic
  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      if (orderRef) {
        await upgradeOrderWithUpsell(orderRef, offer.price, offer.title);
      }
      trackCustomEvent("AcceptDownsell", {
        product_slug: slug,
        downsell_id: offer.id,
        downsell_price: offer.price,
        order_ref: orderRef,
      });
    } catch (e) {
      console.error("Downsell upgrade error:", e);
    } finally {
      router.push(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}&downsell=1`);
    }
  };

  // Refuser définitivement le Downsell -> Direction page de remerciement finale
  const handleDecline = () => {
    trackCustomEvent("DeclineDownsell", {
      product_slug: slug,
      downsell_id: offer.id,
      order_ref: orderRef,
    });
    router.push(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(phone)}`);
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500/20">
      
      {/* HEADER STATUT */}
      <header className="border-b border-white/10 bg-[#161922] py-3 px-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">
              Commande initiale #{orderRef || "Reçue"} toujours active & sécurisée
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Dernière proposition
          </span>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-10 space-y-6">
        
        {/* EN-TÊTE D'ACROCHE */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            <span>Offre de Rattrapage Ultime</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
            Le pack précédent était trop cher ?
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Nous comprenons parfaitement. Que diriez-vous de recevoir uniquement l'accessoire essentiel pour un tarif dérisoire ?
          </p>
        </div>

        {/* CARTE DU DOWNSELL */}
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#1A1D27] to-[#12141C] p-5 sm:p-7 shadow-2xl overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          {offer.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wide mb-4">
              <Tag className="w-3 h-3" />
              <span>{offer.badge}</span>
            </div>
          )}

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

          {offer.benefits && offer.benefits.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
              {offer.benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
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
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Prix conseillé</div>
              <div className="font-mono text-sm line-through text-slate-500 tabular-nums">
                {fmt(offer.originalPrice)} FCFA
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Offre Petit Prix</div>
              <div className="font-mono font-extrabold text-2xl sm:text-3xl text-amber-400 tabular-nums">
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
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Mise à jour de votre colis...</span>
                </span>
              ) : (
                <>
                  <span>OUI, AJOUTER CE PACK (+{fmt(offer.price)} FCFA)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-amber-400" /> Livraison groupée sans frais</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Règlement à la réception</span>
            </div>
          </div>

        </div>

        {/* REFUS FINAL */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleDecline}
            disabled={isProcessing}
            className="text-xs text-slate-500 hover:text-slate-400 underline underline-offset-4 transition-colors cursor-pointer p-2"
          >
            Non merci, je préfère recevoir uniquement ma commande initiale
          </button>
        </div>

      </main>

      <footer className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        <p>Isivente • Traitement express de vos commandes sous 24h</p>
      </footer>

    </div>
  );
}

export default function DownsellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F1117]" />}>
      <DownsellContent />
    </Suspense>
  );
}
