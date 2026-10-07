"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2, 
  Sparkles,
  Leaf,
  Droplets,
  HeartHandshake,
  Check,
  Clock,
  ThumbsUp,
  Award,
  Zap,
  HelpCircle
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Savon Shampoing Purifiant Feuilles de Biota & Usma",
    subtitle: "Savon solide 100% naturel aux extraits de plantes ancestrales, formule purifiante et anti-chute",
    price: 10750,
    originalPrice: 17500,
    savings: 6750,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/savon-repousse/savon-slide-1.jpg", 
    alt: "De beaux cheveux commencent par un cuir chevelu sain - Savon Shampoing Solide Isivente",
    caption: "Formule purifiante 100% naturelle : apaise les irritations, élimine les pellicules et fortifie les racines"
  },
  { 
    src: "/images/savon-repousse/savon-slide-4.jpg", 
    alt: "Pourquoi ce savon a-t-il cette forme triangulaire ? Prise en main facile sous l'eau et mousse ultra-riche",
    caption: "Forme triangulaire brevetée : prise en main antidérapante, mousse riche et soin ciblé"
  },
  { 
    src: "/images/savon-repousse/savon-slide-5.jpg", 
    alt: "Soin ciblé et précis 100% naturel - Feuilles de Biota et Usma",
    caption: "Sans sulfates ni silicones agressifs : respecte la barrière lipidique naturelle du cuir chevelu"
  },
  { 
    src: "/images/savon-repousse/savon-pack.jpg", 
    alt: "Savon artisanal présenté dans son étui protecteur triangulaire Nature - Isivente",
    caption: "Coffret individuel hermétique avec notice de rituel de soin"
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

const REVIEWS_DATA: CustomerReview[] = [
  {
    name: "Christelle K.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes démangeaisons ont disparu dès le 2ème lavage !",
    comment: "Je souffrais énormément de démangeaisons au cuir chevelu après mes nattes et de pellicules tenaces. Ce savon mousse super bien et laisse une sensation de propreté et de fraîcheur incomparable. Mes racines respirent enfin !",
    verified: true,
  },
  {
    name: "Amina S.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes tempes se regarnissent visiblement",
    comment: "À cause des tresses trop serrées, mes tempes s'étaient éclaircies. Après 3 semaines d'utilisation régulière avec ce savon triangulaire, je vois les petits cheveux repousser. La forme en triangle est très pratique pour frotter précisément la zone !",
    verified: true,
  },
  {
    name: "Gérard M.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Testé pour la barbe et le crâne, très efficace",
    comment: "Je l'utilise pour mes cheveux et ma barbe qui avait des zones clairsemées. C'est 100% naturel, ça ne pique pas du tout et le savon dure longtemps. Livraison reçue le lendemain à Porto-Novo, payé au livreur.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "À quelle fréquence doit-on utiliser ce savon shampoing solide ?",
    a: "Vous pouvez l'utiliser 2 à 3 fois par semaine comme votre shampoing habituel. Faites glisser la barre directement sur vos cheveux mouillés par sections, massez le cuir chevelu avec la pulpe des doigts pour faire monter la mousse, laissez agir 2 minutes puis rincez abondamment à l'eau claire."
  },
  {
    q: "Convient-il aux cheveux crépus, frisés ou défrisés ?",
    a: "Oui, absolument ! La formule est enrichie en extraits botaniques doux (feuilles de biota et herbe d'usma) qui purifient sans assécher la fibre capillaire. Il est idéal pour les cheveux afros, tressés ou ayant subi des agressions chimiques."
  },
  {
    q: "Combien de temps dure un savon triangulaire ?",
    a: "Grâce à sa formule ultra-concentrée et compacte, un savon de 80-100g équivaut à environ 2 à 3 bouteilles de shampoing liquide classique, soit 1 à 2 mois d'utilisation régulière. Pensez à le conserver au sec entre deux utilisations."
  },
  {
    q: "Comment fonctionne la livraison et le paiement ?",
    a: "Vous commandez en toute sérénité sans rien payer d'avance. Notre livreur vous contacte et vous livre directement à domicile ou au bureau sous 24h à 48h partout au Bénin. Vous vérifiez le colis et réglez en espèces ou Mobile Money au livreur."
  }
];

export default function SavonRepousseLanding({ slug = "savon-repousse" }: { slug?: string }) {
  const router = useRouter();
  const utm = useUTM();
  const { recordInteraction } = usePagePresence(slug);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Auto-play du carrousel Hero (Pilier 3)
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  // Meta Pixel ViewContent
  useEffect(() => {
    trackViewContent({
      content_name: "Savon Shampoing Purifiant Feuilles de Biota & Usma",
      content_ids: [slug],
      value: BUNDLES[0].price,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Savon Shampoing Purifiant Feuilles de Biota & Usma",
      content_ids: [slug, selectedBundle.id || "solo"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: selectedBundle.quantity || 1,
    });
    trackInitiateCheckout({
      content_name: "Savon Shampoing Purifiant Feuilles de Biota & Usma",
      content_ids: [slug, selectedBundle.id || "solo"],
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
        product_slug: slug,
        product_title: selectedBundle.name,
        bundle_id: selectedBundle.id || "solo",
        bundle_name: selectedBundle.name,
        price: selectedBundle.price,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_phone2: customerPhone2.trim() || undefined,
        delivery_address: `${address.trim() || "Livraison à convenir"}, ${city}`,
        city: city,
        total_price: selectedBundle.price,
        quantity: 1,
        payment_method: "cash_on_delivery",
        status: "pending",
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
      });

      trackPurchase({
        order_id: order?.id || `order_${Date.now()}`,
        content_name: selectedBundle.name,
        content_ids: [slug, selectedBundle.id || "solo"],
        value: selectedBundle.price,
        currency: "XOF",
        num_items: 1,
      });

      await markLeadConverted(customerPhone.trim(), slug);
      router.push(`/p/${slug}/success?order=confirmed&amount=${selectedBundle.price}`);
    } catch (err) {
      console.error(err);
      setOrderError("Une erreur est survenue lors de l'enregistrement de votre commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ── BANDEAU D'ANNONCE OFFICIEL ── */}
      <div className="bg-emerald-800 text-white text-xs sm:text-sm py-2 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse shrink-0" />
        <span>RITUEL CAPILLAIRE NATUREL : PAIEMENT EN ESPÈCES À LA LIVRAISON PARTOUT AU BÉNIN SOUS 24H</span>
      </div>

      {/* ── HEADER / NAVIGATION ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-2xs">
              IS
            </span>
            <div>
              <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight block leading-tight">
                Isivente
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                Boutique Officielle Bénin
              </span>
            </div>
          </div>
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>Commander</span>
            <span className="bg-emerald-900/60 text-emerald-100 text-[11px] px-1.5 py-0.5 rounded-md font-extrabold">
              10 750 F
            </span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-10">

        {/* ── TITRE HERO ── */}
        <section className="text-center space-y-2.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>Formule 100% Naturelle — Feuilles de Biota & Usma</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-snug">
            De beaux cheveux commencent par <br className="hidden sm:inline" />
            <span className="text-emerald-700 underline decoration-emerald-300 underline-offset-4">un cuir chevelu sain</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Le savon-shampoing solide purifiant qui apaise les irritations, élimine les pellicules tenaces, régule le sébum et fortifie les racines dès les premiers lavages.
          </p>
        </section>

        {/* ── PILIER 3 : CARROUSEL HERO AUTO-DÉFILANT FIGMA-GRADE ── */}
        <section 
          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-5 shadow-xs"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          {/* Cadre de l'image principale */}
          <div className="relative aspect-square sm:aspect-4/3 w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
            <Image
              src={CAROUSEL_IMAGES[activeSlide].src}
              alt={CAROUSEL_IMAGES[activeSlide].alt}
              fill
              priority
              className="object-cover transition-opacity duration-500"
              sizes="(max-width: 768px) 100vw, 800px"
            />

            {/* Boutons de navigation manuelle */}
            <button
              onClick={() => setActiveSlide((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1))}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer z-10"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Badge d'index de slide */}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
              {activeSlide + 1} / {CAROUSEL_IMAGES.length}
            </div>
          </div>

          {/* Légende descriptive du slide actif */}
          <div className="mt-3 px-1 py-1.5 text-center">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
              {CAROUSEL_IMAGES[activeSlide].caption}
            </p>
          </div>

          {/* Miniatures interactives */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 mt-2">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`relative aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeSlide === idx 
                    ? "border-emerald-600 ring-2 ring-emerald-200 scale-95" 
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.src}
                  alt={`Miniature ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        {/* ── 3 BADGES DE RÉASSURANCE CRITIQUES (Sous le Hero) ── */}
        <section className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col items-center">
            <Truck className="w-5 h-5 text-emerald-700 mb-1" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-900 block">Livraison 24h</span>
            <span className="text-[9px] sm:text-[11px] text-slate-500">Partout au Bénin</span>
          </div>
          <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-emerald-700 mb-1" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-900 block">Test à Réception</span>
            <span className="text-[9px] sm:text-[11px] text-slate-500">Payez au livreur</span>
          </div>
          <div className="bg-white p-2.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col items-center">
            <Leaf className="w-5 h-5 text-emerald-700 mb-1" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-900 block">100% Végétal</span>
            <span className="text-[9px] sm:text-[11px] text-slate-500">Sans sulfates chimiques</span>
          </div>
        </section>

        {/* ── PILIER 2 : EMPLACEMENT PRIORITAIRE DU FORMULAIRE DE COMMANDE (COD) ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug={slug}
            productTitle="Savon Shampoing Purifiant Feuilles de Biota & Usma"
            productImage="/images/savon-repousse/savon-slide-1.jpg"
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
            accentColor="#15803d"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── LES 4 PILIERS D'ACTION DE LA FORMULE ── */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
              Efficacité Éprouvée
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Pourquoi vos cheveux vont l'adorer dès le premier jour
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                🌿
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Apaise les irritations & démangeaisons
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  L'extrait de feuille de Biota calme immédiatement les tiraillements, les cuirs chevelus échauffés par le soleil et les rougeurs causées par les coiffures serrées.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                💧
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Nettoie en profondeur et purifie
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  Déloge les impuretés, les résidus de pommades et le sébum accumulé sans décaper ni fragiliser le film hydrolipidique naturel protecteur.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                ✨
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Élimine les pellicules tenaces
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  Assainit le microbiome cutané et stoppe la prolifération des squames. Vos racines restent fraîches et légères plusieurs jours d'affilée.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                🌱
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Fortifie les racines & freine la chute
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  L'herbe d'Usma stimule les follicules pileux au niveau des tempes et de la raie. Les cheveux repoussent plus épais, denses et résistants à la casse.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ZOOM SUR LE DESIGN TRIANGULAIRE ── */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src="/images/savon-repousse/savon-slide-4.jpg"
                alt="Pourquoi cette forme triangulaire ?"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block">
                Ingénierie & Ergonomie
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                Pourquoi ce savon a-t-il une forme triangulaire unique ?
              </h2>
              <div className="space-y-3.5 text-slate-600 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    <strong className="text-slate-900">Prise en main antidérapante :</strong> Contrairement aux savons ronds ou rectangulaires qui glissent entre les doigts mouillés, les 3 arêtes triangulaires offrent une adhérence parfaite sous la douche.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    <strong className="text-slate-900">Mousse abondante & dense :</strong> Les angles créent plus de friction mécanique lors du passage sur le cuir chevelu, libérant une mousse riche et crémeuse en quelques secondes.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    <strong className="text-slate-900">Application de précision :</strong> Les pointes du triangle permettent de cibler directement les tempes dégarnies, la barbe ou la raie médiane avec une précision chirurgicale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MODE D'EMPLOI EN 3 ÉTAPES (IMAGES OFFICIELLES 1 À 3) ── */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
              Rituel Quotidien Facile
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Comment l'utiliser pour un résultat optimal
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              3 étapes simples sous la douche pour purifier le cuir chevelu et réveiller la vitalité de vos cheveux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Étape 1 */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <Image
                  src="/images/savon-repousse/etape-1-glisser.jpg"
                  alt="Étape 1 : Faites glisser la barre sur votre cuir chevelu"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Glisser sur cuir chevelu humide
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Passez le savon directement sur le cuir chevelu mouillé, par sections, pour déposer les actifs naturels.
                </p>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <Image
                  src="/images/savon-repousse/etape-2-masser.jpg"
                  alt="Étape 2 : Massez pendant 60 secondes"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Masser pendant 60 secondes
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Laissez les actifs naturels agir en massant doucement. La mousse riche nourrit les racines et déloge le sébum.
                </p>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <Image
                  src="/images/savon-repousse/etape-3-transformation.jpg"
                  alt="Étape 3 : Observez la transformation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Observez la transformation
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Rincez à l'eau claire. Cuir chevelu apaisé, cheveux légers, racines fortes et sensation de fraîcheur durable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Avis de nos clients au Bénin
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Retours vérifiés après 2 à 4 semaines d'utilisation régulière
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-extrabold text-slate-900 text-sm">4.9 / 5</span>
              <span className="text-xs text-slate-400">(+140 commandes livrées)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {rev.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                    {rev.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    « {rev.comment} »
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800">{rev.name}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ACCORDÉON ── */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs space-y-5">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
              Questions Fréquentes
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Tout ce que vous devez savoir avant de commander
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${openFaq === idx ? "rotate-180 text-emerald-600" : ""}`} />
                </button>
                {openFaq === idx && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── RAPPEL FORMULAIRE COD BAS DE PAGE ── */}
        <section className="text-center py-6 space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Prêt(e) à retrouver un cuir chevelu sain et fort ?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Commandez maintenant à <strong className="text-emerald-800 font-extrabold">10 750 FCFA</strong>. Livraison express à domicile sous 24h et paiement sécurisé en espèces à la réception.
          </p>
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-md transition-all cursor-pointer"
          >
            <span>Commander mon savon (10 750 FCFA)</span>
            <Zap className="w-4 h-4 text-amber-300" />
          </button>
        </section>

      </main>

      {/* ── PILIER 1 : STICKY MOBILE CTA BAR ── */}
      <StickyMobileCtaBar
        price={10750}
        targetSectionId="commander"
        accentColor="#15803d"
        buttonText="Commander (10 750 F)"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour ! Je souhaite commander le Savon Shampoing Purifiant Feuilles de Biota & Usma à 10 750 FCFA."
      />

      {/* ── FOOTER LÉGAL ÉPURÉ ── */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">Isivente Bénin — Distributeur Officiel Soins & Beauté</p>
          <p>© {new Date().getFullYear()} Tous droits réservés. Livraison sécurisée et garantie satisfait à réception.</p>
        </div>
      </footer>
    </div>
  );
}
