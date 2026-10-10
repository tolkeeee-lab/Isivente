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
  PackageCheck,
  Award,
  Gift,
  ArrowRight,
  Gem,
  Crown,
  Eye,
  Smile
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
    name: "Bracelet-Bague de Main Éclat Doré & Cristaux (Écrin Luxe Offert)",
    subtitle: "Coffret complet avec coussinet de présentation velours, triple chaîne dorée et bague intégrée sertie de cristaux",
    price: 12750,
    originalPrice: 22000,
    savings: 9250,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/bracelet-main/bracelet-hero.jpg",
    alt: "Bracelet-Bague Éclat Doré dans son écrin de luxe et porté sur main élégante",
    title: "Le bijou de main complet dans son coffret prestige",
  },
  {
    src: "/images/bracelet-main/bracelet-avant-apres.jpg",
    alt: "Avant / Après : Une tenue simple... et tout change !",
    title: "Transformation instantanée de votre tenue",
  },
  {
    src: "/images/bracelet-main/bracelet-regards.jpg",
    alt: "Quand le détail attire tous les regards",
    title: "Cristaux haute réfraction et triple chaîne dorée",
  },
  {
    src: "/images/bracelet-main/bracelet-cadeau-geste.jpg",
    alt: "Offrir ça à une femme, elle n'oubliera pas le geste",
    title: "Le geste marquant et inoubliable",
  },
  {
    src: "/images/bracelet-main/bracelet-cadeau-surprise.jpg",
    alt: "Le cadeau qu'elle ne te demandera jamais mais qu'elle adorera",
    title: "L'effet surprise et le coup de cœur immédiat",
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
    name: "Grâce K.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Encore plus beau en vrai que sur les photos !",
    comment: "Je l'ai porté à une cérémonie le week-end dernier avec une robe très sobre. Tout le monde me demandait où j'avais acheté ce bijou ! La chaîne est fine, agréable sur la peau et les cristaux brillent dès qu'il y a de la lumière. Très contente de mon achat.",
    verified: true,
  },
  {
    name: "Armel D.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Offert à ma femme pour son anniversaire : carton plein !",
    comment: "C'est exactement ce qui est dit : un cadeau inattendu qui fait un effet bœuf ! Elle était émue en ouvrant la boîte noire. La bague s'ajuste bien à sa main et elle ne le quitte plus pour sortir. Livré en 24h à mon bureau.",
    verified: true,
  },
  {
    name: "Syntiche B.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Finition raffinée et chaîne confortable",
    comment: "J'avais peur que la chaîne tire sur le doigt quand on bouge la main, mais pas du tout ! La longueur dorsale est très bien calibrée et la chaînette de réglage permet de l'ajuster au millimètre. Et le paiement à la livraison rassure énormément.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "La taille s'adapte-t-elle à toutes les mains ?",
    a: "Oui, parfaitement ! Le bracelet dispose d'une chaînette de rallonge réglable au poignet et d'un anneau de bague souple qui s'adapte confortablement à toutes les morphologies de main féminine (fine à moyenne/forte), sans serrer ni entraver les mouvements des doigts.",
  },
  {
    q: "Le bijou noircit-il ou perd-il son éclat ?",
    a: "Non. Le bracelet est réalisé avec un alliage résistant traité par plaquage doré brillant multicouche anti-oxydation. Pour conserver son éclat comme au premier jour, évitez simplement de vaporiser du parfum directement dessus ou de vous doucher avec.",
  },
  {
    q: "L'écrin de luxe noir est-il inclus dans la commande ?",
    a: "Oui, absolument ! Chaque bijou est soigneusement présenté et expédié dans son écrin rigide noir avec coussinet de présentation velours beige. Il est prêt à être offert directement ou à servir de boîte de rangement protectrice.",
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue sous 24h à Cotonou, Calavi et partout au Bénin. Vous ne payez absolument rien à l'avance : vous réglez les 12 750 FCFA en espèces au livreur uniquement après avoir reçu et inspecté votre colis en main propre.",
  },
  {
    q: "Puis-je commander par téléphone ou WhatsApp ?",
    a: "Oui ! Vous pouvez renseigner le formulaire ci-dessus en quelques secondes ou cliquer directement sur le bouton WhatsApp en bas à droite pour commander avec l'un de nos conseillers Isivente.",
  },
];

