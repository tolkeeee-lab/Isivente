"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Layers,
  Award,
  Video,
  Radio,
  Sliders,
  Maximize2,
  Play,
  Pause,
  Volume2,
  VolumeX
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import HorizontalCarousel from "@/components/ui/HorizontalCarousel";
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
    name: "Pack Solo Créateur (1 Kit)",
    subtitle: "1 Stabilisateur Z3 Zoom + Télécommande + Bague MagSafe + Câble",
    price: 49900,
    originalPrice: 65000,
    savings: 15100,
    quantity: 1,
  },
  {
    id: "duo",
    name: "Pack Duo Studio (2 Kits)",
    subtitle: "2 Stabilisateurs complets + 2 Anneaux MagSafe supplémentaires",
    badge: "🔥 L'OFFRE LA PLUS CHOISIE (ÉCONOMISEZ 40 100 F)",
    price: 89900,
    originalPrice: 130000,
    savings: 40100,
    popular: true,
    quantity: 2,
  },
  {
    id: "trio",
    name: "Pack Pro Équipe & Vidéaste (3 Kits)",
    subtitle: "3 Stabilisateurs complets + Kit fixations studio",
    badge: "💎 MEILLEUR PRIX / APPAREIL",
    price: 129900,
    originalPrice: 195000,
    savings: 65100,
    quantity: 3,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/stabilisateur-angles-rotation-360.jpg",
    alt: "Stabilisateur Z3 Zoom multi-angle 360 degrés en main",
    caption: "Polyvalence 3-en-1 : Poignée Gimbal, Perche extensible & Trépied de table",
  },
  {
    src: "/images/stabilisateur-force-magnetique-20n.jpg",
    alt: "Force magnétique ultra-forte 20N et compatibilité universelle",
    caption: "Force magnétique 20N ultra-sécurisée (iPhone MagSafe & 3 bagues Android incluses)",
  },
  {
    src: "/images/stabilisateur-telecommande-10m.jpg",
    alt: "Télécommande Bluetooth détachable 10 mètres et trépied",
    caption: "Télécommande sans fil détachable 10m rechargeable par USB-C",
  },
  {
    src: "/images/stabilisateur-perche-extensible.jpg",
    alt: "Perche à selfie extensible en extérieur",
    caption: "Perche télescopique ultra-légère pour des prises de vue grand angle",
  },
  {
    src: "/images/stabilisateur-guide-fonctions.jpg",
    alt: "Guide des fonctions d'accessibilité et voyants LED",
    caption: "Connexion Bluetooth express en 3s (WONEW-M) & indicateurs LED intelligents",
  },
];

