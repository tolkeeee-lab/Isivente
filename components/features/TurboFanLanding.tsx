"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import {
  Check,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wind,
  BatteryCharging,
  Shield,
  Zap,
  Star,
  RefreshCw,
  PhoneCall,
  Sparkles,
  Smartphone,
  Flame,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
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
    name: "Pack Solo Fraîcheur",
    quantity: 1,
    price: 16900,
    originalPrice: 22900,
    savings: null,
    badge: null,
    description: "1x TurboFan™ Max + Cordon tour de cou + Câble USB-C",
    popular: false,
    freeShipping: false,
  },
  {
    id: "duo",
    name: "Pack Duo (1 pour toi + 1 pour un proche)",
    quantity: 2,
    price: 27900,
    originalPrice: 33800,
    savings: 5900,
    badge: "Best-Seller",
    description: "La formule préférée des couples, livreurs et conducteurs",
    popular: true,
    freeShipping: false,
  },
  {
    id: "trio",
    name: "Pack Famille / Chantier (3 Appareils)",
    quantity: 3,
    price: 37900,
    originalPrice: 50700,
    savings: 12800,
    badge: "Livraison Offerte",
    description: "Équipez toute la maison ou vos collègues au meilleur tarif",
    popular: false,
    freeShipping: true,
  },
];

const CAROUSEL_SLIDES = [
  {
    src: "/images/turbofan-studio.jpg",
    alt: "TurboFan™ Max — Ventilateur de ceinture et tour de cou tout-terrain",
    label: "Turbine Ultra-Puissante & Antichoc",
  },
  {
    src: "/images/turbofan-ceinture.jpg",
    alt: "TurboFan™ porté à la ceinture sous le t-shirt en plein soleil",
    label: "1. Clip Ceinture (Sous Vêtements)",
  },
  {
    src: "/images/turbofan-cou.jpg",
    alt: "TurboFan™ porté en tour de cou pour conducteurs et livreurs",
    label: "2. Tour de Cou Mains-Libres",
  },
  {
    src: "/images/turbofan-powerbank.jpg",
    alt: "TurboFan™ chargeant un smartphone en direct via son port Powerbank",
    label: "3. Powerbank 10 000 mAh Intégré",
  },
];

const REVIEWS = [
  {
    name: "Gérard K.",
    city: "Cotonou (Zogbo)",
    stars: 5,
    text: "Je roule en moto toute la journée sous le soleil de Cotonou. Avec ce ventilo clipsé sous ma chemise, je ne transpire plus du tout. La batterie tient 2 jours entiers.",
  },
  {
    name: "Pascaline M.",
    city: "Calavi",
    stars: 5,
    text: "Indispensable pour le marché et les coupures de courant ! En plus, j'ai pu recharger mon téléphone quand la batterie était à 5%. Très bon produit.",
  },
  {
    name: "Rodrigue A.",
    city: "Porto-Novo",
    stars: 5,
    text: "J'ai pris le pack de 2 pour mon frère et moi sur le chantier. Le souffle d'air est vraiment glacial et la coque est solide contre la poussière.",
  },
];

const FAQS = [
  {
    q: "Comment fonctionne le mode clip de ceinture sous les vêtements ?",
    a: "Vous clipsez simplement l'appareil à votre ceinture ou à la taille de votre pantalon. La turbine aspire l'air ambiant et propulse un jet d'air frais directement sous votre chemise ou t-shirt, ce qui refroidit le torse et le dos instantanément.",
  },
  {
    q: "Combien de temps dure la batterie sur une seule charge ?",
    a: "Grâce à sa batterie lithium haute capacité de 10 000 mAh, le TurboFan offre jusqu'à 24 heures d'autonomie continue en vitesse normale, et 10 à 14 heures à puissance maximale.",
  },
  {
    q: "Peut-il vraiment recharger mon smartphone ?",
    a: "Oui. Il dispose d'un port USB haute vitesse qui permet de recharger n'importe quel smartphone (iPhone, Samsung, Tecno, Infinix) comme une véritable batterie externe de secours.",
  },
  {
    q: "Combien de vitesses de ventilation possède-t-il ?",
    a: "L'appareil propose 5 vitesses réglables d'une simple pression, du souffle doux silencieux jusqu'à la turbine ultra-puissante (12 000 RPM) pour les grosses chaleurs.",
  },
  {
    q: "Comment se déroule la livraison et le paiement au Bénin ?",
    a: "Livraison rapide en 24h à 48h à Cotonou, Calavi, Porto-Novo et environs. Vous inspectez le colis à l'arrivée et réglez en espèces ou par Mobile Money (MTN MoMo / Moov) uniquement à la réception.",
  },
];

