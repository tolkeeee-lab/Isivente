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
  Brain, 
  Moon, 
  PackageCheck,
  Award,
  ArrowRight,
  Flame,
  Leaf,
  Check
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
    name: "Gummies Shilajit Gold Pur Himalaya 3000mg & Ashwagandha KSM-66 (Boîte 60 Gummies)",
    subtitle: "Cure complète de 30 jours (2 gummies/jour) • Shilajit Pur de l'Himalaya + Ashwagandha KSM-66 + Black Musli + Gokshura",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/shilajit/shilajit-hero.jpg",
    alt: "Pure Himalayan Shilajit Gold Gummies 3000mg - Pot officiel et ingrédients sacrés",
    caption: "Shilajit Pur en gummies : une façon simple et agréable d'intégrer le trésor de l'Himalaya",
  },
  {
    src: "/images/shilajit/shilajit-vitalite-homme.jpg",
    alt: "Soutien naturel pour votre vitalité au quotidien et bien-être masculin",
    caption: "Vitalité, force et endurance masculine : routine quotidienne pour un corps au sommet de sa forme",
  },
  {
    src: "/images/shilajit/shilajit-focus-concentration.jpg",
    alt: "Une routine pour rester focus et concentré tout au long de la journée",
    caption: "Clarté d'esprit et concentration soutenue : atteignez vos objectifs professionnels sans baisse de régime",
  },
  {
    src: "/images/shilajit/shilajit-routine-quotidien.jpg",
    alt: "Un geste simple au quotidien sans le goût amer de la résine",
    caption: "Fini la résine noire collante et amère : 2 délicieux gummies tendres chaque matin",
  },
  {
    src: "/images/shilajit/shilajit-sommeil-recuperation.jpg",
    alt: "Un esprit plus calme pour de meilleures nuits et une récupération optimale",
    caption: "Ashwagandha KSM-66 & Shilajit : régule le stress et prépare un réveil revigoré",
  },
  {
    src: "/images/shilajit/shilajit-lifestyle-bureau.jpg",
    alt: "Focus, organisation et bien-être au bureau",
    caption: "Format nomade pratique à garder sur votre bureau pour ne jamais manquer votre prise quotidienne",
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
    name: "Dr. Armand K.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le meilleur coup de pouce naturel pour mes longues journées",
    comment: "J'avais testé la résine brute de Shilajit par le passé : le goût était tellement amer et goudronneux que j'avais abandonné. Ces gummies sont une bénédiction. Le goût est très agréable, et après 10 jours de prise matinale, ma fatigue chronique de fin d'après-midi a totalement disparu. Je suis lucide et en pleine forme jusqu'au soir.",
    verified: true,
  },
  {
    name: "Sylvain M.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Énergie physique et vigueur au rendez-vous",
    comment: "À 42 ans, entre le boulot prenant et les entraînements sportifs, je manquais de jus. L'association Shilajit + Ashwagandha KSM-66 fait une réelle différence sur la récupération musculaire et l'endurance. Mon sommeil est beaucoup plus profond. Je recommande les yeux fermés !",
    verified: true,
  },
  {
    name: "Marc-Aurel T.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Livraison rapide en 24h et produit 100% scellé",
    comment: "Colis reçu le lendemain de ma commande. J'ai pu vérifier la boîte scellée avec le livreur avant de régler les 14 900 FCFA. Les gummies ont une texture parfaite et se prennent avec plaisir le matin avec mon café.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Quelle est la posologie recommandée pour cette cure ?",
    a: "Prenez 2 gummies par jour, de préférence le matin au petit-déjeuner ou avant midi avec un verre d'eau. La boîte contient 60 gummies, soit une cure complète de 30 jours renouvelable pour des bienfaits optimaux et durables sur la vitalité."
  },
  {
    q: "Pourquoi choisir le Shilajit en gummies plutôt qu'en résine ?",
    a: "La résine brute traditionnelle a une odeur forte, un goût amer de goudron difficile à supporter et nécessite d'être diluée dans une eau chaude avec une cuillère souvent collante. Nos gummies offrent le même Shilajit pur standardisé (3000 mg) enrichi en Ashwagandha KSM-66, Black Musli et Gokshura, avec un goût fruité délicieux et un dosage exact à chaque prise."
  },
  {
    q: "Quels sont les effets de l'Ashwagandha KSM-66 et du Gokshura ajoutés ?",
    a: "Le Shilajit apporte plus de 84 minéraux et l'acide fulvique pour oxygéner les cellules. L'Ashwagandha KSM-66 réduit le cortisol (hormone du stress) et améliore la qualité du sommeil, tandis que le Gokshura et le Black Musli soutiennent la vigueur masculine, le tonus musculaire et l'endurance globale."
  },
  {
    q: "Le produit est-il adapté aux femmes ?",
    a: "Oui, tout à fait ! Bien que très réputé auprès des hommes pour la vigueur et la testostérone naturelle, le Shilajit et l'Ashwagandha apportent aux femmes un soutien remarquable contre la fatigue mentale, le stress quotidien et favorisent une énergie cellulaire stable."
  },
  {
    q: "Combien de temps faut-il pour ressentir les premiers effets ?",
    a: "La plupart des utilisateurs ressentent un regain de clarté mentale et une meilleure vitalité dès les 5 à 7 premiers jours. Les effets profonds sur la récupération musculaire, le sommeil réparateur et la résistance au stress s'installent pleinement au fil des 3 à 4 semaines de cure continue."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée sous 24h à Cotonou, Calavi et partout au Bénin. Vous ne payez rien à l'avance : vous réglez en espèces (14 900 FCFA) uniquement après réception et contrôle de votre boîte scellée entre les mains du livreur."
  }
];

