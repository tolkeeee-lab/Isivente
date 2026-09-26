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
  BatteryCharging, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Camera,
  Wifi,
  Gauge,
  Smartphone,
  Eye,
  Gift,
  Flame,
  Radio,
  Gamepad2,
  Tv,
  Check
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Voiture Télécommandée de Course avec Caméra HD & Écran",
    subtitle: "Coffret complet avec bolide sport, manette avec écran couleur 2.4\" LCD, batterie rechargeable et câble",
    price: 29900,
    originalPrice: 45000,
    savings: 15100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/voiture-slide-salon.jpg", 
    alt: "Voiture Télécommandée avec Caméra HD - Conduis, filme, vis l'action en temps réel !",
    caption: "Bolide de course avec caméra HD grand angle et manette ergonomique avec écran couleur LCD"
  },
  { 
    src: "/images/voiture-slide-exploration.jpg", 
    alt: "Explore les endroits inaccessibles en temps réel sous le canapé et les meubles",
    caption: "Caméra embarquée furtive : explorez sous le lit, sous le canapé et dans les coins avec la vidéo en direct"
  },
  { 
    src: "/images/voiture-slide-drift.jpg", 
    alt: "Drift et sensations fortes - Lumières LED, effets sonores et haute vitesse",
    caption: "Sensations de course réelles : drift 360°, feux avant LED réalistes et effets sonores sportifs"
  },
  { 
    src: "/images/voiture-slide-cadeau.jpg", 
    alt: "Le cadeau parfait pour les enfants et passionnés - Coffret complet",
    caption: "Le cadeau idéal : pack complet avec boîte officielle, manette écran, câble de charge USB et notice"
  },
  { 
    src: "/images/voiture-camera-action.jpg", 
    alt: "Pilotez en vue subjective comme si vous étiez à bord du bolide sur circuit",
    caption: "Immersion FPV totale : retransmission vidéo en temps réel sur la manette pendant que la voiture file"
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

const REVIEWS_DATA: CustomerReview[] = [
  {
    name: "Arnaud D.",
    location: "Cotonou (Fidjrossè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le meilleur cadeau que j'ai offert à mon fils !",
    comment: "Mon garçon de 9 ans ne la quitte plus ! L'écran sur la manette est incroyable : on voit exactement où la voiture passe, sous les tables et entre les meubles. Le livreur est venu en 24h et j'ai testé avant de payer.",
    verified: true,
  },
  {
    name: "Mireille T.",
    location: "Calavi (Tankpè)",
    rating: 5,
    date: "Achat vérifié",
    title: "La qualité de la vidéo en direct est impressionnante",
    comment: "J'avais peur qu'il y ait du retard entre la manette et la voiture, mais pas du tout ! La transmission est fluide et instantanée. Même mon mari s'amuse à faire des circuits dans le couloir.",
    verified: true,
  },
  {
    name: "Constant A.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Super bolide, très maniable et robuste",
    comment: "La batterie tient bien la charge et la voiture résiste très bien aux petits chocs. La manette est très agréable en main, style console. Très satisfait de ma commande sur Isivente.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "A-t-on obligatoirement besoin d'un smartphone pour utiliser la voiture ?",
    a: "Non ! C'est le grand avantage de ce modèle : la télécommande intègre son propre écran couleur LCD. Vous allumez la voiture et la manette, et la vidéo en direct s'affiche immédiatement sans aucune application ni mot de passe."
  },
  {
    q: "Peut-on quand même enregistrer des photos et vidéos sur son téléphone ?",
    a: "Oui, la voiture est également compatible avec smartphone via Wi-Fi. Vous pouvez enregistrer les courses et vos cascades directement dans la mémoire de votre téléphone pour les partager sur WhatsApp ou TikTok."
  },
  {
    q: "Quelle est l'autonomie et comment se recharge-t-elle ?",
    a: "La voiture est équipée d'une batterie lithium rechargeable haute performance. Le câble de charge rapide USB est inclus dans le coffret pour une recharge facile sur n'importe quel chargeur ou port USB."
  },
  {
    q: "À partir de quel âge ce bolide est-il recommandé ?",
    a: "Il convient parfaitement aux enfants dès 6 ans ainsi qu'aux adolescents et adultes passionnés de modélisme et de technologie, grâce à ses commandes intuitives à double joystick."
  },
  {
    q: "Comment se déroule la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée sous 24h à votre domicile ou bureau (Cotonou, Calavi, Porto-Novo et environs). Vous contrôlez le colis à l'arrivée et vous réglez en espèces au livreur."
  }
];

export default function VoitureCameraLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug || "voiture-camera");
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

  // Défilement automatique du carrousel Hero (3.8s)
  useEffect(() => {
    if (isHeroHovered || CAROUSEL_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  useEffect(() => {
    trackViewContent({
      content_name: "Voiture Télécommandée avec Caméra HD & Écran",
      content_ids: ["voiture-camera"],
      value: 29900,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Voiture Télécommandée avec Caméra HD & Écran",
      content_ids: ["voiture-camera"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: selectedBundle.quantity || 1,
    });
    trackInitiateCheckout({
      content_name: "Voiture Télécommandée avec Caméra HD & Écran",
      content_ids: ["voiture-camera"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: selectedBundle.quantity || 1,
    });
    orderSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");

    if (!customerName.trim()) {
      setOrderError("Veuillez renseigner votre nom complet.");
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8) {
      setOrderError("Veuillez renseigner un numéro de téléphone valide.");
      return;
    }

    setIsSubmitting(true);
    recordInteraction();

    try {
      const order = await saveNewOrder({
        product_slug: "voiture-camera",
        product_title: "Voiture Télécommandée avec Caméra HD & Écran",
        bundle_id: selectedBundle.id || "solo",
        bundle_name: selectedBundle.name,
        price: selectedBundle.price,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_phone2: customerPhone2.trim() || undefined,
        city: city.trim(),
        address: address.trim(),
        quantity: selectedBundle.quantity || 1,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content: utm.utm_content,
      });

      markLeadConverted(customerPhone.trim());

      trackPurchase({
        content_name: "Voiture Télécommandée avec Caméra HD & Écran",
        content_ids: ["voiture-camera"],
        value: selectedBundle.price,
        currency: "XOF",
        num_items: selectedBundle.quantity || 1,
      });

      if (typeof window !== "undefined") {
        const metaPayload = JSON.stringify({
          order_number: order.order_number,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          title: "Voiture Télécommandée avec Caméra HD & Écran",
          price: selectedBundle.price,
          quantity: selectedBundle.quantity || 1,
        });
        sessionStorage.setItem("last_order", metaPayload);
        sessionStorage.setItem("isivente_last_purchase_meta", metaPayload);
      }

      const successUrl = `/p/voiture-camera/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-rose-50 selection:text-rose-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Livraison express sous 24h • Paiement en espèces après vérification du colis</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Gamepad2 className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(225,29,72,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-rose-100 text-[11px]">(29 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
            <span>Pilotage Immersif FPV • Écran LCD Intégré</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900 leading-tight">
            Voiture Télécommandée avec Caméra HD
          </h1>
          
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Conduis, filme et vis l'action en temps réel ! Retransmission vidéo directe sur l'écran couleur de la manette sans latence.
          </p>
        </div>

        {/* ── GALERIE PHOTOS FOND BLANC BISEAUTÉ AVEC DÉFILEMENT AUTO ── */}
        <div 
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="max-w-[480px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4 space-y-3"
        >
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-inner flex items-center justify-center">
            <img 
              src={CAROUSEL_IMAGES[activeImgIndex]?.src || "/images/voiture-camera-banner.jpg"} 
              alt={CAROUSEL_IMAGES[activeImgIndex]?.alt || "Voiture Télécommandée avec Caméra HD"}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.01]"
            />
            
            {/* Badge Indicateur d'image */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-md z-10">
              {activeImgIndex + 1} / {CAROUSEL_IMAGES.length}
            </div>

            {/* Boutons précédents / suivants */}
            {CAROUSEL_IMAGES.length > 1 && (
              <>
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
              </>
            )}
          </div>

          {/* Miniatures interactives synchronisées */}
          {CAROUSEL_IMAGES.length > 1 && (
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {CAROUSEL_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] cursor-pointer ${
                    activeImgIndex === idx 
                      ? "border-rose-600 ring-2 ring-rose-600/20 shadow-xs" 
                      : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                  }`}
                >
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── BADGES TECHNIQUES ET RÉASSURANCE ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-rose-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
            <div className="text-[10px] text-slate-500 font-mono">Cotonou & Calavi</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Test à Réception</div>
            <div className="text-[10px] text-slate-500 font-mono">Paiement après contrôle</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <BatteryCharging className="w-5 h-5 text-amber-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">100% Rechargeable</div>
            <div className="text-[10px] text-slate-500 font-mono">Batterie & Câble USB</div>
          </div>
        </div>

        {/* ── FORMULAIRE DE COMMANDE ENCADRÉ (PRIORITAIRE SOUS LE HERO) ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="voiture-camera"
            productTitle="Voiture Télécommandée avec Caméra HD & Écran"
            productImage="/images/voiture-slide-salon.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Voiture Télécommandée Caméra HD - ${b.name}`,
                content_ids: ["voiture-camera", b.id || "solo"],
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
            accentColor="#e11d48"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── SECTION POINTS FORTS : POURQUOI CE BOLIDE EST UNIQUE ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
              <span>Technologies Embarquées</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              Tout le plaisir d'un cockpit de course dans vos mains
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Fini les voitures ordinaires qu'on regarde passer de loin : avec la caméra HD et l'écran sur la manette, vous pilotez comme si vous étiez assis derrière le volant !
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-2xs">
                <Tv className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Écran LCD Couleur Intégré</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retransmission en direct directement sur la télécommande. Aucun besoin de téléphone pour profiter immédiatement du spectacle.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-2xs">
                <Camera className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Caméra HD sur le Toit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Capteur grand angle qui capture la route au ras du sol pour des sensations de vitesse et de virages ultra-réalistes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-2xs">
                <Wifi className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Transmission Wi-Fi Fluide</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Signal 2.4GHz stable et vidéo sans latence, permettant d'explorer même sous les lits, canapés et autres pièces.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-2xs">
                <Smartphone className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Compatible Smartphone</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Option pour synchroniser avec l'application mobile afin d'enregistrer des photos et vidéos pour TikTok et WhatsApp.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-2xs">
                <Gauge className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Phares LED & Conduite Vive</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lumières avant réalistes qui éclairent la trajectoire dans l'obscurité, avec un châssis vif parfait pour les dérapages contrôlés.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-2xs">
                <Gift className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Le Cadeau Parfait</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                L'effet de surprise est garanti pour un anniversaire, une fête ou pour faire plaisir à un passionné de vitesse et de gadgets.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION VISUELLE 1 : EXPLORATION ENDROITS INACCESSIBLES ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src="/images/voiture-slide-exploration.jpg"
                alt="Explore les endroits inaccessibles en direct"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="md:col-span-6 lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Camera className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
                <span>Exploration Furtive</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                Passez là où aucun autre jouet ne peut aller
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Grâce à son châssis profilé et sa caméra grand angle, explorez en toute autonomie :
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Sous le canapé :</strong> Observez l'envers du décor sans vous pencher.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Sous le lit & meubles :</strong> Retrouvez les objets égarés avec l'éclairage LED.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Dans les recoins :</strong> Slalomez avec précision grâce au double joystick.</span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <span>Commander maintenant (29 900 F)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION VISUELLE 2 : DRIFT & SENSATIONS 360° ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 lg:col-span-5 space-y-4 order-2 md:order-1">
              <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
                <span>Drift & Vitesse Pure</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                Sensations fortes, dérapages contrôlés et feux réalistes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Équipée d'un moteur ultra-nerveux et de pneus adaptés au drift, la voiture réagit au millimètre à chaque coup de volant :
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Drift 360° :</strong> Réalisez des figures spectaculaires sur carrelage ou parquet.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Effets sonores réalistes :</strong> Bruits d'accélération et de moteur de course.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Lumières LED stylées :</strong> Phares avant étincelants et feux arrière sport.</span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <span>Je commande à 29 900 FCFA</span>
                </button>
              </div>
            </div>
            <div className="md:col-span-6 lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-sm order-1 md:order-2">
              <img
                src="/images/voiture-slide-drift.jpg"
                alt="Drift et sensations fortes lumières son et vitesse"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── SECTION VIDÉO : REEL INSTAGRAM EN ACTION ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-5 overflow-hidden">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Eye className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
              <span>Démo en Conditions Réelles</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              Vois-le en action — Caméra HD activée 🎬
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Le bolide de course FPV filmé en direct depuis sa caméra embarquée. Exactement ce que tu recevras.
            </p>
          </div>

          {/* Instagram Reel Embed */}
          <div className="flex justify-center">
            <div
              className="relative w-full max-w-[380px] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900"
              style={{ aspectRatio: "9/16", maxHeight: "680px" }}
            >
              <iframe
                src="https://www.instagram.com/reel/DXeQ96bjBhy/embed/captioned/"
                className="absolute inset-0 w-full h-full border-none"
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Voiture Télécommandée avec Caméra HD - Démo en temps réel"
                scrolling="no"
                frameBorder="0"
              />
            </div>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={scrollToOrder}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <span>Je veux cette voiture (29 900 FCFA)</span>
            </button>
          </div>
        </section>

        {/* ── SECTION VISUELLE 3 : LE CADEAU PARFAIT & UNBOXING ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src="/images/voiture-slide-cadeau.jpg"
                alt="Le cadeau parfait pour les enfants et les passionnés"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="md:col-span-6 lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Gift className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
                <span>Le Cadeau Idéal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                Un coffret qui émerveille à coup sûr
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Offrez un moment magique ! Vos enfants s'éloignent enfin des écrans passifs pour s'amuser avec un vrai bolide interactif.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-900">Livré complet dans sa boîte de présentation :</div>
                <div>📦 Boîte officielle C6 Mini RC</div>
                <div>🎮 Télécommande manette avec écran couleur 2.4"</div>
                <div>🔋 Batterie rechargeable & Câble USB</div>
                <div>📖 Manuel d'utilisation détaillé</div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  <span>Profiter de l'offre (29 900 FCFA)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION CONTENU DU COFFRET COMPLET ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Que contient votre coffret officiel ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tout est prêt à l'emploi dès la sortie de la boîte.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">1x Mini Bolide Sport GT avec Caméra HD</span>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">1x Télécommande Manette avec Écran LCD Couleur</span>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">1x Batterie Lithium Rechargeable Haute Densité</span>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">1x Câble de charge USB rapide & Guide illustré</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={scrollToOrder}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <span>Commander mon bolide maintenant (29 900 F)</span>
            </button>
          </div>
        </section>

        {/* ── SECTION AVIS CLIENTS ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current stroke-current" />
              ))}
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Ce que disent nos clients au Bénin
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Note moyenne de 4.9/5 basée sur plus de 180 commandes livrées.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current stroke-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Vérifié
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">« {rev.title} »</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800">{rev.name}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION FOIRE AUX QUESTIONS (ACCORDÉON) ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Questions Fréquentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Des réponses claires pour commander en toute tranquillité.
            </p>
          </div>

          <div className="space-y-2.5 max-w-2xl mx-auto">
            {FAQS_DATA.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ── FOOTER ÉPURÉ ── */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="font-bold text-slate-800 tracking-wider">ISIVENTE • BÉNIN</div>
        <p>© {new Date().getFullYear()} Isivente. Tous droits réservés. Service client disponible 7j/7.</p>
      </footer>

      {/* ── STICKY MOBILE CTA BAR ── */}
      <StickyMobileCtaBar
        price={29900}
        targetSectionId="commander"
        accentColor="#e11d48"
        whatsappMessage="Bonjour Isivente ! Je souhaite commander la Voiture Télécommandée avec Caméra HD à 29 900 FCFA avec livraison à domicile."
      />

    </div>
  );
}
