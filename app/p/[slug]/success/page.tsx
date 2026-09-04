"use client";

import React, { useEffect, useState, Suspense } from "react";
import { CheckCircle2, ArrowRight, MessageCircle, Truck, PackageCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/metaPixel";

function SuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string) || "umei";
  const phone = searchParams.get("phone") || "";
  const orderRef = searchParams.get("order") || "";

  useEffect(() => {
    // Tentative de récupération des données de commande pour Meta Pixel
    try {
      const pendingMeta = sessionStorage.getItem("isivente_last_purchase_meta");
      if (pendingMeta) {
        const parsed = JSON.parse(pendingMeta);
        trackPurchase({
          content_name: parsed.title || slug,
          content_ids: [slug],
          value: parsed.price || 0,
          currency: "XOF",
          num_items: parsed.quantity || 1,
          order_id: orderRef || undefined,
        });
        sessionStorage.removeItem("isivente_last_purchase_meta");
      }
    } catch {}
  }, [slug, orderRef]);

  const trackUrl = phone 
    ? `/track?phone=${encodeURIComponent(phone)}` 
    : orderRef 
    ? `/track?order=${encodeURIComponent(orderRef)}` 
    : "/track";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200/80 p-6 sm:p-10 text-center shadow-xl">
        
        {/* ICON CHECK */}
        <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Commande Enregistrée avec Succès
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-3 leading-tight">
          Félicitations !
        </h1>
        
        <p className="text-sm sm:text-base text-slate-600 font-normal mb-8 leading-relaxed">
          Merci pour votre confiance. Votre commande a bien été reçue. 
          Notre équipe va vous appeler sous peu pour valider l'heure de livraison avec notre coursier.
        </p>

        {/* ÉTAPES CLAIRES */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 sm:p-6 mb-6 text-left space-y-3.5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
            Que se passe-t-il maintenant ?
          </h3>
          
          <div className="flex gap-3 text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-bold text-slate-900">Appel de confirmation</p>
              <p className="text-xs text-slate-500">Un membre de l'équipe vous contacte pour confirmer votre adresse exacte.</p>
            </div>
          </div>

          <div className="flex gap-3 text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <p className="font-bold text-slate-900">Expédition express (24h)</p>
              <p className="text-xs text-slate-500">Notre livreur prend en charge votre colis à moto/véhicule.</p>
            </div>
          </div>

          <div className="flex gap-3 text-sm text-slate-800">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-bold text-slate-900">Vérification & Paiement à la réception</p>
              <p className="text-xs text-slate-500">Vous ouvrez le paquet, vérifiez le produit et réglez en espèces au livreur.</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-3">
          <Link href={trackUrl} className="block">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
              <Truck className="w-5 h-5" />
              <span>Suivre mon colis en direct</span>
            </button>
          </Link>

          <a 
            href={`https://wa.me/2290192901817?text=${encodeURIComponent("Bonjour ! Je viens de passer ma commande sur le site et je souhaite accélérer ma livraison.")}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Accélérer ma livraison via WhatsApp</span>
          </a>

          <Link href={`/p/${slug}`} className="block">
            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span>Retourner à la page produit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Colis Garanti</span>
          <span className="flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5 text-indigo-600" /> Paiement Sécurisé</span>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SuccessContent />
    </Suspense>
  );
}
