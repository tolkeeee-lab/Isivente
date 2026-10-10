"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Heart, 
  Zap, 
  PackageCheck,
  Gift,
  ArrowRight,
  Usb,
  RotateCw,
  Compass,
  Smile,
  Flame,
  Check
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Lampe Projecteur de Noël Féerique USB 360° (Coffret Officiel)",
    subtitle: "Coffret complet avec lampe sapin LED, tige flexible 360°, embout USB universel, disque multi-motifs féeriques et garantie Isivente",
    price: 16900,
    originalPrice: 28000,
    savings: 11100,
    quantity: 1,
    popular: true,
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

const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    name: "Murielle K.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes deux enfants ont les yeux qui brillent !",
    comment: "J'ai branché la petite lampe sur ma batterie externe hier soir dans leur chambre dans le noir complet. Toute la pièce s'est illuminée avec le Père Noël et les sapins au plafond ! Mes enfants de 4 et 7 ans étaient émerveillés. C'est magique.",
    verified: true,
  },
  {
    name: "Arnaud D.",
    location: "Calavi (Tankpè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Incroyable pour une si petite lampe",
    comment: "Quand j'ai ouvert le paquet je me demandais si ça éclairerait fort. Dès qu'on l'allume, la projection est nette et lumineuse sur tout le plafond ! La tige se tord dans tous les sens pour régler l'angle. Très surpris par la qualité.",
    verified: true,
  },
  {
    name: "Blandine A.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Livré en 24h et testé devant le livreur",
    comment: "Livraison ultra rapide. Le livreur a attendu que je branche sur mon chargeur pour vérifier avant d'encaisser les 16 900 F. Zéro prise de tête, pas de piles à acheter. Un super cadeau pour les fêtes.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Sur quoi peut-on brancher le projecteur de Noël ?",
    a: "Le projecteur est équipé d'un embout USB standard universel. Vous pouvez le brancher sur une batterie externe (Powerbank), un simple chargeur de téléphone sur prise secteur, le port USB d'un téléviseur, d'un ordinateur portable, ou même dans la prise USB de votre voiture."
  },
  {
    q: "Faut-il acheter des piles jetables ?",
    a: "Non, absolument aucune pile ! Vous le branchez directement en USB et il s'allume instantanément. Zéro dépense supplémentaire en piles jetables qui se déchargent vite."
  },
  {
    q: "Comment changer ou ajuster les motifs de Noël ?",
    a: "Il vous suffit de faire pivoter ou insérer le disque optique multi-motifs situé sur le projecteur pour alterner entre le Père Noël, les sapins scintillants, les rennes magiques, les flocons de neige, les cloches et les bonhommes de neige."
  },
  {
    q: "La tige flexible est-elle solide et orientable ?",
    a: "Oui, la tige à col de cygne tressé haute résistance s'oriente à 360° dans toutes les directions. Vous pouvez pointer la lumière directement vers le plafond, un mur, au pied du sapin ou au-dessus de la crèche."
  },
  {
    q: "La lampe chauffe-t-elle après plusieurs heures ?",
    a: "Non, elle utilise des micro-LEDs froides haute luminosité qui ne chauffent pas, ce qui la rend parfaitement sûre pour la chambre des enfants et les décorations de fêtes."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue en 24h à Cotonou, Calavi et partout au Bénin. Vous payez en espèces (16 900 FCFA) uniquement après avoir reçu et inspecté votre projecteur auprès du livreur."
  }
];

const HERO_IMAGES = [
  {
    src: "/images/projecteur-noel/hero-famille.jpg",
    alt: "Cette année, offrez-leur la magie de Noël avec le projecteur USB",
    label: "Magie en Famille",
  },
  {
    src: "/images/projecteur-noel/enfant-magie.jpg",
    alt: "Émerveillement des enfants devant les projections au plafond",
    label: "Émerveillement Garanti",
  },
  {
    src: "/images/projecteur-noel/etapes-motifs.jpg",
    alt: "Branchez et profitez : 3 étapes simples et 6 projections",
    label: "Simple & Immédiat",
  },
  {
    src: "/images/projecteur-noel/caracteristiques-usb.jpg",
    alt: "Lampe flexible 360 USB sur batterie externe",
    label: "Flexible 360° USB",
  },
  {
    src: "/images/projecteur-noel/motifs-designs.jpg",
    alt: "6 motifs féeriques de Noël au plafond",
    label: "6+ Motifs Féeriques",
  },
];

const MOTIFS_LIST = [
  { name: "Père Noël", desc: "Le Père Noël festif avec sa hotte de cadeaux", icon: "🎅" },
  { name: "Flocons d'hiver", desc: "Flocons scintillants blancs et rouges", icon: "❄️" },
  { name: "Sapins de Noël", desc: "Arbres de Noël féeriques illuminés", icon: "🎄" },
  { name: "Rennes Magiques", desc: "Rennes dorés en plein saut dans la nuit", icon: "🦌" },
  { name: "Bonhomme de Neige", desc: "Souriant avec son écharpe d'hiver", icon: "⛄" },
  { name: "Cadeaux & Cloches", desc: "Cloches de fête et paquets cadeaux", icon: "🎁" },
];

