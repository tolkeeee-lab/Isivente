"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Check,
  BatteryCharging,
  Zap,
  Heart,
  CheckCircle2,
  ChevronDown,
  Award,
  ArrowRight,
  Activity,
  Flame,
  Clock,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";
import { saveNewOrder } from "@/lib/ordersStorage";
import { markLeadConverted } from "@/lib/leadsStorage";

// ── PILIER 1 : OFFRE UNIQUE HARMONISÉE (16 900 FCFA) ──
const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres™",
    subtitle: "Coffret complet : appareil masseur écran LED + sangle réglable 1,4 m + câble Type-C + garantie test",
    price: 16900,
    originalPrice: 29000,
    savings: 12100,
    quantity: 1,
    popular: true,
  },
];

// ── RÈGLE DU CARROUSEL : EXACTEMENT 5 VISUELS NARRATIFS ──
const HERO_IMAGES = [
  {
    src: "/images/masseur-vibrant/carousel-5-technologie.jpg",
    alt: "Batterie 1200 mAh Grande Autonomie, Recharge Type-C et Arrêt Auto 15 Minutes",
    badge: "Batterie 1200 mAh",
  },
  {
    src: "/images/masseur-vibrant/carousel-1-hero.jpg",
    alt: "Masseur Réglable Abdomen et Dos - Détente et Bien-Être au Quotidien",
    badge: "Abdomen & Dos",
  },
  {
    src: "/images/masseur-vibrant/carousel-2-multi-zones.jpg",
    alt: "Massage Complet du Corps 6 Zones : Fessiers, Dos, Taille, Cuisses, Bras, Épaules",
    badge: "6 Zones du Corps",
  },
  {
    src: "/images/masseur-vibrant/carousel-3-double-utilisation.jpg",
    alt: "2-en-1 Méthode de Massage : Utilisation Manuelle ou Mains Libres avec Sangle 1.4m",
    badge: "Mode 2-en-1",
  },
  {
    src: "/images/masseur-vibrant/carousel-4-modes-intensite.jpg",
    alt: "5 Niveaux d'Intensité L1-L5 et 3 Modes de Fréquence Intelligents",
    badge: "5 Intensités LED",
  },
];

// ── AVIS CLIENTS VÉRIFIÉS BÉNIN ──
const REVIEWS = [
  {
    name: "Christelle A.",
    city: "Cotonou (Haie Vive)",
    rating: 5,
    title: "Soulage mon bas du dos après 8h assise au bureau",
    comment:
      "Je souffre souvent de raideurs lombaires après ma journée au travail. Je l'attache avec la sangle sur mon dos le soir sur le canapé : les vibrations profondes détendent tous les muscles en 15 minutes. C'est devenu mon rituel indispensable !",
    verified: true,
  },
  {
    name: "Amina T.",
    city: "Abomey-Calavi",
    rating: 5,
    title: "La sangle mains libres est ultra-pratique sur le ventre",
    comment:
      "Très agréable pour soulager les tensions au niveau de l'abdomen et du ventre. Avec la sangle de 1,4 mètre, l'appareil tient parfaitement sans bouger pendant que je fais la cuisine ou que je lis. L'écran digital qui montre le niveau L1 à L5 est super moderne.",
    verified: true,
  },
  {
    name: "Dr. Boris K.",
    city: "Porto-Novo",
    rating: 5,
    title: "Compact, silencieux et puissant",
    comment:
      "Très agréablement surpris par la puissance des vibrations par rapport à sa taille compacte. On sent un vrai travail en profondeur sur les cuisses et les épaules. La batterie tient plusieurs jours sans problème.",
    verified: true,
  },
  {
    name: "Béatrice M.",
    city: "Parakou",
    rating: 5,
    title: "J'ai testé devant le livreur avant de payer, 100% conforme",
    comment:
      "Colis reçu rapidement à Parakou. Le livreur a attendu que j'ouvre le carton et que j'allume l'appareil pour vérifier qu'il vibrait bien avant que je ne paye les 16 900 F. Vraiment très sérieux !",
    verified: true,
  },
];