const REVIEWS = [
  {
    author: "Marc-Aurèle K.",
    city: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Je fais des vidéos pour ma boutique de vêtements sur TikTok. Avant mes vidéos tremblaient toujours. Avec ce Z3, la qualité fait pro comme avec un iPhone 15 Pro sur caméra de cinéma ! La bague MagSafe tient très fort avec les 20N annoncés.",
  },
  {
    author: "Nadège T.",
    city: "Abomey-Calavi",
    rating: 5,
    date: "Il y a 3 jours",
    comment: "Le zoom à distance avec la télécommande détachable est génial ! Je pose le trépied sur la table et je gère mes prises sans toucher au téléphone. La batterie USB-C tient des jours. Livraison reçue le jour même en main propre.",
  },
  {
    author: "Yannick D.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 5 jours",
    comment: "J'ai pris le pack duo pour moi et ma sœur qui est photographe. Rien à dire, l'aluminium est de qualité supérieure et le trépied ne bouge pas d'un millimètre. Les 3 bagues fournies m'ont permis d'équiper mon Samsung aussi.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Est-il compatible avec mon téléphone (iPhone et Android) ?",
    a: "Oui, à 100% ! Il est directement compatible avec tous les iPhones MagSafe (séries 12, 13, 14, 15, 16, 17). Pour tous les autres téléphones (Samsung, Xiaomi, Tecno, Infinix, Huawei, etc.), 3 bagues métalliques ultra-minces adhésives sont incluses gratuitement dans le kit.",
  },
  {
    q: "Comment fonctionne la télécommande sans fil détachable ?",
    a: "La poignée intègre une télécommande Bluetooth amovible avec aimant de maintien et batterie rechargeable en USB-C (pas besoin de piles). Vous pouvez l'utiliser clipsée sur le stabilisateur ou la détacher pour déclencher vos photos/vidéos et zoomer jusqu'à 10 mètres de distance.",
  },
  {
    q: "Comment s'effectue la connexion au téléphone ?",
    a: "En 3 secondes chrono sans aucune application à installer ! Activez le commutateur ON sur le stabilisateur (le voyant bleu clignote), allez dans Réglages > Bluetooth sur votre téléphone et cliquez sur « WONEW-M ». Vous êtes prêt à filmer.",
  },
  {
    q: "Comment se fait la livraison et le paiement ?",
    a: "Nous livrons partout au Bénin sous 24h à 48h. Vous ne payez rien d'avance : vous inspectez le colis à l'arrivée et réglez en espèces ou Mobile Money directement au livreur.",
  },
  {
    q: "Le trépied est-il solide ?",
    a: "Absolument. La base s'ouvre en 3 pieds renforcés en alliage d'aluminium avec patins en silicone antidérapants pour garantir une stabilité totale sur table, sol, bitume ou herbe.",
  },
];

