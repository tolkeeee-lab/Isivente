"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Zap,
  PackageCheck,
  ArrowRight,
  Flame,
  Award,
  HeartPulse,
  Leaf,
  Coffee,
  Clock,
  Check,
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import { detectBeninCity } from "@/lib/cityUtils";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Tisane des Cinq Trésors™ (Cure 30 Jours - 30 Sachets)",
    subtitle: "Coffret hermétique 150g avec 30 sachets pyramides individuels 100% plantes entières (Ginseng, Maca, Goji, Dattes rouges, Mûres)",
    price: 12900,
    originalPrice: 20000,
    savings: 7100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/the-5-tresors/hero-performance-masculine.jpg",
    alt: "Tisane des Cinq Trésors : Soutien Naturel de la Performance Masculine et Vitalité",
  },
  {
    src: "/images/the-5-tresors/force-energie-quotidien.jpg",
    alt: "Force, Énergie et Endurance au Quotidien sans fatigue",
  },
  {
    src: "/images/the-5-tresors/cinq-tresors-ingredients.jpg",
    alt: "Les 5 Trésors Naturels : Ginseng, Racine de Maca, Baies de Goji, Mûres et Dattes Rouges",
  },
  {
    src: "/images/the-5-tresors/cinq-plantes-selectionnees.jpg",
    alt: "Sélection rigoureuse des plantes traditionnelles de première qualité",
  },
  {
    src: "/images/the-5-tresors/preparation-infusion-guide.jpg",
    alt: "Préparation simple et rapide en 3 minutes à la maison, au bureau ou en voyage",
  },
  {
    src: "/images/the-5-tresors/certifications-qualite.jpg",
    alt: "Qualité certifiée ISO, Halal 100%, BPF et HACCP",
  },
  {
    src: "/images/the-5-tresors/infographie-complete-fr.jpg",
    alt: "Infographie complète de la Tisane des Cinq Trésors et conseils d'utilisation",
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
    name: "Blaise M.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Plus aucun coup de pompe vers 16h au bureau",
    comment:
      "Avec les journées chargées et la chaleur à Cotonou, je rentrais vidé et sans énergie le soir. Depuis que je bois un sachet chaque matin, mon niveau d'énergie reste constant toute la journée sans nervosité. Le goût est doux et naturel, on voit clairement les vrais morceaux de racines dans le sachet.",
    verified: true,
  },
  {
    name: "Koffi A.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Efficace pour le dos et la vigueur masculine",
    comment:
      "J'avais souvent des sensations de fatigue au bas du dos et un manque de tonus après de longues heures assis. Le mélange Ginseng et Maca fait vraiment une différence remarquable dès la première semaine. C'est du solide et 100% naturel sans aucun produit chimique.",
    verified: true,
  },
  {
    name: "Mathieu S.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Très pratique à préparer au travail",
    comment:
      "Chaque sachet individuel est propre et bien dosé. Une tasse d'eau chaude, 3 minutes d'attente et c'est prêt. Je réinfuse même le même sachet une deuxième fois dans l'après-midi. Rapport qualité-prix imbattable à 12 900 F pour 30 jours.",
    verified: true,
  },
  {
    name: "Dieudonné T.",
    location: "Cotonou (Akpakpa)",
    rating: 5,
    date: "Achat vérifié",
    title: "Livraison rapide en moins de 24h et produit conforme",
    comment:
      "Commandé hier soir et reçu ce midi à Akpakpa. J'ai ouvert le paquet devant le livreur avant de régler. L'arôme des plantes à l'ouverture est très agréable. Je recommande vivement pour tous les hommes qui veulent entretenir leur vitalité.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Combien de sachets contient le paquet et quelle est la durée d'utilisation ?",
    a: "Chaque paquet contient 150g au total, répartis en 30 sachets pyramides individuels de 5g. À raison d'un sachet par jour, un paquet correspond exactement à une cure complète de 30 jours (1 mois).",
  },
  {
    q: "Quels sont les 5 ingrédients exacts de cette tisane ?",
    a: "La formule réunit 5 plantes ancestrales sélectionnées de premier choix : le Ginseng (tonifiant naturel & vitalité), la Racine de Maca (endurance & soutien hormonal), les Baies de Goji (richesse antioxydante), les Dattes Rouges (digestion & soutien du sang) et les Mûres séchées (nutriments essentiels). Zéro additif, zéro conservateur et sans sucre ajouté.",
  },
  {
    q: "Comment préparer et déguster cette tisane au quotidien ?",
    a: "Déposez 1 sachet pyramide dans une tasse ou un mug, versez environ 200 ml d'eau bien chaude (85°C - 90°C), puis laissez infuser 3 à 5 minutes. Remuez légèrement et savourez. Astuce : un même sachet peut être réinfusé une seconde fois au cours de la même journée.",
  },
  {
    q: "Y a-t-il des effets secondaires ou des risques de palpitations ?",
    a: "Non. Contrairement aux boissons énergisantes saturées de caféine synthétique ou aux produits chimiques dangereux, la Tisane des Cinq Trésors est 100% végétale et certifiée (ISO, Halal, HACCP, BPF). Elle procure une énergie saine, douce et progressive, sans palpitations ni excitation artificielle.",
  },
  {
    q: "Peut-on l'emporter facilement au bureau ou en déplacement ?",
    a: "Absolument. Les sachets pyramides sont emballés individuellement dans un sachet zippé étanche. Vous pouvez glisser 2 ou 3 sachets dans votre sacoche de travail ou votre poche pour les infuser n'importe où avec un peu d'eau chaude.",
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue en 24h à Cotonou, Calavi et Porto-Novo. Vous ne payez rien à l'avance pour ces villes : vous recevez votre colis, vous vérifiez le paquet et vous réglez les 12 900 FCFA directement au livreur en espèces à la remise.",
  },
];

