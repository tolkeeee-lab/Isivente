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
  Eye, 
  BatteryCharging, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Activity,
  Headphones,
  Laptop,
  HeartPulse,
  Clock,
  Feather
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

/* ─── PILIER 1 : OFFRE UNIQUE (24 900 FCFA) SANS MULTI-PACKS ─── */
const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth",
    subtitle: "Coffret complet avec masque pliable 180°, câble de charge USB-C, pochette de protection et garantie 1 an",
    price: 24900,
    originalPrice: 45000,
    savings: 20100,
    quantity: 1,
    popular: true,
  },
];

/* ─── PHOTOS CARROUSEL HERO PRINCIPAL ─── */
const CAROUSEL_IMAGES = [
  { 
    src: "/images/masseur-oculaire-hero.jpg", 
    alt: "Masque de Massage Oculaire 4D Pliable 180° Blanc & Gris Studio",
    caption: "Design ergonomique pliable à 180°, coussin intérieur soyeux respirant et commande tactile intuitive"
  },
  { 
    src: "/images/masseur-oculaire-temple.jpg", 
    alt: "Acupression sur les tempes et thermothérapie 42°C en action",
    caption: "Acupression pneumatique sur le point Taiyang (tempes) combinée à une chaleur apaisante continue à 42°C"
  },
  { 
    src: "/images/masseur-oculaire-screen.jpg", 
    alt: "Cadre au bureau prenant une pause régénérante de 15 minutes",
    caption: "La pause idéale au bureau : réhydrate le regard et élimine la fatigue des écrans en 15 minutes chrono"
  },
  { 
    src: "/images/masseur-oculaire-sleep.jpg", 
    alt: "Endormissement paisible au lit avec masque oculaire et Bluetooth",
    caption: "Endormissement naturel et profond le soir au lit grâce à l'obscurité totale et à la diffusion audio Bluetooth"
  },
  { 
    src: "/images/masseur-oculaire-box.jpg", 
    alt: "Coffret complet unboxing avec masque, pochette, câble et notice",
    caption: "Coffret officiel prêt à offrir : masque pliable, câble USB-C renforcé, pochette velours et manuel"
  },
];

/* ─── CARROUSEL D'EXPLORATION DES SITUATIONS DU QUOTIDIEN ─── */
const EXPLORATION_SLIDES = [
  {
    src: "/images/masseur-oculaire-screen.jpg",
    title: "Pause Bureau & Écrans",
    subtitle: "Soulagement immédiat après 8h sur ordinateur et smartphone",
    badge: "15 MIN EXPRESS"
  },
  {
    src: "/images/masseur-oculaire-temple.jpg",
    title: "Soulagement Migraines",
    subtitle: "Pression ciblée sur les tempes pour libérer la tension nerveuse",
    badge: "THÉRAPEUTIQUE"
  },
  {
    src: "/images/masseur-oculaire-sleep.jpg",
    title: "Rituel de Nuit & Sommeil",
    subtitle: "Chaleur douce 42°C pour s'endormir sans médicaments",
    badge: "SOMMEIL PROFOND"
  },
  {
    src: "/images/masseur-review-femme.jpg",
    title: "Soin Beauté & Anti-Cernes",
    subtitle: "Drainage lymphatique pour dégonfler les yeux au réveil",
    badge: "SPA À DOMICILE"
  },
  {
    src: "/images/masseur-oculaire-box.jpg",
    title: "Format Voyage Pliable 180°",
    subtitle: "Glisse facilement dans un sac à main, sacoche ou valise",
    badge: "NOMADE & LÉGER"
  },
];

/* ─── AVIS CLIENTS VÉRIFIÉS ─── */
interface CustomerReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  image: string;
  imageCaption: string;
  verified: boolean;
}

