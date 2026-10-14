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
  Droplets, 
  Layers, 
  Wrench, 
  PackageCheck,
  Award,
  ArrowRight,
  Utensils,
  Apple,
  GlassWater,
  ShieldAlert
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
    name: "Filtre à Eau Universel pour Robinet 6 Couches de Filtration",
    subtitle: "Système complet prêt à l'emploi avec cartouche multicouche active et collier de serrage papillon universel",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/filtre-eau/filtre-eau-hero.jpg",
    alt: "Filtre à eau universel robinet 6 couches - Avant et après filtration",
    caption: "Une eau visiblement plus propre, limpide et débarrassée des impuretés dès la sortie du robinet",
  },
  {
    src: "/images/filtre-eau/filtre-eau-6couches.jpg",
    alt: "Schéma des 6 couches de filtration pour une eau plus saine",
    caption: "Technologie 6 couches : charbon actif, billes minérales, résine filtrante et filtres anti-sédiments",
  },
  {
    src: "/images/filtre-eau/filtre-eau-installation.jpg",
    alt: "Installation express en quelques secondes sans aucun outil",
    caption: "Pose instantanée sans plomberie : fixez sur votre robinet et serrez le papillon à la main",
  },
  {
    src: "/images/filtre-eau/filtre-eau-cuisine-femme.jpg",
    alt: "Une eau plus propre directement sur votre robinet pour toute la famille",
    caption: "Cuisinez et hydratez votre famille en toute sérénité au quotidien",
  },
  {
    src: "/images/filtre-eau/filtre-eau-enfant-boire.jpg",
    alt: "Une eau saine et claire pour les enfants et toute la maison",
    caption: "Offrez à vos enfants une eau plus saine, sans goût de chlore ni résidus de canalisations",
  },
  {
    src: "/images/filtre-eau/filtre-eau-famille-repas.jpg",
    alt: "Lavez vos légumes et préparez vos repas avec une eau purifiée",
    caption: "Lavage parfait des crudités, cuisson des aliments et vaisselle éclatante sans dépôt de calcaire",
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
    name: "Bernadette A.",
    location: "Cotonou (Fidjrossè)",
    rating: 5,
    date: "Achat vérifié",
    title: "La différence est flagrante dans le verre !",
    comment: "À Fidjrossè, l'eau du robinet avait souvent une légère teinte jaunâtre et une odeur de chlore désagréable. Dès que j'ai fixé ce filtre, l'eau est devenue d'une clarté incroyable et sans aucune mauvaise odeur. Je lave mes légumes et prépare les bouillies de mes petits avec une totale tranquillité d'esprit.",
    verified: true,
  },
  {
    name: "Rodrigue S.",
    location: "Calavi (Zogbadjè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Installation en 10 secondes chrono, zéro fuite",
    comment: "Je ne suis pas du tout bricoleur mais le collier jaune papillon se serre à la main sans outil. Ça tient solidement sans gicler sur les côtés. C'est robuste, compact et le débit d'eau reste puissant sous forme de pluie douce.",
    verified: true,
  },
  {
    name: "Élodie G.",
    location: "Porto-Novo (Avakpa)",
    rating: 5,
    date: "Achat vérifié",
    title: "Fini la corvée des bidons d'eau lourds",
    comment: "On dépensait une fortune chaque semaine en eau en bouteille pour cuisiner. Ce filtre nous fait faire de grosses économies. Livré en 24h, testé sur mon robinet avant de payer. Super satisfaite !",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Ce filtre s'adapte-t-il à tous les robinets ?",
    a: "Oui ! Le manchon en silicone souple et son collier de serrage papillon réglable en acier inoxydable s'adaptent universellement à la très grande majorité des cols de robinets ronds standards (de 15 mm à 22 mm de diamètre), qu'ils soient de cuisine ou de salle de bain."
  },
  {
    q: "Faut-il des outils ou un plombier pour l'installer ?",
    a: "Absolument aucun outil ! Il suffit d'emboîter le filtre sur l'extrémité du robinet et de tourner la poignée papillon jaune à la main pour serrer fermement. L'installation prend moins de 30 secondes."
  },
  {
    q: "Quelles sont les impuretés éliminées par les 6 couches ?",
    a: "Le système retient les sédiments solides, le sable, la rouille détachée des canalisations, le chlore résiduel, les métaux lourds et les mauvaises odeurs grâce à l'action combinée du charbon actif haute densité, des billes minérales naturelles et de la résine filtrante."
  },
  {
    q: "Quelle est la durée de vie du filtre ?",
    a: "Selon la qualité de l'eau et votre consommation quotidienne, une cartouche filtrante conserve son efficacité optimale pendant 2 à 3 mois d'utilisation continue pour un foyer moyen. Vous visualisez l'efficacité directement à travers le corps transparent."
  },
  {
    q: "Le filtre ralentit-il le débit d'eau du robinet ?",
    a: "Non. Le design micro-perforé de la sortie inférieure transforme le jet en une pluie fine agréable et aérée qui maintient une excellente pression tout en évitant les éclaboussures d'eau autour de l'évier."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison se fait sous 24h chrono à Cotonou, Calavi et partout au Bénin. Vous payez en espèces (14 900 FCFA) uniquement après avoir reçu et vérifié votre colis entre les mains du livreur."
  }
];

