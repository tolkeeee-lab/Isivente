"use client";

import React from "react";
import { ArrowRight, Check, MessageCircle, ShieldCheck } from "lucide-react";
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
}

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
  accentColor = "#FF5C93",
  whatsappNumber = "2290192901817",
}: UmeiStyleOrderSectionProps) {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  const bumpPrice = includeBump && bumpOffer ? bumpOffer.price : 0;
  const totalPrice = (selectedBundle?.price || 0) + bumpPrice;

  const scrollToCommander = () => {
    const el = document.getElementById("commander");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* 📝 FORMULAIRE DE COMMANDE DIRECT — MODÈLE EXACT UMÉI */}
      <section id="commander" className="py-10 px-3 sm:px-6 md:px-8 max-w-[860px] mx-auto w-full overflow-hidden">
        <div className="bg-gradient-to-b from-white to-[#F5F0FC] rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(139,111,224,0.35)] border-2 border-[#B9A6F0]">
          
          {/* EN-TÊTE EXACT UMÉI */}
          <div className="text-center mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-[#FF5C93] to-[#8B6FE0] text-white text-[10.5px] sm:text-[11.5px] font-extrabold uppercase tracking-wider py-1 px-3 sm:px-4 rounded-full inline-block mb-2.5 shadow-xs">
              ⚡ Paiement à la livraison
            </span>
            <h2 className="font-display font-bold text-xl sm:text-3xl text-[#241B36] mb-1.5">
              Passe ta commande en 30 secondes
            </h2>
            <p className="text-[#6B5F87] text-xs sm:text-sm font-medium max-w-md mx-auto">
              Remplis simplement tes coordonnées. Tu règleras directement en espèces au livreur après réception de ton colis.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
            
            {/* 1. CHOIX DU PACK */}
            {bundles && bundles.length > 0 && (
              <div>
                <label className="font-bold text-xs sm:text-sm text-[#241B36] block mb-2.5 text-left">
                  1. Choisis ton pack :
                </label>
                
                <div className={`grid grid-cols-1 ${bundles.length >= 3 ? "sm:grid-cols-3" : bundles.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-3`}>
                  {bundles.map((b, idx) => {
                    const isSelected = selectedBundle?.name === b.name || (b.id && selectedBundle?.id === b.id) || idx === 0;
                    const origPrice = b.originalPrice || b.original_price || Math.round(b.price * 1.4);

                    return (
                      <div
                        key={b.id || b.name || idx}
                        onClick={() => onSelectBundle(b)}
                        className={`border-2 rounded-2xl p-3.5 text-center cursor-pointer relative transition-all duration-150 ${
                          selectedBundle?.name === b.name
                            ? "border-[#FF5C93] bg-[#FF5C93]/5 shadow-[0_8px_20px_-8px_rgba(255,92,147,0.35)] scale-[1.01]"
                            : "border-[#E5DEFA] bg-white hover:border-[#B9A6F0]"
                        }`}
                      >
                        {b.badge && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5C93] text-white text-[9.5px] sm:text-[10px] font-extrabold py-0.5 px-2.5 rounded-full whitespace-nowrap shadow-xs">
                            {b.badge}
                          </span>
                        )}
                        <div className="font-display font-bold text-xs sm:text-[14px] text-[#241B36] mt-1">
                          {b.name}
                        </div>
                        <div className="font-display font-extrabold text-xl sm:text-2xl text-[#FF5C93] my-0.5 font-mono tabular-nums">
                          {fmt(b.price)} F
                        </div>
                        {origPrice && (
                          <div className="text-[11px] text-[#6B5F87] line-through font-medium font-mono tabular-nums">
                            {fmt(origPrice)} F
                          </div>
                        )}
                        {(b.description || b.subtitle) && (
                          <div className="text-[10.5px] text-[#6B5F87] mt-1 font-medium leading-tight">
                            {b.description || b.subtitle}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. COORDONNÉES CLIENT */}
            <div>
              <label className="font-bold text-xs sm:text-sm text-[#241B36] block mb-2.5 text-left">
                2. Tes informations de livraison :
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-[#241B36]">
                    Ton Nom & Prénom <span className="text-[#FF5C93]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Amina Gomez"
                    className="w-full p-3 rounded-xl border border-[#D8CBEF] text-xs sm:text-sm bg-white text-[#241B36] focus:border-[#FF5C93] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-[#241B36]">
                    Téléphone WhatsApp (Principal) <span className="text-[#FF5C93]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: 97 00 00 00"
                    className="w-full p-3 rounded-xl border border-[#D8CBEF] text-xs sm:text-sm bg-white text-[#241B36] focus:border-[#FF5C93] outline-none transition-colors font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-[#241B36]">
                    Deuxième Numéro (Au cas où)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone2}
                    onChange={(e) => setCustomerPhone2(e.target.value)}
                    placeholder="Ex: 95 00 00 00"
                    className="w-full p-3 rounded-xl border border-[#D8CBEF] text-xs sm:text-sm bg-white text-[#241B36] focus:border-[#FF5C93] outline-none transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-[#241B36]">
                    Ville de livraison <span className="text-[#FF5C93]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Cotonou, Calavi, Porto-Novo..."
                    className="w-full p-3 rounded-xl border border-[#D8CBEF] text-xs sm:text-sm bg-white text-[#241B36] focus:border-[#FF5C93] outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-bold text-[#241B36]">
                    Quartier & Repère précis <span className="text-[#FF5C93]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Haie Vive, 2ème ruelle après la pharmacie..."
                    className="w-full p-3 rounded-xl border border-[#D8CBEF] text-xs sm:text-sm bg-white text-[#241B36] focus:border-[#FF5C93] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* ORDER BUMP VIP (CASE À COCHER) */}
            {bumpOffer && (
              <div 
                onClick={() => setIncludeBump(!includeBump)}
                className={`p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer select-none text-left ${
                  includeBump
                    ? "bg-[#FFF2F6] border-[#FF5C93] shadow-sm ring-2 ring-[#FF5C93]/20"
                    : "bg-white border-dashed border-[#D8CBEF] hover:border-[#FF5C93]/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={includeBump}
                      onChange={(e) => setIncludeBump(e.target.checked)}
                      className="w-5 h-5 rounded-md text-[#FF5C93] focus:ring-[#FF5C93] border-[#D8CBEF] cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF5C93] text-white px-2 py-0.5 rounded-md shadow-2xs">
                        {bumpOffer.badge || "OFFRE EXCLUSIVE"}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-[#241B36]">
                        {bumpOffer.title}
                      </span>
                    </div>
                    {bumpOffer.subtitle && (
                      <p className="text-xs text-[#6B5F87] leading-snug">
                        {bumpOffer.subtitle}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                      {bumpOffer.originalPrice && (
                        <span className="line-through text-[#6B5F87] tabular-nums">
                          {fmt(bumpOffer.originalPrice)} FCFA
                        </span>
                      )}
                      <span className="font-bold text-[#FF5C93] tabular-nums text-sm">
                        +{fmt(bumpOffer.price)} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RÉCAPITULATIF EXACT UMÉI */}
            <div className="bg-[#EEE6FA] rounded-xl p-3.5 border border-[#8B6FE0]/25 space-y-1.5 text-left">
              <div className="flex justify-between text-xs text-[#6B5F87] font-medium">
                <span>Pack sélectionné :</span>
                <strong className="text-[#241B36] truncate max-w-[180px] sm:max-w-none">
                  {selectedBundle?.name || productTitle}
                  {includeBump && bumpOffer ? ` + ${bumpOffer.title}` : ""}
                </strong>
              </div>
              <div className="flex justify-between text-xs text-[#6B5F87] font-medium">
                <span>Livraison :</span>
                <strong className="text-[#2E855C]">24h–48h (Gratuite)</strong>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#241B36] pt-1.5 border-t border-[#8B6FE0]/20">
                <span>Total à régler au livreur :</span>
                <span className="text-[#FF5C93] font-mono tabular-nums text-base sm:text-lg font-black">
                  {fmt(totalPrice)} FCFA
                </span>
              </div>
            </div>

            {/* BOUTON VALIDATION */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[52px] bg-gradient-to-r from-[#FF5C93] to-[#E13D74] text-white p-3.5 rounded-xl font-display font-extrabold text-sm sm:text-base shadow-[0_12px_25px_-8px_rgba(255,92,147,0.6)] hover:-translate-y-0.5 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Validation de ta commande...</span>
              ) : (
                <>
                  <span>Je valide ma commande ({fmt(totalPrice)} FCFA)</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-[#6B5F87] font-medium">
              🔒 Données strictement confidentielles réservées à la livraison.
            </p>

          </form>

        </div>
      </section>

      {/* 📱 BARRE FIXE EN BAS SUR MOBILE (STICKY FOOTER EXACT UMÉI) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F5F0FC]/95 backdrop-blur-md border-t border-[#8B6FE0]/20 px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-[10px] text-[#6B5F87] font-bold">Total à régler :</div>
          <div className="font-display font-extrabold text-base text-[#FF5C93] leading-none font-mono tabular-nums">
            {fmt(totalPrice)} F
          </div>
        </div>
        <button
          type="button"
          onClick={scrollToCommander}
          className="bg-[#FF5C93] text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-md hover:bg-[#E13D74] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
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
