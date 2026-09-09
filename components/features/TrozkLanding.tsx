"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Star, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Sparkles, 
  Phone, 
  MessageSquare,
  Zap,
  BatteryCharging,
  Layers,
  Smartphone,
  ShieldAlert,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Award,
  Box,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  Tv,
  Cable,
  Briefcase,
  Compass,
  Smile,
  Maximize2
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { getProductUpsellConfig } from "@/lib/upsellConfig";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Système Électrique Modulaire 3-en-1 Trozk T3™ (15 000 mAh)",
    subtitle: "Pack complet : 3 Modules magnétiques A+B+C + Câble de charge + Écran LED + Pochette rigide offerte",
    price: 29900,
    originalPrice: 45000,
    savings: 15100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/trozk-hero.jpg", 
    alt: "Batterie Électrique Modulaire Trozk T3 Coloris Orange Vif",
    caption: "Configuration 3-en-1 complète avec pochette de rangement sur mesure offerte"
  },
  { 
    src: "/images/trozk-modular.jpg", 
    alt: "Les 3 modules indépendants A, B et C du système modulaire",
    caption: "Système modulaire 3-en-1 : Dragonne câble (A), Bloc maître 10 000 mAh (B) et Mini-bloc poche 5 000 mAh (C)"
  },
  { 
    src: "/images/trozk-direct-plug.jpg", 
    alt: "Mini-bloc 5000 mAh branché directement sous le téléphone",
    caption: "Charge directe sans câble encombrant : téléphoner et jouer d'une seule main"
  },
  { 
    src: "/images/trozk-glow.jpg", 
    alt: "Batterie 15000 mAh avec charge rapide 22.5W",
    caption: "Cellule de batterie de qualité automobile 21700 — Puissance de charge rapide 22.5W"
  },
  { 
    src: "/images/trozk-dimensions.jpg", 
    alt: "Dimensions officielles et caractéristiques techniques du modèle TP11",
    caption: "Format compact ultra-portable : 80.4 mm (L) × 28.9 mm (P) × 116 mm (H)"
  },
  { 
    src: "/images/trozk-unboxing.jpg", 
    alt: "Coffret complet et vérification d'authenticité aux normes",
    caption: "Authenticité certifiée aux normes de sécurité avec coffret et numéro SN unique"
  },
];

const REVIEWS_DATA = [
  {
    author: "Lionel D.",
    city: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Il y a 1 jour",
    comment: "Franchement le meilleur gadget tech que j'ai acheté cette année ! Le fait de pouvoir détacher la petite batterie de 5000 mAh pour téléphoner sans fil qui traîne est une révolution. Et l'écran LED fait super classe.",
  },
  {
    author: "Christelle M.",
    city: "Calavi (Bidossessi)",
    rating: 5,
    date: "Il y a 3 jours",
    comment: "Je l'ai prise à cause des coupures de courant fréquentes. Elle recharge mon iPhone 14 plus de 3 fois entièrement à pleine vitesse ! La pochette rigide offerte est très pratique pour la glisser dans mon sac.",
  },
  {
    author: "Arnaud S.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 4 jours",
    comment: "Reçu en 24h chrono. Qualité des finitions au top, on sent la solidité des aimants et des matériaux. Le livreur m'a laissé ouvrir le paquet et tester avant de payer.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne le système modulaire 3-en-1 ?",
    a: "Le système est composé de 3 modules magnétiques intelligents : le module haut avec dragonne et câble USB-C, le bloc central de 10 000 mAh avec écran LED de contrôle, et le module bas de 5 000 mAh doté d'une prise USB-C directe. Vous pouvez les assembler pour former un bloc haute capacité de 15 000 mAh, ou détacher uniquement la petite batterie pour voyager ultra-léger.",
  },
  {
    q: "Est-elle compatible avec mon téléphone (iPhone et Android) ?",
    a: "Oui ! Le port de charge direct et le câble intégré sont en USB-C (compatible iPhone 15/16, Samsung, Xiaomi, Tecno, Infinix, Huawei, etc.). Vous pouvez également brancher n'importe quel câble pour les anciens modèles d'iPhone.",
  },
  {
    q: "À quelle vitesse recharge-t-elle mon smartphone ?",
    a: "Elle est équipée de la technologie 22.5W Fast Charging (Power Delivery & Quick Charge). Elle recharge un smartphone de 0% à 60% en seulement 30 minutes, soit 3 fois plus vite qu'un chargeur standard.",
  },
  {
    q: "Quelles sont les sécurités intégrées ?",
    a: "Elle utilise des cellules de batterie 21700 de grade automobile (standard Tesla) avec une protection militaire multicouche : anti-surchauffe, anti-court-circuit, protection contre les surtensions et régulation thermique intelligente.",
  },
  {
    q: "Comment se déroule la livraison au Bénin ?",
    a: "Livraison rapide sous 24h à Cotonou, Calavi, Porto-Novo et partout au Bénin. Vous payez en espèces ou Mobile Money uniquement après réception et vérification de votre colis.",
  },
];

