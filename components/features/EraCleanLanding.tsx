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
  Zap,
  RefreshCw,
  ShieldCheck,
  Usb,
  Star,
  Play,
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
    name: "Pack Solo",
    quantity: 1,
    price: 19900,
    originalPrice: 24900,
    savings: null,
    badge: null,
    description: "Pour purifier ton réfrigérateur principal",
    popular: false,
    freeShipping: false,
  },
  {
    id: "duo",
    name: "Pack Duo Frigo + WC",
    quantity: 2,
    price: 32900,
    originalPrice: 39800,
    savings: 6900,
    badge: "Best-Seller",
    description: "Un pour le frigo, un pour les WC ou la salle de bain",
    popular: true,
    freeShipping: false,
  },
  {
    id: "famille",
    name: "Pack Grand Ménage",
    quantity: 3,
    price: 44900,
    originalPrice: 59700,
    savings: 14800,
    badge: "Livraison offerte",
    description: "Frigo + WC + Armoire ou voiture. Meilleur tarif à l'unité.",
    popular: false,
    freeShipping: true,
  },
];

const CAROUSEL_SLIDES = [
  {
    src: "/images/eraclean-studio.jpg",
    alt: "Purificateur EraClean™ — Finition aluminium brossé premium",
    label: "Design aluminium brossé",
  },
  {
    src: "/images/eraclean-frigo.jpg",
    alt: "EraClean™ dans le réfrigérateur avec légumes frais",
    label: "1. Réfrigérateur & Aliments",
  },
  {
    src: "/images/eraclean-sdb.jpg",
    alt: "EraClean™ en salle de bain avec diffusion active d'ozone",
    label: "2. Salle de bain & WC",
  },
  {
    src: "/images/eraclean-voiture.jpg",
    alt: "EraClean™ dans l'habitacle d'une voiture",
    label: "3. Habitacle Voiture",
  },
  {
    src: "/images/eraclean-dressing.jpg",
    alt: "EraClean™ dans un dressing et armoire à vêtements",
    label: "4. Dressing & Chaussures",
  },
];

const REVIEWS = [
  {
    name: "Fatoumata D.",
    city: "Cotonou",
    stars: 5,
    text: "Mon frigo ne sent plus le poisson fumé. La différence après 2 jours était flagrante. Je recommande à toutes mes voisines.",
  },
  {
    name: "Roseline A.",
    city: "Calavi",
    stars: 5,
    text: "J'avais peur que ça ne marche pas mais mes légumes durent vraiment plus longtemps. Plus de gaspillage, ça vaut vraiment son prix.",
  },
  {
    name: "Mariette K.",
    city: "Porto-Novo",
    stars: 5,
    text: "J'en ai pris 2 : un pour le frigo, un pour mes toilettes. Les odeurs de piment ont disparu. Livraison rapide, paiement à la réception.",
  },
];

const FAQS = [
  {
    q: "Quelle est la durée de vie réelle de l'appareil ?",
    a: "L'appareil est garanti pour plus de 10 ans d'utilisation. Son module de décharges électriques à froid est inusable et ne nécessite aucun filtre, pastille ni cartouche à remplacer.",
  },
  {
    q: "Est-ce que ça fonctionne vraiment sur les odeurs fortes (piment, poisson fumé, humidité) ?",
    a: "Oui. Contrairement aux désodorisants qui masquent les odeurs avec des parfums chimiques, l'ozone oxyde et détruit directement 99.8% des molécules odorantes et des bactéries à la source. Résultats nets en 24h.",
  },
  {
    q: "Comment recharger l'appareil et quelle est son autonomie ?",
    a: "Grâce à son câble USB-C fourni, une charge complète de 2h offre jusqu'à 30 jours de fonctionnement continu en mode veille automatique.",
  },
  {
    q: "Peut-on l'utiliser dans la voiture, les WC ou une armoire à chaussures ?",
    a: "Absolument. L'EraClean s'utilise dans tout espace confiné jusqu'à 10m³ : réfrigérateur, toilettes, dressing à chaussures, placard ou habitacle de voiture.",
  },
  {
    q: "Comment se déroule la livraison au Bénin ?",
    a: "Livraison express en 24h à 48h à Cotonou, Calavi, Porto-Novo et environs. Vous payez en espèces ou via Mobile Money (MTN MoMo / Moov) uniquement après vérification du colis à la livraison.",
  },
  {
    q: "Est-ce sans danger pour les aliments ?",
    a: "Totalement. La micro-émission d'ozone est strictement calibrée selon les normes de sécurité alimentaire et se retransforme en oxygène naturel sans laisser aucun résidu.",
  },
];

