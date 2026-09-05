"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
import HorizontalCarousel from "@/components/ui/HorizontalCarousel";
import { getProductUpsellConfig } from "@/lib/upsellConfig";
import {
  Check,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  BatteryCharging,
  Clock,
  ShieldCheck,
  PackageCheck,
  MessageCircle,
  RefreshCw,
  Utensils,
  Smile,
  CheckCircle2,
} from "lucide-react";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TYPES & DATA */
interface Bundle {
  id: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice: number;
  savings: number | null;
  badge: string | null;
  description: string;
  popular?: boolean;
  freeShipping?: boolean;
}

const BUNDLES: Bundle[] = [
  {
    id: "solo",
    name: "Pack DÃ©couverte Cuisine (1 Appareil)",
    quantity: 1,
    price: 14900,
    originalPrice: 19900,
    savings: null,
    badge: null,
    description: "1x Ã‰plucheur Automatique ChefPeelâ„¢ + CÃ¢ble USB + Manuel",
    popular: false,
    freeShipping: false,
  },
  {
    id: "duo",
    name: "Pack Duo SÃ©rÃ©nitÃ© (1 pour vous + 1 Cadeau Maman/Amie)",
    quantity: 2,
    price: 24900,
    originalPrice: 29800,
    savings: 4900,
    badge: "Best-Seller",
    description: "La formule favorite des familles et passionnÃ©es de cuisine",
    popular: true,
    freeShipping: false,
  },
  {
    id: "trio",
    name: "Pack Traiteur / Famille (3 Appareils)",
    quantity: 3,
    price: 34900,
    originalPrice: 44700,
    savings: 9800,
    badge: "Livraison Offerte",
    description: "Ã‰quipez votre cuisine et faites des heureux au meilleur prix",
    popular: false,
    freeShipping: true,
  },
];

const CAROUSEL_SLIDES = [
  {
    src: "/images/peeler-hero.jpg",
    alt: "ChefPeelâ„¢ Pro â€” Ã‰plucheur Automatique de Fruits et LÃ©gumes",
    label: "Ã‰pluchage Automatique 1 Seul Bouton",
  },
  {
    src: "/images/peeler-usages.jpg",
    alt: "Une machine pour plusieurs aliments : Ail, Pomme de terre, Pomme",
    label: "Une Machine, Plusieurs Usages",
  },
  {
    src: "/images/peeler-avant-apres.jpg",
    alt: "Avant / AprÃ¨s : gain de temps et ail propre sans odeur sur les doigts",
    label: "RÃ©sultat Impeccable Sans Effort",
  },
  {
    src: "/images/peeler-comment.jpg",
    alt: "Comment Ã§a marche en 3 Ã©tapes simples",
    label: "Fonctionnement Express en 3 Ã‰tapes",
  },
  {
    src: "/images/peeler-pourquoi.jpg",
    alt: "Pourquoi choisir notre Ã©plucheur automatique",
    label: "Moins de CorvÃ©e, Plus de Plaisir",
  },
];

const REVIEWS = [
  {
    name: "Bernadette D.",
    city: "Cotonou (Cadjehoun)",
    stars: 5,
    text: "Ã‰plucher l'ail pour mes assaisonnements Ã©tait mon pire calvaire avec les odeurs tenaces sur les mains. Avec cette machine, en 10 secondes tout un bol d'ail est prÃªt et propre sans aucune odeur sur mes doigts !",
  },
  {
    name: "Marcelle T.",
    city: "Abomey-Calavi",
    stars: 5,
    text: "Je gagne un temps fou le week-end pour la prÃ©paration des repas de famille. MÃªme mes pommes de terre et pommes sont Ã©pluchÃ©es sans fatigue. Je recommande vivement.",
  },
  {
    name: "SÃ©bastien A.",
    city: "Porto-Novo",
    stars: 5,
    text: "J'ai offert le pack duo Ã  ma femme et Ã  ma mÃ¨re. Elles ne peuvent plus s'en passer en cuisine. La batterie tient longtemps et la recharge USB est super pratique.",
  },
];

