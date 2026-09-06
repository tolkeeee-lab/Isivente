"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Zap,
  Check,
  CheckCircle2,
  Gift,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Truck,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { OfferItem, getProductUpsellConfig } from "@/lib/upsellConfig";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";
import { playOrderSound } from "@/lib/soundEffects";

export interface BundleOption {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  original_price?: number | null;
  badge?: string | null;
  popular?: boolean;
  quantity?: number;
}

interface QuickOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productSlug: string;
  productTitle: string;
  productImage?: string;
  bundles?: BundleOption[];
  accentColor?: string;
  whatsappNumber?: string;
  initialBundle?: BundleOption;
}

const BENIN_CITIES = [
  { name: "Cotonou", delay: "Livraison aujourd'hui", isExpress: true },
  { name: "Abomey-Calavi", delay: "Livraison aujourd'hui", isExpress: true },
  { name: "Porto-Novo", delay: "Livraison sous 24h", isExpress: true },
  { name: "Ouidah", delay: "Livraison sous 24h", isExpress: false },
  { name: "Parakou", delay: "Livraison sous 24h à 48h", isExpress: false },
  { name: "Bohicon / Abomey", delay: "Livraison sous 24h à 48h", isExpress: false },
  { name: "Autre ville", delay: "Livraison 24h à 48h", isExpress: false },
];

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

