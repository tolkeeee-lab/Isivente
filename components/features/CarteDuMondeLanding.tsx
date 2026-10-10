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
  Compass, 
  Gift, 
  MapPin, 
  Globe, 
  PackageCheck,
  Award,
  ArrowRight,
  Layers,
  Camera,
  Heart,
  Plane
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
    name: "Coffret Carte du Monde à Gratter Deluxe (82x59cm) + Tube & Accessoires",
    subtitle: "Format géant 82x59 cm, tube rigide cadeau Explore The World, grattoir de précision, brosse, chiffon et guide",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
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
    name: "Mireille T.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Offert à mon mari pour son anniversaire, il a adoré !",
    comment: "Mon mari voyage beaucoup pour le travail en Afrique et en Europe. Quand il a déballé le tube Explore The World, il a tout de suite commencé à gratter tous les pays où il a mis les pieds. La carte est immense et magnifique dans notre salon !",
    verified: true,
  },
  {
    name: "Serge A.",
    location: "Calavi (Tankpè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Qualité exceptionnelle et emballage dans un tube rigide très chic",
    comment: "La feuille dorée se gratte très facilement sans abîmer le papier ni déchirer les contours. Les couleurs qui apparaissent en dessous sont éclatantes. Les accessoires fournis (le grattoir et la petite brosse) sont très pratiques.",
    verified: true,
  },
  {
    name: "Blandine O.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Superbe décoration murale pour inspirer nos futurs voyages",
    comment: "Livré en 24h avec paiement après vérification du colis. La carte est très précise avec les capitales et les îles. Toute la famille adore se rassembler devant pour planifier nos prochaines vacances !",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Quelles sont les dimensions de la carte du monde ?",
    a: "La carte est au format grand panorama de 82 x 59 cm. C'est une dimension standard qui permet de l'afficher directement sur un mur ou de l'encadrer facilement avec n'importe quel cadre photo du commerce."
  },
  {
    q: "La carte risque-t-elle de se déchirer quand on la gratte ?",
    a: "Non ! La carte est imprimée sur un papier couché haut grammage plastifié résistant. La couche d'encre dorée est spécialement formulée pour se retirer en douceur avec le médiator fourni, sans jamais transpercer ni abîmer les couleurs du fond."
  },
  {
    q: "Que contient exactement le kit à 14 900 FCFA ?",
    a: "Le coffret complet comprend : la grande carte du monde 82 x 59 cm, son tube rigide de voyage et de protection cylindrique Explore The World, un grattoir de précision, une brosse pour balayer les résidus dorés, un chiffon doux de nettoyage et un guide d'utilisation."
  },
  {
    q: "Est-ce une bonne idée de cadeau ?",
    a: "C'est l'un des cadeaux les plus appréciés au monde ! Livrée directement dans son superbe tube rigide noir et or, vous n'avez même pas besoin d'emballage cadeau supplémentaire. C'est idéal pour un anniversaire, les fêtes de fin d'année ou un départ en voyage."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison se fait en 24h chrono partout à Cotonou, Calavi, Porto-Novo et dans tous les départements. Vous ne payez rien en avance : vous réglez les 14 900 FCFA en espèces au livreur uniquement après avoir inspecté votre tube."
  }
];

const CAROUSEL_SLIDES = [
  {
    src: "/images/carte-du-monde/carte-monde-deco.jpg",
    alt: "Carte du monde à gratter Deluxe affichée en décoration murale de salon",
    caption: "Une décoration murale raffinée et chaleureuse pour votre salon, chambre ou bureau",
  },
  {
    src: "/images/carte-du-monde/carte-monde-gratter.jpg",
    alt: "Démonstration du grattage facile de la couche dorée pour révéler les pays",
    caption: "Grattez où vous êtes allé : révélez des couleurs éclatantes sous chaque pays visité",
  },
  {
    src: "/images/carte-du-monde/carte-monde-kit.jpg",
    alt: "Contenu complet du kit : carte 82x59cm, tube Explore The World, grattoir, brosse et chiffon",
    caption: "Coffret complet tout-en-un : Carte géante 82x59 cm, tube rigide cadeau et accessoires complets",
  },
  {
    src: "/images/carte-du-monde/carte-monde-details.jpg",
    alt: "Détails précis : noms des pays, capitales, drapeaux et océans",
    caption: "Détails haute précision : noms des pays, capitales, grandes villes, océans et rose des vents",
  },
  {
    src: "/images/carte-du-monde/carte-monde-cadeau.jpg",
    alt: "Le cadeau idéal pour les passionnés de voyage et les rêveurs",
    caption: "Le cadeau idéal et mémorable pour tous les passionnés de voyages et d'aventure",
  },
];

