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
  Leaf, 
  Heart, 
  PackageCheck,
  Award,
  ArrowRight,
  Droplets,
  Wind,
  Check,
  CheckCheck
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
    name: "Coffret Crème Déodorante Aisselles OdorAway™ (Boîte de 24 Sachets)",
    subtitle: "Cure complète 21 jours en sachets individuels nomades • Extraits d'Aloe Vera, Thé Vert & Camomille",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_SLIDES = [
  {
    image: "/images/odoraway/odoraway-hero.jpg",
    alt: "OdorAway Armpit Deodorant Cream - Des aisselles fraîches et confiantes chaque jour",
  },
  {
    image: "/images/odoraway/odoraway-21jours.jpg",
    alt: "21 Jours d'aisselles plus fraîches avec la crème déodorante OdorAway",
  },
  {
    image: "/images/odoraway/odoraway-creme-avant-apres.jpg",
    alt: "Texture crémeuse légère OdorAway et résultat aisselles nettes",
  },
  {
    image: "/images/odoraway/odoraway-boite-sachets.jpg",
    alt: "Contenu de la boîte OdorAway - 24 sachets individuels pratiques",
  },
  {
    image: "/images/odoraway/odoraway-bienfaits.jpg",
    alt: "Bienfaits aux extraits naturels OdorAway - Aloe Vera, Thé Vert, Camomille",
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
    name: "Clarisse A.",
    location: "Cotonou (Fidjrossè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Fini les mauvaises odeurs de transpiration même sous la chaleur",
    comment: "Avec l'humidité et la chaleur à Cotonou, les déodorants en spray ne duraient même pas 2 heures. Cette crème en sachet est incroyable : une toute petite noisette le matin et mes aisselles restent parfaitement fraîches et sans aucune odeur jusqu'au soir !",
    verified: true,
  },
  {
    name: "Patrick S.",
    location: "Calavi (Bidossessi)",
    rating: 5,
    date: "Achat vérifié",
    title: "Très pratique à emporter au travail et après le sport",
    comment: "Je glisse toujours 2 sachets dans mon portefeuille. Le format unidose est ultra propre et discret. La texture pénètre immédiatement sans coller ni laisser de traces blanches sur mes chemises. Je recommande sans hésiter.",
    verified: true,
  },
  {
    name: "Nadège T.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes aisselles sont devenues douces, lisses et plus claires",
    comment: "Les déodorants chimiques à base d'aluminium me noircissaient la peau et provoquaient des démangeaisons. Avec OdorAway et ses extraits d'aloe vera, ma peau est apaisée et a retrouvé son éclat naturel en seulement 2 semaines.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Comment fonctionne la crème OdorAway par rapport à un déodorant classique ?",
    a: "Contrairement aux déodorants ordinaires qui se contentent de masquer l'odeur avec des parfums chimiques lourds, OdorAway neutralise directement les bactéries responsables des mauvaises odeurs grâce à ses extraits botaniques (Thé vert, Camomille et Aloe Vera), tout en laissant respirer la peau sans bloquer vos pores."
  },
  {
    q: "La crème bloque-t-elle la transpiration naturelle ?",
    a: "Non ! OdorAway ne bloque pas la transpiration naturelle nécessaire à la régulation du corps ('No Pore Plugging'). Elle agit en détruisant les odeurs et en absorbant l'humidité excessive pour vous garantir une sensation de propreté et de fraîcheur continue."
  },
  {
    q: "Combien de sachets contient une boîte et quelle est la durée d'utilisation ?",
    a: "Chaque boîte officielle contient 24 sachets individuels hermétiques (0.8g x 2). Une petite noisette suffit pour les deux aisselles : une boîte vous assure ainsi plus de 3 semaines de protection et de fraîcheur complète (cure 21 jours)."
  },
  {
    q: "Convient-elle aussi bien aux femmes qu'aux hommes ?",
    a: "Oui, parfaitement ! Sa fragrance fraîche et subtile convient aussi bien aux hommes qu'aux femmes. Elle est idéale pour tous les types de peau, y compris les peaux sensibles après le rasage ou l'épilation."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue sous 24h à Cotonou, Calavi, Porto-Novo et dans tout le Bénin. Vous payez en espèces (14 900 FCFA) uniquement après avoir reçu et inspecté votre boîte auprès du livreur."
  }
];