const FAQS = [
  {
    q: "Quels aliments la machine peut-elle Ã©plucher ?",
    a: "Elle est spÃ©cialement conÃ§ue pour les gousses d'ail (son efficacitÃ© est magique !), mais convient Ã©galement parfaitement pour les pommes de terre, les pommes, les carottes et autres petits fruits et lÃ©gumes du quotidien.",
  },
  {
    q: "AbÃ®me-t-elle les gousses d'ail ?",
    a: "Non ! Le mÃ©canisme rotatif brevetÃ© retire dÃ©licatement la fine peau de l'ail par friction douce sans Ã©craser ni abÃ®mer la chair de la gousse. Vous obtenez un ail intact, prÃªt Ã  Ãªtre mixÃ© ou dÃ©coupÃ©.",
  },
  {
    q: "Comment se recharge l'appareil et combien de temps dure la batterie ?",
    a: "L'Ã©plucheur intÃ¨gre une batterie lithium de 1300 mAh rechargeable via cÃ¢ble USB (inclus). Une seule charge complÃ¨te offre des dizaines de sÃ©ances d'Ã©pluchage (jusqu'Ã  2 Ã  3 semaines d'utilisation quotidienne standard).",
  },
  {
    q: "Est-il facile Ã  dÃ©monter et Ã  laver ?",
    a: "ExtrÃªmement simple ! Le couvercle, le plateau et le bol transparent se dÃ©tachent en un clic et se rincent directement Ã  l'eau claire en moins de 30 secondes.",
  },
  {
    q: "Comment fonctionne la livraison et le paiement au BÃ©nin ?",
    a: "Nous livrons en 24h Ã  48h Ã  Cotonou, Abomey-Calavi, Porto-Novo et environs. Vous payez 100% Ã  la livraison (en espÃ¨ces ou Mobile Money MTN/Moov) aprÃ¨s avoir inspectÃ© votre colis.",
  },
];

