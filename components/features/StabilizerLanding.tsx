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
  Maximize2
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
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
    src: "/images/stabilisateur-hero.jpg",
    alt: "Stabilisateur Pro-Mobile Z3 Zoom en main avec bague MagSafe",
    caption: "Stabilisation Pro, Zoom sans fil et Trépied intégré",
  },
  {
    src: "/images/stabilisateur-magsafe.jpg",
    alt: "Gros plan sur la commande de zoom et la bague magnétique MagSafe",
    caption: "Bague magnétique ultra-puissante & commande Zoom millimétrique",
  },
  {
    src: "/images/stabilisateur-tripod.jpg",
    alt: "Mode trépied de table déployé sur un bureau de tournage",
    caption: "Déploiement trépied en 1 seconde pour vidéos et visioconférences",
  },
  {
    src: "/images/stabilisateur-vlog.jpg",
    alt: "Créatrice de contenu filmant un vlog fluide dans la rue",
    caption: "Vidéos fluides et nettes sans tremblement même en marchant",
  },
];

const REVIEWS = [
  {
    author: "Marc-Aurèle K.",
    city: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Je fais des vidéos pour ma boutique de vêtements sur TikTok. Avant mes vidéos tremblaient toujours. Avec ce Z3, la qualité fait pro comme avec un iPhone 15 Pro sur caméra de cinéma ! La bague MagSafe tient très fort.",
  },
  {
    author: "Nadège T.",
    city: "Abomey-Calavi",
    rating: 5,
    date: "Il y a 3 jours",
    comment: "Le zoom à distance avec la télécommande détachable est génial ! Je pose le trépied sur la table et je gère mes prises sans toucher au téléphone. Livraison reçue le jour même en main propre.",
  },
  {
    author: "Yannick D.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 5 jours",
    comment: "J'ai pris le pack duo pour moi et ma sœur qui est photographe. Rien à dire, l'aluminium est de qualité supérieure et le trépied ne bouge pas d'un millimètre.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Est-il compatible avec mon téléphone (iPhone et Android) ?",
    a: "Oui, à 100% ! Il est directement compatible avec tous les iPhones MagSafe (séries 12, 13, 14, 15, 16). Pour tous les autres téléphones (Samsung, Xiaomi, Tecno, Infinix, Huawei...), un anneau magnétique mince adhésif ultra-puissant est fourni gratuitement dans le kit.",
  },
  {
    q: "Comment fonctionne la télécommande de zoom à distance ?",
    a: "La poignée intègre une télécommande Bluetooth amovible. Vous pouvez l'utiliser clipsée sur le stabilisateur ou la détacher pour déclencher vos photos/vidéos et zoomer jusqu'à 10 mètres de distance.",
  },
  {
    q: "Comment se fait la livraison et le paiement ?",
    a: "Nous livrons partout au Bénin sous 24h à 48h. Vous ne payez rien d'avance : vous inspectez le colis à l'arrivée et réglez en espèces ou Mobile Money directement au livreur.",
  },
  {
    q: "Le trépied est-il solide ?",
    a: "Absolument. La poignée s'ouvre en 3 pieds renforcés avec patins en silicone antidérapants pour garantir une stabilité totale sur table, sol, bitume ou herbe.",
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
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert("Veuillez saisir un numéro de téléphone valide pour la confirmation de livraison.");
      return;
    }

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
      document.getElementById("commander")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Order error:", err);
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
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

            {/* PACKS HORMOZI */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                1. Choisissez votre Pack Promo :
              </label>

              {BUNDLES.map((bundle) => {
                const isSelected = selectedBundle.id === bundle.id;
                return (
                  <div
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative select-none ${
                      isSelected
                        ? "bg-amber-50/50 border-amber-500 shadow-sm ring-1 ring-amber-500"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {bundle.badge && (
                      <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                        {bundle.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-500 text-slate-950"
                              : "border-slate-300 bg-slate-100"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900">{bundle.name}</div>
                          <div className="text-[11px] text-slate-500">{bundle.subtitle}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-sm sm:text-base text-amber-600 tabular-nums">
                          {new Intl.NumberFormat("fr-FR").format(bundle.price)} F
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 line-through tabular-nums">
                          {new Intl.NumberFormat("fr-FR").format(bundle.originalPrice)} F
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {/* 🌟 SECTION FONCTIONNALITÉS EN DÉTAIL */}
        <section className="border-t border-slate-200 pt-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Ingénierie & Ergonomie Studio
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Pourquoi le Z3 Zoom est indispensable à vos vidéos ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Stabilisation Pro-Active</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Fini les vidéos amateurs saccadées. Le gyroscope et le contre-balancement mécanique absorbent chaque choc pendant la marche pour un rendu digne des studios cinéma.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Aimant MagSafe 16N Ultra-Puissant</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Posez simplement votre smartphone : il s&apos;aimante instantanément avec une force de maintien testée contre les chutes brutales. Bague magnétique incluse pour téléphones Android.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Molette de Zoom Précise & Déclencheur</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ajustez le zoom au millimètre directement avec le pouce sans jamais toucher votre écran, et détachez la commande pour déclencher vos enregistrements à distance.
              </p>
            </div>

          </div>
        </section>

        {/* 🌟 SECTION 1 : DÉMONSTRATION EN 3 ÉTAPES CLAIRES */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Prise en main instantanée
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Comment ça marche en 3 gestes simples ?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Aucune application complexe requise. Tout fonctionne nativement avec l'appareil photo de votre smartphone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center font-mono text-base shadow-sm">
                01
              </div>
              <h3 className="font-bold text-lg text-slate-950">Clipsez en 0.5 seconde</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Approchez votre iPhone ou Android : les puissants aimants MagSafe N52 le verrouillent instantanément. Fini les pinces mécaniques qui coincent les boutons de volume.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center font-mono text-base shadow-sm">
                02
              </div>
              <h3 className="font-bold text-lg text-slate-950">Cadrez & Zoomez au pouce</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Tournez la molette ergonomique pour zoomer avec fluidité cinématographique sans jamais toucher l'écran, et basculez du mode portrait au paysage en 1 seconde.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center font-mono text-base shadow-sm">
                03
              </div>
              <h3 className="font-bold text-lg text-slate-950">Posez ou déclenchez à 10m</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Déployez les 3 pieds renforcés sur une table ou au sol, détachez la télécommande Bluetooth et enregistrez vos vidéos sans l'aide de personne.
              </p>
            </div>
          </div>
        </section>

        {/* 🌟 SECTION 2 : TABLEAU COMPARATIF ÉCRASANT */}
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
                    <td className="py-3.5 px-5 font-bold text-slate-800">Stabilisation Vidéo</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Fluide cinéma sans tremblement
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Vidéos saccadées dès qu'on marche</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Fixation Smartphone</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      MagSafe N52 magnétique (0.5s)
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Pinces dures qui rayent et bloquent les boutons</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Commande de Zoom</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Molette intégrée + Déclencheur 10m
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Obligé de toucher l'écran à deux mains</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Robustesse des Matériaux</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Alliage d'Aluminium Haute Résistance
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Plastique fin qui casse après 3 sorties</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Compatibilité Téléphones</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-amber-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      100% Universel (iPhone & Android)
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">Limité à certaines largeurs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 🌟 SECTION 3 : 4 CAS D'USAGE RÉELS AU BÉNIN */}
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
              <div className="font-black text-amber-600 text-sm">🛍️ Vendeurs & Boutiques</div>
              <h4 className="font-bold text-slate-900 text-sm">Vidéos TikTok & Lives Pro</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Mettez en valeur vos vêtements, chaussures et produits avec des plans fluides qui donnent immédiatement confiance aux clients.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-sky-600 text-sm">🎬 Créateurs de Contenu</div>
              <h4 className="font-bold text-slate-900 text-sm">Vlogs de Rue & Interviews</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Marchez à votre rythme dans la rue sans tremblement ni effet de nausée sur vos vidéos.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-emerald-600 text-sm">💼 Réunions & Visioconférences</div>
              <h4 className="font-bold text-slate-900 text-sm">Appels Mains-Libres</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Posez votre trépied sur votre bureau pour des appels Zoom et WhatsApp impeccablement cadrés.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-purple-600 text-sm">🎉 Famille & Événements</div>
              <h4 className="font-bold text-slate-900 text-sm">Photos de Groupe Sans Stress</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Plus besoin d'exclure la personne qui prend la photo : posez le trépied et déclenchez avec la télécommande.
              </p>
            </div>
          </div>
        </section>

        {/* 🌟 SECTION 4 : CONTENU DU COFFRET (UNBOXING) */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Coffret Complet Prêt à l'Emploi
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
                  <span><strong>1x Stabilisateur Z3 Zoom</strong> en alliage d'aluminium renforcé</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Télécommande Bluetooth sans fil</strong> détachable longue portée (10m)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Anneau magnétique universel</strong> adhésif offert pour téléphones Android</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Câble de recharge rapide</strong> USB Type-C haute durabilité</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Guide d'utilisation illustré</strong> en français</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-5 text-center space-y-3">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Garantie Qualité & Contrôle Colis</div>
              <div className="text-lg font-bold text-white">Inspection Physique Avant Paiement</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le livreur vous remet le colis en main propre au Bénin. Vous ouvrez, vous vérifiez et vous ne payez qu'après totale satisfaction.
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
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-600 space-y-2">
        <p className="font-bold text-slate-800">Isivente • Commerce Pro Bénin</p>
        <p>Service Client WhatsApp : +229 01 92 90 18 17 • Cotonou, Bénin</p>
        <p className="text-[10px] text-slate-400">© 2026 Isivente. Tous droits réservés.</p>
      </footer>

    </div>
  );
}