export default function OdorAwayLanding({ slug = "odoraway" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const utm = useUTM();

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

  // Carrousel auto-défilant (Pilier 3)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  useEffect(() => {
    if (isCarouselHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isCarouselHovered]);

  // Capture silencieuse du prospect dès 8 chiffres
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        city: city,
        address: address,
        product_slug: "odoraway",
        product_title: "Crème Déodorante Aisselles OdorAway™",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Crème Déodorante Aisselles OdorAway™",
      content_ids: ["odoraway", "deodorant-creme"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Crème Déodorante Aisselles OdorAway™",
      content_ids: ["odoraway"],
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
        product_title: "Coffret Crème Déodorante Aisselles OdorAway™ (Boîte de 24 Sachets)",
        product_slug: "odoraway",
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

      markLeadConverted(customerPhone.trim(), "odoraway");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Crème Déodorante Aisselles OdorAway™",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/odoraway/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Leaf className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(16,185,129,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-emerald-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Wind className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fraîcheur & Confiance 24h</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Des aisselles <span className="text-emerald-600">fraîches, nettes</span> et confiantes du matin <span className="text-teal-600">jusqu&apos;au soir.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            La première crème déodorante botanique en sachets nomades. Neutralise instantanément les odeurs de transpiration sans bloquer vos pores et sans tacher vos vêtements.
          </p>
        </div>

        {/* ── 5. CARROUSEL D'IMAGES AUTO-DÉFILANT (PILIER 3 - SANS STICKER OBSTRUANT) ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-900/5 border border-slate-100 overflow-hidden">
            {CAROUSEL_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-contain p-1 sm:p-3"
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ))}

            {/* Boutons de navigation discrets */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicateurs de progression */}
            <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5">
              {CAROUSEL_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentSlide ? "w-6 bg-emerald-600" : "w-2 bg-slate-300"
                  }`}
                  aria-label={`Aller à la diapositive ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Boîte scellée 24 sachets d&apos;origine</p>
            </div>
          </div>
        </div>

        {/* ── 7. PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="odoraway"
            productTitle="Coffret Crème Déodorante Aisselles OdorAway™ (Boîte de 24 Sachets)"
            productImage="/images/odoraway/odoraway-hero.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `OdorAway - ${b.name}`,
                content_ids: ["odoraway", b.id || "solo"],
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
            accentColor="#059669"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. GRILLE DES BÉNÉFICES / 4 POINTS FORTS MAJEURS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Pourquoi OdorAway ?</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 atouts décisifs qui font toute la différence</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une formule révolutionnaire créée pour offrir une efficacité absolue sans agresser votre épiderme.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Atout 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Wind className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Fraîcheur Longue Durée 24h</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Neutralise les odeurs à la source grâce aux extraits botaniques purifiants. Vous restez frais du matin au soir.
              </p>
            </div>

            {/* Atout 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Droplets className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Texture Crème Non Grasse</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                S&apos;applique en quelques secondes et pénètre immédiatement. Ne colle pas et ne laisse aucune trace blanche sur les vêtements.
              </p>
            </div>

            {/* Atout 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Leaf className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Extraits 100% Naturels</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enrichi en Aloe Vera, Thé vert et Camomille pour apaiser, hydrater et adoucir la peau sensible des aisselles.
              </p>
            </div>

            {/* Atout 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Format Sachets Nomades</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                24 unidoses scellées et ultra-hygiéniques. Glissez-en facilement dans votre sac de sport, poche ou sac à main.
              </p>
            </div>

          </div>
        </section>

        {/* ── 9. DÉMONSTRATION D'UTILISATION (3 ÉTAPES FACILES) ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Rituel Express</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Comment utiliser OdorAway en 3 étapes simples ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Seulement 30 secondes le matin pour une assurance totale toute la journée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Étape 1</span>
              <h3 className="font-bold text-slate-900 text-sm">Ouvrez le sachet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Déchirez facilement l&apos;encoche d&apos;un sachet individuel propre et stérile.
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Étape 2</span>
              <h3 className="font-bold text-slate-900 text-sm">Appliquez la crème</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Déposez une petite noisette de crème sur vos aisselles propres et sèches.
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Étape 3</span>
              <h3 className="font-bold text-slate-900 text-sm">Profitez de la fraîcheur</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Massez délicatement : la crème pénètre immédiatement et vous protège pendant 24h.
              </p>
            </div>

          </div>

          <div className="relative max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/odoraway/odoraway-creme-avant-apres.jpg"
              alt="Démonstration de la crème OdorAway et résultat avant/après aisselles nettes"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander ma boîte OdorAway (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi abandonner les sprays traditionnels ?</h3>
            <p className="text-xs sm:text-sm text-slate-500">La supériorité d&apos;une crème déodorante botanique ciblée</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Déodorant Classique */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Sprays & Roll-on classiques</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Masquent les odeurs avec des parfums synthétiques agressifs qui s&apos;évaporent vite.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Contiennent de l&apos;aluminium qui bouche les pores et noircit la peau des aisselles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Laissent des auréoles et taches jaunes tenaces sur les vêtements blancs et chemises.</span>
                </li>
              </ul>
            </div>

            {/* OdorAway */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                <span>OdorAway™ Crème Botanique</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Neutralise directement les bactéries à l&apos;origine des odeurs tenaces.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Laisse respirer la peau naturellement sans obstruer les canaux sudoripares.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Formule douce éclaircissante : rend les aisselles douces, lisses et nettes.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── 11. INFOGRAPHIE FORMULE NATURELLE & FORMAT BOÎTE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Un Format Généreux</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Découvrez le contenu de votre boîte OdorAway
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              24 sachets individuels prêts à l&apos;emploi pour une hygiène irréprochable au quotidien.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/odoraway/odoraway-boite-sachets.jpg"
              alt="Boîte de 24 sachets de crème déodorante OdorAway"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Offre Spéciale Isivente Bénin</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold max-w-xl mx-auto leading-tight">
            Retrouvez la liberté d&apos;avoir des aisselles nettes et fraîches en toute circonstance
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto">
            Livraison rapide sous 24h à Cotonou, Calavi et dans tout le Bénin. Vous payez en espèces à la livraison après avoir vérifié votre colis.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="font-mono text-xl sm:text-2xl font-bold text-white">
              14 900 FCFA <span className="line-through text-emerald-300/70 text-base font-normal">25 000 FCFA</span>
            </div>

            <button
              onClick={scrollToOrder}
              className="px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Commander maintenant</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </button>
          </div>
        </div>

        {/* ── 13. AVIS CLIENTS VÉRIFIÉS BÉNIN ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-800 ml-1.5">4.9 / 5</span>
              <span className="text-xs text-slate-500">(162 avis vérifiés au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clients</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Découvrez comment OdorAway a transformé le quotidien et la confiance de nos clients au Bénin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-2.5 h-2.5" />
                      {rev.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">« {rev.title} »</h3>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-900">{rev.name}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Questions Fréquentes (FAQ)</h2>
            <p className="text-xs sm:text-sm text-slate-500">Tout ce que vous devez savoir sur la crème déodorante OdorAway</p>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, i) => (
              <div key={i} className="py-3.5">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 animate-[fadeIn_150ms_ease-in-out]">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── 15. FOOTER OFFICIEL ── */}
      <footer className="bg-slate-900 text-white text-xs py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="font-bold tracking-tight text-sm">ISIVENTE BÉNIN</span>
          </div>
          <p className="text-slate-400 text-[11px] max-w-md mx-auto">
            Boutique officielle de produits d&apos;hygiène et de bien-être au Bénin. Livraison rapide en 24h et paiement sécurisé en espèces à la livraison.
          </p>
          <div className="text-slate-500 text-[10px] pt-3 border-t border-slate-800/80">
            © {new Date().getFullYear()} Isivente. Tous droits réservés. Service client WhatsApp disponible 7j/7.
          </div>
        </div>
      </footer>

      {/* ── 16. BARRE MOBILE STICKY CTA ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        buttonText="Commander"
        accentColor="#059669"
      />

    </div>
  );
}