export default function BraceletMainLanding({ slug = "bracelet-main" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const utm = useUTM();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Auto-défilement automatique du carrousel Hero (3.8s) avec arrêt au survol
  useEffect(() => {
    if (isHeroHovered || CAROUSEL_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
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
        product_slug: "bracelet-main",
        product_title: "Bracelet-Bague de Main Éclat Doré & Cristaux",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  // Pixel Meta : ViewContent officiel
  useEffect(() => {
    trackViewContent({
      content_name: "Bracelet-Bague de Main Éclat Doré & Cristaux Scintillants",
      content_ids: ["bracelet-main", "bracelet-bague", "bracelet-eclat"],
      value: 12750,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Bracelet-Bague de Main Éclat Doré & Cristaux",
      content_ids: ["bracelet-main"],
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
        product_title: "Bracelet-Bague de Main Éclat Doré & Cristaux Scintillants",
        product_slug: "bracelet-main",
        customer_name: customerName.trim() || "Cliente Isivente",
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

      markLeadConverted(customerPhone.trim(), "bracelet-main");

      // Stocker les métadonnées pour la page success (qui déclenche l'événement dédupliqué)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Bracelet-Bague de Main Éclat Doré & Cristaux",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/bracelet-main/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-950">
      
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
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(180,83,9,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-amber-100 text-[11px]">(12 750 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold uppercase tracking-[0.06em] px-3.5 py-1 rounded-full shadow-2xs">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Élégance & Joaillerie • Collection Féminine</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Une tenue simple... <br className="hidden sm:inline" />
            <span className="text-amber-700">et tout change !</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Le bracelet-bague doré aux cristaux scintillants qui habille la main avec distinction. Le détail raffiné qui attire tous les regards.
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AUTO-DÉFILANT (SANS AUCUN STICKER SUR LES IMAGES) ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5 space-y-3"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          {/* Cadre de l'image principale pure (aucun sticker superposé) */}
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-amber-50/30 border border-slate-100 flex items-center justify-center overflow-hidden">
            
            <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
              <Image
                src={CAROUSEL_IMAGES[activeImgIndex].src}
                alt={CAROUSEL_IMAGES[activeImgIndex].alt}
                fill
                className="object-contain p-1 sm:p-2 transition-all duration-300"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>

            {/* Flèches de navigation légères et fluides */}
            {CAROUSEL_IMAGES.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-20"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-20"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </>
            )}
          </div>

          {/* Miniatures interactives synchronisées (5 visuels officiels) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] cursor-pointer ${
                  activeImgIndex === idx 
                    ? "border-amber-600 ring-2 ring-amber-600/20 shadow-xs" 
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

        {/* ── 6. 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Inspectez avant de régler en espèces</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Écrin Cadeau Offert</p>
              <p className="text-[11px] text-slate-500">Boîte de luxe prête à offrir incluse</p>
            </div>
          </div>
        </div>

        {/* ── 7. FORMULAIRE DE COMMANDE (COD) IMMÉDIATEMENT APRÈS (PILIER 2) ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="bracelet-main"
            productTitle="Bracelet-Bague de Main Éclat Doré & Cristaux Scintillants"
            productImage="/images/bracelet-main/bracelet-hero.jpg"
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
            accentColor="#B45309"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. 4 ATOUTS MAJEURS DU BRACELET-BAGUE ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Haute Finition & Design</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 raisons pour lesquelles ce bijou fait l'unanimité</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              L'alliance parfaite entre le charme oriental du baciamano et l'élégance moderne épurée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Atout 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Transformation instantanée</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Une robe simple, un ensemble classique ou un jean t-shirt ? Ce bijou habille immédiatement toute la main avec une allure chic et travaillée.
              </p>
            </div>

            {/* Atout 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Gem className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Cristaux scintillants</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sertis délicatement sur le poignet et la bague, les cristaux captent chaque reflet lumineux pour un éclat précieux et naturel sous le soleil ou les projecteurs.
              </p>
            </div>

            {/* Atout 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Award className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Confort & Fluidité</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                La chaîne dorsale est souple et légère. Vous pouvez bouger les doigts, taper sur votre clavier, conduire et saluer sans aucune gêne ni tiraillement.
              </p>
            </div>

            {/* Atout 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Gift className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Écrin Noir Prestige</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fourni dans son coffret bijouterie rigide avec son coussinet de présentation. L'effet de surprise à l'ouverture est garanti à 100%.
              </p>
            </div>

          </div>
        </section>

        {/* ── 9. SECTION EMOTION & IMPACT CADEAU ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-2xs space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Le Cadeau Idéal</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              « Offrir ça à une femme, c'est comme offrir une montre à un homme »
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Elle n'oubliera jamais le geste. C'est le présent subtil, élégant et inattendu qu'elle ne te demandera jamais... mais qu'elle adorera porter à chaque occasion spéciale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-amber-50/20 shadow-xs">
              <Image
                src="/images/bracelet-main/bracelet-cadeau-geste.jpg"
                alt="Offrir le bracelet bague de main à une femme"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✨
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Un bijou rare qui se démarque</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Loin des simples gourmettes ou bagues banales, le bracelet-bague apporte une touche féerique et sensuelle qui met en valeur la gestuelle et les ongles soignés.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    🎁
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Prêt à offrir dans son écrin</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Aucun emballage cadeau supplémentaire à chercher. Le bijou repose élégamment sur son coussin de velours dans une boîte noire aimantée de qualité joaillerie.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    💫
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Ajustement universel sans risque de mauvaise taille</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Grâce à sa chaînette d'extension de 5 cm et son anneau flexible, impossible de vous tromper sur la taille si vous l'offrez en cadeau.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={scrollToOrder}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Commander mon coffret (12 750 FCFA)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi ce bijou de main fait toute la différence</h3>
            <p className="text-xs sm:text-sm text-slate-500">Ce qui distingue le bracelet-bague Isivente des accessoires de fantaisie ordinaires</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bijou ordinaire */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Bijoux de fantaisie ordinaires</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Chaînes rigides qui tirent désagréablement sur le doigt à chaque mouvement.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Plaquage fragile qui verdit ou ternit dès le premier contact avec la peau.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Livré dans un simple sachet en plastique sans aucun écrin ni protection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Taille fixe qui ne convient pas à tous les poignets.</span>
                </li>
              </ul>
            </div>

            {/* Bracelet Bague Isivente */}
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Bracelet-Bague Éclat Doré Isivente</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>Chaîne fluide et ergonomique étudiée pour une totale liberté de mouvement.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>Finition dorée brillante haute tenue avec cristaux lumineux taillés avec soin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>Écrin cadeau noir rigide avec coussin velours beige offert dans chaque commande.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>Chaînette de réglage universelle pour convenir à toutes les femmes sans hésitation.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── 11. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white text-center shadow-lg space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[11px] font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Offre Spéciale Limitée</span>
          </div>

          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Sublimez votre style ou faites le plus beau des cadeaux
          </h3>

          <p className="text-xs sm:text-sm text-amber-100/90 max-w-lg mx-auto leading-relaxed">
            Profitez du tarif promo direct Isivente à <span className="font-bold text-white">12 750 FCFA</span> au lieu de 22 000 FCFA. Livraison express 24h & paiement sécurisé en espèces à la livraison.
          </p>

          <div className="pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-amber-50 active:scale-95 text-amber-900 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander maintenant (12 750 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 12. AVIS CLIENTS VÉRIFIÉS (NOTE 4.9/5) ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-slate-900 font-extrabold text-sm ml-1.5">4.9 / 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clientes au Bénin</h2>
            <p className="text-xs sm:text-sm text-slate-600">Témoignages réels de personnes ayant commandé sur Isivente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((review, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {review.date}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">« {review.title} »</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-800">{review.name}</span>
                  <span>{review.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 13. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Réponses à vos questions</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Foire Aux Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500">Tout ce que vous devez savoir avant de commander</p>
          </div>

          <div className="divide-y divide-slate-100 max-w-2xl mx-auto">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-800 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      activeFaq === idx ? "rotate-180 text-amber-700" : ""
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pr-4 animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── 14. FOOTER OFFICIEL ── */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 text-center text-xs text-slate-500 space-y-3">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-slate-900">ISIVENTE BÉNIN</span>
            <span>•</span>
            <span>Boutique en ligne officielle</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Livraison rapide partout au Bénin sous 24h. Service client disponible sur WhatsApp au +229 01 92 90 18 17.
          </p>
          <p className="text-[10px] text-slate-400">
            © {new Date().getFullYear()} Isivente. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* ── 15. BARRE MOBILE STICKY CTA (PRIX IDENTIQUE 12 750 F) ── */}
      <StickyMobileCtaBar 
        price={12750} 
        accentColor="#B45309"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Bracelet-Bague Éclat Doré à 12 750 FCFA."
      />

    </div>
  );
}
