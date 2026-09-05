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
  Moon,
  Compass,
  Layers,
  Award,
  Eye,
  RotateCw,
  SunMedium
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
    name: "Pack Solo Découverte (1 Kit Complet)",
    subtitle: "1 Projecteur LED USB Flexible + 24 Disques de projection HD",
    price: 14900,
    originalPrice: 22000,
    savings: 7100,
    quantity: 1,
  },
  {
    id: "duo",
    name: "Pack Duo Magique (2 Kits Complets)",
    subtitle: "2 Projecteurs USB + 48 Disques HD (Chambre Enfants + Chambre Parents)",
    badge: "🔥 L'OFFRE LA PLUS CHOISIE (ÉCONOMISEZ 18 100 F)",
    price: 25900,
    originalPrice: 44000,
    savings: 18100,
    popular: true,
    quantity: 2,
  },
  {
    id: "trio",
    name: "Pack Trio Famille & Cadeaux (3 Kits)",
    subtitle: "3 Projecteurs USB complets + 72 Disques de projection HD",
    badge: "💎 MEILLEUR PRIX / APPAREIL",
    price: 36900,
    originalPrice: 66000,
    savings: 29100,
    quantity: 3,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/projecteur-hero.jpg",
    alt: "Veilleuse Projecteur LED 3D USB Flexible FRIOSZ FP-032 avec ses 24 disques de projection",
    caption: "Kit complet : Projecteur USB 360° tactile + Coffret de 24 disques HD",
  },
  {
    src: "/images/projecteur-galaxie.jpg",
    alt: "Projection d'une galaxie spirale ultra-détaillée au plafond de la chambre",
    caption: "Projection Galaxie & Voie Lactée 3D haute définition au plafond",
  },
  {
    src: "/images/projecteur-enfant.jpg",
    alt: "Enfant émerveillé dans son lit devant le ciel étoilé au plafond",
    caption: "Aide au sommeil magique : apaise les enfants et élimine la peur du noir",
  },
  {
    src: "/images/projecteur-ocean.jpg",
    alt: "Ambiance sous-marine féérique avec projection de méduses lumineuses",
    caption: "Mode Océan & Méduses 3D pour une détente totale en fin de journée",
  },
  {
    src: "/images/projecteur-saturne.jpg",
    alt: "Projection spectaculaire de Saturne et de ses anneaux en chambre moderne",
    caption: "Ambiance astronomique spectaculaire avec mise au point optique ultra-nette",
  },
];

const REVIEWS = [
  {
    author: "Clarisse A.",
    city: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Mon fils de 5 ans refusait de dormir seul dans sa chambre à cause de la peur du noir. Depuis qu'on allume le projecteur avec le disque des étoiles, il s'endort paisiblement en 10 minutes avec le sourire !",
  },
  {
    author: "Dr. Boris M.",
    city: "Abomey-Calavi",
    rating: 5,
    date: "Il y a 4 jours",
    comment: "La qualité de projection est impressionnante pour un appareil aussi compact. On peut régler la netteté avec la bague en haut comme sur un vrai objectif photo. Le rendu de Saturne et des galaxies est splendide.",
  },
  {
    author: "Fabiola S.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 6 jours",
    comment: "J'ai pris le pack duo pour offrir à mes nièces. Elles ont adoré changer les disques (galaxie, méduses, aurore). Branchement USB super pratique sur n'importe quel chargeur ou powerbank.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne le projecteur et comment l'alimenter ?",
    a: "Le projecteur est équipé d'un col flexible avec embout USB standard. Vous pouvez le brancher directement sur une prise murale avec un chargeur de téléphone, sur une batterie externe (Powerbank), ou sur un ordinateur portable. Il est totalement silencieux et consomme très peu d'énergie.",
  },
  {
    q: "Comment changer de projection et régler la netteté ?",
    a: "Chaque disque de projection se glisse facilement dans la fente latérale de la tête du projecteur. La bague rotative située à l'avant vous permet d'ajuster la mise au point optique pour obtenir une image parfaitement nette, que votre plafond soit à 1m ou 4m de hauteur.",
  },
  {
    q: "Quels sont les thèmes inclus dans les 24 disques ?",
    a: "Le coffret comprend 24 thèmes HD variés : Système solaire (Terre, Lune, Saturne, Mars), Galaxies spirales, Nébuleuses profondes, Monde marin féérique (Méduses lumineuses), Aurores boréales et thèmes festifs.",
  },
  {
    q: "Comment se déroule la livraison et le paiement au Bénin ?",
    a: "Nous livrons directement à votre domicile ou bureau sous 24h à 48h (Cotonou, Calavi, Porto-Novo, Parakou, etc.). Vous vérifiez votre colis à la réception et vous réglez en espèces ou Mobile Money directement au livreur.",
  },
];