export default function QuickOrderDrawer({
  isOpen,
  onClose,
  productSlug,
  productTitle,
  productImage,
  bundles = [],
  accentColor = "#FF5C93",
  whatsappNumber = "2290192901817",
  initialBundle,
}: QuickOrderDrawerProps) {
  const [selectedBundle, setSelectedBundle] = useState<BundleOption | null>(
    initialBundle || bundles[0] || null
  );
  const [isSecondUnitActive, setIsSecondUnitActive] = useState(false);
  const [includeBump, setIncludeBump] = useState(false);

  // Informations Client
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");

  // Statuts de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Configuration dynamique d'upsell
  const upsellConfig = getProductUpsellConfig(
    productSlug,
    productTitle,
    selectedBundle?.price || 14900
  );
  const resolvedSecondUnit = upsellConfig.secondUnit;
  const resolvedBump = upsellConfig.bump;

  // Calcul du prix de base et des options
  const basePrice = selectedBundle ? selectedBundle.price : 14900;
  const secondUnitPrice =
    isSecondUnitActive && resolvedSecondUnit ? resolvedSecondUnit.price : 0;
  const bumpPrice = includeBump && resolvedBump ? resolvedBump.price : 0;
  const totalPrice = basePrice + secondUnitPrice + bumpPrice;

  // Délais de livraison
  const selectedCityObj = BENIN_CITIES.find(
    (c) => c.name.toLowerCase() === (city || "").trim().toLowerCase()
  );
  const deliveryDelay = selectedCityObj ? selectedCityObj.delay : "24h – 48h";

  // Validation téléphone WhatsApp
  const cleanPhone = (customerPhone || "").replace(/\D/g, "");
  const isPhoneValid = cleanPhone.length >= 8;

  // Synchronisation lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialBundle) setSelectedBundle(initialBundle);
      else if (bundles.length > 0 && !selectedBundle) setSelectedBundle(bundles[0]);

      // Focus sur le champ nom après l'animation
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 300);

      // Meta Pixel InitiateCheckout
      trackInitiateCheckout({
        content_name: productTitle,
        content_ids: [productSlug],
        value: totalPrice,
        currency: "XOF",
      });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fermeture par la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Soumission de la commande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMsg("Veuillez saisir un numéro de téléphone valide.");
      return;
    }
    if (!customerName.trim() || !address.trim()) {
      setErrorMsg("Veuillez remplir votre nom et quartier de livraison.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const itemsPurchased: string[] = [
        selectedBundle ? selectedBundle.name : productTitle,
      ];
      if (isSecondUnitActive && resolvedSecondUnit) {
        itemsPurchased.push(`2ème pièce (${resolvedSecondUnit.title})`);
      }
      if (includeBump && resolvedBump) {
        itemsPurchased.push(resolvedBump.title);
      }

      const finalBundleName = itemsPurchased.join(" + ");
      const totalQuantity =
        (selectedBundle?.quantity || 1) + (isSecondUnitActive ? 1 : 0);

      const res = await saveNewOrder({
        product_slug: productSlug,
        product_title: productTitle,
        bundle_id: selectedBundle?.id || "solo",
        bundle_name: finalBundleName,
        quantity: totalQuantity,
        total_amount: totalPrice,
        customer_name: customerName,
        customer_phone:
          customerPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        shipping_city: city,
        city: city,
        shipping_address: address,
        address: address,
        status: "pending",
      });

      const finalNum =
        res?.order_number || "CMD-" + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(finalNum);

      // Meta Pixel Purchase Event
      trackPurchase({
        content_name: productTitle,
        content_ids: [productSlug],
        value: totalPrice,
        currency: "XOF",
        num_items: totalQuantity,
      });

      playOrderSound();
      setOrderSuccess(true);
    } catch (err: any) {
      console.error("Erreur commande express:", err);
      setErrorMsg("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setOrderSuccess(false);
    setOrderNumber("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* 🌑 ARRIÈRE-PLAN AVEC FLOU PROGRESSIF */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity animate-fade-in cursor-pointer"
      />

      {/* 📦 TIROIR COULISSANT (BOTTOM-SHEET SUR MOBILE / MODAL BISEAUTÉE SUR DESKTOP) */}
      <div
        className="relative w-full sm:max-w-[560px] max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden z-10 border border-slate-200/80 animate-in slide-in-from-bottom duration-300 ease-out"
        style={{
          boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.9), 0 25px 50px -12px rgba(0, 0, 0, 0.45)`,
        }}
      >
        {/* POIGNÉE DE GLISSEMENT TACTILE (MOBILE DRAG HANDLE) */}
        <div className="sm:hidden w-full pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* ─── EN-TÊTE DU TIROIR ─── */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              <Zap className="w-4 h-4 fill-white" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 truncate">
                Commande Express 1-Clic
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Paiement à la livraison après inspection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── CORPS DU TIROIR (SCROLLABLE) ─── */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {orderSuccess ? (
            /* ════════════════ VUE SUCCÈS COMMANDE ════════════════ */
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="relative w-16 h-16 mx-auto">
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-25"
                  style={{ backgroundColor: accentColor }}
                />
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg mx-auto"
                  style={{ backgroundColor: accentColor }}
                >
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Commande Enregistrée !
                </span>
                <h4 className="font-display font-extrabold text-xl text-slate-900 mt-2">
                  Merci pour votre confiance, {customerName} !
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  N° de commande : <strong className="font-mono">{orderNumber}</strong>
                </p>
              </div>

              {/* Récapitulatif Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Produit :</span>
                  <strong className="text-slate-900 text-right">{productTitle}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Livraison :</span>
                  <strong className="text-slate-900">{city} ({deliveryDelay})</strong>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2 font-bold">
                  <span>Total à payer au livreur :</span>
                  <span className="font-mono text-sm text-slate-900" style={{ color: accentColor }}>
                    {fmt(totalPrice)} FCFA
                  </span>
                </div>
              </div>

              {/* Bouton WhatsApp direct */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Bonjour Isivente, je confirme ma commande n° *${orderNumber}* pour *${productTitle}*.\n` +
                  `💰 Total : *${fmt(totalPrice)} FCFA*\n` +
                  `📍 Adresse : *${city} - ${address}*\n` +
                  `👤 Nom : *${customerName}*`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Confirmer sur WhatsApp avec le livreur</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
              >
                Retourner à la boutique
              </button>
            </div>
          ) : (
            /* ════════════════ FORMULAIRE DE COMMANDE ════════════════ */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* 1. SÉLECTION DU PACK SI PLUSIEURS DISPONIBLES */}
              {bundles.length > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    1. Choisissez votre formule :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bundles.map((b, idx) => {
                      const isSel = selectedBundle?.id ? selectedBundle.id === b.id : selectedBundle?.name === b.name;
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedBundle(b)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between text-left select-none ${
                            isSel
                              ? "bg-slate-50 border-slate-900 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                          style={{
                            borderColor: isSel ? accentColor : undefined,
                            backgroundColor: isSel ? `${accentColor}0D` : undefined,
                          }}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs font-extrabold text-slate-900 truncate">
                              {b.name}
                            </div>
                            {b.badge && (
                              <span
                                className="text-[9px] font-black uppercase text-white px-1.5 py-0.2 rounded"
                                style={{ backgroundColor: accentColor }}
                              >
                                {b.badge}
                              </span>
                            )}
                          </div>
                          <div
                            className="font-mono font-black text-xs sm:text-sm tabular-nums shrink-0"
                            style={{ color: accentColor }}
                          >
                            {fmt(b.price)} F
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. OFFRE 2ÈME PIÈCE EN 1 CLIC (SI DISPONIBLE) */}
              {resolvedSecondUnit && (
                <div
                  onClick={() => setIsSecondUnitActive(!isSecondUnitActive)}
                  className="p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none text-left relative overflow-hidden"
                  style={{
                    borderColor: isSecondUnitActive ? accentColor : "#CBD5E1",
                    backgroundColor: isSecondUnitActive ? `${accentColor}0D` : "#F8FAFC",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-all border-2"
                        style={{
                          backgroundColor: isSecondUnitActive ? accentColor : "#FFFFFF",
                          borderColor: isSecondUnitActive ? accentColor : "#94A3B8",
                          color: "#FFFFFF",
                        }}
                      >
                        {isSecondUnitActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="text-[9px] font-extrabold uppercase text-white px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Gift className="w-2.5 h-2.5" />
                          {resolvedSecondUnit.badge || "OFFRE 2ÈME UNITÉ"}
                        </span>
                        {resolvedSecondUnit.savings && (
                          <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            Éco. {fmt(resolvedSecondUnit.savings)} F
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-slate-900 mt-1 leading-snug">
                        {resolvedSecondUnit.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                        <span className="font-black" style={{ color: accentColor }}>
                          +{fmt(resolvedSecondUnit.price)} FCFA
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          (Dans le même colis)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. COORDONNÉES CLIENT */}
              <div className="space-y-3 pt-1">
                <label className="text-xs font-bold text-slate-800 block">
                  2. Vos informations de livraison :
                </label>

                <div className="space-y-2.5">
                  {/* Nom & Prénom */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nom & Prénom <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Paul Dossou"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all"
                    />
                  </div>

                  {/* Téléphone WhatsApp */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        Téléphone WhatsApp <span className="text-rose-500">*</span>
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
                        className="w-full p-2.5 pl-16 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 transition-all font-mono font-bold"
                        style={{
                          borderColor: isPhoneValid ? "#10B981" : undefined,
                        }}
                      />
                    </div>
                  </div>

                  {/* Ville de livraison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          Ville <span className="text-rose-500">*</span>
                        </label>
                      </div>
                      <select
                        value={city}
                        required
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 font-semibold"
                      >
                        {BENIN_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} {c.isExpress ? "⚡ (24h)" : `(${c.delay})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quartier & Repère */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Quartier / Repère <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: Haie Vive, Pharmacie..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. ORDER BUMP OPTIONNEL */}
              {resolvedBump && (
                <div
                  onClick={() => setIncludeBump(!includeBump)}
                  className="p-3 rounded-xl border transition-all cursor-pointer select-none text-left"
                  style={{
                    borderColor: includeBump ? accentColor : "#E2E8F0",
                    backgroundColor: includeBump ? `${accentColor}0D` : "#F8FAFC",
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeBump}
                      onChange={(e) => {
                        e.stopPropagation();
                        setIncludeBump(e.target.checked);
                      }}
                      className="mt-0.5 w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] font-extrabold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                          OFFRE COMPLÉMENTAIRE
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 mt-0.5">
                        {resolvedBump.title}
                      </div>
                      <div className="font-mono text-xs font-bold mt-0.5" style={{ color: accentColor }}>
                        +{fmt(resolvedBump.price)} FCFA
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── BOUTON DE VALIDATION COD ─── */}
              <div className="pt-2 sticky bottom-0 bg-white pb-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-between shadow-xl transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 12px 24px -6px ${accentColor}66`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-white animate-bounce" />
                    <span>{isSubmitting ? "Enregistrement..." : "VALIDER MA COMMANDE"}</span>
                  </div>
                  <div className="font-mono font-black tabular-nums bg-black/15 px-3 py-1 rounded-xl text-xs sm:text-sm">
                    {fmt(totalPrice)} FCFA
                  </div>
                </button>
                <div className="flex items-center justify-center gap-4 text-[10.5px] text-slate-500 font-semibold mt-2">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-600" /> Livraison 24h
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Paiement à la réception
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
