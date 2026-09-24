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
  Footprints, 
  Layers, 
  Wind, 
  BedDouble, 
  Sparkles, 
  Clock, 
  Compass, 
  Maximize2,
  PackageCheck,
  RefreshCw,
  Award
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
    name: "Matelas Gonflable Ergonomique Autogonflant + Pompe & Oreiller Intégrés",
    subtitle: "Pack complet avec housse de transport compacte, kit de secours et garantie officielle Isivente",
    price: 24900,
    originalPrice: 40000,
    savings: 15100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/matelas-hero.png", 
    alt: "Matelas Gonflable Autogonflant Ergonomique avec Pompe à Pied et Oreiller Intégrés",
    caption: "Matelas ergonomique alvéolé : pompe à pied intégrée, oreiller profilé et sac de transport ultra-compact"
  }
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
    name: "Dr. Rodrigue T.",
    location: "Cotonou (CNHU)",
    rating: 5,
    date: "Achat vérifié",
    title: "Indispensable pour mes nuits de garde",
    comment: "Je l'ai acheté pour mes gardes de nuit à l'hôpital. Il se gonfle au pied en 45 secondes chrono sans s'épuiser. L'épaisseur isole totalement du carrelage froid et l'oreiller intégré soutient parfaitement les cervicales. Au matin, plié en 20 secondes dans mon sac à dos !",
    verified: true,
  },
  {
    name: "Marc-Aurel H.",
    location: "Calavi (Bidossessi)",
    rating: 5,
    date: "Achat vérifié",
    title: "Fini les matelas où l'on s'essouffle à souffler",
    comment: "La pompe à pied intégrée est une véritable révolution. Vous appuyez simplement plusieurs fois avec la semelle et le matelas prend forme tout seul bien ferme. La matière est très solide, mes enfants ont sauté dessus sans aucun problème.",
    verified: true,
  },
  {
    name: "Grâce D.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Génial pour recevoir la famille à la maison",
    comment: "Quand la famille débarque le week-end et qu'il n'y a plus de lit disponible, ce matelas me sauve. Beaucoup plus confortable qu'une natte ou un vieux matelas mousse poussiéreux. Livraison très rapide en 24h avec paiement après contrôle.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Comment fonctionne le gonflage avec la pompe à pied ?",
    a: "Le matelas intègre une pompe mécanique à valve unidirectionnelle située au niveau du pied. Il vous suffit d'ouvrir le bouchon de gonflage et d'appuyer alternativement avec le pied pendant environ 30 à 60 secondes. Aucun besoin d'électricité, de pompe encombrante ni de souffler à la bouche !"
  },
  {
    q: "Le matelas résiste-t-il aux sols durs ou caillouteux ?",
    a: "Absolument. Il est fabriqué en nylon 40D renforcé laminé avec un revêtement TPU multicouche haute densité. Cette matière de qualité militaire est indéchirable, anti-crevaison, étanche et supporte aisément jusqu'à 200 kg de charge."
  },
  {
    q: "Peut-on assembler deux matelas pour créer un lit double ?",
    a: "Oui ! Le matelas dispose de boutons-pression latéraux robustes tout le long des bords. En associant deux matelas, vous obtenez un lit 2 places spacieux sans aucun espace vide au milieu."
  },
  {
    q: "Quel est son encombrement une fois replié ?",
    a: "Ultra compact ! Une fois dégonflé et roulé dans sa housse de transport fournie, il mesure à peine la taille d'une bouteille d'eau d'un litre (environ 28 x 10 cm) pour un poids plume d'environ 800 g. Vous pouvez l'emporter partout sans effort."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée sous 24h chrono à Cotonou, Calavi, Porto-Novo et dans toutes les communes du Bénin. Le paiement s'effectue en espèces directement au livreur après réception et inspection de votre colis."
  }
];

