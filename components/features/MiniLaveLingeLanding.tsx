"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Droplets, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Waves, 
  Zap, 
  Heart,
  Baby,
  Timer
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Mini Lave-Linge Stérilisateur Lingerie & Vêtements Délicats",
    subtitle: "Appareil complet avec cuve transparente 4,5L, écran tactile digital, câble secteur et garantie",
    price: 17900,
    originalPrice: 30000,
    savings: 12100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/mini-lave-linge-hero.jpg", 
    alt: "Mini Lave-Linge Stérilisateur Lingerie & Vêtements Délicats - Cuve transparente et écran tactile",
    caption: "Mini Lave-Linge Stérilisateur : cuve transparente, vortex haute fréquence et écran tactile numérique"
  }
];

interface CustomerReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    name: "Amina K.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le soulagement pour mes sous-vêtements",
    comment: "Je détestais laver mes dessous à la main tous les soirs après le travail. Cette petite machine nettoie en douceur et l'eau tourbillonne vraiment bien. Très silencieuse et ne prend aucune place sur le lavabo.",
    verified: true,
  },
  {
    name: "Christelle T.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Parfait pour les habits de mon bébé",
    comment: "Je l'utilise exclusivement pour les bavoirs, bonnets et petits vêtements de mon nouveau-né afin de ne pas les mélanger au linge de toute la maison. Le lavage est rapide et la lumière bleue rassure énormément.",
    verified: true,
  },
  {
    name: "Béatrice D.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Livraison rapide et conforme",
    comment: "Commandé le matin, reçu l'après-midi par le livreur. J'ai pu ouvrir et brancher pour tester avant de payer le livreur en espèces. Très satisfaite du service Isivente.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Quels types de vêtements peut-on laver dans cette machine ?",
    a: "Elle est spécialement conçue pour la lingerie féminine (soutiens-gorge, culottes, lingeries fines), les sous-vêtements masculins, les chaussettes, les vêtements de bébé (bavoirs, bodies) et les serviettes délicates."
  },
  {
    q: "Comment fonctionne la fonction antibactérienne ?",
    a: "L'appareil combine un puissant vortex d'eau rotatif bidirectionnel avec une lumière bleue antibactérienne qui neutralise les germes et bactéries responsables des mauvaises odeurs et irritations cutanées."
  },
  {
    q: "Comment s'alimente la machine ?",
    a: "Elle se branche directement sur une prise électrique standard avec son câble fourni. Sa consommation est ultra économique (seulement quelques watts par cycle de 10 à 15 minutes)."
  },
  {
    q: "Comment se déroule la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue sous 24h à Cotonou, Calavi et environs. Vous payez en espèces au livreur uniquement après avoir reçu et vérifié votre colis."
  }
];

