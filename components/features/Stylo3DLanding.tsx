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
  Palette, 
  Gift, 
  Flame, 
  Zap, 
  PackageCheck,
  Award,
  ArrowRight,
  Eye,
  Smile,
  Layers,
  Shapes,
  Gamepad2
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
    name: "Kit Complet Stylo 3D 3DPEN-2 + 12 Recharges Filaments PLA (36m)",
    subtitle: "Coffret complet avec stylo 3D ergonomique, 12 couleurs de filament PLA, base de support, adaptateur EU et guide",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
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
    name: "Brice K.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes enfants ne touchent plus aux écrans de toute la soirée !",
    comment: "Acheté pour l'anniversaire de mon fils de 9 ans. En moins de 10 minutes, lui et sa sœur fabriquaient déjà des lunettes et une petite tour Eiffel en couleur. Le stylo chauffe vite, ne brûle pas et les filaments refroidissent presque instantanément.",
    verified: true,
  },
  {
    name: "Carine A.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Kit ultra complet avec les 12 couleurs de filament",
    comment: "La boîte est super propre avec tous les accessoires : la prise secteur européenne, le support pour poser le stylo sans brûler la table et beaucoup de mètres de filament. Livré en 24h à Calavi avec paiement à la réception.",
    verified: true,
  },
  {
    name: "Armel D.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Super stimulant pour la créativité et la motricité",
    comment: "Je suis instituteur et je recommande ce genre d'activité à 100%. Cela apprend la patience, la géométrie spatiale et la précision tout en s'amusant. Les enfants sont fiers d'exposer leurs créations dans leur chambre.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "À partir de quel âge les enfants peuvent-ils utiliser le stylo 3D ?",
    a: "Le stylo 3D convient aux enfants à partir de 6 ans (idéalement sous la supervision d'un adulte pour les plus jeunes) ainsi qu'aux adolescents et adultes créatifs. Sa prise en main est ultra-légère et intuitive comme un feutre normal."
  },
  {
    q: "Est-ce sécurisé ? Le stylo risque-t-il de brûler l'enfant ?",
    a: "La buse en céramique est isolée thermiquement et le plastique PLA extrudé refroidit en 2 à 3 secondes au contact de l'air ambiant. De plus, une base de support officielle est incluse pour reposer le stylo verticalement en toute sécurité lorsqu'il n'est pas utilisé."
  },
  {
    q: "Le filament PLA est-il toxique ou dégage-t-il une mauvaise odeur ?",
    a: "Non, absolument pas ! Le filament PLA est fabriqué à base d'amidon végétal biodégradable (maïs). Il est 100% non toxique, sans BPA et ne dégage aucune fumée nocive, ce qui permet de créer sereinement dans une chambre fermée."
  },
  {
    q: "Que contient exactement le kit à 14 900 FCFA ?",
    a: "Le kit officiel complet comprend : 1 Stylo 3D ergonomique avec écran LCD de contrôle, 12 rouleaux de filaments PLA multicolores (soit 36 mètres au total), 1 base de support de table, 1 adaptateur secteur EU sécurisé, et 1 manuel d'instructions étape par étape."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée sous 24h chrono à Cotonou, Calavi, Porto-Novo et partout au Bénin. Vous ne payez rien d'avance : vous réglez les 14 900 FCFA en espèces au livreur uniquement après avoir reçu et inspecté votre colis."
  }
];

const CAROUSEL_SLIDES = [
  {
    src: "/images/stylo-3d/stylo-3d-kit.jpg",
    alt: "Kit complet Stylo 3D 3DPEN-2 avec 12 couleurs de filaments PLA 36m",
    caption: "Kit complet tout-en-un : Stylo 3D, 12 couleurs de filament (36m), support et adaptateur secteur EU",
  },
  {
    src: "/images/stylo-3d/stylo-3d-creations.jpg",
    alt: "Créations 3D sans limites : Tour Eiffel, papillon, maison, lunettes, jouets",
    caption: "Des créations sans limites : Décorations, maquettes, accessoires et jouets à fabriquer soi-même",
  },
  {
    src: "/images/stylo-3d/stylo-3d-educatif.jpg",
    alt: "Une activité créative et éducative pour enfants et débutants",
    caption: "Activité créative & éducative : Développe l'imagination, la motricité fine et la concentration",
  },
  {
    src: "/images/stylo-3d/stylo-3d-etapes.jpg",
    alt: "Utilisation simple en 3 étapes : insérez, choisissez la température, dessinez",
    caption: "Prise en main express en 3 étapes : Insérez le filament, choisissez la température et créez en 3D !",
  },
];

