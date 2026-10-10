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
  PackageCheck,
  Award,
  ArrowRight,
  Apple,
  Flower2,
  Shield,
  Activity
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Gummies Probiotiques Équilibre Féminin & Confort Intime (Boîte 60 Gummies)",
    subtitle: "Cure complète de 30 jours (2 gummies/jour) • Formule 3-en-1 Probiotiques 5 Mds CFU + Cranberry + Prébiotiques + Vit C",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/probiotic-gummies-hero-1.jpg",
    alt: "Gummies Probiotiques Équilibre Féminin - Bien-être intime de l'intérieur",
    caption: "Formule 3-en-1 : Probiotiques 5 Mds CFU, Cranberry concentré, Prébiotiques & Vitamine C"
  },
  {
    src: "/images/probiotic-gummies-hero-2.jpg",
    alt: "Votre équilibre féminin compte - Une routine simple et délicieuse",
    caption: "Une femme bien dans sa peau commence de l'intérieur : délicieux goût naturel de cranberry"
  },
  {
    src: "/images/probiotic-gummies-metaphore.jpg",
    alt: "Pourquoi attendre un problème pour prendre soin de son équilibre intime ?",
    caption: "La prévention proactive au quotidien : 2 gummies par jour pour une flore intime saine et protégée"
  },
  {
    src: "/images/probiotic-gummies-lifestyle.jpg",
    alt: "Prendre soin de soi ne devrait pas être compliqué - Femme active et épanouie",
    caption: "Format nomade et gourmand : emportez votre cure facilement dans votre sac"
  },
  {
    src: "/images/probiotic-gummies-formule-6souches.jpg",
    alt: "6 souches probiotiques ciblées pour l'équilibre féminin",
    caption: "Synergie haute efficacité : 6 souches probiotiques brevetées pour la flore intime et urinaire"
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
    name: "Grâce D.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Plus aucune gêne intime, je revis !",
    comment: "J'avais régulièrement des inconforts et des brûlures urinaires désagréables après mes cycles. Depuis 3 semaines que je prends mes 2 gummies chaque matin, je me sens fraîche, légère et totalement sereine. En plus le goût cranberry est délicieux !",
    verified: true,
  },
  {
    name: "Mireille T.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Ventre plat et fini les pertes inconfortables",
    comment: "J'étais sceptique au début car j'avais déjà essayé des ovules et des gélules classiques sans grand résultat durable. Là, la combinaison probiotiques + cranberry a réglé mes pertes anormales en moins de 10 jours et ma digestion s'est nettement améliorée.",
    verified: true,
  },
  {
    name: "Sylvie A.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Super pratique et livraison express en 24h",
    comment: "Reçu le lendemain de ma commande à Porto-Novo avec paiement à la livraison au livreur. La boîte était scellée et intacte. C'est tellement plus agréable à prendre que des médicaments amers. Je recommande à 100% à toutes les femmes.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Quelle est la posologie recommandée pour cette cure ?",
    a: "La posologie idéale est de 2 gummies par jour, de préférence le matin au petit-déjeuner. Il suffit de les mâcher comme des bonbons fruités. Aucune obligation de boire de l'eau en même temps, ce qui rend la prise très facile même en déplacement."
  },
  {
    q: "Au bout de combien de temps ressent-on les premiers bienfaits ?",
    a: "Dès les 7 à 10 premiers jours, la majorité des utilisatrices constatent une disparition nette des sensations de brûlure, des pertes gênantes et des démangeaisons intimes, ainsi qu'une digestion plus légère. Une cure de 30 jours (1 boîte) permet de réensemencer durablement la flore protectrice."
  },
  {
    q: "Ces gummies contiennent-ils du sucre ou des additifs chimiques ?",
    a: "Non. Ces gummies sont certifiés 100% sans sucre ajouté, sans gluten, sans gélatine animale (100% vegan à base de pectine végétale de fruits) et sans OGM. Ils sont formulés pour être doux avec l'organisme et respectueux de votre santé."
  },
  {
    q: "Les gummies résistent-ils à la chaleur du climat béninois ?",
    a: "Oui, parfaitement ! Formulés avec de la pectine de fruits de haute pureté et un flacon hermétique de qualité pharmaceutique, les gummies ne fondent pas et conservent l'intégralité de leurs 5 milliards de bactéries vivantes à température ambiante normale."
  },
  {
    q: "Puis-je les prendre en période de règles ou sous contraceptif ?",
    a: "Oui, tout à fait. Les probiotiques et la cranberry sont des nutriments naturels qui n'interagissent pas avec les hormones contraceptives. Ils sont même particulièrement recommandés pendant et juste après les règles, période où la flore vaginale est naturellement plus vulnérable."
  }
];