export default function MatelasLanding({ slug = "matelas" }: { slug?: string }) {
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

  // Défilement automatique du carrousel
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
        product_slug: "matelas",
        product_title: "Matelas Gonflable Ergonomique Autogonflant",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Matelas Gonflable Ergonomique Autogonflant",
      content_ids: ["matelas"],
      value: 24900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Matelas Gonflable Ergonomique Autogonflant",
      content_ids: ["matelas"],
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
        product_title: "Matelas Gonflable Ergonomique Autogonflant avec Pompe & Oreiller Intégrés",
        product_slug: "matelas",
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

      markLeadConverted(customerPhone.trim(), "matelas");

      trackPurchase({
        content_name: "Matelas Gonflable Ergonomique Autogonflant",
        content_ids: ["matelas"],
        value: selectedBundle.price,
        currency: "XOF",
        num_items: 1,
      });

      const successUrl = `/p/matelas/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-50 selection:text-emerald-900">
      
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
              <Compass className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(5,150,105,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-emerald-100 text-[11px]">(24 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nouveau standard confort outdoor & voyage</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            Dormez comme à l’hôtel n’importe où : Matelas Autogonflant avec Pompe à Pied & Oreiller Intégrés
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Gonflez en moins de 60 secondes d’une simple pression du pied. Épaisseur 8-10 cm à alvéoles ergonomiques, maintien cervical optimal et ultra-compact dans son sac de transport.
          </p>
        </div>

        {/* ── GALERIE HERO PRINCIPALE ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5 transition-all"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-[4/5] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Image
              src={CAROUSEL_IMAGES[activeImgIndex].src}
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              fill
              className="object-contain p-2 sm:p-4 transition-transform duration-500 ease-out"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />

            {/* Badges Flottants Produit */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
                <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                Pompe à pied intégrée
              </span>
              <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Nylon 40D + TPU Imperméable
              </span>
            </div>

            <div className="absolute top-3 right-3 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                Offre Spéciale -38%
              </span>
            </div>

            {/* Légende Bas de Carte */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-4 text-white text-xs sm:text-sm font-medium">
              <p className="line-clamp-1">{CAROUSEL_IMAGES[activeImgIndex].caption}</p>
            </div>
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
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
              <p className="text-[11px] text-slate-500">Payez en espèces après vérification</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Échange immédiat en cas d'anomalie</p>
            </div>
          </div>
        </div>

        {/* ── PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug="matelas"
            productTitle="Matelas Gonflable Ergonomique Autogonflant avec Pompe & Oreiller Intégrés"
            productImage="/images/matelas-hero.png"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Matelas Autogonflant - ${b.name}`,
                content_ids: ["matelas", b.id || "solo"],
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
            accentColor="#059669"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 6 ATOUTS CLÉS MAJEURS DU MATELAS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Confort & Ingénierie</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Pourquoi ce matelas surpasse les modèles traditionnels</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Conçu pour éliminer toutes les frustrations du camping et du repos d'appoint.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Feature 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Footprints className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pompe à pied intégrée</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Appuyez avec le pied pendant 30 à 60 secondes. Fini de vous essouffler à la bouche ou d'emporter une pompe électrique lourde.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Oreiller ergonomique 3D</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Courbure cervicale intégrée qui soulage les tensions de la nuque et maintient la tête à hauteur idéale. Zéro torticolis au réveil.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Layers className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Épaisseur 8-10 cm alvéolée</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structure alvéoles nid d'abeille répartissant parfaitement le poids corporel jusqu'à 200 kg. Isole des bosses, cailloux et carrelage froid.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Nylon 40D + TPU indéchirable</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tissu robuste étanche et résistant à l'abrasion. Se nettoie d'un simple coup de chiffon humide et résiste aux piqures d'herbe.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <BedDouble className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Clipsable en lit 2 places</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Boutons-pression latéraux permettant de jumeler 2 matelas en quelques secondes pour former un grand couchage double sans glissement.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Maximize2 className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Poids plume & poche compacte</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Moins de 800 grammes ! Une fois plié, il tient dans un sac de transport de la taille d'une gourde d'eau. Emportez-le partout.
              </p>
            </div>

          </div>
        </section>

        {/* ── COMPARATIF MATELAS ISIVENTE VS MATELAS CLASSIQUE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi faire la différence ?</h3>
            <p className="text-xs sm:text-sm text-slate-500">Voyez pourquoi ce modèle surpasse tout ce que vous avez testé auparavant.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ancien Matelas */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Matelas gonflable ordinaire</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Nécessite de souffler à la bouche jusqu'à l'épuisement ou une pompe encombrante.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Pas d'oreiller : cou tordu et torticolis garantis sans coussin d'appoint.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Plat et fin : votre dos touche le sol froid et dur dès que vous bougez.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Lourd, volumineux et prend la moitié du coffre de voiture.</span>
                </li>
              </ul>
            </div>

            {/* Matelas Isivente */}
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Matelas Isivente Autogonflant 40D</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Pompe à pied intégrée</strong> : gonflage sans effort en 45 secondes chrono.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Oreiller ergonomique moulé</strong> : alignement parfait de la colonne et du cou.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Alvéoles 3D 8-10 cm</strong> : isolation thermique complète du sol et confort moelleux.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Pliage ultra-compact 800g</strong> : se glisse dans n'importe quel sac de voyage.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── FICHE TECHNIQUE DÉTAILLÉE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Fiche Technique & Caractéristiques Officielles</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-slate-400 font-medium text-[10px]">Dimensions Déplié</p>
              <p className="font-bold text-slate-800 mt-0.5">196 x 68 x 9 cm</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-slate-400 font-medium text-[10px]">Dimensions Replié</p>
              <p className="font-bold text-slate-800 mt-0.5">28 x 10 cm (Ultra-compact)</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-slate-400 font-medium text-[10px]">Matière & Tissu</p>
              <p className="font-bold text-slate-800 mt-0.5">Nylon 40D + TPU Étanche</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-slate-400 font-medium text-[10px]">Charge Maximale</p>
              <p className="font-bold text-slate-800 mt-0.5">Jusqu'à 200 kg</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-slate-400 font-medium text-[10px]">Système de Gonflage</p>
              <p className="font-bold text-slate-800 mt-0.5">Pompe à pied intégrée</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-slate-400 font-medium text-[10px]">Temps de Gonflage</p>
              <p className="font-bold text-slate-800 mt-0.5">30 à 60 secondes</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-slate-400 font-medium text-[10px]">Oreiller</p>
              <p className="font-bold text-slate-800 mt-0.5">Intégré monobloc</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-slate-400 font-medium text-[10px]">Accessoires Inclus</p>
              <p className="font-bold text-slate-800 mt-0.5">Sac de transport + Patches</p>
            </div>
          </div>
        </section>

        {/* ── BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX AVANT AVIS ── */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-emerald-950/10">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Stock Limité au Bénin
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Matelas Autogonflant
            </h4>
            <p className="text-emerald-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">24 900 FCFA</strong> au lieu de <span className="line-through opacity-75">40 000 FCFA</span>.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-900 font-bold text-sm rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Profiter de l'offre (24 900 F)
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
              <span className="text-slate-500 text-xs">(Avis clients certifiés)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clients au Bénin</h2>
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
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-100">
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
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-emerald-600" : ""
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
        price={24900}
        targetSectionId="commander"
        accentColor="#059669"
        buttonText="Commander"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Matelas Gonflable Ergonomique Autogonflant à 24 900 FCFA."
      />

    </div>
  );
}