// ── FAQ INTERACTIVE ──
const FAQS = [
  {
    q: "Comment fonctionne le mode mains libres avec la sangle ?",
    a: "L'appareil dispose de deux ouvertures latérales spécialement conçues pour glisser la sangle fournie de 140 cm. Vous pouvez l'attacher confortablement autour de votre abdomen, de votre bas du dos, de votre taille ou de vos cuisses pour profiter d'un massage continu tout en restant libre de vos mouvements.",
  },
  {
    q: "Quelles sont les zones du corps que l'on peut masser ?",
    a: "Grâce à son format ergonomique 2-en-1, vous pouvez l'utiliser sur 6 zones principales : l'abdomen/ventre, le bas et le haut du dos, les fessiers, les cuisses, les bras et les trapèzes/épaules. En mode manuel, il suffit de le poser délicatement sur la zone à détendre.",
  },
  {
    q: "Combien de temps dure la batterie et comment se recharge-t-il ?",
    a: "L'appareil est équipé d'une batterie lithium haute capacité de 1200 mAh. Grâce à son minuteur automatique de 15 minutes par séance, une seule charge complète vous offre plusieurs jours d'utilisation. Il se recharge facilement avec le câble USB Type-C fourni sur n'importe quel chargeur de téléphone.",
  },
  {
    q: "Les vibrations sont-elles réglables ?",
    a: "Oui, vous disposez de 5 niveaux d'intensité (affichés de L1 à L5 sur l'écran LED digital) ainsi que de 3 modes de fréquence intelligente (P1 doux et relaxant, P2 équilibré et tonifiant, P3 profond et intense). Vous adaptez le massage exactement à votre sensibilité.",
  },
  {
    q: "Comment se déroule la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée en 24h à Cotonou, Calavi, Porto-Novo et partout au Bénin. Vous ne payez rien à l'avance : vous testez l'appareil en allumant l'écran devant le livreur pour vérifier son parfait état de marche avant de lui remettre les 16 900 FCFA.",
  },
];