export default function FiltreEauLanding({ slug = "filtre-eau" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const utm = useUTM();

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

  // Carrousel Hero Auto-défilant
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

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
        product_slug: "filtre-eau",
        product_title: "Filtre à Eau Universel pour Robinet 6 Couches",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Filtre à Eau Universel pour Robinet 6 Couches",
      content_ids: ["filtre-eau", "filtre-robinet"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Filtre à Eau Universel pour Robinet 6 Couches",
      content_ids: ["filtre-eau"],
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
        product_title: "Filtre à Eau Universel pour Robinet 6 Couches de Filtration",
        product_slug: "filtre-eau",
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

      markLeadConverted(customerPhone.trim(), "filtre-eau");

      // Stocker les métadonnées pour la page success
      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Filtre à Eau Universel pour Robinet 6 Couches",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/filtre-eau/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Droplets className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(2,132,199,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-sky-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200/80 text-sky-900 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Eau Pure & Santé Familiale au Quotidien</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Profitez d&apos;une eau plus propre et cristalline <span className="text-sky-600">directement sur votre robinet.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Système universel à 6 couches de filtration active. Élimine sédiments, chlore, rouille et mauvaises odeurs pour boire, cuisiner et laver en toute sécurité.
          </p>
        </div>

        {/* ── CARROUSEL HERO AUTO-DÉFILANT (PILIER 3) ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
            
            {/* Image Slide */}
            <Image
              src={CAROUSEL_IMAGES[currentSlide].src}
              alt={CAROUSEL_IMAGES[currentSlide].alt}
              fill
              className="object-contain p-1 sm:p-2 transition-all duration-500 ease-out"
              priority={currentSlide === 0}
              sizes="(max-width: 768px) 100vw, 768px"
            />

            {/* Pastille Prix Officiel */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-sky-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                14 900 FCFA
              </span>
            </div>

            {/* Navigation Flèches */}
            <button
              onClick={prevSlide}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all z-10 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all z-10 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Sous-titre descriptif en bas du slide */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 via-slate-900/45 to-transparent p-4 text-white text-xs sm:text-sm font-medium z-10">
              <p className="line-clamp-1">{CAROUSEL_IMAGES[currentSlide].caption}</p>
            </div>
          </div>

          {/* Miniatures interactives synchronisées */}
          <div className="flex items-center justify-center gap-2 mt-3 overflow-x-auto py-1">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  currentSlide === idx 
                    ? "border-sky-600 scale-105 shadow-sm" 
                    : "border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.src}
                  alt={`Vignette ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Fixation universelle sans fuite</p>
            </div>
          </div>
        </div>

        {/* ── PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug="filtre-eau"
            productTitle="Filtre à Eau Universel pour Robinet 6 Couches de Filtration"
            productImage="/images/filtre-eau/filtre-eau-hero.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Filtre Eau - ${b.name}`,
                content_ids: ["filtre-eau", b.id || "solo"],
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
            accentColor="#0284c7"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 4 FONCTIONS MAJEURES DU FILTRE À EAU ROBINET ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Santé & Confort au Quotidien</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 avantages essentiels pour votre maison</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une eau saine, débarrassée du calcaire et des impuretés, directement disponible à tout moment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Action 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Layers className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">6 Niveaux de Filtration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Charbon actif, billes minérales et résines ciblées capturent la rouille, le chlore résiduel et les particules fines en suspension.
              </p>
            </div>

            {/* Action 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Wrench className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Installation Sans Outil</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le collier papillon ergonomique s&apos;ajuste fermement sur votre robinet en moins de 30 secondes sans aide de plombier.
              </p>
            </div>

            {/* Action 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Protection Toute Famille</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Idéal pour les biberons, les boissons fraîches, la cuisson des féculents et le lavage minutieux des fruits et légumes crus.
              </p>
            </div>

            {/* Action 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Droplets className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Anti-Éclaboussures</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le jet en pluie douce aérée préserve une forte pression tout en évitant d&apos;éclabousser vos vêtements ou le plan de travail.
              </p>
            </div>

          </div>
        </section>

        {/* ── DÉTAIL DES 6 COUCHES DE FILTRATION (INFOGRAPHIE GUIDÉE) ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Technologie Multicouche</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Comment fonctionnent les 6 couches de filtration ?</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Chaque strate retient une catégorie précise d&apos;impuretés pour délivrer une eau d&apos;une clarté optimale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Filtre gros débris</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bloque les grosses impuretés et résidus en suspension transportés par le réseau d&apos;eau.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Sable fin & sédiments</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Retient les micro-sédiments sablonneux et les particules de boue après les coupures d&apos;eau.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Billes minérales naturelles</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rééquilibrent les oligo-éléments et neutralisent l&apos;acidité pour un goût pur et agréable.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Charbon actif végétal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Absorbe le chlore, les mauvaises odeurs de tuyauterie et les polluants organiques dissous.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Résine filtrante sélective</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adoucit l&apos;eau en réduisant le calcaire lourd et les traces de métaux résiduels.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                6
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Filet tamis de protection</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diffuse un débit régulier et empêche tout retour de particule vers votre verre ou récipient.
              </p>
            </div>

          </div>
        </section>

        {/* ── BÉNÉFICES COMPARATIFS : SANS FILTRE VS AVEC FILTRE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi équiper son robinet est indispensable ?</h3>
            <p className="text-xs sm:text-sm text-slate-500">Ce qui se passe réellement dans les tuyauteries domestiques</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sans Filtre */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Robinet classique sans filtre</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Eau troublée et rouille</strong> : les travaux de voirie et tuyaux anciens colorent fréquemment l&apos;eau en marron ou jaune.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Goût piquant de chlore</strong> : goût désagréable qui altère le café, le thé et la saveur des aliments cuits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Dépôts de calcaire sur la vaisselle</strong> : traces blanchâtres tenaces sur les verres et casseroles.</span>
                </li>
              </ul>
            </div>

            {/* Avec Filtre 6 Couches */}
            <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-200/80 space-y-3">
              <div className="flex items-center gap-2 text-sky-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Robinet avec Filtre 6 Couches Isivente</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>Eau cristalline immédiate</strong> : rétention active de 99% des particules visibles et des micro-dépôts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>Aliments et légumes sains</strong> : salades, fruits et légumes lavés dans une eau pure sans danger pour les enfants.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>Économies substantielles</strong> : réduction drastique de l&apos;achat récurrent de packs d&apos;eau minérale lourds.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── GUIDE D'INSTALLATION RAPIDE EN 3 ÉTAPES ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Simplicité Absolue</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Installation en 3 étapes sans aucun outil</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 flex flex-col items-center text-center space-y-2">
              <span className="w-10 h-10 rounded-full bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                1
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Emboîtez sur le robinet</h4>
              <p className="text-xs text-slate-600">
                Insérez le goulot souple en silicone étanche directement sur le col rond de votre robinet.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 flex flex-col items-center text-center space-y-2">
              <span className="w-10 h-10 rounded-full bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                2
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Serrez le papillon</h4>
              <p className="text-xs text-slate-600">
                Tournez la poignée jaune papillon à la main jusqu&apos;à bloquer fermement le collier en inox.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 flex flex-col items-center text-center space-y-2">
              <span className="w-10 h-10 rounded-full bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                3
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">C&apos;est prêt à l&apos;emploi !</h4>
              <p className="text-xs text-slate-600">
                Ouvrez votre robinet : profitez immédiatement d&apos;une eau pure, saine et filtrée en continu.
              </p>
            </div>

          </div>
        </section>

        {/* ── BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-slate-900 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-sky-950/15">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente Bénin
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Filtre Universel pour Robinet
            </h4>
            <p className="text-sky-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">14 900 FCFA</strong> au lieu de <span className="line-through opacity-75">25 000 FCFA</span>.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-sky-950 font-bold text-sm rounded-xl hover:bg-sky-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Commander maintenant (14 900 F)
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
                    <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-semibold border border-sky-200/70">
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
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-sky-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-sky-600" : ""
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
          <p className="text-[11px]">Boutique officielle de distribution d&apos;équipements de filtration et maison. Service client disponible 7j/7.</p>
        </footer>

      </main>

      {/* ── BARRE MOBILE STICKY CTA (PILIER 1 & 2) ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        accentColor="#0284c7"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Filtre à Eau Universel pour Robinet 6 Couches à 14 900 FCFA."
      />

    </div>
  );
}
