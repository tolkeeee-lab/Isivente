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
  Wind,
  Magnet,
  Sparkles,
  Zap,
  ArrowRight,
  Award,
  Check,
  DoorOpen,
  Home,
  CheckCheck,
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import { detectBeninCity } from "@/lib/cityUtils";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Pack Moustiquaire de Porte Magnétique Automatique™ (Prête à Poser)",
    subtitle: "Rideau complet à maille dense renforcée + Aimants magnétiques intégrés sur toute la hauteur + Rouleau de bande adhésive velcro ultra-résistante + Punaises de renfort offertes",
    price: 16900,
    originalPrice: 25000,
    savings: 8100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/moustiquaire-porte/hero-moustiquaire-porte-magnetique.jpg",
    alt: "Moustiquaire de Porte Magnétique - Profitez de l'air frais tout en gardant les moustiques dehors",
  },
  {
    src: "/images/moustiquaire-porte/comparatif-sans-avec-moustiquaire.jpg",
    alt: "Comparatif Sans Moustiquaire vs Avec Moustiquaire Magnétique Automatique",
  },
  {
    src: "/images/moustiquaire-porte/passage-mains-libres-courses.jpg",
    alt: "Passage mains libres facile même avec les bras chargés",
  },
  {
    src: "/images/moustiquaire-porte/fermeture-automatique-enfants-animaux.jpg",
    alt: "Fermeture automatique instantanée idéale pour les enfants et animaux",
  },
  {
    src: "/images/moustiquaire-porte/installation-facile-sans-percage-velcro.jpg",
    alt: "Installation facile et rapide sans perçage par bande auto-agrippante",
  },
  {
    src: "/images/moustiquaire-porte/porte-ouverte-protection-discrete.jpg",
    alt: "Laissez votre porte ouverte toute la journée avec une protection discrète",
  },
  {
    src: "/images/moustiquaire-porte/maison-saine-famille-enfants.jpg",
    alt: "Une maison saine et aérée pour toute la famille",
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
    name: "Clarisse A.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "On aère enfin le salon sans craindre les moustiques du soir !",
    comment:
      "À Cotonou, impossible de laisser la porte ouverte après 17h à cause des moustiques. Depuis qu'on a posé cette moustiquaire magnétique sur la porte du salon, la brise passe agréablement et aucun moustique ne rentre. La fermeture automatique avec les aimants est bluffante : les enfants passent et ça claque tout seul derrière eux.",
    verified: true,
  },
  {
    name: "Gaston H.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Posée en 5 minutes chrono sans aucun trou dans le mur",
    comment:
      "Je suis locataire donc je ne voulais pas percer le chambranle. Le velcro adhésif fourni tient solidement sans bouger. On traverse avec les plateaux du dîner sans avoir besoin des mains, la moustiquaire s'écarte et se referme parfaitement droite. Très bon investissement à 16 900 F.",
    verified: true,
  },
  {
    name: "Bernadette T.",
    location: "Porto-Novo (Ouédo)",
    rating: 5,
    date: "Achat vérifié",
    title: "Finis les sprays insecticides toxiques qui font tousser les enfants",
    comment:
      "On dépensait une fortune en bombes insecticides chaque mois et ça laissait une odeur étouffante dans la maison. Cette moustiquaire est une solution saine, écologique et définitive. Livrée en moins de 24h et vérifiée devant le livreur.",
    verified: true,
  },
  {
    name: "Sylvain M.",
    location: "Cotonou (Fidjrossè)",
    rating: 5,
    date: "Achat vérifié",
    title: "La maille est très fine et indéchirable",
    comment:
      "Le tissu est solide, les coutures renforcées et les aimants bien alignés du haut en bas. Même avec le chien qui fait des allers-retours entre le jardin et le salon, rien ne se déchire. Je recommande vivement pour tous les foyers.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Quelles sont les dimensions et est-ce compatible avec ma porte ?",
    a: "La moustiquaire mesure 100 cm de largeur par 210 cm de hauteur (dimensions universelles standard pour les portes d'entrée, portes de salon, balcons et portes de chambres au Bénin). Si votre cadre est légèrement plus étroit (ex: 90 cm), le tissu se rabat facilement sur le velcro sans gêner la fermeture.",
  },
  {
    q: "La moustiquaire se referme-t-elle réellement toute seule ?",
    a: "Oui, à 100% ! Une rangée d'aimants puissants est cousue sur toute la hauteur centrale. Lorsque vous passez (même les bras encombrés ou avec un plateau), la fente centrale s'ouvre sous votre pression et les aimants s'attirent immédiatement pour refermer le rideau hermétiquement derrière vous en une fraction de seconde.",
  },
  {
    q: "Faut-il percer des trous ou utiliser des vis pour l'installer ?",
    a: "Absolument aucun perçage ! L'installation se fait grâce à un rouleau de bande auto-agrippante adhésive (velcro) haute résistance inclus. Vous collez la bande sur le cadre de votre porte et vous appliquez la moustiquaire. C'est propre, amovible et parfait pour les locataires comme pour les propriétaires.",
  },
  {
    q: "La colle du velcro résiste-t-elle à la chaleur et à l'humidité du Bénin ?",
    a: "Oui. L'adhésif haute adhérence est conçu pour résister aux climats chauds et humides. De plus, un sachet de punaises de sécurité est également fourni dans le coffret pour les cadres en bois si vous souhaitez un ancrage encore plus inébranlable.",
  },
  {
    q: "Peut-on la laver ou la retirer facilement ?",
    a: "Oui. Comme elle est fixée sur velcro, vous pouvez détacher la moustiquaire en quelques secondes pour la secouer, la nettoyer à l'eau savonneuse ou la replier si vous voyagez, puis la repositionner sur le même velcro sans rien changer.",
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue en 24h à Cotonou, Calavi et Porto-Novo. Vous recevez votre colis à domicile ou au bureau, vous ouvrez le paquet pour vérifier la moustiquaire, et vous réglez les 16 900 FCFA directement au livreur en espèces.",
  },
];