/* ─────────────────────────────────────────── HELPERS */
const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

/* ─────────────────────────────────────────── COMPONENT */
export default function TurboFanLanding({ slug }: { slug: string }) {
  const [selected, setSelected] = useState<Bundle>(BUNDLES[1]);
  const [slide, setSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
      setErrorMsg("Veuillez renseigner votre nom, téléphone et adresse de livraison.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);

    try {
      const order = await saveNewOrder({
        product_slug: slug,
        product_title: "TurboFan™ Max — Ventilateur Ceinture & Powerbank",
        bundle_id: selected.id,
        bundle_name: selected.name,
        quantity: selected.quantity,
        total_amount: selected.price,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        city,
        shipping_city: city,
        address: address.trim(),
        shipping_address: address.trim(),
        status: "pending",
      });

      // Marquer la session comme convertie
      const sessId = sessionIdRef.current || ("sess_" + Date.now());
      trackUserSession(slug, 0, true, sessId);

      setOrderInfo(order);
      setSubmitted(true);
      document.getElementById("confirmation")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setErrorMsg("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const C = {
    forest: "#1B3B2B",
    emerald: "#10B981",
    orange: "#FF6B00",
    dark: "#0F172A",
    light: "#F8FAFC",
    cardBg: "#FFFFFF",
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-700">
      
      {/* ════════════════ BANDEAU D'URGENCE / LIVRAISON EXPRESS ════════════════ */}
      <div className="bg-slate-950 text-white text-[11px] sm:text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 tracking-wide border-b border-white/10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>LIVRAISON EXPRESS 24H–48H AU BÉNIN • PAIEMENT À LA RÉCEPTION DU COLIS</span>
      </div>

      {/* ════════════════ HEADER NAVIGATION ════════════════ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Wind className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900 block leading-none">
                TurboFan<span className="text-emerald-600">™ Max</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">3-en-1 Climatiseur Portatif</span>
            </div>
          </div>

          <button
            onClick={handleCtaClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Commander</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ════════════════ HERO SECTION AVEC CARROUSEL EN 1ER ════════════════ */}
      <section className="pt-6 md:pt-10 pb-12 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* 1. CARROUSEL 4 IMAGES HD EN 1ÈRE POSITION */}
          <div className="md:col-span-6 flex flex-col items-center">
            
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white group select-none">
              
              {/* Badge flottant sur l'image */}
              <div className="absolute top-3.5 left-3.5 z-20 bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{CAROUSEL_SLIDES[slide].label}</span>
              </div>

              <div className="absolute top-3.5 right-3.5 z-20 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Batterie 10 000 mAh
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

            {/* Puces et miniatures */}
            <div className="flex items-center gap-2 mt-3.5">
              {CAROUSEL_SLIDES.map((s, idx) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    slide === idx ? "w-8 bg-emerald-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* 2. TEXTE D'ACCROCHE & OFFRE */}
          <div className="md:col-span-6 space-y-5 text-center md:text-left flex flex-col items-center md:items-start">
            
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
              <div className="flex text-amber-400 text-xs">★★★★★</div>
              <span>4.9/5 (+890 utilisateurs au Bénin)</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-[1.12] text-slate-900 tracking-tight">
              Ne souffrez plus de la <span className="text-emerald-600">chaleur</span> ni de la <span className="text-orange-600">transpiration.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Clipsez-le à la ceinture sous votre t-shirt ou portez-le autour du cou : profitez d&apos;un jet d&apos;air glacial continu jusqu&apos;à 24h, tout en rechargeant votre smartphone.
            </p>

            {/* Boutons d'action rapides */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-1">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Commander — 16 900 FCFA</span>
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
                <div className="text-xs font-bold text-emerald-700 font-mono">24h–48h</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-slate-400">Garantie</div>
                <div className="text-xs font-bold text-slate-800">100% Sérénité</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════ BANDEAU MARQUEE DES ATOUTS ════════════════ */}
      <div className="bg-slate-900 text-white py-3.5 overflow-hidden border-y border-slate-800">
        <div className="flex whitespace-nowrap font-mono text-xs sm:text-sm font-semibold tracking-wider">
          <span className="px-4 flex items-center gap-3">
            💨 VENT GLACIAL SOUS LES VÊTEMENTS <em className="not-italic text-emerald-400">✺</em> 🔋 POWERBANK 10 000 mAh <em className="not-italic text-emerald-400">✺</em> 📿 TOUR DE COU SANS LES MAINS <em className="not-italic text-emerald-400">✺</em> 🛡️ COQUE RENFORCÉE ANTICHOC <em className="not-italic text-emerald-400">✺</em> ⚡ 5 VITESSES RÉGLABLES <em className="not-italic text-emerald-400">✺</em>
          </span>
          <span className="px-4 flex items-center gap-3">
            💨 VENT GLACIAL SOUS LES VÊTEMENTS <em className="not-italic text-emerald-400">✺</em> 🔋 POWERBANK 10 000 mAh <em className="not-italic text-emerald-400">✺</em> 📿 TOUR DE COU SANS LES MAINS <em className="not-italic text-emerald-400">✺</em> 🛡️ COQUE RENFORCÉE ANTICHOC <em className="not-italic text-emerald-400">✺</em> ⚡ 5 VITESSES RÉGLABLES <em className="not-italic text-emerald-400">✺</em>
          </span>
        </div>
      </div>

      {/* ════════════════ VIDÉO DE DÉMONSTRATION ════════════════ */}
      <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-5">
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            Démonstration Vidéo
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            Voyez-le en Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Découvrez la puissance du TurboFan™ Max en conditions réelles.
          </p>
        </div>

        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-950">
          <video
            className="w-full h-auto block"
            controls
            playsInline
            preload="metadata"
            poster="/images/turbofan-studio.jpg"
          >
            <source src="/videos/turbofan-demo.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      </section>

      {/* ════════════════ LES 3 MODES D'USAGE EN IMAGES RÉELLES ════════════════ */}
      <section className="py-14 px-4 md:px-8 max-w-5xl mx-auto space-y-10">
        
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            Technologie Polyvalente
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            3 Appareils Indispensables Réunis en 1
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conçu pour résister au climat tropical, aux journées en extérieur et aux imprévus du quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* CARTE 1 : CLIP DE CEINTURE */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md flex flex-col hover:-translate-y-1 transition-all duration-200">
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src="/images/turbofan-ceinture.jpg"
                alt="TurboFan clipsé à la ceinture"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Mode Ceinture
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">Souffle Frais Sous Vêtements</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Clipsez-le à votre pantalon : il propulse l&apos;air directement sous votre habit pour assécher la sueur du dos et de la poitrine.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                ✓ Idéal : Marche, chantiers, marchés, moto
              </div>
            </div>
          </div>

          {/* CARTE 2 : TOUR DE COU */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md flex flex-col hover:-translate-y-1 transition-all duration-200">
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src="/images/turbofan-cou.jpg"
                alt="TurboFan porté en tour de cou"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Mode Tour de Cou
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">Fraîcheur Visage Mains-Libres</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Grâce à son cordon renforcé inclus, portez-le comme un collier. Le ventilo souffle vers le haut pour garder votre visage frais.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                ✓ Idéal : Livreurs, conducteurs, cuisine, bureau
              </div>
            </div>
          </div>

          {/* CARTE 3 : POWERBANK SMARTPHONE */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md flex flex-col hover:-translate-y-1 transition-all duration-200">
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src="/images/turbofan-powerbank.jpg"
                alt="TurboFan servant de batterie externe"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Mode Powerbank
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">Batterie Externe 10 000 mAh</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Ne tombez plus jamais à court de batterie. Branchez votre câble USB pour recharger complètement votre smartphone en urgence.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                ✓ Compatible : iPhone, Android, écouteurs
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ════════════════ COMPARAISON : VENTILATEURS CLASSIQUES VS TURBOFAN ════════════════ */}
      <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
              Pourquoi le TurboFan™ Max écrase les simples éventails ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Un investissement durable et rentable face à la chaleur du Bénin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ventilateurs classiques */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
              <div className="font-bold text-xs uppercase tracking-wider text-rose-700">Ventilateurs Portatifs Ordinaires</div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Batterie faible qui s&apos;éteint après 1h à 2h d&apos;utilisation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Doit être tenu à la main en permanence (fatigant)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Plastique fragile qui casse à la première chute</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Incapable de recharger votre téléphone</span>
                </li>
              </ul>
            </div>

            {/* TurboFan™ Max */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-500 space-y-3 relative">
              <div className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                <span>TurboFan™ Max 3-en-1</span>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">Gagnant</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Batterie 10 000 mAh offrant jusqu&apos;à 24h d&apos;air continu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>100% Mains-Libres (clip de ceinture + tour de cou)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Coque renforcée antichoc et turbine protégée</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Véritable Powerbank de secours pour téléphone</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════ SÉLECTION DES PACKS & FORMULAIRE COD ════════════════ */}
      <section id="commander" className="py-14 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
        
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            Commander au Bénin
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            Sélectionnez votre Pack & Validez votre Livraison
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aucun paiement en ligne requis. Vous vérifiez le colis et payez à la réception.
          </p>
        </div>

        {/* CHOIX DU PACK */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {BUNDLES.map((b) => {
            const isSel = selected.id === b.id;
            return (
              <div
                key={b.id}
                onClick={() => setSelected(b)}
                className={`rounded-2xl p-5 border-2 transition-all duration-150 cursor-pointer relative flex flex-col justify-between ${
                  isSel
                    ? "bg-emerald-50/70 border-emerald-500 shadow-md scale-[1.02]"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {b.badge && (
                  <span className="absolute -top-3 right-4 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {b.badge}
                  </span>
                )}

                <div>
                  <div className="font-bold text-sm text-slate-900 mb-1">{b.name}</div>
                  <div className="text-xs text-slate-500 mb-3">{b.description}</div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                  <div className="font-mono font-extrabold text-lg text-slate-900 tabular-nums">
                    {fmt(b.price)}
                  </div>
                  {b.originalPrice && (
                    <div className="text-xs text-slate-400 line-through font-mono tabular-nums">
                      {fmt(b.originalPrice)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FORMULAIRE DE COMMANDE */}
        <div id="confirmation" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl">
          
          {submitted ? (
            <div className="text-center py-6 sm:py-8 space-y-5 animate-fadeIn max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Commande Enregistrée avec Succès
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
                  Félicitations {name} !
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Votre commande du <strong>{selected.name}</strong> ({fmt(selected.price)}) est bien prise en compte. Notre équipe vous contactera au <strong>{phone}</strong> pour convenir de la remise du colis.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span className="text-slate-400 font-sans">Référence :</span>
                <strong>{orderInfo?.order_number || "CMD-" + Math.floor(100000 + Math.random() * 900000)}</strong>
              </div>

              {/* 3 ÉTAPES CLAIRES */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-5 text-left space-y-2.5 text-xs text-slate-700">
                <div className="font-bold text-[11px] uppercase tracking-wider text-emerald-900 mb-1">
                  Prochaines étapes :
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <div>
                    <span className="font-bold text-slate-900">Appel ou message de confirmation :</span>
                    <p className="text-slate-500 text-[11px]">Notre service logistique vous contacte pour confirmer votre lieu exact.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <div>
                    <span className="font-bold text-slate-900">Livraison express 24h–48h :</span>
                    <p className="text-slate-500 text-[11px]">Le livreur vous apporte votre colis à {city} et environs.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <div>
                    <span className="font-bold text-slate-900">Vérification & Paiement à la réception :</span>
                    <p className="text-slate-500 text-[11px]">Vous vérifiez le colis et payez au livreur en espèces ou Mobile Money.</p>
                  </div>
                </div>
              </div>

              {/* BOUTON WHATSAPP ACCÉLÉRATION */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={`https://wa.me/2290192901817?text=${encodeURIComponent(
                    `Bonjour Isivente ! Je viens de commander le ${selected.name} (${fmt(selected.price)}) pour ${name} (${phone}, ${city}). Réf: ${orderInfo?.order_number || "En cours"}. Je souhaite accélérer et confirmer ma livraison.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                  <span>Accélérer ma livraison sur WhatsApp</span>
                </a>

                <div className="flex items-center justify-center gap-4 pt-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Colis Garanti</span>
                  <span className="flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5 text-emerald-600" /> Paiement à la réception</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
              
              <div className="text-center border-b border-slate-100 pb-4 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Récapitulatif Sélection</span>
                <div className="font-display font-bold text-lg text-slate-900">{selected.name}</div>
                <div className="font-mono font-extrabold text-xl text-emerald-600 tabular-nums">{fmt(selected.price)}</div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold text-center">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Votre Nom Complet *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Brice Houndégbé"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Numéro de Téléphone (Appels & WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : 01 97 00 00 00 / 01 66 00 00 00"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ville de Livraison *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
                  >
                    <option value="Cotonou">Cotonou</option>
                    <option value="Calavi">Abomey-Calavi</option>
                    <option value="Porto-Novo">Porto-Novo</option>
                    <option value="Ouidah">Ouidah</option>
                    <option value="Autre">Autre ville du Bénin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Quartier & Précisions *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex : Fidjrossé, face pharmacie"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRMER MA COMMANDE ({fmt(selected.price)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-center text-slate-400 pt-1">
                🔒 Vos informations sont confidentielles et utilisées uniquement pour votre livraison.
              </div>

            </form>
          )}

        </div>

      </section>

      {/* ════════════════ AVIS CLIENTS ════════════════ */}
      <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
            Ce que disent nos clients au Bénin
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex text-amber-400 text-xs">★★★★★</div>
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

      {/* 📱 STICKY MOBILE BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 px-4 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 max-w-full overflow-hidden">
        <div>
          <div className="text-[10px] text-slate-500 font-bold">Total à la livraison :</div>
          <div className="font-display font-extrabold text-base text-emerald-600 leading-none">
            {fmt(selected.price)}
          </div>
        </div>
        <button
          onClick={handleCtaClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>Commander</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 💬 BOUTON FLOATING WHATSAPP ASSISTANCE (+229 01 92 90 18 17) */}
      <a
        href={`https://wa.me/2290192901817?text=${encodeURIComponent(
          "Bonjour ! J'ai une question concernant le ventilateur TurboFan™ Max 3-en-1."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 md:bottom-6 right-4 z-40 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3.5 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border-2 border-white group"
        title="Besoin d'aide ? Écrivez-nous sur WhatsApp (+229 01 92 90 18 17)"
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          WhatsApp Direct
        </span>
      </a>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-slate-950 text-white py-10 px-4 text-center border-t border-slate-800 space-y-3 pb-24 md:pb-10">
        <div className="font-display font-bold text-base">TurboFan™ Max Bénin</div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Distribué par Isivente • Service client WhatsApp : +229 01 92 90 18 17
        </p>
        <div className="text-[11px] text-slate-500 font-mono">
          © {new Date().getFullYear()} Isivente. Tous droits réservés.
        </div>
      </footer>

    </div>
  );
}
