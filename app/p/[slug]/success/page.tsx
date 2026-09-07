"use client";

import React, { useEffect, useState, Suspense } from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  Truck, 
  PackageCheck, 
  ShieldCheck,
  PhoneCall,
  Clock,
  Sparkles
} from "lucide-react";
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-emerald-100">
      <div className="bg-white border border-slate-200/90 max-w-lg w-full rounded-3xl p-6 sm:p-9 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden">
        
        {/* ICON CHECK FIGMA-GRADE */}
        <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-9 h-9 text-emerald-600 stroke-[2.2]" />
        </div>
        
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3.5 py-1 rounded-full border border-emerald-200 inline-block mb-3">
          Commande Validée avec Succès
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
          Félicitations {name ? name.split(" ")[0] : ""} !
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-600 mt-2 mb-6 leading-relaxed max-w-md mx-auto">
          Merci pour votre confiance. Votre colis est immédiatement transmis à notre équipe logistique pour préparation et expédition express.
        </p>

        {/* 🌟 ACTION PRINCIPALE UNIQUE : CONFIRMATION WHATSAPP */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 mb-6 text-left shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-bold text-xs sm:text-sm text-emerald-950 uppercase tracking-wide">
              Étape recommandée : Accélérez votre livraison
            </h3>
          </div>
          <p className="text-xs text-emerald-800/90 leading-relaxed mb-4">
            Envoyez votre message WhatsApp en 1 clic pour que notre agent livreur valide votre adresse et parte immédiatement :
          </p>

          <a 
            href={whatsappUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 font-black text-sm sm:text-base py-4 px-6 rounded-xl shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] group"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Envoyer le message WhatsApp</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 📋 RÉCAPITULATIF COMMANDE FIGMA-GRADE */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-6 text-left space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-slate-600">
            <span>N° de commande :</span>
            <span className="font-mono font-bold text-slate-900 tracking-wide">
              {orderRef ? `#${orderRef}` : "ISV-" + Math.floor(100000 + Math.random() * 900000)}
            </span>
          </div>

          {name && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Destinataire :</span>
              <span className="font-semibold text-slate-900">{name}</span>
            </div>
          )}

          {phone && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Téléphone :</span>
              <span className="font-mono font-medium text-slate-900">{phone}</span>
            </div>
          )}

          {(hasUpsell || hasDownsell) && (
            <div className="flex justify-between items-center text-emerald-700 font-semibold pt-1">
              <span>Offre ajoutée :</span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {hasUpsell ? "Offre VIP 1-Clic" : "Pack Spécial"}
              </span>
            </div>
          )}

          {total > 0 && (
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-950">
              <span>Montant à régler à la livraison :</span>
              <span className="font-mono tabular-nums text-base sm:text-lg text-emerald-700">
                {fmt(total)} FCFA
              </span>
            </div>
          )}
        </div>

        {/* 🚚 ÉTAPES SUIVANTES CLAIRES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 text-left space-y-3">
          <h3 className="font-mono font-bold text-[11px] uppercase tracking-wider text-slate-500">
            Comment se passe la livraison ?
          </h3>
          
          <div className="flex gap-3 text-xs text-slate-700">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-300">1</span>
            <div>
              <p className="font-bold text-slate-950">Appel de confirmation</p>
              <p className="text-[11px] text-slate-500">Notre livreur vous contacte au {phone || "numéro indiqué"} pour planifier le passage.</p>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-slate-700">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-300">2</span>
            <div>
              <p className="font-bold text-slate-950">Acheminement express</p>
              <p className="text-[11px] text-slate-500">Le colis scellé est livré directement à votre domicile ou lieu de travail.</p>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-slate-700">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-300">3</span>
            <div>
              <p className="font-bold text-slate-950">Vérification & Paiement</p>
              <p className="text-[11px] text-slate-500">Vous vérifiez le colis et vous ne payez qu'après réception (Espèces ou Mobile Money).</p>
            </div>
          </div>
        </div>

        {/* ACTIONS SECONDAIRES DISCRÈTES */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <Link href={trackUrl} className="block">
            <span className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Consulter le statut du colis en ligne</span>
            </span>
          </Link>

          <div>
            <Link href={`/p/${slug}`} className="inline-block">
              <span className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-1">
                Retourner à la boutique
              </span>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Colis Garanti</span>
          <span className="flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5 text-emerald-600" /> Paiement à la réception</span>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <SuccessContent />
    </Suspense>
  );
}
