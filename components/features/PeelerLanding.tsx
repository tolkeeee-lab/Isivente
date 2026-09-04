"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
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

/* ─────────────────────────────────────────── TYPES & DATA */
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
    name: "Pack Découverte Cuisine (1 Appareil)",
    quantity: 1,
    price: 14900,
    originalPrice: 19900,
    savings: null,
    badge: null,
    description: "1x Éplucheur Automatique ChefPeel™ + Câble USB + Manuel",
    popular: false,
    freeShipping: false,
  },
  {
    id: "duo",
    name: "Pack Duo Sérénité (1 pour vous + 1 Cadeau Maman/Amie)",
    quantity: 2,
    price: 24900,
    originalPrice: 29800,
    savings: 4900,
    badge: "Best-Seller",
    description: "La formule favorite des familles et passionnées de cuisine",
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
    description: "Équipez votre cuisine et faites des heureux au meilleur prix",
    popular: false,
    freeShipping: true,
  },
];

const CAROUSEL_SLIDES = [
  {
    src: "/images/peeler-hero.jpg",
    alt: "ChefPeel™ Pro — Éplucheur Automatique de Fruits et Légumes",
    label: "Épluchage Automatique 1 Seul Bouton",
  },
  {
    src: "/images/peeler-usages.jpg",
    alt: "Une machine pour plusieurs aliments : Ail, Pomme de terre, Pomme",
    label: "Une Machine, Plusieurs Usages",
  },
  {
    src: "/images/peeler-avant-apres.jpg",
    alt: "Avant / Après : gain de temps et ail propre sans odeur sur les doigts",
    label: "Résultat Impeccable Sans Effort",
  },
  {
    src: "/images/peeler-comment.jpg",
    alt: "Comment ça marche en 3 étapes simples",
    label: "Fonctionnement Express en 3 Étapes",
  },
  {
    src: "/images/peeler-pourquoi.jpg",
    alt: "Pourquoi choisir notre éplucheur automatique",
    label: "Moins de Corvée, Plus de Plaisir",
  },
];

const REVIEWS = [
  {
    name: "Bernadette D.",
    city: "Cotonou (Cadjehoun)",
    stars: 5,
    text: "Éplucher l'ail pour mes assaisonnements était mon pire calvaire avec les odeurs tenaces sur les mains. Avec cette machine, en 10 secondes tout un bol d'ail est prêt et propre sans aucune odeur sur mes doigts !",
  },
  {
    name: "Marcelle T.",
    city: "Abomey-Calavi",
    stars: 5,
    text: "Je gagne un temps fou le week-end pour la préparation des repas de famille. Même mes pommes de terre et pommes sont épluchées sans fatigue. Je recommande vivement.",
  },
  {
    name: "Sébastien A.",
    city: "Porto-Novo",
    stars: 5,
    text: "J'ai offert le pack duo à ma femme et à ma mère. Elles ne peuvent plus s'en passer en cuisine. La batterie tient longtemps et la recharge USB est super pratique.",
  },
];

const FAQS = [
  {
    q: "Quels aliments la machine peut-elle éplucher ?",
    a: "Elle est spécialement conçue pour les gousses d'ail (son efficacité est magique !), mais convient également parfaitement pour les pommes de terre, les pommes, les carottes et autres petits fruits et légumes du quotidien.",
  },
  {
    q: "Abîme-t-elle les gousses d'ail ?",
    a: "Non ! Le mécanisme rotatif breveté retire délicatement la fine peau de l'ail par friction douce sans écraser ni abîmer la chair de la gousse. Vous obtenez un ail intact, prêt à être mixé ou découpé.",
  },
  {
    q: "Comment se recharge l'appareil et combien de temps dure la batterie ?",
    a: "L'éplucheur intègre une batterie lithium de 1300 mAh rechargeable via câble USB (inclus). Une seule charge complète offre des dizaines de séances d'épluchage (jusqu'à 2 à 3 semaines d'utilisation quotidienne standard).",
  },
  {
    q: "Est-il facile à démonter et à laver ?",
    a: "Extrêmement simple ! Le couvercle, le plateau et le bol transparent se détachent en un clic et se rincent directement à l'eau claire en moins de 30 secondes.",
  },
  {
    q: "Comment fonctionne la livraison et le paiement au Bénin ?",
    a: "Nous livrons en 24h à 48h à Cotonou, Abomey-Calavi, Porto-Novo et environs. Vous payez 100% à la livraison (en espèces ou Mobile Money MTN/Moov) après avoir inspecté votre colis.",
  },
];