export default function TrozkLanding({ slug = "trozk" }: { slug?: string }) {
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Autoplay carrousel photos toutes les 3.8s (avec pause au survol)
  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  const sessionIdRef = useRef("sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8));
  const startTimeRef = useRef(Date.now());
  const clickedRef = useRef(false);

  useEffect(() => {
    const save = () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      trackUserSession(slug, duration, clickedRef.current, sessionIdRef.current);
    };

    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("beforeunload", save);
    };
  }, [slug]);

  const scrollToOrder = () => {
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = (document.getElementById("customer-name-input") ||
          el.querySelector("input[type='text'], input[type='tel']")) as HTMLInputElement | null;
        if (input) input.focus({ preventScroll: true });
      }, 400);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    if (!customerName.trim() || !address.trim()) {
      alert("Veuillez renseigner votre nom et votre adresse de livraison.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const finalTotal = selectedBundle.price;
      const finalBundleName = selectedBundle.name;

      const createdOrder = await saveNewOrder({
        product_slug: slug,
        product_title: "Système Électrique Modulaire 3-en-1 Trozk T3™ (15 000 mAh)",
        bundle_name: finalBundleName,
        quantity: selectedBundle.quantity || 1,
        total_amount: finalTotal,
        customer_name: customerName,
        customer_phone: customerPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        shipping_city: city,
        city: city,
        shipping_address: address,
        address: address,
        status: "pending",
      });

      clickedRef.current = true;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      await trackUserSession(slug, duration, true, sessionIdRef.current);

      const orderNumber = createdOrder?.order_number || `ISV-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderInfo({ orderNumber, total: finalTotal, name: customerName, phone: customerPhone });
      setOrderSuccess(true);
      setIsSubmitting(false);

      const upsellConfig = getProductUpsellConfig(slug);
      if (upsellConfig.upsell) {
        router.push(
          `/p/${slug}/upsell?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(String(finalTotal))}`
        );
      } else {
        router.push(
          `/p/${slug}/success?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(String(finalTotal))}`
        );
      }
    } catch (err) {
      console.error("Order submit error:", err);
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#0F172A] font-sans antialiased overflow-x-hidden selection:bg-orange-200 selection:text-orange-950 pb-28 md:pb-0">
      
      {/* 🌟 BANDEAU D'ANNONCE HAUT (100% CLAIR & ÉPURÉ) */}
      <div className="bg-orange-500 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-orange-600 shadow-xs">
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
        <span>ÉDITION OFFICIELLE CYBERPUNK : <strong>Pochette de transport rigide offerte</strong> • Paiement à la livraison après inspection</span>
      </div>

      {/* 🌟 HEADER FIGMA-GRADE */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">TROZK T3™</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                15 000 mAh Modulaire
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection("hero-video")} className="hover:text-slate-900 transition-colors">Vidéo Officielle</button>
            <button onClick={() => scrollToSection("modules")} className="hover:text-slate-900 transition-colors">Les 3 Modules</button>
            <button onClick={() => scrollToSection("specs")} className="hover:text-slate-900 transition-colors">Fiche Technique</button>
            <button onClick={() => scrollToSection("avis")} className="hover:text-slate-900 transition-colors">Avis clients</button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-slate-900 transition-colors">FAQ</button>
          </nav>

          <button
            onClick={scrollToOrder}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-[0_4px_14px_-2px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Commander</span>
            <span className="font-mono text-orange-100 font-semibold">(29 900 F)</span>
          </button>
        </div>
      </header>

      {/* 🚀 OPTION A : HERO BANNER CINÉMATIQUE AVEC VIDÉO IMMERSIVE EN HAUT */}
      <section id="hero-video" className="pt-6 sm:pt-10 pb-8 sm:pb-12 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        
        {/* EN-TÊTE PRINCIPAL FIGMA-GRADE */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/80 px-3.5 py-1.5 rounded-full">
            <div className="flex text-amber-400 text-xs">★★★★★</div>
            <span className="text-xs font-bold text-orange-950">4.9/5 (+1 640 utilisateurs conquis au Bénin)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Système Électrique Modulaire 3-en-1 <span className="text-orange-500 underline decoration-orange-300 decoration-wavy decoration-2">Trozk T3™</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Snap magnétique instantané, écran LED dynamique et mini-batterie de poche 5 000 mAh détachable qui se branche directement sous votre téléphone sans aucun fil.
          </p>
        </div>

        {/* 🎬 LECTEUR VIDÉO HERO CINÉMATIQUE OFFICIEL (OPTION A) */}
        <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(249,115,22,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)] bg-slate-950 aspect-video group">
          <iframe
            src="https://www.youtube-nocookie.com/embed/GksPw7fmexo?autoplay=1&mute=1&loop=1&playlist=GksPw7fmexo&controls=1&playsinline=1&modestbranding=1&rel=0&enablejsapi=1"
            title="Démonstration Vidéo Trozk T3 Modulaire 3-en-1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 object-cover"
          />

          {/* OVERLAY BADGE HAUT */}
          <div className="pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>DÉMONSTRATION OFFICIELLE TROZK • 5 FAÇONS DE L&apos;UTILISER</span>
          </div>

          {/* OVERLAY BADGE BAS DROITE */}
          <div className="pointer-events-none absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 hidden sm:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md text-orange-300 text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl border border-orange-500/20 shadow-md">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>Puissance 22.5W Fast Charge</span>
          </div>
        </div>

        {/* CTA RAPIDE SOUS VIDÉO */}
        <div className="max-w-2xl mx-auto text-center space-y-3 pt-2">
          <button
            onClick={scrollToOrder}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base sm:text-lg py-4 rounded-2xl shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>COMMANDER MAINTENANT (29 900 FCFA)</span>
            <span className="text-orange-100 text-xs sm:text-sm font-normal">— Paiement à la réception</span>
          </button>
        </div>

        {/* 📸 CARROUSEL DE PHOTOS AUTO-DÉFILANT AVEC PAUSE AU SURVOL */}
        <div 
          className="pt-6 max-w-4xl mx-auto"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative rounded-3xl bg-slate-50 border border-slate-200/90 p-3 sm:p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_8px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="relative aspect-[4/3] sm:aspect-[16/9] max-h-[440px] rounded-2xl overflow-hidden bg-[#ECECEE] flex items-center justify-center">
              <img 
                src={CAROUSEL_IMAGES[activeImageIndex].src} 
                alt={CAROUSEL_IMAGES[activeImageIndex].alt}
                className="w-full h-full object-contain transition-all duration-500"
              />
              
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Vue {activeImageIndex + 1} / {CAROUSEL_IMAGES.length}</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 backdrop-blur-md text-white/95 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-center shadow-lg">
                {CAROUSEL_IMAGES[activeImageIndex].caption}
              </div>

              {/* FLÈCHES DE NAVIGATION MANUELLE */}
              <button
                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* MINIATURES SYNCHRONISÉES */}
            <div className="grid grid-cols-6 gap-2 sm:gap-2.5 mt-3">
              {CAROUSEL_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-100 ${
                    activeImageIndex === idx 
                      ? "border-orange-500 ring-2 ring-orange-500/20 shadow-md scale-95" 
                      : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400"
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 BADGES DE RÉASSURANCE CLÉS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto pt-2">
          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Livraison 24h & Test</div>
              <div className="text-[11px] text-slate-500 font-medium">Paiement après vérification</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Cellules 21700 Grade EV</div>
              <div className="text-[11px] text-slate-500 font-medium">Garantie fabricant 1 an</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Pochette Rigide Offerte</div>
              <div className="text-[11px] text-slate-500 font-medium">Coffret zippé sur mesure inclus</div>
            </div>
          </div>
        </div>

      </section>

      {/* 🌟 FORMULAIRE DE COMMANDE DIRECTE (PLACEMENT PRIORITAIRE SOUS HERO VIDÉO & BADGES) */}
      <UmeiStyleOrderSection
        productSlug={slug}
        productTitle="Système Électrique Modulaire 3-en-1 Trozk T3™ (15 000 mAh)"
        productImage="/images/trozk-hero.jpg"
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
        onSubmit={handleSubmit}
        accentColor="#F97316"
        whatsappNumber="2290192901817"
        orderSuccess={orderSuccess}
        orderNumber={orderInfo?.orderNumber}
        onResetOrder={() => {
          setOrderSuccess(false);
          setOrderInfo(null);
        }}
      />

      {/* 🧩 DÉTAIL DES 3 MODULES A, B, C (100% THÈME CLAIR) */}
      <section id="modules" className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3.5 py-1 rounded-full">
            Ingénierie Révolutionnaire
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            L&apos;anatomie du Système 3-en-1 Trozk T3
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Chaque module a été pensé pour répondre à une situation précise de votre quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MODULE A */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-orange-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg shadow-xs">
              A
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Module Câble & Dragonne</h3>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Transport & Câble USB-C</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Intègre une dragonne tressée haute résistance et un câble de recharge rapide USB-C intégré. Vous n&apos;oublierez plus jamais votre câble à la maison.
            </p>
          </div>

          {/* MODULE B */}
          <div className="bg-white border-2 border-orange-500/80 rounded-3xl p-6 space-y-4 shadow-[0_8px_30px_-6px_rgba(249,115,22,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
              Bloc Maître
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-orange-400 flex items-center justify-center font-black text-lg shadow-xs">
              B
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Bloc Central 10 000 mAh</h3>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Écran LED & Charge 22.5W</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Le cœur du système avec son écran rétro-éclairé animé qui indique le pourcentage d&apos;énergie exact et recharge vos appareils à pleine vitesse.
            </p>
          </div>

          {/* MODULE C */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-orange-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-lg shadow-xs">
              C
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Mini-Bloc Poche 5 000 mAh</h3>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Prise Mâle Directe Sans Fil</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Se détache en un geste pour se brancher directement sous votre smartphone. Pèse moins de 90g pour continuer à chatter, jouer ou téléphoner d&apos;une seule main.
            </p>
          </div>

        </div>
      </section>

      {/* 📐 FICHE TECHNIQUE DÉTAILLÉE (100% THÈME CLAIR) */}
      <section id="specs" className="py-14 sm:py-20 bg-slate-50 border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-3.5 py-1 rounded-full shadow-2xs">
              Spécifications Officielles
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Caractéristiques du Modèle TP11
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center">
              <img src="/images/trozk-dimensions.jpg" alt="Dimensions Trozk TP11" className="w-full max-h-[380px] object-contain rounded-2xl" />
            </div>

            <div className="space-y-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Capacité Totale</span>
                <span className="font-mono font-bold text-slate-900 text-sm">15 000 mAh (10000 + 5000)</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Technologie Cellule</span>
                <span className="font-mono font-bold text-slate-900 text-sm">Lithium-ion 21700 Grade Automobile</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Puissance de Charge</span>
                <span className="font-mono font-bold text-orange-600 text-sm">22.5W Fast Charge (PD / QC)</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Dimensions Exactes</span>
                <span className="font-mono font-bold text-slate-900 text-sm">80.4 mm × 28.9 mm × 116 mm</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Accessoire Inclus</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">Pochette rigide zippée antichoc offerte</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 AVIS CLIENTS VÉRIFIÉS (100% THÈME CLAIR FIGMA-GRADE) */}
      <section id="avis" className="py-14 sm:py-20 bg-white px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 px-3.5 py-1 rounded-full text-xs font-bold">
              <span className="text-amber-500">★★★★★</span>
              <span>Avis Vérifiés au Bénin</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Ce que pensent nos premiers utilisateurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS_DATA.map((rev, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/90 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="flex text-amber-400 text-sm">★★★★★</div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    « {rev.comment} »
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{rev.author}</div>
                    <div className="text-orange-600 font-medium">{rev.city}</div>
                  </div>
                  <span className="text-slate-400">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ FOIRE AUX QUESTIONS (100% THÈME CLAIR) */}
      <section id="faq" className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-3.5 py-1 rounded-full shadow-2xs">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Questions Fréquemment Posées
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-5 py-4 text-left font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? "rotate-180 text-orange-500" : ""}`} />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📱 STICKY MOBILE CTA BAR */}
      <StickyMobileCtaBar
        price={29900}
        accentColor="#F97316"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappMessage="Bonjour ! J'aimerais commander la Batterie Modulaire Trozk T3 (29 900 FCFA). Pouvez-vous me renseigner ?"
      />

    </div>
  );
}
