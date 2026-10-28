"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Sun,
  Moon,
  Car,
  Zap,
  PackageCheck,
  Award,
  ArrowRight,
  Settings2,
  Sparkles,
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackInitiateCheckout, trackAddToCart } from "@/lib/metaPixel";
import { triggerDynamicIsland } from "@/components/features/DynamicIsland";

const PRODUCT_TITLE = "Pare-Soleil Anti-Éblouissement 2-en-1 Jour/Nuit (Vision Claire HD)";
const PRODUCT_PRICE = 14900;
const ORIGINAL_PRICE = 25000;

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: PRODUCT_TITLE,
    subtitle: "Coffret officiel avec clip universel, double écran jour/nuit et garantie Isivente Bénin",
    price: PRODUCT_PRICE,
    originalPrice: ORIGINAL_PRICE,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const HERO_IMAGES = [
  {
    src: "/images/pare-soleil/pare-soleil-reel.jpg",
    alt: "Pare-soleil anti-éblouissement installé en situation réelle dans un véhicule",
  },
  {
    src: "/images/pare-soleil/pare-soleil-hero-2.jpg",
    alt: "Les deux écrans jaune et fumé du pare-soleil avec clip universel",
  },
  {
    src: "/images/pare-soleil/pare-soleil-hero-4.jpg",
    alt: "Un seul accessoire polyvalent pour toutes les situations de conduite",
  },
  {
    src: "/images/pare-soleil/pare-soleil-hero-1.jpg",
    alt: "Double protection visuelle devant le pare-brise",
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
    name: "Prosper K.",
    location: "Cotonou (Fidjrossè)",
    rating: 5,
    date: "Achat vérifié au Bénin",
    title: "Conduite de nuit totalement transformée",
    comment:
      "Les gros phares LED et pleins phares des 4x4 en sens inverse m'aveuglaient complètement sur le tronçon Cotonou-Ouidah. Dès que je baisse l'écran fumé la nuit, l'éblouissement disparaît sans assombrir la route. Le clip tient impeccablement sur le pare-soleil d'origine de ma Corolla.",
    verified: true,
  },
  {
    name: "Reine A.",
    location: "Porto-Novo (Ouando)",
    rating: 5,
    date: "Achat vérifié au Bénin",
    title: "Indispensable contre le soleil rasant du soir",
    comment:
      "Chaque soir au retour du travail, le soleil couchant me tapait en plein dans les yeux. Le pare-soleil classique de ma voiture me bloquait toute la vue. Avec l'écran jaune, je garde une visibilité parfaite sur les motocyclistes et les piétons sans plisser les yeux.",
    verified: true,
  },
  {
    name: "Marcel D.",
    location: "Abomey-Calavi (Akassato)",
    rating: 5,
    date: "Achat vérifié au Bénin",
    title: "Livraison rapide et produit très solide",
    comment:
      "Commandé le matin, livré l'après-midi même. Le livreur m'a laissé ouvrir le paquet et vérifier le clip avant d'encaisser les 14 900 FCFA. Mécanisme de rotation souple et robuste. Très satisfait de mon achat chez Isivente.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Est-ce que le pare-soleil s'adapte à toutes les voitures au Bénin ?",
    a: "Oui, à 100%. Le système de clip extensible universel se glisse directement sur le pare-soleil d'origine de pratiquement tous les véhicules : berlines (Toyota, Honda, Peugeot, Mercedes), SUV, 4x4, monospaces et camionnettes. Aucun outil, aucune colle ni perçage nécessaires.",
  },
  {
    q: "Quelle est la différence entre l'écran jaune et l'écran fumé ?",
    a: "L'écran jaune ambré haute définition est conçu pour la journée : il neutralise la lumière aveuglante du soleil rasant (matin et fin d'après-midi) et améliore les contrastes en cas de pluie ou de poussière. L'écran fumé est spécialement polarisant pour la nuit : il atténue la lumière brutale des pleins phares des véhicules venant d'en face sans masquer les détails de la route.",
  },
  {
    q: "Est-ce légal et sécurisé de conduire avec cet accessoire ?",
    a: "Absolument. Contrairement aux films teintés opaques non homologués, ces écrans transparents filtrants sont un complément direct au pare-soleil d'origine. Ils laissent passer plus de 90% de la lumière utile tout en bloquant l'éblouissement nocif.",
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue en 24h chrono à Cotonou, Calavi et partout au Bénin. Vous payez 14 900 FCFA en espèces uniquement après avoir reçu et inspecté votre colis auprès du livreur. Zéro risque.",
  },
  {
    q: "L'installation est-elle compliquée ?",
    a: "Non, cela prend moins de 30 secondes chrono. Vous écartez le clip souple, vous le fixez sur le pare-soleil de votre voiture, et c'est prêt. Il vous suffit ensuite de faire pivoter l'écran de votre choix d'un simple doigt.",
  },
];

