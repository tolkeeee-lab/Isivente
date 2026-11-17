"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Check,
  UtensilsCrossed,
  Clock,
  ArrowRight,
  Salad,
  Flame,
  Zap,
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

// ── PILIER 1 : OFFRE UNIQUE HARMONISÉE (14 900 FCFA) ──
const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Coffret Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™",
    subtitle: "Bac transparent + panier passoire amovible à anses + 9 lames inox + poussoir de sécurité + éplucheur offert",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

// ── RÈGLE DU CARROUSEL : EXACTEMENT 5 VISUELS NARRATIFS ──
const HERO_IMAGES = [
  {
    src: "/images/peeler/carousel-1-hero-africaine.jpg",
    alt: "Coupe-Légumes Multifonction 3-en-1 avec Panier Égouttoir pour la Cuisine Quotidienne",
    badge: "3-en-1 Cuisine Express",
  },
  {
    src: "/images/peeler/carousel-2-passoire-spaghetti.jpg",
    alt: "Égouttez vos spaghettis chauds et rincez vos légumes directement dans le panier égouttoir",
    badge: "Vraie Passoire Spaghettis",
  },
  {
    src: "/images/peeler/carousel-3-grilles-formes.jpg",
    alt: "5 Formes de Découpe : Cubes, Petits cubes, Bâtonnets, Rondelles et Ondulé",
    badge: "5 Découpes en 1 Clic",
  },
  {
    src: "/images/peeler/carousel-4-securite-accessoires.jpg",
    alt: "Plus de 10 accessoires avec poussoir de sécurité protège-doigts et anti-coupure",
    badge: "Sécurité Anti-Coupure",
  },
  {
    src: "/images/peeler/carousel-5-3en1-usages.jpg",
    alt: "Un seul ustensile, plusieurs usages : Découpe, Rinçage, Égouttage spaghettis et pâtes",
    badge: "Gain de Temps x4",
  },
];

// ── AVIS CLIENTS VÉRIFIÉS BÉNIN ──
const REVIEWS = [
  {
    name: "Bernadette D.",
    city: "Cotonou (Cadjehoun)",
    rating: 5,
    title: "Fini les larmes avec les oignons et le piment !",
    comment:
      "Avant, émincer 3 oignons pour ma sauce tomate me faisait pleurer pendant 15 minutes. Avec cet appareil, je pose le demi-oignon, j'appuie d'un coup sec, et tous les petits dés réguliers tombent directement dans le panier. C'est magique et hyper rapide !",
    verified: true,
  },
  {
    name: "Marcelle T.",
    city: "Abomey-Calavi (Arconville)",
    rating: 5,
    title: "Le panier passoire pour les spaghettis est tellement pratique",
    comment:
      "J'adore la double anse du panier ! Quand je fais des spaghettis pour les enfants, je les verse directement dedans pour égoutter l'eau bouillante sans me brûler. Et je lave aussi mes légumes sous le robinet en deux secondes. Rien que pour ça, il vaut largement son prix.",
    verified: true,
  },
  {
    name: "Sébastien A.",
    city: "Porto-Novo",
    rating: 5,
    title: "Reçu en 24h, testé devant le coursier avant de payer",
    comment:
      "Colis impeccable avec tous les accessoires (éplucheur, poussoir, 5 grilles de découpe). Le livreur a attendu que je vérifie tout le coffret avant que je ne lui remette les 14 900 FCFA. Très professionnel.",
    verified: true,
  },
  {
    name: "Chantal K.",
    city: "Cotonou (Akpakpa)",
    rating: 5,
    title: "Le poussoir protège mes doigts et ma manucure",
    comment:
      "Je me coupais toujours le bout des doigts avec les râpes traditionnelles. Là, le poussoir à picots tient les carottes et pommes de terre fermement. Aucun risque de blessure et mes ongles restent intacts !",
    verified: true,
  },
];

