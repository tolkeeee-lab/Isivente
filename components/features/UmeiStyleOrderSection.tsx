"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { playOrderSound } from "@/lib/soundEffects";
import { trackAddToCart, trackInitiateCheckout, trackLead } from "@/lib/metaPixel";
import { saveOrUpdateLead, markLeadConverted } from "@/lib/leadsStorage";
import { markCurrentSessionClicked } from "@/lib/analyticsStorage";
import { isBeninPhoneComplete } from "@/lib/phoneUtils";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import { saveUserContactInfo } from "@/lib/userTracking";
import { detectBeninCity } from "@/lib/cityUtils";

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
  customerPhone2?: string;
  setCustomerPhone2?: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  reservationDate?: string;
  setReservationDate?: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  accentColor?: string;
  whatsappNumber?: string;
  orderSuccess?: boolean;
  orderNumber?: string;
  onResetOrder?: () => void;
}

/* Génération dynamique de la palette (boutons, bordures, badges, fonds) à partir de accentColor */
function buildDynamicTheme(hexInput?: string) {
  const cleanHex = (hexInput || "#0F172A").replace("#", "").trim();
  const isValidHex = /^[0-9A-Fa-f]{6}$/.test(cleanHex);
  const r = isValidHex ? parseInt(cleanHex.slice(0, 2), 16) : 15;
  const g = isValidHex ? parseInt(cleanHex.slice(2, 4), 16) : 23;
  const b = isValidHex ? parseInt(cleanHex.slice(4, 6), 16) : 42;

  const darken = (factor: number) =>
    `rgb(${Math.max(0, Math.round(r * (1 - factor)))}, ${Math.max(0, Math.round(g * (1 - factor)))}, ${Math.max(0, Math.round(b * (1 - factor)))})`;

  return {
    primary: isValidHex ? `#${cleanHex}` : "#0F172A",
    primaryHover: darken(0.18),
    primaryLight: `rgba(${r}, ${g}, ${b}, 0.06)`,
    border: `rgba(${r}, ${g}, ${b}, 0.28)`,
    textPrimary: darken(0.38),
    ringColor: `rgba(${r}, ${g}, ${b}, 0.25)`,
    badgeBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
    badgeText: darken(0.25),
  };
}

