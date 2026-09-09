"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import HorizontalCarousel from "@/components/ui/HorizontalCarousel";
import { getProductUpsellConfig } from "@/lib/upsellConfig";
import {
  Check,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Zap,
  BatteryCharging,
  Clock,
  ShieldCheck,
  PackageCheck,
  Truck,
  UtensilsCrossed,
  CheckCircle2,
  ThumbsUp,
  RotateCw,
  Sparkle,
  BadgeCheck,
} from "lucide-react";

/* ─────────────────────────────────────────── PACKS & DONNÉES DE L'OFFRE */
const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Pack Découverte (1 Éplucheur)",
    quantity: 1,
    price: 14900,
    original_price: 19900,
    popular: true,
  },
  {
    id: "duo",
    name: "Pack Sérénité Duo (2 Éplucheurs)",
    quantity: 2,
    price: 24900,
    original_price: 39800,
    badge: "Offre Spéciale Cadeau (-5 000 F)",
    popular: false,
  },
];

const CAROUSEL_SLIDES = [
  {
    src: "/images/peeler-hero.jpg",
    alt: "ChefPeel™ Pro — Éplucheur Automatique d'Ail, Fruits et Légumes",
    label: "Épluchage Automatique en 1 Seul Clic",
  },
  {
    src: "/images/peeler-usages.jpg",
    alt: "Polyvalence culinaire : Ail, Pommes de terre, Pommes et Légumes",
    label: "Un Appareil, Multiples Usages en Cuisine",
  },
  {
    src: "/images/peeler-avant-apres.jpg",
    alt: "Avant / Après : Gousses intactes sans odeur sur les mains",
    label: "Résultat Impeccable Sans Effort",
  },
  {
    src: "/images/peeler-comment.jpg",
    alt: "Fonctionnement simple en 3 étapes rapides",
    label: "Préparation Rapide en 3 Étapes",
  },
  {
    src: "/images/peeler-pourquoi.jpg",
    alt: "Pourquoi choisir l'éplucheur ChefPeel Pro",
    label: "Moins de Corvées, Plus de Confort",
  },
];

const REVIEWS = [
  {
    name: "Bernadette D.",
    city: "Cotonou (Cadjehoun)",
    stars: 5,
    text: "Éplucher l'ail pour mes marinades et assaisonnements était une véritable corvée avec les odeurs qui restaient sur les doigts. Avec cet éplucheur, en 10 secondes tout un bol d'ail est prêt, propre et intact !",
  },
  {
    name: "Marcelle T.",
    city: "Abomey-Calavi",
    stars: 5,
    text: "Je gagne un temps précieux chaque week-end pour la préparation des repas de famille. Même les pommes de terre et les petits légumes se préparent sans fatigue. C'est un appareil indispensable en cuisine.",
  },
  {
    name: "Sébastien A.",
    city: "Porto-Novo",
    stars: 5,
    text: "J'ai commandé le pack duo pour offrir à ma femme et à ma mère. Elles en sont ravies au quotidien. La batterie tient très bien et la recharge par USB est ultra pratique.",
  },
];

const FAQS = [
  {
    q: "Quels sont les aliments adaptés à cet éplucheur ?",
    a: "L'appareil est optimisé en priorité pour les gousses d'ail (son efficacité par friction est remarquable). Il convient également pour les petites pommes de terre, les pommes, les échalotes et divers petits fruits et légumes fermes.",
  },
  {
    q: "Est-ce que le système abîme ou écrase les gousses d'ail ?",
    a: "Non, absolument pas. Le mécanisme rotatif centrifuge retire délicatement la fine pellicule par frottement contrôlé sans écraser la chair. Vous obtenez des gousses entières, prêtes à être mixées, écrasées ou cuisinées.",
  },
  {
    q: "Quelle est l'autonomie de la batterie et comment la recharger ?",
    a: "L'éplucheur intègre une batterie lithium haute performance de 1300 mAh rechargeable via un câble USB standard (inclus). Une seule charge complète permet d'assurer plusieurs dizaines de sessions d'épluchage (2 à 3 semaines d'utilisation quotidienne standard).",
  },
  {
    q: "Le nettoyage est-il facile au quotidien ?",
    a: "Très facile. Le bol transparent et le plateau intérieur se retirent d'un simple geste et se rincent directement à l'eau claire en moins de 20 secondes.",
  },
  {
    q: "Quels sont les délais de livraison et les modalités de paiement au Bénin ?",
    a: "La livraison est effectuée en 24h à 48h à Cotonou, Abomey-Calavi, Porto-Novo et les communes environnantes. Le paiement s'effectue à 100% à la réception (en espèces ou par Mobile Money MTN / Moov) après vérification de votre colis.",
  },
];

