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
  const name = searchParams.get("name") || "";
  const total = Number(searchParams.get("total") || 0);
  const hasUpsell = searchParams.get("upsell") === "1";
  const hasDownsell = searchParams.get("downsell") === "1";

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  useEffect(() => {
    // Meta Pixel: Track Purchase si présent
    try {
      const pendingMeta = sessionStorage.getItem("isivente_last_purchase_meta");
      if (pendingMeta) {
        const parsed = JSON.parse(pendingMeta);
        trackPurchase({
          content_name: parsed.title || slug,
          content_ids: [slug],
          value: total || parsed.price || 0,
          currency: "XOF",
          num_items: parsed.quantity || 1,
          order_id: orderRef || undefined,
        });
        sessionStorage.removeItem("isivente_last_purchase_meta");
      }
    } catch {}
  }, [slug, orderRef, total]);

  const trackUrl = phone 
    ? `/track?phone=${encodeURIComponent(phone)}` 
    : orderRef 
    ? `/track?order=${encodeURIComponent(orderRef)}` 
    : "/track";

  // Message WhatsApp personnalisé et pré-rempli
  const whatsappMsgText = 
    `Bonjour Isivente, je viens de valider ma commande ${orderRef ? `#${orderRef}` : ""} sur votre boutique !\n\n` +
    `👤 *Nom :* ${name || "Client"}\n` +
    `📱 *Téléphone :* ${phone || "Non renseigné"}\n` +
    (total > 0 ? `💰 *Total à régler à la livraison :* ${fmt(total)} FCFA\n` : "") +
    (hasUpsell ? `🎁 *Offre VIP incluse :* Oui (+1 article ajouté)\n` : "") +
    (hasDownsell ? `🎁 *Pack spécial inclus :* Oui\n` : "") +
    `\nMerci de me contacter pour la livraison de mon colis.`;

  const whatsappUrl = `https://wa.me/2290192901817?text=${encodeURIComponent(whatsappMsgText)}`;

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-emerald-500/20">
      <div className="bg-gradient-to-b from-[#1A1D27] to-[#12141C] border border-white/15 max-w-lg w-full rounded-3xl p-6 sm:p-9 text-center shadow-2xl relative overflow-hidden">
        
        {/* Liseré supérieur biseauté */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* ICON CHECK FIGMA-GRADE */}
        <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="w-9 h-9 text-emerald-400 stroke-[2.2]" />
        </div>
        
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-3">
          Commande Enregistrée avec Succès
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          Félicitations {name ? name.split(" ")[0] : ""} !
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-6 leading-relaxed max-w-md mx-auto">
          Merci pour votre confiance. Votre colis est immédiatement transmis à notre équipe logistique pour préparation.
        </p>

        {/* RÉCAPITULATIF COMMANDE */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 mb-6 text-left space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span>N° de commande :</span>
            <span className="font-mono font-bold text-white tracking-wide">
              {orderRef ? `#${orderRef}` : "ISV-" + Math.floor(100000 + Math.random() * 900000)}
            </span>
          </div>

          {name && (
            <div className="flex justify-between items-center text-slate-400">
              <span>Destinataire :</span>
              <span className="font-semibold text-slate-200">{name}</span>
            </div>
          )}

          {phone && (
            <div className="flex justify-between items-center text-slate-400">
              <span>Numéro WhatsApp :</span>
              <span className="font-mono text-slate-200">{phone}</span>
            </div>
          )}

          {(hasUpsell || hasDownsell) && (
            <div className="flex justify-between items-center text-emerald-400 pt-1">
              <span>Offre ajoutée :</span>
              <span className="font-semibold">{hasUpsell ? "Offre VIP 1-Clic" : "Pack Spécial"}</span>
            </div>
          )}

          {total > 0 && (
            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
              <span>Montant à régler à la livraison :</span>
              <span className="font-mono tabular-nums text-base sm:text-lg text-emerald-400">
                {fmt(total)} FCFA
              </span>
            </div>
          )}
        </div>

        {/* ÉTAPES SUIVANTES CLAIRES */}
        <div className="bg-[#161922] border border-white/10 rounded-2xl p-4 sm:p-5 mb-6 text-left space-y-3">
          <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-slate-400">
            Prochaines étapes :
          </h3>
          
          <div className="flex gap-3 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">1</span>
            <div>
              <p className="font-bold text-white">Appel de confirmation</p>
              <p className="text-[11px] text-slate-400">Notre service client vous appelle pour planifier l'heure de passage du livreur.</p>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">2</span>
            <div>
              <p className="font-bold text-white">Expédition express 24h</p>
              <p className="text-[11px] text-slate-400">Le colis scellé est acheminé directement à votre adresse.</p>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">3</span>
            <div>
              <p className="font-bold text-white">Vérification & Paiement</p>
              <p className="text-[11px] text-slate-400">Vous ouvrez le paquet, vérifiez le produit et réglez en espèces ou MoMo.</p>
            </div>
          </div>
        </div>

        {/* BOUTONS D'ACTION */}
        <div className="space-y-3">
          <a 
            href={whatsappUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(37,211,102,0.3)] transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] group"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Confirmer & Accélérer sur WhatsApp</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <Link href={trackUrl} className="block">
            <button className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm py-3 px-6 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Suivre l'acheminement de mon colis</span>
            </button>
          </Link>

          <Link href={`/p/${slug}`} className="block">
            <button className="w-full text-slate-400 hover:text-slate-300 text-xs py-2 transition-colors cursor-pointer">
              Retourner à la boutique
            </button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-white/10 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Colis Garanti</span>
          <span className="flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5 text-emerald-400" /> Paiement à la réception</span>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F1117]" />}>
      <SuccessContent />
    </Suspense>
  );
}