/* Villes majeures du Bénin */
const BENIN_CITIES = [
  { name: "Cotonou", delay: "Moins de 24h", express: true },
  { name: "Abomey-Calavi", delay: "Moins de 24h", express: true },
  { name: "Porto-Novo", delay: "24h – 48h", express: false },
  { name: "Parakou", delay: "48h", express: false },
  { name: "Bohicon", delay: "24h – 48h", express: false },
  { name: "Ouidah", delay: "24h – 48h", express: false },
  { name: "Autre ville", delay: "24h – 48h", express: false },
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
  reservationDate,
  setReservationDate,
  isSubmitting,
  onSubmit,
  accentColor,
  whatsappNumber = "2290192901817",
  orderSuccess = false,
  orderNumber,
  onResetOrder,
}: UmeiStyleOrderSectionProps) {
  const [orderType, setOrderType] = useState<"immediate" | "reservation">("immediate");
  const [internalReservationDate, setInternalReservationDate] = useState("");
  const currentReservationDate = reservationDate !== undefined ? reservationDate : internalReservationDate;
  const handleReservationChange = (val: string) => {
    setInternalReservationDate(val);
    if (setReservationDate) setReservationDate(val);
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
  const normalizedSlug = (productSlug || "").toLowerCase();

  const resolvedAccentColor =
    accentColor ||
    DEFAULT_CATALOG_MAP[normalizedSlug]?.accentColor ||
    "#0F172A";
  const theme = buildDynamicTheme(resolvedAccentColor);

  // Liste de packs par défaut si non fournie
  const defaultBundles: BundleOption[] = [
    {
      id: "solo",
      name: "1 Article",
      quantity: 1,
      price: selectedBundle?.price || 14900,
      original_price: (selectedBundle?.price || 14900) * 1.5,
      popular: false,
    },
    {
      id: "duo",
      name: "2 Articles",
      quantity: 2,
      price: (selectedBundle?.price || 14900) * 1.7,
      original_price: (selectedBundle?.price || 14900) * 3,
      badge: "-40% sur le 2ème",
      popular: true,
    },
    {
      id: "famille",
      name: "3 Articles",
      quantity: 3,
      price: (selectedBundle?.price || 14900) * 2.3,
      original_price: (selectedBundle?.price || 14900) * 4.5,
      badge: "Pack Économique",
      popular: false,
    },
  ];

  const availableBundles = bundles && bundles.length > 0 ? bundles : defaultBundles;
  const currentBundle = selectedBundle || availableBundles[0];
  const totalPrice = currentBundle.price;

  // Validation téléphone adaptée au Bénin (10 chiffres si avec 01, ou 8 chiffres si sans 01)
  const cleanPhone = (customerPhone || "").replace(/\D/g, "");
  const isPhoneValid = isBeninPhoneComplete(cleanPhone);

  // Estimation ville
  const selectedCityObj = BENIN_CITIES.find(
    (c) => c.name.toLowerCase() === (city || "").trim().toLowerCase()
  );
  const deliveryDelay = selectedCityObj ? selectedCityObj.delay : "24h à 48h";

  // Suivi Meta Pixel & CAPI automatique (AddToCart & InitiateCheckout)
  const checkoutTrackedRef = useRef(false);
  const handleInteractionTrigger = () => {
    markCurrentSessionClicked(normalizedSlug || productSlug);
    if (!checkoutTrackedRef.current) {
      checkoutTrackedRef.current = true;
      trackAddToCart({
        content_name: productTitle,
        content_ids: [normalizedSlug || "product"],
        value: totalPrice,
        currency: "XOF",
        num_items: currentBundle.quantity || 1,
        customer_phone: customerPhone || undefined,
        customer_name: customerName || undefined,
        city: city || undefined,
      });
      trackInitiateCheckout({
        content_name: productTitle,
        content_ids: [normalizedSlug || "product"],
        value: totalPrice,
        currency: "XOF",
        num_items: currentBundle.quantity || 1,
        customer_phone: customerPhone || undefined,
        customer_name: customerName || undefined,
        city: city || undefined,
      });
    }
  };

  // Capture silencieuse en temps réel des prospects (Paniers abandonnés)
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const captureGhostLead = () => {
    markCurrentSessionClicked(normalizedSlug || productSlug);
    const digits = (customerPhone || "").replace(/\D/g, "");
    if (isBeninPhoneComplete(digits)) {
      // Sauvegarder les coordonnées pour le Pixel & CAPI
      saveUserContactInfo({
        phone: digits,
        name: customerName,
        city: city || "Cotonou",
      });

      // Mettre à jour InitiateCheckout avec le numéro de téléphone pour maximiser l'Event Match Quality
      trackInitiateCheckout({
        content_name: productTitle,
        content_ids: [normalizedSlug || "product"],
        value: totalPrice,
        currency: "XOF",
        num_items: currentBundle.quantity || 1,
        customer_phone: digits,
        customer_name: customerName || undefined,
        city: city || undefined,
      });

      const payload = {
        customer_name: customerName,
        customer_phone: digits,
        customer_phone2: customerPhone2,
        city: city || "Cotonou",
        address: address || "",
        product_slug: normalizedSlug || productSlug,
        product_title: productTitle,
        bundle_name: currentBundle.name,
        total_amount: totalPrice,
      };
      // Sauvegarde locale instantanée
      saveOrUpdateLead(payload);
      // Transmission de l'événement Lead à Meta Pixel & CAPI
      trackLead({
        order_id: `lead_${digits}_${normalizedSlug || productSlug}`,
        content_name: productTitle,
        content_ids: [normalizedSlug || productSlug],
        value: totalPrice,
        currency: "XOF",
      });
      // Transmission silencieuse au serveur
      try {
        fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => { });

      } catch { }
    }
  };

  // Dès que le client a tapé un numéro complet selon son format (10 chiffres si avec 01, ou 8 chiffres si sans 01)
  useEffect(() => {
    const digits = (customerPhone || "").replace(/\D/g, "");
    if (isBeninPhoneComplete(digits)) {
      if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = setTimeout(() => {
        captureGhostLead();
      }, 1200);
    }
    return () => {
      if (captureTimeoutRef.current) clearTimeout(captureTimeoutRef.current);
    };
  }, [customerPhone, customerName, city, address, currentBundle, totalPrice]);

  // Redirection WhatsApp automatique après succès & Conversion du lead
  useEffect(() => {
    if (orderSuccess) {
      const digits = (customerPhone || "").replace(/\D/g, "");
      if (digits) {
        markLeadConverted(digits, normalizedSlug || productSlug);
        try {
          fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customer_phone: digits,
              product_slug: normalizedSlug || productSlug,
              action: "convert",
            }),
          }).catch(() => { });
        } catch { }
      }

      const finalOrderNum =
        orderNumber || "ISV-" + Math.floor(100000 + Math.random() * 900000);
      const whatsappMsg = encodeURIComponent(
        `Bonjour Isivente, je viens de valider ma commande sur le site !\n\n` +
        `📦 *Produit :* ${productTitle}\n` +
        `🔢 *Formule :* ${currentBundle.name}\n` +
        `💰 *Total à régler :* ${fmt(totalPrice)} FCFA (Paiement à la livraison)\n` +
        `🔖 *N° Commande :* ${finalOrderNum}\n` +
        `👤 *Nom :* ${customerName}\n` +
        `📍 *Ville & Quartier :* ${city} - ${address}\n\n` +
        `Merci de confirmer l'expédition de mon colis.`
      );
      const timer = setTimeout(() => {
        window.location.href = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [orderSuccess, orderNumber, productTitle, currentBundle, totalPrice, customerName, city, address, whatsappNumber]);

  // ════════════════ VUE SUCCÈS : CONFIRMATION & WHATSAPP DIRECT ════════════════
  if (orderSuccess) {
    const finalOrderNum =
      orderNumber || "ISV-" + Math.floor(100000 + Math.random() * 900000);

    const whatsappMsg = encodeURIComponent(
      `Bonjour Isivente, je viens de valider ma commande sur le site !\n\n` +
      `📦 *Produit :* ${productTitle}\n` +
      `🔢 *Formule :* ${currentBundle.name}\n` +
      `💰 *Total à régler :* ${fmt(totalPrice)} FCFA (Paiement à la livraison)\n` +
      `🔖 *N° Commande :* ${finalOrderNum}\n` +
      `👤 *Nom :* ${customerName}\n` +
      `📍 *Ville & Quartier :* ${city} - ${address}\n\n` +
      `Merci de confirmer l'expédition de mon colis.`
    );

    return (
      <section
        id="commander"
        className="py-12 px-4 max-w-[560px] mx-auto w-full scroll-mt-20"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] text-center space-y-6">
          {/* Badge Succès */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 inline-block mb-2">
              Commande N° {finalOrderNum}
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
              Merci {customerName || "!"}
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
              Votre commande pour <strong>{productTitle}</strong> est bien enregistrée. Redirection vers WhatsApp en cours...
            </p>
          </div>

          {/* Récapitulatif épuré */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>Formule choisie :</span>
              <strong className="text-slate-900 font-medium">{currentBundle.name}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Livraison à :</span>
              <strong className="text-slate-900 font-medium">
                {city} {address ? `(${address})` : ""}
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Numéro de contact :</span>
              <strong className="text-slate-900 font-mono font-medium">{customerPhone}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200/70 flex justify-between items-center text-base font-bold text-slate-900">
              <span>Total à régler :</span>
              <span className="font-mono tabular-nums text-lg text-emerald-700">
                {fmt(totalPrice)} FCFA
              </span>
            </div>
          </div>

          {/* Bouton WhatsApp direct */}
          <div className="space-y-3 pt-1">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm tracking-wide"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Ouvrir WhatsApp pour confirmer</span>
            </a>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
              <a href="/track" className="hover:text-slate-800 transition-colors flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Suivre mon colis
              </a>
              {onResetOrder && (
                <button
                  type="button"
                  onClick={onResetOrder}
                  className="hover:text-slate-800 underline transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Nouvelle commande
                </button>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Paiement à la réception après vérification</span>
          </div>
        </div>
      </section>
    );
  }

  // ════════════════ FORMULAIRE ÉPURÉ, SIMPLE & DIRECT ════════════════
  return (
    <section
      id="commander"
      className="py-10 px-4 max-w-[580px] mx-auto w-full scroll-mt-20 sm:scroll-mt-24"
    >
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.06)]">

        {/* Titre sobre */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <Truck className="w-3.5 h-3.5 text-slate-600" />
            Livraison Rapide • Paiement à la réception
          </div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            Commander maintenant
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Remplissez vos informations ci-dessous pour être livré à domicile.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            markCurrentSessionClicked(normalizedSlug || productSlug);
            onSubmit(e);
          }}
          className="space-y-5"
        >

          {/* 1. RÉCAPITULATIF DU PRODUIT UNIQUE ADAPTÉ AUX COULEURS DU PRODUIT */}
          <div
            className="p-4 rounded-2xl flex items-center justify-between gap-3 transition-all border shadow-xs"
            style={{
              backgroundColor: theme.primaryLight,
              borderColor: theme.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white"
                style={{
                  backgroundColor: theme.primary,
                }}
              >
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <div
                  className="font-bold text-xs sm:text-sm tracking-tight"
                  style={{ color: theme.textPrimary }}
                >
                  {productTitle}
                </div>
                <div className="text-[11px] font-medium opacity-80" style={{ color: theme.textPrimary }}>
                  1 Exemplaire Neuf Complet
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div
                className="font-mono font-extrabold text-sm sm:text-base tabular-nums"
                style={{ color: theme.primary }}
              >
                {fmt(totalPrice)} FCFA
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 border"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                  borderColor: theme.border,
                }}
              >
                En stock
              </span>
            </div>
          </div>

          {/* 2. LES 3 CHAMPS ESSENTIELS */}
          <div className="space-y-3.5 pt-1">

            {/* Champ 1 : Nom et Prénom */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Nom & Prénom <span className="text-rose-500">*</span></span>
              </label>
              <input
                id="customer-name-input"
                type="text"
                required
                value={customerName}
                onFocus={handleInteractionTrigger}
                onBlur={captureGhostLead}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Paul Dossou"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
              />
            </div>

            {/* Champ 2 : Téléphone WhatsApp */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Numéro WhatsApp <span className="text-rose-500">*</span></span>
                </label>
                {isPhoneValid && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <Check className="w-3 h-3 stroke-[3]" /> Valide
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                  🇧🇯 +229
                </div>
                <input
                  id="customer-phone-input"
                  type="tel"
                  required
                  value={customerPhone}
                  onFocus={handleInteractionTrigger}
                  onBlur={captureGhostLead}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01 97 00 00 00 ou 97 00 00 00"
                  className="w-full pl-16 pr-3.5 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-mono font-semibold"
                />
              </div>
            </div>

            {/* Champ 3 : Ville & Quartier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ville <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {deliveryDelay}
                  </span>
                </div>
                <select
                  value={city}
                  required
                  onFocus={handleInteractionTrigger}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                >
                  <option value="">Choisir votre ville...</option>
                  {BENIN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} {c.express ? "⚡ (Express 24h)" : `(${c.delay})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-700 block">
                  Quartier / Repère <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onFocus={handleInteractionTrigger}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAddress(val);
                    const detected = detectBeninCity(city, val, customerName);
                    if (detected.wasOverridden && detected.detectedCity && detected.detectedCity !== city) {
                      setCity(detected.detectedCity);
                    }
                  }}
                  placeholder="Ex: Haie Vive, face pharmacie"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                />
              </div>
            </div>

            {/* Note d'expédition pour Parakou ou villes hors Cotonou/Calavi */}
            {selectedCityObj && !selectedCityObj.express && city && city !== "Autre ville" && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2 animate-in fade-in">
                <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Livraison pour {city} :</p>
                  <p className="text-amber-800/90 leading-tight">Colis expédié sous {selectedCityObj.delay} par compagnie de transport. Règlement à la réception.</p>
                </div>
              </div>
            )}

            {/* Si Autre ville sélectionnée */}
            {city === "Autre ville" && (
              <div className="space-y-1 text-left animate-fade-in">
                <label className="text-xs font-bold text-slate-700">
                  Précisez votre commune / localité <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lokossa, Abomey, Natitingou..."
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                />
              </div>
            )}

            {/* OPTION DE LIVRAISON OU RÉSERVATION */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Délai de livraison souhaité :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType("immediate")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${orderType === "immediate"
                      ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span>⚡ Dès que possible</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("reservation")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${orderType === "reservation"
                      ? "border-amber-500 bg-amber-50/70 text-amber-950 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                  <span>Réserver pour plus tard</span>
                </button>
              </div>

              {orderType === "reservation" && (
                <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <label className="text-[11px] font-bold text-amber-800 block mb-1">
                    À quelle date ou période souhaitez-vous recevoir votre colis ?
                  </label>
                  <input
                    type="text"
                    value={currentReservationDate}
                    onChange={(e) => handleReservationChange(e.target.value)}
                    placeholder="Ex: Samedi prochain, Fin du mois (28), le 5 octobre..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-xs bg-amber-50/40 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    💡 Votre colis est mis de côté gratuitement. Notre équipe vous contactera la veille pour confirmer.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. RÉCAPITULATIF DU TOTAL & BOUTON COMMANDE */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Total à payer à la livraison :</span>
              <span
                className="text-xl font-bold font-mono tabular-nums"
                style={{ color: theme.primary }}
              >
                {fmt(totalPrice)} FCFA
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-150 disabled:opacity-75 cursor-pointer"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 8px 25px -6px ${theme.primary}66`,
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Validation en cours...
                </span>
              ) : (
                <>
                  <span>
                    {orderType === "reservation"
                      ? `Confirmer ma réservation (${fmt(totalPrice)} F)`
                      : `Confirmer ma commande (${fmt(totalPrice)} F)`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Paiement en espèces ou Mobile Money à la réception du colis</span>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