export default function CarteDuMondeLanding({ slug = "carte-du-monde" }: { slug?: string }) {
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

  // Carrousel auto-défilant (Pilier 3)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
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
        product_slug: "carte-du-monde",
        product_title: "Carte du Monde à Gratter Deluxe Grand Format (82 x 59 cm)",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Carte du Monde à Gratter Deluxe",
      content_ids: ["carte-du-monde", "scratch-map"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Carte du Monde à Gratter Deluxe",
      content_ids: ["carte-du-monde"],
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
        product_title: "Carte du Monde à Gratter Deluxe Grand Format (82 x 59 cm)",
        product_slug: "carte-du-monde",
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

      markLeadConverted(customerPhone.trim(), "carte-du-monde");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Carte du Monde à Gratter Deluxe",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/carte-du-monde/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
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
              <Compass className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(217,119,6,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-amber-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>Idée Cadeau N°1 des Passionnés de Voyage</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Grattez où vous êtes allé et laissez une trace de vos <span className="text-amber-600">aventures !</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            La carte du monde géante (82 x 59 cm) en finition noire & or. Révélez des couleurs éclatantes sous chaque pays visité et sublimez votre décoration avec un souvenir vivant de vos voyages.
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AUTO-DÉFILANT (PILIER 3 SANS STICKER) ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
            
            {/* Cadre image produit avec animation de fondu */}
            <div className="relative w-full h-full">
              {CAROUSEL_SLIDES.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-contain p-2 sm:p-4"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              ))}

              {/* Pastille Prix Officiel */}
              <div className="absolute top-3 right-3 z-30 pointer-events-none">
                <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                  14 900 FCFA
                </span>
              </div>

              {/* Légende en bas du carrousel */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 via-slate-900/50 to-transparent p-3 sm:p-4 text-white text-xs sm:text-sm font-medium z-20">
                <p className="line-clamp-1">{CAROUSEL_SLIDES[currentSlide].caption}</p>
              </div>

              {/* Flèches de navigation du carrousel */}
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-90 cursor-pointer"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Indicateurs de points (dots) */}
          <div className="flex items-center justify-center gap-2 pt-3">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentSlide ? "w-6 bg-amber-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Aller au slide ${i + 1}`}
              />
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
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
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="carte-du-monde"
            productTitle="Carte du Monde à Gratter Deluxe Grand Format (82 x 59 cm)"
            productImage="/images/carte-du-monde/carte-monde-kit.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Carte du Monde - ${b.name}`,
                content_ids: ["carte-du-monde", b.id || "solo"],
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
            accentColor="#b45309"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. GRILLE DES BÉNÉFICES / 4 ATOUTS MAJEURS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Qualité & Finition Deluxe</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 détails d'exception qui font toute la différence</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Bien plus qu'un simple poster : une pièce de collection raffinée pour immortaliser vos périples.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Atout 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Globe className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Grand Format 82 x 59 cm</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Une envergure panoramique spectaculaire. Parfaite pour habiller le mur d'un salon, d'une chambre ou d'un bureau de direction.
              </p>
            </div>

            {/* Atout 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Couche Dorée Haut de Gamme</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Encre dorée brillante de première qualité : se gratte avec une fluidité totale sans déchirer le papier ni abîmer les contours.
              </p>
            </div>

            {/* Atout 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Compass className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Haute Précision Cartographique</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Noms des pays, capitales, îles, océans et rose des vents clairement lisibles. Les pays révèlent des teintes éclatantes et variées.
              </p>
            </div>

            {/* Atout 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Gift className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Tube Rigide Cadeau Inclus</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Livrée roulée sans aucun pli dans un superbe tube cylindrique rigide "Explore The World". Prête à être offerte immédiatement !
              </p>
            </div>

          </div>
        </section>

        {/* ── 9. DÉMONSTRATION EN ACTION (3 ÉTAPES CLAIRES) ── */}
        <section id="demo-video" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Un rituel fascinant</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Comment ça marche ? Enlevez la couche dorée et admirez le résultat
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Chaque voyage devient un événement : immortalisez chaque pays visité au fur et à mesure de vos explorations.
            </p>
          </div>

          {/* Grille des 3 étapes visuelles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Avant</span>
              <h3 className="font-bold text-slate-900 text-sm">Une élégante couche dorée</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tous les continents sont recouverts d'un film doré mat prestigieux qui protège les détails de la carte.
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pendant</span>
              <h3 className="font-bold text-slate-900 text-sm">Grattez avec l'outil fourni</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilisez le grattoir médiator pour décoller la pellicule sans rayer ni appuyer excessivement.
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Après</span>
              <h3 className="font-bold text-slate-900 text-sm">Des couleurs éclatantes !</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Découvrez des pays aux couleurs vives qui contrastent magnifiquement avec le fond noir intense.
              </p>
            </div>

          </div>

          {/* Image de démonstration haute définition */}
          <div className="relative max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/carte-du-monde/carte-monde-gratter.jpg"
              alt="Démonstration du grattage de la carte du monde"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander mon coffret voyage (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi cette carte est incomparable</h3>
            <p className="text-xs sm:text-sm text-slate-500">La différence entre un simple poster et une véritable pièce de décoration interactive</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Poster ordinaire */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Posters ou cartes papier ordinaires</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Papier fin qui jaunit, prend l'humidité et gondole au bout de quelques semaines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Aucune interactivité : un visuel statique sans émotion ni trace de votre propre parcours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Expédié dans une simple enveloppe pliée avec de vilaines marques de pliures définitives.</span>
                </li>
              </ul>
            </div>

            {/* Carte du Monde Isivente */}
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Coffret Carte du Monde Deluxe Isivente</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>Grand format 82 x 59 cm</strong> : impression HD brillante avec finitions dorées luxueuses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>100% interactive</strong> : grattez facilement chaque pays visité pour un tableau vivant unique.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>Tube cylindrique rigide cadeau</strong> : carte parfaitement roulée et protégée + kit d'accessoires complet.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── 11. INFOGRAPHIE / CONTENU DU COFFRET & DÉTAILS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Coffret Prêt à l'Emploi</span>
            <h3 className="font-bold text-slate-900 text-base sm:text-xl">
              Tout ce que contient votre coffret voyage
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Un équipement complet pour une expérience de grattage nette, propre et sans bavure.
            </p>
          </div>

          {/* Grille des accessoires inclus */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-amber-800 block">1. Carte Géante</span>
              <span className="text-[11px] text-slate-600">82 x 59 cm grand panorama</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-amber-800 block">2. Grattoir</span>
              <span className="text-[11px] text-slate-600">Médiator ergonomique précis</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-amber-800 block">3. Brosse</span>
              <span className="text-[11px] text-slate-600">Nettoie les résidus dorés</span>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-amber-800 block">4. Chiffon & Tube</span>
              <span className="text-[11px] text-slate-600">Microfibre et tube rigide</span>
            </div>
          </div>

          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/carte-du-monde/carte-monde-kit.jpg"
              alt="Contenu du coffret Carte du monde à gratter Explore The World"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 576px"
            />
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-800 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-amber-950/10">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente Bénin
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Carte du Monde à Gratter Deluxe
            </h4>
            <p className="text-amber-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">14 900 FCFA</strong> au lieu de <span className="line-through opacity-75">25 000 FCFA</span> (Économisez 10 100 F).
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-amber-950 font-bold text-sm rounded-xl hover:bg-amber-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Commander maintenant (14 900 F)
          </button>
        </div>

        {/* ── 13. SECTION AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-slate-800 font-bold text-sm ml-1.5">4.9/5</span>
              <span className="text-slate-500 text-xs">(Avis voyageurs certifiés au Bénin)</span>
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
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                      {rev.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rev.name}</span>
                  <span className="text-slate-400">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. SECTION FAQ INTERACTIVE ── */}
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
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-amber-800 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-600" : ""
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

        {/* ── 15. FOOTER OFFICIEL ISIVENTE ── */}
        <footer className="text-center text-xs text-slate-400 space-y-2 pt-6 border-t border-slate-200">
          <p>© {new Date().getFullYear()} ISIVENTE Bénin - Tous droits réservés.</p>
          <p className="text-[11px]">Boutique officielle de distribution en ligne. Service client disponible 7j/7.</p>
        </footer>

      </main>

      {/* ── 16. BARRE MOBILE STICKY CTA (PILIER 1 & 2) ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        accentColor="#b45309"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander la Carte du Monde à Gratter Deluxe à 14 900 FCFA."
      />

    </div>
  );
}