/* ─────────────────────────────────────────── COMPOSANT PRINCIPAL */
export default function PeelerLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<BundleOption>(BUNDLES[0]);
  const [includeBump, setIncludeBump] = useState(false);
  const [includeSecondUnit, setIncludeSecondUnit] = useState(false);
  const upsellConfig = getProductUpsellConfig("peeler");
  const secondUnitOffer = upsellConfig?.secondUnit;
  const bumpOffer = upsellConfig?.bump;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sessionIdRef = useRef<string>("");
  const submittingRef = useRef(false);

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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (id === "commander") {
        setTimeout(() => {
          const input = (document.getElementById("customer-name-input") ||
            el.querySelector("input[type='text'], input[type='tel']")) as HTMLInputElement | null;
          if (input) input.focus({ preventScroll: true });
        }, 400);
      }
    }
  };

  const handleCtaClick = useCallback(() => {
    const sessId = sessionIdRef.current || ("sess_" + Date.now());
    trackUserSession(slug, 0, true, sessId);
    scrollToSection("commander");
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || submitting) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("Veuillez renseigner votre nom, votre numéro de téléphone et votre adresse de livraison.");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const secondUnitPrice = includeSecondUnit && secondUnitOffer ? secondUnitOffer.price : 0;
      const bumpPrice = includeBump && bumpOffer ? bumpOffer.price : 0;
      const finalTotal = selected.price + secondUnitPrice + bumpPrice;
      const finalBundleName = selected.name 
        + (includeSecondUnit && secondUnitOffer ? ` + 2ème Éplucheur (${secondUnitOffer.title})` : "")
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

      const sessId = sessionIdRef.current || ("sess_" + Date.now());
      trackUserSession(slug, 0, true, sessId);

      const orderNum = order?.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
      setOrderInfo({ order_number: orderNum });
      setSubmitted(true);
      setSubmitting(false);

      const upsellCfg = getProductUpsellConfig("peeler");
      if (upsellCfg?.upsell) {
        router.push(`/p/${slug}/upsell?order=${encodeURIComponent(orderNum)}&phone=${encodeURIComponent(phone.trim())}&name=${encodeURIComponent(name.trim())}&total=${encodeURIComponent(String(finalTotal))}`);
      } else {
        router.push(`/p/${slug}/success?order=${encodeURIComponent(orderNum)}&phone=${encodeURIComponent(phone.trim())}&name=${encodeURIComponent(name.trim())}&total=${encodeURIComponent(String(finalTotal))}`);
      }
    } catch {
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-blue-600/20 selection:text-blue-900 font-sans antialiased pb-28 md:pb-0">
      
      {/* ── 1. BANDEAU D'ANNONCE SUPÉRIEUR ── */}
      <div className="bg-[#0A1931] text-white text-[11px] sm:text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 tracking-wide border-b border-white/10">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>LIVRAISON EXPRESS 24H–48H AU BÉNIN • PAIEMENT 100% À LA RÉCEPTION DU COLIS</span>
      </div>

      {/* ── 2. HEADER DE MARQUE ÉPURÉ (FIGMA-GRADE) ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0047AB] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <UtensilsCrossed className="w-4 h-4 text-amber-300 stroke-[2]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900 block leading-none">
                ChefPeel<span className="text-[#0047AB]">™ Pro</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Épluchage Automatique 1-Clic</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCtaClick}
            className="bg-[#0047AB] hover:bg-[#003580] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Commander</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── 3. SECTION HERO : CARROUSEL 5 SLIDES + ACCROCHE ── */}
      <section className="pt-6 md:pt-10 pb-10 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* CARROUSEL D'IMAGES HD */}
          <div className="md:col-span-6 flex flex-col items-center">
            <HorizontalCarousel
              slides={CAROUSEL_SLIDES}
              accentColor="#0047AB"
              autoplayInterval={4500}
            />
          </div>

          {/* ACCROCHE ET PROPOSITION DE VALEUR */}
          <div className="md:col-span-6 space-y-5 text-center md:text-left flex flex-col items-center md:items-start">
            
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1 rounded-full text-xs font-bold text-amber-900 shadow-2xs">
              <div className="flex text-amber-500 text-xs">★★★★★</div>
              <span>4.9/5 (+1 150 cuisinières satisfaites au Bénin)</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-[1.12] text-slate-900 tracking-tight">
              L&apos;épluchage de l&apos;ail, <span className="text-[#0047AB]">plus rapide</span> et <span className="text-amber-600">sans effort.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Fini la corvée d&apos;éplucher les gousses à la main et les odeurs tenaces sur les doigts pendant des jours. En <strong>1 seul clic</strong>, obtenez un ail parfaitement propre, ainsi que vos pommes de terre et petits légumes.
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
                <div className="text-[10px] font-bold uppercase text-slate-400">Colis</div>
                <div className="text-xs font-bold text-slate-800">Vérifié & Testé</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 4. FORMULAIRE DE COMMANDE DIRECT (PLACEMENT PRIORITAIRE FIGMA-GRADE) ── */}
      <UmeiStyleOrderSection
        productSlug={slug}
        productTitle="ChefPeel™ Pro — Éplucheur Automatique Multifonction"
        bundles={BUNDLES}
        selectedBundle={selected}
        onSelectBundle={(b) => setSelected(b as BundleOption)}
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

      {/* ── 5. BANDEAU DE POINTS FORTS (MARQUEE ÉLÉGANT) ── */}
      <div className="bg-[#0A1931] text-white py-3.5 overflow-hidden border-y border-white/10">
        <div className="flex whitespace-nowrap font-mono text-xs sm:text-sm font-semibold tracking-wider">
          <span className="px-4 flex items-center gap-3">
            <span>FINI LES DOIGTS QUI SENTENT L&apos;AIL</span>
            <span className="text-amber-400">✦</span>
            <span>BATTERIE RECHARGEABLE USB 1300 mAh</span>
            <span className="text-amber-400">✦</span>
            <span>AIL, POMMES DE TERRE, LÉGUMES</span>
            <span className="text-amber-400">✦</span>
            <span>LANCEMENT EN 1 SEUL CLIC</span>
            <span className="text-amber-400">✦</span>
            <span>NETTOYAGE EXPRESS EN 20 SECONDES</span>
            <span className="text-amber-400">✦</span>
          </span>
          <span className="px-4 flex items-center gap-3">
            <span>FINI LES DOIGTS QUI SENTENT L&apos;AIL</span>
            <span className="text-amber-400">✦</span>
            <span>BATTERIE RECHARGEABLE USB 1300 mAh</span>
            <span className="text-amber-400">✦</span>
            <span>AIL, POMMES DE TERRE, LÉGUMES</span>
            <span className="text-amber-400">✦</span>
            <span>LANCEMENT EN 1 SEUL CLIC</span>
            <span className="text-amber-400">✦</span>
            <span>NETTOYAGE EXPRESS EN 20 SECONDES</span>
            <span className="text-amber-400">✦</span>
          </span>
        </div>
      </div>

      {/* ── 6. COMPARATIF AVANT / APRÈS : TRANSFORMATION EN CUISINE ── */}
      <section className="py-14 px-4 md:px-8 max-w-5xl mx-auto space-y-10">
        
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Comparatif Réel
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            La fin des corvées interminables en cuisine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Découvrez la différence entre l&apos;épluchage manuel et la technologie ChefPeel™ Pro.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Image Avant/Après */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img
              src="/images/peeler-avant-apres.jpg"
              alt="Avant et Après Épluchage Automatique ChefPeel Pro"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Comparatif textuel détaillé */}
          <div className="space-y-4">
            
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <span>✕ Avant (Épluchage manuel au couteau)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peaux fines collées partout, ongles abîmés, odeur tenace qui persiste pendant plusieurs jours sur les mains et 20 à 30 minutes perdues pour chaque préparation de repas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 border-2 border-[#0047AB] space-y-1">
              <div className="font-bold text-xs uppercase tracking-wider text-[#0047AB] flex items-center gap-1.5">
                <span>✓ Avec ChefPeel™ Pro</span>
                <span className="text-[10px] bg-[#0047AB] text-white px-2 py-0.2 rounded-full">Automatique</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Gousses d&apos;ail impeccables et intactes en moins de 10 secondes, doigts 100% propres sans odeur, zéro gaspillage et plan de travail net.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Gain de temps</div>
                <div className="font-bold text-xs text-slate-800">10x plus rapide</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Hygiène</div>
                <div className="font-bold text-xs text-[#0047AB]">Mains 100% propres</div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ── 7. COMMENT ÇA MARCHE EN 3 ÉTAPES SIMPLES ── */}
      <section className="py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
        
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Simplicité Absolue
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2">
            Comment ça marche ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Seulement 3 étapes simples pour un résultat rapide et parfait à chaque utilisation.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-white">
          <img
            src="/images/peeler-comment.jpg"
            alt="Comment utiliser l'éplucheur ChefPeel Pro en 3 étapes"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">1</span>
            <div className="font-bold text-sm text-slate-900">Déposez vos gousses</div>
            <p className="text-xs text-slate-500">Séparez les gousses d&apos;ail et placez-les directement dans le bol transparent.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">2</span>
            <div className="font-bold text-sm text-slate-900">Appuyez sur le bouton</div>
            <p className="text-xs text-slate-500">Le moteur centrifuge retire délicatement la peau par frottement en quelques secondes.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <span className="w-7 h-7 rounded-full bg-[#0047AB] text-white font-bold text-xs inline-flex items-center justify-center">3</span>
            <div className="font-bold text-sm text-slate-900">Récupérez vos aliments prêts</div>
            <p className="text-xs text-slate-500">Ouvrez le réceptacle : vos gousses sont impeccablement épluchées et prêtes à être cuisinées.</p>
          </div>
        </div>

      </section>

      {/* ── 8. INFOGRAPHIE USAGES MULTIPLES ── */}
      <section className="py-10 px-4 md:px-8 max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-white">
          <img
            src="/images/peeler-usages.jpg"
            alt="Une machine polyvalente pour tous les petits aliments de cuisine"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* ── 9. CONTENU DU COFFRET DÉBALLÉ (UNBOXING) ── */}
      <section className="py-10 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="bg-[#0A1931] text-white rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold bg-sky-950/80 px-3 py-1 rounded-full border border-sky-500/30">
              Pack Cuisine Complet
            </span>
            <h3 className="text-xl font-bold text-white font-display">Dans votre colis ChefPeel™ Pro</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                <span><strong>1x Éplucheur Automatique ChefPeel™ Pro</strong> avec batterie lithium 1300 mAh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                <span><strong>1x Bol rotatif transparent</strong> en silicone alimentaire lavable en 20s</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                <span><strong>1x Plateau centrifuge intérieur</strong> résistant et anti-adhérent</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                <span><strong>1x Câble de recharge rapide USB</strong> compatible tous chargeurs</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/90 border border-white/10 rounded-2xl p-5 text-center space-y-3">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Paiement 100% à la Livraison</div>
            <div className="text-lg font-bold text-white">Livraison 24h & Inspection du Colis</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vérifiez l&apos;appareil et ses accessoires avec le livreur à domicile avant tout règlement.
            </p>
            <button
              type="button"
              onClick={() => scrollToSection("commander")}
              className="w-full bg-[#0047AB] hover:bg-blue-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Commander ChefPeel™ (14 900 FCFA)
            </button>
          </div>
        </div>
      </section>

      {/* ── 10. AVIS CLIENTS VÉRIFIÉS DU BÉNIN ── */}
      <section className="py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Témoignages Vérifiés
          </span>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-2">
            Ce que disent les cuisinières au Bénin
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
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

      {/* ── 11. FOIRE AUX QUESTIONS (ACCORDÉON FLUIDE) ── */}
      <section className="py-12 px-4 md:px-8 max-w-3xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0047AB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Foire Aux Questions
          </span>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-2">
            Questions Fréquentes
          </h3>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((f, i) => (
            <div key={f.q} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 cursor-pointer"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180 text-[#0047AB]" : ""}`} />
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

      {/* ── 12. FOOTER OFFICIEL ── */}
      <footer className="bg-[#0A1931] text-white py-10 px-4 text-center border-t border-white/10 space-y-3 pb-24 md:pb-10">
        <div className="font-display font-bold text-base">ChefPeel™ Pro Bénin</div>
        <p className="text-xs text-slate-300 max-w-sm mx-auto">
          Distribué officiellement par Isivente • Service client WhatsApp : +229 01 92 90 18 17
        </p>
        <div className="text-[11px] text-slate-400 font-mono">
          © {new Date().getFullYear()} Isivente. Tous droits réservés.
        </div>
      </footer>

      {/* ── 13. STICKY MOBILE CTA BAR FIXE ── */}
      <StickyMobileCtaBar
        price={selected.price}
        targetSectionId="commander"
        accentColor="#0047AB"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour ! J'ai une question concernant l'éplucheur automatique ChefPeel Pro."
      />

    </div>
  );
}
