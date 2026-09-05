"use client";

import React, { useState, useId } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Truck,
  PackageCheck,
  RotateCcw,
  Sparkles,
  Gift,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { OfferItem, getProductUpsellConfig } from "@/lib/upsellConfig";
import { playOrderSound } from "@/lib/soundEffects";

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
  productImage?: string;
  bundles?: BundleOption[];
  selectedBundle?: BundleOption;
  onSelectBundle?: (bundle: BundleOption) => void;
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
  includeSecondUnit?: boolean;
  setIncludeSecondUnit?: (val: boolean) => void;
  secondUnitOffer?: OfferItem;
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
    shadowColor: string;
  }
> = {
  umei: {
    primary: "#FF5C93",
    primaryHover: "#E13D74",
    primaryLight: "#FFF0F5",
    border: "#FBCFE8",
    textPrimary: "#241B36",
    gradientBtn: "linear-gradient(135deg, #FF5C93 0%, #E13D74 100%)",
    gradientBadge: "linear-gradient(135deg, #FF5C93 0%, #8B6FE0 100%)",
    shadowColor: "rgba(255, 92, 147, 0.25)",
  },
  eraclean: {
    primary: "#10B981",
    primaryHover: "#059669",
    primaryLight: "#ECFDF5",
    border: "#A7F3D0",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    gradientBadge: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
    shadowColor: "rgba(16, 185, 129, 0.25)",
  },
  turbofan: {
    primary: "#10B981",
    primaryHover: "#059669",
    primaryLight: "#F0FDF4",
    border: "#BBF7D0",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
    gradientBadge: "linear-gradient(135deg, #10B981 0%, #065F46 100%)",
    shadowColor: "rgba(16, 185, 129, 0.25)",
  },
  peeler: {
    primary: "#0047AB",
    primaryHover: "#003580",
    primaryLight: "#EFF6FF",
    border: "#BFDBFE",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #0047AB 0%, #003580 100%)",
    gradientBadge: "linear-gradient(135deg, #0047AB 0%, #1D4ED8 100%)",
    shadowColor: "rgba(0, 71, 171, 0.25)",
  },
  stabilisateur: {
    primary: "#F59E0B",
    primaryHover: "#D97706",
    primaryLight: "#FFFBEB",
    border: "#FDE68A",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    gradientBadge: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
    shadowColor: "rgba(245, 158, 11, 0.25)",
  },
  veilleuse: {
    primary: "#6366F1",
    primaryHover: "#4F46E5",
    primaryLight: "#EEF2FF",
    border: "#C7D2FE",
    textPrimary: "#0F172A",
    gradientBtn: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    gradientBadge: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
    shadowColor: "rgba(99, 102, 241, 0.25)",
  },
};

/* Villes majeures du Bénin avec estimation de livraison */
const BENIN_CITIES = [
  { name: "Cotonou", delay: "Moins de 24h", isExpress: true },
  { name: "Abomey-Calavi", delay: "Moins de 24h", isExpress: true },
  { name: "Porto-Novo", delay: "24h - 48h", isExpress: false },
  { name: "Parakou", delay: "48h", isExpress: false },
  { name: "Bohicon", delay: "24h - 48h", isExpress: false },
  { name: "Ouidah", delay: "24h - 48h", isExpress: false },
  { name: "Natitingou", delay: "48h - 72h", isExpress: false },
  { name: "Autre ville", delay: "24h - 48h", isExpress: false },
];

