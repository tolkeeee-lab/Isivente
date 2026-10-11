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
  Heart, 
  Gift, 
  PackageCheck, 
  Award, 
  ArrowRight, 
  Sliders, 
  Check, 
  Gem,
  Crown
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
    name: "Coffret Cadeau Écrin Duo de Bracelets Cœurs Dorés Ajustables",
    subtitle: "Les 2 bracelets officiels (Cœur ajouré & Cœur plein) dans leur écrin velours de luxe avec fermoirs coulissants",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_SLIDES = [
  {
    image: "/images/bracelets-coeur/bracelet-duo-partager.jpg",
    alt: "Le duo de bracelets cœurs dorés dans son écrin cadeau de luxe",
  },
  {
    image: "/images/bracelets-coeur/bracelet-deux-designs.jpg",
    alt: "Deux designs un même éclat - Cœur ajouré et Cœur plein",
  },
  {
    image: "/images/bracelets-coeur/bracelet-elegance-quotidien.jpg",
    alt: "L'élégance au quotidien - Bracelets portés avec fermoir perle ajustable",
  },
  {
    image: "/images/bracelets-coeur/bracelet-moments.jpg",
    alt: "Un petit cœur pour les moments qui comptent - Coffret cadeau complet",
  },
  {
    image: "/images/bracelets-coeur/bracelet-cadeau-plaisir.jpg",
    alt: "Le cadeau qui fait plaisir pour une personne spéciale",
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
    name: "Sonia G.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Offert à ma meilleure amie, nous portons chacune notre cœur !",
    comment: "J'ai gardé le cœur plein et j'ai offert le cœur ajouré à ma sœur de cœur. Les finitions dorées sont magnifiques, la chaîne brille délicatement au soleil et le fermoir à perle coulissante permet de l'ajuster en une seconde sans avoir besoin d'aide pour l'attacher !",
    verified: true,
  },
  {
    name: "Marc-Aurèle K.",
    location: "Calavi (Tankpè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le cadeau romantique idéal : emballage et écrin très chics",
    comment: "Livré en 24h chrono. J'ai pu vérifier les bracelets et le coffret avec le livreur avant de payer en espèces. Ma fiancée a adoré la symbolique des deux cœurs complémentaires. Bijou fin, élégant et d'une grande délicatesse.",
    verified: true,
  },
  {
    name: "Prudence D.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Ne noircit pas, très léger et va avec toutes mes tenues",
    comment: "Je les porte ensemble au même poignet tous les jours depuis deux semaines. Ils sont tellement légers qu'on les oublie complètement, mais ils apportent une touche dorée très raffinée à n'importe quelle robe ou tenue de travail.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Le coffret contient-il bien les deux bracelets ?",
    a: "Oui, absolument ! Le coffret complet à 14 900 FCFA comprend les deux bracelets complémentaires (le bracelet Cœur plein ET le bracelet Cœur ajouré) délicatement présentés dans leur écrin velours prêt à offrir."
  },
  {
    q: "La taille convient-elle à tous les poignets ?",
    a: "Oui, à 100%. Chaque bracelet est équipé d'un fermoir coulissant à perle dorée intelligent. Il vous suffit de glisser la perle d'une seule main pour agrandir ou resserrer le bracelet sur mesure, qu'il s'agisse d'un poignet très fin ou plus large."
  },
  {
    q: "Le bracelet risque-t-il de noircir ou de perdre son éclat ?",
    a: "Non. Les bracelets bénéficient d'un plaquage doré multi-couches résistant conçu pour préserver tout son éclat au fil du temps. Évitez simplement les bains prolongés dans l'eau de mer et les produits détergents corrosifs pour conserver une brillance éternelle."
  },
  {
    q: "Peut-on les porter séparément ou ensemble ?",
    a: "Les deux styles sont parfaits : vous pouvez les accumuler ensemble sur le même poignet pour un look ultra tendance, ou en garder un pour vous et offrir le second à une personne spéciale (amie, maman, sœur, conjointe) comme symbole d'attachement."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue en 24h chrono à Cotonou, Calavi, Porto-Novo et dans toutes les villes du Bénin. Vous payez en espèces (14 900 FCFA) uniquement après avoir reçu et inspecté votre coffret auprès du livreur."
  }
];