const REVIEWS_DATA: CustomerReview[] = [
  {
    name: "Marius A.",
    location: "Cadre bancaire • Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié Isivente",
    title: "Le meilleur investissement pour mes yeux après des journées sur Excel",
    comment: "Je passe 9 heures par jour devant des tableurs. Chaque soir j'avais les yeux rouges et une migraine tenace sur les tempes. Dès la première utilisation de 15 minutes avec la chaleur à 42°C, la tension a totalement disparu. Le livreur me l'a apporté à mon bureau et j'ai pu l'allumer avant de payer. Chapeau !",
    image: "/images/masseur-review-cadre.jpg",
    imageCaption: "Marius A. utilisant son masque après sa journée de travail",
    verified: true,
  },
  {
    name: "Clarisse D.",
    location: "Comptable & Entrepreneure • Calavi (Arca)",
    rating: 5,
    date: "Achat vérifié Isivente",
    title: "Incroyable pour le sommeil et les poches sous les yeux !",
    comment: "J'avais beaucoup de mal à m'endormir car mon cerveau tournait sans arrêt le soir. En mettant le masque avec la musique douce Bluetooth, je m'endors littéralement avant que les 15 minutes ne soient écoulées. En plus, le matin mes poches sous les yeux ont nettement diminué. Je ne peux plus m'en passer.",
    image: "/images/masseur-review-femme.jpg",
    imageCaption: "Clarisse D. très satisfaite de son rituel bien-être du soir",
    verified: true,
  },
  {
    name: "Dr. Boris K.",
    location: "Consultant IT • Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié Isivente",
    title: "Finition impeccable et zéro pression sur le globe oculaire",
    comment: "J'avais peur que l'appareil compresse directement la pupille, mais pas du tout : le centre est creux et doux, la pression d'air s'exerce sur les arcades sourcilières et les tempes. C'est exactement le principe de l'acupression chinoise. Qualité premium, batterie qui tient toute la semaine.",
    image: "/images/masseur-review-table.jpg",
    imageCaption: "Appareil posé sur la table de chevet prêt pour la nuit",
    verified: true,
  },
];

/* ─── QUESTIONS FRÉQUENTES ─── */
const FAQS_DATA = [
  {
    q: "L'appareil exerce-t-il une pression directe sur les yeux ?",
    a: "Non, absolument pas. La structure interne a été spécialement moulée en 3D avec une zone centrale creusée. Les coussins d'air massent délicatement le contour orbitaire, le front et les tempes (point Taiyang) sans jamais écraser le globe oculaire ni la cornée."
  },
  {
    q: "Peut-on écouter sa propre musique ou désactiver le son ?",
    a: "Oui ! L'appareil est équipé d'une puce Bluetooth 5.0 intégrée. Vous pouvez connecter votre smartphone (iPhone ou Android) en 3 secondes pour écouter vos chansons, podcasts ou méditations préférées. Si vous préférez le silence total, un simple double-clic sur le bouton coupe la musique."
  },
  {
    q: "La chaleur est-elle sans danger pour la peau ?",
    a: "La température est régulée par un thermostat électronique intelligent stabilisé à 42°C (la température idéale de vasodilatation médicale). Elle réchauffe doucement les paupières pour stimuler les glandes de Meibomius et réhydrater naturellement l'œil sans aucune sensation de brûlure."
  },
  {
    q: "Comment se passe la livraison et le paiement au Bénin ?",
    a: "Nous livrons sous 24h à Cotonou, Calavi et Porto-Novo (et 48h dans les autres villes). Le livreur vous remet le colis en main propre : vous l'ouvrez, vous allumez l'appareil pour tester son fonctionnement, et vous réglez en espèces uniquement si vous êtes 100 % satisfait."
  },
  {
    q: "Quelle est l'autonomie de la batterie et comment se recharge-t-il ?",
    a: "La batterie interne au lithium de 1 200 mAh offre environ 8 à 10 séances de 15 minutes par charge. L'appareil s'éteint automatiquement au bout de 15 minutes pour sécuriser votre séance si vous vous endormez. Il se recharge facilement avec n'importe quel câble USB Type-C (fourni)."
  },
];