export default function ParesoleilLanding({ slug = "pare-soleil" }: { slug?: string }) {
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
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<"jour" | "nuit">("jour");

  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  const heroNext = useCallback(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), []);
  const heroPrev = useCallback(() => setHeroIndex((i) => (i - 1 + HERO_IMAGES.length) % HERO_IMAGES.length), []);

  // Capture silencieuse du prospect dès 8 chiffres
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        city,
        address,
        product_slug: slug,
        product_title: PRODUCT_TITLE,
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle, slug]);

  useEffect(() => {
    trackViewContent({
      content_name: PRODUCT_TITLE,
      content_ids: [slug, "pare-soleil"],
      value: PRODUCT_PRICE,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: PRODUCT_TITLE,
      content_ids: [slug],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    triggerDynamicIsland({
      title: "Formulaire Express COD",
      subtitle: "Paiement 14 900 F à la livraison • Cotonou, Calavi & Bénin",
      badge: "Prêt",
      price: "14 900 F",
      icon: "shipping",
      duration: 4500,
    });
    document.getElementById("commander")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        product_title: PRODUCT_TITLE,
        product_slug: slug,
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
      markLeadConverted(customerPhone.trim(), slug);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "isivente_last_purchase_meta",
          JSON.stringify({
            title: PRODUCT_TITLE,
            price: selectedBundle.price,
            quantity: 1,
          })
        );
      }
      router.push(
        `/p/${slug}/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(
          customerName.trim()
        )}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`
      );
    } catch (err: any) {
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">

      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Car className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(245,158,11,0.45)] transition-all duration-100 cursor-pointer"
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
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Car className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Sécurité & Confort Auto</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Conduire sans être <span className="text-amber-500">aveuglé</span>{" "}
            — de jour comme <span className="text-slate-600">de nuit.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Deux écrans optiques haute définition sur un clip universel : jaune pour neutraliser le soleil rasant, fumé polarisant pour bloquer les pleins phares.
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AVEC BADGE OFFICIEL ── */}
        <div
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
            {HERO_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === heroIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ))}

            {/* Pastille Prix Officiel */}
            <div className="absolute top-3 right-3 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                14 900 FCFA
              </span>
            </div>

            {/* Flèches de navigation */}
            <button
              onClick={heroPrev}
              aria-label="Image précédente"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={heroNext}
              aria-label="Image suivante"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Miniatures */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {HERO_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  i === heroIndex ? "border-amber-500 shadow-md scale-105" : "border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2 RESPONSIVE) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
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
              <p className="text-[11px] text-slate-500">Échange immédiat en cas d'anomalie</p>
            </div>
          </div>
        </div>

        {/* ── 7. PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug={slug}
            productTitle={PRODUCT_TITLE}
            productImage="/images/pare-soleil/pare-soleil-reel.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Pare-Soleil - ${b.name}`,
                content_ids: [slug, b.id || "solo"],
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
            accentColor="#f59e0b"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. 4 FONCTIONS MAJEURES DU PARE-SOLEIL ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Sécurité Routière Bénin</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              4 atouts majeurs réunis dans un seul accessoire
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une protection visuelle complète adaptée aux conditions de circulation et d'éclairage au Bénin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Sun className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Écran Jaune — Le Jour</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filtre l'éblouissement du soleil rasant du matin et du coucher sans assombrir la chaussée. Idéal pour repérer piétons et nids-de-poule.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <Moon className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Écran Fumé — La Nuit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Absorbe la lumière aveuglante des pleins phares LED des véhicules en sens inverse. Réduit immédiatement la fatigue et le mal de tête.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Settings2 className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pivot Réglable 360°</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ajustez l'angle de chaque écran indépendamment selon votre taille et votre position de conduite pour un alignement optique parfait.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Car className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Clip Sans Perçage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Se fixe en 10 secondes sur votre pare-soleil d'origine. Ne laisse aucune trace, compatible avec toutes les marques de véhicules.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. DÉMONSTRATION EN CONDITION RÉELLE (EXPÉRIENCE AVANT / APRÈS JOUR & NUIT) ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 uppercase tracking-wider px-3 py-1 rounded-full">
              Démonstration Visuelle Réelle
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Voyez la différence de vue en condition réelle
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Plein soleil ou phares en face la nuit : visualisez la transformation immédiate de votre visibilité au volant.
            </p>
          </div>

          {/* Onglets interactifs Jour / Nuit */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveDemoTab("jour")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDemoTab === "jour"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Mode Jour (Écran Jaune)</span>
            </button>
            <button
              onClick={() => setActiveDemoTab("nuit")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDemoTab === "nuit"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Mode Nuit (Écran Fumé)</span>
            </button>
          </div>

          {/* Infographie haute précision Avant / Après Jour & Nuit */}
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            <Image
              src="/images/pare-soleil/pare-soleil-hero-5.jpg"
              alt="Comparaison de la vision avec le pare-soleil 2-en-1 jour et nuit"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 576px"
              loading="lazy"
            />
          </div>

          <div className="max-w-lg mx-auto bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 space-y-1 text-center">
            <p className="font-bold">
              {activeDemoTab === "jour"
                ? "☀️ En plein jour : L'écran jaune filtre les rayons UV et les reflets du bitume sans créer de zone d'ombre aveugle."
                : "🌙 La nuit : L'écran fumé atténue instantanément le faisceau des pleins phares pour garder les yeux détendus."}
            </p>
            <p className="text-amber-800 text-[11px]">Basculez d'un écran à l'autre d'un simple geste selon l'heure de votre trajet.</p>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.97] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander mon pare-soleil (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS (2 CARTES MODERNES FORMAT UMEI) ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Comparatif : Pare-soleil d'origine vs Pare-Soleil 2-en-1 Isivente
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">Pourquoi cet accessoire change radicalement votre sécurité au volant</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pare-soleil ordinaire */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Pare-soleil rabattable d'origine</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Opaque et dangereux</strong> : quand vous le baissez, il masque une partie cruciale de la route et des feux tricolores.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Inutile la nuit</strong> : n'offre aucune solution contre l'aveuglement causé par les phares des véhicules d'en face.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Angle fixe et rigide</strong> : ne peut pas être ajusté précisément en hauteur selon la taille du conducteur.</span>
                </li>
              </ul>
            </div>

            {/* Pare-soleil 2-en-1 Isivente */}
            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/90 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Pare-Soleil Isivente 2-en-1 Jour & Nuit</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold shrink-0">✓</span>
                  <span><strong>Transparence haute définition</strong> : filtre l'éblouissement tout en conservant une vue totale sur la chaussée.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold shrink-0">✓</span>
                  <span><strong>Double protection 24h/24</strong> : l'écran fumé neutralise les pleins phares la nuit pour une conduite sereine.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold shrink-0">✓</span>
                  <span><strong>Installation universelle en 30 secondes</strong> : clip robuste sans outil, adaptable à tous les véhicules au Bénin.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 11. INFOGRAPHIE & GUIDE D'INSTALLATION EN 3 ÉTAPES ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Installation Ultra Simple</span>
            <h3 className="font-bold text-slate-900 text-base sm:text-xl">
              Prêt à l'emploi en 3 gestes, sans aucun outil
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Pas de colle, pas de vis. Le clip s'adapte en douceur sur votre pare-soleil existant.
            </p>
          </div>

          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/pare-soleil/pare-soleil-hero-3.jpg"
              alt="Guide visuel officiel d'installation du pare-soleil 2-en-1"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 576px"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { step: "1", label: "Clipsez", desc: "Glissez le support sur votre pare-soleil d'origine en 5 secondes." },
              { step: "2", label: "Déployez", desc: "Baissez l'écran jaune (jour) ou l'écran fumé (nuit) selon le moment." },
              { step: "3", label: "Ajustez", desc: "Pivotez l'angle pour obtenir la hauteur idéale devant vos yeux." },
            ].map((s) => (
              <div key={s.step} className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3.5 text-center space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-black flex items-center justify-center mx-auto shadow-xs">
                  {s.step}
                </div>
                <div className="font-bold text-sm text-slate-900">{s.label}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX (PILIER 5 THÈME CLAIR / DÉGRADÉ LUMINEUX) ── */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 sm:p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-amber-950/10">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente Bénin
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Pare-Soleil 2-en-1 Jour/Nuit
            </h4>
            <p className="text-amber-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">14 900 FCFA</strong> au lieu de{" "}
              <span className="line-through opacity-75">25 000 FCFA</span>. Paiement à la réception après contrôle.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-amber-900 font-bold text-sm rounded-xl hover:bg-amber-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
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
              <span className="text-slate-500 text-xs">(Avis conducteurs certifiés au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clients conducteurs</h2>
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
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-100">
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
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-amber-600 transition-colors">
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

        {/* ── 15. FOOTER OFFICIEL ISIVENTE ── */}
        <footer className="text-center text-xs text-slate-400 space-y-2 pt-6 border-t border-slate-200">
          <p>© {new Date().getFullYear()} ISIVENTE Bénin - Tous droits réservés.</p>
          <p className="text-[11px]">Boutique officielle de distribution en ligne. Service client disponible 7j/7.</p>
        </footer>
      </main>

      {/* ── 16. BARRE MOBILE STICKY CTA (PILIER 1 & 2) ── */}
      <StickyMobileCtaBar
        price={PRODUCT_PRICE}
        targetSectionId="commander"
        accentColor="#f59e0b"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Pare-Soleil Anti-Éblouissement 2-en-1 Jour/Nuit à 14 900 FCFA."
      />
    </div>
  );
}

