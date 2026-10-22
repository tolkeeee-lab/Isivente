"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Calendar,
  Gift,
  PackageCheck,
  ArrowRight,
  Eye,
  Infinity,
  Leaf,
  Layers,
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
    name: "Calendrier Perpétuel Décoratif 3D Magnétique",
    subtitle: "Objet de décoration intemporel • Billes magnétiques, anneau rotatif et socle stable",
    price: 24900,
    originalPrice: 39000,
    savings: 14100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/calendrier-3d/calendrier-3d-hero-colors.jpg",
    alt: "Calendrier Décoratif 3D - Disponible en Noir, Blanc et Vert",
    caption: "Un objet unique qui allie décoration moderne et apprentissage du temps",
  },
  {
    src: "/images/calendrier-3d/calendrier-3d-fascinant-mecanisme.jpg",
    alt: "Mécanisme magnétique fascinant à regarder",
    caption: "Fascinant à regarder ! Un mécanisme simple et ingénieux pour un calendrier toujours à jour",
  },
  {
    src: "/images/calendrier-3d/calendrier-3d-intrigue-embellit.jpg",
    alt: "Un objet qui intrigue et embellit votre intérieur",
    caption: "Plus qu'un simple calendrier, une véritable pièce de décoration moderne",
  },
  {
    src: "/images/calendrier-3d/calendrier-3d-style-espace.jpg",
    alt: "Apporte du style à votre espace de travail ou maison",
    caption: "Un design épuré parfait pour embellir votre bureau, salon ou table d'entrée",
  },
  {
    src: "/images/calendrier-3d/calendrier-3d-eternel-perpetuel.jpg",
    alt: "Calendrier éternel perpétuel utilisable toute la vie",
    caption: "Pas besoin de le changer chaque année : un objet perpétuel pour aujourd'hui et toujours",
  },
  {
    src: "/images/calendrier-3d/calendrier-3d-un-seul-achat.jpg",
    alt: "Un seul achat pour des années d'utilisation",
    caption: "Économique, écologique et intemporel — un achat unique amorti sur des années",
  },
  {
    src: "/images/calendrier-3d/calendrier-3d-comparatif-classique.jpg",
    alt: "Comparatif calendrier classique vs calendrier décoratif 3D",
    caption: "Bien plus qu'un simple calendrier : un objet utile, décoratif et qui attire le regard",
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
    name: "Marc-Aurèle D.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le détail qui change tout sur mon bureau de direction",
    comment: "Je cherchais une pièce originale pour mon bureau. Tous mes collègues et visiteurs s'arrêtent pour regarder comment la bille magnétique tient et comment l'anneau tourne. C'est à la fois zen, élégant et ultra pratique.",
    verified: true,
  },
  {
    name: "Aurore T.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Offert en cadeau à mon époux, il a adoré !",
    comment: "Cadeau d'anniversaire parfait pour quelqu'un qui a déjà tout. La finition noire avec la barre rouge est très chic. Le rituel du matin de déplacer la bille est devenu un vrai plaisir pour lui.",
    verified: true,
  },
  {
    name: "Bernardin K.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Fini les calendriers en carton moches chaque année",
    comment: "C'est un investissement pour toute la vie. L'objet est solide, stable, et ne prend pas de place inutile. Livré en moins de 24h à Porto-Novo, j'ai vérifié le colis avant de payer.",
    verified: true,
  },
  {
    name: "Christelle N.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Magnifique objet de décoration pour le salon",
    comment: "Posé sur le meuble de l'entrée, c'est la première chose que les invités remarquent. Le design minimaliste est superbe. Très satisfaite du service Isivente !",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Comment fonctionne le système de date et de mois ?",
    a: "Le principe est aussi ingénieux que simple : faites pivoter l'anneau circulaire pour aligner le repère sur le mois en cours (de JAN à DEC). Pour le jour, faites simplement glisser la bille magnétique sur la réglette rouge graduée de 1 à 31. La bille reste parfaitement en position grâce à l'aimantation interne.",
  },
  {
    q: "Quelles sont les dimensions et la matière du calendrier ?",
    a: "Le calendrier mesure environ 23 cm de diamètre et 28 cm de largeur totale (avec la réglette des jours). Il est conçu dans un polymère technique haute densité avec finition satinée mate, billes métalliques polies et barre centrale renforcée avec double pied stabilisateur.",
  },
  {
    q: "Quelles sont les couleurs disponibles ?",
    a: "Le produit est disponible en Noir Mat (avec barre rouge contrastée), Blanc Épuré et Vert Moderne. Lors de votre confirmation téléphonique après commande, notre équipe validera votre préférence de couleur selon les stocks disponibles.",
  },
  {
    q: "Est-ce réellement utilisable pour toujours sans pile ni recharge ?",
    a: "Absolument ! Il fonctionne à 100% de manière mécanique et magnétique. Aucune pile, aucun câble, aucune batterie. Il ne s'arrête jamais et ne tombera jamais en panne.",
  },
  {
    q: "Comment se déroule la livraison et le règlement au Bénin ?",
    a: "La livraison s'effectue en 24h à Cotonou, Calavi et partout au Bénin. Vous ne payez rien en avance : vous réglez les 24 900 FCFA directement au livreur, uniquement après avoir ouvert le colis et vérifié votre calendrier.",
  },
];

