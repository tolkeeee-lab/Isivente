"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  BatteryCharging, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Wind,
  Zap,
  RefreshCw,
  Video
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
    name: "Purificateur d'Air & Anti-Odeurs Frigo EraClean™ Officiel",
    subtitle: "Module complet d'électrolyse à froid et d'ozone actif, câble de recharge USB-C, crochet de suspension et notice",
    price: 19900,
    originalPrice: 35000,
    savings: 15100,
    quantity: 1,
    popular: true,
  },
];

const REVIEWS_DATA = [
  {
    author: "Fatoumata D.",
    city: "Cotonou (Haie Vive)",
    rating: 5,
    title: "Mon frigo ne sent plus le poisson fumé",
    comment: "La différence après 24 heures était flagrante. Même avec du poisson et du fromage, l'air intérieur reste neutre et frais. Je recommande vivement !",
  },
  {
    author: "Roseline A.",
    city: "Calavi",
    rating: 5,
    title: "Mes légumes restent frais 2 fois plus longtemps",
    comment: "J'avais des doutes au départ, mais les tomates et les feuilles vertes ne pourrissent plus rapidement. Plus aucun gaspillage alimentaire, c'est très vite rentabilisé.",
  },
  {
    author: "Mariette K.",
    city: "Porto-Novo",
    rating: 5,
    title: "Zéro odeur et très facile à utiliser",
    comment: "Je l'ai chargé une fois et ça fait déjà 3 semaines qu'il fonctionne dans mon frigo. Compact, discret et efficace. Livraison rapide et paiement à la réception.",
  },
];

const FAQS_DATA = [
  {
    q: "Quelle est la durée de vie réelle de l'appareil ?",
    a: "L'appareil est conçu pour fonctionner plus de 10 ans sans aucune perte d'efficacité. Son module de décharge à froid est inusable et ne nécessite aucun filtre, pastille ni cartouche de rechange."
  },
  {
    q: "Est-ce sans danger pour les aliments ?",
    a: "Totalement inoffensif. La micro-émission d'oxygène actif et d'ozone est strictement calibrée selon les normes de sécurité alimentaire internationales. Elle détruit les bactéries puis se retransforme naturellement en oxygène pur sans laisser le moindre résidu chimique."
  },
  {
    q: "Comment se recharge-t-il et quelle est l'autonomie ?",
    a: "Il se recharge via un câble USB-C universel (fourni). Une charge rapide de 2 heures assure jusqu'à 30 jours de fonctionnement automatique continu en mode préservation."
  },
  {
    q: "Peut-on l'utiliser dans la voiture, les WC ou une armoire ?",
    a: "Absolument ! L'EraClean purifie n'importe quel espace confiné jusqu'à 10m³ : réfrigérateur, dressing à chaussures, placard, toilettes ou habitacle de voiture."
  },
  {
    q: "Comment se déroule la livraison au Bénin ?",
    a: "Livraison express en 24h à Cotonou, Calavi, Porto-Novo et environs. Vous inspectez l'appareil avant de payer le livreur en espèces ou par Mobile Money."
  }
];

export default function EraCleanLanding({ slug = "eraclean" }: { slug?: string }) {
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
  const videoRef = useRef<HTMLVideoElement>(null);

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
        product_slug: "eraclean",
        product_title: "Purificateur d'Air & Anti-Odeurs EraClean™",
        bundle_id: selectedBundle.id || "solo",
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity || 1,
        total_amount: selectedBundle.price,
        status: "pending",
        ...utm,
      });

      await markLeadConverted(customerPhone, "eraclean");

      const successUrl = `/p/eraclean/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
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
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold tracking-tight text-slate-950 text-sm sm:text-base">ISIVENTE</span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• Boutique Officielle</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-1.5 rounded-full shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <span>Commander (19 900 F)</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* ── TITRE HERO & PRIX D'ACCROCHE ── */}
        <section className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/80 text-blue-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 stroke-[1.75]" />
            <span>Technologie d&apos;Électrolyse à Froid & Oxygène Actif</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl font-black tracking-[-0.02em] text-slate-950 leading-tight">
            Purificateur d&apos;Air & Anti-Odeurs Frigo EraClean™
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Détruit 99.8% des odeurs tenaces (poisson, viandes, condiments) et prolonge la fraîcheur de vos aliments pendant plus de 10 ans sans aucun filtre à racheter.
          </p>
        </section>

        {/* ── SECTION DÉMONSTRATION VIDÉO DIRECTE HERO ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5 space-y-3">
          <div className="relative aspect-[9/16] sm:aspect-[16/10] max-w-md sm:max-w-none mx-auto rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200">
            <video
              ref={videoRef}
              src="/videos/eraclean-demo.mp4"
              autoPlay
              muted
              playsInline
              loop
              controls
              preload="auto"
              className="w-full h-full object-cover"
            />

            {/* Badge Prix Direct */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-md z-10">
              <span className="text-blue-600 font-black">19 900 FCFA</span>
              <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">35 000 F</span>
            </div>
          </div>
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
            <div className="text-[10px] text-slate-500 font-mono">Paiement à la livraison</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <BatteryCharging className="w-5 h-5 text-blue-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Autonomie 30j</div>
            <div className="text-[10px] text-slate-500 font-mono">Batterie USB-C</div>
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
            productSlug="eraclean"
            productTitle="Purificateur d'Air & Anti-Odeurs EraClean™"
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
            accentColor="#2563eb"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── SECTION DÉTAIL DES BÉNÉFICES ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Wind className="w-3.5 h-3.5 text-blue-600 stroke-[1.75]" />
              <span>Pourquoi Choisir EraClean™ ?</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              3 Avantages Majeurs Pour Votre Foyer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Élimination des Odeurs en 24h</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Neutralise activement les composés soufrés et azotés émis par la viande, les poissons et les sauces.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Conservation Prolongée</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ralentit le mûrissement excessif des fruits et légumes en dégradant le gaz éthylène naturellement libéré.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Zéro Filtre à Racheter</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Système sans consommables. Une simple recharge USB-C par mois assure un fonctionnement sur plus de 10 ans.
              </p>
            </div>
          </div>
        </section>

        {/* ── AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Avis Clients Vérifiés (Bénin)</div>
              <div className="text-[11px] text-slate-500 font-mono">4.9 / 5 sur 142 commandes livrées</div>
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
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180 text-blue-600" : ""}`} />
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
        price={19900}
        accentColor="#2563eb"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Purificateur d'Air & Anti-Odeurs EraClean à 19 900 FCFA avec livraison à domicile."
      />
    </div>
  );
}