export default function ShilajitLanding({ slug = "shilajit" }: { slug?: string }) {
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

  // Carrousel Hero Auto-défilant
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
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
        product_slug: "shilajit",
        product_title: "Gummies Shilajit Gold Pur Himalaya 3000mg",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Gummies Shilajit Gold Pur Himalaya 3000mg",
      content_ids: ["shilajit", "shilajit-gold"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Gummies Shilajit Gold Pur Himalaya 3000mg",
      content_ids: ["shilajit"],
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
        product_title: "Gummies Shilajit Gold Pur Himalaya 3000mg & Ashwagandha KSM-66 (Boîte 60 Gummies)",
        product_slug: "shilajit",
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

      markLeadConverted(customerPhone.trim(), "shilajit");

      // Stocker les métadonnées pour la page success
      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Gummies Shilajit Gold Pur Himalaya 3000mg",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/shilajit/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Flame className="w-4 h-4 stroke-[1.75]" />
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

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Vitalité & Énergie Naturelle de l&apos;Himalaya</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Votre vitalité quotidienne mérite une formule pure <span className="text-amber-600">sans l&apos;amertume de la résine.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Shilajit Pur d&apos;or 3000 mg enrichi en Ashwagandha KSM-66, Black Musli et Gokshura. Le tonus, le focus et l&apos;endurance en délicieux gummies tendres.
          </p>
        </div>

        {/* ── CARROUSEL HERO AUTO-DÉFILANT (PILIER 3) ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
            
            {/* Image Slide */}
            <Image
              src={CAROUSEL_IMAGES[currentSlide].src}
              alt={CAROUSEL_IMAGES[currentSlide].alt}
              fill
              className="object-contain p-1 sm:p-2 transition-all duration-500 ease-out"
              priority={currentSlide === 0}
              sizes="(max-width: 768px) 100vw, 768px"
            />

            {/* Pastille Prix Officiel */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                14 900 FCFA
              </span>
            </div>

            {/* Navigation Flèches */}
            <button
              onClick={prevSlide}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all z-10 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all z-10 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Sous-titre descriptif en bas du slide */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 via-slate-900/45 to-transparent p-4 text-white text-xs sm:text-sm font-medium z-10">
              <p className="line-clamp-1">{CAROUSEL_IMAGES[currentSlide].caption}</p>
            </div>
          </div>

          {/* Miniatures interactives synchronisées */}
          <div className="flex items-center justify-center gap-2 mt-3 overflow-x-auto py-1">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  currentSlide === idx 
                    ? "border-amber-600 scale-105 shadow-sm" 
                    : "border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.src}
                  alt={`Vignette ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Formule scellée d&apos;origine</p>
            </div>
          </div>
        </div>

        {/* ── PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug="shilajit"
            productTitle="Gummies Shilajit Gold Pur Himalaya 3000mg & Ashwagandha KSM-66 (Boîte 60 Gummies)"
            productImage="/images/shilajit/shilajit-hero.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Shilajit Gummies - ${b.name}`,
                content_ids: ["shilajit", b.id || "solo"],
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

        {/* ── 4 FONCTIONS MAJEURES DU SHILAJIT GOLD GUMMIES ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Vitalité & Bien-Être Intégral</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 piliers d&apos;action pour transformer votre quotidien</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une synergie puissante d&apos;adaptogènes sacrés pour surmonter la fatigue et retrouver votre plein potentiel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Action 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Zap className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Vitalité & Tonus Durable</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recharge l&apos;énergie cellulaire au niveau mitochondrial sans pic d&apos;excitation ni coup de fatigue en cours de journée.
              </p>
            </div>

            {/* Action 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Brain className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Focus & Clarté Mentale</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                L&apos;acide fulvique et les minéraux biodisponibles soutiennent l&apos;attention, la mémoire et l&apos;organisation au travail.
              </p>
            </div>

            {/* Action 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Moon className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Anti-Stress & Sommeil</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                L&apos;Ashwagandha KSM-66 régule le cortisol, apaise les tensions nerveuses le soir et favorise un réveil revigoré.
              </p>
            </div>

            {/* Action 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Prise Savoureuse & Simple</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zéro préparation, zéro goût de goudron. Deux bonbons gélifiés délicieux et faciles à mâcher chaque matin.
              </p>
            </div>

          </div>
        </section>

        {/* ── BÉNÉFICES COMPARATIFS : RÉSINE BRUTE VS GUMMIES SHILAJIT GOLD ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi abandonner la résine noire brute ?</h3>
            <p className="text-xs sm:text-sm text-slate-500">Le pouvoir pur de l&apos;Himalaya enfin rendu agréable et pratique</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Résine Brute Classique */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Résine Brute Traditionnelle</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Goût amer repoussant</strong> : saveur âcre de goudron qui reste en bouche toute la matinée.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Préparation fastidieuse</strong> : cuillère collante, dissolution lente dans de l&apos;eau tiède, taches indélébiles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Dosage imprécis</strong> : risque fréquent de surdosage ou sous-dosage selon la taille de la cuillerée.</span>
                </li>
              </ul>
            </div>

            {/* Gummies Shilajit Gold */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Gummies Shilajit Gold Pur Himalaya</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>Goût fruité et agréable</strong> : aucun goût de brûlé, se prend avec plaisir comme une friandise bienfaisante.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>Dosage standardisé 3000 mg</strong> : 2 gummies fournissent exactement la concentration active optimale.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>Formule 4-en-1 enrichie</strong> : Shilajit + Ashwagandha KSM-66 + Black Musli + Gokshura dans chaque gomme.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── FOCUS INGRÉDIENTS RARES DE LA FORMULE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Formule Pure & Haute Efficacité</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 trésors naturels issus des sommets de l&apos;Himalaya</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Chaque boîte contient 60 gommes dosées pour 30 jours de cure complète, sans colorants artificiels ni gélatine animale agressive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                3000mg
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Pure Himalayan Shilajit Gold</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Extrait d&apos;altitude purifié, riche en acide fulvique et en plus de 84 oligo-éléments essentiels pour dynamiser le métabolisme cellulaire.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                KSM-66
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Ashwagandha KSM-66® Officiel</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  La forme d&apos;ashwagandha la plus titrée au monde : régule le stress, apaise l&apos;anxiété mentale et accélère la récupération physique.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                Musli
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Black Musli (Curculigo orchioides)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Plante ayurvédique d&apos;exception reconnue pour stimuler la vitalité masculine, la vigueur naturelle et l&apos;endurance à l&apos;effort.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs">
                Gokshura
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Gokshura Pur (Tribulus)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Soutient l&apos;équilibre hormonal naturel, la santé de la prostate et favorise un tonus musculaire sain.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── SECTION SITUATIONS & GALERIE DE VIE QUOTIDIENNE ── */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Votre Journée Optimisée</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Une routine simple pensée pour accompagner chaque moment</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <Image
                  src="/images/shilajit/shilajit-vitalite-homme.jpg"
                  alt="Matin tonique et vitalité"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="p-4 space-y-1.5 flex-1">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Le Matin • Réveil</span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Énergie & Démarrez en force</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  2 gummies au réveil pour booster la circulation, chasser la somnolence et entamer votre journée avec une assurance inébranlable.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <Image
                  src="/images/shilajit/shilajit-focus-concentration.jpg"
                  alt="Focus et concentration au travail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="p-4 space-y-1.5 flex-1">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">La Journée • Travail</span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Clarté Mentale & Concentration</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gardez votre boîte sur votre bureau pour maintenir votre esprit vif, structuré et sans baisse de productivité l&apos;après-midi.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <Image
                  src="/images/shilajit/shilajit-sommeil-recuperation.jpg"
                  alt="Sérénité le soir et sommeil profond"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div className="p-4 space-y-1.5 flex-1">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Le Soir • Récupération</span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Sommeil Profond & Régénération</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  L&apos;Ashwagandha aide à désamorcer les ruminations mentales et offre un repos profond pour reconstituer vos forces.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-amber-950/15">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente Bénin
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre boîte de Shilajit Gold (60 Gummies)
            </h4>
            <p className="text-amber-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">14 900 FCFA</strong> au lieu de <span className="line-through opacity-75">25 000 FCFA</span>.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-amber-950 font-bold text-sm rounded-xl hover:bg-amber-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Commander maintenant (14 900 F)
          </button>
        </div>

        {/* ── SECTION AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-slate-800 font-bold text-sm ml-1.5">4.9/5</span>
              <span className="text-slate-500 text-xs">(Avis clients vérifiés au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clients</h2>
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
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200/70">
                      {rev.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rev.name}</span>
                  <span className="text-slate-400">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Questions Fréquentes</h3>
            <p className="text-xs text-slate-500">Tout ce que vous devez savoir avant de commander votre cure</p>
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
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-amber-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-600" : ""
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

        {/* ── FOOTER OFFICIEL ISIVENTE ── */}
        <footer className="text-center text-xs text-slate-400 space-y-2 pt-6 border-t border-slate-200">
          <p>© {new Date().getFullYear()} ISIVENTE Bénin - Tous droits réservés.</p>
          <p className="text-[11px]">Boutique officielle de distribution de compléments et bien-être. Service client disponible 7j/7.</p>
        </footer>

      </main>

      {/* ── BARRE MOBILE STICKY CTA (PILIER 1 & 2) ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        accentColor="#d97706"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander la boîte de Gummies Shilajit Gold Pur Himalaya à 14 900 FCFA."
      />

    </div>
  );
}
