"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Leaf,
  Heart,
  PackageCheck,
  ArrowRight,
  Activity,
  Apple,
  Zap,
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
    name: "DigestiGum™ - Gummies Enzymes Digestives + Probiotiques + Prébiotiques",
    subtitle: "60 gummies / 30 jours de cure • Formule 3-en-1 Plant-Based pour un ventre serein au quotidien",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/digestigum/digestigum-hero-60-gummies.jpg",
    alt: "DigestiGum - 60 gummies dans un seul flacon",
    caption: "60 gummies dans un seul flacon — une cure complète de 30 jours au goût agréable",
  },
  {
    src: "/images/digestigum/digestigum-confort-en-gummies.jpg",
    alt: "Le confort digestif en gummies - Digestion légère et flore intestinale équilibrée",
    caption: "Digestion plus légère & équilibre de la flore intestinale dès les premières semaines",
  },
  {
    src: "/images/digestigum/digestigum-3-composants.jpg",
    alt: "3 composants - Enzymes digestives, Probiotiques, Prébiotiques",
    caption: "3 composants puissants — enzymes digestives (papaye), probiotiques & prébiotiques (inuline)",
  },
  {
    src: "/images/digestigum/digestigum-soutien-3en1.jpg",
    alt: "Soutien digestif 3-en-1 végétal",
    caption: "Enzymes, probiotiques & prébiotiques : la synergie complète pour votre microbiome",
  },
  {
    src: "/images/digestigum/digestigum-confort-digestif.jpg",
    alt: "Confort digestif au quotidien",
    caption: "Un confort digestif durable intégré à votre routine quotidienne",
  },
  {
    src: "/images/digestigum/digestigum-facile-quotidien.jpg",
    alt: "Facile à intégrer à votre quotidien",
    caption: "Des gummies au goût agréable — facile à intégrer chaque matin en routine",
  },
  {
    src: "/images/digestigum/digestigum-ventre-serein.jpg",
    alt: "Un ventre plus serein avec DigestiGum",
    caption: "Un ventre plus serein grâce à la combinaison enzymes + probiotiques + prébiotiques",
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
    name: "Isabelle M.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Fini les ballonnements du soir après le repas !",
    comment: "Depuis que je prends 2 DigestiGum chaque matin, mes repas ne me laissent plus cette sensation de ventre gonflé. La digestion est fluide, légère. En plus le goût est excellent, pas écœurant du tout !",
    verified: true,
  },
  {
    name: "Arnaud K.",
    location: "Calavi (Tankpè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Efficace et pratique pour les déplacements",
    comment: "Avec mes voyages fréquents, mon transit était toujours perturbé. Le flacon de 60 gummies me dure 30 jours et les résultats sont là dès la deuxième semaine. Je me sens vraiment mieux.",
    verified: true,
  },
  {
    name: "Chantal B.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Recommandé à toute ma famille",
    comment: "Je cherchais quelque chose de naturel pour soutenir ma digestion sans médicaments chimiques. Ces gummies sont parfaits : plant-based, efficaces et livrés en 24h. Paiement à la livraison, c'est très rassurant.",
    verified: true,
  },
  {
    name: "Romain D.",
    location: "Cotonou (Akpakpa)",
    rating: 4,
    date: "Achat vérifié",
    title: "Très bonne formule 3-en-1",
    comment: "Avoir les enzymes, les probiotiques ET les prébiotiques dans un seul produit et en version gummies c'est une vraie innovation. Mon confort digestif s'est amélioré progressivement. Je recommande !",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Quelle est la posologie recommandée pour DigestiGum™ ?",
    a: "La posologie recommandée est de 2 gummies par jour, de préférence le matin avant ou pendant le repas. Le flacon de 60 gummies correspond donc à une cure complète de 30 jours. Pour de meilleurs résultats, utilisez en cure régulière de 1 à 3 mois.",
  },
  {
    q: "Quelle est la différence entre enzymes digestives, probiotiques et prébiotiques ?",
    a: "Les enzymes digestives (extraites de la papaye) décomposent les aliments pour faciliter leur assimilation. Les probiotiques sont des bonnes bactéries vivantes qui renforcent la flore intestinale. Les prébiotiques (inuline végétale) nourrissent et maintiennent en vie ces bonnes bactéries. DigestiGum™ réunit les 3 dans une synergie optimale.",
  },
  {
    q: "Ce produit convient-il aux végétariens et végétaliens ?",
    a: "Oui, DigestiGum™ est 100% Plant-Based (base végétale). Il ne contient aucun ingrédient d'origine animale, ni gélatine porcine ou bovine. Adapté aux végétariens, végétaliens et aux personnes suivant une alimentation halal.",
  },
  {
    q: "À partir de quand les premiers résultats sont-ils visibles ?",
    a: "La plupart des utilisateurs rapportent une amélioration du confort digestif dès la 1ère à 2ème semaine d'utilisation. Les effets sur la flore intestinale et le microbiome sont plus durables après 4 semaines de cure régulière.",
  },
  {
    q: "Comment se passe la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue en 24h chrono à Cotonou, Calavi et partout au Bénin. Vous réglez les 14 900 FCFA en espèces directement au livreur, uniquement après avoir reçu et inspecté votre colis. Aucun paiement en avance.",
  },
];

