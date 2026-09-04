"use client";

import React from "react";
import { ArrowRight, Check, MessageCircle, ShieldCheck, Truck, PackageCheck, RotateCcw } from "lucide-react";
import { OfferItem } from "@/lib/upsellConfig";

export interface BundleOption {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  original_price?: number | null;
  badge?: string | null;
  popular?: boolean;
  description?: string | null;
  subtitle?: string | null;
  quantity?: number;
  savings?: number | null;
}

interface UmeiStyleOrderSectionProps {
  productSlug: string;
  productTitle: string;
  bundles: BundleOption[];
  selectedBundle: BundleOption;
  onSelectBundle: (bundle: BundleOption) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  customerPhone2: string;
  setCustomerPhone2: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  includeBump: boolean;
  setIncludeBump: (val: boolean) => void;
  bumpOffer?: OfferItem;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  accentColor?: string;
  whatsappNumber?: string;
  orderSuccess?: boolean;
  orderNumber?: string;
  onResetOrder?: () => void;
}

/* Palettes de couleurs dédiées par produit */
const THEME_PALETTES: Record<
  string,
  {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    border: string;
    textPrimary: string;
    gradientBtn: string;
    gradientBadge: string;
  }
> = {
  umei: {
    primary: "#FF5C93",
    primaryHover: "#E13D74",
    primaryLight: "#FFF0F5",
    border: "#F3C5D6",
    textPrimary: "#241B36",
    gradientBtn: "linear-gradient(135deg, #FF5C93 0%, #E13D74 100%)",
    gradientBadge: "linear-gradient(135deg, #FF5C93 0%, #8B6FE0 100%)",
  },
  eraclean: {
    primary: "#10B981",
    primaryHover: "#059669",
    primaryLight: "#ECFDF5",
    border: "#A7F3D0",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    gradientBadge: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
  },
  turbofan: {
    primary: "#10B981",
    primaryHover: "#059669",
    primaryLight: "#F0FDF4",
    border: "#BBF7D0",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
    gradientBadge: "linear-gradient(135deg, #10B981 0%, #065F46 100%)",
  },
  peeler: {
    primary: "#0047AB",
    primaryHover: "#003580",
    primaryLight: "#EFF6FF",
    border: "#BFDBFE",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #0047AB 0%, #003580 100%)",
    gradientBadge: "linear-gradient(135deg, #0047AB 0%, #1D4ED8 100%)",
  },
  stabilisateur: {
    primary: "#F59E0B",
    primaryHover: "#D97706",
    primaryLight: "#FFFBEB",
    border: "#FDE68A",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    gradientBadge: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
  },
  veilleuse: {
    primary: "#6366F1",
    primaryHover: "#4F46E5",
    primaryLight: "#EEF2FF",
    border: "#C7D2FE",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    gradientBadge: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
  },
};