/* ─────────────────────────────────────────── HELPERS */
const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

/* ─────────────────────────────────────────── COMPONENT */
export default function EraCleanLanding({ slug }: { slug: string }) {
  const [selected, setSelected] = useState<Bundle>(BUNDLES[1]);
  const [slide, setSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ID de session stable — généré UNE SEULE FOIS au montage du composant
  const sessionIdRef = useRef(
    "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8)
  );
  const startTimeRef = useRef(Date.now());
  const clickedRef = useRef(false);

  useEffect(() => {
    const save = () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      trackUserSession(slug, duration, clickedRef.current, sessionIdRef.current);
    };

    window.addEventListener("beforeunload", save);
    return () => {
      save(); // cleanup React (navigation SPA)
      window.removeEventListener("beforeunload", save);
    };
  }, [slug]);

  const goToSlide = useCallback(
    (idx: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setSlide((idx + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
      setTimeout(() => setIsAnimating(false), 350);
    },
    [isAnimating]
  );

  /* Auto-play */
  useEffect(() => {
    autoplayRef.current = setInterval(() => goToSlide(slide + 1), 4500);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [slide, goToSlide]);

  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.trim().length < 8) {
      alert("Numéro de téléphone invalide.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await saveNewOrder({
        product_slug: "eraclean",
        product_title: "Purificateur d'Air & Anti-Odeurs EraClean™",
        bundle_id: selected.id,
        bundle_name: selected.name,
        quantity: selected.quantity,
        total_amount: selected.price,
        customer_name: name,
        customer_phone: phone + (phone2 ? ` / ${phone2}` : ""),
        shipping_city: city,
        city,
        shipping_address: address,
        address,
        status: "pending" as const,
      });
      // Marquer la session comme cliquée (conversion)
      clickedRef.current = true;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      await trackUserSession(slug, duration, true, sessionIdRef.current);
      const orderNum = res?.order_number || "";
      window.location.href = `/p/${slug}/upsell?order=${encodeURIComponent(orderNum)}&phone=${encodeURIComponent(phone)}`;
    } catch {
      alert("Erreur. Veuillez réessayer.");
      setSubmitting(false);
    }
  };

  /* ─── PALETTE tokens */
  const C = {
    bg: "#EFF6FF",        // bleu glacier très clair
    bgAlt: "#DBEAFE",     // bleu très léger
    dark: "#0F172A",
    mid: "#1E40AF",       // bleu marine
    accent: "#2563EB",    // bleu primaire
    accentLight: "#3B82F6",
    silver: "#F1F5F9",
    text: "#334155",
    muted: "#64748B",
  };

  return (
    <div
      style={{ background: C.bg, color: C.dark }}
      className="min-h-screen font-sans antialiased overflow-x-hidden pb-24 md:pb-0"
    >
      {/* ════════════════ HEADER ════════════════ */}
      <header
        style={{ background: `${C.bg}f2`, borderColor: `${C.mid}22` }}
        className="sticky top-0 z-50 backdrop-blur-md border-b"
      >
        <nav className="flex items-center justify-between py-3.5 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="font-display text-xl font-extrabold flex items-center gap-2 tracking-tight">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ background: C.accent }}
            />
            <span style={{ color: C.dark }}>EraClean</span>
          </div>

          <ul className="hidden md:flex gap-7 text-sm font-semibold" style={{ color: C.muted }}>
            {[["Carrousel", "carousel"], ["Comment ça marche", "comment"], ["Avis", "avis"], ["FAQ", "faq"]].map(([label, id]) => (
              <li key={id}>
                <button
                  onClick={() => scroll(id)}
                  className="hover:opacity-100 opacity-70 transition-opacity"
                  style={{ color: C.dark }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => scroll("commander")}
            style={{ background: C.accent }}
            className="text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all cursor-pointer"
          >
            Commander
          </button>
        </nav>
      </header>

      {/* ════════════════ HERO ════════════════ */}
      <section className="pt-6 md:pt-14 pb-0 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">

          {/* 1. VISUEL PRODUIT & CARROUSEL (EN PREMIER) */}
          <div id="carousel" className="md:col-span-6 order-1">
            <div className="relative w-full max-w-sm mx-auto select-none">
              {/* Badge flottant sur le carrousel */}
              <div
                className="inline-flex md:hidden items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-3 bg-white shadow-xs"
                style={{ borderColor: `${C.accent}30`, color: C.dark }}
              >
                <div className="flex text-amber-400">★★★★★</div>
                <span>4.9 / 5 · +340 clients satisfaits</span>
              </div>

              {/* Image principale */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square bg-white border border-slate-200/60">
                <img
                  key={slide}
                  src={CAROUSEL_SLIDES[slide].src}
                  alt={CAROUSEL_SLIDES[slide].alt}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: isAnimating ? 0 : 1 }}
                />

                {/* Boutons Précédent / Suivant */}
                <button
                  type="button"
                  onClick={() => { if (autoplayRef.current) clearInterval(autoplayRef.current); goToSlide(slide - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.92)" }}
                  aria-label="Précédent"
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: C.dark }} />
                </button>
                <button
                  type="button"
                  onClick={() => { if (autoplayRef.current) clearInterval(autoplayRef.current); goToSlide(slide + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.92)" }}
                  aria-label="Suivant"
                >
                  <ChevronRight className="w-5 h-5" style={{ color: C.dark }} />
                </button>

                {/* Label indicatif */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md whitespace-nowrap"
                  style={{ background: "rgba(15,23,42,0.65)", color: "white" }}
                >
                  {CAROUSEL_SLIDES[slide].label}
                </div>
              </div>

              {/* Indicateurs points (Dots) */}
              <div className="flex justify-center gap-2 mt-4">
                {CAROUSEL_SLIDES.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => { if (autoplayRef.current) clearInterval(autoplayRef.current); goToSlide(i); }}
                    className="rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      width: i === slide ? 24 : 8,
                      height: 8,
                      background: i === slide ? C.accent : `${C.accent}35`,
                    }}
                    aria-label={`Diapositive ${i + 1}`}
                  />
                ))}
              </div>

              {/* Miniatures cliquables */}
              <div className="flex gap-2 mt-3 justify-center">
                {CAROUSEL_SLIDES.map((s, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => { if (autoplayRef.current) clearInterval(autoplayRef.current); goToSlide(i); }}
                    className="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer"
                    style={{ borderColor: i === slide ? C.accent : "transparent", opacity: i === slide ? 1 : 0.55 }}
                    aria-label={s.alt}
                  >
                    <img src={s.src} alt={s.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. TEXTES & ARGUMENTS DE VENTE (EN DEUXIÈME) */}
          <div className="md:col-span-6 space-y-5 text-center md:text-left order-2">
            <div
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border"
              style={{ background: "white", borderColor: `${C.accent}30`, color: C.dark }}
            >
              <div className="flex text-amber-400">★★★★★</div>
              <span>4.9 / 5 · +340 clients satisfaits</span>
            </div>

            <h1
              className="font-display font-bold text-3xl sm:text-4xl md:text-5xl leading-tight tracking-tight"
              style={{ color: C.dark }}
            >
              Ton frigo sent{" "}
              <span style={{ color: C.accent }}>toujours le poisson</span>{" "}
              ou le piment ?
            </h1>

            <p className="text-base md:text-lg font-medium leading-relaxed" style={{ color: C.text }}>
              Le purificateur EraClean neutralise les odeurs et conserve tes aliments{" "}
              <strong>2× plus longtemps</strong> — sans cartouche, sans frais cachés. Rechargeable USB.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-1">
              <button
                onClick={() => scroll("commander")}
                style={{ background: C.accent }}
                className="text-white px-7 py-3.5 rounded-full font-bold text-base shadow-xl hover:-translate-y-0.5 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Je commande — {fmt(19900)}</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>
              <button
                onClick={() => scroll("comment")}
                className="border font-bold text-sm px-6 py-3.5 rounded-full hover:-translate-y-0.5 active:scale-[0.97] transition-all"
                style={{ borderColor: `${C.mid}30`, color: C.dark, background: "white" }}
              >
                Comment ça marche
              </button>
            </div>

            {/* Badges de réassurance */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {["💵 Paiement à la livraison", "🚚 Livraison 24h–48h", "⚡ 100% Rechargeable USB"].map((b) => (
                <span
                  key={b}
                  className="text-xs font-semibold py-1.5 px-3 rounded-full border shadow-xs"
                  style={{ background: "white", borderColor: `${C.accent}20`, color: C.text }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Marquee */}
        <div
          className="overflow-hidden mt-10 rounded-xl py-3"
          style={{ background: C.mid }}
        >
          <div className="flex whitespace-nowrap animate-marquee font-display font-semibold text-sm text-white">
            {[0, 1].map((k) => (
              <span key={k} className="px-4 flex items-center gap-4">
                {["OZONE ACTIF", "100% USB", "ZÉRO ODEUR", "CONSERVATION 2×", "USAGE POLYVALENT", "COD BÉNIN"].map((t) => (
                  <React.Fragment key={t}>
                    <span>{t}</span>
                    <span style={{ color: "#93C5FD" }}>✺</span>
                  </React.Fragment>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ VIDÉO DÉMONSTRATION RÉELLE ════════════════ */}
      <section id="comment" className="py-14 md:py-20 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Démonstration Vidéo</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight" style={{ color: C.dark }}>
            Voyez l&apos;EraClean en action réelle
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base max-w-lg mx-auto" style={{ color: C.muted }}>
            Regardez comment le purificateur assainit et neutralise les odeurs instantanément.
          </p>
        </div>

        {/* Lecteur Vidéo Réel */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl border bg-slate-900 aspect-video max-w-3xl mx-auto"
          style={{ borderColor: `${C.accent}30` }}
        >
          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Test en direct</span>
          </div>

          <video
            src="/videos/eraclean-demo.mp4"
            poster="/images/eraclean-2.jpg"
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          >
            Votre navigateur ne supporte pas la lecture de vidéo HTML5.
          </video>
        </div>
      </section>

      {/* ════════════════ BÉNÉFICES ════════════════ */}
      {/* ════════════════ BÉNÉFICES & 10 ANS DE DURÉE DE VIE ════════════════ */}
      <section
        className="py-16 px-4 md:px-8"
        style={{ background: "white" }}
      >
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Header bénéfices */}
          <div>
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Technologie Sans Consommable</p>
              <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight" style={{ color: C.dark }}>
                10 ans d&apos;utilisation continue. Zéro filtre à racheter.
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
                Contrairement aux charbons et désodorisants jetables, le module d&apos;ozone à décharge solide est inusable et fonctionne pendant plus de 10 ans.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: ShieldCheck, title: "10 ans de durée de vie", desc: "Module à micro-décharges inusable. Un seul investissement pour une décennie de tranquillité." },
                { icon: Wind, title: "Neutralisation totale", desc: "Élimine poisson fumé, piment, humidité à la source par oxydation d'ozone actif." },
                { icon: RefreshCw, title: "Conservation 2× plus longue", desc: "Détruit 99.8% des bactéries responsables du pourrissement prématuré des légumes et fruits." },
                { icon: Usb, title: "100% Rechargeable USB-C", desc: "Zéro cartouche, zéro produit chimique. Une charge complète assure jusqu'à 30 jours en mode veille." },
                { icon: Zap, title: "Certifié alimentaire & sain", desc: "Sans danger pour la santé et les aliments. L'ozone se transforme naturellement en oxygène pur." },
                { icon: Star, title: "Paiement COD au Bénin", desc: "Livraison 24h–48h à Cotonou, Calavi et Porto-Novo. Vous réglez à la réception." },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="rounded-2xl p-5 border flex gap-4 items-start hover:-translate-y-0.5 transition-all duration-200"
                  style={{
                    background: C.silver,
                    borderColor: `${C.accent}15`,
                    animationDelay: `${i * 35}ms`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${C.accent}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: C.accent }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: C.dark }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════ TABLEAU COMPARATIF : ÉCONOMIES SUR 10 ANS ════════ */}
          <div className="rounded-3xl p-6 sm:p-8 border shadow-lg" style={{ background: C.silver, borderColor: `${C.accent}20` }}>
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white mb-2" style={{ background: C.accent }}>
                Calcul de Rentabilité
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl" style={{ color: C.dark }}>
                Pourquoi continuer à jeter votre argent chaque mois ?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Comparatif réel des coûts sur 10 ans d&apos;utilisation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option Classique Perdante */}
              <div className="bg-white rounded-2xl p-5 border border-rose-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Méthodes Jetables</span>
                  <span className="text-xs text-rose-500 font-semibold font-mono">❌ Coûteux & Inefficace</span>
                </div>
                <div className="font-bold text-base text-slate-800">Désodorisants chimiques & Charbons</div>
                <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Masque temporairement l&apos;odeur sans détruire les bactéries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Nécessite de racheter des recharges tous les mois (~3 000 F/mois)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Ne prolonge pas la durée de vie des aliments au frigo</span>
                  </li>
                </ul>
                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Coût estimé sur 10 ans :</span>
                  <span className="font-mono font-bold text-base text-rose-600 tabular-nums">~360 000 FCFA</span>
                </div>
              </div>

              {/* Option Gagnante EraClean */}
              <div className="rounded-2xl p-5 border-2 space-y-3 relative shadow-md" style={{ background: "white", borderColor: C.accent }}>
                <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Choix Intelligent
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.accent }}>Technologie EraClean™</span>
                  <span className="text-xs text-emerald-600 font-semibold font-mono">✓ Rentabilisé en 2 mois</span>
                </div>
                <div className="font-bold text-base" style={{ color: C.dark }}>Purificateur Ozone 10 Ans</div>
                <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Détruit 99.8% des odeurs et bactéries</strong> à la source</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Zéro dépense supplémentaire</strong> pendant 10 ans (100% USB)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Garde les fruits & légumes frais 2× plus longtemps</strong></span>
                  </li>
                </ul>
                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Paiement unique à vie :</span>
                  <span className="font-mono font-bold text-lg text-emerald-600 tabular-nums">19 900 FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════ 4 ZONES D'UTILISATION AVEC VRAIES PHOTOS ════════ */}
          <div>
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.accent }}>Un Seul Appareil, 4 Usages Indispensables</p>
              <h3 className="font-display font-bold text-xl sm:text-2xl" style={{ color: C.dark }}>
                Où utiliser votre purificateur EraClean™ ?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
                Compact, rechargeable et autonome : déplacez-le partout selon vos besoins du moment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  img: "/images/eraclean-frigo.jpg",
                  label: "1. Réfrigérateur", 
                  desc: "Neutralise poisson fumé, piment et prolonge la fraîcheur des légumes.", 
                  badge: "Anti-odeurs 24h"
                },
                { 
                  img: "/images/eraclean-sdb.jpg",
                  label: "2. Salle de bain & WC", 
                  desc: "Élimine les odeurs d'humidité, d'égout et de canalisation en continu.", 
                  badge: "Air assaini"
                },
                { 
                  img: "/images/eraclean-dressing.jpg",
                  label: "3. Dressing & Armoire", 
                  desc: "Détruit les bactéries de transpiration et évite l'odeur de moisi.", 
                  badge: "Fraîcheur linge"
                },
                { 
                  img: "/images/eraclean-voiture.jpg",
                  label: "4. Habitacle Voiture", 
                  desc: "Assainit l'air confiné, la clim et les odeurs persistantes dans l'auto.", 
                  badge: "Anti-air confiné"
                },
              ].map((zone) => (
                <div
                  key={zone.label}
                  className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-sm flex flex-col hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={zone.img}
                      alt={zone.label}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {zone.badge}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-sm mb-1" style={{ color: C.dark }}>{zone.label}</div>
                      <p className="text-xs leading-relaxed text-slate-600">{zone.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════ CONTENU DU COFFRET ════════ */}
          <div className="border-t border-slate-200/80 pt-10">
            <div className="bg-white rounded-2xl p-6 border flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderColor: `${C.accent}20` }}>
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contenu du Colis</span>
                <h4 className="font-display font-bold text-lg" style={{ color: C.dark }}>Ce que vous recevez à la livraison :</h4>
                <p className="text-xs text-slate-500">Votre colis est scellé et vérifiable devant le livreur avant paiement.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                {[
                  "1x Purificateur EraClean™ Alu",
                  "1x Câble USB-C renforcé",
                  "1x Manuel d'utilisation FR",
                  "1x Garantie Sérénité 10 ans",
                ].map((item) => (
                  <div key={item} className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-center text-xs font-semibold text-slate-700 flex items-center justify-center">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════ PACKS (COMMANDER) ════════════════ */}
      <section id="commander" className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Choisissez votre pack</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight" style={{ color: C.dark }}>
            Commandez maintenant — Livraison COD
          </h2>
          <p className="mt-2 text-sm" style={{ color: C.muted }}>
            Vous payez uniquement à la réception. Espèces ou Mobile Money.
          </p>
        </div>

        {/* Bundle cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {BUNDLES.map((b) => {
            const active = selected.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelected(b)}
                className="relative text-left rounded-2xl p-5 border-2 transition-all cursor-pointer active:scale-[0.97]"
                style={{
                  borderColor: active ? C.accent : `${C.mid}20`,
                  background: active ? `${C.accent}08` : "white",
                  boxShadow: active ? `0 0 0 2px ${C.accent}40, 0 8px 24px -8px ${C.accent}30` : "none",
                }}
              >
                {b.badge && (
                  <span
                    className="absolute -top-3 left-4 text-[11px] font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: b.popular ? C.accent : "#10B981" }}
                  >
                    {b.badge}
                  </span>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0"
                    style={{ borderColor: active ? C.accent : `${C.mid}40` }}
                  >
                    {active && <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.accent }} />}
                  </div>
                </div>

                <p className="font-bold text-base mb-1" style={{ color: C.dark }}>{b.name}</p>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: C.muted }}>{b.description}</p>

                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-bold text-xl tabular-nums" style={{ color: C.accent }}>
                    {fmt(b.price)}
                  </span>
                  <span className="text-xs line-through" style={{ color: C.muted }}>
                    {fmt(b.originalPrice)}
                  </span>
                </div>

                {b.savings && (
                  <p className="text-xs font-semibold mt-1" style={{ color: "#10B981" }}>
                    Économie de {fmt(b.savings)}
                  </p>
                )}
                {b.freeShipping && (
                  <p className="text-xs font-semibold mt-1" style={{ color: "#10B981" }}>
                    + Livraison offerte
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* ORDER FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-6 md:p-8 border shadow-xl"
          style={{ background: "white", borderColor: `${C.accent}15` }}
        >
          <h3 className="font-display font-bold text-lg mb-1" style={{ color: C.dark }}>
            Pack sélectionné :{" "}
            <span style={{ color: C.accent }}>{selected.name}</span>
          </h3>
          <p className="text-sm mb-6" style={{ color: C.muted }}>
            Total :{" "}
            <span className="font-mono font-bold tabular-nums" style={{ color: C.dark }}>
              {fmt(selected.price)}
            </span>{" "}
            · Paiement à la livraison
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Prénom & Nom", val: name, set: setName, type: "text", placeholder: "Ex: Mariette Ahounou", required: false },
              { label: "Téléphone principal *", val: phone, set: setPhone, type: "tel", placeholder: "Ex: 97 00 00 00", required: true },
              { label: "Téléphone secondaire (optionnel)", val: phone2, set: setPhone2, type: "tel", placeholder: "Ex: 61 00 00 00", required: false },
              { label: "Ville *", val: city, set: setCity, type: "text", placeholder: "Cotonou / Calavi / Porto-Novo", required: true },
            ].map(({ label, val, set, type, placeholder, required }) => (
              <div key={label}>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.text }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  required={required}
                  className="w-full rounded-xl px-4 py-3 text-sm border outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: `${C.mid}25`,
                    background: C.silver,
                    color: C.dark,
                  }}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.text }}>
                Quartier / Adresse de livraison *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Quartier Aidjèdo, près du marché"
                required
                className="w-full rounded-xl px-4 py-3 text-sm border outline-none focus:ring-2 transition-all"
                style={{ borderColor: `${C.mid}25`, background: C.silver, color: C.dark }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ background: submitting ? C.muted : C.accent }}
            className="mt-6 w-full text-white py-4 rounded-2xl font-bold text-base shadow-xl hover:-translate-y-0.5 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span>Enregistrement…</span>
            ) : (
              <>
                <span>Confirmer ma commande — {fmt(selected.price)}</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </>
            )}
          </button>

          <p className="text-center text-xs mt-3" style={{ color: C.muted }}>
            Vous serez contacté(e) dans les 24h pour confirmer la livraison.
          </p>
        </form>
      </section>

      {/* ════════════════ AVIS ════════════════ */}
      <section id="avis" className="py-16 px-4 md:px-8" style={{ background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Témoignages</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight" style={{ color: C.dark }}>
              Ce qu&apos;en disent nos clients
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 border"
                style={{
                  background: C.silver,
                  borderColor: `${C.accent}15`,
                  animationDelay: `${i * 35}ms`,
                }}
              >
                <div className="flex text-amber-400 text-sm mb-3">
                  {"★".repeat(r.stars)}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: C.text }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: C.accent }}
                  >
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: C.dark }}>{r.name}</p>
                    <p className="text-xs" style={{ color: C.muted }}>{r.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section id="faq" className="py-16 px-4 md:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Questions fréquentes</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight" style={{ color: C.dark }}>
            Tout ce que vous devez savoir
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: `${C.accent}20`, background: "white" }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold text-sm pr-4" style={{ color: C.dark }}>{f.q}</span>
                <ChevronDown
                  className="w-5 h-5 shrink-0 transition-transform duration-200"
                  style={{
                    color: C.accent,
                    transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: C.muted }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ CTA FINAL ════════════════ */}
      <section
        className="py-16 px-4 md:px-8"
        style={{ background: C.mid }}
      >
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
            Commandez maintenant — Livraison à Cotonou, Calavi & Porto-Novo
          </h2>
          <p className="text-sm text-blue-200">
            Paiement à la réception · Espèces ou MTN MoMo / Moov
          </p>
          <button
            onClick={() => scroll("commander")}
            className="bg-white font-bold px-8 py-4 rounded-full text-base shadow-xl hover:-translate-y-0.5 active:scale-[0.97] transition-all inline-flex items-center gap-2 cursor-pointer"
            style={{ color: C.mid }}
          >
            <span>Je commande — {fmt(19900)}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex justify-center flex-wrap gap-3 pt-2">
            {["Paiement COD", "Livraison rapide", "Sans engagement"].map((b) => (
              <span key={b} className="text-xs text-blue-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ STICKY MOBILE CTA ════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-4 pt-2" style={{ background: `${C.bg}f5`, backdropFilter: "blur(12px)" }}>
        <button
          onClick={() => scroll("commander")}
          style={{ background: C.accent }}
          className="w-full text-white py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-[0.97] transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Commander — {fmt(selected.price)}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
