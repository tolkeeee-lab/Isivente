"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  ChevronDown, 
  BatteryCharging, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Wind,
  Zap,
  Smartphone,
  Gauge
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Ventilateur Ceinture & Powerbank TurboFan™ Max (8000 mAh)",
    subtitle: "Pack complet avec double clip ceinture renforcé, lanière tour de cou, câble de charge rapide USB-C et garantie 1 an",
    price: 16900,
    originalPrice: 25000,
    savings: 8100,
    quantity: 1,
    popular: true,
  },
];

const REVIEWS_DATA = [
  {
    author: "Koffi M.",
    city: "Cotonou (Dantokpa)",
    rating: 5,
    title: "Le meilleur allié contre la chaleur au marché",
    comment: "Je l'accroche à ma ceinture sous ma chemise toute la journée. La fraîcheur est immédiate et la batterie tient facilement 2 jours d'affilée.",
  },
  {
    author: "Alain S.",
    city: "Calavi",
    rating: 5,
    title: "Il recharge aussi mon téléphone !",
    comment: "Non seulement il souffle fort mais quand mon téléphone est à plat en déplacement, je le branche directement dessus. Indispensable.",
  },
  {
    author: "Carine V.",
    city: "Porto-Novo",
    rating: 5,
    title: "Très solide et puissant",
    comment: "Coque renforcée résistante aux chocs. Même à la vitesse 1, le flux d'air est très agréable et rafraîchissant. Excellent achat.",
  },
];

const FAQS_DATA = [
  {
    q: "Quelle est l'autonomie de la batterie 8000 mAh ?",
    a: "Jusqu'à 24 heures d'utilisation continue en vitesse 1, et environ 8 à 12 heures en puissance maximale. Vous pouvez également l'utiliser comme batterie externe pour recharger complètement votre smartphone."
  },
  {
    q: "Comment se porte le ventilateur ?",
    a: "Il possède un double clip en acier ultra-résistant : un clip intérieur pour le pantalon/ceinture et un clip extérieur pour le t-shirt/chemise afin d'envoyer l'air frais directement sur le torse et le dos. Une lanière tour de cou réglable est aussi incluse."
  },
  {
    q: "Fait-il beaucoup de bruit ?",
    a: "Non, le moteur brushless haute précision est conçu pour délivrer un débit d'air puissant tout en restant très discret (moins de 35 dB en vitesse normale)."
  },
  {
    q: "Comment se déroule la livraison et le règlement ?",
    a: "Livraison en 24h partout à Cotonou, Calavi, Porto-Novo et environs. Vous payez en espèces ou Mobile Money uniquement après avoir vérifié le produit à la livraison."
  }
];

export default function TurboFanLanding({ slug = "turbofan" }: { slug?: string }) {
  const router = useRouter();
  const utm = useUTM();
  const { recordInteraction } = usePagePresence(slug);

  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const orderSectionRef = useRef<HTMLDivElement>(null);

  const scrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");

    if (!customerName.trim()) {
      setOrderError("Veuillez renseigner votre nom complet.");
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 8) {
      setOrderError("Veuillez renseigner un numéro de téléphone valide (au moins 8 chiffres).");
      return;
    }

    setIsSubmitting(true);
    recordInteraction();

    try {
      const order = await saveNewOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: address.trim() || `${city} - Livraison à domicile`,
        shipping_city: city,
        product_slug: "turbofan",
        product_title: "Ventilateur Ceinture & Powerbank TurboFan™ Max",
        bundle_id: selectedBundle.id || "solo",
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity || 1,
        total_amount: selectedBundle.price,
        status: "pending",
        ...utm,
      });

      await markLeadConverted(customerPhone, "turbofan");

      const successUrl = `/p/turbofan/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-28">
      {/* ── HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-bold tracking-tight text-slate-950 text-sm sm:text-base">ISIVENTE</span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• Boutique Officielle</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-1.5 rounded-full shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <span>Commander (16 900 F)</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* ── TITRE HERO & PRIX D'ACCROCHE ── */}
        <section className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 stroke-[1.75]" />
            <span>Fraîcheur Instantanée & Batterie Powerbank 8000 mAh</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl font-black tracking-[-0.02em] text-slate-950 leading-tight">
            Ventilateur Ceinture & Powerbank TurboFan™ Max
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Fixez-le à votre ceinture ou portez-le autour du cou : un souffle d&apos;air frais continu sous vos vêtements même en pleine chaleur, et rechargez votre téléphone en déplacement.
          </p>
        </section>

        {/* ── 3 BADGES DE RÉASSURANCE PRIORITAIRES ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
            <div className="text-[10px] text-slate-500 font-mono">Bénin à domicile</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Test à Réception</div>
            <div className="text-[10px] text-slate-500 font-mono">Paiement après vérification</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <BatteryCharging className="w-5 h-5 text-cyan-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">8000 mAh</div>
            <div className="text-[10px] text-slate-500 font-mono">Jusqu&apos;à 24h de souffle</div>
          </div>
        </div>

        {/* ── FORMULAIRE DE COMMANDE COD PLACÉ PRIORITAIREMENT ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="turbofan"
            productTitle="Ventilateur Ceinture & Powerbank TurboFan™ Max"
            productImage="/images/microscope-real-infographic.webp"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => setSelectedBundle(b)}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerPhone2={customerPhone2}
            setCustomerPhone2={setCustomerPhone2}
            city={city}
            setCity={setCity}
            address={address}
            setAddress={setAddress}
            accentColor="#0891b2"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── SECTION DÉTAIL DES BÉNÉFICES ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Wind className="w-3.5 h-3.5 text-cyan-600 stroke-[1.75]" />
              <span>Points Forts & Caractéristiques</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              Conçu Pour Résister Aux Chaleurs Extrêmes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Moteur Turbo 3 Vitesses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Turbine haute vitesse jusqu&apos;à 13 000 tr/min délivrant un débit d&apos;air frais direct et constant.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Powerbank de Secours</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sortie USB standard permettant de recharger complètement votre smartphone lors de vos sorties.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Double Clip Anti-Choc</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Se fixe fermement à la ceinture ou se porte au cou. Coque robuste renforcée en silicone anti-chute.
              </p>
            </div>
          </div>
        </section>

        {/* ── AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Avis Clients Vérifiés (Bénin)</div>
              <div className="text-[11px] text-slate-500 font-mono">4.9 / 5 sur 116 commandes livrées</div>
            </div>
            <div className="flex text-amber-400 text-sm">★★★★★</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{rev.author}</span>
                    <span className="text-[10px] text-slate-400">{rev.city}</span>
                  </div>
                  <div className="text-amber-400 text-xs">{"★".repeat(rev.rating)}</div>
                  <p className="text-xs font-semibold text-slate-900">« {rev.title} »</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium pt-2 border-t border-slate-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Commande vérifiée Isivente</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOIRE AUX QUESTIONS ── */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3">
          <div className="text-xs font-bold text-slate-900">Questions fréquentes</div>
          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-cyan-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180 text-cyan-600" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed pt-1">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── BARRE MOBILE FLOTTANTE POUR COMMANDER ── */}
      <StickyMobileCtaBar
        price={16900}
        accentColor="#0891b2"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Ventilateur Ceinture & Powerbank TurboFan Max à 16 900 FCFA avec livraison à domicile."
      />
    </div>
  );
}
