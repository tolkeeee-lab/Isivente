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
  Zap,
  PackageCheck,
  ArrowRight,
  Wind,
  Compass,
  Car,
  Flame,
  Award,
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
    name: "Chargeur Allume-Cigare Rétractable 5-en-1 Starlight™",
    subtitle: "Coffret complet avec boîtier rotatif 180°, 2 câbles rétractables, 3 flacons de parfum et projection ciel étoilé",
    price: 16900,
    originalPrice: 25000,
    savings: 8100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/chargeur-retractable/visuel_coffret_starlight_reel.jpg",
    alt: "Coffret officiel Starlight Car Charger 5 en 1 déballé avec ses 3 flacons",
  },
  {
    src: "/images/chargeur-retractable/visuel_laser_ciel_etoile.jpg",
    alt: "Projection laser ciel étoilé rouge au plafond de la voiture",
  },
  {
    src: "/images/chargeur-retractable/visuel_5en1_coffret_aromes.jpg",
    alt: "Accessoire 5 en 1 : projection étoilée, diffuseur de parfum, recharge rapide, LED RGB et 3 arômes inclus",
  },
  {
    src: "/images/chargeur-retractable/visuel_3en1_presentation.jpg",
    alt: "Câbles rétractables intégrés, diffuseur de parfum ultrasonique et éclairage cristal RGB",
  },
  {
    src: "/images/chargeur-retractable/visuel_vtc_yango.jpg",
    alt: "Spécial Chauffeurs VTC, Yango et Taxis : l'accessoire qui fait la différence avec vos passagers",
  },
  {
    src: "/images/chargeur-retractable/visuel_petit_luxe.jpg",
    alt: "Le petit luxe qui change vos trajets au quotidien",
  },
  {
    src: "/images/chargeur-retractable/visuel_espace_agreable.jpg",
    alt: "Transformez votre habitacle automobile en un espace agréable et raffiné",
  },
  {
    src: "/images/chargeur-retractable/visuel_voiture_parfumee.jpg",
    alt: "Diffusion de parfum longue durée et ambiance lumineuse élégante",
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
    name: "Marcel D.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le meilleur investissement pour mon activité de chauffeur VTC",
    comment:
      "Je fais du VTC à Cotonou et Calavi. Mes clients sont bluffés dès qu'ils montent le soir : le parfum sent super bon, les câbles se déroulent et se remettent en place d'un coup sec, et le ciel étoilé au plafond fait un effet bœuf ! Mes pourboires ont augmenté dès la première semaine.",
    verified: true,
  },
  {
    name: "Gérard A.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Plus aucun câble qui traîne sur la console centrale",
    comment:
      "J'avais toujours 3 câbles enchevêtrés entre le levier de vitesse et le frein à main. Avec le Starlight, tout est propre et rangé. La tête s'oriente à 180° pour ne pas gêner. Les 3 petits flacons fournis durent vraiment longtemps.",
    verified: true,
  },
  {
    name: "Sandrine T.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Fini les odeurs d'humidité et de climatisation",
    comment:
      "La brumisation est subtile et continue, la voiture sent le frais et le propre dès qu'on met le contact. Les enfants adorent les étoiles rouges au plafond quand on roule la nuit. Livré en 24h et testé devant le livreur avant de payer.",
    verified: true,
  },
  {
    name: "Faustin K.",
    location: "Parakou",
    rating: 5,
    date: "Achat vérifié",
    title: "Charge très rapide même avec Waze et la clim allumée",
    comment:
      "Recharge rapide conforme pour mon iPhone et le Samsung de ma femme en même temps. Aucun surchauffe, l'appareil est robuste et bien fini. Rapport qualité-prix imbattable à 16 900 F.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Ce chargeur convient-il à toutes les voitures ?",
    a: "Oui, à 100%. Il se branche sur n'importe quelle prise allume-cigare standard 12V ou 24V. Il est donc parfaitement compatible avec toutes les berlines, SUV, 4x4, camionnettes et taxis en circulation au Bénin.",
  },
  {
    q: "Quels types de téléphones peuvent être rechargés ?",
    a: "L'appareil intègre directement deux câbles rétractables de 80 cm : un câble Type-C (compatible Android modernes, iPhone 15/16, tablettes) et un câble Lightning pour iPhone. De plus, il dispose d'un port USB supplémentaire sur le dessus pour brancher un troisième câble au besoin.",
  },
  {
    q: "Comment fonctionne le diffuseur et combien de temps durent les flacons ?",
    a: "Le boîtier intègre un diffuseur ultrasonique d'arômes. Le coffret comprend 3 flacons d'essences parfumées offerts. Chaque flacon dure plusieurs semaines en utilisation quotidienne. Vous pouvez ensuite recharger le réservoir avec quelques gouttes de votre parfum ou huile essentielle préférée.",
  },
  {
    q: "Peut-on désactiver le laser ciel étoilé ou la lumière ?",
    a: "Oui, un bouton de commande situé sur le boîtier vous permet d'activer ou d'éteindre la projection laser étoilée et l'anneau lumineux RGB selon vos envies, tout en laissant la charge et le diffuseur fonctionner.",
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée en 24h à Cotonou, Calavi, Porto-Novo et partout au Bénin. Vous ne payez rien à l'avance : vous ouvrez le colis, vérifiez l'appareil et réglez les 16 900 FCFA en espèces au livreur après confirmation.",
  },
];

