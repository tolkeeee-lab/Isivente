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
  Box, 
  Heart, 
  Zap, 
  Gift, 
  ArrowRight,
  Brain,
  Layers,
  Smile,
  Eye,
  Check
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
    name: "CubiCraft™ - Coffret Blocs Magnétiques de Construction",
    subtitle: "Coffret officiel complet avec blocs magnétiques texturés, guide de modèles et garantie Isivente",
    price: 16900,
    originalPrice: 28000,
    savings: 11100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/pixelblocks/stimule-esprit.jpg", 
    alt: "CubiCraft - Une activité qui stimule l'esprit, la concentration et la logique",
    caption: "Développement de la concentration, de la logique spatiale et de la créativité"
  },
  { 
    src: "/images/pixelblocks/coffret-cadeau.jpg", 
    alt: "Coffret Cadeau Officiel CubiCraft Building Blocks",
    caption: "Le cadeau parfait pour toutes les occasions : anniversaire, fêtes, rentrée scolaire"
  },
  { 
    src: "/images/pixelblocks/imaginer-demain.jpg", 
    alt: "CubiCraft - Construire aujourd'hui, imaginer demain",
    caption: "Des blocs réalistes et magnétiques pour créer, inventer et s'amuser sans limites"
  },
  { 
    src: "/images/pixelblocks/creer-univers.jpg", 
    alt: "CubiCraft - Créez votre propre univers en 3D",
    caption: "Maisons, paysages, forteresses, cascades... tout devient possible entre leurs mains"
  },
  { 
    src: "/images/pixelblocks/bloc-main-zoom.jpg", 
    alt: "CubiCraft - Des blocs qui prennent vie entre vos mains",
    caption: "Design pixelisé authentique, finitions soignées, matériaux résistants et sans danger"
  },
  { 
    src: "/images/pixelblocks/contenu-blocs.jpg", 
    alt: "CubiCraft - Des blocs réalistes, solides et colorés",
    caption: "Pièces faciles à assembler, couleurs durables et taille ergonomique adaptée aux enfants"
  },
  { 
    src: "/images/pixelblocks/mondes-possibles.jpg", 
    alt: "CubiCraft - Un monde infini à construire",
    caption: "Maisons, paysages, villages entiers et décors personnalisés"
  },
  { 
    src: "/images/pixelblocks/format-dimensions.jpg", 
    alt: "CubiCraft - Le format parfait pour jouer partout",
    caption: "Format compact (~8 x 12 cm) facile à ranger, à transporter partout et à offrir"
  },
  { 
    src: "/images/pixelblocks/famille-partage.jpg", 
    alt: "CubiCraft - Des moments de complicité et de partage inoubliables en famille",
    caption: "Des heures de jeu passionnantes 100% sans écran pour renforcer les liens familiaux"
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
    name: "Marcelle T.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mon fils de 6 ans a enfin lâché le téléphone !",
    comment: "C'est impressionnant comme il est concentré depuis qu'il a reçu le coffret. Il adore l'univers Minecraft et le fait de pouvoir fabriquer ses propres châteaux et maisons en vrai avec les aimants le captive pendant des heures. Zéro écran pendant tout le week-end !",
    verified: true,
  },
  {
    name: "Dr. Boris A.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Qualité exceptionnelle et aimants très sécurisés",
    comment: "J'avais peur que les aimants se détachent ou soient trop faibles. Au final, les blocs sont très solides, les aimants sont moulés à l'intérieur et la force magnétique tient parfaitement les constructions debout. Emballage impeccable.",
    verified: true,
  },
  {
    name: "Christelle H.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Super cadeau d'anniversaire, livré en 24h",
    comment: "Commandé vendredi matin et reçu le lendemain midi. Le livreur m'a permis d'ouvrir la boîte et de vérifier avant d'encaisser les 16 900 F. Ma fille de 8 ans et son petit frère y jouent ensemble sans se disputer.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "À partir de quel âge CubiCraft™ est-il recommandé ?",
    a: "CubiCraft™ est idéal pour les enfants à partir de 4 ans jusqu'à 14 ans (et même les adultes passionnés de design et d'univers pixelisés !). La taille des cubes est spécialement calibrée pour une prise en main facile et agréable sans risque d'ingestion."
  },
  {
    q: "Les aimants sont-ils dangereux ou peuvent-ils se détacher ?",
    a: "Non, absolument pas. Les aimants néodyme sont scellés et soudés hermétiquement à l'intérieur de chaque cube en ABS renforcé de haute qualité alimentaire. Les enfants ne peuvent en aucun cas y accéder directement."
  },
  {
    q: "Comment fonctionne la force magnétique ?",
    a: "Chaque face du cube intègre des micro-aimants orientés intelligemment, ce qui permet aux blocs de s'accrocher et de s'aligner naturellement sans avoir besoin d'emboîter de force comme des briques classiques. Même un enfant de 4 ans peut ériger des structures stables en quelques secondes."
  },
  {
    q: "Que contient exactement le coffret ?",
    a: "Le coffret CubiCraft™ officiel comprend les blocs magnétiques texturés aux motifs variés (terre, briques rouges, roche volcanique, feuillages verts, minerais d'or, eau cristalline), ainsi que des exemples de bâtisses pour inspirer immédiatement vos enfants."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée sous 24h à Cotonou, Calavi et partout au Bénin. Vous payez en espèces (16 900 FCFA) uniquement après avoir reçu et inspecté votre colis auprès du livreur."
  }
];