export default function DuoBraceletsCoeurLanding({ slug = "duo-bracelets-coeur" }: { slug?: string }) {
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
        product_slug: "duo-bracelets-coeur",
        product_title: "Coffret Cadeau Duo Bracelets Cœurs Dorés",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Coffret Cadeau Duo Bracelets Cœurs Dorés",
      content_ids: ["duo-bracelets-coeur", "bracelets-coeur"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Coffret Cadeau Duo Bracelets Cœurs Dorés",
      content_ids: ["duo-bracelets-coeur"],
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
        product_title: "Coffret Cadeau Écrin Duo de Bracelets Cœurs Dorés Ajustables",
        product_slug: "duo-bracelets-coeur",
        customer_name: customerName.trim() || "Cliente Isivente",
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

      markLeadConverted(customerPhone.trim(), "duo-bracelets-coeur");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Duo de Bracelets Cœurs Dorés",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/duo-bracelets-coeur/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Crown className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(217,119,6,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-amber-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Bijouterie Fine & Coffret Cadeau</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Deux designs précieux, un même <span className="text-amber-600">éclat d&apos;amour</span> et de <span className="text-rose-600">connexion.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Le coffret duo de bracelets cœurs dorés (Cœur ajouré & Cœur plein). Taille ajustable universelle et écrin cadeau de luxe inclus pour célébrer les moments qui comptent.
          </p>
        </div>

        {/* ── 5. CARROUSEL D'IMAGES AUTO-DÉFILANT (PILIER 3 - ÉPURÉ SANS STICKER OBSTRUANT) ── */}
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

            {/* Indicateurs de diapositives */}
            <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5">
              {CAROUSEL_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentSlide ? "w-6 bg-amber-600" : "w-2 bg-slate-300"
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
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Les 2 bracelets dans leur boîte écrin</p>
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
            productSlug="duo-bracelets-coeur"
            productTitle="Coffret Cadeau Écrin Duo de Bracelets Cœurs Dorés Ajustables"
            productImage="/images/bracelets-coeur/bracelet-duo-partager.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Duo Bracelets Cœur - ${b.name}`,
                content_ids: ["duo-bracelets-coeur", b.id || "solo"],
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
            accentColor="#d97706"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. GRILLE DES BÉNÉFICES / 4 QUALITÉS MAJEURES ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">L&apos;Art du Détail</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 atouts d&apos;exception qui subliment ce duo</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Chaque finition a été imaginée pour allier esthétique intemporelle, symbolisme et confort absolu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Atout 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Heart className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Deux Cœurs Complémentaires</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Un cœur ajouré aérien et un cœur plein lumineux : deux designs qui se répondent avec harmonie et poésie.
              </p>
            </div>

            {/* Atout 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Sliders className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Taille Ajustable Universelle</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fermoir à perle coulissante d&apos;une seule main. S&apos;adapte parfaitement à toutes les morphologies de poignet.
              </p>
            </div>

            {/* Atout 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Gem className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Éclat Doré Durable</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plaquage or éclatant haute résistance : conserve sa brillance raffinée et ne noircit pas au quotidien.
              </p>
            </div>

            {/* Atout 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Gift className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Écrin Cadeau Inclus</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Livré dans sa luxueuse boîte écrin avec coussinet de présentation. Prêt à faire battre le cœur de celle qui le reçoit.
              </p>
            </div>

          </div>
        </section>

        {/* ── 9. DÉMONSTRATION EN ACTION & USAGE (POUR SOI OU À PARTAGER) ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Un Bijou Polyvalent</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Comment porter votre duo de bracelets cœurs ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Deux manières magiques d&apos;adopter ce duo selon vos envies et vos sentiments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Option 1</span>
              <h3 className="font-bold text-slate-900 text-base">Accumulez-les à votre poignet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Portez les 2 bracelets superposés pour créer un jeu de lumière moderne et élégant qui sublime instantanément vos tenues de journée comme de soirée.
              </p>
            </div>

            <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Option 2</span>
              <h3 className="font-bold text-slate-900 text-base">Partagez avec un être cher</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gardez l&apos;un des cœurs et offrez le second à votre maman, votre fille, votre sœur ou votre meilleure amie comme le symbole indéfectible de votre lien.
              </p>
            </div>

          </div>

          <div className="relative max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/bracelets-coeur/bracelet-deux-designs.jpg"
              alt="Détail des finitions cœur ajouré, cœur plein et chaîne délicate"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander mon coffret duo (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi ce coffret surclasse les bijoux ordinaires</h3>
            <p className="text-xs sm:text-sm text-slate-500">La perfection d&apos;une parure pensée pour durer et émouvoir</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bijou Ordinaire */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Bracelets fantaisie classiques</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Fermoirs à mousqueton rigides presque impossibles à attacher seule sans assistance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Taille fixe : trop serré ou trop lâche, qui glisse et risque de se perdre.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Livré dans un simple sachet plastique sans écrin cadeau de présentation.</span>
                </li>
              </ul>
            </div>

            {/* Isivente Duo Cœurs */}
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                <span>Duo Cœurs Isivente™</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Fermoir perle coulissante instantané : s&apos;enfile et s&apos;ajuste d&apos;une seule main.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Taille universelle parfaite qui épouse délicatement la courbure du poignet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Présenté dans un magnifique coffret écrin de luxe prêt à être offert.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── 11. INFOGRAPHIE ZOOM SUR L'ÉLÉGANCE AU QUOTIDIEN ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Raffinement Féminin</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              L&apos;élégance subtile qui s&apos;accorde avec toutes vos tenues
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Une touche dorée intemporelle pour sublimer chaque geste de votre quotidien.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/bracelets-coeur/bracelet-elegance-quotidien.jpg"
              alt="Démonstration des bracelets cœurs dorés portés au poignet"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
            <Gift className="w-3.5 h-3.5 text-amber-200" />
            <span>Offre Spéciale Isivente Bénin</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold max-w-xl mx-auto leading-tight">
            Offrez ou faites-vous plaisir avec ce symbole éternel de tendresse
          </h2>

          <p className="text-amber-100 text-xs sm:text-sm max-w-lg mx-auto">
            Livraison rapide en 24h à Cotonou, Calavi et partout au Bénin. Vous payez en espèces à la livraison après avoir inspecté les bijoux dans leur boîte.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="font-mono text-xl sm:text-2xl font-bold text-white">
              14 900 FCFA <span className="line-through text-amber-300/70 text-base font-normal">25 000 FCFA</span>
            </div>

            <button
              onClick={scrollToOrder}
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-amber-50 active:scale-95 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Commander le coffret maintenant</span>
              <ArrowRight className="w-4 h-4 text-amber-700" />
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
              <span className="text-xs text-slate-500">(134 clientes comblées au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Témoignages de nos clientes</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Découvrez ce que les personnes qui portent ou ont offert ce duo en pensent.
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
            <p className="text-xs sm:text-sm text-slate-500">Tout ce que vous devez savoir avant de valider votre commande</p>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, i) => (
              <div key={i} className="py-3.5">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-700 transition-colors"
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
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="font-bold tracking-tight text-sm">ISIVENTE BÉNIN</span>
          </div>
          <p className="text-slate-400 text-[11px] max-w-md mx-auto">
            Bijouterie & cadeaux de prestige au Bénin. Livraison sécurisée et paiement en espèces à la livraison.
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
        buttonText="Commander le coffret"
        accentColor="#d97706"
      />

    </div>
  );
}
