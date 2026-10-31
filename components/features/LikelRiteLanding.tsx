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
  CheckCircle2,
  XCircle,
  Sparkles,
  Droplets,
  PackageCheck,
  ArrowRight,
  Sun,
  BatteryCharging,
  Wind,
  Home,
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)",
    subtitle: "Flacon design 500 ml • 3 ambiances lumineuses • Câble USB & tige de diffusion inclus",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/likel-rite/hero-clean.jpg",
    alt: "LIKEL RITE Diffuseur d'Arômes 500 ml Design Flacon de Parfum",
  },
  {
    src: "/images/likel-rite/avant-apres.jpg",
    alt: "Même chambre, autre ambiance : Avant et Après avec LIKEL RITE",
  },
  {
    src: "/images/likel-rite/autonomie-90j.jpg",
    alt: "Rechargez moins, profitez plus longtemps : capacité 500 ml et 3 ambiances lumineuses",
  },
  {
    src: "/images/likel-rite/atmosphere-3lumieres.jpg",
    alt: "Une atmosphère agréable chez vous avec 3 modes de veilleuse intégrée",
  },
  {
    src: "/images/likel-rite/interieur-agreable.jpg",
    alt: "LIKEL RITE Diffuseur d'arôme pour un intérieur agréable",
  },
  {
    src: "/images/likel-rite/maison-accueillante.jpg",
    alt: "Une maison plus accueillante chaque jour",
  },
  {
    src: "/images/likel-rite/autre-atmosphere.jpg",
    alt: "Votre intérieur mérite une autre atmosphère",
  },
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
    name: "Estelle M.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "On dirait un vrai flacon de parfum de luxe sur ma table de chevet",
    comment:
      "Franchement magnifique ! Le col illuminé façon cristal donne une ambiance d'hôtel 5 étoiles dans ma chambre le soir. Avec quelques gouttes d'huile essentielle dans l'eau, toute la pièce sent divinement bon.",
    verified: true,
  },
  {
    name: "Rodrigue A.",
    location: "Calavi (Zoca)",
    rating: 5,
    date: "Achat vérifié",
    title: "Silencieux et très grande capacité de 500 ml",
    comment:
      "J'avais l'habitude des petits diffuseurs qu'il faut remplir toutes les 2 heures. Celui-ci fait 500 ml, je le remplis une fois et je suis tranquille pendant des jours. En plus il ne fait aucun bruit la nuit.",
    verified: true,
  },
  {
    name: "Nadège K.",
    location: "Cotonou (Akpakpa)",
    rating: 5,
    date: "Achat vérifié",
    title: "Les 3 couleurs de lumière changent vraiment l'atmosphère du salon",
    comment:
      "J'adore la lumière chaude ambrée le soir quand je rentre du travail, c'est hyper apaisant. Tous mes invités me demandent où je l'ai acheté. Livré en moins de 24h et payé à la réception.",
    verified: true,
  },
  {
    name: "Ulrich H.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Parfait contre l'air sec de la climatisation au bureau",
    comment:
      "Installé sur mon bureau climatisé, il humidifie légèrement l'air tout en diffusant une odeur fraîche et élégante. Le design carré rose ambré et noir est très classe.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Que faut-il mettre à l'intérieur du réservoir de 500 ml ?",
    a: "Il suffit de remplir le réservoir avec de l'eau propre (jusqu'à 500 ml) et d'y ajouter quelques gouttes de votre huile essentielle hydrosoluble ou parfum d'ambiance préféré. La brume ultrasonique à froid diffuse ensuite le parfum de manière homogène sans chauffer ni altérer les arômes.",
  },
  {
    q: "Comment fonctionnent la diffusion et les 3 ambiances lumineuses ?",
    a: "Un seul bouton discret vous permet de commander la brume (diffusion continue ou intermittente) et de choisir parmi les 3 ambiances lumineuses du col en cristal : Lumière chaude (relaxante), Lumière neutre (moderne) ou Lumière douce (apaisante). Vous pouvez aussi activer la brume seule sans lumière, ou la veilleuse seule.",
  },
  {
    q: "Est-il bruyant lorsqu'il fonctionne la nuit dans une chambre ?",
    a: "Non, il est équipé d'une technologie d'atomisation ultrasonique ultra-silencieuse (moins de 25 dB). Vous pouvez dormir paisiblement à côté tout en profitant d'un air légèrement humidifié et parfumé.",
  },
  {
    q: "Quelle est son autonomie et comment se recharge-t-il ?",
    a: "Il se recharge facilement via le câble USB fourni (sur adaptateur secteur, batterie externe ou ordinateur). Grâce à son grand réservoir de 500 ml et sa consommation ultra-basse en mode diffusion/veilleuse, vous profitez d'une autonomie prolongée sans avoir à le recharger ou le remplir constamment.",
  },
  {
    q: "Comment se passent la livraison et le paiement au Bénin ?",
    a: "Nous livrons en 24h à Cotonou, Calavi, Porto-Novo et partout au Bénin. Vous ne payez rien d'avance : vous réglez les 14 900 FCFA directement au livreur uniquement après avoir réceptionné et vérifié votre diffuseur LIKEL RITE™.",
  },
];