export default function ProjecteurNoelLanding({ slug = "projecteur-noel" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const utm = useUTM();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Pilier 3 : Carrousel auto-défilant avec pause au survol
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

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
        product_slug: "projecteur-noel",
        product_title: "Lampe Projecteur de Noël Féerique USB 360°",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Lampe Projecteur de Noël Féerique USB 360°",
      content_ids: ["projecteur-noel", "noel"],
      value: 16900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Lampe Projecteur de Noël Féerique USB 360°",
      content_ids: ["projecteur-noel"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
        product_title: "Lampe Projecteur de Noël Féerique USB 360°",
        product_slug: "projecteur-noel",
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

      markLeadConverted(customerPhone.trim(), "projecteur-noel");

      // Stocker les métadonnées pour la page success (qui déclenche l'événement dédupliqué avec le bon order_id)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Lampe Projecteur de Noël Féerique USB 360°",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/projecteur-noel/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-slate-800 font-sans selection:bg-red-100 selection:text-red-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span>Édition Spéciale Fêtes de Noël • Livraison express 24h au Bénin • Paiement à la réception</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Gift className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(220,38,38,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-red-100 text-[11px]">(16 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3.5 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Fêtes de Fin d&apos;Année • Ambiance Féerique</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Cette Année, Offrez-leur la <span className="text-red-600">Magie de Noël</span> chez Vous.
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Branchez sur n&apos;importe quel port USB et transformez le plafond et toute la pièce en véritable ciel étoilé de Noël. 6+ motifs féeriques scintillants sans aucun montage.
          </p>
        </div>

        {/* ── CARROUSEL HERO AUTO-DÉFILANT (PILIER 3) ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-950 border border-slate-200 overflow-hidden flex items-center justify-center group">
            
            {/* Image Slide */}
            <div className="relative w-full h-full">
              <Image
                src={HERO_IMAGES[currentSlide].src}
                alt={HERO_IMAGES[currentSlide].alt}
                fill
                className="object-contain sm:object-cover transition-opacity duration-500"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>

            {/* Flèches de navigation manuelles */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Légende en bas */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 text-white text-xs sm:text-sm font-medium z-10 flex items-center justify-between">
              <p className="line-clamp-1">{HERO_IMAGES[currentSlide].label}</p>
              
              {/* Indicateurs de points */}
              <div className="flex items-center gap-1.5 shrink-0">
                {HERO_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? "bg-red-500 w-5" : "bg-white/50 hover:bg-white"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & tout le Bénin</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 16 900 F après vérification</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Testez la lampe avec le livreur</p>
            </div>
          </div>
        </div>

        {/* ── PILIER 2 : FORMULAIRE DE COMMANDE (COD) IMMÉDIATEMENT APRÈS ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug="projecteur-noel"
            productTitle="Lampe Projecteur de Noël Féerique USB 360°"
            productImage="/images/projecteur-noel/hero-famille.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Projecteur Noël - ${b.name}`,
                content_ids: ["projecteur-noel", b.id || "solo"],
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
            accentColor="#dc2626"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── LES 3 ÉTAPES ULTRA-SIMPLES : BRANCHEZ & PROFITEZ ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Installation en 10 secondes</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Branchez & Profitez : Zéro montage, Zéro tracas</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Pas besoin d&apos;outils, de vis ou d&apos;électricien. La magie commence à la seconde où vous branchez l&apos;embout USB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Branchez sur USB</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Insérez l&apos;embout sur votre batterie externe, chargeur de téléphone, TV ou port USB ordinateur.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Choisissez le motif</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tournez ou insérez simplement le disque optique pour changer la projection selon vos envies.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Profitez de la magie !</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Orientez la tige à 360° vers le plafond et admirez les étoiles et motifs de Noël illuminer la pièce.
              </p>
            </div>

          </div>
        </section>

        {/* ── GRILLE DES 4 FONCTIONS MAJEURES DU PROJECTEUR ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Pourquoi Vous Allez L&apos;Adorer</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 atouts qui font toute la différence</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une conception compacte, robuste et féerique conçue pour émerveiller petits et grands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Atout 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <Usb className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Port USB Universel</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compatible powerbank, chargeur de téléphone, TV et prise voiture. Zéro pile coûteuse à racheter.
              </p>
            </div>

            {/* Atout 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">6+ Motifs Féeriques</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Père Noël, flocons, sapins scintillants, rennes, cloches et bonhommes de neige en haute netteté.
              </p>
            </div>

            {/* Atout 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Compass className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Tige Flexible 360°</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Col de cygne robuste orientable dans tous les sens pour projeter au plafond, sur les murs ou sous le sapin.
              </p>
            </div>

            {/* Atout 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Smile className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Cadeau Idéal de Noël</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le cadeau parfait qui émerveille instantanément les enfants au coucher et réchauffe les soirées en famille.
              </p>
            </div>

          </div>
        </section>

        {/* ── SECTION DÉMONSTRATION VIDÉO EN ACTION (PILIER 4 AUTOPLAY) ── */}
        <section id="demo-video" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Démonstration Réelle</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Voyez la Magie de Noël Prendre Vie
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Regardez comment cette petite lampe métamorphose instantanément une pièce plongée dans le noir en véritable conte de fées.
            </p>
          </div>

          <div className="relative max-w-sm sm:max-w-md mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md">
            <video
              src="/videos/veilleuse-sapin-noel-crea-1-rapide.mp4"
              poster="/images/projecteur-noel/enfant-magie.jpg"
              autoPlay
              muted
              playsInline
              loop
              controls
              preload="auto"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander maintenant (16 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── PRÉSENTATION DÉTAILLÉE DES 6 MOTIFS DE NOËL ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Détail des Projections</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              6 motifs de fête captivants inclus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Chaque disque projette des illustrations nettes et lumineuses pour varier les ambiances chaque soir de décembre.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MOTIFS_LIST.map((motif, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 flex items-start gap-3">
                <span className="text-2xl shrink-0">{motif.icon}</span>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{motif.name}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{motif.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BÉNÉFICES COMPARATIFS : DÉCOS ORDINAIRES VS ISIVENTE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Fini le casse-tête des guirlandes emmêlées</h3>
            <p className="text-xs sm:text-sm text-slate-500">Pourquoi cette lampe projecteur remplace avantageusement les décorations traditionnelles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Guirlandes classiques */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Guirlandes & ampoules ordinaires</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Fils électriques interminables qui s&apos;emmêlent et prennent des heures à installer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Consomment des piles à répétition qui se déchargent au bout de quelques jours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Éclairage statique limité à un seul coin de la pièce.</span>
                </li>
              </ul>
            </div>

            {/* Projecteur Isivente */}
            <div className="bg-red-50/40 rounded-2xl p-4 border border-red-200/80 space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>Lampe Projecteur Féerique Isivente</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✓</span>
                  <span><strong>Projection panoramique</strong> : illumine tout le plafond et les murs d&apos;un seul geste.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✓</span>
                  <span><strong>Alimentation USB universelle</strong> : se branche sur powerbank, TV, chargeur. Zéro pile.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✓</span>
                  <span><strong>Ultra nomade & sécurisé</strong> : LED froide sans risque de brûlure pour les enfants.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── SECTION INFOGRAPHIE & GUIDE VISUEL ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Fiche Complète & Caractéristiques</span>
            <h3 className="font-bold text-slate-900 text-base sm:text-xl">
              Une petite lampe, une grande ambiance
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Idéal pour la chambre d&apos;enfant, le salon, le réveillon ou même en voyage.
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/projecteur-noel/caracteristiques-usb.jpg"
              alt="Caractéristiques lampe projecteur de Noël USB"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 576px"
            />
          </div>
        </section>

        {/* ── BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-red-950/15">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Fêtes Isivente
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Projecteur de Noël USB Féerique
            </h4>
            <p className="text-red-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">16 900 FCFA</strong> au lieu de <span className="line-through opacity-75">28 000 FCFA</span>.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-red-700 font-bold text-sm rounded-xl hover:bg-red-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Commander maintenant (16 900 F)
          </button>
        </div>

        {/* ── SECTION AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-slate-800 font-bold text-sm ml-1.5">4.9/5</span>
              <span className="text-slate-500 text-xs">(Avis clients certifiés au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clients</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-semibold border border-red-100">
                      {rev.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rev.name}</span>
                  <span className="text-slate-400">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Questions Fréquentes</h3>
            <p className="text-xs text-slate-500">Tout ce que vous devez savoir avant de commander</p>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="py-3">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-red-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-red-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-2.5 pr-6 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FOOTER OFFICIEL ISIVENTE ── */}
        <footer className="text-center text-xs text-slate-400 space-y-2 pt-6 border-t border-slate-200">
          <p>© {new Date().getFullYear()} ISIVENTE Bénin - Tous droits réservés.</p>
          <p className="text-[11px]">Boutique officielle de distribution en ligne. Service client disponible 7j/7.</p>
        </footer>

      </main>

      {/* ── BARRE MOBILE STICKY CTA (PILIER 1 & 2) ── */}
      <StickyMobileCtaBar
        price={16900}
        targetSectionId="commander"
        accentColor="#dc2626"
        buttonText="Commander (16 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander la Lampe Projecteur de Noël Féerique USB à 16 900 FCFA."
      />

    </div>
  );
}