export default function StarlightLanding({ slug = "starlight-chargeur" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const utm = useUTM();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Pilier 3 : Défilement automatique du carrousel avec pause au survol
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
        product_slug: slug,
        product_title: "Chargeur Allume-Cigare Rétractable 5-en-1 Starlight™",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle, slug]);

  // Meta Pixel ViewContent
  useEffect(() => {
    trackViewContent({
      content_name: "Chargeur Allume-Cigare Rétractable 5-en-1 Starlight™",
      content_ids: [slug, "starlight", "chargeur-retractable"],
      value: 16900,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Chargeur Allume-Cigare Rétractable 5-en-1 Starlight™",
      content_ids: [slug],
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
        product_title: "Chargeur Allume-Cigare Rétractable 5-en-1 Starlight™",
        product_slug: slug,
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

      markLeadConverted(customerPhone.trim(), slug);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "isivente_last_purchase_meta",
          JSON.stringify({
            title: "Chargeur Allume-Cigare Rétractable 5-en-1 Starlight™",
            price: selectedBundle.price,
            quantity: 1,
          })
        );
      }

      const successUrl = `/p/${slug}/success?order=${encodeURIComponent(
        order.order_number || ""
      )}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(
        customerPhone.trim()
      )}&total=${selectedBundle.price}`;
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
          <span>
            Livraison express 24h partout au Bénin • Paiement en espèces à la livraison après test complet
          </span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Zap className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(217,119,6,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-amber-100 text-[11px]">(16 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Innovation Automobile 5-en-1</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Fini les câbles emmêlés et les <span className="text-amber-600">mauvaises odeurs</span> dans votre voiture.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Recharge rapide rétractable, diffuseur d'arômes haute précision avec 3 parfums inclus, anneau cristal RGB et projection laser ciel étoilé dans un seul boîtier rotatif 180°.
          </p>
        </div>

        {/* ── 5. CARROUSEL AUTO-DÉFILANT ÉPURÉ (Pilier 3) ── */}
        <div
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="max-w-[520px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4 space-y-3"
        >
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-inner flex items-center justify-center">
            <Image
              src={CAROUSEL_IMAGES[activeImgIndex]?.src}
              alt={CAROUSEL_IMAGES[activeImgIndex]?.alt}
              fill
              priority={activeImgIndex === 0}
              className="object-contain p-1 sm:p-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              sizes="(max-width: 768px) 100vw, 520px"
            />

            {/* Pastille Prix Officiel Discrète */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                16 900 FCFA
              </span>
            </div>

            {/* Boutons navigation carrousel */}
            <button
              type="button"
              onClick={() =>
                setActiveImgIndex(
                  (prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length
                )
              }
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Miniatures / Dots de repère */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  activeImgIndex === idx
                    ? "w-6 h-2 bg-amber-600"
                    : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Aller à la vue ${idx + 1}`}
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
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 16 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Remplacement direct si souci</p>
            </div>
          </div>
        </div>

        {/* ── 7. PILIER 2 : FORMULAIRE DE COMMANDE COD IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
              {orderError}
            </div>
          )}
          <UmeiStyleOrderSection
            productSlug={slug}
            productTitle="Chargeur Allume-Cigare Rétractable 5-en-1 Starlight™"
            productImage="/images/chargeur-retractable/visuel_coffret_starlight_reel.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Starlight Chargeur - ${b.name}`,
                content_ids: [slug, b.id || "solo"],
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
            accentColor="#D97706"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. 4 FONCTIONS MAJEURES DU STARLIGHT 5-EN-1 ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Polyvalence Ultime</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              5 fonctionnalités d'exception réunies dans un seul boîtier
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Chaque détail a été pensé pour allier confort de conduite, propreté totale et ambiance de salon VIP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Fonction 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Zap className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">2 Câbles Rétractables Anti-Nœuds</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tirez jusqu'à 80 cm pour brancher votre téléphone. Une simple traction suffit pour qu'ils se réenroulent tout seuls. Zéro fil qui traîne sur votre tableau de bord.
              </p>
            </div>

            {/* Fonction 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Wind className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Diffuseur d'Arômes + 3 Flacons Offerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diffusion ultrasonique rafraîchissante. Élimine les odeurs de renfermé, de sueur ou de climatisation en quelques secondes. 3 essences parfumées incluses.
              </p>
            </div>

            {/* Fonction 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Projection Laser Ciel Étoilé</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transformez le plafond de votre véhicule en une voûte céleste féerique dès la nuit tombée. Vos passagers et enfants vont adorer l'ambiance apaisante.
              </p>
            </div>

            {/* Fonction 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Compass className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Tête Rotative 180° & Anneau Cristal RGB</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                La tête articulée s'oriente sous n'importe quel angle pour ne jamais bloquer vos porte-gobelets ni votre levier. L'anneau cristal multicolore indique la tension en temps réel.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. SECTION DÉMONSTRATION VIDÉO EN ACTION RÉELLE (PILIER 4 AUTOPLAY) ── */}
        <section id="demo-video" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Vidéo Démonstration Réelle</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Découvrez le Starlight 5-en-1 en action dans le véhicule
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Voyez comment les câbles se déroulent et s'enroulent d'une main, et la projection du ciel étoilé illuminer l'habitacle.
            </p>
          </div>

          <div className="relative max-w-sm sm:max-w-md mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md">
            <video
              src="/videos/chargeur-retractable-demo.mp4"
              poster="/videos/chargeur-retractable-cover.jpg"
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander maintenant (16 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Fini le bazar des chargeurs ordinaires</h3>
            <p className="text-xs sm:text-sm text-slate-500">Pourquoi tous les conducteurs avertis adoptent le Starlight™</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chargeur Classique */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Chargeur allume-cigare standard</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Fils emmêlés partout sur le levier de vitesse et risque d'accident en cherchant son câble en conduisant.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Câbles bon marché qui se cassent au bout de 2 semaines ou ne chargent pas vite.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Odeurs persistantes de chaleur, sueur et poussière emprisonnées dans l'habitacle.</span>
                </li>
              </ul>
            </div>

            {/* Chargeur Starlight 5-en-1 */}
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Chargeur Starlight™ 5-en-1</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>Câbles rétractables intégrés</strong> : tirez, branchez et relâchez, la console reste impeccable.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>3 arômes inclus</strong> : assainit l'air et procure une sensation d'habitacle neuf.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span><strong>Laser étoilé & LED RGB</strong> : donne immédiatement un look futuriste et luxueux à votre voiture.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 11. SECTION SPÉCIALE CHAUFFEURS VTC, YANGO & TAXIS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-5">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 aspect-square relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
              <Image
                src="/images/chargeur-retractable/visuel_vtc_yango.jpg"
                alt="Chauffeurs VTC, Yango et Taxis au Bénin"
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 380px"
              />
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                <Car className="w-3.5 h-3.5 text-amber-600" />
                <span>Spécial Professionnels de la Route</span>
              </div>

              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                L'accessoire qui fait la différence avec vos clients
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Vous conduisez pour <strong>Yango, Gozem, en taxi ou en VTC privé</strong> ? Vos passagers demandent constamment à recharger leur téléphone. Avec le Starlight 5-en-1, offrez-leur un accueil digne d'une berline de luxe :
              </p>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Câble Type-C et iPhone immédiatement disponibles pour le passager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Voiture toujours fraîche qui dissipe la sueur et les odeurs urbaines</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ambiance ciel étoilé qui déclenche des commentaires élogieux et des 5 étoiles</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 12. SECTION COFFRET OFFICIEL & UNBOXING RÉEL ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Coffret 100% Officiel</span>
            <h3 className="font-bold text-slate-900 text-base sm:text-xl">
              Ce que vous recevez dans votre colis
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Chaque boîte est inspectée et testée avant expédition. Vous vérifiez le contenu avant de payer.
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/chargeur-retractable/visuel_coffret_starlight_reel.jpg"
              alt="Déballage réel du coffret Starlight Car Charger 5 in 1"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 440px"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-900 block">1x Boîtier Starlight</span>
              <span className="text-slate-500 text-[10px]">Rotatif 180°</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-900 block">2x Câbles Rétractables</span>
              <span className="text-slate-500 text-[10px]">Type-C + Lightning</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-900 block">3x Flacons d'Arômes</span>
              <span className="text-slate-500 text-[10px]">Essences offertes</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-900 block">1x Manuel & Boîte</span>
              <span className="text-slate-500 text-[10px]">Garantie Isivente</span>
            </div>
          </div>
        </section>

        {/* ── 13. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-amber-950/10">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente Bénin
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Starlight™ 5-en-1
            </h4>
            <p className="text-amber-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">16 900 FCFA</strong> au lieu de{" "}
              <span className="line-through opacity-75">25 000 FCFA</span>.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-amber-900 font-bold text-sm rounded-xl hover:bg-amber-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Commander maintenant (16 900 F)
          </button>
        </div>

        {/* ── 14. SECTION AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-slate-800 font-bold text-sm ml-1.5">4.9/5</span>
              <span className="text-slate-500 text-xs">(Avis conducteurs vérifiés au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clients</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* ── 15. SECTION FAQ INTERACTIVE ── */}
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
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-amber-700 transition-colors">
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

        {/* ── 16. FOOTER OFFICIEL ISIVENTE ── */}
        <footer className="text-center text-xs text-slate-400 space-y-2 pt-6 border-t border-slate-200">
          <p>© {new Date().getFullYear()} ISIVENTE Bénin - Tous droits réservés.</p>
          <p className="text-[11px]">Boutique officielle de distribution e-commerce au Bénin. Service client disponible 7j/7.</p>
        </footer>
      </main>

      {/* ── 17. BARRE MOBILE STICKY CTA (PILIER 1 & 2) ── */}
      <StickyMobileCtaBar
        price={16900}
        targetSectionId="commander"
        accentColor="#D97706"
        buttonText="Commander (16 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Chargeur Allume-Cigare Rétractable 5-en-1 Starlight à 16 900 FCFA."
      />
    </div>
  );
}