// ── FAQ INTERACTIVE ──
const FAQS = [
  {
    q: "Qu'est-ce qui est exactement inclus dans le coffret 14-en-1 ?",
    a: "Votre coffret comprend : 1 grand bac transparent collecteur, 1 panier passoire amovible avec double anse de transport, 1 couvercle rabattable à pression rapide, 5 grilles en inox pour découper en petits dés, moyens dés et bâtonnets/frites, 4 lames de râpe et julienne (carottes râpées, lamelles de concombre, ail/gingembre écrasé), 1 poussoir de sécurité protège-doigts, 1 éplucheur vertical offert, 1 séparateur de blanc d'œuf et 1 peigne de nettoyage rapide.",
  },
  {
    q: "Peut-on vraiment l'utiliser pour égoutter des spaghettis et pâtes bouillantes ?",
    a: "Oui, absolument ! Le panier intérieur gris à double anse est conçu en matériau résistant à la chaleur. Vous pouvez y verser vos spaghettis, macaronis ou légumes chauds pour évacuer l'eau de cuisson instantanément sans risque de vous brûler.",
  },
  {
    q: "Est-ce sécurisé pour éviter de se couper les doigts ?",
    a: "Oui, à 100%. L'appareil est livré avec un poussoir ergonomique à picots. Vous piquez votre pomme de terre, carotte ou oignon, et vous faites glisser sans jamais approcher vos doigts ni vos ongles des lames tranchantes.",
  },
  {
    q: "Comment se nettoient les lames et le bac ?",
    a: "Le coffret inclut un petit peigne de nettoyage spécialement conçu pour déloger les résidus d'oignons ou de légumes coincés dans la grille en 2 secondes. Tout se rince simplement sous l'eau du robinet, et les accessoires se rangent tous à l'intérieur du bac fermé.",
  },
  {
    q: "Quels sont les délais et conditions de livraison au Bénin ?",
    a: "La livraison est effectuée sous 24h à Cotonou, Calavi, Porto-Novo et partout au Bénin. Vous ne payez rien à l'avance : le livreur arrive chez vous, vous ouvrez le carton, vous inspectez votre coffret et ses accessoires, et vous lui réglez les 14 900 FCFA en espèces après vérification.",
  },
];

