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
  Heart, 
  Zap, 
  PackageCheck,
  Award,
  RefreshCw,
  Gift,
  ArrowRight
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
    name: "Brosse Multifonction Spray & Massage du Cuir Chevelu YUFAN™",
    subtitle: "Coffret officiel avec réservoir brumisateur, câble de recharge USB et garantie Isivente",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/brosse-spray-infographie.jpg", 
    alt: "Brosse Multifonction YUFAN - Des cheveux plus beaux au quotidien : Massage, Spray, Démêlage et Soin",
    caption: "Brosse Multifonction YUFAN™ : Spray brume hydratant + Picots massants stimulants pour tous types de cheveux"
  },
  { 
    src: "/images/brosse-spray-hero.jpg", 
    alt: "Brosse YUFAN en action avec fine brume hydratante pour cheveux bouclés, crépus et lisses",
    caption: "Diffusion de micro-brume instantanée en une pression : hydrate la fibre et démêle sans douleur"
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
    name: "Tatiana M.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le démêlage du matin est devenu un plaisir",
    comment: "Mes cheveux crépus 4C étaient toujours secs et douloureux à démêler le matin. Je mets de l'eau avec un peu d'huile d'avocat dans le réservoir : la brume diffuse tout doux et la brosse glisse toute seule sans casser les pointes !",
    verified: true,
  },
  {
    name: "Esther A.",
    location: "Calavi (Tankpè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Magique pour les tresses et cheveux des enfants",
    comment: "Fini les pleurs le matin avec ma fille de 7 ans ! Dès que j'active le spray, la brume humidifie la chevelure uniformément sans tremper comme un vaporisateur classique. Les picots ronds massent la tête et elle adore.",
    verified: true,
  },
  {
    name: "Aïcha S.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Très bonne qualité et livraison rapide",
    comment: "Livré en 24h chrono. J'ai pu ouvrir le paquet et vérifier la brosse avant de payer en espèces au livreur. La batterie tient très longtemps en rechargeant par USB.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Que peut-on mettre dans le réservoir de la brosse ?",
    a: "Vous pouvez y mettre de l'eau minérale propre, de l'eau de rose, un hydrolat capillaire (comme l'eau de romarin pour stimuler la pousse) ou votre lotion capillaire liquide habituelle. La buse ultrasonique transforme le liquide en une micro-brume ultrafine qui pénètre la fibre sans laisser de gouttes lourdes."
  },
  {
    q: "Est-elle adaptée aux cheveux crépus, frisés ou défrisés ?",
    a: "Oui, à 100% ! Les picots sont montés sur un coussinet souple avec des extrémités sphériques polies. La brume assouplit instantanément la kératine du cheveu, ce qui permet de détendre les nœuds les plus serrés sans tirer sur le cuir chevelu."
  },
  {
    q: "Comment fonctionne la recharge ?",
    a: "La brosse est rechargeable par câble USB fourni. Une charge complète offre plusieurs jours d'utilisation quotidienne. Aucun besoin d'acheter des piles jetables."
  },
  {
    q: "Les picots massants font-ils mal ?",
    a: "Pas du tout. Les picots sont spécialement arrondis pour offrir un massage stimulant et relaxant qui favorise la micro-circulation sanguine autour des follicules pileux, ce qui accélère la pousse naturelle du cheveu."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue en 24h chrono à Cotonou, Calavi et partout au Bénin. Vous payez en espèces (14 900 FCFA) uniquement après avoir reçu et inspecté votre brosse auprès du livreur."
  }
];