export default function MasseurVibrantLanding({ slug = "masseur-vibrant" }: { slug?: string }) {
  const router = useRouter();
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // États Carrousel Hero (5 images)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // État Formulaire & Commande
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

  // Tracking Meta & UTM
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        const utmData: Record<string, string> = {};
        ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((k) => {
          const val = sp.get(k);
          if (val) utmData[k] = val;
        });
        setUtm(utmData);
      } catch {}
    }
  }, []);

  // Défilement automatique du Carrousel Hero (toutes les 3.8s avec pause au survol)
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  // Tracking ViewContent au chargement
  useEffect(() => {
    trackViewContent({
      content_name: "Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres™",
      content_ids: ["masseur-vibrant"],
      value: 16900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    trackAddToCart({
      content_name: "Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres™",
      content_ids: ["masseur-vibrant"],
      value: 16900,
      currency: "XOF",
      num_items: 1,
    });
    trackInitiateCheckout({
      content_name: "Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres™",
      content_ids: ["masseur-vibrant"],
      value: 16900,
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
        product_title: "Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres™",
        product_slug: "masseur-vibrant",
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

      markLeadConverted(customerPhone.trim(), "masseur-vibrant");

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "isivente_last_purchase_meta",
          JSON.stringify({
            title: "Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres™",
            price: selectedBundle.price,
            quantity: 1,
          })
        );
      }

      const successUrl = `/p/masseur-vibrant/success?order=${encodeURIComponent(
        order.order_number || ""
      )}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(
        customerPhone.trim()
      )}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>LIVRAISON EXPRESS 24H AU BÉNIN • PAIEMENT À LA LIVRAISON APRÈS TEST</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-900">
              ISI<span className="text-purple-600">VENTE</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              OFFICIEL BÉNIN
            </span>
          </div>
          <button
            onClick={scrollToOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all active:scale-95"
          >
            <span>Commander</span>
            <span className="text-purple-200 font-semibold">(16 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Soulagement & Détente Musculaire en 15 Minutes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres™
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Détendez vos muscles, apaisez les tensions du dos et du ventre, et profitez d'un massage profond à domicile :
            5 intensités réglables sur écran LED, mode manuel ou sangle mains libres, et batterie 1200 mAh.
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
              className="object-contain transition-all duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 800px"
            />

            {/* Badge contextuel sur chaque slide */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide shadow-md">
              {HERO_IMAGES[currentSlide].badge}
            </div>

            {/* Boutons navigation gauche / droite */}
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? HERO_IMAGES.length - 1 : prev - 1))
              }
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
                    currentSlide === idx ? "w-6 bg-purple-400" : "w-1.5 bg-white/50"
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
                    ? "border-purple-600 scale-[1.03] shadow-md ring-2 ring-purple-200"
                    : "border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE CÔTE À CÔTE (Pilier 2) ── */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col items-center justify-center gap-1">
            <Truck className="w-5 h-5 text-purple-600 stroke-[1.75]" />
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Livraison Express 24h</span>
            <span className="text-[10px] text-slate-500">Cotonou & tout le Bénin</span>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col items-center justify-center gap-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 stroke-[1.75]" />
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Paiement Réception</span>
            <span className="text-[10px] text-slate-500">Testez avant de payer</span>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col items-center justify-center gap-1">
            <BatteryCharging className="w-5 h-5 text-amber-500 stroke-[1.75]" />
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Batterie 1200 mAh</span>
            <span className="text-[10px] text-slate-500">Rechargeable Type-C</span>
          </div>
        </div>

        {/* ── 7. FORMULAIRE DE COMMANDE COD IMMÉDIATEMENT APRÈS (Pilier 2) ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
              {orderError}
            </div>
          )}
          <UmeiStyleOrderSection
            productSlug="masseur-vibrant"
            productTitle="Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres™"
            productImage="/images/masseur-vibrant/carousel-5-technologie.jpg"
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
            accentColor="#7C3AED"
            onSubmit={handleOrderSubmit}
          />
        </div>

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pourquoi le Masseur 2-en-1 transforme votre bien-être au quotidien
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Une technologie professionnelle de massage vibrant compacte, conçue pour soulager vos tensions en toute liberté.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Soulagement Ciblé Abdomen & Dos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Détend en profondeur les raideurs lombaires, les tensions dues à la position assise et apaise les crampes abdominales grâce à ses vibrations oscillatoires.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Liberté Totale 2-en-1</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Utilisez-le en mode manuel pour cibler précisément une épaule ou un bras, ou fixez la sangle réglable de 1,4 m pour un massage continu les mains 100% libres.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">5 Niveaux & 3 Fréquences Intelligentes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ajustez d'une touche l'intensité (L1 à L5 affiché sur l'écran LED) et basculez entre les modes doux, équilibré ou profond selon votre besoin du moment.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BatteryCharging className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Batterie 1200 mAh & Minuteur 15 min</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Rechargeable via USB-C universel, sans aucun fil gênant. L'appareil s'arrête automatiquement après 15 minutes pour vous offrir une séance calibrée et sécurisée.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8.5 DÉMONSTRATION VIDÉO EN ACTION (Pilier 4) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-md space-y-4">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-purple-700 tracking-wider uppercase bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Démonstration Vidéo Réelle
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Découvrez le Coffret et Son Fonctionnement en Vidéo
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Déballage réel : appareil ergonomique, sangle de fixation 1,4 m et câble Type-C prêts à l'emploi.
            </p>
          </div>

          <div className="relative max-w-xs sm:max-w-sm mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md">
            <video
              src="/videos/masseur-crea-voix-off.mp4"
              poster="/images/masseur-vibrant/carousel-5-technologie.jpg"
              autoPlay
              muted
              playsInline
              loop
              controls
              preload="auto"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => scrollToSection("commander")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              Commander Mon Coffret (16 900 F)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 9. SECTION ÉDITORIALE : COMMENT ÇA FONCTIONNE (VISUEL DÉDIÉ N°6) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-md space-y-4">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-purple-700 tracking-wider uppercase bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Prise en main en 10 secondes
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Comment fonctionne le Masseur 2-en-1 ?
            </h2>
          </div>

          <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/masseur-vibrant/section-fonctionnement.jpg"
              alt="Guide d'utilisation et commandes du Masseur Vibrant Portable"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <h4 className="text-xs font-bold text-slate-900">Allumez d'une touche</h4>
              </div>
              <p className="text-[11px] text-slate-600">
                Maintenez le bouton doré pour allumer l'écran LED rétroéclairé.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <h4 className="text-xs font-bold text-slate-900">Réglez votre intensité</h4>
              </div>
              <p className="text-[11px] text-slate-600">
                Appuyez brièvement pour naviguer entre les niveaux L1 (doux) et L5 (intense).
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                <h4 className="text-xs font-bold text-slate-900">Relaxez-vous 15 min</h4>
              </div>
              <p className="text-[11px] text-slate-600">
                Posez-le ou fixez la sangle : l'appareil s'arrête tout seul après votre séance.
              </p>
            </div>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS (CLASSIQUE VS ISIVENTE) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Masseurs ordinaires vs Masseur Vibrant 2-en-1 Isivente
            </h2>
            <p className="text-xs text-slate-500">Pourquoi notre appareil surclasse les appareils traditionnels</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2.5 px-3 text-slate-500 font-semibold">Critère</th>
                  <th className="py-2.5 px-3 text-rose-600 font-bold bg-rose-50/50 rounded-tl-xl">Masseurs Classiques</th>
                  <th className="py-2.5 px-3 text-purple-700 font-bold bg-purple-50 rounded-tr-xl">Masseur 2-en-1 Isivente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-700">Mains libres</td>
                  <td className="py-2.5 px-3 text-slate-500 bg-rose-50/20">Non, obligation de tenir à la main</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-900 bg-purple-50/50">
                    Oui, sangle 140 cm incluse (100% libre)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-700">Alimentation</td>
                  <td className="py-2.5 px-3 text-slate-500 bg-rose-50/20">Câble secteur encombrant ou piles</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-900 bg-purple-50/50">
                    Batterie 1200 mAh rechargeable Type-C
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-700">Polyvalence</td>
                  <td className="py-2.5 px-3 text-slate-500 bg-rose-50/20">1 seule zone (dos ou nuque)</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-900 bg-purple-50/50">
                    6 zones complètes (dos, ventre, cuisses, bras...)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-700">Affichage</td>
                  <td className="py-2.5 px-3 text-slate-500 bg-rose-50/20">Boutons aveugles sans retour</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-900 bg-purple-50/50">
                    Écran digital LED clair (L1 à L5)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-700">Test avant paiement</td>
                  <td className="py-2.5 px-3 text-slate-500 bg-rose-50/20">Rarement permis</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700 bg-purple-50/50">
                    Test obligatoire devant le livreur
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11. SECTION ÉDITORIALE : DIMENSIONS & CONTENU DU PACK (VISUEL DÉDIÉ N°7) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-md space-y-4">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase bg-slate-100 px-2.5 py-0.5 rounded-full">
              Transparence & Qualité
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dimensions & Contenu de votre Coffret
            </h2>
            <p className="text-xs text-slate-500">
              Tout est inclus dans votre boîte scellée, prête à l'emploi dès la réception.
            </p>
          </div>

          <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/masseur-vibrant/section-dimensions-contenu.jpg"
              alt="Dimensions et contenu du coffret Masseur 2-en-1"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/60 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">1x Masseur Électrique</p>
                <p className="text-[10px] text-slate-500">Format compact 14,5 x 13,5 cm</p>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/60 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">1x Sangle Réglable 140 cm</p>
                <p className="text-[10px] text-slate-500">S'adapte à toutes les morphologies</p>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/60 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">1x Câble Type-C & Manuel</p>
                <p className="text-[10px] text-slate-500">Recharge rapide et guide en français</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <section className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-xs font-bold border border-white/10">
            <Clock className="w-3.5 h-3.5" />
            <span>Offre Spéciale de Lancement au Bénin</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Prenez soin de votre corps dès aujourd'hui
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-lg mx-auto">
              Commandez votre Masseur 2-en-1 et réglez en toute tranquillité à la livraison après avoir inspecté votre colis.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-black text-amber-300">16 900 FCFA</span>
            <span className="text-lg text-purple-200/70 line-through">29 000 FCFA</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm sm:text-base shadow-lg shadow-amber-400/30 transition-all active:scale-95"
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
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-1 text-xs font-bold text-slate-800">4.9 / 5</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Avis de nos clients au Bénin</h2>
            <p className="text-xs text-slate-500">Témoignages vérifiés de clients livrés à domicile</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" /> Achat vérifié
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">"{rev.comment}"</p>
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
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
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
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-slate-900 hover:text-purple-700"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-purple-600" : ""
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
        price={16900}
        accentColor="#7C3AED"
        targetSectionId="commander"
        buttonText="Commander"
        whatsappMessage="Bonjour Isivente, j'ai une question concernant le Masseur Vibrant 2-en-1 Abdomen & Dos."
      />
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