/* ─────────────────────────────────────────── COMPONENT */
export default function PeelerLanding({ slug }: { slug: string }) {
  const [selected, setSelected] = useState<Bundle>(BUNDLES[0]);
  const [includeBump, setIncludeBump] = useState(false);
  const [includeSecondUnit, setIncludeSecondUnit] = useState(false);
  const upsellConfig = getProductUpsellConfig("peeler");
  const secondUnitOffer = upsellConfig?.secondUnit;
  const bumpOffer = upsellConfig?.bump;

  const [slide, setSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    }
    const sessId = sessionIdRef.current;
    trackUserSession(slug, 0, false, sessId);

    const startTime = Date.now();
    let sent = false;

    const flush = () => {
      if (sent) return;
      sent = true;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      if (elapsed >= 1) {
        trackUserSession(slug, elapsed, false, sessId);
      }
    };

    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [slug]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCtaClick = useCallback(() => {
    const sessId = sessionIdRef.current || ("sess_" + Date.now());
    trackUserSession(slug, 0, true, sessId);
    document.getElementById("commander")?.scrollIntoView({ behavior: "smooth" });
  }, [slug]);

  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback(
    (idx: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setSlide((idx + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating]
  );

  const nextSlide = useCallback(() => {
    goToSlide(slide + 1);
  }, [goToSlide, slide]);

  const prevSlide = useCallback(() => {
    goToSlide(slide - 1);
  }, [goToSlide, slide]);

  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      goToSlide(slide + 1);
    }, 4500);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [slide, goToSlide]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("Veuillez renseigner votre nom, tÃ©lÃ©phone et adresse de livraison.");
      return;
    }
    setSubmitting(true);

    try {
      const secondUnitPrice = includeSecondUnit && secondUnitOffer ? secondUnitOffer.price : 0;
      const bumpPrice = includeBump && bumpOffer ? bumpOffer.price : 0;
      const finalTotal = selected.price + secondUnitPrice + bumpPrice;
      const finalBundleName = selected.name 
        + (includeSecondUnit && secondUnitOffer ? ` + 2Ã¨me Ã‰plucheur (${secondUnitOffer.title})` : "")
        + (includeBump && bumpOffer ? ` + ${bumpOffer.title}` : "");

      const order = await saveNewOrder({
        product_slug: slug,
        product_title: "ChefPeel™ Pro — Éplucheur Automatique Multifonction",
        bundle_id: selected.id,
        bundle_name: finalBundleName,
        quantity: (selected.quantity || 1) + (includeSecondUnit ? 1 : 0),
        total_amount: finalTotal,
        customer_name: name.trim(),
        customer_phone: phone.trim() + (phone2.trim() ? ` / ${phone2.trim()}` : ""),
        city,
        shipping_city: city,
        address: address.trim(),
        shipping_address: address.trim(),
        status: "pending",
      });

      // Marquer la session comme convertie pour les analytics
      const sessId = sessionIdRef.current || ("sess_" + Date.now());
      trackUserSession(slug, 0, true, sessId);

      const orderNum = order?.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
      setOrderInfo({ order_number: orderNum });
      setSubmitted(true);
      setSubmitting(false);
      document.getElementById("commander")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez rÃ©essayer.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-blue-600/20 selection:text-blue-900">
      
      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� BANDEAU D'URGENCE / LIVRAISON EXPRESS â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <div className="bg-[#0B1E3F] text-white text-[11px] sm:text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 tracking-wide border-b border-white/10">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>LIVRAISON EXPRESS 24Hâ€“48H AU BÃ‰NIN â€¢ PAIEMENT 100% Ã€ LA RÃ‰CEPTION DU COLIS</span>
      </div>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� HEADER NAVIGATION â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0047AB] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Utensils className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900 block leading-none">
                ChefPeel<span className="text-[#0047AB]">â„¢ Pro</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ã‰pluchage Automatique 1-Clic</span>
            </div>
          </div>

          <button
            onClick={handleCtaClick}
            className="bg-[#0047AB] hover:bg-[#003580] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Commander</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� HERO SECTION AVEC CARROUSEL EN 1ER â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <section className="pt-6 md:pt-10 pb-12 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* 1. CARROUSEL 5 IMAGES HD */}
          <div className="md:col-span-6 flex flex-col items-center">
            <HorizontalCarousel
              slides={CAROUSEL_SLIDES}
              accentColor="#0047AB"
              autoplayInterval={4500}
            />
          </div>

          {/* 2. TEXTE D'ACCROCHE & VALEUR */}
          <div className="md:col-span-6 space-y-5 text-center md:text-left flex flex-col items-center md:items-start">
            
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1 rounded-full text-xs font-bold text-amber-900 shadow-2xs">
              <div className="flex text-amber-500 text-xs">â˜…â˜…â˜…â˜…â˜…</div>
              <span>4.9/5 (+1 150 cuisiniÃ¨res satisfaites au BÃ©nin)</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-[1.12] text-slate-900 tracking-tight">
              L&apos;Ã©pluchage automatique, <span className="text-[#0047AB]">plus simple</span> et <span className="text-amber-600">sans effort.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Fini la corvÃ©e d&apos;Ã©plucher l&apos;ail Ã  la main et les doigts qui sentent pendant des jours ! En <strong>1 seul clic</strong>, Ã©pluchez instantanÃ©ment votre ail, pommes de terre, pommes et lÃ©gumes.
            </p>

            {/* Bouton d'action principal */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-1">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full sm:w-auto bg-[#0047AB] hover:bg-[#003580] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-900/25 hover:-translate-y-0.5 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Commander â€” 14 900 FCFA</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Badges de RÃ©assurance */}
            <div className="grid grid-cols-3 gap-2 w-full pt-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-slate-400">Paiement</div>
                <div className="text-xs font-bold text-slate-800">Ã€ la livraison</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-slate-400">DÃ©lai</div>
                <div className="text-xs font-bold text-[#0047AB] font-mono">24hâ€“48h</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-slate-400">Colis</div>
                <div className="text-xs font-bold text-slate-800">VÃ©rifiÃ© & TestÃ©</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� SÃ‰LECTION DES PACKS & FORMULAIRE COD (MODÃˆLE UMÃ‰I PLACÃ‰ DIRECTEMENT SOUS LA PRÃ‰SENTATION) â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <UmeiStyleOrderSection
        productSlug={slug}
        productTitle="ChefPeelâ„¢ Pro â€” Ã‰plucheur Automatique Multifonction"
        bundles={BUNDLES}
        selectedBundle={selected}
        onSelectBundle={(b) => setSelected(b as Bundle)}
        customerName={name}
        setCustomerName={setName}
        customerPhone={phone}
        setCustomerPhone={setPhone}
        customerPhone2={phone2}
        setCustomerPhone2={setPhone2}
        city={city}
        setCity={setCity}
        address={address}
        setAddress={setAddress}
        includeBump={includeBump}
        setIncludeBump={setIncludeBump}
        bumpOffer={bumpOffer}
        includeSecondUnit={includeSecondUnit}
        setIncludeSecondUnit={setIncludeSecondUnit}
        secondUnitOffer={secondUnitOffer}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
        accentColor="#0047AB"
        whatsappNumber="2290192901817"
        orderSuccess={submitted}
        orderNumber={orderInfo?.order_number}
        onResetOrder={() => {
          setSubmitted(false);
          setOrderInfo(null);
        }}
      />

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� BANDEAU MARQUEE DES ATOUTS â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <div className="bg-[#0B1E3F] text-white py-3.5 overflow-hidden border-y border-white/10">
        <div className="flex whitespace-nowrap font-mono text-xs sm:text-sm font-semibold tracking-wider">
          <span className="px-4 flex items-center gap-3">
            ðŸ§„ FINI LES DOIGTS QUI SENTENT L&apos;AIL <em className="not-italic text-amber-400">âœº</em> ðŸ”‹ RECHARGEABLE USB 1300 mAh <em className="not-italic text-amber-400">âœº</em> ðŸ¥” AIL, POMME DE TERRE, POMME <em className="not-italic text-amber-400">âœº</em> âš¡ 1 SEUL BOUTON EN QUELQUES SECONDES <em className="not-italic text-amber-400">âœº</em> ðŸ§¼ NETTOYAGE EXPRESS 30s <em className="not-italic text-amber-400">âœº</em>
          </span>
          <span className="px-4 flex items-center gap-3">
            ðŸ§„ FINI LES DOIGTS QUI SENTENT L&apos;AIL <em className="not-italic text-amber-400">âœº</em> ðŸ”‹ RECHARGEABLE USB 1300 mAh <em className="not-italic text-amber-400">âœº</em> ðŸ¥” AIL, POMME DE TERRE, POMME <em className="not-italic text-amber-400">âœº</em> âš¡ 1 SEUL BOUTON EN QUELQUES SECONDES <em className="not-italic text-amber-400">âœº</em> ðŸ§¼ NETTOYAGE EXPRESS 30s <em className="not-italic text-amber-400">âœº</em>
          </span>
        </div>
      </div>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� AVANT / APRÃˆS : TRANSFORMATION EN CUISINE â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <section className="py-14 px-4 md:px-8 max-w-5xl mx-auto space-y-10">
        
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Comparatif RÃ©el
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            La Fin des CorvÃ©es Interminables en Cuisine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            DÃ©couvrez la diffÃ©rence entre l&apos;Ã©pluchage manuel et la technologie ChefPeelâ„¢.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Image Avant/AprÃ¨s */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src="/images/peeler-avant-apres.jpg"
              alt="Avant AprÃ¨s Ã‰pluchage Automatique"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Liste des Avantages */}
          <div className="space-y-4">
            
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <span>âœ• Avant (Ã€ la main)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peaux collÃ©es partout, ongles noircis, odeur tenace pendant plusieurs jours, yeux qui piquent et 20 Ã  30 minutes perdues pour chaque repas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-[#0047AB] space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider text-[#0047AB] flex items-center gap-1.5">
                <span>âœ“ Avec ChefPeelâ„¢ Pro</span>
                <span className="text-[10px] bg-[#0047AB] text-white px-2 py-0.2 rounded-full">Automatique</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Gousses d&apos;ail impeccables et intactes en quelques secondes, doigts 100% propres sans odeur, zÃ©ro gÃ¢chis et cuisine propre.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Gain de temps</div>
                <div className="font-bold text-xs text-slate-800">10x plus rapide</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">HygiÃ¨ne</div>
                <div className="font-bold text-xs text-[#0047AB]">ZÃ©ro contact</div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� COMMENT Ã‡A MARCHE EN 3 Ã‰TAPES â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
        
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            SimplicitÃ© Absolue
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            Comment Ã§a marche ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Seulement 3 Ã©tapes simples pour un rÃ©sultat parfait Ã  chaque fois.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-white">
          <img
            src="/images/peeler-comment.jpg"
            alt="Comment utiliser l'Ã©plucheur en 3 Ã©tapes"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">1</span>
            <div className="font-bold text-sm text-slate-900">Placez vos aliments</div>
            <p className="text-xs text-slate-500">Mettez vos gousses d&apos;ail ou morceaux de lÃ©gumes dans le bol transparent.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">2</span>
            <div className="font-bold text-sm text-slate-900">Appuyez sur le bouton</div>
            <p className="text-xs text-slate-500">Le moteur centrifuge sÃ©pare la peau dÃ©licatement en quelques secondes.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">3</span>
            <div className="font-bold text-sm text-slate-900">RÃ©cupÃ©rez l&apos;aliment prÃªt</div>
            <p className="text-xs text-slate-500">Ouvrez le rÃ©ceptacle : vos aliments sont prÃªts Ã  Ãªtre cuisinÃ©s sans aucun dÃ©chet.</p>
          </div>
        </div>

      </section>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� LES 4 PILIERS TECHNIQUES â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-white">
          <img
            src="/images/peeler-usages.jpg"
            alt="Une machine plusieurs usages"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� COFFRET DÃ‰BALLÃ‰ & UNBOXING â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <section className="py-10 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="bg-[#0B1E3F] text-white rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
              Pack Cuisine Complet
            </span>
            <h3 className="text-xl font-bold text-white font-display">Dans votre colis ChefPeelâ„¢ Pro</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">âœ“</span>
                <span><strong>1x Ã‰plucheur Automatique ChefPeelâ„¢</strong> avec batterie 1300 mAh rechargeable</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">âœ“</span>
                <span><strong>1x Bol rotatif transparent</strong> dÃ©montable et lavable Ã  l'eau en 10s</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">âœ“</span>
                <span><strong>1x Plateau centrifuge en inox</strong> alimentaire anti-oxydation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">âœ“</span>
                <span><strong>1x CÃ¢ble de recharge USB</strong> compatible tout chargeur de tÃ©lÃ©phone</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/90 border border-white/10 rounded-2xl p-5 text-center space-y-3">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Paiement 100% Ã  la Livraison</div>
            <div className="text-lg font-bold text-white">Livraison 24h & Inspection Colis</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              VÃ©rifiez la machine et ses accessoires avec le livreur Ã  domicile avant tout paiement.
            </p>
            <button
              type="button"
              onClick={() => scrollToSection("commander")}
              className="w-full bg-[#0047AB] hover:bg-blue-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Commander ChefPeelâ„¢ (14 900 F)
            </button>
          </div>
        </div>
      </section>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� AVIS CLIENTS â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
            Ce que disent les cuisiniÃ¨res au BÃ©nin
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex text-amber-500 text-xs">â˜…â˜…â˜…â˜…â˜…</div>
              <p className="text-xs text-slate-600 italic leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-800">
                <span>{r.name}</span>
                <span className="text-slate-400 font-normal">{r.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� FAQ â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <section className="py-12 px-4 md:px-8 max-w-3xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
            Questions FrÃ©quentes
          </h3>
        </div>

        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div key={f.q} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 cursor-pointer"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� FOOTER â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•�â•� */}
      <footer className="bg-[#0B1E3F] text-white py-10 px-4 text-center border-t border-white/10 space-y-3 pb-24 md:pb-10">
        <div className="font-display font-bold text-base">ChefPeelâ„¢ Pro BÃ©nin</div>
        <p className="text-xs text-slate-300 max-w-sm mx-auto">
          DistribuÃ© par Isivente â€¢ Service client WhatsApp : +229 01 92 90 18 17
        </p>
        <div className="text-[11px] text-slate-400 font-mono">
          Â© {new Date().getFullYear()} Isivente. Tous droits rÃ©servÃ©s.
        </div>
      </footer>

    </div>
  );
}
