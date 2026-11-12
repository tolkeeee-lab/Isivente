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
  Gamepad2,
  Tv,
  BatteryCharging,
  Cpu,
  Zap,
  Gift,
  ArrowRight,
  Award,
  Sparkles,
  Headphones,
  Save,
  Check,
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
    name: "Coffret Console Portable R36S™ (Édition Translucide Rétro)",
    subtitle: "Console R36S écran IPS 3.5\" HD + Carte Haute Vitesse 64 Go (+15 000 Jeux Rétro) + Câble de recharge rapide USB-C + Manuel officiel",
    price: 34900,
    originalPrice: 50000,
    savings: 15100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/r36s/hero-r36s-console-portable.jpg",
    alt: "Console de Jeux Portable R36S - Des milliers de jeux rétro dans votre poche",
  },
  {
    src: "/images/r36s/jeux-retro-cultes-catalogue.jpg",
    alt: "Catalogue de jeux cultes R36S : Mario, Street Fighter, Pokémon, Crash",
  },
  {
    src: "/images/r36s/heures-de-jeu-autonomie.jpg",
    alt: "Grande autonomie et prise en main ergonomique partout avec vous",
  },
  {
    src: "/images/r36s/format-poche-voyage.jpg",
    alt: "Format de poche compact et léger, facile à glisser dans un sac",
  },
  {
    src: "/images/r36s/revivez-jeux-enfance.jpg",
    alt: "Revivez les sensations des jeux vidéo de votre enfance",
  },
  {
    src: "/images/r36s/cadeau-ideal-famille.jpg",
    alt: "Le cadeau idéal pour les enfants et les passionnés de retrogaming",
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
    name: "Serge D.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "L'écran IPS est sublime et Pokémon tourne à merveille !",
    comment:
      "La clarté de l'écran m'a bluffé : les couleurs sont nettes, aucun pixel baveux. J'ai replongé dans Pokémon Rouge Feu et Tekken 3 comme quand j'avais 12 ans. Les doubles joysticks analogiques sont ultra-souples et la console ne chauffe pas. Vaut largement ses 34 900 F.",
    verified: true,
  },
  {
    name: "Aimé B.",
    location: "Calavi (Bidossessi)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le meilleur compagnon de voyage et de pause au bureau",
    comment:
      "Je l'emmène tous les jours avec moi. Dans les embouteillages ou pendant ma pause déjeuner, j'allume la console et je reprends ma partie immédiatement grâce à la sauvegarde rapide. Batterie qui tient facilement 5 à 6 heures sans faiblir.",
    verified: true,
  },
  {
    name: "Florent M.",
    location: "Porto-Novo (Avakpa)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mon fils l'adore et ça lui évite de squatter mon téléphone",
    comment:
      "Avant, mon garçon me réclamait tout le temps mon smartphone pour jouer à des jeux pleins de pubs et d'achats intégrés. Avec la R36S, zéro connexion internet nécessaire, zéro publicité, que des vrais jeux passionnants. Colis reçu le lendemain à Porto-Novo, testé devant le livreur.",
    verified: true,
  },
  {
    name: "Lionel K.",
    location: "Cotonou (Menontin)",
    rating: 5,
    date: "Achat vérifié",
    title: "Coque translucide magnifique, son puissant et prise jack",
    comment:
      "Le design rétro translucide style Game Boy Color est magnifique en vrai. On peut brancher ses écouteurs pour jouer tranquillement sans déranger la maison. Vraiment une pépite high-tech bien finie.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Quelles sont les consoles et les jeux inclus dans la R36S ?",
    a: "La R36S intègre plus de 20 émulateurs de légende : PlayStation 1 (PS1), PSP, Nintendo 64 (N64), Game Boy Advance (GBA), Game Boy Color, Super Nintendo (SNES), Sega MegaDrive, Arcade (MAME, Neo-Geo), Capcom, NES, etc. Plus de 15 000 jeux rétro sont déjà prêts à jouer sur la carte mémoire 64 Go incluse (Mario, Pokémon, Crash Bandicoot, Tekken, Metal Slug, GTA, Dragon Ball, Street Fighter...).",
  },
  {
    q: "Quelle est l'autonomie de la batterie et comment se recharge-t-elle ?",
    a: "La console est équipée d'une batterie haute capacité de 3200 mAh qui offre entre 5 et 6 heures de jeu continu selon les consoles émulées. Elle se recharge simplement avec le câble USB Type-C fourni (compatible avec n'importe quel chargeur de smartphone ou batterie externe).",
  },
  {
    q: "Y a-t-il besoin de connexion internet ou de Wi-Fi pour jouer ?",
    a: "Non ! Zéro connexion requise. Tous les jeux sont stockés localement sur la carte mémoire de 64 Go. Vous pouvez jouer dans le bus, au village, en voyage ou lors des coupures d'électricité sans aucune restriction.",
  },
  {
    q: "Peut-on sauvegarder sa progression dans les jeux ?",
    a: "Oui, absolument ! La console dispose de la fonction universelle Save State. Vous pouvez sauvegarder votre partie à n'importe quelle seconde de jeu, éteindre la console et reprendre exactement là où vous étiez en 1 clic.",
  },
  {
    q: "Peut-on brancher des écouteurs ?",
    a: "Oui ! La R36S dispose d'une prise audio Jack 3.5 mm standard pour brancher vos écouteurs ou un casque filaire, en plus de son haut-parleur stéréo intégré avec molette de volume réglable.",
  },
  {
    q: "Comment se déroulent la livraison et le test au Bénin ?",
    a: "La livraison se fait en 24h à Cotonou, Abomey-Calavi et Porto-Novo. Vous allumez la console devant le livreur, vous testez les boutons et l'écran, puis vous réglez les 34 900 FCFA en espèces en toute sécurité.",
  },
];