export default function ProbioticGummiesLanding({ slug = "equilibre-feminin" }: { slug?: string }) {
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

  // Auto-scroll automatique du carrousel Hero (3.8s) avec arrêt au survol
  useEffect(() => {
    if (isHeroHovered || CAROUSEL_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  // Pixel Meta : ViewContent officiel
  useEffect(() => {
    trackViewContent({
      content_name: "Gummies Probiotiques Équilibre Féminin & Confort Intime",
      content_ids: ["equilibre-feminin"],
      value: 14900,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Gummies Probiotiques Équilibre Féminin",
      content_ids: ["equilibre-feminin"],
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
        customer_phone2: customerPhone2.trim() || undefined,
        city: city.trim() || "Cotonou",
        address: address.trim() || "Cotonou - Livraison à domicile",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
        product_slug: "equilibre-feminin",
        product_title: "Gummies Probiotiques Équilibre Féminin & Confort Intime",
        status: "pending",
        utm_source: utm?.utm_source || undefined,
        utm_medium: utm?.utm_medium || undefined,
        utm_campaign: utm?.utm_campaign || undefined,
      });

      markLeadConverted(customerPhone.trim(), "equilibre-feminin");

      // Stocker les métadonnées pour la page success (qui déclenche l'événement Purchase dédupliqué)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Gummies Probiotiques Équilibre Féminin & Confort Intime",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/equilibre-feminin/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(225,29,72,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-rose-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3.5 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Formule 3-en-1 Cliniquement Étudiée • 5 Milliards CFU</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Et si votre bien-être intime commençait de <span className="text-rose-600">l'intérieur ?</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Une routine simple, saine et délicieuse au cranberry pour soutenir votre équilibre féminin, votre confort urinaire et votre flore protectrice au quotidien.
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AUTO-DÉFILANT AVEC MINIATURES ── */}
        <div 
          className="bg-white rounded-3xl border border-rose-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(225,29,72,0.06)] p-3 sm:p-5 space-y-3"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-center overflow-hidden">
            
            {/* Image courante du carrousel */}
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

            {/* Flèches de navigation */}
            {CAROUSEL_IMAGES.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-rose-100 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-20"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-rose-100 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-20"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </>
            )}
          </div>

          {/* Miniatures interactives synchronisées (5 photos) */}
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
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-rose-100/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-rose-100/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-rose-100/90 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Pureté 100%</p>
              <p className="text-[11px] text-slate-500">6 souches brevetées, sans sucre</p>
            </div>
          </div>
        </div>

        {/* ── 7. PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="equilibre-feminin"
            productTitle="Gummies Probiotiques Équilibre Féminin & Confort Intime (60 Gummies)"
            productImage="/images/probiotic-gummies-hero-1.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Gummies Probiotiques - ${b.name}`,
                content_ids: ["equilibre-feminin", b.id || "solo"],
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

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Synergie Active 3-en-1</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 actions essentielles pour votre confort au quotidien</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une formule haute performance qui cible les causes profondes des inconforts féminins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Bénéfice 1 */}
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Flower2 className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Équilibre Intime & Flore</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                5 milliards de probiotiques (6 souches ciblées) pour restaurer le microbiote intime, neutraliser les odeurs et stopper les démangeaisons.
              </p>
            </div>

            {/* Bénéfice 2 */}
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                <Shield className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Confort Urinaire Durable</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                100 mg d'extrait pur de Cranberry concentré 50:1. Empêche les bactéries de s'accrocher aux parois urinaires et prévient les récidives.
              </p>
            </div>

            {/* Bénéfice 3 */}
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Activity className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Digestion & Ventre Plat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                300 mg de prébiotiques (FOS + Inuline). Nourrit les bonnes bactéries intestinales, réduit les ballonnements et affine la taille.
              </p>
            </div>

            {/* Bénéfice 4 */}
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Apple className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Immunité & Énergie</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                20 mg de Vitamine C antioxydante. Protège les cellules contre le stress oxydatif et stimule les défenses naturelles de la femme active.
              </p>
            </div>

          </div>
        </section>

        {/* ── 9. SECTION VISUELLE : LE DÉCLIC PRÉVENTION (IMAGE MÉTAPHORE) ── */}
        <section className="bg-white rounded-3xl border border-rose-100 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 shadow-sm">
              <Image
                src="/images/probiotic-gummies-metaphore.jpg"
                alt="Pourquoi attendre un problème pour prendre soin de ton équilibre intime ?"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                <Heart className="w-3.5 h-3.5" />
                <span>La Prévention Quotidienne</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Tu n'attends pas d'avoir mal aux dents pour te brosser les dents.
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pourquoi attendre des démangeaisons intolérables, des pertes désagréables ou des brûlures pour agir ?
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700"><strong>2 gummies par jour seulement :</strong> une routine ultra-simple et plaisante intégrée au réveil.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700"><strong>Protection 24h/24 :</strong> un bouclier biologique continu contre les bactéries indésirables.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700"><strong>Zéro contrainte :</strong> se mâche n'importe où, sans eau et sans saveur médicamenteuse.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Prendre soin de mon équilibre (14 900 F)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ── 10. SECTION FORMULE SCIENTIFIQUE : 6 SOUCHES PROBIOTIQUES ── */}
        <section className="bg-white rounded-3xl border border-rose-100 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Expertise Microbiote</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              6 souches probiotiques ciblées pour la santé féminine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Chaque souche a été sélectionnée pour sa capacité à coloniser efficacement la flore vaginale et intestinale.
            </p>
          </div>

          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 shadow-sm max-w-2xl mx-auto">
            <Image
              src="/images/probiotic-gummies-formule-6souches.jpg"
              alt="6 souches probiotiques pour l'équilibre féminin : Probiotiques + Prébiotiques + Cranberry + Vit C"
              fill
              className="object-contain p-2 sm:p-4"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
              <p className="text-xs font-bold text-rose-900">L. acidophilus (1 Md CFU)</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">Maintient le pH acide naturel et bloque la prolifération des levures et mycoses.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
              <p className="text-xs font-bold text-rose-900">L. crispatus (500M CFU)</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">La souche dominante d'un vagin en parfaite santé. Protège l'écosystème intime.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
              <p className="text-xs font-bold text-rose-900">L. rhamnosus (500M CFU)</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">Soutient la barrière urogénitale et empêche les bactéries de remonter vers la vessie.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
              <p className="text-xs font-bold text-rose-900">L. reuteri (500M CFU)</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">Produit des substances antimicrobiennes naturelles pour apaiser les irritations.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
              <p className="text-xs font-bold text-rose-900">L. gasseri (500M CFU)</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">Contribue au bien-être digestif, à l'assimilation et à l'équilibre global féminin.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
              <p className="text-xs font-bold text-rose-900">B. coagulans (2 Mds CFU)</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">Ultra-résistant à l'acidité gastrique pour régénérer le microbiote intestinal.</p>
            </div>
          </div>
        </section>

        {/* ── 11. BÉNÉFICES COMPARATIFS : SOLUTIONS CLASSIQUES VS GUMMIES ── */}
        <section className="bg-white rounded-3xl border border-rose-100 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi ces gummies changent tout</h3>
            <p className="text-xs sm:text-sm text-slate-500">Une différence majeure avec les solutions agressives ou contraignantes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Solutions Classiques */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Gélules & Ovules classiques</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Gélules sèches difficiles à avaler, goût amer et désagréable.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Ovules inconfortables qui coulent et tachent les sous-vêtements.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Agissent seulement de façon temporaire sans rééquilibrer le terrain en profondeur.</span>
                </li>
              </ul>
            </div>

            {/* Gummies Isivente */}
            <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-200/80 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                <span>Gummies Probiotiques Isivente</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span>Délicieux bonbons fruités au goût naturel de cranberry, sans aucun sucre ajouté.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span>Agit de l'intérieur en continu sur la flore vaginale, urinaire et digestive.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✓</span>
                  <span>Zéro contrainte : 2 gummies par jour pour une fraîcheur et une confiance retrouvées.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── 12. SECTION LIFESTYLE & NOMADE (IMAGE FEMME ACTIVE) ── */}
        <section className="bg-white rounded-3xl border border-rose-100 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            <div className="space-y-4 order-2 md:order-1">
              <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Femme Active & Sereine</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Prendre soin de soi ne devrait pas être compliqué.
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Entre les réunions, les déplacements, les enfants et le quotidien chargé, vous méritez une routine bien-être qui s'adapte à votre rythme sans contrainte.
              </p>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs text-rose-950 font-medium leading-relaxed">
                Glissez votre sachet hermétique dans votre sac à main. Prenez vos 2 gummies au bureau ou après le déjeuner en savourant leur goût fruité.
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Commander maintenant (14 900 FCFA)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 shadow-sm order-1 md:order-2">
              <Image
                src="/images/probiotic-gummies-lifestyle.jpg"
                alt="Femme active prenant soin de son équilibre avec les gummies probiotiques"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>

          </div>
        </section>

        {/* ── 13. AVIS CLIENTS VÉRIFIÉS (NOTE 4.9/5) ── */}
        <section className="bg-white rounded-3xl border border-rose-100 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-900 ml-1.5">4.9 / 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Témoignages de femmes ayant retrouvé leur sérénité
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Avis authentiques collectés après livraison et utilisation à Cotonou et partout au Bénin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div key={idx} className="bg-rose-50/30 rounded-2xl p-4 border border-rose-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{rev.name}</p>
                    <p className="text-[10px] text-slate-500">{rev.location}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Vérifié</span>
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">{rev.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-rose-100 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="text-center space-y-1 pb-2">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Réponses & Transparence</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Questions Fréquentes</h2>
          </div>

          <div className="space-y-2">
            {FAQS_DATA.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-rose-100 rounded-xl overflow-hidden transition-colors">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left bg-white hover:bg-rose-50/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? "rotate-180 text-rose-600" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-4 sm:px-4 text-xs text-slate-600 leading-relaxed border-t border-rose-50 pt-2 bg-rose-50/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 15. FOOTER OFFICIEL ── */}
        <footer className="text-center pt-8 border-t border-rose-100 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
            </div>
            <span className="font-bold text-xs tracking-tight text-slate-900">ISIVENTE BÉNIN</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Boutique officielle e-commerce au Bénin. Tous droits réservés. Service client disponible 7j/7 au +229 01 92 90 18 17.
          </p>
        </footer>

      </main>

      {/* ── 16. BARRE MOBILE STICKY CTA ── */}
      <StickyMobileCtaBar
        price={14900}
        accentColor="#e11d48"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander les Gummies Probiotiques Équilibre Féminin à 14 900 FCFA avec livraison à domicile."
      />

    </div>
  );
}