export default function MiniLaveLingeLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug || "mini-lave-linge");
  const utm = useUTM();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Défilement automatique du carrousel si plus d'une image
  useEffect(() => {
    if (isHeroHovered || CAROUSEL_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  // Capture silencieuse du prospect (Ghost lead) dès qu'il saisit 8 chiffres
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        city: city,
        address: address,
        product_slug: "mini-lave-linge",
        product_title: "Mini Lave-Linge Stérilisateur Lingerie",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Mini Lave-Linge Stérilisateur Lingerie",
      content_ids: ["mini-lave-linge"],
      value: 17900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Mini Lave-Linge Stérilisateur Lingerie",
      content_ids: ["mini-lave-linge"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      setOrderError("Veuillez renseigner votre numéro de téléphone pour la livraison.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    try {
      const order = await saveNewOrder({
        product_title: "Mini Lave-Linge Stérilisateur Lingerie & Vêtements Délicats",
        product_slug: "mini-lave-linge",
        customer_name: customerName.trim() || "Client Isivente",
        customer_phone: customerPhone.trim(),
        customer_phone2: customerPhone2.trim() || undefined,
        city: city.trim() || "Cotonou",
        address: address.trim() || "Cotonou",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
        utm_source: utm?.utm_source || undefined,
        utm_medium: utm?.utm_medium || undefined,
        utm_campaign: utm?.utm_campaign || undefined,
      });

      markLeadConverted(customerPhone.trim(), "mini-lave-linge");

      trackPurchase({
        content_name: "Mini Lave-Linge Stérilisateur Lingerie",
        content_ids: ["mini-lave-linge"],
        value: selectedBundle.price,
        currency: "XOF",
        num_items: 1,
      });

      const successUrl = `/p/mini-lave-linge/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-sky-50 selection:text-sky-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>Livraison express sous 24h à Cotonou & Calavi • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Droplets className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(2,132,199,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-sky-100 text-[11px]">(17 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-100 text-sky-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 stroke-[1.75]" />
            <span>Hygiène & Soin Délicat</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900 leading-tight">
            Mini Lave-Linge Stérilisateur Lingerie & Vêtements Délicats
          </h1>
          
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Lavez et stérilisez séparément vos sous-vêtements, soutiens-gorge et vêtements de bébé. Cuve transparente avec vortex nettoyant haute fréquence et écran tactile numérique.
          </p>
        </div>

        {/* ── GALERIE PHOTOS FOND BLANC AVEC RATIO PROPRE ── */}
        <div 
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="max-w-[480px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4 space-y-3"
        >
          {/* Cadre de l'image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
            <img
              src={CAROUSEL_IMAGES[activeImgIndex].src}
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              className="w-full h-full object-contain p-1"
            />

            {/* Badge promotionnel élégant */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 text-[11px] font-bold text-sky-700">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Offre Spéciale : 17 900 FCFA</span>
            </div>

            {/* Flèches de navigation manuelle discrètes */}
            {CAROUSEL_IMAGES.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1));
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 hover:text-sky-600 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 hover:text-sky-600 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE PRIORITAIRES ── */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xl mx-auto">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-sky-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
            <div className="text-[10px] text-slate-500 font-mono">Cotonou & Calavi</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Test à Réception</div>
            <div className="text-[10px] text-slate-500 font-mono">Paiement après vérification</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Sparkles className="w-5 h-5 text-amber-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Stérilisation UV</div>
            <div className="text-[10px] text-slate-500 font-mono">Lumière bleue 99%</div>
          </div>
        </div>

        {/* ── FORMULAIRE DE COMMANDE ENCADRÉ (DIRECTEMENT SOUS LES BADGES) ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="mini-lave-linge"
            productTitle="Mini Lave-Linge Stérilisateur Lingerie & Vêtements Délicats"
            productImage="/images/mini-lave-linge-hero.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Mini Lave-Linge Stérilisateur - ${b.name}`,
                content_ids: ["mini-lave-linge", b.id || "solo"],
                value: b.price,
                currency: "XOF",
                num_items: b.quantity || 1,
              });
            }}
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
            accentColor="#0284c7"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── BÉNÉFICES CLÉS & ARGUMENTS EMOTIONNELS ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Pourquoi séparer le lavage de vos sous-vêtements ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Laver ses dessous avec les pantalons ou les habits de toute la famille dans la même machine favorise la prolifération des bactéries. Ce mini lave-linge résout le problème en toute simplicité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Hygiène Intime Préservée</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Lavage dédié uniquement à votre lingerie personnelle pour éviter les irritations et infections cutanées.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Timer className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Écran Tactile & Timer Automatique</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Cycles rapides de 10 à 15 minutes. Lancez votre cycle, la machine s'arrête automatiquement.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Waves className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Vortex Doux pour Lingerie Fine</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Ne déforme pas les armatures de soutiens-gorge et n'abîme pas la dentelle contrairement aux gros tambours.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Baby className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Idéal Vêtements de Bébé</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Nettoyage ultra-propre et séparé pour la peau fragile des nourrissons (bavoirs, bonnets, chaussettes).
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-sm">
              {"★".repeat(5)}
            </div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
              Retour d'expérience de nos clientes au Bénin
            </h2>
            <p className="text-xs text-slate-500">
              Note moyenne 4.9/5 basée sur plus de 80 commandes livrées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{rev.name}</div>
                      <div className="text-[10px] text-slate-500">{rev.location}</div>
                    </div>
                    <div className="flex text-amber-400 text-xs">
                      {"★".repeat(rev.rating)}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-snug">« {rev.title} »</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-2 border-t border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Achat vérifié Isivente</span>
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
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-sky-600 transition-colors duration-100 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeFaq === idx ? "rotate-180 text-sky-600" : ""}`} />
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

      {/* ── BARRE MOBILE FLOTTANTE POUR COMMANDER & BOUTON WHATSAPP ── */}
      <StickyMobileCtaBar
        price={17900}
        accentColor="#0284c7"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Mini Lave-Linge Stérilisateur à 17 900 FCFA avec livraison à domicile."
      />

    </div>
  );
}
