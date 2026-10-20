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
  Lock, 
  Fingerprint, 
  Droplets, 
  Briefcase, 
  PackageCheck,
  Gift,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Compass
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Trousse de Voyage Cuir Luxe avec Verrouillage Biométrique",
    subtitle: "Cuir déperlant haute densité, serrure à empreinte digitale, compartiments organisés et poignée de voyage",
    price: 24900,
    originalPrice: 39000,
    savings: 14100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/trousse-biometrique/trousse-hero-protection.jpg",
    alt: "Trousse en cuir luxe avec capteur d'empreinte digitale",
    title: "Vos essentiels, bien protégés",
    caption: "L'essentiel à portée de main avec fermeture sécurisée par empreinte digitale",
  },
  {
    src: "/images/trousse-biometrique/trousse-avant-apres-organisation.jpg",
    alt: "Avant Après organisation trousse de toilette",
    title: "Tout chercher dans son sac ? Plus maintenant.",
    caption: "Adieu le désordre : vos flacons, soins et accessoires parfaitement rangés",
  },
  {
    src: "/images/trousse-biometrique/trousse-details-qualite.jpg",
    alt: "Détails qualité finition cuir et serrure",
    title: "Le détail qui fait la différence",
    caption: "Cuir étanche résistant à l'eau, cadenas biométrique et poignée renforcée",
  },
  {
    src: "/images/trousse-biometrique/trousse-compartiments-voyage.jpg",
    alt: "Compartiments intelligents pour le voyage",
    title: "Tout bien organisé en déplacement",
    caption: "Passeport, montre, parfums et soins toujours accessibles sans fouiller",
  },
  {
    src: "/images/trousse-biometrique/trousse-idee-cadeau.jpg",
    alt: "Idée cadeau élégante et utile",
    title: "Une belle idée cadeau",
    caption: "Pratique, élégant et utile au quotidien pour homme et femme",
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
    name: "Marc-Aurèle K.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Finition remarquable et capteur d'empreinte instantané",
    comment: "Je voyage souvent entre Cotonou et Lomé. Le cuir a un toucher très qualitatif et la serrure à empreinte se déverrouille en une fraction de seconde. Fini le stress de laisser des objets de valeur ou des soins dans la chambre d'hôtel.",
    verified: true,
  },
  {
    name: "Dr. Boris A.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Très élégant et fini le fouillis dans ma valise",
    comment: "Avant j'utilisais une pochette en tissu où tout se mélangeait. Là chaque flacon a sa place, c'est imperméable donc même mouillé sur le lavabo de la douche aucun risque pour l'intérieur. Vraiment un produit 5 étoiles.",
    verified: true,
  },
  {
    name: "Sandrine T.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Offert à mon mari pour son anniversaire, il a adoré !",
    comment: "Le packaging et la couleur cognac sont sublimes. La fonction empreinte digitale fait tout son effet. Livraison rapide en 24h et paiement à la livraison très rassurant.",
    verified: true,
  },
  {
    name: "Patrick D.",
    location: "Parakou",
    rating: 5,
    date: "Achat vérifié",
    title: "Rapport qualité/prix imbattable à 24 900 F",
    comment: "Honnêtement la qualité du cuir et la robustesse des fermetures éclair dépassent mes attentes. La batterie de la serrure tient très bien. Je recommande sans hésiter !",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Comment fonctionne la serrure à empreinte digitale ?",
    a: "La serrure intègre un capteur biométrique ultra-rapide qui reconnaît votre empreinte en moins de 0,5 seconde. La programmation de votre première empreinte se fait en quelques secondes sans aucune application requise. Seules les personnes enregistrées peuvent ouvrir la fermeture éclair."
  },
  {
    q: "Comment se recharge la serrure biométrique et quelle est son autonomie ?",
    a: "Elle se recharge facilement via un câble USB standard fourni. Une charge complète assure plusieurs mois d'utilisation quotidienne continue."
  },
  {
    q: "La trousse est-elle étanche face aux éclaboussures d'eau ?",
    a: "Oui, elle est conçue dans un cuir texturé haut de gamme avec traitement hydrophobe déperlant. Les gouttes d'eau glissent sur la surface sans pénétrer, protégeant vos affaires même lorsqu'elle est posée près d'un lavabo ou sous la douche."
  },
  {
    q: "Quelles affaires peut-on y ranger facilement ?",
    a: "La trousse offre un compartiment central généreux et des séparateurs intérieurs : parfums, brosse à dents, soins du visage, rasoir, câbles de téléphone, montre de valeur ou passeport de voyage."
  },
  {
    q: "Comment se passent la livraison et le paiement au Bénin ?",
    a: "La livraison se fait en 24h chrono à Cotonou, Calavi et partout au Bénin. Vous payez en espèces (24 900 FCFA) uniquement après avoir reçu et inspecté votre colis en mains propres avec le livreur."
  }
];