export default function DigestiGumLanding({ slug = "digestigum" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const utm = useUTM();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
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

  // Auto-défilement carrousel (Pilier 3)
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

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
        product_slug: "digestigum",
        product_title: "DigestiGum™ - Gummies Enzymes Digestives + Probiotiques + Prébiotiques",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "DigestiGum™ Gummies Digestifs 3-en-1",
      content_ids: ["digestigum", "gummies-digestifs"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "DigestiGum™ Gummies Digestifs",
      content_ids: ["digestigum"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    trackInitiateCheckout({
      content_name: "DigestiGum™ Gummies Digestifs",
      content_ids: ["digestigum"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    const el = document.getElementById("commander");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
        product_title: "DigestiGum™ - Gummies Enzymes Digestives + Probiotiques + Prébiotiques",
        product_slug: "digestigum",
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

      markLeadConverted(customerPhone.trim(), "digestigum");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "DigestiGum™ Gummies Digestifs",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/digestigum/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf4] text-slate-800 font-sans selection:bg-green-100 selection:text-green-900">

      {/* ── 1. BANDEAU TOP BAR ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-700">
              <Leaf className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>
          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-green-700 hover:bg-green-800 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(21,128,61,0.4)] transition-all duration-100 cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-green-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">

        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-green-600" />
            <span>Plant-Based • Enzymes + Probiotiques + Prébiotiques</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Un ventre <span className="text-green-700">serein</span> et une digestion <span className="text-green-600">légère</span> au quotidien.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            3 composants puissants dans un seul gummy délicieux. La formule complète pour soutenir votre microbiome, faciliter votre digestion et équilibrer votre flore intestinale.
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AUTO-DÉFILANT (Pilier 3) ── */}
        <div
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="max-w-[500px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4 space-y-3"
        >
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-inner flex items-center justify-center">
            <img
              src={CAROUSEL_IMAGES[activeImgIndex]?.src}
              alt={CAROUSEL_IMAGES[activeImgIndex]?.alt}
              loading="eager"
              decoding="async"
              className="w-full h-full object-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.01]"
            />

            {/* Indicateur */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-md z-10">
              {activeImgIndex + 1} / {CAROUSEL_IMAGES.length}
            </div>

            {/* Prix badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 bg-green-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                14 900 FCFA
              </span>
            </div>

            {/* Boutons navigation */}
            <button
              type="button"
              onClick={() => setActiveImgIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Légende */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 via-slate-900/50 to-transparent p-3 sm:p-4 text-white text-xs sm:text-sm font-medium z-10 text-center">
              <p className="line-clamp-1">{CAROUSEL_IMAGES[activeImgIndex]?.caption}</p>
            </div>
          </div>

          {/* Miniatures */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImgIndex === idx
                    ? "border-green-600 ring-2 ring-green-600/20"
                    : "border-slate-200 opacity-55 hover:opacity-90"
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-700 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-700 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Échange immédiat en cas d'anomalie</p>
            </div>
          </div>
        </div>

        {/* ── 7. FORMULAIRE DE COMMANDE COD (Pilier 2) ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug="digestigum"
            productTitle="DigestiGum™ - Gummies Enzymes Digestives + Probiotiques + Prébiotiques"
            productImage="/images/digestigum/digestigum-hero-60-gummies.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `DigestiGum - ${b.name}`,
                content_ids: ["digestigum", b.id || "solo"],
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
            isSubmitting={isSubmitting}
            accentColor="#15803d"
            onSubmit={handleOrderSubmit}
          />
        </div>

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pourquoi DigestiGum™ fait la différence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              La synergie unique de 3 actifs végétaux pour une digestion complète, de A à Z.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-700">
                <Apple className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Enzymes Digestives (Papaye)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Les enzymes décomposent les protéines, glucides et lipides en particules assimilables. Fini la lourdeur et les ballonnements après le repas : votre corps absorbe tout avec efficacité.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Activity className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Probiotiques Vivants Multi-Souches</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Des milliards de bonnes bactéries vivantes pour recoloniser et renforcer votre flore intestinale. Meilleure immunité, transit régularisé, côlon apaisé.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <Leaf className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Prébiotiques (Inuline Végétale)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Les prébiotiques nourrissent et maintiennent en vie vos probiotiques dans l'intestin. Sans eux, les bonnes bactéries ne survivent pas longtemps. DigestiGum™ optimise les 3 en synergie.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-700">
                <Zap className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">100% Plant-Based & Goût Agréable</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Formule entièrement végétale, sans gélatine animale, sans colorants artificiels. Un gummy au goût naturellement délicieux que vous prendrez avec plaisir chaque matin.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. INFOGRAPHIE 3 COMPOSANTS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              Formule 3-en-1
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              3 composants. Un seul flacon. 60 gummies.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
              <img
                src="/images/digestigum/digestigum-3-composants.jpg"
                alt="DigestiGum 3 composants enzymes probiotiques prébiotiques"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 text-lg">
                  🍈
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enzymes Digestives</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Extraites naturellement de la papaye. Décomposent les aliments pour une absorption optimale et sans inconfort.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-lg">
                  🦠
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Probiotiques Multi-Souches</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Milliards de bonnes bactéries vivantes pour renforcer la flore intestinale, réduire les ballonnements et améliorer le transit.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0 text-lg">
                  🌿
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Prébiotiques (Inuline)</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Fibre végétale qui nourrit et prolonge la survie des probiotiques dans votre intestin pour un effet durable.
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-700 text-white font-semibold text-xs shadow-md hover:bg-green-800 transition-all cursor-pointer"
                >
                  <span>Commander DigestiGum™ (14 900 F)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Complément digestif classique vs DigestiGum™
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3.5 sm:p-4">Critère</th>
                  <th className="p-3.5 sm:p-4 text-slate-400">Complément classique</th>
                  <th className="p-3.5 sm:p-4 bg-green-50/60 text-green-800 font-extrabold">DigestiGum™</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {[
                  ["Formule 3-en-1 complète", "Un seul actif", "Enzymes + Probio + Prébio"],
                  ["Forme galénique", "Gélules difficiles à avaler", "Gummies délicieux"],
                  ["Base végétale", "Gélatine animale souvent", "100% Plant-Based"],
                  ["Facilité d'utilisation", "Gélules avec eau obligatoire", "2 gummies, n'importe où"],
                  ["Résultats durables", "Effet passager", "Microbiome renforcé"],
                ].map(([label, bad, good], idx) => (
                  <tr key={idx}>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900">{label}</td>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-1.5 text-rose-500">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>{bad}</span>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4 bg-green-50/30">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{good}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11. BANNIÈRE PROMOTIONNELLE ── */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-md">
          <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 text-[11px] font-bold px-3 py-1 rounded-full border border-green-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offre de lancement — Stock limité</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Prenez soin de votre ventre aujourd'hui
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
            Seulement <span className="font-bold text-white">14 900 FCFA</span> au lieu de{" "}
            <span className="line-through text-slate-400">25 000 FCFA</span> — 60 gummies pour 30 jours de confort digestif.
          </p>
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <span>Commander maintenant — 14 900 FCFA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── 12. AVIS CLIENTS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Noté 4.9/5 par nos clients au Bénin
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {rev.date}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">« {rev.title} »</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800">{rev.name}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 13. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="text-center space-y-1 pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Questions Fréquentes</h2>
            <p className="text-xs text-slate-500">Tout ce que vous devez savoir sur DigestiGum™.</p>
          </div>
          <div className="space-y-2 divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-green-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180 text-green-700" : ""}`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="pb-3 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── 14. FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-800 tracking-tight">ISIVENTE BÉNIN — Boutique Officielle</p>
        <p>Service client WhatsApp disponible 7j/7 pour le suivi de vos colis et assistance.</p>
        <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} Isivente. Tous droits réservés.</p>
      </footer>

      {/* ── 15. STICKY MOBILE CTA ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        accentColor="#15803d"
        buttonText="Commander (14 900 F)"
      />
    </div>
  );
}