export default function R36SLanding({ slug = "r36s" }: { slug?: string }) {
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
        product_title: "Console de Jeux Portable R36S™ - Écran IPS HD + 64 Go",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      });
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle, slug]);

  // Pixel ViewContent
  useEffect(() => {
    trackViewContent({
      content_name: "Console de Jeux Portable R36S™",
      content_category: "Jeux Vidéo & High-Tech",
      content_ids: [slug, "r36s-portable-64gb"],
      value: selectedBundle.price,
      currency: "XOF",
    });
  }, [selectedBundle, slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Console Portable R36S™",
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
        product_title: "Console de Jeux Portable R36S™ - Écran IPS HD + 64 Go",
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
    <div className="min-h-screen bg-[#FAF8FC] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <aside
        aria-label="Annonce livraison"
        className="bg-blue-50/90 border-b border-blue-200/60 py-2 px-3 text-center text-xs font-semibold text-blue-900 flex items-center justify-center gap-2"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          Livraison Express 24h à Cotonou, Calavi & Porto-Novo • <strong>Testez la console avant de payer</strong>
        </span>
      </aside>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-950 uppercase">
              ISI<span className="text-blue-600">VENTE</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 border-l border-slate-200 pl-2">
              Console Portable Rétro HD
            </span>
          </div>

          <button
            onClick={scrollToOrder}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide">
            <Gamepad2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Console Portable R36S • Écran IPS HD 3.5" & 64 Go</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Console Portable R36S™
            <span className="block text-blue-600 text-xl sm:text-3xl mt-1">
              Des Milliers de Jeux Rétro dans Votre Poche !
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Retrouvez tous les classiques de votre enfance (Mario, Pokémon, Crash, Street Fighter, Tekken) sur un superbe écran HD lumineux, avec 64 Go de stockage, batterie rechargeable et <strong>zéro abonnement</strong>.
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
          <div className="grid grid-cols-6 gap-2 mt-2 pt-2 border-t border-slate-100">
            {CAROUSEL_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImgIndex(i)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  i === activeImgIndex
                    ? "border-blue-600 ring-2 ring-blue-600/20"
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
            <div className="text-[10px] text-slate-500">Testez avant de payer</div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-900">64 Go Inclus</div>
            <div className="text-[10px] text-slate-500">+15 000 jeux hors ligne</div>
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
            productTitle="Console de Jeux Portable R36S™ - Écran IPS HD + 64 Go"
            productImage="/images/r36s/hero-r36s-console-portable.jpg"
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
            accentColor="#2563EB"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              Performances & Ergonomie
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Pourquoi la Console R36S Fait l'Unanimité ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une console portable autonome, légère et surpuissante capable de faire tourner des milliers de chefs-d'œuvre du jeu vidéo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  01
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Écran IPS 3.5" HD (640 × 480)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Des couleurs éclatantes et des angles de vision ultra-larges. Vos jeux préférés s'affichent avec une netteté remarquable, de jour comme de nuit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                  02
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">64 Go & +20 Émulateurs Rétro</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                PS1, PSP, N64, Game Boy Advance, Super Nintendo, MegaDrive, Arcade... Plus de 15 000 jeux préinstallés sans rien télécharger ni configurer.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  03
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Double Joystick 3D & Gâchettes L/R</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contrôle tactile professionnel : 2 joysticks 3D rotatifs, croix directionnelle précise et 4 gâchettes arrière (L1, L2, R1, R2) pour un confort de jeu total.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                  04
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Batterie 3200 mAh (Jusqu'à 6h)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jouez pendant des heures en voyage ou lors des coupures. Se recharge en toute simplicité avec n'importe quel câble USB Type-C.
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. MISE EN SITUATION : EN VOYAGE ET DANS LA POCHE ── */}
        <section className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="relative aspect-square sm:aspect-16/11 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/r36s/format-poche-voyage.jpg"
              alt="Format poche voyage de la console R36S"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
          <div className="text-center px-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              Se glisse facilement dans un sac ou une poche : vos jeux cultes vous accompagnent partout, sans connexion ni abonnement.
            </p>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS (TABLEAU R36S VS JEU SUR SMARTPHONE VS NINTENDO SWITCH) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Pourquoi Choisir la R36S ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Comparez la liberté de jeu face à un smartphone ou une console coûteuse.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-2 sm:px-4 font-semibold">Critère</th>
                  <th className="py-3 px-2 sm:px-4 font-bold text-blue-600 bg-blue-50/60 rounded-t-xl">
                    Console Portable R36S™
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-semibold text-slate-400">
                    Jeux sur Smartphone
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-semibold text-slate-400">
                    Nintendo Switch
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Prix total</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-blue-50/40">
                    34 900 FCFA (Tout inclus)
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Achats intégrés continus
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    220 000 à 300 000 FCFA
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Contrôles physiques</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-blue-50/40">
                    Vrais joysticks 3D & gâchettes
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Tactile imprécis qui glisse
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Boutons Joy-Con
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Publicités & Connexion</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-blue-50/40">
                    0 pub • 100% hors-ligne
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Pubs constantes & Wi-Fi requis
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Connexion requise pour boutique
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Impact batterie</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-blue-50/40">
                    Autonomie dédiée 5-6h
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Vide la batterie du téléphone
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Autonomie 3 à 5h
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Catalogue de jeux</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-blue-50/40">
                    +15 000 jeux rétro inclus
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Jeux gratuits limités
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    35 000 F par jeu
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <section className="bg-gradient-to-br from-blue-600 to-slate-900 rounded-3xl p-6 sm:p-10 text-white text-center space-y-5 shadow-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Offre Spéciale Rétrogaming au Bénin
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Offrez-Vous le Rétrogaming Ultime de Poche
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            La console portable R36S avec écran IPS HD, carte 64 Go et plus de 15 000 jeux pour seulement <strong>34 900 FCFA</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              34 900 FCFA{" "}
              <span className="text-sm font-normal text-white/60 line-through">
                50 000 FCFA
              </span>
            </div>

            <button
              onClick={scrollToOrder}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 hover:bg-slate-100 text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Commander Maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-300 pt-1">
            ⚡ Paiement en espèces à la livraison • Test de la console sur place
          </div>
        </section>

        {/* ── 12. AVIS CLIENTS VÉRIFIÉS ── */}
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
              Avis authentiques de passionnés de jeux vidéo à Cotonou, Calavi et Porto-Novo.
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

        {/* ── 13. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Questions Fréquentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tout ce que vous devez savoir avant de commander votre console R36S.
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
                        isOpen ? "rotate-180 text-blue-600" : ""
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

      {/* ── 14. FOOTER OFFICIEL ── */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="font-bold text-slate-900 uppercase tracking-wider">
          ISIVENTE BÉNIN • SERVICE CLIENT OFFICIEL
        </div>
        <p>© {new Date().getFullYear()} Isivente. Tous droits réservés.</p>
        <p className="text-[11px] text-slate-400">
          Livraison rapide & sécurisée à Cotonou, Abomey-Calavi, Porto-Novo et partout au Bénin.
        </p>
      </footer>

      {/* ── 15. BARRE MOBILE STICKY CTA ── */}
      <StickyMobileCtaBar
        price={selectedBundle.price}
        targetSectionId="commander"
        accentColor="#2563EB"
        buttonText="Commander"
      />
    </div>
  );
}

