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
  Camera,
  Eye,
  Wifi,
  Moon,
  BatteryCharging,
  Bell,
  Smartphone,
  ShieldAlert,
  Play,
  Pause,
  Layers,
  Lock,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Store,
  Home,
  Car,
  Warehouse
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { getProductUpsellConfig } from "@/lib/upsellConfig";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Mini Caméra Espionne & Surveillance HD A9 Pro™",
    subtitle: "Pack complet : Caméra HD + Support magnétique 360° + Câble de charge + App mobile en français",
    price: 16900,
    originalPrice: 25000,
    savings: 8100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/camera-hero.jpg", 
    alt: "Mini Caméra Magnétique HD A9 Pro",
    caption: "Format micro-cube furtif avec lentille optique grand angle 150°"
  },
  { 
    src: "/images/camera-app.jpg", 
    alt: "Vision en direct sur smartphone avec alerte mouvement",
    caption: "Diffusion HD en direct sur votre téléphone (Android & iPhone) où que vous soyez"
  },
  { 
    src: "/images/camera-night.jpg", 
    alt: "Vision nocturne infrarouge dans le noir total",
    caption: "Vision nocturne infrarouge haute précision 100% invisible à l'œil nu"
  },
  { 
    src: "/images/camera-discreet.jpg", 
    alt: "Installation magnétique discrète en boutique ou maison",
    caption: "Fixation magnétique instantanée sous étagère, caisse, mur ou véhicule"
  },
];

const REVIEWS_DATA = [
  {
    author: "Brice T.",
    city: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Installée discrètement derrière ma caisse dans ma boutique de prêt-à-porter. La qualité d'image en direct sur mon téléphone est bluffante, même la nuit !",
  },
  {
    author: "Amina K.",
    city: "Calavi (Arconville)",
    rating: 5,
    date: "Il y a 3 jours",
    comment: "Je l'ai prise pour surveiller la nounou avec mon bébé de 10 mois quand je suis au travail. L'aimant tient super bien sur le frigo, et l'application est très simple.",
  },
  {
    author: "Marc O.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 5 jours",
    comment: "Reçu en moins de 24h à Porto-Novo. Livreur très courtois, j'ai vérifié le colis avant de payer. La détection de mouvement m'envoie une notification instantanée dès que quelqu'un entre.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne la caméra sans fil ?",
    a: "La mini caméra dispose d'une batterie rechargeable intégrée et se connecte en WiFi ou en point d'accès direct à votre téléphone (Android ou iPhone) via une application gratuite en français. Vous pouvez voir en direct ce qui se passe où que vous soyez.",
  },
  {
    q: "Peut-elle fonctionner sans WiFi ?",
    a: "Oui absolument ! Vous pouvez insérer une carte mémoire MicroSD : elle enregistre alors en continu en boucle sans avoir besoin d'internet. Vous pouvez aussi vous connecter directement en Bluetooth/Hotspot local à côté.",
  },
  {
    q: "Est-elle visible dans le noir ?",
    a: "Non ! Ses LED infrarouges de vision nocturne sont invisibles à l'œil nu (pas de lumière rouge voyante), ce qui permet une discrétion totale même dans l'obscurité complète.",
  },
  {
    q: "Comment s'installe-t-elle ?",
    a: "Grâce à son aimant surpuissant intégré, elle se fixe instantanément sur n'importe quel métal (étagère, montant de porte, réfrigérateur, carrosserie). Un support rotatif 360° adhésif est également inclus pour les murs.",
  },
  {
    q: "Comment se passe la livraison au Bénin ?",
    a: "Livraison express en 24h à Cotonou, Calavi, Porto-Novo et partout au Bénin. Vous payez en espèces ou Mobile Money uniquement après avoir reçu et inspecté votre colis.",
  },
];

const LIVE_DEMO_SUBTITLES = [
  { text: "Lentille HD Grand Angle 150° : Couvre toute la pièce sans angle mort", highlight: "Champ Ultra-Large" },
  { text: "Détection humaine intelligente : Notification instantanée sur votre smartphone", highlight: "Alerte en Direct" },
  { text: "Vision nocturne infrarouge : Clarté totale même dans le noir complet", highlight: "Vision Nuit 100% Invisible" },
  { text: "Fixation magnétique 360° : Se pose et se cache en 2 secondes chrono", highlight: "Discrétion Absolue" },
];