export default function UmeiStyleOrderSection({
  productSlug,
  productTitle,
  productImage,
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
  includeSecondUnit,
  setIncludeSecondUnit,
  secondUnitOffer,
  isSubmitting,
  onSubmit,
  accentColor,
  whatsappNumber = "2290192901817",
  orderSuccess = false,
  orderNumber,
  onResetOrder,
}: UmeiStyleOrderSectionProps) {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  const normalizedSlug = (productSlug || "").toLowerCase();

  // Configuration d'upsell automatique si non passée
  const fallbackUpsellConfig = getProductUpsellConfig(
    normalizedSlug,
    productTitle,
    selectedBundle?.price || 14900
  );

  const resolvedSecondUnit = secondUnitOffer || fallbackUpsellConfig.secondUnit;
  const resolvedBump = bumpOffer || fallbackUpsellConfig.bump;

  // Gestion interne de la 2ème unité si le parent ne gère pas le state
  const [internalSecondUnit, setInternalSecondUnit] = useState(false);
  const isSecondUnitActive =
    includeSecondUnit !== undefined ? includeSecondUnit : internalSecondUnit;
  const toggleSecondUnit = () => {
    try {
      playOrderSound("ios_pop", 0.5);
    } catch {}
    if (setIncludeSecondUnit) {
      setIncludeSecondUnit(!isSecondUnitActive);
    } else {
      setInternalSecondUnit(!internalSecondUnit);
    }
  };

  const toggleBump = () => {
    try {
      playOrderSound("ios_pop", 0.5);
    } catch {}
    setIncludeBump(!includeBump);
  };

  // Calcul du prix unitaire de base (1 article)
  const basePrice = selectedBundle?.price || 14900;
  const secondUnitPrice = isSecondUnitActive && resolvedSecondUnit ? resolvedSecondUnit.price : 0;
  const bumpPrice = includeBump && resolvedBump ? resolvedBump.price : 0;
  const totalPrice = basePrice + secondUnitPrice + bumpPrice;

  // Thème de couleur personnalisé adapté à chaque produit
  const theme = THEME_PALETTES[normalizedSlug] || {
    primary: accentColor || "#10B981",
    primaryHover: "#059669",
    primaryLight: "#F8FAFC",
    border: "#E2E8F0",
    textPrimary: "#0F172A",
    gradientBtn: `linear-gradient(135deg, ${accentColor || "#10B981"} 0%, #059669 100%)`,
    gradientBadge: `linear-gradient(135deg, ${accentColor || "#10B981"} 0%, #047857 100%)`,
    shadowColor: "rgba(16, 185, 129, 0.25)",
  };

  // Validation téléphone WhatsApp Bénin (au moins 8 chiffres)
  const cleanPhone = (customerPhone || "").replace(/\D/g, "");
  const isPhoneValid = cleanPhone.length >= 8;

  // Calcul du délai pour la ville sélectionnée
  const selectedCityObj = BENIN_CITIES.find(
    (c) => c.name.toLowerCase() === (city || "").trim().toLowerCase()
  );
  const deliveryDelay = selectedCityObj ? selectedCityObj.delay : "24h – 48h";
  const isExpressCity = selectedCityObj ? selectedCityObj.isExpress : false;

  const scrollToCommander = () => {
    const el = document.getElementById("commander");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // ════════════════ VUE SUCCÈS COMMANDE (INSTANTANÉE SANS REDIRECTION) ════════════════
  if (orderSuccess) {
    const finalOrderNum =
      orderNumber || "CMD-" + Math.floor(100000 + Math.random() * 900000);

    const itemsSummary = [
      `1x ${productTitle}`,
      isSecondUnitActive && resolvedSecondUnit ? `+ 2ème exemplaire (Offre Cadeau)` : null,
      includeBump && resolvedBump ? `+ ${resolvedBump.title}` : null,
    ]
      .filter(Boolean)
      .join(" ");

    const whatsappMsg = encodeURIComponent(
      `Bonjour Isivente, je viens de passer ma commande pour : *${productTitle}*.\n` +
      `📦 Détail : *${itemsSummary}*\n` +
      `💰 Montant total à la livraison : *${fmt(totalPrice)} FCFA*\n` +
      `🔖 N° Commande : *${finalOrderNum}*\n` +
      `👤 Nom : *${customerName}*\n` +
      `📍 Ville & Quartier : *${city} - ${address}*\n` +
      `Merci de me contacter pour convenir de l'heure de livraison.`
    );

    return (
      <section
        id="commander"
        className="py-10 px-3 sm:px-6 md:px-8 max-w-[860px] mx-auto w-full"
      >
        <div
          className="rounded-[28px] p-6 sm:p-10 text-center space-y-6 shadow-2xl border-2"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: theme.border,
            boxShadow: `0 20px 40px -15px ${theme.shadowColor}`,
          }}
        >
          {/* Icône succès avec animation d'onde */}
          <div className="relative w-20 h-20 mx-auto">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: theme.primary }}
            />
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner"
              style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
            >
              <CheckCircle2 className="w-10 h-10" />
            </div>
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
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1 tracking-tight">
              Merci {customerName || "Cher Client"} !
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              Votre commande pour <strong className="text-slate-900">{productTitle}</strong> est bien validée.
              Notre service logistique vous contacte très vite pour vous livrer.
            </p>
          </div>

          {/* Récapitulatif de la commande */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-500 font-mono">
              <span>Référence commande :</span>
              <strong className="text-slate-900 font-bold">{finalOrderNum}</strong>
            </div>
            <div className="flex justify-between items-start text-slate-700">
              <span className="shrink-0">Articles :</span>
              <strong className="text-slate-900 text-right">
                1x {productTitle}
                {isSecondUnitActive && (
                  <span className="block text-emerald-700 font-semibold">
                    + 1x 2ème Exemplaire Cadeau
                  </span>
                )}
                {includeBump && resolvedBump && (
                  <span className="block text-slate-700 font-normal">
                    + {resolvedBump.title}
                  </span>
                )}
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Livraison à :</span>
              <strong className="text-slate-900">
                {city} {address ? `(${address})` : ""}
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Téléphone WhatsApp :</span>
              <strong className="text-slate-900 font-mono">{customerPhone}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Délai estimé :</span>
              <strong className="text-emerald-700 font-bold">
                {deliveryDelay} (Paiement à la réception)
              </strong>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-base sm:text-lg font-black text-slate-900">
              <span>Montant à régler au livreur :</span>
              <span
                className="font-mono tabular-nums text-xl"
                style={{ color: theme.primary }}
              >
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
              <span>Confirmer l'heure de livraison sur WhatsApp</span>
            </a>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <a
                href="/track"
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Suivre l'état de mon colis</span>
              </a>

              {onResetOrder && (
                <button
                  type="button"
                  onClick={onResetOrder}
                  className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Passer une autre commande</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-2 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Paiement 100% à la livraison après inspection de votre colis</span>
          </div>
        </div>
      </section>
    );
  }

  // ════════════════ FORMULAIRE DE COMMANDE ÉPURÉ (1 PIÈCE + ORDER BUMP DUO) ════════════════
  return (
    <>
      <section
        id="commander"
        className="py-8 px-3 sm:px-6 md:px-8 max-w-[680px] mx-auto w-full overflow-hidden"
      >
        <div
          className="rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 md:p-8 shadow-xl border-2 transition-all"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: theme.border,
            boxShadow: `0 16px 36px -12px ${theme.shadowColor}`,
          }}
        >
          {/* EN-TÊTE DU FORMULAIRE */}
          <div className="text-center mb-5 sm:mb-6">
            <span
              className="text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider py-1 px-3 sm:px-3.5 rounded-full inline-block mb-2 shadow-xs"
              style={{ background: theme.gradientBadge }}
            >
              ⚡ Paiement à la livraison au Bénin
            </span>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mb-1 tracking-tight">
              Commandez en 30 secondes
            </h2>
            <p className="text-slate-600 text-xs sm:text-[13px] font-medium max-w-sm mx-auto leading-relaxed">
              Remplissez vos coordonnées ci-dessous. Vous règlerez directement au livreur après ouverture du colis.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            {/* 1. CARTE DU PRODUIT DE BASE (1 UNITÉ INCLUSE) */}
            <div
              className="rounded-2xl p-4 border-2 transition-all text-left relative overflow-hidden"
              style={{
                backgroundColor: theme.primaryLight,
                borderColor: theme.border,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 border shadow-xs"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: theme.border,
                    }}
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productTitle}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <PackageCheck
                        className="w-6 h-6"
                        style={{ color: theme.primary }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: theme.primary }}
                      >
                        1 Exemplaire Inclus
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        En Stock
                      </span>
                    </div>
                    <div className="font-display font-bold text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                      {productTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Coffret complet avec accessoires
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className="font-display font-black text-base sm:text-xl font-mono tabular-nums"
                    style={{ color: theme.primary }}
                  >
                    {fmt(basePrice)} F
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    FCFA
                  </div>
                </div>
              </div>
            </div>

            {/* 2. OFFRE 1-CLIC : 2ÈME EXEMPLAIRE POUR UN PROCHE (ORDER BUMP DUO) */}
            {resolvedSecondUnit && (
              <div
                onClick={toggleSecondUnit}
                className="p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none text-left relative overflow-hidden active:scale-[0.99]"
                style={{
                  borderColor: isSecondUnitActive ? theme.primary : "#CBD5E1",
                  backgroundColor: isSecondUnitActive ? theme.primaryLight : "#FFFFFF",
                  boxShadow: isSecondUnitActive
                    ? `0 8px 24px -6px ${theme.shadowColor}`
                    : "0 2px 8px -2px rgba(0,0,0,0.04)",
                }}
              >
                {/* Liseré supérieur biseauté */}
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isSecondUnitActive
                          ? "text-white shadow-xs"
                          : "border-2 border-slate-300 bg-white"
                      }`}
                      style={{
                        backgroundColor: isSecondUnitActive ? theme.primary : "#FFFFFF",
                        borderColor: isSecondUnitActive ? theme.primary : "#94A3B8",
                      }}
                    >
                      {isSecondUnitActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-[9.5px] font-extrabold uppercase tracking-wider text-white px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <Gift className="w-3 h-3" />
                        {resolvedSecondUnit.badge || "OFFRE 2ÈME UNITÉ"}
                      </span>
                      {resolvedSecondUnit.savings && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Économisez {fmt(resolvedSecondUnit.savings)} FCFA
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {resolvedSecondUnit.title}
                    </div>

                    {resolvedSecondUnit.subtitle && (
                      <p className="text-xs text-slate-600 leading-snug mt-0.5">
                        {resolvedSecondUnit.subtitle}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                      {resolvedSecondUnit.originalPrice && (
                        <span className="line-through text-slate-400 tabular-nums">
                          {fmt(resolvedSecondUnit.originalPrice)} FCFA
                        </span>
                      )}
                      <span
                        className="font-black tabular-nums text-sm"
                        style={{ color: theme.primary }}
                      >
                        +{fmt(resolvedSecondUnit.price)} FCFA
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        (Livré dans le même colis)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. COORDONNÉES DE LIVRAISON CLIENT */}
            <div id="step-client-info" className="space-y-3 pt-2">
              <label className="font-extrabold text-xs sm:text-sm text-slate-900 block text-left">
                Vos informations de livraison :
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nom & Prénom */}
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
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: customerName ? theme.border : undefined,
                    }}
                  />
                </div>

                {/* Téléphone WhatsApp */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      Téléphone WhatsApp <span style={{ color: theme.primary }}>*</span>
                    </label>
                    {isPhoneValid && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" /> Valide
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                      🇧🇯 +229
                    </div>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="97 00 00 00"
                      className="w-full p-3 pl-16 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all font-mono font-bold tracking-wide"
                      style={{
                        borderColor: isPhoneValid ? "#10B981" : undefined,
                      }}
                    />
                  </div>
                </div>

                {/* Téléphone Secondaire */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Deuxième Téléphone (Optionnel)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone2}
                    onChange={(e) => setCustomerPhone2(e.target.value)}
                    placeholder="Ex: 95 00 00 00"
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all font-mono"
                  />
                </div>

                {/* Sélecteur de Ville intelligent */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      Ville de livraison <span style={{ color: theme.primary }}>*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {deliveryDelay}
                    </span>
                  </div>

                  <select
                    value={city}
                    required
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all font-semibold"
                    style={{
                      borderColor: city ? theme.border : undefined,
                    }}
                  >
                    <option value="">Sélectionnez votre ville...</option>
                    {BENIN_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} {c.isExpress ? "⚡ (Express 24h)" : `(${c.delay})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Si Autre Ville sélectionné, champ de saisie directe */}
                {city === "Autre ville" && (
                  <div className="sm:col-span-2 space-y-1 text-left animate-fade-in">
                    <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                      Précisez le nom de votre ville / localité <span style={{ color: theme.primary }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Lokossa, Abomey, Kandi..."
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all"
                    />
                  </div>
                )}

                {/* Quartier & Repère précis */}
                <div className="sm:col-span-2 space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Quartier & Repère précis pour le livreur <span style={{ color: theme.primary }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Haie Vive, derrière la pharmacie du quartier..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 4. ACCESSOIRE COMPLÉMENTAIRE (BUMP ACCESSOIRE OPTIONNEL) */}
            {resolvedBump && (
              <div
                onClick={toggleBump}
                className="p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer select-none text-left"
                style={{
                  borderColor: includeBump ? theme.primary : "#E2E8F0",
                  backgroundColor: includeBump ? theme.primaryLight : "#F8FAFC",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={includeBump}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleBump();
                      }}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: theme.primary }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-wider text-white px-1.5 py-0.5 rounded shadow-2xs"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {resolvedBump.badge || "ACCESSOIRE RECOMMANDÉ"}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {resolvedBump.title}
                      </span>
                    </div>
                    {resolvedBump.subtitle && (
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {resolvedBump.subtitle}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                      {resolvedBump.originalPrice && (
                        <span className="line-through text-slate-400 tabular-nums text-[11px]">
                          {fmt(resolvedBump.originalPrice)} FCFA
                        </span>
                      )}
                      <span
                        className="font-bold tabular-nums text-xs"
                        style={{ color: theme.primary }}
                      >
                        +{fmt(resolvedBump.price)} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. RÉCAPITULATIF DU TOTAL */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-left">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>1x {productTitle} :</span>
                <strong className="text-slate-900 font-mono tabular-nums">
                  {fmt(basePrice)} FCFA
                </strong>
              </div>

              {isSecondUnitActive && resolvedSecondUnit && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>+ 2ème exemplaire (Offre Cadeau) :</span>
                  <span className="font-mono tabular-nums">
                    +{fmt(resolvedSecondUnit.price)} FCFA
                  </span>
                </div>
              )}

              {includeBump && resolvedBump && (
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>+ {resolvedBump.title} :</span>
                  <span className="font-mono tabular-nums">
                    +{fmt(resolvedBump.price)} FCFA
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Frais de livraison :</span>
                <strong className="text-emerald-700 font-bold">
                  Gratuite • Paiement à réception
                </strong>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total à régler au livreur :</span>
                <span
                  className="font-mono tabular-nums text-lg sm:text-xl font-black"
                  style={{ color: theme.primary }}
                >
                  {fmt(totalPrice)} FCFA
                </span>
              </div>
            </div>

            {/* 6. BOUTON PRINCIPAL DE VALIDATION */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[54px] text-white p-3.5 rounded-2xl font-display font-extrabold text-sm sm:text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                background: theme.gradientBtn,
                boxShadow: `0 10px 24px -6px ${theme.shadowColor}`,
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validation de votre commande...</span>
                </div>
              ) : (
                <>
                  <span>
                    Valider ma commande ({fmt(totalPrice)} FCFA)
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>

            {/* RÉASSURANCES LOCALES */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 text-center font-medium">
              <div className="flex items-center justify-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ouvrez avant de payer</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Livraison 24h–48h Bénin</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 📱 BARRE FIXE SUR MOBILE AUX COULEURS DU PRODUIT */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-[10px] text-slate-500 font-bold">Total à la livraison :</div>
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
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          `Bonjour ! J'ai une question concernant le produit : ${productTitle}.`
        )}`}
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