export default function The5TresorsLanding({ slug = "the-5-tresors" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const utm = useUTM();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Pilier 3 : Défilement automatique du carrousel avec pause au survol
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  // Capture silencieuse du prospect dès 8 chiffres avec détection intelligente de la ville
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      const cityDetect = detectBeninCity(city, address, customerName);
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        city: cityDetect.detectedCity,
        address: address,
        product_slug: slug,
        product_title: "Tisane des Cinq Trésors™ - Ginseng & Racine de Maca",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      });
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle, slug]);

  // Pixel ViewContent
  useEffect(() => {
    trackViewContent({
      content_name: "Tisane des Cinq Trésors™ - Ginseng & Racine de Maca",
      content_category: "Santé & Vitalité",
      content_ids: [slug, "the-5-tresors-30packs"],
      value: selectedBundle.price,
      currency: "XOF",
    });
  }, [selectedBundle, slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Tisane des Cinq Trésors™",
      content_ids: [slug],
      value: selectedBundle.price,
      currency: "XOF",
    });
    if (orderSectionRef.current) {
      orderSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      setOrderError("Veuillez renseigner votre nom, votre numéro et votre quartier.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");
    recordInteraction();

    const cityDetect = detectBeninCity(city, address, customerName);

    trackInitiateCheckout({
      content_name: selectedBundle.name,
      content_ids: [slug, selectedBundle.id || "solo"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: selectedBundle.quantity || 1,
    });

    try {
      const order = await saveNewOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_phone2: customerPhone2.trim() || undefined,
        city: cityDetect.detectedCity,
        address: address.trim(),
        product_title: "Tisane des Cinq Trésors™ - Ginseng & Racine de Maca",
        product_slug: slug,
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
        quantity: selectedBundle.quantity || 1,
        utm_source: utm?.utm_source || undefined,
        utm_medium: utm?.utm_medium || undefined,
        utm_campaign: utm?.utm_campaign || undefined,
      });

      markLeadConverted(customerPhone.trim(), slug);

      const successUrl = `/p/${slug}/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Erreur commande :", err);
      setOrderError(err.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FC] text-slate-900 font-sans antialiased selection:bg-rose-100 selection:text-rose-900">
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <aside
        aria-label="Annonce livraison"
        className="bg-amber-50/90 border-b border-amber-200/60 py-2 px-3 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Livraison Express 24h à Cotonou, Calavi & Porto-Novo • <strong>Paiement à la livraison</strong></span>
      </aside>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-950 uppercase">
              ISI<span className="text-red-700">VENTE</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 border-l border-slate-200 pl-2">
              Santé & Vitalité Naturelle
            </span>
          </div>

          <button
            onClick={scrollToOrder}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Commander</span>
            <span className="opacity-90 font-normal">({selectedBundle.price.toLocaleString("fr-FR")} F)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-800 text-xs font-bold tracking-wide">
            <Leaf className="w-3.5 h-3.5 text-red-700" />
            <span>Infusion Ancestrale 100% Végétale • Certifiée ISO & Halal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Tisane des Cinq Trésors™
            <span className="block text-red-700 text-xl sm:text-3xl mt-1">
              Ginseng Tonifiant & Racine de Maca Pure
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Le secret 100% naturel pour retrouver votre <strong>énergie durable</strong>, stimuler votre <strong>endurance et vitalité masculine</strong>, et dire adieu aux coups de pompe du quotidien sans palpitations.
          </p>
        </section>

        {/* ── 5. CARROUSEL D'IMAGES AUTO-DÉFILANT (PILIER 3) ── */}
        <section
          className="relative bg-white rounded-3xl p-2 sm:p-3 border border-slate-200/80 shadow-sm overflow-hidden"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100">
            <Image
              src={CAROUSEL_IMAGES[activeImgIndex].src}
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover transition-opacity duration-500"
            />

            {/* Navigation manuelle */}
            <button
              onClick={() =>
                setActiveImgIndex((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1))
              }
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
              }
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicateur discret */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xs">
              {CAROUSEL_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImgIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === activeImgIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Aller à la vue ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Miniatures cliquables */}
          <div className="grid grid-cols-7 gap-2 mt-2 pt-2 border-t border-slate-100">
            {CAROUSEL_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImgIndex(i)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  i === activeImgIndex
                    ? "border-red-700 ring-2 ring-red-700/20"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.src} alt="" fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* ── 6. TROIS BADGES DE RÉASSURANCE (PILIER 2) ── */}
        <section className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-900">Livraison Express</div>
            <div className="text-[10px] text-slate-500">Sous 24h à Cotonou/Calavi</div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-900">Paiement Réception</div>
            <div className="text-[10px] text-slate-500">Vérifiez avant de payer</div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-900">100% Naturel</div>
            <div className="text-[10px] text-slate-500">Plantes pures sans chimie</div>
          </div>
        </section>

        {/* ── 7. FORMULAIRE DE COMMANDE (COD) - IMMÉDIATEMENT APRÈS (PILIER 2 OBLIGATOIRE) ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
              {orderError}
            </div>
          )}
          <UmeiStyleOrderSection
            productSlug={slug}
            productTitle="Tisane des Cinq Trésors™ - Ginseng & Racine de Maca"
            productImage="/images/the-5-tresors/hero-performance-masculine.jpg"
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
            accentColor="#991B1B"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. LES 5 TRÉSORS NATURELS EN DÉTAIL ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200/60">
              Formule Traditionnelle Éprouvée
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Pourquoi la Tisane des 5 Trésors est si Efficace ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Chaque sachet rassemble 5 super-aliments ancestraux soigneusement dosés en morceaux entiers pour libérer tous leurs principes actifs à chaud.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-800 font-bold flex items-center justify-center text-xs">
                  01
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Ginseng Pur (Tonifiant Royal)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stimule l'énergie vitale, renforce la résistance physique et intellectuelle, et combat l'épuisement profond après les journées intenses.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  02
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Racine de Maca (Endurance Masculine)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reconnue mondialement pour optimiser l'endurance, l'équilibre hormonal et la vitalité intime sans aucun produit chimique ni effet rebond.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                  03
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Baies de Goji (Super-Antioxydant)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Soutiennent le système immunitaire, protègent les cellules contre le vieillissement prématuré et favorisent la santé des yeux et des reins.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
                  04
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Mûres Noires & Dattes Rouges (Équilibre & Sang)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nourrissent le sang, favorisent une digestion harmonieuse et apportent une note naturellement douce à l'infusion sans aucun sucre ajouté.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. INFOGRAPHIE DÉTAILLÉE DES PLANTES ── */}
        <section className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="relative aspect-square sm:aspect-16/11 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/the-5-tresors/cinq-plantes-selectionnees.jpg"
              alt="Les Cinq Trésors Naturels Soigneusement Sélectionnés"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain"
            />
          </div>
          <div className="text-center px-3">
            <p className="text-xs sm:text-sm font-medium text-slate-700">
              Des plantes entières rigoureusement séchées, sans poussière industrielle ni conservateurs chimiques.
            </p>
          </div>
        </section>

        {/* ── 10. GUIDE DE PRÉPARATION EN 4 ÉTAPES (3 MINUTES) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Prêt en 3 Minutes Chrono
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Comment Déguster Votre Tisane ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une préparation ultra-simple à la maison, au bureau ou en voyage.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-1.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-red-700 text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <div className="text-xs font-bold text-slate-900">1 Sachet Pyramide</div>
              <div className="text-[11px] text-slate-500">Déposez un sachet dans votre tasse préférée.</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-1.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-red-700 text-white font-black text-xs flex items-center justify-center">
                2
              </div>
              <div className="text-xs font-bold text-slate-900">Eau Chaude (~200 ml)</div>
              <div className="text-[11px] text-slate-500">Versez de l'eau bien chaude sur le sachet.</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-1.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-red-700 text-white font-black text-xs flex items-center justify-center">
                3
              </div>
              <div className="text-xs font-bold text-slate-900">Infusion 3 Minutes</div>
              <div className="text-[11px] text-slate-500">Laissez les 5 trésors libérer leurs vertus.</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-1.5">
              <div className="w-7 h-7 mx-auto rounded-full bg-red-700 text-white font-black text-xs flex items-center justify-center">
                4
              </div>
              <div className="text-xs font-bold text-slate-900">Savourer & Réinfuser</div>
              <div className="text-[11px] text-slate-500">Dégustez. Réinfusable une 2ème fois dans la journée !</div>
            </div>
          </div>

          <div className="relative aspect-square sm:aspect-16/11 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/the-5-tresors/preparation-infusion-guide.jpg"
              alt="Guide visuel de préparation de la Tisane des Cinq Trésors"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain"
            />
          </div>
        </section>

        {/* ── 11. BÉNÉFICES COMPARATIFS (TABLEAU CLASSIQUE VS 5 TRÉSORS) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Pourquoi Choisir la Tisane des 5 Trésors ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              La différence entre une solution naturelle durable et les remèdes agressifs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-2 sm:px-4 font-semibold">Critère</th>
                  <th className="py-3 px-2 sm:px-4 font-bold text-red-700 bg-red-50/60 rounded-t-xl">
                    Tisane des 5 Trésors™
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-semibold text-slate-400">
                    Boissons Énergisantes / Pilules
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Composition</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    100% Plantes pures certifiées
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Chimie, caféine synthétique & sucres
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Effet sur le corps</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    Vitalité stable & tonus durable
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Pic brutal suivi d'un gros coup de pompe
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Impact santé</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    Soutient les reins & l'immunité
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Fatigue les reins et le système nerveux
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Effets secondaires</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    Aucun (zéro palpitation, doux pour l'estomac)
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Palpitations, insomnies, nervosité
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 12. CERTIFICATIONS QUALITÉ & SÉCURITÉ ── */}
        <section className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="relative aspect-square sm:aspect-16/11 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/the-5-tresors/certifications-qualite.jpg"
              alt="Certifications officielles ISO, Halal 100%, BPF et HACCP"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain"
            />
          </div>
          <div className="text-center px-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              Fabrication aux standards internationaux les plus stricts pour garantir votre totale tranquillité.
            </p>
          </div>
        </section>

        {/* ── 13. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <section className="bg-gradient-to-br from-red-800 to-amber-900 rounded-3xl p-6 sm:p-10 text-white text-center space-y-5 shadow-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Offre de Lancement au Bénin
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Reprenez le Contrôle de Votre Énergie Dès Aujourd'hui
          </h2>

          <p className="text-sm sm:text-base text-amber-100 max-w-xl mx-auto leading-relaxed">
            30 jours de cure complète (30 sachets pyramides) pour seulement <strong>430 FCFA par jour</strong>. Moins cher qu'une canette au restaurant !
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              12 900 FCFA{" "}
              <span className="text-sm font-normal text-white/60 line-through">
                20 000 FCFA
              </span>
            </div>

            <button
              onClick={scrollToOrder}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-red-900 hover:bg-amber-50 text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Commander Maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-amber-200/80 pt-1">
            ⚡ Paiement en espèces à la livraison • Livraison express en 24h
          </div>
        </section>

        {/* ── 14. AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Ce que Disent Nos Clients au Bénin (4.9 / 5)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Retours d'expérience vérifiés auprès de nos clients à Cotonou, Calavi et Porto-Novo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOMER_REVIEWS.map((rev, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{rev.name}</div>
                    <div className="text-[11px] text-slate-500">{rev.location}</div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {rev.date}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">{rev.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 15. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Foire Aux Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Toutes les réponses à vos questions avant de commander.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS_DATA.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-red-700" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/40 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 16. FOOTER OFFICIEL ── */}
        <footer className="pt-8 pb-16 text-center text-xs text-slate-500 space-y-2 border-t border-slate-200">
          <div className="font-bold text-slate-700">ISIVENTE • Boutique Officielle Bénin</div>
          <p>© {new Date().getFullYear()} ISIVENTE. Tous droits réservés.</p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Les compléments alimentaires aux plantes ne remplacent pas une alimentation variée et un mode de vie sain. Déconseillé aux femmes enceintes ou allaitantes.
          </p>
        </footer>
      </main>

      {/* ── 17. BARRE MOBILE STICKY CTA (PILIER 2) ── */}
      <StickyMobileCtaBar
        price={selectedBundle.price}
        targetSectionId="commander"
        accentColor="#991B1B"
        buttonText="Commander"
        whatsappMessage="Bonjour ! Je souhaite commander la Tisane des Cinq Trésors (12 900 F)."
      />
    </div>
  );
}