export default function MoustiquairePorteLanding({ slug = "moustiquaire-porte" }: { slug?: string }) {
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
  const [city, setCity] = useState("");
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

  // Capture silencieuse du prospect dès 8 chiffres avec détection intelligente de la ville
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      const cityDetect = detectBeninCity(city, address, customerName);
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        city: cityDetect.detectedCity,
        address: address,
        product_slug: slug,
        product_title: "Moustiquaire de Porte Magnétique Automatique™",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      });
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle, slug]);

  // Pixel ViewContent
  useEffect(() => {
    trackViewContent({
      content_name: "Moustiquaire de Porte Magnétique Automatique™",
      content_category: "Maison & Protection Anti-Moustiques",
      content_ids: [slug, "moustiquaire-porte-magnetique"],
      value: selectedBundle.price,
      currency: "XOF",
    });
  }, [selectedBundle, slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Moustiquaire de Porte Magnétique Automatique™",
      content_ids: [slug],
      value: selectedBundle.price,
      currency: "XOF",
    });
    if (orderSectionRef.current) {
      orderSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      setOrderError("Veuillez renseigner votre nom, votre numéro et votre quartier.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");
    recordInteraction();

    const cityDetect = detectBeninCity(city, address, customerName);

    trackInitiateCheckout({
      content_name: selectedBundle.name,
      content_ids: [slug, selectedBundle.id || "solo"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: selectedBundle.quantity || 1,
    });

    try {
      const order = await saveNewOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_phone2: customerPhone2.trim() || undefined,
        city: cityDetect.detectedCity,
        address: address.trim(),
        product_title: "Moustiquaire de Porte Magnétique Automatique™",
        product_slug: slug,
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
        quantity: selectedBundle.quantity || 1,
        utm_source: utm?.utm_source || undefined,
        utm_medium: utm?.utm_medium || undefined,
        utm_campaign: utm?.utm_campaign || undefined,
      });

      markLeadConverted(customerPhone.trim(), slug);

      const successUrl = `/p/${slug}/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Erreur commande :", err);
      setOrderError(err.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FC] text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <aside
        aria-label="Annonce livraison"
        className="bg-emerald-50/90 border-b border-emerald-200/60 py-2 px-3 text-center text-xs font-semibold text-emerald-950 flex items-center justify-center gap-2"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          Livraison Express 24h à Cotonou, Calavi & Porto-Novo • <strong>Vérifiez à la réception avant de payer</strong>
        </span>
      </aside>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-950 uppercase">
              ISI<span className="text-emerald-600">VENTE</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 border-l border-slate-200 pl-2">
              Maison & Protection Anti-Moustiques
            </span>
          </div>

          <button
            onClick={scrollToOrder}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Commander</span>
            <span className="opacity-90 font-normal">({selectedBundle.price.toLocaleString("fr-FR")} F)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fermeture Aimantée Automatique • Zéro Perçage (Fixation Velcro)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Moustiquaire de Porte Magnétique™
            <span className="block text-emerald-600 text-xl sm:text-3xl mt-1">
              Profitez de l'Air Frais Tout en Gardant les Moustiques Dehors !
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Laissez vos portes grandes ouvertes pour aérer votre maison en toute quiétude. Grâce à ses aimants puissants, elle s'ouvre d'une simple poussée et <strong>se referme instantanément toute seule</strong> derrière vous.
          </p>
        </section>

        {/* ── 5. CARROUSEL D'IMAGES AUTO-DÉFILANT (PILIER 3) ── */}
        <section
          className="relative bg-white rounded-3xl p-2 sm:p-3 border border-slate-200/80 shadow-sm overflow-hidden"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100">
            <Image
              src={CAROUSEL_IMAGES[activeImgIndex].src}
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover transition-opacity duration-500"
            />

            {/* Navigation manuelle */}
            <button
              onClick={() =>
                setActiveImgIndex((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1))
              }
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
              }
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicateur discret */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xs">
              {CAROUSEL_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImgIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === activeImgIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Aller à la vue ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Miniatures cliquables */}
          <div className="grid grid-cols-7 gap-2 mt-2 pt-2 border-t border-slate-100">
            {CAROUSEL_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImgIndex(i)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  i === activeImgIndex
                    ? "border-emerald-600 ring-2 ring-emerald-600/20"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.src} alt="" fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* ── 6. TROIS BADGES DE RÉASSURANCE (PILIER 2) ── */}
        <section className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-900">Livraison Express</div>
            <div className="text-[10px] text-slate-500">Sous 24h à Cotonou/Calavi</div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-900">Paiement Réception</div>
            <div className="text-[10px] text-slate-500">Vérifiez avant de payer</div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-900">Zéro Perçage</div>
            <div className="text-[10px] text-slate-500">Velcro robuste sans clou</div>
          </div>
        </section>

        {/* ── 7. FORMULAIRE DE COMMANDE (COD) - IMMÉDIATEMENT APRÈS (PILIER 2 OBLIGATOIRE) ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
              {orderError}
            </div>
          )}
          <UmeiStyleOrderSection
            productSlug={slug}
            productTitle="Moustiquaire de Porte Magnétique Automatique™"
            productImage="/images/moustiquaire-porte/hero-moustiquaire-porte-magnetique.jpg"
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
            accentColor="#16A34A"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Confort, Santé & Tranquillité
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Pourquoi Chaque Maison au Bénin a Besoin de Cette Moustiquaire ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une barrière infranchissable contre les piqûres et le paludisme, sans étouffer votre intérieur avec la chaleur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  01
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Fermeture Magnétique Automatique</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Des aimants puissants cousus sur toute la hauteur centrale se rejoignent et claquent instantanément après chaque passage, sans laisser aucune ouverture aux insectes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  02
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Laisse Circuler l'Air Frais</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maille fine en fibre renforcée qui filtre les moustiques, mouches et cancrelats tout en laissant circuler librement l'air naturel pour rafraîchir vos pièces.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                  03
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Passage 100% Mains Libres</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous rentrez avec des sacs de courses ou un plateau ? Avancez simplement : la moustiquaire s'écarte sous votre corps et se referme immédiatement toute seule.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  04
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Installation Sans Aucun Outil</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fixation par bande auto-agrippante adhésive (velcro) fournie : zéro trou, zéro poussière, n'abîme ni le mur ni la peinture. Idéale pour locataires et propriétaires.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. COMPARATIF AVANT / APRÈS ── */}
        <section className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="relative aspect-square sm:aspect-16/11 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/moustiquaire-porte/comparatif-sans-avec-moustiquaire.jpg"
              alt="Comparatif sans moustiquaire vs avec moustiquaire magnétique"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
          <div className="text-center px-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              Ne vivez plus enfermé dans la chaleur : gardez la fraîcheur de l'extérieur sans inviter les moustiques.
            </p>
          </div>
        </section>

        {/* ── 10. GUIDE D'INSTALLATION SIMPLE EN 3 ÉTAPES CHRONO ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Posé en 5 Minutes Chrono
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Comment Installer Votre Moustiquaire ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Aucun tournevis, aucune perceuse : tout le nécessaire de fixation est inclus dans votre colis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <div className="text-xs font-bold text-slate-900">Nettoyez le Cadre</div>
              <div className="text-[11px] text-slate-500">
                Passez un chiffon sec sur le chambranle de votre porte pour enlever la poussière.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                2
              </div>
              <div className="text-xs font-bold text-slate-900">Collez le Velcro</div>
              <div className="text-[11px] text-slate-500">
                Déroulez et collez la bande adhésive auto-agrippante sur les 3 côtés de votre cadre de porte.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                3
              </div>
              <div className="text-xs font-bold text-slate-900">Appliquez le Rideau</div>
              <div className="text-[11px] text-slate-500">
                Pressez la moustiquaire contre la bande velcro. Les aimants s'alignent et votre maison est protégée !
              </div>
            </div>
          </div>

          <div className="relative aspect-square sm:aspect-16/11 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/moustiquaire-porte/installation-facile-sans-percage-velcro.jpg"
              alt="Installation facile sans perçage grâce au velcro"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        </section>

        {/* ── 11. BÉNÉFICES COMPARATIFS (TABLEAU MOUSTIQUAIRE VS INSECTICIDES VS RIDEAUX CLASSIQUES) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Pourquoi Choisir la Moustiquaire Magnétique ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Comparez l'efficacité et la santé face aux méthodes traditionnelles.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-2 sm:px-4 font-semibold">Critère</th>
                  <th className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-emerald-50/60 rounded-t-xl">
                    Moustiquaire Magnétique™
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-semibold text-slate-400">
                    Sprays & Serpentins Chimiques
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-semibold text-slate-400">
                    Porte Fermée H24
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Protection santé</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-emerald-50/40">
                    100% Physique (Zéro chimie)
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Fumées et odeurs toxiques
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Aucun air frais
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Circulation d'air</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-emerald-50/40">
                    Ventilation naturelle continue
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Obligation de fermer les fenêtres
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Maison étouffante et chaude
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Coût sur la durée</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-emerald-50/40">
                    1 seul achat durable (16 900 F)
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Dépenses répétitives chaque mois
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Factures de climatisation élevées
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Passage au quotidien</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-emerald-50/40">
                    Mains libres • Referme toute seule
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Inutile contre les entrées
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Ouvrir et fermer manuellement H24
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <section className="bg-gradient-to-br from-emerald-600 to-slate-900 rounded-3xl p-6 sm:p-10 text-white text-center space-y-5 shadow-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Offre Spéciale Saison des Moustiques au Bénin
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Protégez Votre Famille Contre le Paludisme Dès Aujourd'hui
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            Le rideau magnétique complet avec bande velcro et aimants pour seulement <strong>16 900 FCFA</strong> au lieu de 25 000 FCFA.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              16 900 FCFA{" "}
              <span className="text-sm font-normal text-white/60 line-through">
                25 000 FCFA
              </span>
            </div>

            <button
              onClick={scrollToOrder}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-emerald-800 hover:bg-slate-100 text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Commander Maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-300 pt-1">
            ⚡ Paiement en espèces à la livraison • Livraison express en 24h
          </div>
        </section>

        {/* ── 13. AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Ce que Disent Nos Clients au Bénin (4.9 / 5)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Avis authentiques de familles à Cotonou, Abomey-Calavi et Porto-Novo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOMER_REVIEWS.map((rev, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{rev.name}</div>
                    <div className="text-[11px] text-slate-500">{rev.location}</div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {rev.date}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs font-bold text-slate-900">{rev.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Questions Fréquentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tout ce que vous devez savoir avant de commander votre moustiquaire de porte.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS_DATA.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/70 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 bg-white leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── 15. FOOTER OFFICIEL ── */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="font-bold text-slate-900 uppercase tracking-wider">
          ISIVENTE BÉNIN • SERVICE CLIENT OFFICIEL
        </div>
        <p>© {new Date().getFullYear()} Isivente. Tous droits réservés.</p>
        <p className="text-[11px] text-slate-400">
          Livraison rapide & sécurisée à Cotonou, Abomey-Calavi, Porto-Novo et partout au Bénin.
        </p>
      </footer>

      {/* ── 16. BARRE MOBILE STICKY CTA ── */}
      <StickyMobileCtaBar
        price={selectedBundle.price}
        targetSectionId="commander"
        accentColor="#16A34A"
        buttonText="Commander"
      />
    </div>
  );
}