export default function TrousseBiometriqueLanding({ slug = "trousse-biometrique" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
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

  // Auto-défilement fluide du carrousel d'images (Pilier 3)
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

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
        product_slug: "trousse-biometrique",
        product_title: "Trousse Cuir Biométrique avec Empreinte Digitale",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Trousse Cuir Biométrique Empreinte Digitale",
      content_ids: ["trousse-biometrique", "trousse-cuir"],
      value: 24900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Trousse Cuir Biométrique",
      content_ids: ["trousse-biometrique"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    trackInitiateCheckout({
      content_name: "Trousse Cuir Biométrique",
      content_ids: ["trousse-biometrique"],
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
        product_title: "Trousse de Voyage Cuir Luxe avec Verrouillage Biométrique",
        product_slug: "trousse-biometrique",
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

      markLeadConverted(customerPhone.trim(), "trousse-biometrique");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Trousse Cuir Biométrique",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/trousse-biometrique/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Fingerprint className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(180,83,9,0.4)] transition-all duration-100 cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-amber-100 text-[11px]">(24 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Élégance & Sécurité Biométrique</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Vos essentiels, <span className="text-amber-700">parfaitement organisés</span> et <span className="text-slate-900">protégés.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Cuir de luxe imperméable et cadenas intelligent à reconnaissance d'empreinte digitale. Fini le désordre et les regards indiscrets en voyage.
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AUTO-DÉFILANT (PILIER 3) ── */}
        <div 
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="max-w-[500px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4 space-y-3"
        >
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-inner flex items-center justify-center">
            <img 
              src={CAROUSEL_IMAGES[activeImgIndex]?.src} 
              alt={CAROUSEL_IMAGES[activeImgIndex]?.alt}
              loading="eager"
              decoding="async"
              className="w-full h-full object-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.01]"
            />
            
            {/* Badge Indicateur d'image */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-md z-10">
              {activeImgIndex + 1} / {CAROUSEL_IMAGES.length}
            </div>

            {/* Pastille Prix Officiel */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                24 900 FCFA
              </span>
            </div>

            {/* Boutons Précédent / Suivant */}
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

            {/* Légende en bas */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 via-slate-900/50 to-transparent p-3 sm:p-4 text-white text-xs sm:text-sm font-medium z-10 text-center">
              <p className="line-clamp-1">{CAROUSEL_IMAGES[activeImgIndex]?.caption}</p>
            </div>
          </div>

          {/* Miniatures cliquables */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImgIndex === idx 
                    ? "border-amber-600 ring-2 ring-amber-600/20 scale-102" 
                    : "border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                <img 
                  src={img.src} 
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 24 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Échange immédiat en cas d'anomalie</p>
            </div>
          </div>
        </div>

        {/* ── 7. PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug="trousse-biometrique"
            productTitle="Trousse de Voyage Cuir Luxe avec Verrouillage Biométrique"
            productImage="/images/trousse-biometrique/trousse-hero-protection.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Trousse Biométrique - ${b.name}`,
                content_ids: ["trousse-biometrique", b.id || "solo"],
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
            isSubmitting={isSubmitting}
            accentColor="#b45309"
            onSubmit={handleOrderSubmit}
          />
        </div>

        {/* ── 8. GRILLE DES BÉNÉFICES / FONCTIONS MAJEURES ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pourquoi cette trousse surpasse tous les sacs classiques
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              L'alliance d'une maroquinerie haut de gamme et d'une technologie biométrique pensée pour votre tranquillité.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Fingerprint className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Capteur d'Empreinte Ultra-Rapide</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Déverrouillage instantané en 0,5 seconde. Vous seul(e) pouvez accéder à vos affaires personnelles, montres, bijoux ou documents sans clé ni code encombrant.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Droplets className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cuir Imperméable & Déperlant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Finition cuir grainé haute densité imperméabilisé. L'eau glisse sur la surface pour protéger vos crèmes, cosmétiques et flacons des éclaboussures de la salle de bain.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Compartiments Multiples Intelligents</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fini de tout mélanger : des séparateurs pensés pour vos flacons, brosses, rasoir, parfum, passeport et câbles. Tout reste ordonné et immédiatement visible.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Briefcase className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Format Compact avec Poignée Renforcée</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Poignée latérale ergonomique et solide pour une prise en main aisée. Se glisse facilement dans un sac à dos, une valise cabine ou un tiroir de bureau.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. MISE EN AVANT DÉTAILS QUALITÉ & INFOGRAPHIE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Conception Haute Précision
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Le détail qui fait toute la différence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Chaque centimètre a été étudié pour allier raffinement esthétique et sécurité absolue lors de vos déplacements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square flex items-center justify-center">
              <img 
                src="/images/trousse-biometrique/trousse-details-qualite.jpg" 
                alt="Zoom sur les détails du cuir et de la serrure"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 font-bold text-xs">
                  01
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Texture Cuir Protectrice Déperlante</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Le revêtement grainé repousse l'eau et les liquides. Un coup de chiffon sec suffit pour la rendre impeccable.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 font-bold text-xs">
                  02
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Cadenas Biométrique Intégré sur Curseur</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Bloque les tirettes de fermeture éclair ensemble. Personne ne peut ouvrir votre trousse à votre insu.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 font-bold text-xs">
                  03
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Poignée Latérale Renforcée</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Large et doublée pour un transport confortable au poignet ou pour l'accrocher dans la salle de bain.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-700 text-white font-semibold text-xs shadow-md hover:bg-amber-800 transition-all cursor-pointer"
                >
                  <span>Commander maintenant (24 900 F)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Trousse ordinaire vs Trousse Cuir Biométrique
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Découvrez la différence immédiate au quotidien.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3.5 sm:p-4">Caractéristique</th>
                  <th className="p-3.5 sm:p-4 text-slate-400">Pochette ordinaire</th>
                  <th className="p-3.5 sm:p-4 bg-amber-50/60 text-amber-800 font-extrabold">Isivente Biométrique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-slate-900">Sécurité des affaires</td>
                  <td className="p-3.5 sm:p-4 text-rose-500 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Zéro protection</span>
                  </td>
                  <td className="p-3.5 sm:p-4 bg-amber-50/30 text-emerald-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Empreinte digitale 0,5s</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-slate-900">Résistance aux liquides</td>
                  <td className="p-3.5 sm:p-4 text-rose-500 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Tissu absorbe l'eau</span>
                  </td>
                  <td className="p-3.5 sm:p-4 bg-amber-50/30 text-emerald-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cuir 100% déperlant</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-slate-900">Organisation intérieure</td>
                  <td className="p-3.5 sm:p-4 text-rose-500 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Fourre-tout en vrac</span>
                  </td>
                  <td className="p-3.5 sm:p-4 bg-amber-50/30 text-emerald-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Compartiments dédiés</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-semibold text-slate-900">Durabilité & Finition</td>
                  <td className="p-3.5 sm:p-4 text-rose-500 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Coutures fragiles</span>
                  </td>
                  <td className="p-3.5 sm:p-4 bg-amber-50/30 text-emerald-700 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cuir grainé & zip métal</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11. SECTION IDÉE CADEAU DE LUXE ── */}
        <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl border border-amber-200/80 p-5 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-amber-100/80 border border-amber-300/60 text-amber-900 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                <Gift className="w-3.5 h-3.5 text-amber-700" />
                <span>Une attention prestigieuse</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Une merveilleuse idée cadeau pour marquer les esprits
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Offrez un présent raffiné, moderne et véritablement utile au quotidien. Idéal pour un anniversaire, les fêtes ou féliciter un proche pour ses voyages et projets professionnels.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>Commander le coffret (24 900 F)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-amber-200/60 shadow-md">
              <img 
                src="/images/trousse-biometrique/trousse-idee-cadeau.jpg" 
                alt="Présentation coffret cadeau de la trousse biométrique"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-md">
          <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offre de lancement Bénin</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Offrez-vous le luxe de la tranquillité et du style
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
            Seulement <span className="font-bold text-white">24 900 FCFA</span> au lieu de <span className="line-through text-slate-400">39 000 FCFA</span>. Stock limité pour cette collection spéciale.
          </p>
          <div>
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <span>Commander maintenant — 24 900 FCFA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 13. AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Noté 4.9/5 par nos clients au Bénin
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Retours authentiques de clients livrés à Cotonou, Calavi, Porto-Novo et Parakou.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {rev.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    « {rev.title} »
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800">{rev.name}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="text-center space-y-1 pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Questions Fréquentes
            </h2>
            <p className="text-xs text-slate-500">
              Tout ce que vous devez savoir avant de commander.
            </p>
          </div>

          <div className="space-y-2 divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-amber-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180 text-amber-700" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="pb-3 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── 15. FOOTER OFFICIEL ── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-800 tracking-tight">ISIVENTE BÉNIN — Boutique Officielle</p>
        <p>Service client WhatsApp disponible 7j/7 pour le suivi de vos colis et assistance.</p>
        <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} Isivente. Tous droits réservés.</p>
      </footer>

      {/* ── 16. BARRE MOBILE STICKY CTA ── */}
      <StickyMobileCtaBar 
        price={24900}
        targetSectionId="commander"
        accentColor="#b45309"
        buttonText="Commander (24 900 F)"
      />

    </div>
  );
}