export default function CubiCraftLanding({ slug = "cubicraft" }: { slug?: string }) {
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

  // Auto-défilement du carrousel d'images (Pilier 3)
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
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
        product_slug: "cubicraft",
        product_title: "CubiCraft - Blocs Magnétiques de Construction",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "CubiCraft Blocs Magnétiques",
      content_ids: ["cubicraft", "pixelcraft", "mineblocks"],
      value: 16900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "CubiCraft Blocs Magnétiques",
      content_ids: ["cubicraft"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    trackInitiateCheckout({
      content_name: "CubiCraft Blocs Magnétiques",
      content_ids: ["cubicraft"],
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
        product_title: "CubiCraft™ - Coffret Blocs Magnétiques de Construction",
        product_slug: "cubicraft",
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

      markLeadConverted(customerPhone.trim(), "cubicraft");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "CubiCraft Blocs Magnétiques",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/cubicraft/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Box className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(5,150,105,0.4)] transition-all duration-100 cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-emerald-100 text-[11px]">(16 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Jeu Éducatif & Créatif Sans Écran</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Construire aujourd’hui, <span className="text-emerald-600">imaginer demain.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Des cubes magnétiques réalistes pour créer, inventer et s'amuser sans limites. Éveille la concentration et éloigne les enfants des écrans.
          </p>
        </div>

        {/* ── CARROUSEL HERO AUTO-DÉFILANT (PILIER 3) ── */}
        <div 
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="max-w-[480px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4 space-y-3"
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

            {/* Boutons précédents / suivants */}
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

            {/* Légende discrète */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-3 text-white text-xs font-medium z-10 text-center">
              <p className="line-clamp-1">{CAROUSEL_IMAGES[activeImgIndex]?.caption}</p>
            </div>
          </div>

          {/* Miniatures interactives synchronisées (9 photos) */}
          <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] cursor-pointer ${
                  activeImgIndex === idx 
                    ? "border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs" 
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
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE CÔTE À CÔTE (PILIER 2) ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison Express 24h</div>
            <div className="text-[10px] text-slate-500 hidden sm:block">À Cotonou, Calavi & partout au Bénin</div>
          </div>
          
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Paiement Réception</div>
            <div className="text-[10px] text-slate-500 hidden sm:block">Inspectez votre colis avant de payer</div>
          </div>
          
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Garantie & Test 100%</div>
            <div className="text-[10px] text-slate-500 hidden sm:block">Aimants sécurisés & haute résistance</div>
          </div>
        </div>

        {/* ── FORMULAIRE DE COMMANDE (COD) - IMMÉDIATEMENT APRÈS (PILIER 2) ── */}
        <div id="commander" ref={orderSectionRef} className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
              {orderError}
            </div>
          )}
          <UmeiStyleOrderSection
            productSlug="cubicraft"
            productTitle="CubiCraft™ - Coffret Blocs Magnétiques de Construction"
            productImage="/images/pixelblocks/coffret-cadeau.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `CubiCraft - ${b.name}`,
                content_ids: ["cubicraft", b.id || "solo"],
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
            onSubmit={handleOrderSubmit}
            accentColor="#059669"
          />
        </div>

        {/* ── 4 GRANDS BÉNÉFICES CLÉS ── */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bien plus qu'un jouet : une activité qui stimule l'esprit
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Conçu pour canaliser l'énergie créative des enfants et stimuler leur intelligence spatiale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Brain className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Concentration & Résolution de Problèmes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  L'assemblage en 3D demande de la réflexion et de la patience. Les enfants développent leur logique et apprennent à concrétiser leurs idées.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Eye className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">100% Sans Écran</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Offrez une pause saine loin des téléphones, tablettes et jeux vidéo. Une expérience tactile et sensorielle passionnante.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Layers className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Aimants Puissants & Sécurisés</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Les cubes s'attirent naturellement sur chaque face pour construire des forteresses et des paysages solides sans s'effondrer.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Smile className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Moments de Partage en Famille</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Construire ensemble avec vos enfants crée des souvenirs inoubliables et renforce la complicité parents-enfants.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── DÉMONSTRATION VIDÉO AUTOPLAY (PILIER 4) ── */}
        <div className="space-y-4 pt-4">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Démonstration en Direct</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Regardez la magie de CubiCraft™ en action
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Découvrez la facilité d'assemblage et la fluidité des constructions magnétiques :
            </p>
          </div>

          <div className="max-w-[420px] mx-auto rounded-3xl overflow-hidden bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/80 aspect-[9/16] relative">
            <video
              src="/videos/pixelblocks-clean.mp4"
              poster="/images/pixelblocks-video-poster.jpg"
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-2xl shadow-md transition-all cursor-pointer"
            >
              <span>Je commande mon coffret (16 900 F)</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* ── BÉNÉFICES COMPARATIFS : CLASSIQUE VS CUBICRAFT ── */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pourquoi choisir CubiCraft™ ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              La différence entre un simple jouet passif et un jeu d'éveil actif.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="grid grid-cols-2 text-xs sm:text-sm font-bold border-b border-slate-200">
              <div className="p-3 sm:p-4 bg-slate-50 text-slate-500 text-center">Jouets Ordinaires & Écrans</div>
              <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-800 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>CubiCraft™ Officiel</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="grid grid-cols-2 p-3 sm:p-4 items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Enfants passifs devant les vidéos TikTok/jeux</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold bg-emerald-50/40 p-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Activité manuelle active et stimulante</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 sm:p-4 items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Briques dures qui font mal aux doigts</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold bg-emerald-50/40 p-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Aimants fluides, assemblage doux et immédiat</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 sm:p-4 items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Constructions fragiles qui s'écroulent</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold bg-emerald-50/40 p-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Stabilité magnétique multidirectionnelle</span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-3 sm:p-4 items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Plastique fragile et bords coupants</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold bg-emerald-50/40 p-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Matériau ABS robuste, angles adoucis et sûrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-100">
            <Gift className="w-3.5 h-3.5" />
            <span>Offre Spéciale Découverte</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Offrez-leur le cadeau qui fait briller leurs yeux
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Profitez de la promotion de lancement à 16 900 FCFA avec livraison express sous 24h et paiement sécurisé à la réception.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-emerald-200 line-through text-sm sm:text-base font-mono">28 000 FCFA</span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">16 900 FCFA</span>
          </div>

          <div className="pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs sm:text-sm font-bold text-emerald-900 bg-white hover:bg-emerald-50 active:scale-[0.98] rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              <span>Commander Maintenant</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* ── AVIS CLIENTS VÉRIFIÉS ── */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-800 ml-1.5">4.9 / 5 (87 avis vérifiés)</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ce que disent les parents au Bénin
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((review, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      {review.date}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    "{review.title}"
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{review.name}</span>
                  <span>{review.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ INTERACTIVE ── */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Questions Fréquentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Tout ce que vous devez savoir avant de commander en toute sérénité.
            </p>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            {FAQS_DATA.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-emerald-600" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FOOTER OFFICIEL ── */}
        <footer className="pt-12 border-t border-slate-200 text-center space-y-3 text-xs text-slate-500">
          <div className="font-bold text-slate-700 tracking-tight">ISIVENTE BÉNIN</div>
          <p>© {new Date().getFullYear()} Isivente. Tous droits réservés. Service client officiel disponible 7j/7.</p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Paiement à la livraison</span>
            <span>•</span>
            <span>Garantie vérification 24h</span>
            <span>•</span>
            <span>Support WhatsApp</span>
          </div>
        </footer>

      </main>

      {/* ── BARRE MOBILE STICKY CTA (PILIER 16) ── */}
      <StickyMobileCtaBar
        price={16900}
        targetSectionId="commander"
        accentColor="#059669"
        buttonText="Commander (16 900 F)"
      />

    </div>
  );
}