export default function UmeiStyleOrderSection({
  productSlug,
  productTitle,
  bundles,
  selectedBundle,
  onSelectBundle,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerPhone2,
  setCustomerPhone2,
  city,
  setCity,
  address,
  setAddress,
  includeBump,
  setIncludeBump,
  bumpOffer,
  isSubmitting,
  onSubmit,
  accentColor,
  whatsappNumber = "2290192901817",
  orderSuccess = false,
  orderNumber,
  onResetOrder,
}: UmeiStyleOrderSectionProps) {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  const bumpPrice = includeBump && bumpOffer ? bumpOffer.price : 0;
  const totalPrice = (selectedBundle?.price || 0) + bumpPrice;

  // Thème de couleur personnalisé adapté à chaque produit
  const normalizedSlug = (productSlug || "").toLowerCase();
  const theme = THEME_PALETTES[normalizedSlug] || {
    primary: accentColor || "#10B981",
    primaryHover: "#059669",
    primaryLight: "#F8FAFC",
    border: "#E2E8F0",
    textPrimary: "#0F172A",
    gradientBtn: `linear-gradient(135deg, ${accentColor || "#10B981"} 0%, #059669 100%)`,
    gradientBadge: `linear-gradient(135deg, ${accentColor || "#10B981"} 0%, #047857 100%)`,
  };

  const scrollToCommander = () => {
    const el = document.getElementById("commander");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // ════════════════ VUE SUCCÈS COMMANDE (SANS DOUBLE PAGE / SANS REDIRECTION) ════════════════
  if (orderSuccess) {
    const finalOrderNum = orderNumber || "CMD-" + Math.floor(100000 + Math.random() * 900000);
    const whatsappMsg = encodeURIComponent(
      `Bonjour Isivente, je viens de valider ma commande pour : *${productTitle}* (${selectedBundle?.name || "1 Pack"}).\n` +
      `Montant total : *${fmt(totalPrice)} FCFA*.\n` +
      `N° Commande : *${finalOrderNum}*.\n` +
      `Nom : *${customerName}*.\n` +
      `Adresse : *${city} - ${address}*.\n` +
      `Merci de confirmer ma livraison !`
    );

    return (
      <section id="commander" className="py-10 px-3 sm:px-6 md:px-8 max-w-[860px] mx-auto w-full">
        <div
          className="rounded-[28px] p-6 sm:p-10 text-center space-y-6 shadow-2xl border-2"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: theme.border,
          }}
        >
          {/* Icône succès */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner"
            style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
          >
            <PackageCheck className="w-8 h-8" />
          </div>

          <div>
            <span
              className="text-[11px] font-mono uppercase tracking-widest font-extrabold px-3.5 py-1 rounded-full border inline-block mb-2"
              style={{
                backgroundColor: theme.primaryLight,
                borderColor: theme.border,
                color: theme.primary,
              }}
            >
              Commande Enregistrée avec Succès
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
              Merci {customerName || "Cher Client"} !
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              Votre commande pour <strong className="text-slate-900">{productTitle}</strong> a bien été enregistrée.
              Notre équipe logistique vous appellera ou vous écrira sur WhatsApp pour organiser la livraison.
            </p>
          </div>

          {/* Récapitulatif de la commande */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-500 font-mono">
              <span>Référence :</span>
              <strong className="text-slate-900 font-bold">{finalOrderNum}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Pack sélectionné :</span>
              <strong className="text-slate-900">
                {selectedBundle?.name}
                {includeBump && bumpOffer ? ` + ${bumpOffer.title}` : ""}
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Destination :</span>
              <strong className="text-slate-900">{city} {address ? `(${address})` : ""}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Téléphone :</span>
              <strong className="text-slate-900 font-mono">{customerPhone}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Livraison :</span>
              <strong className="text-emerald-700 font-bold">24h–48h (Paiement à la réception)</strong>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-base sm:text-lg font-black text-slate-900">
              <span>Total à régler au livreur :</span>
              <span className="font-mono tabular-nums" style={{ color: theme.primary }}>
                {fmt(totalPrice)} FCFA
              </span>
            </div>
          </div>

          {/* Bouton WhatsApp prioritaire */}
          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all text-sm uppercase tracking-wide cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Accélérer ma livraison sur WhatsApp</span>
            </a>

            {onResetOrder && (
              <button
                type="button"
                onClick={onResetOrder}
                className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors pt-2 flex items-center justify-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Passer une autre commande</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-2 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Paiement 100% à la livraison en espèces ou Mobile Money</span>
          </div>
        </div>
      </section>
    );
  }

  // ════════════════ FORMULAIRE DE COMMANDE ACTIF ════════════════
  return (
    <>
      <section id="commander" className="py-10 px-3 sm:px-6 md:px-8 max-w-[860px] mx-auto w-full overflow-hidden">
        <div
          className="rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 md:p-10 shadow-xl border-2 transition-all"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: theme.border,
          }}
        >
          {/* EN-TÊTE ÉPURÉ */}
          <div className="text-center mb-6 sm:mb-8">
            <span
              className="text-white text-[10.5px] sm:text-[11.5px] font-extrabold uppercase tracking-wider py-1 px-3 sm:px-4 rounded-full inline-block mb-2.5 shadow-xs"
              style={{ background: theme.gradientBadge }}
            >
              ⚡ Paiement à la livraison
            </span>
            <h2 className="font-display font-extrabold text-xl sm:text-3xl text-slate-900 mb-1.5">
              Passez votre commande en 30 secondes
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-md mx-auto leading-relaxed">
              Remplissez simplement vos coordonnées ci-dessous. Vous règlerez directement au livreur après réception et inspection de votre colis.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
            
            {/* 1. CHOIX DU PACK */}
            {bundles && bundles.length > 0 && (
              <div>
                <label className="font-extrabold text-xs sm:text-sm text-slate-900 block mb-2.5 text-left">
                  1. Choisissez votre offre :
                </label>
                
                <div className={`grid grid-cols-1 ${bundles.length >= 3 ? "sm:grid-cols-3" : bundles.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-3`}>
                  {bundles.map((b, idx) => {
                    const isSelected = selectedBundle
                      ? (Boolean(selectedBundle.id && b.id) ? selectedBundle.id === b.id : selectedBundle.name === b.name)
                      : idx === 0;
                    const origPrice = b.originalPrice || b.original_price || Math.round(b.price * 1.4);

                    return (
                      <div
                        key={b.id || b.name || idx}
                        onClick={() => onSelectBundle(b)}
                        role="radio"
                        aria-checked={isSelected}
                        className={`rounded-2xl p-3.5 text-center cursor-pointer relative transition-all duration-200 select-none ${
                          isSelected
                            ? "border-[2.5px] shadow-md ring-2 ring-offset-1"
                            : "border-2 border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs"
                        }`}
                        style={{
                          borderColor: isSelected ? theme.primary : undefined,
                          backgroundColor: isSelected ? theme.primaryLight : "#FFFFFF",
                          boxShadow: isSelected ? `0 10px 25px -5px ${theme.primary}30` : undefined,
                          transform: isSelected ? "scale(1.02)" : "scale(1)",
                        }}
                      >
                        {b.badge && (
                          <span
                            className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[9.5px] sm:text-[10px] font-extrabold py-0.5 px-3 rounded-full whitespace-nowrap shadow-sm tracking-wide uppercase"
                            style={{ backgroundColor: theme.primary }}
                          >
                            {b.badge}
                          </span>
                        )}

                        {/* Indicateur radio visuel en haut */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {b.quantity ? `${b.quantity} pièce${b.quantity > 1 ? "s" : ""}` : `Option ${idx + 1}`}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected ? "text-white shadow-xs" : "border-2 border-slate-300 bg-white"
                            }`}
                            style={{
                              backgroundColor: isSelected ? theme.primary : "#FFFFFF",
                              borderColor: isSelected ? theme.primary : "#CBD5E1",
                            }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="font-display font-bold text-xs sm:text-[14px] text-slate-900 mt-0.5 leading-snug">
                          {b.name}
                        </div>

                        <div
                          className="font-display font-black text-xl sm:text-2xl my-1 font-mono tabular-nums"
                          style={{ color: theme.primary }}
                        >
                          {fmt(b.price)} F
                        </div>

                        {origPrice && (
                          <div className="text-[11px] text-slate-400 line-through font-medium font-mono tabular-nums">
                            {fmt(origPrice)} F
                          </div>
                        )}

                        {(b.description || b.subtitle) && (
                          <div className="text-[10.5px] text-slate-500 mt-1 font-medium leading-tight">
                            {b.description || b.subtitle}
                          </div>
                        )}

                        {/* Bouton indicateur d'état sélectionné */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center">
                          {isSelected ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full text-white shadow-2xs"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              Pack Sélectionné
                            </span>
                          ) : (
                            <span className="text-[10.5px] font-bold text-slate-400 hover:text-slate-600">
                              Cliquer pour choisir
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. COORDONNÉES CLIENT */}
            <div>
              <label className="font-extrabold text-xs sm:text-sm text-slate-900 block mb-2.5 text-left">
                2. Vos informations de livraison :
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Nom & Prénom <span style={{ color: theme.primary }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Paul Dossou"
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Téléphone WhatsApp (Principal) <span style={{ color: theme.primary }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: 97 00 00 00"
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none transition-colors font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Deuxième Téléphone (Optionnel)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone2}
                    onChange={(e) => setCustomerPhone2(e.target.value)}
                    placeholder="Ex: 95 00 00 00"
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Ville de livraison <span style={{ color: theme.primary }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Cotonou, Calavi, Porto-Novo..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Quartier & Repère précis <span style={{ color: theme.primary }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Haie Vive, 2ème ruelle après la pharmacie..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* OPTION SUPPLÉMENTAIRE (BUMP SANS GARANTIE) */}
            {bumpOffer && (
              <div 
                onClick={() => setIncludeBump(!includeBump)}
                className="p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer select-none text-left"
                style={{
                  borderColor: includeBump ? theme.primary : "#E2E8F0",
                  backgroundColor: includeBump ? theme.primaryLight : "#FFFFFF",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={includeBump}
                      onChange={(e) => setIncludeBump(e.target.checked)}
                      className="w-5 h-5 rounded-md cursor-pointer"
                      style={{ accentColor: theme.primary }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider text-white px-2 py-0.5 rounded-md shadow-2xs"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {bumpOffer.badge || "OFFRE EXCLUSIVE"}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {bumpOffer.title}
                      </span>
                    </div>
                    {bumpOffer.subtitle && (
                      <p className="text-xs text-slate-600 leading-snug">
                        {bumpOffer.subtitle}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                      {bumpOffer.originalPrice && (
                        <span className="line-through text-slate-400 tabular-nums">
                          {fmt(bumpOffer.originalPrice)} FCFA
                        </span>
                      )}
                      <span className="font-bold tabular-nums text-sm" style={{ color: theme.primary }}>
                        +{fmt(bumpOffer.price)} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RÉCAPITULATIF SANS GARANTIE */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-left">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Pack sélectionné :</span>
                <strong className="text-slate-900 truncate max-w-[200px] sm:max-w-none">
                  {selectedBundle?.name || productTitle}
                  {includeBump && bumpOffer ? ` + ${bumpOffer.title}` : ""}
                </strong>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Livraison :</span>
                <strong className="text-emerald-700 font-bold">24h–48h (Paiement à la réception)</strong>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total à régler au livreur :</span>
                <span className="font-mono tabular-nums text-base sm:text-lg font-black" style={{ color: theme.primary }}>
                  {fmt(totalPrice)} FCFA
                </span>
              </div>
            </div>

            {/* BOUTON VALIDATION */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[52px] text-white p-3.5 rounded-xl font-display font-extrabold text-sm sm:text-base shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ background: theme.gradientBtn }}
            >
              {isSubmitting ? (
                <span>Enregistrement de votre commande...</span>
              ) : (
                <>
                  <span>Je confirme ma commande ({fmt(totalPrice)} FCFA)</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-500 font-medium">
              🔒 Vos coordonnées restent strictement confidentielles pour le coursier.
            </p>

          </form>

        </div>
      </section>

      {/* 📱 BARRE FIXE EN BAS SUR MOBILE AUX COULEURS DU PRODUIT */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-[10px] text-slate-500 font-bold">Total à régler :</div>
          <div
            className="font-display font-extrabold text-base leading-none font-mono tabular-nums"
            style={{ color: theme.primary }}
          >
            {fmt(totalPrice)} F
          </div>
        </div>
        <button
          type="button"
          onClick={scrollToCommander}
          className="text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          style={{ backgroundColor: theme.primary }}
        >
          <span>Commander</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 💬 BOUTON FLOATING WHATSAPP ASSISTANCE */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour ! J'ai une question concernant le produit : ${productTitle}.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 md:bottom-6 right-4 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center cursor-pointer border-2 border-white"
        title="Besoin d'aide ? Écrivez-nous sur WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
      </a>
    </>
  );
}