export default function VeilleuseLanding({ slug = "veilleuse" }: { slug?: string }) {
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle>(BUNDLES[1]);
  const [includeBump, setIncludeBump] = useState(false);
  const upsellConfig = getProductUpsellConfig(slug || "veilleuse");
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
      const bumpPrice = includeBump && bumpOffer ? bumpOffer.price : 0;
      const finalTotal = selectedBundle.price + bumpPrice;
      const finalBundleName = selectedBundle.name + (includeBump && bumpOffer ? ` + ${bumpOffer.title}` : "");

      const orderPayload = {
        product_slug: slug,
        product_title: "Veilleuse Projecteur LED 3D Tactile FRIOSZ FP-032",
        bundle_id: selectedBundle.id,
        bundle_name: finalBundleName,
        quantity: selectedBundle.quantity,
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* 🌟 BANDEAU SUPÉRIEUR D'URGENCE SOLAIRE */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white py-2.5 px-4 text-center text-xs font-bold tracking-wide shadow-sm flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
        <span>OFFRE FLASH : -35% DE RÉDUCTION + 24 DISQUES HD OFFERTS + PAIEMENT À LA RÉCEPTION AU BÉNIN</span>
        <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
      </div>

      {/* 🌟 HEADER ÉPURÉ LUXURY LIGHT */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black font-display text-base shadow-sm">
              ✨
            </div>
            <div>
              <span className="font-display font-black tracking-tight text-slate-950 text-base sm:text-lg block leading-none">
                VEILLEUSE PROJECTEUR 3D
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-bold mt-0.5">
                FRIOSZ™ FP-032 • 24 THÈMES HD
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToOrder}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md shadow-indigo-500/20"
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
              accentColor="#6366F1"
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
                <span className="text-xs text-slate-600 font-mono font-bold">4.9/5 (243 avis vérifiés)</span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
                Veilleuse Projecteur LED 3D Tactile™
              </h1>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed font-medium">
                Transformez instantanément votre chambre ou salon en un <strong className="text-slate-900">univers féérique apaisant</strong>. Col USB flexible 360°, contrôle tactile instantané, mise au point ultra-nette et coffret de 24 disques astronomiques et marins.
              </p>
            </div>

            {/* POINTS FORTS TACTILES */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">24 Thèmes 3D</div>
                  <div className="text-slate-500 text-[11px]">Galaxies, Océan & Étoiles</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Col Flexible 360°</div>
                  <div className="text-slate-500 text-[11px]">Orientez où vous voulez</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Focus Optique Net</div>
                  <div className="text-slate-500 text-[11px]">Image ultra-claire</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Sommeil Réparateur</div>
                  <div className="text-slate-500 text-[11px]">Anti-peur du noir</div>
                </div>
              </div>
            </div>

            {/* PACKS HORMOZI */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                1. Choisissez votre Pack Promo :
              </label>

              {BUNDLES.map((bundle) => {
                const isSelected = selectedBundle.id === bundle.id;
                return (
                  <div
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-indigo-50/40 border-indigo-600 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-600"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    {bundle.badge && (
                      <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                        {bundle.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-slate-100"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{bundle.name}</div>
                          <div className="text-xs text-slate-600">{bundle.subtitle}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-base text-indigo-700 tabular-nums">
                          {new Intl.NumberFormat("fr-FR").format(bundle.price)} F
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 line-through tabular-nums">
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
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/25 active:scale-[0.98] transition-all text-sm uppercase tracking-wider cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-amber-300" />
              <span>Commander Ma Veilleuse 3D (14 900 F)</span>
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

        {/* 🎬 SECTION DÉMONSTRATION VIDÉO EN DIRECT */}
        <section id="demo-video" className="py-8 bg-gradient-to-b from-indigo-50/50 to-white rounded-3xl border border-indigo-100 p-4 sm:p-8 text-center space-y-5 shadow-sm">
          <div className="max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-100/70 px-3 py-1 rounded-full border border-indigo-200">
              Démonstration Vidéo Réelle
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Voyez la projection en direct
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Découvrez la netteté et les effets immersifs 3D des galaxies et méduses lumineuses au plafond.
            </p>
          </div>

          <div className="bg-slate-950 p-2 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_-15px_rgba(99,102,241,0.35)] border border-indigo-500/20 max-w-3xl mx-auto">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
              
              <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 z-10">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                <span>Démonstration en direct</span>
              </div>

              <video 
                src="/videos/veilleuse-demo.mp4"
                poster="/images/projecteur-galaxie.jpg"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-cover"
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          </div>
        </section>

        {/* 🌟 FORMULAIRE DE COMMANDE DIRECTE (MODÈLE UMÉI PLACÉ DIRECTEMENT SOUS LA PRÉSENTATION) */}
        <UmeiStyleOrderSection
          productSlug={slug}
          productTitle="Veilleuse Projecteur LED 3D Tactile FRIOSZ FP-032"
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
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          accentColor="#6366F1"
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
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Expérience Visuelle & Sérénité
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Pourquoi cette veilleuse 3D transforme vos nuits ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">24 Disques Haute Précision</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Variez les ambiances selon vos envies : explorez les anneaux de Saturne, plongez sous l&apos;océan avec les méduses lumineuses ou admirez les aurores boréales depuis votre lit.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
                <RotateCw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Orientation Flexible & Branchement USB</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Son col flexible en silicone se tord dans toutes les directions pour projeter au plafond ou sur un mur. Se branche sur n&apos;importe quel chargeur, prise USB murale ou batterie nomade.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
                <Moon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Bouton Tactile & Focus Manuel</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Allumez d&apos;un simple contact du doigt sur le dessus. Ajustez la bague rotative de la lentille pour une netteté de projection cristalline sans aucune déformation optique.
              </p>
            </div>

          </div>
        </section>

        {/* 🌟 SECTION 1 : DÉMONSTRATION EN 3 GESTES SIMPLES */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Simplicité Magique
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Comment projeter vos univers en 3 secondes ?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Facile à manipuler pour les enfants et les parents. Zéro configuration, branchement USB immédiat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center font-mono text-base shadow-sm">
                01
              </div>
              <h3 className="font-bold text-lg text-slate-950">Glissez le disque de votre choix</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Choisissez parmi les 24 thèmes HD (Planètes, Nébuleuses, Océan de méduses, Ciel étoilé) et insérez le disque dans la fente latérale.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center font-mono text-base shadow-sm">
                02
              </div>
              <h3 className="font-bold text-lg text-slate-950">Branchez en USB & Orientez à 360°</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Connectez sur un chargeur de téléphone, une prise USB ou une batterie nomade (Powerbank). Tordez le col flexible pour viser le plafond ou un mur.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center font-mono text-base shadow-sm">
                03
              </div>
              <h3 className="font-bold text-lg text-slate-950">Ajustez la bague de netteté optique</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Tournez la bague frontale pour obtenir une image nette au millimètre près, que votre plafond soit à 1m50 ou 4 mètres de hauteur.
              </p>
            </div>
          </div>
        </section>

        {/* 🌟 SECTION 2 : TABLEAU COMPARATIF */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Comparatif Clarté
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Veilleuse FRIOSZ 3D vs Veilleuses Plastique Ordinaires
            </h2>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-4 px-5 font-bold text-slate-600 uppercase tracking-wider">Caractéristiques</th>
                    <th className="py-4 px-5 font-black text-indigo-700 uppercase tracking-wider bg-indigo-50/50">
                      Veilleuse Projecteur FRIOSZ 3D
                    </th>
                    <th className="py-4 px-5 font-bold text-slate-400 uppercase tracking-wider">
                      Veilleuses Ordinaires du Marché
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Variété des Thèmes</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      24 Disques HD interchangeables
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">1 seule image ou simple lumière fixe</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Mise au Point Optique</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Bague de focus micrométrique nette
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Lumière floue et aveuglante</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Orientation & Flexibilité</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Col silicone 360° orientable partout
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Bloc rigide fixe collé à la prise</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-bold text-slate-800">Alimentation en Coupure</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-700 bg-indigo-50/30 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      Fonctionne sur Powerbank / USB
                    </td>
                    <td className="py-3.5 px-5 text-rose-500 font-medium">Inutilisable dès la coupure de courant</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 🌟 SECTION 3 : 4 CAS D'USAGE RÉELS AU BÉNIN */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Moments de Vie
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              4 Utilisations Incontournables au Foyer
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-indigo-600 text-sm">🧸 Chambre Enfants</div>
              <h4 className="font-bold text-slate-900 text-sm">Finie la peur du noir</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Les enfants s'endorment paisiblement en observant les constellations au plafond au lieu de pleurer dans l'obscurité.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-purple-600 text-sm">✨ Chambre Parents</div>
              <h4 className="font-bold text-slate-900 text-sm">Ambiance Romantique & Zen</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Créez une atmosphère feutrée et apaisante pour décompresser après une longue journée de travail.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-amber-600 text-sm">⚡ Secours Délestage</div>
              <h4 className="font-bold text-slate-900 text-sm">Lumière douce sur Powerbank</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                En cas de coupure de courant, branchez-la sur votre batterie externe pour éclairer chaleureusement toute la pièce.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="font-black text-emerald-600 text-sm">🎁 Cadeau Inoubliable</div>
              <h4 className="font-bold text-slate-900 text-sm">Effet Émerveillement</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Le cadeau parfait d'anniversaire ou de fête qui surprend petits et grands à coup sûr.
              </p>
            </div>
          </div>
        </section>

        {/* 🌟 SECTION 4 : CONTENU DU COFFRET (UNBOXING) */}
        <section className="border-t border-slate-200/90 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Contenu du Pack
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Que contient votre coffret Veilleuse 3D ?
            </h2>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-indigo-400 font-display">Kit Veilleuse FRIOSZ FP-032</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Projecteur Tactile USB</strong> avec col flexible orientable 360°</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Coffret complet de 24 Disques HD</strong> thématiques haute résolution</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Lentille optique haute pureté</strong> avec bague de focus ajustable</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                  <span><strong>1x Guide explicatif</strong> des constellations et univers</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-5 text-center space-y-3">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Paiement Sécurisé à Domicile</div>
              <div className="text-lg font-bold text-white">Livraison 24h & Contrôle Colis</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Testez et inspectez l'appareil en présence du livreur avant de régler votre achat.
              </p>
              <button
                type="button"
                onClick={scrollToOrder}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                Commander ma veilleuse (14 900 F)
              </button>
            </div>
          </div>
        </section>

        {/* 🌟 AVIS CLIENTS VÉRIFIÉS */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <h2 className="font-display font-bold text-2xl text-slate-950">Ce qu&apos;en disent nos clients</h2>
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
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
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
