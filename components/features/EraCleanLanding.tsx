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
    src: "/images/eraclean-1.jpg",
    alt: "EraClean — Vue produit studio, aluminium brossé argent",
    label: "Design aluminium premium",
  },
  {
    src: "/images/eraclean-2.jpg",
    alt: "EraClean dans le réfrigérateur avec légumes frais",
    label: "Parfait pour le frigo",
  },
  {
    src: "/images/eraclean-3.jpg",
    alt: "EraClean dans la salle de bain, LED bleue active",
    label: "Polyvalent : WC & salle de bain",
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
    q: "Est-ce que ça fonctionne vraiment sur les odeurs de piment et poisson fumé ?",
    a: "Oui. L'ozone produit par micro-décharges électriques oxyde et neutralise les molécules odorantes à la source — piment, poisson fumé, condiments, humidité. Résultats visibles en 24 à 48 heures.",
  },
  {
    q: "Comment recharger l'appareil ?",
    a: "Avec n'importe quel câble USB-C (inclus). Une charge complète dure 8 à 12 heures de fonctionnement. Zéro cartouche, zéro frais récurrents.",
  },
  {
    q: "Peut-on l'utiliser dans la voiture ou une armoire à chaussures ?",
    a: "Absolument. L'EraClean fonctionne dans tout espace fermé : réfrigérateur, WC, armoire, voiture, vestiaire. C'est sa polyvalence qui en fait un indispensable.",
  },
  {
    q: "Comment se passe la livraison et le paiement ?",
    a: "Livraison sous 24 à 72 heures à Cotonou, Calavi et Porto-Novo. Vous payez en espèces ou par Mobile Money (MTN MoMo / Moov) à la réception du colis. Aucun paiement avant livraison.",
  },
  {
    q: "Est-ce dangereux pour les aliments ou la santé ?",
    a: "Non. La concentration d'ozone produite est inférieure aux seuils réglementaires et se dissipe naturellement en quelques minutes. L'appareil est certifié pour un usage alimentaire.",
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
      await saveNewOrder({
        product_slug: slug,
        product_title: "Purificateur d'Air & Anti-Odeurs EraClean",
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
      window.location.href = `/p/${slug}/success`;
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
      <section className="pt-8 md:pt-16 pb-0 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">

          {/* LEFT — copy */}
          <div className="md:col-span-6 space-y-5 text-center md:text-left">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border mx-auto md:mx-0"
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

            {/* Badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {["Paiement à la livraison", "Livraison 24–72h", "100% Rechargeable USB"].map((b) => (
                <span
                  key={b}
                  className="text-xs font-semibold py-1.5 px-3 rounded-full border"
                  style={{ background: "white", borderColor: `${C.accent}20`, color: C.text }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — Carousel */}
          <div id="carousel" className="md:col-span-6">
            <div className="relative w-full max-w-sm mx-auto select-none">
              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square bg-white">
                <img
                  key={slide}
                  src={CAROUSEL_SLIDES[slide].src}
                  alt={CAROUSEL_SLIDES[slide].alt}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: isAnimating ? 0 : 1 }}
                />

                {/* Prev / Next */}
                <button
                  onClick={() => { if (autoplayRef.current) clearInterval(autoplayRef.current); goToSlide(slide - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.92)" }}
                  aria-label="Précédent"
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: C.dark }} />
                </button>
                <button
                  onClick={() => { if (autoplayRef.current) clearInterval(autoplayRef.current); goToSlide(slide + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.92)" }}
                  aria-label="Suivant"
                >
                  <ChevronRight className="w-5 h-5" style={{ color: C.dark }} />
                </button>

                {/* Label */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md whitespace-nowrap"
                  style={{ background: "rgba(15,23,42,0.65)", color: "white" }}
                >
                  {CAROUSEL_SLIDES[slide].label}
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {CAROUSEL_SLIDES.map((_, i) => (
                  <button
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

              {/* Thumbnails */}
              <div className="flex gap-2 mt-3 justify-center">
                {CAROUSEL_SLIDES.map((s, i) => (
                  <button
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

      {/* ════════════════ VIDÉO PLACEHOLDER ════════════════ */}
      <section id="comment" className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Démonstration</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight" style={{ color: C.dark }}>
            Voyez l&apos;EraClean en action
          </h2>
          <p className="mt-2 text-sm md:text-base" style={{ color: C.muted }}>
            Comment les micro-décharges d&apos;ozone neutralisent les odeurs en profondeur.
          </p>
        </div>

        {/* Video placeholder card */}
        <div
          className="relative rounded-3xl overflow-hidden aspect-video flex items-center justify-center shadow-xl border"
          style={{ background: C.dark, borderColor: `${C.accent}30` }}
        >
          <img
            src="/images/eraclean-2.jpg"
            alt="Aperçu vidéo EraClean"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              style={{ background: C.accent }}
            >
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
            <span className="text-white text-sm font-semibold opacity-80">Vidéo de démonstration — bientôt disponible</span>
          </div>
        </div>
      </section>

      {/* ════════════════ BÉNÉFICES ════════════════ */}
      <section
        className="py-16 px-4 md:px-8"
        style={{ background: "white" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.accent }}>Pourquoi EraClean</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight" style={{ color: C.dark }}>
              Pas juste un désodorisant. Une technologie.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Wind, title: "Neutralisation totale", desc: "Élimine poisson fumé, piment, humidité à la source par oxydation ozone." },
              { icon: RefreshCw, title: "Conservation 2× plus longue", desc: "Détruit les bactéries responsables du pourrissement. Moins de gaspillage." },
              { icon: Usb, title: "Rechargeable USB — 0 recharge", desc: "Pas de cartouche à racheter. Un câble USB-C suffit. Fonctionnel indéfiniment." },
              { icon: Zap, title: "Technologie ozone active", desc: "Micro-décharges électriques produisant de l'ozone — certifié alimentaire." },
              { icon: ShieldCheck, title: "2-en-1 : frigo & WC", desc: "Fonctionne partout : réfrigérateur, WC, armoire à chaussures, voiture." },
              { icon: Star, title: "COD Bénin — MTN / Moov", desc: "Paiement à la livraison. Espèces ou Mobile Money. Aucune avance requise." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="rounded-2xl p-5 border flex gap-4 items-start"
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