export default function Calendrier3DLanding({ slug = "calendrier-3d" }: { slug?: string }) {
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

  // Auto-défilement carrousel (Pilier 3)
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
        city,
        address,
        product_slug: "calendrier-3d",
        product_title: "Calendrier Perpétuel Décoratif 3D Magnétique",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Calendrier Perpétuel Décoratif 3D Magnétique",
      content_ids: ["calendrier-3d", "calendrier-perpetuel"],
      value: 24900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Calendrier Perpétuel Décoratif 3D Magnétique",
      content_ids: ["calendrier-3d"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    trackInitiateCheckout({
      content_name: "Calendrier Perpétuel Décoratif 3D Magnétique",
      content_ids: ["calendrier-3d"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    const el = document.getElementById("commander");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
        product_title: "Calendrier Perpétuel Décoratif 3D Magnétique",
        product_slug: "calendrier-3d",
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

      markLeadConverted(customerPhone.trim(), "calendrier-3d");

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "isivente_last_purchase_meta",
          JSON.stringify({
            title: "Calendrier Perpétuel Décoratif 3D Magnétique",
            price: selectedBundle.price,
            quantity: 1,
          })
        );
      }

      const successUrl = `/p/calendrier-3d/success?order=${encodeURIComponent(
        order.order_number || ""
      )}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(
        customerPhone.trim()
      )}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* ── 1. BANDEAU TOP BAR ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>
            Livraison express 24h partout au Bénin • Paiement en espèces à la livraison après inspection
          </span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Calendar className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>
          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.97] rounded-xl shadow-sm transition-all duration-100 cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-rose-300 text-[11px]">(24 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Design Sculptural & Mécanisme Magnétique Perpétuel</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Bien plus qu'un simple calendrier : une pièce d'art{" "}
            <span className="text-rose-600">intemporelle</span>.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Un objet unique et fascinant qui allie décoration moderne, équilibre magnétique et rituel quotidien du temps. Utilisable toute la vie sans jamais s'altérer.
          </p>
        </div>

        {/* ── 5. CARROUSEL HERO AUTO-DÉFILANT (Pilier 3) ── */}
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

            {/* Indicateur compteur */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-md z-10">
              {activeImgIndex + 1} / {CAROUSEL_IMAGES.length}
            </div>

            {/* Prix badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-flex items-center gap-1 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                24 900 FCFA
              </span>
            </div>

            {/* Boutons navigation */}
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
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Légende */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 via-slate-900/50 to-transparent p-3 sm:p-4 text-white text-xs sm:text-sm font-medium z-10 text-center">
              <p className="line-clamp-1">{CAROUSEL_IMAGES[activeImgIndex]?.caption}</p>
            </div>
          </div>

          {/* Miniatures */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImgIndex === idx
                    ? "border-rose-600 ring-2 ring-rose-600/20"
                    : "border-slate-200 opacity-55 hover:opacity-90"
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE (Pilier 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & tout le Bénin</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 24 900 F après inspection</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Remplacement immédiat si souci</p>
            </div>
          </div>
        </div>

        {/* ── 7. FORMULAIRE DE COMMANDE COD IMMÉDIAT (Pilier 2) ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug="calendrier-3d"
            productTitle="Calendrier Perpétuel Décoratif 3D Magnétique"
            productImage="/images/calendrier-3d/calendrier-3d-hero-colors.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Calendrier 3D - ${b.name}`,
                content_ids: ["calendrier-3d", b.id || "solo"],
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
            accentColor="#e11d48"
            onSubmit={handleOrderSubmit}
          />
        </div>

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pourquoi ce calendrier séduit au premier regard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              L'alliance d'une ingénierie magnétique épurée et d'un design intemporel d'exception.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Infinity className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Perpétuel & Utilisable Toute la Vie</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plus besoin d'acheter ou de jeter un calendrier en papier chaque année. Ce calendrier ne devient jamais obsolète : aujourd'hui, dans 5 ans ou dans 20 ans, il reste parfaitement exact.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Eye className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Fascinant & Décoratif</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le contraste entre l'anneau noir mat, la réglette des jours et la bille magnétique crée un effet visuel immédiat. Il sublime instantanément un bureau professionnel ou un salon moderne.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <Leaf className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">100% Écologique & Zéro Déchet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zéro papier gaspillé, zéro déchet à chaque nouvel an. Un seul achat durable conçu dans des matériaux résistants qui ne se décolorent pas avec le temps.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Gift className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Le Cadeau Idéal Qui Démarque</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous cherchez un cadeau raffiné pour un anniversaire, un départ, un collègue ou un proche ? Ce calendrier est l'objet rare qui surprend, séduit et dont on se souvient toujours.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. INFOGRAPHIE MÉCANISME & ZOOM VISUEL ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Ingénierie & Simplicité
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Un mécanisme simple et fascinant en 3 gestes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
              <img
                src="/images/calendrier-3d/calendrier-3d-fascinant-mecanisme.jpg"
                alt="Détails mécanisme calendrier magnétique 3D"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Choisissez le mois</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Tournez doucement l'anneau rotatif supérieur pour positionner le repère sur le mois actuel (de JAN à DEC).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Glissez le jour</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Faites simplement glisser la bille magnétique sur la réglette graduée du 1er au 31. La force magnétique la maintient stable en place.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Profitez, pour toujours</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Un objet design sculptural posé sur deux billes de stabilisation qui reste majestueux année après année sans s'user.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Commander mon Calendrier 3D (24 900 F)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS (Classique vs 3D Isivente) ── */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Calendriers classiques vs Calendrier Décoratif 3D
            </h2>
            <p className="text-xs text-slate-500">
              Pourquoi continuer à acheter des calendriers jetables ?
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3.5 sm:p-4">Critère</th>
                  <th className="p-3.5 sm:p-4 text-slate-400">Calendrier Papier Classique</th>
                  <th className="p-3.5 sm:p-4 bg-rose-50/60 text-rose-900 font-extrabold">
                    Calendrier Décoratif 3D
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {[
                  ["Durée de vie", "12 mois puis poubelle", "Utilisable toute la vie"],
                  ["Valeur décorative", "Papier sans charme", "Véritable pièce d'art moderne"],
                  ["Impact écologique", "Déchets papier chaque année", "100% Écologique, zéro déchet"],
                  ["Effet sur les visiteurs", "Inaperçu", "Attire instantanément le regard"],
                  ["Fonctionnement", "Feuilles à tourner ou arracher", "Mécanisme magnétique fluide"],
                  ["Potentiel cadeau", "Cadeau banal", "Cadeau prestigieux & mémorable"],
                ].map(([label, bad, good], idx) => (
                  <tr key={idx}>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900">{label}</td>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-1.5 text-rose-500">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>{bad}</span>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4 bg-rose-50/30">
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{good}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-md">
          <div className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 text-[11px] font-bold px-3 py-1 rounded-full border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offre Exclusive Isivente — Stock Limité</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Sublimez votre espace de vie dès aujourd'hui
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
            Seulement <span className="font-bold text-white">24 900 FCFA</span> au lieu de{" "}
            <span className="line-through text-slate-400">39 000 FCFA</span> avec livraison express 24h et paiement à la réception.
          </p>
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <span>Commander maintenant — 24 900 FCFA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── 12. AVIS CLIENTS VÉRIFIÉS ── */}
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {rev.date}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">« {rev.title} »</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-800">{rev.name}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 13. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="text-center space-y-1 pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Questions Fréquentes</h2>
            <p className="text-xs text-slate-500">
              Tout ce que vous devez savoir sur le Calendrier Perpétuel 3D.
            </p>
          </div>
          <div className="space-y-2 divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-2.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-rose-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === idx ? "rotate-180 text-rose-600" : ""
                    }`}
                  />
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

      {/* ── 14. FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-800 tracking-tight">ISIVENTE BÉNIN — Boutique Officielle</p>
        <p>Service client WhatsApp disponible 7j/7 pour le suivi de vos colis et assistance.</p>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Isivente. Tous droits réservés.
        </p>
      </footer>

      {/* ── 15. STICKY MOBILE CTA (Pilier 2) ── */}
      <StickyMobileCtaBar
        price={24900}
        targetSectionId="commander"
        accentColor="#e11d48"
        buttonText="Commander (24 900 F)"
      />
    </div>
  );
}