export default function CameraLanding({ slug = "camera" }: { slug?: string }) {
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [demoSubtitleIndex, setDemoSubtitleIndex] = useState(0);
  const [isDemoPlaying, setIsDemoPlaying] = useState(true);

  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Autoplay carrousel photos toutes les 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Défilement sous-titres démo
  useEffect(() => {
    if (!isDemoPlaying) return;
    const subTimer = setInterval(() => {
      setDemoSubtitleIndex((prev) => (prev + 1) % LIVE_DEMO_SUBTITLES.length);
    }, 3500);
    return () => clearInterval(subTimer);
  }, [isDemoPlaying]);

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
        product_title: "Mini Caméra Espionne & Surveillance Magnétique HD A9 Pro™",
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
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] font-sans antialiased overflow-x-hidden selection:bg-slate-200 selection:text-slate-900 pb-28 md:pb-0">
      
      {/* 🌟 BANDEAU D'URGENCE & CONFIANCE HAUT */}
      <div className="bg-slate-900 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 border-b border-slate-800">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>🔥 OFFRE SPÉCIALE BÉNIN : <strong>-35% de réduction</strong> + Paiement à la réception après vérification</span>
      </div>

      {/* 🌟 HEADER FIGMA-GRADE */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
              <Camera className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">A9 PRO™</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Surveillance HD
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection("demo")} className="hover:text-slate-900 transition-colors">Démonstration</button>
            <button onClick={() => scrollToSection("avantages")} className="hover:text-slate-900 transition-colors">Avantages</button>
            <button onClick={() => scrollToSection("comment-ca-marche")} className="hover:text-slate-900 transition-colors">Fonctionnement</button>
            <button onClick={() => scrollToSection("avis")} className="hover:text-slate-900 transition-colors">Avis clients</button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-slate-900 transition-colors">FAQ</button>
          </nav>

          <button
            onClick={scrollToOrder}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-[0_4px_14px_-2px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Commander</span>
            <span className="font-mono text-emerald-200 font-semibold">(16.900 F)</span>
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
                className="w-full h-full object-cover rounded-2xl transition-all duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute top-5 left-5 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Micro-Format Discret</span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 bg-slate-900/80 backdrop-blur-md text-white/95 px-3 py-2 rounded-xl text-xs font-medium text-center shadow-lg">
                {CAROUSEL_IMAGES[activeImageIndex].caption}
              </div>
            </div>

            {/* MINIATURES */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mt-4 w-full max-w-[460px]">
              {CAROUSEL_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx 
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-95" 
                      : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400"
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* TEXTES & SOCIAL PROOF */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full">
              <div className="flex text-amber-400 text-xs">★★★★★</div>
              <span className="text-xs font-bold text-emerald-900">4.9/5 (+1 850 propriétaires & commerçants rassurés)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Gardez un œil sur votre <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">boutique & maison</span>, où que vous soyez.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              La mini-caméra sans fil qui se dissimule partout. Visionnage en direct sur smartphone, alertes de mouvement instantanées et vision nocturne 100% invisible.
            </p>

            {/* BADGES CLÉS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Vision Direct</div>
                  <div className="text-[11px] text-slate-500 font-medium">Sur Android & iPhone</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Vision Nuit HD</div>
                  <div className="text-[11px] text-slate-500 font-medium">Infrarouge invisible</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Détection Alerte</div>
                  <div className="text-[11px] text-slate-500 font-medium">Notification au vol</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Pose Aimantée</div>
                  <div className="text-[11px] text-slate-500 font-medium">Support rotatif 360°</div>
                </div>
              </div>
            </div>

            {/* PRIX & BOUTON COMMANDE RAPIDE */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 pt-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix Spécial Lancement</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 tracking-tight">16.900 FCFA</span>
                    <span className="text-base text-slate-400 line-through font-mono">25.000 FCFA</span>
                  </div>
                </div>
                <span className="bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-2.5 py-1 rounded-full">
                  ÉCONOMISEZ 8.100 FCFA
                </span>
              </div>

              <button
                onClick={scrollToOrder}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base sm:text-lg py-4 rounded-2xl shadow-[0_8px_24px_-4px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>COMMANDER MAINTENANT</span>
                <span className="text-emerald-200 text-sm font-normal">— Paiement à la livraison</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-600" /> Livraison 24h</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Garantie échange</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Test avant paiement</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🌟 FORMULAIRE DE COMMANDE DIRECTE (MODÈLE UMÉI ÉPURÉ - UN SEUL CHOIX SANS PACK) */}
      <UmeiStyleOrderSection
        productSlug={slug}
        productTitle="Mini Caméra Espionne & Surveillance Magnétique HD A9 Pro™"
        productImage="/images/camera-hero.jpg"
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
        accentColor="#059669"
        whatsappNumber="2290192901817"
        orderSuccess={orderSuccess}
        orderNumber={orderInfo?.orderNumber}
        onResetOrder={() => {
          setOrderSuccess(false);
          setOrderInfo(null);
        }}
      />

      {/* 🎬 DÉMONSTRATION EN DIRECT & SIMULATEUR */}
      <section id="demo" className="py-12 sm:py-16 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-full">
              Démonstration Vidéo & Live
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Voyez exactement ce qu&apos;elle voit, en temps réel.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Grâce à l&apos;application dédiée, vous accédez au flux vidéo ultra-fluide depuis n&apos;importe quelle connexion.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl max-w-3xl mx-auto">
            <img 
              src="/images/camera-app.jpg" 
              alt="Simulation flux vidéo en direct"
              className="w-full h-auto object-cover max-h-[460px] opacity-90"
            />
            
            {/* OVERLAY DYNAMIQUE SOUS-TITRES */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-700/50">
                  {LIVE_DEMO_SUBTITLES[demoSubtitleIndex].highlight}
                </span>
                <p className="text-sm sm:text-base font-semibold text-white">
                  {LIVE_DEMO_SUBTITLES[demoSubtitleIndex].text}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsDemoPlaying(!isDemoPlaying)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {isDemoPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isDemoPlaying ? "Pause" : "Lecture"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛑 PROBLÈME VS SOLUTION */}
      <section id="avantages" className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-3.5 py-1 rounded-full">
            Sécurité vs Frustration
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Pourquoi les caméras traditionnelles sont un calvaire
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Plus besoin de percer les murs, de tirer des câbles ou de payer des abonnements mensuels ruineux.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ANCIENNE MÉTHODE */}
          <div className="bg-red-50/50 border border-red-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Systèmes Classiques Encombrants</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>Coût excessif (70.000 à 150.000 FCFA + technicien d&apos;installation).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>Fils électriques visibles et travaux de perçage obligatoires.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>Trop visibles : les intrus les repèrent et les débranchent aussitôt.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold shrink-0">✕</span>
                <span>Inutilisables dans la voiture ou en déplacement.</span>
              </li>
            </ul>
          </div>

          {/* SOLUTION A9 PRO */}
          <div className="bg-emerald-50/60 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
              Recommandé
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">La Mini Caméra A9 Pro™</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>16.900 FCFA tout compris</strong>, sans abonnement ni frais cachés.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>100% Sans Fil & Magnétique</strong> : se fixe sur n&apos;importe quel métal en 1s.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Discrétion Furtive</strong> : taille micro-cube indétectable pour une surveillance efficace.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Nomade</strong> : fonctionne à la maison, en boutique, en voiture ou sur batterie externe.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 🏢 4 CAS D'USAGE AU QUOTIDIEN AU BÉNIN */}
      <section className="py-14 sm:py-20 bg-slate-100/70 border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
              Polyvalence Totale
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Une seule caméra pour tous vos besoins de protection
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Idéale pour les commerçants, les parents et les propriétaires soucieux de la sécurité de leurs biens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Boutique & Caisse</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Surveillez les encaissements, le stock et les allées et venues de vos employés et clients en direct.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Maison & Nounou</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gardez un œil rassurant sur vos enfants, le travail de la nounou ou les visiteurs pendant votre absence.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Véhicule & Parking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Placez-la dans la boîte à gants ou sur le tableau de bord pour enregistrer toute tentative d&apos;effraction.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Warehouse className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Entrepôt & Chantier</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sécurisez vos matériaux, outils et marchandises même dans les zones isolées sans prise de courant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ⚙️ COMMENT ÇA MARCHE EN 3 ÉTAPES */}
      <section id="comment-ca-marche" className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-3.5 py-1 rounded-full">
            Prise en Main Express
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Installée et configurée en moins de 60 secondes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Aucune compétence technique nécessaire. Suivez simplement ces 3 étapes :
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Aimantez</h4>
            <p className="text-sm text-slate-600">
              Posez la caméra sur n&apos;importe quelle surface métallique ou fixez le support adhésif 360° au mur.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Connectez</h4>
            <p className="text-sm text-slate-600">
              Ouvrez l&apos;application gratuite sur votre smartphone (Android/iPhone) et scannez la caméra en 1 clic.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Surveillez</h4>
            <p className="text-sm text-slate-600">
              Regardez en direct, activez les alertes de détection et relisez vos vidéos enregistrées sans effort.
            </p>
          </div>
        </div>
      </section>

      {/* 🌟 AVIS CLIENTS VÉRIFIÉS */}
      <section id="avis" className="py-14 sm:py-20 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-3.5 py-1 rounded-full text-xs font-bold">
              <span>★★★★★</span>
              <span>Avis Vérifiés au Bénin</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ce que disent nos clients satisfaits
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
                    <div className="text-emerald-400 font-medium">{rev.city}</div>
                  </div>
                  <span className="text-slate-500">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
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
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? "rotate-180 text-emerald-600" : ""}`} />
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
        price={16900}
        accentColor="#059669"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappMessage="Bonjour ! J'aimerais commander la Mini Caméra Espionne HD A9 Pro (16 900 FCFA). Pouvez-vous me renseigner ?"
      />

    </div>
  );
}