export default function LikelRiteLanding({ slug = "likel-rite" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
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

  // Auto-défilement carrousel (Pilier 3)
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  // Capture silencieuse du prospect dès 8 chiffres
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        city,
        address,
        product_slug: "likel-rite",
        product_title: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)",
      content_ids: ["likel-rite", "diffuseur-arome"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)",
      content_ids: ["likel-rite"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    trackInitiateCheckout({
      content_name: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)",
      content_ids: ["likel-rite"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    const el = document.getElementById("commander");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
        product_title: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)",
        product_slug: "likel-rite",
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

      markLeadConverted(customerPhone.trim(), "likel-rite");

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "isivente_last_purchase_meta",
          JSON.stringify({
            title: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)",
            price: selectedBundle.price,
            quantity: 1,
          })
        );
      }

      const successUrl = `/p/likel-rite/success?order=${encodeURIComponent(
        order.order_number || ""
      )}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(
        customerPhone.trim()
      )}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>
            Livraison express 24h partout au Bénin • Paiement en espèces à la réception après vérification
          </span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>
          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.97] rounded-xl shadow-sm transition-all duration-100 cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-amber-300 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[1.75]" />
            <span>Diffuseur d'Arômes & Veilleuse Cristal 500 ml</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Même chambre.{" "}
            <span className="text-amber-700">Autre atmosphère.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Sublimez votre maison ou votre bureau avec le diffuseur ultrasonique{" "}
            <strong className="font-semibold text-slate-800">LIKEL RITE™</strong> : un flacon sculptural de 500 ml qui parfume délicatement votre intérieur tout en projetant une lueur cristalline apaisante.
          </p>
        </div>

        {/* ── 5. IMAGE HERO OU CARROUSEL AUTO-DÉFILANT (Pilier 3 — Sans aucun badge superposé sur l'image) ── */}
        <div
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="max-w-[500px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4 space-y-3"
        >
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-inner flex items-center justify-center">
            <img
              src={CAROUSEL_IMAGES[activeImgIndex]?.src}
              alt={CAROUSEL_IMAGES[activeImgIndex]?.alt}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.01]"
            />

            {/* Boutons navigation discrets */}
            <button
              type="button"
              onClick={() =>
                setActiveImgIndex(
                  (prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length
                )
              }
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Miniatures */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImgIndex === idx
                    ? "border-amber-700 ring-2 ring-amber-700/20"
                    : "border-slate-200 opacity-55 hover:opacity-90"
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE (Pilier 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & tout le Bénin</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après inspection</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Remplacement immédiat si souci</p>
            </div>
          </div>
        </div>

        {/* ── 7. FORMULAIRE DE COMMANDE COD IMMÉDIATEMENT APRÈS (Pilier 2) ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
              {orderError}
            </div>
          )}
          <UmeiStyleOrderSection
            productSlug="likel-rite"
            productTitle="Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)"
            productImage="/images/likel-rite/hero-clean.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `LIKEL RITE - ${b.name}`,
                content_ids: ["likel-rite", b.id || "solo"],
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
            isSubmitting={isSubmitting}
            accentColor="#B45309"
            onSubmit={handleOrderSubmit}
          />
        </div>

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pourquoi LIKEL RITE™ transforme instantanément votre intérieur
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              L'élégance d'un flacon de haute parfumerie alliée à la technologie de brumisation ultrasonique silencieuse.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Wind className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Brume Fine & Parfum Homogène</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ajoutez simplement de l'eau et quelques gouttes de votre huile essentielle préférée. Sa nano-brumisation à froid parfume toute la pièce et adoucit l'air sec lié à la climatisation ou au ventilateur.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Sun className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Veilleuse Cristal 3 Ambiances</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Son col facetté façon diamant s'illumine selon vos envies : lumière chaude dorée pour la détente du soir, lumière neutre moderne ou lumière douce apaisante pour la nuit.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <Droplets className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Grande Capacité 500 ml</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fini la corvée de remplissage toutes les deux heures. Son réservoir généreux de 500 ml assure des journées entières de diffusion continue ou intermittente en toute tranquillité.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                <BatteryCharging className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sans Fil, Silencieux & Longue Autonomie</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rechargeable par USB, il se pose librement sur votre table de chevet, table basse ou bureau sans câble gênant. Fonctionnement ultra-silencieux pour un sommeil profond.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. AVANT / APRÈS & AMBIANCE VISUELLE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Transformation Immédiate
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Même chambre. Autre ambiance.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Passez d'une pièce ordinaire à un espace chaleureux, parfumé et relaxant dès la tombée du soir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
              <img
                src="/images/likel-rite/avant-apres.jpg"
                alt="Comparaison Avant et Après dans une chambre avec le diffuseur LIKEL RITE"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-amber-700 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Parfume délicatement l'espace</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Élimine les odeurs de renfermé ou d'humidité et accueille vos proches avec une signature olfactive digne des grands hôtels.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">3 modes de lumière au choix</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Lumière chaude dorée pour une atmosphère cocooning, lumière neutre cristalline pour la lecture, ou lumière douce tamisée pour dormir.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-amber-900 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Objet déco pour salon, chambre et bureau</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Son flacon rosé transparent surmonté d'un bouchon noir mat et d'une couronne lumineuse habille vos meubles même lorsqu'il est éteint.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Commander mon Diffuseur LIKEL RITE™ (14 900 F)</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS (Classique vs LIKEL RITE Isivente) ── */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Désodorisants classiques vs Diffuseur LIKEL RITE™ 500 ml
            </h2>
            <p className="text-xs text-slate-500">
              Découvrez pourquoi de plus en plus de foyers au Bénin adoptent la diffusion ultrasonique.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3.5 sm:p-4">Critère</th>
                  <th className="p-3.5 sm:p-4 text-slate-400">Sprays & Petits Diffuseurs</th>
                  <th className="p-3.5 sm:p-4 bg-amber-50/70 text-amber-950 font-extrabold">
                    LIKEL RITE™ 500 ml
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {[
                  ["Capacité du réservoir", "80 à 150 ml (se vide vite)", "Grande capacité 500 ml"],
                  ["Esthétique", "Plastique basique ou bombe aérosol", "Flacon de parfum luxe & cristal"],
                  ["Éclairage d'ambiance", "Aucun ou LED criarde", "Veilleuse cristal 3 tons (Chaude, Neutre, Douce)"],
                  ["Confort respiratoire", "Assèche l'air ou gaz chimique", "Brume d'eau + huile essentielle qui adoucit l'air"],
                  ["Niveau sonore", "Jet bruyant ou bourdonnement", "Ultrasonique silencieux (< 25 dB)"],
                  ["Autonomie", "Doit rester branché en permanence", "Batterie longue durée rechargeable USB"],
                ].map(([label, bad, good], idx) => (
                  <tr key={idx}>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900">{label}</td>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-1.5 text-rose-500">
                        <XCircle className="w-4 h-4 shrink-0 stroke-[1.75]" />
                        <span>{bad}</span>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4 bg-amber-50/30">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 stroke-[1.75]" />
                        <span>{good}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11. INFOGRAPHIE / GUIDE VISUEL SUPPLÉMENTAIRE ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs">
            <img
              src="/images/likel-rite/autonomie-90j.jpg"
              alt="Rechargez moins et profitez plus longtemps avec le diffuseur 500 ml"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-2xs">
            <img
              src="/images/likel-rite/atmosphere-3lumieres.jpg"
              alt="Une atmosphère agréable chez vous avec 3 ambiances lumineuses"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-md">
          <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/30">
            <Home className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Offre Spéciale Maison & Bien-Être — Stock Limité</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Offrez une nouvelle atmosphère à votre intérieur dès aujourd'hui
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
            Seulement <span className="font-bold text-white">14 900 FCFA</span> au lieu de{" "}
            <span className="line-through text-slate-400">25 000 FCFA</span> avec livraison express 24h et paiement à la réception.
          </p>
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <span>Commander maintenant — 14 900 FCFA</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* ── 13. AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Noté 4.9/5 par nos clients au Bénin
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 stroke-[1.75]" />
                    {rev.date}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">« {rev.title} »</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800">{rev.name}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="text-center space-y-1 pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Questions Fréquentes</h2>
            <p className="text-xs text-slate-500">
              Tout ce que vous devez savoir sur le Diffuseur d'Arômes LIKEL RITE™ 500 ml.
            </p>
          </div>
          <div className="space-y-2 divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${
                      activeFaq === idx ? "rotate-180 text-amber-700" : ""
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="pb-3 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── 15. FOOTER OFFICIEL ── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-800 tracking-tight">ISIVENTE BÉNIN — Boutique Officielle</p>
        <p>Service client WhatsApp disponible 7j/7 pour le suivi de vos colis et assistance.</p>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Isivente. Tous droits réservés.
        </p>
      </footer>

      {/* ── 16. BARRE MOBILE STICKY CTA (Pilier 1 & 2) ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        accentColor="#B45309"
        buttonText="Commander (14 900 F)"
      />
    </div>
  );
}