export default function Stylo3DLanding({ slug = "stylo-3d" }: { slug?: string }) {
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

  // Carrousel auto-défilant
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

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
        product_slug: "stylo-3d",
        product_title: "Kit Complet Stylo 3D Professionnel 3DPEN-2 (12 Couleurs PLA)",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Kit Complet Stylo 3D Professionnel 3DPEN-2",
      content_ids: ["stylo-3d", "stylo"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Kit Complet Stylo 3D Professionnel 3DPEN-2",
      content_ids: ["stylo-3d"],
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
        product_title: "Kit Complet Stylo 3D Professionnel 3DPEN-2 (12 Couleurs PLA)",
        product_slug: "stylo-3d",
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

      markLeadConverted(customerPhone.trim(), "stylo-3d");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Kit Complet Stylo 3D Professionnel 3DPEN-2",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/stylo-3d/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900">
      
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Palette className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(2,132,199,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-sky-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-100 text-sky-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Cadeau Éducatif & Créatif N°1</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Dessinez dans les airs et donnez vie à vos idées en <span className="text-sky-600">3D !</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Le coffret complet officiel 3DPEN-2 avec 12 couleurs de filament PLA non toxique (36 mètres). Fini les écrans passifs, place à la créativité et à l'éveil manuel !
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AUTO-DÉFILANT (PILIER 3) ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
            

            {/* Cadre image produit avec animation de fondu */}
            <div className="relative w-full h-full">
              {CAROUSEL_SLIDES.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-contain p-2 sm:p-4"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              ))}

              {/* Pastille Prix Officiel */}
              <div className="absolute top-3 right-3 z-30 pointer-events-none">
                <span className="inline-flex items-center gap-1 bg-sky-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                  14 900 FCFA
                </span>
              </div>

              {/* Légende en bas du carrousel */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 via-slate-900/50 to-transparent p-3 sm:p-4 text-white text-xs sm:text-sm font-medium z-20">
                <p className="line-clamp-1">{CAROUSEL_SLIDES[currentSlide].caption}</p>
              </div>

              {/* Flèches de navigation du carrousel */}
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Indicateurs de points (dots) */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentSlide ? "w-6 bg-sky-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Aller au slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Échange immédiat en cas d'anomalie</p>
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
            productSlug="stylo-3d"
            productTitle="Kit Complet Stylo 3D Professionnel 3DPEN-2 (12 Couleurs PLA)"
            productImage="/images/stylo-3d/stylo-3d-kit.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Kit Stylo 3D - ${b.name}`,
                content_ids: ["stylo-3d", b.id || "solo"],
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

        {/* ── 8. GRILLE DES BÉNÉFICES / 4 FONCTIONS MAJEURES ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Créativité & Technologie</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 atouts majeurs qui font la différence</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Conçu pour stimuler l'ingéniosité des petits et des grands en toute sécurité.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Atout 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                <Palette className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">12 Couleurs de Filament (36m)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                12 rouleaux de 3 mètres pour un total de 36 mètres de filament multicolore. Assez de matière pour concevoir des dizaines de sculptures !
              </p>
            </div>

            {/* Atout 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Filament PLA Sûr & Écologique</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matière végétale biodégradable non toxique, sans fumée ni odeur irritante. Refroidit en 2 secondes au contact de l'air ambiant.
              </p>
            </div>

            {/* Atout 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Gamepad2 className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">La Meilleure Alternative aux Écrans</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Capte toute l'attention de l'enfant dans une activité calme, développe la motricité fine, la concentration et la perception des volumes 3D.
              </p>
            </div>

            {/* Atout 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Prise en Main en 3 Minutes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Design ergonomique ultra-léger avec écran LCD de contrôle et régulation de vitesse. Convient parfaitement aux mains d'enfants et aux débutants.
              </p>
            </div>

          </div>
        </section>

        {/* ── 9. DÉMONSTRATION EN ACTION (3 ÉTAPES SIMPLES) ── */}
        <section id="demo-video" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Prise en main express</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Comment ça marche ? Seulement 3 étapes simples !
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Quelques minutes suffisent pour allumer le stylo et commencer à donner vie à vos premiers objets en relief.
            </p>
          </div>

          {/* Grille des 3 étapes interactives */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Insérez le filament</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Glissez l'extrémité du rouleau PLA de votre choix dans le port supérieur du stylo 3D.
              </p>
            </div>

            <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Choisissez la température</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                L'écran LCD affiche la chauffe sécurisée. Dès que le voyant passe au vert, le stylo est prêt !
              </p>
            </div>

            <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Dessinez en 3D !</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Appuyez sur le bouton d'avance : le plastique sort en douceur et se solidifie instantanément dans l'air.
              </p>
            </div>

          </div>

          {/* Image de démonstration haute définition */}
          <div className="relative max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/stylo-3d/stylo-3d-etapes.jpg"
              alt="Démonstration d'utilisation du stylo 3D en 3 étapes"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander le coffret complet (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Fini les après-midis passifs devant les écrans</h3>
            <p className="text-xs sm:text-sm text-slate-500">Pourquoi ce stylo 3D change radicalement le quotidien de votre enfant</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Écrans & Jouets passifs */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Smartphones, tablettes & jouets passifs</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Consommation passive d'écrans qui fatigue les yeux et perturbe le sommeil.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Jouets en plastique jetables déjà tout faits qui finissent vite oubliés dans un coin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Peu de stimulation de la motricité fine et zéro fierté de création personnelle.</span>
                </li>
              </ul>
            </div>

            {/* Kit Stylo 3D Isivente */}
            <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-200/80 space-y-3">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Kit Stylo 3D Professionnel Isivente</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>Création physique en relief</strong> : l'enfant fabrique lui-même ses propres jouets et objets réels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>Stimulation intellectuelle</strong> : apprend la patience, la géométrie spatiale et développe l'imagination.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>12 couleurs (36m) de PLA incluses</strong> : de quoi créer pendant des semaines sans racheter de filament.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── 11. INFOGRAPHIE / GUIDE DES CRÉATIONS SANS LIMITES ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Inspiration & Galerie</span>
            <h3 className="font-bold text-slate-900 text-base sm:text-xl">
              Que pouvez-vous créer avec votre stylo 3D ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Décorations, maquettes, accessoires, jouets ou créations libres : la seule limite est votre imagination !
            </p>
          </div>

          {/* Grille des 5 catégories */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-pink-700 block">Décorations</span>
              <span className="text-[11px] text-slate-600">Fleurs, papillons, cadres</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-blue-700 block">Maquettes</span>
              <span className="text-[11px] text-slate-600">Maisons, Tour Eiffel</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-amber-700 block">Accessoires</span>
              <span className="text-[11px] text-slate-600">Lunettes, bijoux, clés</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Jouets</span>
              <span className="text-[11px] text-slate-600">Voitures, animaux, robots</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-purple-50 border border-purple-100 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-purple-700 block">Créations Libres</span>
              <span className="text-[11px] text-slate-600">Tout ce que vous imaginez</span>
            </div>
          </div>

          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/stylo-3d/stylo-3d-creations.jpg"
              alt="Des créations sans limites avec le stylo 3D 3DPEN-2"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 576px"
            />
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-sky-950/10">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente Bénin
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Kit Stylo 3D Complet
            </h4>
            <p className="text-sky-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">14 900 FCFA</strong> au lieu de <span className="line-through opacity-75">25 000 FCFA</span> (Économisez 10 100 F).
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-sky-900 font-bold text-sm rounded-xl hover:bg-sky-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Commander maintenant (14 900 F)
          </button>
        </div>

        {/* ── 13. SECTION AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-slate-800 font-bold text-sm ml-1.5">4.9/5</span>
              <span className="text-slate-500 text-xs">(Avis clients certifiés au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent les familles qui l'ont testé</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-semibold border border-sky-100">
                      {rev.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rev.name}</span>
                  <span className="text-slate-400">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. SECTION FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Questions Fréquentes</h3>
            <p className="text-xs text-slate-500">Tout ce que vous devez savoir avant de commander</p>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="py-3">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-sky-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-sky-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-2.5 pr-6 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 15. FOOTER OFFICIEL ISIVENTE ── */}
        <footer className="text-center text-xs text-slate-400 space-y-2 pt-6 border-t border-slate-200">
          <p>© {new Date().getFullYear()} ISIVENTE Bénin - Tous droits réservés.</p>
          <p className="text-[11px]">Boutique officielle de distribution en ligne. Service client disponible 7j/7.</p>
        </footer>

      </main>

      {/* ── 16. BARRE MOBILE STICKY CTA (PILIER 1 & 2) ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        accentColor="#0284c7"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Kit Complet Stylo 3D Professionnel à 14 900 FCFA."
      />

    </div>
  );
}