export default function PeelerLanding({ slug = "peeler" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const utm = useUTM();
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Carrousel Hero (5 visuels narratifs)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Formulaire & Commande
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Défilement automatique du Carrousel Hero (3.8s avec pause au survol)
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  // Tracking ViewContent au chargement (14 900 FCFA)
  useEffect(() => {
    trackViewContent({
      content_name: "Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™",
      content_ids: ["peeler"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

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
        product_slug: "peeler",
        product_title: "Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™",
      content_ids: ["peeler"],
      value: 14900,
      currency: "XOF",
      num_items: 1,
    });
    trackInitiateCheckout({
      content_name: "Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™",
      content_ids: ["peeler"],
      value: 14900,
      currency: "XOF",
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
        product_title: "Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™",
        product_slug: "peeler",
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

      markLeadConverted(customerPhone.trim(), "peeler");

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "isivente_last_purchase_meta",
          JSON.stringify({
            title: "Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™",
            price: selectedBundle.price,
            quantity: 1,
          })
        );
      }

      const successUrl = `/p/peeler/success?order=${encodeURIComponent(
        order.order_number || ""
      )}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(
        customerPhone.trim()
      )}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVRAISON EXPRESS 24H AU BÉNIN • PAIEMENT EN ESPÈCES À LA LIVRAISON APRÈS TEST</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <UtensilsCrossed className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              ISI<span className="text-emerald-600">VENTE</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline">
              Cuisine Express
            </span>
          </div>

          <button
            onClick={scrollToOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
          >
            <span>Commander</span>
            <span className="text-emerald-100 font-semibold">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Innovation Cuisine 3-en-1 • Gain de Temps Immédiat</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Vos oignons, tomates et légumes coupés en dés parfaits en 1 seconde sans verser une larme ! Le panier passoire
            amovible vous permet également de rincer vos légumes et d&apos;égoutter vos spaghettis et pâtes sans vous brûler les mains.
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AUTO-DÉFILANT (EXACTEMENT 5 IMAGES NARRATIVES) ── */}
        <div
          className="relative bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-xl overflow-hidden"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100">
            <Image
              src={HERO_IMAGES[currentSlide].src}
              alt={HERO_IMAGES[currentSlide].alt}
              fill
              priority
              quality={80}
              className="object-contain transition-all duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, 600px"
            />

            {/* Badge contextuel sur chaque slide */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide shadow-md">
              {HERO_IMAGES[currentSlide].badge}
            </div>

            {/* Boutons navigation gauche / droite */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_IMAGES.length - 1 : prev - 1))}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicateur de slides (Dots) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md">
              {HERO_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? "w-6 bg-emerald-400" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Aller au slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Miniatures interactives synchronisées */}
          <div className="grid grid-cols-5 gap-2 mt-3">
            {HERO_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  currentSlide === idx
                    ? "border-emerald-600 scale-[1.03] shadow-md ring-2 ring-emerald-200"
                    : "border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.src} alt={img.alt} fill loading="lazy" className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE CÔTE À CÔTE (Pilier 2) ── */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center justify-center gap-1">
            <Truck className="w-5 h-5 text-emerald-600 stroke-[1.75]" />
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Livraison Express 24h</span>
            <span className="text-[10px] text-slate-500">Cotonou & tout le Bénin</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center justify-center gap-1">
            <PackageCheck className="w-5 h-5 text-emerald-600 stroke-[1.75]" />
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Paiement Réception</span>
            <span className="text-[10px] text-slate-500">Inspectez avant de payer</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center justify-center gap-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 stroke-[1.75]" />
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Zéro Coupure Doigts</span>
            <span className="text-[10px] text-slate-500">Poussoir de sécurité</span>
          </div>
        </div>

        {/* ── 7. FORMULAIRE DE COMMANDE COD IMMÉDIATEMENT APRÈS (Pilier 2) ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
              {orderError}
            </div>
          )}

          {/* Anti-touriste : Engagement ferme de livraison en espèces */}
          <div className="mb-4 p-4 rounded-2xl bg-amber-50/95 border border-amber-300 text-amber-950 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 stroke-[2]" />
              <span>Engagement ferme de livraison en espèces (14 900 FCFA)</span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
              Un livreur se déplace physiquement à moto jusqu&apos;à votre domicile ou lieu de travail. Merci de ne valider ce
              formulaire que si vous êtes <strong>présent(e)</strong> et avez la somme exacte de <strong>14 900 FCFA en espèces</strong> prête
              pour régler le livreur à la réception après contrôle de votre coffret.
            </p>
          </div>

          <UmeiStyleOrderSection
            productSlug="peeler"
            productTitle="Coupe-Légumes Multifonction 14-en-1 avec Panier Égouttoir à Anses™"
            productImage="/images/peeler/carousel-1-hero-africaine.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => setSelectedBundle(b)}
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
            accentColor="#16A34A"
            onSubmit={handleOrderSubmit}
          />
        </div>

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pourquoi cet ustensile 3-en-1 change la vie dans votre cuisine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Une conception pensée pour réduire par 4 votre temps de préparation des repas quotidiens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Découpe en dés en 1 seconde chrono</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Posez la moitié d&apos;un oignon ou d&apos;une tomate, rabattez le couvercle d&apos;un coup sec. Des dés nets et réguliers
                  tombent immédiatement sans pleurer ni salir votre plan de travail.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Vraie passoire pour spaghettis & légumes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Le panier égouttoir amovible avec double anse résiste à l&apos;eau bouillante. Égouttez vos pâtes et spaghettis ou rincez
                  vos salades sous le robinet sans vous brûler les mains.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Sécurité totale protège-doigts</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Le poussoir ergonomique maintient fermement les carottes et pommes de terre. Fini les risques de coupures au
                  couteau : vos doigts et vos ongles restent 100% protégés.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PackageCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Tout se range dans la boîte fermée</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Les 9 lames, le poussoir, l&apos;éplucheur et le peigne de nettoyage se rangent tous à l&apos;intérieur du bac. Zéro
                  encombrement dans vos tiroirs de cuisine.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. SECTION FOCUS : LA PASSOIRE À SPAGHETTIS & ÉGOUTTOIR ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Double Usage Quotidien</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Bien plus qu&apos;un simple coupe-légumes : Votre passoire express
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Ne cherchez plus votre passoire au fond des placards : soulevez le panier à double anse et égouttez en toute simplicité.
            </p>
          </div>

          <div className="relative aspect-square sm:aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xs">
            <Image
              src="/images/peeler/carousel-2-passoire-spaghetti.jpg"
              alt="Panier égouttoir à anses pour spaghettis et rinçage de légumes"
              fill
              loading="lazy"
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        </section>

        {/* ── 10. SECTION GRILLES & FORMES DE DÉCOUPE ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Variété & Présentation</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Des découpes parfaites dignes d&apos;un grand restaurant
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Petits cubes pour les oignons et tomates, bâtonnets pour les frites, tranches ondulées ou carottes râpées : tout est inclus.
            </p>
          </div>

          <div className="relative aspect-square sm:aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xs">
            <Image
              src="/images/peeler/carousel-3-grilles-formes.jpg"
              alt="Grilles interchangeables pour cubes, bâtonnets, rondelles et râpé"
              fill
              loading="lazy"
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        </section>

        {/* ── 11. SECTION CONTENU OFFICIEL DU COFFRET 14-EN-1 ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Coffret Intégral Officiel</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Ce que vous recevez dans votre colis Isivente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Un ensemble complet prêt à l&apos;emploi avec tous ses accessoires officiels et l&apos;éplucheur offert.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
              <Image
                src="/images/peeler/coffret-accessoires-complet.jpg"
                alt="Vue de tous les accessoires du coffret 14-en-1"
                fill
                loading="lazy"
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
              <Image
                src="/images/peeler/produit-cuisine-reel.jpg"
                alt="Produit coupe-légumes posé sur plan de travail en marbre"
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            </div>
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <section className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-bold border border-white/10">
            <Clock className="w-3.5 h-3.5" />
            <span>Offre Spéciale de Lancement au Bénin</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Gagnez du temps précieux en cuisine dès aujourd&apos;hui
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
              Commandez votre Coffret 14-en-1 et réglez en toute sérénité en espèces à la livraison après avoir inspecté votre colis.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-black text-amber-300">14 900 FCFA</span>
            <span className="text-lg text-emerald-200/70 line-through">25 000 FCFA</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm sm:text-base shadow-lg shadow-amber-400/30 transition-all active:scale-95 cursor-pointer"
          >
            <span>Commander Maintenant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* ── 13. AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-1 text-xs font-bold text-slate-800">4.9 / 5</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Avis de nos clientes au Bénin</h2>
            <p className="text-xs text-slate-500">Témoignages vérifiés de clientes livrées à domicile</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" /> Achat vérifié
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{rev.name}</span>
                  <span>{rev.city}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Questions Fréquentes</h2>
            <p className="text-xs text-slate-500">Tout ce que vous devez savoir avant de commander</p>
          </div>

          <div className="space-y-2.5">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 overflow-hidden transition-all bg-slate-50/50"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-slate-900 hover:text-emerald-700"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-3.5 pb-4 pt-1 sm:px-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 15. FOOTER OFFICIEL ── */}
        <footer className="text-center text-xs text-slate-500 py-8 border-t border-slate-200/80 space-y-2">
          <p className="font-bold text-slate-800">ISIVENTE BÉNIN — Boutique Officielle</p>
          <p>© {new Date().getFullYear()} Isivente. Tous droits réservés. Service client : +229 01 92 90 18 17</p>
          <p className="text-[11px] text-slate-400">
            Livraison express à Cotonou, Abomey-Calavi, Porto-Novo, Parakou et partout au Bénin.
          </p>
        </footer>
      </main>

      {/* ── 16. BARRE MOBILE STICKY CTA ── */}
      <StickyMobileCtaBar
        price={14900}
        accentColor="#16A34A"
        targetSectionId="commander"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Coupe-Légumes 14-en-1 avec Panier Égouttoir à 14 900 FCFA."
      />
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