export default function UmeiLanding({ slug = "umei" }: { slug?: string }) {
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
        product_slug: "umei",
        product_title: "Brosse Multifonction Spray & Massage YUFAN",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Brosse Multifonction Spray & Massage YUFAN",
      content_ids: ["umei", "brosse"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Brosse Multifonction Spray & Massage YUFAN",
      content_ids: ["umei"],
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
        product_title: "Brosse Multifonction Spray & Massage du Cuir Chevelu YUFAN™",
        product_slug: "umei",
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

      markLeadConverted(customerPhone.trim(), "umei");

      trackPurchase({
        content_name: "Brosse Multifonction Spray & Massage YUFAN",
        content_ids: ["umei"],
        value: selectedBundle.price,
        currency: "XOF",
        num_items: 1,
      });

      const successUrl = `/p/umei/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(219,39,119,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-pink-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 text-purple-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Soin capillaire quotidien 4-en-1</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            Des cheveux plus doux, hydratés et sans casse : Brosse Multifonction Spray & Massage YUFAN™
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Démêlez en douceur grâce à la micro-brume hydratante intégrée et stimulez la pousse naturelle de vos cheveux avec les picots massants doux.
          </p>
        </div>

        {/* ── GALERIE HERO PRINCIPALE AUTO-DÉFILANTE ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5 transition-all"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
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
              <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-purple-900 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
                <Droplets className="w-3.5 h-3.5 text-pink-500" />
                Spray Brume Hydratante
              </span>
              <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                Massage Cuir Chevelu
              </span>
            </div>

            <div className="absolute top-3 right-3 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-pink-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                14 900 FCFA
              </span>
            </div>

            {/* Boutons de navigation manuelle */}
            <button
              onClick={() => setActiveImgIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-slate-700 hover:bg-white flex items-center justify-center shadow-md transition-all cursor-pointer"
              title="Précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-slate-700 hover:bg-white flex items-center justify-center shadow-md transition-all cursor-pointer"
              title="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Légende Bas de Carte */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-4 text-white text-xs sm:text-sm font-medium">
              <p className="line-clamp-1">{CAROUSEL_IMAGES[activeImgIndex].caption}</p>
            </div>
          </div>

          {/* Miniatures interactives */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 ${
                  activeImgIndex === idx 
                    ? "border-pink-600 shadow-xs ring-2 ring-pink-500/20" 
                    : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
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
            productSlug="umei"
            productTitle="Brosse Multifonction Spray & Massage du Cuir Chevelu YUFAN™"
            productImage="/images/brosse-spray-hero.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Brosse YUFAN - ${b.name}`,
                content_ids: ["umei", b.id || "solo"],
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
            accentColor="#db2777"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 4 FONCTIONS MAJEURES DE LA BROSSE YUFAN ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">Soins & Bien-être</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 actions indispensables réunies dans une seule brosse</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Le secret d'un cheveu brillant, fort et démêlé sans douleur au quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Action 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                <Droplets className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Spray fin brume intégré</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hydrate vos cheveux en une seule pression. Remplissez avec de l'eau, un hydrolat ou une lotion capillaire pour rafraîchir la fibre.
              </p>
            </div>

            {/* Action 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Heart className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Massage du cuir chevelu</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Picots arrondis massants qui stimulent la micro-circulation sanguine, détendent les tensions et favorisent une repousse plus dense.
              </p>
            </div>

            {/* Action 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Démêlage anti-casse</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                L'humidité de la brume assouplit les nœuds avant le passage des picots. Réduit drastiquement la casse et la perte de cheveux.
              </p>
            </div>

            {/* Action 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Award className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Tous types de cheveux</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Parfaitement adaptée aux cheveux crépus (4A, 4B, 4C), bouclés, frisés, ondulés et lisses. Idéal pour adultes et enfants.
              </p>
            </div>

          </div>
        </section>

        {/* ── SECTION DÉMONSTRATION VIDÉO TIKTOK (PILIER 4 AUTOPLAY) ── */}
        <section id="demo-video" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">Vidéo en Action Réelle</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Découvrez la brosse en utilisation réelle
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Regardez la micro-brume instantanée assouplir les cheveux pour un brossage soyeux, sans douleur et sans casse.
            </p>
          </div>

          <div className="relative max-w-sm sm:max-w-md mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md">
            <video
              src="/videos/brosse-demo.mp4"
              poster="/images/brosse-video-cover.jpg"
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander maintenant (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Fini le calvaire du démêlage à sec</h3>
            <p className="text-xs sm:text-sm text-slate-500">Pourquoi cette brosse révolutionne la routine de toute la famille</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Brosse Classique */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Brossage ou peigne ordinaire</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Tire violemment sur les racines et arrache les cheveux emmêlés.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Cheveux secs et cassants qui se remplissent de frisottis et d'électricité statique.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Oblige à utiliser un spray encombrant qui trempe les vêtements et le sol.</span>
                </li>
              </ul>
            </div>

            {/* Brosse YUFAN */}
            <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-200/80 space-y-3">
              <div className="flex items-center gap-2 text-pink-700 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                <span>Brosse YUFAN Spray & Massage</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 font-bold">✓</span>
                  <span><strong>Micro-brume ciblée</strong> : humidifie directement la mèche pour un glissement sans accroc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 font-bold">✓</span>
                  <span><strong>Picots massants souples</strong> : stimulation agréable du cuir chevelu sans aucune douleur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 font-bold">✓</span>
                  <span><strong>Rechargeable & nomade</strong> : compacte dans son sac pour une retouche fraîcheur à tout moment.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-pink-950/10">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Brosse Multifonction YUFAN™
            </h4>
            <p className="text-pink-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">14 900 FCFA</strong> au lieu de <span className="line-through opacity-75">25 000 FCFA</span>.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-pink-900 font-bold text-sm rounded-xl hover:bg-pink-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
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
              <span className="text-slate-500 text-xs">(Avis clientes certifiées au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clientes</h2>
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
                    <span className="text-[10px] text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full font-semibold border border-pink-100">
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
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-pink-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-pink-600" : ""
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
        price={14900}
        targetSectionId="commander"
        accentColor="#db2777"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander la Brosse Multifonction Spray & Massage YUFAN à 14 900 FCFA."
      />

    </div>
  );
}