export default function StabilizerLanding({ slug = "stabilisateur" }: { slug?: string }) {
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle>(BUNDLES[0]);
  const [includeBump, setIncludeBump] = useState(false);
  const [includeSecondUnit, setIncludeSecondUnit] = useState(false);
  const upsellConfig = getProductUpsellConfig(slug || "stabilisateur");
  const secondUnitOffer = upsellConfig?.secondUnit;
  const bumpOffer = upsellConfig?.bump;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contrôles Lecteur Vidéo MP4 Local
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Autoplay carrousel d'images HD toutes les 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert("Veuillez saisir un numéro de téléphone valide pour la confirmation de livraison.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const secondUnitPrice = includeSecondUnit && secondUnitOffer ? secondUnitOffer.price : 0;
      const bumpPrice = includeBump && bumpOffer ? bumpOffer.price : 0;
      const finalTotal = selectedBundle.price + secondUnitPrice + bumpPrice;
      const finalBundleName = selectedBundle.name 
        + (includeSecondUnit && secondUnitOffer ? ` + 2ème Stabilisateur (${secondUnitOffer.title})` : "")
        + (includeBump && bumpOffer ? ` + ${bumpOffer.title}` : "");

      const orderPayload = {
        product_slug: slug,
        product_title: "Stabilisateur Pro-Mobile Z3 Zoom™",
        bundle_id: selectedBundle.id,
        bundle_name: finalBundleName,
        quantity: (selectedBundle.quantity || 1) + (includeSecondUnit ? 1 : 0),
        total_amount: finalTotal,
        customer_name: customerName || "Client",
        customer_phone: customerPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        shipping_city: city || "Cotonou",
        city: city || "Cotonou",
        shipping_address: address || "",
        address: address || "",
        status: "pending" as const,
      };

      const res = await saveNewOrder(orderPayload);
      clickedRef.current = true;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      await trackUserSession(slug, duration, true, sessionIdRef.current);

      const orderNum = res?.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
      setOrderInfo({ order_number: orderNum });
      setOrderSuccess(true);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      document.getElementById("commander")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Order error:", err);
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* 🌟 BANDEAU SUPÉRIEUR D'URGENCE SOLAIRE */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 py-2.5 px-4 text-center text-xs font-bold tracking-wide shadow-sm flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 fill-current" />
        <span>OFFRE FLASH : -35% DE RÉDUCTION + PAIEMENT À LA RÉCEPTION AU BÉNIN</span>
        <Sparkles className="w-3.5 h-3.5 fill-current" />
      </div>

      {/* 🌟 HEADER ÉPURÉ LUXURY LIGHT */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black font-display text-base shadow-sm">
              Z3
            </div>
            <div>
              <span className="font-display font-black tracking-tight text-slate-950 text-base sm:text-lg">
                STABILISATEUR PRO-MOBILE
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-amber-600 font-bold -mt-0.5">
                WONEW™ Z3 ZOOM MAGSAFE
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToOrder}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md shadow-amber-500/20"
          >
            Commander
          </button>
        </div>
      </header>

      {/* 🌟 HERO SECTION */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* GAUCHE : GALERIE D'IMAGES HD AVEC CARROUSEL */}
          <div className="lg:col-span-7">
            <HorizontalCarousel
              slides={CAROUSEL_IMAGES}
              accentColor="#F59E0B"
              autoplayInterval={4500}
            />
          </div>

          {/* DROITE : ARGUMENTAIRE & OFFRE HORMOZI */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-slate-600 font-mono font-bold">4.9/5 (184 avis vérifiés)</span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
                Stabilisateur Pro-Mobile Z3 Zoom™
              </h1>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed font-medium">
                Transformez instantanément votre smartphone en une véritable <strong className="text-slate-900">caméra de cinéma sans aucun tremblement</strong>. Fixation magnétique MagSafe, contrôle de zoom sans fil et trépied déployable en 1 seconde.
              </p>
            </div>

            {/* POINTS FORTS TACTILES */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Zéro Tremblement</div>
                  <div className="text-slate-500 text-[11px]">Vidéos ultra-fluides</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200/60">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">MagSafe Instantané</div>
                  <div className="text-slate-500 text-[11px]">Clipse en 0.5s</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Zoom Sans Fil</div>
                  <div className="text-slate-500 text-[11px]">Télécommande 10m</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Trépied Intégré</div>
                  <div className="text-slate-500 text-[11px]">Pieds renforcés</div>
                </div>
              </div>
            </div>

            {/* BLOC PRIX PROMO FLASH */}
            <div className="bg-amber-50/70 border border-amber-300/80 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    Offre Spéciale Lancement
                  </span>
                  <div className="font-mono font-black text-2xl sm:text-3xl text-slate-950 mt-1 tabular-nums">
                    49 900 F <span className="text-xs font-semibold text-slate-500 font-sans">CFA</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 line-through block tabular-nums">
                    65 000 F
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Économisez 15 100 F
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 space-y-1.5 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>1x Stabilisateur Z3 Zoom + Télécommande Type-C</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>3x Bagues magnétiques Android offertes</span>
                </div>
              </div>
            </div>

            {/* CTA RAPIDE */}
            <button
              type="button"
              onClick={scrollToOrder}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all text-sm uppercase tracking-wider"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>S&apos;offrir le Kit Studio Z3 Zoom</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Livraison 24h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Paiement à la livraison</span>
              </div>
            </div>

          </div>

        </div>

        {/* 🌟 FORMULAIRE DE COMMANDE DIRECTE (MODÈLE UMÉI PLACÉ DIRECTEMENT SOUS LA PRÉSENTATION) */}
        <UmeiStyleOrderSection
          productSlug={slug}
          productTitle="Stabilisateur Pro-Mobile Z3 Zoom™"
          bundles={BUNDLES}
          selectedBundle={selectedBundle}
          onSelectBundle={(b) => setSelectedBundle(b as ProductBundle)}
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
          includeBump={includeBump}
          setIncludeBump={setIncludeBump}
          bumpOffer={bumpOffer}
          includeSecondUnit={includeSecondUnit}
          setIncludeSecondUnit={setIncludeSecondUnit}
          secondUnitOffer={secondUnitOffer}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          accentColor="#F59E0B"
          whatsappNumber="2290192901817"
          orderSuccess={orderSuccess}
          orderNumber={orderInfo?.order_number}
          onResetOrder={() => {
            setOrderSuccess(false);
            setOrderInfo(null);
          }}
        />

        {/* 🌟 SECTION VIDÉO DÉMONSTRATION EN DIRECT (MP4 HÉBERGÉ LOCALEMENT) */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-current text-amber-600" />
              <span>Démonstration & Prise en Main Réelle</span>
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Voyez le Z3 Zoom™ en action réelle
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Découvrez la facilité d&apos;aimantation MagSafe, la stabilité en marchant et le contrôle de zoom sans fil en vidéo.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* LECTEUR VIDÉO MP4 NATIF ULTRA-RAPIDE INTÉGRÉ DANS UN CHÂSSIS SMARTPHONE */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[340px] bg-slate-950 rounded-3xl p-2.5 sm:p-3 border border-slate-700/80 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                  {/* Encoche Smartphone Haut */}
                  <div className="flex items-center justify-between px-3 py-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="font-bold text-slate-200">DÉMO VIDÉO</span>
                    </span>
                    <span>Z3 ZOOM PRO</span>
                  </div>

                  {/* CONTENEUR VIDÉO AVEC COMMANDES TACTILES */}
                  <div 
                    onClick={togglePlay}
                    className="relative w-full rounded-2xl overflow-hidden bg-black aspect-[9/16] min-h-[500px] max-h-[580px] cursor-pointer group select-none"
                  >
                    <video
                      ref={videoRef}
                      src="/videos/stabilisateur-demo.mp4"
                      poster="/images/stabilisateur-video-poster.jpg"
                      preload="metadata"
                      playsInline
                      loop
                      muted={isMuted}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full h-full object-cover"
                    />

                    {/* OVERLAY BOUTON PLAY AU CENTRE LORSQU'EN PAUSE */}
                    {!isPlaying && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-200 active:scale-95">
                          <Play className="w-7 h-7 fill-current ml-1" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white bg-slate-900/80 px-3 py-1 rounded-full border border-white/20">
                          Lancer la vidéo
                        </span>
                      </div>
                    )}

                    {/* CONTRÔLEUR DU SON EN BAS À DROITE */}
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="absolute bottom-3 right-3 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white border border-white/20 shadow-lg active:scale-90 transition-all cursor-pointer z-10"
                      title={isMuted ? "Activer le son" : "Couper le son"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ARGUMENTS CLÉS VUS DANS LA VIDÉO */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    Ce que vous observez en direct
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white mt-2">
                    L&apos;accessoire studio indispensable pour filmer comme un pro
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                    <div className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Aimantation Instantanée</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Posez simplement votre téléphone : le cercle MagSafe se verrouille d&apos;un claquement franc et sécurisé.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                    <div className="font-bold text-sky-400 text-xs flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Zoom Millimétrique</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      La molette physique permet de zoomer avec fluidité cinéma sans jamais masquer l&apos;écran avec vos doigts.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                    <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Déploiement en 1 Clic</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Se transforme en perche télescopique ou en trépied autoportant en une seconde chrono.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                    <div className="font-bold text-purple-400 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Format Poche Pliable</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Ultra-léger et compact, il vous accompagne dans toutes vos sorties et tournages au quotidien.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={scrollToOrder}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Commander mon Z3 Zoom (49 900 F)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 🌟 SECTION 1 : SPOTLIGHT MAGSAFE 20N & COMPATIBILITÉ UNIVERSELLE */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* IMAGE HD MAGSAFE 20N */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                  <img
                    src="/images/stabilisateur-force-magnetique-20n.jpg"
                    alt="Force magnétique ultra-forte de 20N et compatibilité universelle"
                    className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide">
                    FORCE MAGNÉTIQUE 20N
                  </div>
                </div>
              </div>

              {/* CONTENU TEXTE & AVANTAGES */}
              <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Sécurité Magnétique Avancée
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight leading-tight">
                    Force magnétique 20N ultra-puissante : Votre téléphone ne tombera jamais
                  </h2>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Grâce à un réseau circulaire d&apos;aimants néodyme N52 calibrés à <strong className="text-slate-950">20 Newtons de puissance</strong>, votre smartphone s&apos;aimante instantanément en 0.5 seconde et reste parfaitement verrouillé, même lors de mouvements brusques ou de marches rapides.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">100% Compatible iPhone MagSafe</div>
                      <div className="text-slate-600">Séries iPhone 12, 13, 14, 15, 16, 17 et toutes les coques MagSafe certifiées.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">3 Bagues Métalliques Offertes pour Android</div>
                      <div className="text-slate-600">Samsung, Xiaomi, Tecno, Infinix, Huawei... Collez la bague fine sur votre coque et profitez du MagSafe instantané.</div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>Commander le Kit MagSafe 20N</span>
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* 🌟 SECTION 2 : DOUBLE SPOTLIGHT — ROTATION 360° & PERCHE TÉLESCOPIQUE */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Polyvalence Cinématographique
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Cadrez sous n&apos;importe quel angle avec une liberté totale
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Un seul appareil pour 3 utilisations : Poignée stabilisatrice à la main, perche selfie grand angle et trépied de table stable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* CARTE A : ROTATION 360° & MULTI-ANGLE */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs group aspect-4/3">
                  <img
                    src="/images/stabilisateur-angles-rotation-360.jpg"
                    alt="Prise de vue sous n'importe quel angle support horizontal et vertical"
                    className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-sky-400 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    PORTRAIT & PAYSAGE 360°
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl text-slate-950">
                  Bascule Portrait / Paysage Instantanée
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Pivotez votre téléphone à 360° en une fraction de seconde pour passer du format TikTok / Réels (vertical) au format YouTube / Cinéma (horizontal) sans jamais démonter l&apos;appareil.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-slate-800 text-[11px] font-bold">
                <div className="bg-slate-50 p-2 rounded-xl">Mode Poignée</div>
                <div className="bg-slate-50 p-2 rounded-xl">Mode Perche</div>
                <div className="bg-slate-50 p-2 rounded-xl">Mode Trépied</div>
              </div>
            </div>

            {/* CARTE B : PERCHE EXTENSIBLE ULTRA-LÉGÈRE */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs group aspect-4/3">
                  <img
                    src="/images/stabilisateur-perche-extensible.jpg"
                    alt="Perche à selfie portable et extensible pour photos de groupe"
                    className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    EXTENSION ALUMINIUM
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl text-slate-950">
                  Perche Télescopique Légère & Robuste
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Déployez la tige en alliage d&apos;aluminium aéronautique pour capturer des panoramas grandioses et des photos de groupe où personne n&apos;est coupé, sans aucune flexion ni vibration.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-slate-800 text-[11px] font-bold">
                <div className="bg-slate-50 p-2 rounded-xl">Zéro Flexion</div>
                <div className="bg-slate-50 p-2 rounded-xl">Grand Angle</div>
                <div className="bg-slate-50 p-2 rounded-xl">Ultra-Léger</div>
              </div>
            </div>

          </div>
        </section>

        {/* 🌟 SECTION 3 : SPOTLIGHT TÉLÉCOMMANDE 10M & RECHARGE TYPE-C */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden border border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* TEXTE & CARACTÉRISTIQUES TÉLÉCOMMANDE */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    Contrôle Sans Fil Studio
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                    Télécommande Sans Fil 10 Mètres : Déclenchez et zoomez à distance
                  </h2>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Filmez vos tutoriels, vlogs et démonstrations en toute autonomie. La commande magnétique se détache d&apos;une simple pression du doigt pour vous permettre de cadrer et démarrer l&apos;enregistrement jusqu&apos;à 10 mètres de distance.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white">Conception Magnétique Amovible</div>
                      <div className="text-slate-300">Se range et se fixe magnétiquement sur la poignée pour ne jamais la perdre.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white">Recharge Rapide par Câble USB-C</div>
                      <div className="text-slate-300">Batterie rechargeable longue durée intégrée : aucun achat de pile bouton jetable.</div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Obtenir le Pack avec Télécommande 10m</span>
                </button>
              </div>

              {/* VISUEL HD TÉLÉCOMMANDE 10M */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                  <img
                    src="/images/stabilisateur-telecommande-10m.jpg"
                    alt="Télécommande sans fil 10 mètres détachable et rechargeable par USB-C"
                    className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    PORTÉE 10 MÈTRES SANS FIL
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 🌟 SECTION 4 : GUIDE VISUEL D'ACCESSIBILITÉ & PRISE EN MAIN EXPRESS */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Prise En Main Express
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Guide Visuel d&apos;Appairage & Voyants Intelligents
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Configuration en 3 secondes chrono sans aucune application à télécharger.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* IMAGE HD DU GUIDE OFFICIEL */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                  <img
                    src="/images/stabilisateur-guide-fonctions.jpg"
                    alt="Guide des fonctions d'accessibilité appairage Bluetooth WONEW-M et voyants LED"
                    className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    APPAIRAGE BLUETOOTH « WONEW-M »
                  </div>
                </div>
              </div>

              {/* ÉTAPES CLAIRES & CODE COULEURS VOYANTS */}
              <div className="lg:col-span-6 space-y-6">
                
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-xl text-slate-950">
                    2 Étapes Simples pour Commencer
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-mono font-black flex items-center justify-center shrink-0 text-xs">
                        1
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">Allumez l&apos;interrupteur</div>
                        <div className="text-slate-600">Passez le commutateur sur ON. Le voyant clignote en BLEU pour indiquer le mode association.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="w-7 h-7 rounded-xl bg-sky-500 text-white font-mono font-black flex items-center justify-center shrink-0 text-xs">
                        2
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">Connectez en Bluetooth</div>
                        <div className="text-slate-600">Sur votre iPhone ou Android : Réglages &gt; Bluetooth &gt; Cliquez sur « WONEW-M » pour vous associer.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    Signification des Voyants LED :
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-rose-50 border border-rose-200/60 p-2.5 rounded-xl">
                      <div className="font-bold text-rose-700">Clignote Rouge (3x)</div>
                      <div className="text-rose-900/70 text-[11px]">Batterie faible</div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl">
                      <div className="font-bold text-amber-700">Rouge Continu</div>
                      <div className="text-amber-900/70 text-[11px]">Charge en cours</div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200/60 p-2.5 rounded-xl">
                      <div className="font-bold text-emerald-700">Voyant Éteint</div>
                      <div className="text-emerald-900/70 text-[11px]">Batterie 100% pleine</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 🌟 SECTION 5 : TABLEAU COMPARATIF ÉCRASANT */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Comparatif Sans Appel
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Pourquoi le Z3 Zoom surpasse les perches classiques ?
            </h2>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-4 px-5 font-bold text-slate-600 uppercase tracking-wider">Critère</th>
                    <th className="py-4 px-5 font-black text-amber-600 uppercase tracking-wider bg-amber-50/50">
                      Stabilisateur Z3 Zoom™
                    </th>
                    <th className="py-4 px-5 font-bold text-slate-400 uppercase tracking-wider">
                      Perches & Trépieds Classiques
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Force de Fixation</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      MagSafe 20N ultra-sécurisé
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Pinces mécaniques dures qui rayent</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Stabilisation Vidéo</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Fluide cinéma sans tremblement
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Vidéos saccadées dès qu&apos;on marche</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Télécommande & Zoom</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Détachable 10m + Rechargeable USB-C
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Obligé de toucher l&apos;écran ou piles jetables</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Robustesse des Matériaux</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Alliage d&apos;Aluminium Haute Résistance
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Plastique fin qui casse après 3 sorties</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Compatibilité Téléphones</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      100% Universel (iPhone + 3 Bagues Android)
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">Limité à certaines largeurs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 🌟 SECTION 6 : 4 CAS D'USAGE RÉELS AU BÉNIN */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Polyvalence Totale
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Conçu pour votre quotidien et votre activité
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-amber-600 text-sm">Vendeurs & Boutiques</div>
              <h4 className="font-bold text-slate-900 text-sm">Vidéos TikTok & Lives Pro</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Mettez en valeur vos vêtements, chaussures et produits avec des plans fluides qui donnent immédiatement confiance aux clients.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-sky-600 text-sm">Créateurs de Contenu</div>
              <h4 className="font-bold text-slate-900 text-sm">Vlogs de Rue & Interviews</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Marchez à votre rythme dans la rue sans tremblement ni effet de nausée sur vos vidéos.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-emerald-600 text-sm">Réunions & Visioconférences</div>
              <h4 className="font-bold text-slate-900 text-sm">Appels Mains-Libres</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Posez votre trépied sur votre bureau pour des appels Zoom et WhatsApp impeccablement cadrés.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-purple-600 text-sm">Famille & Événements</div>
              <h4 className="font-bold text-slate-900 text-sm">Photos de Groupe Sans Stress</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Plus besoin d&apos;exclure la personne qui prend la photo : posez le trépied et déclenchez avec la télécommande.
              </p>
            </div>
          </div>
        </section>

        {/* 🌟 SECTION 7 : CONTENU DU COFFRET (UNBOXING) */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Coffret Complet Prêt à l&apos;Emploi
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Que recevez-vous exactement dans votre colis ?
            </h2>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-400 font-display">Kit Studio Z3 Zoom™ Pro</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Stabilisateur Z3 Zoom</strong> en alliage d&apos;aluminium renforcé</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Télécommande Bluetooth sans fil</strong> détachable rechargeable Type-C (10m)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>3x Bagues magnétiques métalliques</strong> adhésives offertes pour téléphones Android</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Câble de recharge rapide</strong> USB Type-C haute durabilité</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Guide officiel d&apos;accessibilité et voyants</strong> illustré en français</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-5 text-center space-y-3">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Garantie Qualité & Contrôle Colis</div>
              <div className="text-lg font-bold text-white">Inspection Physique Avant Paiement</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le livreur vous remet le colis en main propre au Bénin. Vous ouvrez, vous vérifiez et vous ne payez qu&apos;après totale satisfaction.
              </p>
              <button
                type="button"
                onClick={scrollToOrder}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Commander maintenant (49 900 F)
              </button>
            </div>
          </div>
        </section>

        {/* 🌟 AVIS CLIENTS VÉRIFIÉS */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <h2 className="font-display font-bold text-2xl text-slate-950">Ce qu&apos;en disent les créateurs & utilisateurs</h2>
            <p className="text-slate-600 text-xs">Retours d&apos;expérience après livraison au Bénin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS.map((rev, i) => (
              <div key={i} className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rev.author}</span>
                  <span className="text-slate-500 font-mono">{rev.city}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🌟 FAQ ACCORDÉON */}
        <section className="max-w-2xl mx-auto space-y-4 pt-4">
          <h2 className="font-display font-bold text-xl text-slate-950 text-center mb-6">
            Questions Fréquentes
          </h2>

          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${isOpen ? "rotate-180 text-amber-600" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </section>

      </main>

      {/* 🌟 FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-600 space-y-2 pb-24 md:pb-8">
        <p className="font-bold text-slate-800">Isivente • Commerce Pro Bénin</p>
        <p>Service Client WhatsApp : +229 01 92 90 18 17 • Cotonou, Bénin</p>
        <p className="text-[10px] text-slate-400">© 2026 Isivente. Tous droits réservés.</p>
      </footer>

      {/* 📱 STICKY MOBILE BAR (PRIX FIXE EN BAS & BOUTON COMMANDER) */}
      <StickyMobileCtaBar
        price={selectedBundle.price}
        targetSectionId="commander"
        accentColor="#D97706"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour ! J'ai une question concernant le stabilisateur Gimbal Pro."
      />

    </div>
  );
}
