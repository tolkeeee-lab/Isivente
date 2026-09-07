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
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { getProductUpsellConfig } from "@/lib/upsellConfig";

interface ProductBundle {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  price: number;
  originalPrice: number;
  savings: number;
  popular?: boolean;
  quantity: number;
}

const BUNDLES: ProductBundle[] = [
  {
    id: "solo",
    name: "Système Électrique Modulaire 3-en-1 Trozk T3™ (15 000 mAh)",
    subtitle: "Pack complet : 3 Modules magnétiques A+B+C + Câble de charge + Écran LED + Pochette rigide offerte",
    price: 24900,
    originalPrice: 39000,
    savings: 14100,
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
    comment: "Franchement le meilleur gadget tech que j'ai acheté cette année ! Le fait de pouvoir détacher la petite batterie de 5000 mAh pour téléphoner sans fil qui traîne est une révolution. Et l'écran LED fait trop stylé.",
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
    comment: "Reçu en 24h chrono. Qualité des finitions au top, on sent la solidité des aimants et des matériaux. Le livreur m'a laissé ouvrir le paquet avant de payer.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne le système modulaire 3-en-1 ?",
    a: "Le système est composé de 3 modules magnétiques intelligents : le module haut avec dragonne et câble USB-C, le bloc central de 10 000 mAh avec écran LED de contrôle, et le module bas de 5 000 mAh doté d'une prise USB-C directe. Vous pouvez les assembler pour former un bloc haute capacité de 15 000 mAh, ou détacher uniquement la petite batterie pour voyager ultra-léger.",
  },
  {
    q: "Est-elle compatible avec mon téléphone (iPhone et Android) ?",
    a: "Oui ! Le port de charge direct et le câble intégré sont en USB-C (compatible iPhone 15/16, Samsung, Xiaomi, Tecno, Infinix, Huawei, etc.). Vous pouvez également brancher n'importe quel câble Lightning pour les anciens modèles d'iPhone.",
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

const LIVE_DEMO_SUBTITLES = [
  { text: "Snap Magnétique Instantané : Assemblez ou séparez les 3 modules en 1 seconde", highlight: "Modularité 3-en-1" },
  { text: "Charge Directe Sans Câble : Le mini-bloc 5000 mAh se branche directement sous le téléphone", highlight: "Zéro Câble Encombrant" },
  { text: "Écran LED Interactif : Pourcentage précis et détection en direct de chaque module", highlight: "Contrôle en Temps Réel" },
  { text: "Cellules 21700 Grade Automobile : 15 000 mAh réels pour 3 à 4 recharges complètes", highlight: "Puissance 22.5W Éclair" },
];

export default function TrozkLanding({ slug = "trozk" }: { slug?: string }) {
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [includeBump, setIncludeBump] = useState(false);
  const [includeSecondUnit, setIncludeSecondUnit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [demoSubtitleIndex, setDemoSubtitleIndex] = useState(0);

  // Contrôles vidéo MP4 réelle
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Lecture / Pause vidéo
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Son / Muet
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Autoplay carrousel photos toutes les 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Défilement sous-titres démo
  useEffect(() => {
    if (!isPlaying) return;
    const subTimer = setInterval(() => {
      setDemoSubtitleIndex((prev) => (prev + 1) % LIVE_DEMO_SUBTITLES.length);
    }, 3500);
    return () => clearInterval(subTimer);
  }, [isPlaying]);

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

  const upsellConfig = getProductUpsellConfig(slug, "Batterie Modulaire Trozk T3 Cyberpunk", 24900);
  const secondUnitPrice = includeSecondUnit && upsellConfig.secondUnit ? upsellConfig.secondUnit.price : 0;
  const bumpPrice = includeBump && upsellConfig.bump ? upsellConfig.bump.price : 0;
  const totalAmount = selectedBundle.price + secondUnitPrice + bumpPrice;

  const scrollToCommander = () => {
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = document.getElementById("customer-name-input") as HTMLInputElement | null;
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

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const finalBundleName = selectedBundle.name 
        + (includeSecondUnit && upsellConfig.secondUnit ? ` + 2ème Exemplaire (${upsellConfig.secondUnit.title})` : "")
        + (includeBump && upsellConfig.bump ? ` + [BUMP] ${upsellConfig.bump.title}` : "");

      const createdOrder = await saveNewOrder({
        product_slug: slug,
        product_title: "Système Électrique Modulaire 3-en-1 Trozk T3™ (15 000 mAh)",
        bundle_name: finalBundleName,
        quantity: selectedBundle.quantity + (includeSecondUnit ? 1 : 0),
        total_amount: totalAmount,
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
      setOrderInfo({ orderNumber, total: totalAmount, name: customerName, phone: customerPhone });
      setOrderSuccess(true);
      setIsSubmitting(false);

      if (upsellConfig.upsell && !includeSecondUnit) {
        router.push(
          `/p/${slug}/upsell?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(String(totalAmount))}`
        );
      } else {
        router.push(
          `/p/${slug}/success?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(String(totalAmount))}`
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
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-sans antialiased overflow-x-hidden selection:bg-orange-200 selection:text-orange-950 pb-28 md:pb-0">
      
      {/* 🌟 BANDEAU D'URGENCE & CONFIANCE HAUT */}
      <div className="bg-[#0F172A] text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-slate-800">
        <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        <span>⚡ ÉDITION LIMITÉE CYBERPUNK : <strong>Pochette rigide offerte</strong> + Paiement à la livraison après inspection</span>
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
            <button onClick={() => scrollToSection("demo")} className="hover:text-slate-900 transition-colors">Démonstration Vidéo</button>
            <button onClick={() => scrollToSection("modules")} className="hover:text-slate-900 transition-colors">Les 3 Modules</button>
            <button onClick={() => scrollToSection("specs")} className="hover:text-slate-900 transition-colors">Fiche Technique</button>
            <button onClick={() => scrollToSection("avis")} className="hover:text-slate-900 transition-colors">Avis clients</button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-slate-900 transition-colors">FAQ</button>
          </nav>

          <button
            onClick={scrollToCommander}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-[0_4px_14px_-2px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Commander</span>
            <span className="font-mono text-orange-200 font-semibold">(24.900 F)</span>
          </button>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* GALERIE INTERACTIVE */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-[460px] aspect-square rounded-3xl bg-white border border-slate-200/80 p-3 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.08)] overflow-hidden group">
              <img 
                src={CAROUSEL_IMAGES[activeImageIndex].src} 
                alt={CAROUSEL_IMAGES[activeImageIndex].alt}
                className="w-full h-full object-contain rounded-2xl transition-all duration-500 bg-[#ECECEE]"
              />
              <div className="absolute top-5 left-5 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Système Modulaire 3-en-1</span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 bg-slate-900/85 backdrop-blur-md text-white/95 px-3 py-2 rounded-xl text-xs font-medium text-center shadow-lg">
                {CAROUSEL_IMAGES[activeImageIndex].caption}
              </div>
            </div>

            {/* MINIATURES */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mt-4 w-full max-w-[460px]">
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

          {/* TEXTES & HOOK */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/80 px-3.5 py-1.5 rounded-full">
              <div className="flex text-amber-400 text-xs">★★★★★</div>
              <span className="text-xs font-bold text-orange-950">4.9/5 (+1 640 utilisateurs conquis)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Fini les pavés lourds et les fils emmêlés. Voici le <span className="text-orange-500 underline decoration-orange-300 decoration-wavy decoration-2">Système Modulaire 3-en-1</span>.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Snap magnétique, écran LED dynamique et mini-batterie de poche 5 000 mAh détachable qui se branche directement sous votre smartphone sans aucun fil qui traîne.
            </p>

            {/* 4 BADGES CLÉS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">3 Modules A+B+C</div>
                  <div className="text-[11px] text-slate-500 font-medium">Séparables à volonté</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Charge 22.5W Éclair</div>
                  <div className="text-[11px] text-slate-500 font-medium">0 à 60% en 30 min</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Écran LED Rétro</div>
                  <div className="text-[11px] text-slate-500 font-medium">Pourcentage précis</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Cellules 21700 EV</div>
                  <div className="text-[11px] text-slate-500 font-medium">Standard sécurité Tesla</div>
                </div>
              </div>
            </div>

            {/* PRIX & CTA HERO */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 pt-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix Promo Lancement</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-orange-600 tracking-tight">24.900 FCFA</span>
                    <span className="text-base text-slate-400 line-through font-mono">39.000 FCFA</span>
                  </div>
                </div>
                <span className="bg-orange-50 text-orange-700 border border-orange-200 font-bold text-xs px-2.5 py-1 rounded-full">
                  ÉCONOMISEZ 14.100 FCFA
                </span>
              </div>

              <button
                onClick={scrollToCommander}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base sm:text-lg py-4 rounded-2xl shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>COMMANDER MAINTENANT</span>
                <span className="text-orange-200 text-sm font-normal">— Paiement à la réception</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-orange-500" /> Livraison 24h</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Garantie 1 an</span>
                <span className="flex items-center gap-1"><Box className="w-3.5 h-3.5 text-orange-500" /> Sacoche offerte</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🎬 LECTEUR VIDÉO MP4 RÉEL AVEC SON */}
      <section id="demo" className="py-12 sm:py-16 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-950/80 border border-orange-800/80 px-3 py-1 rounded-full">
              Démonstration Vidéo Réelle
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Regardez la batterie Trozk T3 en action
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Découvrez la fluidité du détachement magnétique et le branchement direct sous le smartphone.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 bg-black shadow-2xl max-w-2xl mx-auto aspect-[9/16] sm:aspect-[4/5] max-h-[580px] flex items-center justify-center">
            <video
              ref={videoRef}
              src="/videos/trozk-demo.mp4"
              playsInline
              loop
              autoPlay
              className="w-full h-full object-contain"
            />
            
            {/* BOUTONS FLOTTANTS VIDÉO */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <button
                onClick={toggleMute}
                className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2.5 rounded-full border border-white/20 transition-all cursor-pointer active:scale-95"
                title={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={togglePlay}
                className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2.5 rounded-full border border-white/20 transition-all cursor-pointer active:scale-95"
                title={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
              >
                {isPlaying ? <Pause className="w-4 h-4 text-orange-400" /> : <Play className="w-4 h-4 text-orange-400" />}
              </button>
            </div>

            {/* OVERLAY DYNAMIQUE SOUS-TITRES */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-6 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
              <div className="space-y-1 text-center sm:text-left">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-orange-400 bg-orange-950/90 px-2.5 py-0.5 rounded-md border border-orange-700/60">
                  {LIVE_DEMO_SUBTITLES[demoSubtitleIndex].highlight}
                </span>
                <p className="text-sm sm:text-base font-semibold text-white">
                  {LIVE_DEMO_SUBTITLES[demoSubtitleIndex].text}
                </p>
              </div>

              <button
                onClick={scrollToCommander}
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                Commander (24.900 F)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🧩 DÉTAIL DES 3 MODULES A, B, C */}
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs hover:border-orange-300 transition-all">
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
          <div className="bg-white border-2 border-orange-500/80 rounded-3xl p-6 space-y-4 shadow-md relative overflow-hidden">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs hover:border-orange-300 transition-all">
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

      {/* 📐 FICHE TECHNIQUE DÉTAILLÉE */}
      <section id="specs" className="py-14 sm:py-20 bg-slate-100/80 border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-3.5 py-1 rounded-full">
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

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Capacité Totale</span>
                <span className="font-mono font-bold text-slate-900 text-sm">15 000 mAh (10000 + 5000)</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Technologie Cellule</span>
                <span className="font-mono font-bold text-slate-900 text-sm">Lithium-ion 21700 Grade Automobile</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Puissance de Charge</span>
                <span className="font-mono font-bold text-orange-600 text-sm">22.5W Fast Charge (PD / QC)</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Dimensions Exactes</span>
                <span className="font-mono font-bold text-slate-900 text-sm">80.4 mm × 28.9 mm × 116 mm</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Accessoire Inclus</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">Pochette rigide zippée antichoc offerte</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 AVIS CLIENTS VÉRIFIÉS */}
      <section id="avis" className="py-14 sm:py-20 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-orange-950/80 border border-orange-800 text-orange-400 px-3.5 py-1 rounded-full text-xs font-bold">
              <span>★★★★★</span>
              <span>Avis Vérifiés au Bénin</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ce que pensent nos premiers utilisateurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS_DATA.map((rev, i) => (
              <div key={i} className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber-400 text-sm">★★★★★</div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    « {rev.comment} »
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{rev.author}</div>
                    <div className="text-orange-400 font-medium">{rev.city}</div>
                  </div>
                  <span className="text-slate-500">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📦 FORMULAIRE DE COMMANDE UMEI-STYLE COD 1-CLIC */}
      <section id="commander" className="py-14 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-white border-2 border-orange-500/40 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          
          <div className="text-center space-y-2 border-b border-slate-100 pb-6">
            <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              Étape Finale — Formulaire Express
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Commandez votre Trozk T3 Modulaire™
            </h2>
            <p className="text-sm text-slate-500">
              Remplissez vos coordonnées. Vous ne payez qu&apos;au livreur après inspection du coffret.
            </p>
          </div>

          {/* RÉCAPITULATIF DE L'OFFRE PRINCIPALE */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img src="/images/trozk-hero.jpg" alt="Batterie Trozk T3" className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">Système Modulaire 3-en-1 Trozk T3 (15 000 mAh)</h4>
                <p className="text-xs text-slate-500">Pack complet A+B+C + Écran LED + Sacoche de transport offerte</p>
                <div className="text-xs font-bold text-orange-600 mt-0.5">✓ En stock — Expédition 24h</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl sm:text-2xl font-black font-mono text-orange-600">24.900 F</div>
              <div className="text-xs text-slate-400 line-through font-mono">39.000 F</div>
            </div>
          </div>

          {/* OFFRE BUMP / CÂBLE 60W */}
          {upsellConfig.bump && (
            <div 
              onClick={() => setIncludeBump(!includeBump)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                includeBump 
                  ? "bg-amber-50/80 border-amber-500 shadow-sm" 
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={includeBump} 
                  onChange={() => {}} 
                  className="w-5 h-5 rounded text-amber-600 accent-amber-600 cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                    {upsellConfig.bump.badge || "OFFRE ACCESSOIRE"}
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{upsellConfig.bump.title}</div>
                  <div className="text-xs text-slate-500">{upsellConfig.bump.subtitle}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base font-bold font-mono text-amber-700">+{upsellConfig.bump.price.toLocaleString("fr-FR")} F</div>
                <div className="text-[11px] text-slate-400 line-through font-mono">{upsellConfig.bump.originalPrice.toLocaleString("fr-FR")} F</div>
              </div>
            </div>
          )}

          {/* OFFRE 2ÈME UNITÉ AVEC RÉDUCTION */}
          {upsellConfig.secondUnit && (
            <div 
              onClick={() => setIncludeSecondUnit(!includeSecondUnit)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                includeSecondUnit 
                  ? "bg-orange-50/80 border-orange-500 shadow-sm" 
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={includeSecondUnit} 
                  onChange={() => {}} 
                  className="w-5 h-5 rounded text-orange-600 accent-orange-600 cursor-pointer shrink-0"
                />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-800 bg-orange-200/80 px-2 py-0.5 rounded">
                    {upsellConfig.secondUnit.badge || "🎁 -32% SUR LA 2ÈME BATTERIE"}
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{upsellConfig.secondUnit.title}</div>
                  <div className="text-xs text-slate-500">{upsellConfig.secondUnit.subtitle}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base font-bold font-mono text-orange-700">+{upsellConfig.secondUnit.price.toLocaleString("fr-FR")} F</div>
                <div className="text-[11px] text-slate-400 line-through font-mono">{upsellConfig.secondUnit.originalPrice.toLocaleString("fr-FR")} F</div>
              </div>
            </div>
          )}

          {/* FORMULAIRE INPUTS */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nom complet *
              </label>
              <input
                id="customer-name-input"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Lionel Dossou"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Numéro de téléphone (WhatsApp si possible) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ex: 97 00 00 00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Numéro secondaire (optionnel)
                </label>
                <input
                  type="tel"
                  value={customerPhone2}
                  onChange={(e) => setCustomerPhone2(e.target.value)}
                  placeholder="Ex: 61 00 00 00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ville / Commune *
                </label>
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-slate-50/50"
                >
                  <option value="">Sélectionnez votre ville</option>
                  <option value="Cotonou">Cotonou (Livraison Express 24h)</option>
                  <option value="Abomey-Calavi">Abomey-Calavi (Livraison Express 24h)</option>
                  <option value="Porto-Novo">Porto-Novo (Livraison Express 24h)</option>
                  <option value="Parakou">Parakou</option>
                  <option value="Bohicon / Abomey">Bohicon / Abomey</option>
                  <option value="Ouidah">Ouidah</option>
                  <option value="Autre ville">Autre ville du Bénin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Quartier / Adresse précise *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Haie Vive, en face du restaurant"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>
            </div>

            {/* TOTAL À PAYER */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium">Total à payer à la livraison :</div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-orange-600">
                  {totalAmount.toLocaleString("fr-FR")} FCFA
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-medium">
                <div>Frais de port : Inclus ou selon zone</div>
                <div className="text-orange-600 font-bold">Paiement après vérification</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-lg py-4 rounded-2xl shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Validation en cours...</span>
                </div>
              ) : (
                <span>CONFIRMER MA COMMANDE — {totalAmount.toLocaleString("fr-FR")} FCFA</span>
              )}
            </button>
          </form>

        </div>
      </section>

      {/* ❓ FOIRE AUX QUESTIONS */}
      <section id="faq" className="py-14 sm:py-20 bg-slate-100/80 border-t border-slate-200 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-3.5 py-1 rounded-full">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Questions Fréquemment Posées
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
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
        price={24900}
        accentColor="#F97316"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappMessage="Bonjour ! J'aimerais commander la Batterie Modulaire Trozk T3 Cyberpunk (24 900 FCFA). Pouvez-vous me renseigner ?"
      />

    </div>
  );
}