/* ─────────────────────────────────────────── HELPERS */
const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

/* ─────────────────────────────────────────── COMPONENT */
export default function PeelerLanding({ slug }: { slug: string }) {
  const [selected, setSelected] = useState<Bundle>(BUNDLES[1]);
  const [includeBump, setIncludeBump] = useState(false);
  const upsellConfig = getProductUpsellConfig("peeler");
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

  const handleCtaClick = useCallback(() => {
    const sessId = sessionIdRef.current || ("sess_" + Date.now());
    trackUserSession(slug, 0, true, sessId);
    document.getElementById("commander")?.scrollIntoView({ behavior: "smooth" });
  }, [slug]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlide((s) => (s + 1) % CAROUSEL_SLIDES.length);
    setTimeout(() => setIsAnimating(false), 250);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlide((s) => (s - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
    setTimeout(() => setIsAnimating(false), 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("Veuillez renseigner votre nom, téléphone et adresse de livraison.");
      return;
    }
    setSubmitting(true);

    try {
      const bumpPrice = includeBump && bumpOffer ? bumpOffer.price : 0;
      const finalTotal = selected.price + bumpPrice;
      const finalBundleName = selected.name + (includeBump && bumpOffer ? ` + ${bumpOffer.title}` : "");

      const order = await saveNewOrder({
        product_slug: slug,
        product_title: "ChefPeel™ Pro — Éplucheur Automatique Multifonction",
        bundle_id: selected.id,
        bundle_name: finalBundleName,
        quantity: selected.quantity,
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

      const orderNum = order?.order_number || "";
      window.location.href = `/p/${slug}/upsell?order=${encodeURIComponent(orderNum)}&phone=${encodeURIComponent(phone)}`;
    } catch {
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-blue-600/20 selection:text-blue-900">
      
      {/* ════════════════ BANDEAU D'URGENCE / LIVRAISON EXPRESS ════════════════ */}
      <div className="bg-[#0B1E3F] text-white text-[11px] sm:text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 tracking-wide border-b border-white/10">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>LIVRAISON EXPRESS 24H–48H AU BÉNIN • PAIEMENT 100% À LA RÉCEPTION DU COLIS</span>
      </div>

      {/* ════════════════ HEADER NAVIGATION ════════════════ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0047AB] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Utensils className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900 block leading-none">
                ChefPeel<span className="text-[#0047AB]">™ Pro</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Épluchage Automatique 1-Clic</span>
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

      {/* ════════════════ HERO SECTION AVEC CARROUSEL EN 1ER ════════════════ */}
      <section className="pt-6 md:pt-10 pb-12 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* 1. CARROUSEL 5 IMAGES HD */}
          <div className="md:col-span-6 flex flex-col items-center">
            
            <div className="relative w-full max-w-[360px] sm:max-w-[440px] aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white group select-none">
              
              {/* Badge flottant sur l'image */}
              <div className="absolute top-3.5 left-3.5 z-20 bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{CAROUSEL_SLIDES[slide].label}</span>
              </div>

              <div className="absolute top-3.5 right-3.5 z-20 bg-[#0047AB] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Batterie 1300 mAh
              </div>

              {/* Image active */}
              <img
                key={slide}
                src={CAROUSEL_SLIDES[slide].src}
                alt={CAROUSEL_SLIDES[slide].alt}
                className="w-full h-full object-cover transition-all duration-300 animate-[fadeIn_200ms_ease-in-out]"
              />

              {/* Flèches de navigation */}
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-20"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-20"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Puces de navigation */}
            <div className="flex items-center gap-2 mt-3.5">
              {CAROUSEL_SLIDES.map((s, idx) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    slide === idx ? "w-8 bg-[#0047AB]" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* 2. TEXTE D'ACCROCHE & VALEUR */}
          <div className="md:col-span-6 space-y-5 text-center md:text-left flex flex-col items-center md:items-start">
            
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1 rounded-full text-xs font-bold text-amber-900 shadow-2xs">
              <div className="flex text-amber-500 text-xs">★★★★★</div>
              <span>4.9/5 (+1 150 cuisinières satisfaites au Bénin)</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-[1.12] text-slate-900 tracking-tight">
              L&apos;épluchage automatique, <span className="text-[#0047AB]">plus simple</span> et <span className="text-amber-600">sans effort.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Fini la corvée d&apos;éplucher l&apos;ail à la main et les doigts qui sentent pendant des jours ! En <strong>1 seul clic</strong>, épluchez instantanément votre ail, pommes de terre, pommes et légumes.
            </p>

            {/* Bouton d'action principal */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-1">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full sm:w-auto bg-[#0047AB] hover:bg-[#003580] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-900/25 hover:-translate-y-0.5 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Commander — 14 900 FCFA</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Badges de Réassurance */}
            <div className="grid grid-cols-3 gap-2 w-full pt-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-slate-400">Paiement</div>
                <div className="text-xs font-bold text-slate-800">À la livraison</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-slate-400">Délai</div>
                <div className="text-xs font-bold text-[#0047AB] font-mono">24h–48h</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-slate-400">Garantie</div>
                <div className="text-xs font-bold text-slate-800">1 An Sérénité</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════ BANDEAU MARQUEE DES ATOUTS ════════════════ */}
      <div className="bg-[#0B1E3F] text-white py-3.5 overflow-hidden border-y border-white/10">
        <div className="flex whitespace-nowrap font-mono text-xs sm:text-sm font-semibold tracking-wider">
          <span className="px-4 flex items-center gap-3">
            🧄 FINI LES DOIGTS QUI SENTENT L&apos;AIL <em className="not-italic text-amber-400">✺</em> 🔋 RECHARGEABLE USB 1300 mAh <em className="not-italic text-amber-400">✺</em> 🥔 AIL, POMME DE TERRE, POMME <em className="not-italic text-amber-400">✺</em> ⚡ 1 SEUL BOUTON EN QUELQUES SECONDES <em className="not-italic text-amber-400">✺</em> 🧼 NETTOYAGE EXPRESS 30s <em className="not-italic text-amber-400">✺</em>
          </span>
          <span className="px-4 flex items-center gap-3">
            🧄 FINI LES DOIGTS QUI SENTENT L&apos;AIL <em className="not-italic text-amber-400">✺</em> 🔋 RECHARGEABLE USB 1300 mAh <em className="not-italic text-amber-400">✺</em> 🥔 AIL, POMME DE TERRE, POMME <em className="not-italic text-amber-400">✺</em> ⚡ 1 SEUL BOUTON EN QUELQUES SECONDES <em className="not-italic text-amber-400">✺</em> 🧼 NETTOYAGE EXPRESS 30s <em className="not-italic text-amber-400">✺</em>
          </span>
        </div>
      </div>

      {/* ════════════════ AVANT / APRÈS : TRANSFORMATION EN CUISINE ════════════════ */}
      <section className="py-14 px-4 md:px-8 max-w-5xl mx-auto space-y-10">
        
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Comparatif Réel
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            La Fin des Corvées Interminables en Cuisine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Découvrez la différence entre l&apos;épluchage manuel et la technologie ChefPeel™.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Image Avant/Après */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src="/images/peeler-avant-apres.jpg"
              alt="Avant Après Épluchage Automatique"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Liste des Avantages */}
          <div className="space-y-4">
            
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <span>✕ Avant (À la main)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peaux collées partout, ongles noircis, odeur tenace pendant plusieurs jours, yeux qui piquent et 20 à 30 minutes perdues pour chaque repas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-[#0047AB] space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider text-[#0047AB] flex items-center gap-1.5">
                <span>✓ Avec ChefPeel™ Pro</span>
                <span className="text-[10px] bg-[#0047AB] text-white px-2 py-0.2 rounded-full">Automatique</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Gousses d&apos;ail impeccables et intactes en quelques secondes, doigts 100% propres sans odeur, zéro gâchis et cuisine propre.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Gain de temps</div>
                <div className="font-bold text-xs text-slate-800">10x plus rapide</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Hygiène</div>
                <div className="font-bold text-xs text-[#0047AB]">Zéro contact</div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ════════════════ COMMENT ÇA MARCHE EN 3 ÉTAPES ════════════════ */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
        
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Simplicité Absolue
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            Comment ça marche ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Seulement 3 étapes simples pour un résultat parfait à chaque fois.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-white">
          <img
            src="/images/peeler-comment.jpg"
            alt="Comment utiliser l'éplucheur en 3 étapes"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">1</span>
            <div className="font-bold text-sm text-slate-900">Placez vos aliments</div>
            <p className="text-xs text-slate-500">Mettez vos gousses d&apos;ail ou morceaux de légumes dans le bol transparent.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">2</span>
            <div className="font-bold text-sm text-slate-900">Appuyez sur le bouton</div>
            <p className="text-xs text-slate-500">Le moteur centrifuge sépare la peau délicatement en quelques secondes.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">3</span>
            <div className="font-bold text-sm text-slate-900">Récupérez l&apos;aliment prêt</div>
            <p className="text-xs text-slate-500">Ouvrez le réceptacle : vos aliments sont prêts à être cuisinés sans aucun déchet.</p>
          </div>
        </div>

      </section>

      {/* ════════════════ LES 4 PILIERS TECHNIQUES ════════════════ */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-white">
          <img
            src="/images/peeler-usages.jpg"
            alt="Une machine plusieurs usages"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* ════════════════ SÉLECTION DES PACKS & FORMULAIRE COD (MODÈLE UMÉI) ════════════════ */}
      <UmeiStyleOrderSection
        productSlug={slug}
        productTitle="ChefPeel™ Pro — Éplucheur Automatique Multifonction"
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
        isSubmitting={submitting}
        onSubmit={handleSubmit}
        accentColor="#0047AB"
        whatsappNumber="2290192901817"
      />

      {/* ════════════════ AVIS CLIENTS ════════════════ */}
      <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
            Ce que disent les cuisinières au Bénin
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex text-amber-500 text-xs">★★★★★</div>
              <p className="text-xs text-slate-600 italic leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-800">
                <span>{r.name}</span>
                <span className="text-slate-400 font-normal">{r.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section className="py-12 px-4 md:px-8 max-w-3xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
            Questions Fréquentes
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

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-[#0B1E3F] text-white py-10 px-4 text-center border-t border-white/10 space-y-3 pb-24 md:pb-10">
        <div className="font-display font-bold text-base">ChefPeel™ Pro Bénin</div>
        <p className="text-xs text-slate-300 max-w-sm mx-auto">
          Distribué par Isivente • Service client WhatsApp : +229 01 92 90 18 17
        </p>
        <div className="text-[11px] text-slate-400 font-mono">
          © {new Date().getFullYear()} Isivente. Tous droits réservés.
        </div>
      </footer>

    </div>
  );
}