export default function EyeMassagerLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug || "masseur-oculaire");
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const explorationScrollRef = useRef<HTMLDivElement>(null);
  const [isExplorationHovered, setIsExplorationHovered] = useState(false);

  // Auto-play vidéo en boucle sans blocage
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Défilement automatique du carrousel Hero (3.8s)
  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  // Défilement automatique de la galerie d'exploration (2.8s)
  useEffect(() => {
    if (isExplorationHovered) return;
    const interval = setInterval(() => {
      if (explorationScrollRef.current) {
        const el = explorationScrollRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 15) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 240, behavior: "smooth" });
        }
      }
    }, 2800);
    return () => clearInterval(interval);
  }, [isExplorationHovered]);

  const scrollExploration = (direction: "left" | "right") => {
    if (explorationScrollRef.current) {
      const offset = direction === "left" ? -240 : 240;
      explorationScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    trackViewContent({
      content_name: "Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth",
      content_ids: ["masseur-oculaire"],
      value: 24900,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth",
      content_ids: ["masseur-oculaire"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: selectedBundle.quantity || 1,
    });
    trackInitiateCheckout({
      content_name: "Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth",
      content_ids: ["masseur-oculaire"],
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
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: address.trim() || `${city} - Livraison à domicile`,
        shipping_city: city,
        product_slug: "masseur-oculaire",
        product_title: "Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth",
        bundle_id: selectedBundle.id || "solo",
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity || 1,
        total_amount: selectedBundle.price,
        status: "pending",
      });

      await markLeadConverted(customerPhone, "masseur-oculaire");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth",
          price: selectedBundle.price,
          quantity: selectedBundle.quantity || 1,
        }));
      }

      const successUrl = `/p/masseur-oculaire/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-50 selection:text-indigo-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Livraison express 24h à Cotonou & Calavi • Testez l'appareil avec le livreur avant de payer</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND BLANC AVEC LISERÉ BISEAUTÉ ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Eye className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(99,102,241,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-indigo-100 text-[11px]">(24 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 stroke-[1.75]" />
            <span>Thérapie Pneumatique 4D & Thermothérapie 42°C</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900 leading-tight">
            Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth
          </h1>
          
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Détendez vos tempes et vos yeux en 15 minutes chrono. Associe micro-compression d'air intelligente, chaleur douce continue à 42°C et musique relaxante pour éliminer fatigue des écrans, migraines et insomnies.
          </p>
        </div>

        {/* ── GALERIE PHOTOS HERO AVEC DÉFILEMENT AUTO 3.8s ── */}
        <div 
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-5 space-y-3"
        >
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60">
            <img 
              src={CAROUSEL_IMAGES[activeImgIndex].src} 
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
            />
            
            {/* Boutons de navigation manuelle fléchés */}
            <button
              onClick={() => setActiveImgIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={() => setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Légende sous l'image */}
            <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 text-center font-medium shadow-md">
              {CAROUSEL_IMAGES[activeImgIndex].caption}
            </div>
          </div>

          {/* Miniatures cliquables synchronisées */}
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] cursor-pointer ${
                  activeImgIndex === idx 
                    ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm" 
                    : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE PILIERS ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-indigo-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
            <div className="text-[10px] text-slate-500 font-mono">Cotonou & Calavi</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Test à Réception</div>
            <div className="text-[10px] text-slate-500 font-mono">Paiement après essai</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <BatteryCharging className="w-5 h-5 text-amber-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">100% Sans Fil</div>
            <div className="text-[10px] text-slate-500 font-mono">Batterie USB-C</div>
          </div>
        </div>

        {/* ── PILIER 2 : FORMULAIRE DE COMMANDE DIRECTEMENT SOUS LE HERO & BADGES ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="masseur-oculaire"
            productTitle="Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth"
            productImage="/images/masseur-oculaire-hero.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Masque Oculaire - ${b.name}`,
                content_ids: ["masseur-oculaire", b.id || "solo"],
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
            accentColor="#4f46e5"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── SECTION VIDÉO DÉMONSTRATION AUTOPLAY (PILIER 4) ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 stroke-[1.75]" />
              <span>Démonstration en Vidéo</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              Voyez comment la pression pneumatique et la chaleur agissent
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              La vidéo se lance automatiquement en boucle. Vous pouvez activer le son ou faire pause à tout moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Lecteur Vidéo Vertical */}
            <div className="md:col-span-6 lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[290px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-950 border-4 border-slate-900 shadow-2xl">
                <video
                  ref={videoRef}
                  src="/videos/masseur-oculaire-demo.mp4"
                  poster="/images/masseur-oculaire-temple.jpg"
                  autoPlay
                  muted
                  playsInline
                  loop
                  controls
                  preload="auto"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Points Forts & Témoignage */}
            <div className="md:col-span-6 lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="flex text-amber-400 text-xs tracking-tight">★★★★★</div>
                <p className="text-xs sm:text-sm font-semibold text-indigo-950 italic leading-relaxed">
                  « Après mes réunions et mes journées sur écran, c'est mon sas de décompression absolu. En 15 minutes la migraine s'évapore et je retrouve des yeux reposés. »
                </p>
                <div className="text-[11px] text-indigo-700 font-medium">— Arnaud K., Directeur de cabinet à Cotonou</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <Flame className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Thermothérapie stabilisée à 42°C</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Stimule la microcirculation et les glandes lacrymales pour réhydrater les yeux naturellement.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Zéro pression sur le globe oculaire</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Cavité centrale creuse anatomique : la pression se concentre uniquement sur les tempes et arcades.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <Headphones className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Audio Bluetooth 5.0 sans fil</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Écoutez vos playlists de relaxation préférées ou profitez du silence total selon vos envies.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={scrollToOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
              >
                <span>Commander maintenant (24 900 FCFA)</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION THÉRAPEUTIQUE 1 : FATIGUE ÉCRANS & YEUX SECS ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="relative aspect-square sm:aspect-auto sm:h-full bg-slate-100 min-h-[300px]">
              <img 
                src="/images/masseur-oculaire-screen.jpg" 
                alt="Soulagement de la fatigue des écrans au bureau"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Laptop className="w-3.5 h-3.5 text-blue-600 stroke-[1.75]" />
                <span>Spécial Cadres & Travail sur Écran</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
                Fin des yeux rouges, secs et de la vision floue en fin de journée
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Quand vous fixez un écran d'ordinateur ou de smartphone pendant des heures, vous clignez 3 fois moins des yeux. La chaleur apaisante à 42°C liquéfie les lipides oculaires et stimule les glandes lacrymales. En 15 minutes, vos yeux sont naturellement réhydratés sans collyre chimique.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Supprime la sensation de sable et de brûlure dans les yeux</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Restaure une vision nette et claire pour le reste de la journée</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Indispensable pour comptables, informaticiens, juristes et étudiants</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION THÉRAPEUTIQUE 2 : MIGRAINES & ACUPRESSION DES TEMPES ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="p-6 sm:p-8 space-y-4 order-2 md:order-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Activity className="w-3.5 h-3.5 text-amber-600 stroke-[1.75]" />
                <span>Acupression Chinoise Ciblée</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
                Soulagez vos céphalées et maux de tête sans médicaments
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Les coussins d'air intelligents exercent une pression rythmique synchronisée sur le point d'acupuncture <strong className="text-slate-800">Taiyang</strong> (situé exactement sur les tempes). Cela libère la pression intra-crânienne accumulée par le stress, la chaleur et la fatigue nerveuse.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 stroke-[1.75]" />
                  <span>Détend les muscles temporaux et frontaux contractés</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 stroke-[1.75]" />
                  <span>Alternative saine et naturelle au paracétamol quotidien</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 stroke-[1.75]" />
                  <span>Effet apaisant immédiat dès les 5 premières minutes</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-square sm:aspect-auto sm:h-full bg-slate-100 min-h-[300px] order-1 md:order-2">
              <img 
                src="/images/masseur-oculaire-temple.jpg" 
                alt="Acupression sur les tempes et thermothérapie"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── SECTION THÉRAPEUTIQUE 3 : SOMMEIL & ENDORMISSEMENT 15 MIN ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="relative aspect-square sm:aspect-auto sm:h-full bg-slate-100 min-h-[300px]">
              <img 
                src="/images/masseur-oculaire-sleep.jpg" 
                alt="Endormissement en 15 minutes au lit"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Moon className="w-3.5 h-3.5 text-indigo-600 stroke-[1.75]" />
                <span>Induction Naturelle du Sommeil</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
                Endormez-vous paisiblement sans somnifère ni insomnie
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Le secret d'un endormissement rapide réside dans l'obscurité totale et la baisse du rythme cardiaque. La chaleur douce combinée à vos sons de relaxation Bluetooth enclenche naturellement la sécrétion de mélatonine. 8 utilisateurs sur 10 s'endorment avant même la fin de la séance.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 stroke-[1.75]" />
                  <span>Arrêt automatique après 15 min : dormez l'esprit tranquille</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 stroke-[1.75]" />
                  <span>Bloque 100% de la lumière ambiante pour un repos nocturne absolu</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 stroke-[1.75]" />
                  <span>Réveil sans fatigue avec les idées claires et l'esprit reposé</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LES 4 MODES INTELLIGENTS ── */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-600">Polyvalence</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-[-0.02em]">4 Modes Thérapeutiques selon votre besoin :</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Sparkles className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">Mode Vitalité (Complet)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compression d'air 4D + Chaleur continue 42°C + Musique apaisante. Le combo idéal après une grosse journée.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Flame className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">Mode Thermothérapie Pure</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bain de chaleur douce à 42°C sans compression. Parfait pour les yeux secs, fatigués ou qui piquent.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Moon className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">Mode Sommeil Profond</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Micro-vibrations feutrées + chaleur légère + mélodies douces pour plonger dans les bras de Morphée.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <VolumeX className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">Mode Silencieux Discret</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compression d'air et chaleur sans aucune musique ni bip. Idéal pour une pause zen au bureau en toute discrétion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── GALERIE D'EXPLORATION DU QUOTIDIEN (AUTO-DÉFILANT 2.8s) ── */}
        <section 
          onMouseEnter={() => setIsExplorationHovered(true)}
          onMouseLeave={() => setIsExplorationHovered(false)}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-600">
                <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Situations du Quotidien</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-[-0.02em]">
                Où et quand l'utiliser pour transformer vos journées :
              </h2>
            </div>
            
            {/* Contrôles de navigation fléchés */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Défilement automatique • Explorer :
              </span>
              <button
                onClick={() => scrollExploration("left")}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Défiler vers la gauche"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                onClick={() => scrollExploration("right")}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Défiler vers la droite"
              >
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          <div 
            ref={explorationScrollRef}
            className="flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin -mx-2 px-2"
          >
            {EXPLORATION_SLIDES.map((slide, idx) => (
              <div 
                key={idx}
                className="min-w-[210px] sm:min-w-[230px] max-w-[250px] shrink-0 snap-start rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] flex flex-col hover:border-indigo-200 transition-all group"
              >
                <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={slide.src} 
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/10">
                    {slide.badge}
                  </div>
                </div>
                <div className="p-3.5 bg-white space-y-1">
                  <div className="text-xs font-bold text-slate-900 leading-snug">{slide.title}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{slide.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CARACTÉRISTIQUES TECHNIQUES DÉTAILLÉES ── */}
        <section className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="text-xs font-bold text-slate-900">Spécifications techniques officielles</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 text-[10.5px]">Température</div>
              <div className="text-slate-900 font-mono tabular-nums font-bold mt-0.5">42°C ± 1°C constant</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 text-[10.5px]">Autonomie</div>
              <div className="text-slate-900 font-mono tabular-nums font-bold mt-0.5">8 à 10 séances</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 text-[10.5px]">Arrêt Sécurisé</div>
              <div className="text-slate-900 font-mono tabular-nums font-bold mt-0.5">15 min automatique</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 text-[10.5px]">Recharge</div>
              <div className="text-slate-900 font-bold mt-0.5">USB Type-C universel</div>
            </div>
          </div>
        </section>

        {/* ── AVIS CLIENTS & PHOTOS RÉELLES ── */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-600">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Retours d'Expérience Réels au Bénin</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-[-0.02em]">
              Ce que nos clients en disent après utilisation :
            </h2>
            <p className="text-xs text-slate-600 max-w-xl">
              Témoignages authentiques d'acheteurs vérifiés à Cotonou et Calavi ayant testé et approuvé le masque.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4.5">
            {REVIEWS_DATA.map((rev, idx) => (
              <div 
                key={idx} 
                className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row gap-5 items-stretch"
              >
                {/* Photo réelle cadrée bord à bord à gauche */}
                <div className="w-full sm:w-60 h-60 sm:h-auto min-h-[200px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/70 relative shrink-0 shadow-2xs">
                  <img 
                    src={rev.image} 
                    alt={rev.imageCaption} 
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-950/85 backdrop-blur-sm text-white text-[10px] font-medium py-1.5 px-3 rounded-xl text-center leading-tight shadow-md border border-white/10">
                    {rev.imageCaption}
                  </div>
                </div>

                {/* Avis & Détails à droite */}
                <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm tracking-tight">{rev.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{rev.location}</div>
                      </div>
                      <div className="flex text-amber-400 text-sm tracking-tight">
                        {"★".repeat(rev.rating)}
                      </div>
                    </div>

                    <div className="text-sm font-bold text-slate-900 leading-snug">
                      « {rev.title} »
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-3 border-t border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                    <span>Achat vérifié Isivente</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOIRE AUX QUESTIONS ── */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3">
          <div className="text-xs font-bold text-slate-900">Questions fréquentes</div>

          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors duration-100 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeFaq === idx ? "rotate-180 text-indigo-600" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed pt-1">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── BARRE MOBILE FLOTTANTE POUR COMMANDER (PRIX UNIFORME 24 900 FCFA) ── */}
      <StickyMobileCtaBar
        price={24900}
        accentColor="#4f46e5"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Masque de Massage Oculaire Thérapeutique 4D à 24 900 FCFA avec livraison à domicile."
      />

    </div>
  );
}
