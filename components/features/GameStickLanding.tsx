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
  Users,
  Zap,
  Gift,
  ArrowRight,
  Award,
  Sparkles,
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
    name: "Coffret Intégral Game Stick 4K Pro™ (Édition Complète)",
    subtitle: "Clé HDMI 4K Pro + 2 Manettes Sans Fil 2.4G + Carte Haute Capacité +10 000 Jeux Rétro + Câble d'alimentation USB + Rallonge HDMI",
    price: 22900,
    originalPrice: 35000,
    savings: 12100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/game-stick/hero-game-stick-4k-pro.jpg",
    alt: "Game Stick 4K Pro - La console compacte pour toute la famille",
  },
  {
    src: "/images/game-stick/deux-joueurs-ecran-scinde.jpg",
    alt: "Deux joueurs sur un seul écran - Multijoueur sans fil",
  },
  {
    src: "/images/game-stick/plus-de-10000-jeux.jpg",
    alt: "Plus de 10 000 jeux rétro intégrés en 4K Ultra HD",
  },
  {
    src: "/images/game-stick/fun-en-famille-incontournable.jpg",
    alt: "Du fun en famille et des moments inoubliables avec les enfants",
  },
  {
    src: "/images/game-stick/coffret-cadeau-ideal-boite.jpg",
    alt: "Coffret cadeau officiel Game Stick Pro 2.4G Wireless",
  },
  {
    src: "/images/game-stick/guide-installation-simple-hdmi.jpg",
    alt: "Installation ultra-simple Plug & Play : Branchez, connectez et jouez",
  },
  {
    src: "/images/game-stick/transformez-tv-en-console.jpg",
    alt: "Transformez instantanément votre téléviseur en console de jeux",
  },
  {
    src: "/images/game-stick/jeux-cultes-annees-90.jpg",
    alt: "Revivez les jeux cultes des années 90 et de votre enfance",
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
    name: "Brice T.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Une pure merveille de nostalgie ! Mario, Tekken, Crash...",
    comment:
      "J'ai retrouvé exactement les sensations de mon enfance avec la PS1 et la Super Nintendo. On a branché la clé sur notre TV de salon avec les enfants, ça a démarré en 5 secondes. Les manettes sans fil répondent super bien, zéro temps de latence. Vraiment bluffant pour 22 900 F.",
    verified: true,
  },
  {
    name: "Rodrigue K.",
    location: "Calavi (Tankpè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes garçons adorent et ça m'évite de payer des abonnements",
    comment:
      "Au lieu d'acheter une console à 300 000 F avec des jeux à 40 000 F l'unité, cette clé a réglé le problème. Les deux jouent ensemble le week-end, et le soir c'est moi qui rejoue aux jeux de foot rétro et Street Fighter. Le livreur est venu à Tankpè le lendemain de ma commande.",
    verified: true,
  },
  {
    name: "Armel D.",
    location: "Porto-Novo (Dowa)",
    rating: 5,
    date: "Achat vérifié",
    title: "Testé devant le livreur avant de payer",
    comment:
      "J'étais un peu sceptique sur la qualité au début, mais le livreur a patiemment attendu que je branche sur ma TV pour vérifier le menu des jeux. Tout fonctionne impeccablement, la sauvegarde des parties marche très bien. Très satisfait du sérieux d'Isivente.",
    verified: true,
  },
  {
    name: "Gérard A.",
    location: "Cotonou (Fidjrossè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le meilleur achat pour les soirées entre potes",
    comment:
      "Deux manettes sans fil très ergonomiques (style PS5), plus de 10 000 jeux dans une clé qui tient dans la paume de la main. On l'emmène partout, même quand on voyage à l'hôtel ou chez des amis. Franchement rien à redire.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Est-ce que le Game Stick fonctionne sur n'importe quel téléviseur ?",
    a: "Oui, absolument ! Il suffit que votre téléviseur possède un port HDMI (toutes les TV à écran plat récentes ou anciennes en sont équipées). Vous branchez la clé directement sur le port HDMI, vous connectez le câble USB pour l'alimenter, et l'affichage apparaît instantanément.",
  },
  {
    q: "Faut-il une connexion internet ou un abonnement payant ?",
    a: "Non ! Zéro connexion Wi-Fi requise, zéro compte en ligne et zéro abonnement mensuel. Tous les 10 000+ jeux sont déjà préinstallés sur la carte mémoire haute vitesse intégrée. Vous pouvez jouer hors-ligne à volonté.",
  },
  {
    q: "Quels types de jeux trouve-t-on sur la console ?",
    a: "Vous retrouvez les catalogues complets des plus grandes consoles de légende : PlayStation 1 (PS1), Super Nintendo (SNES), Sega MegaDrive, Game Boy Advance (GBA), Game Boy Color, Arcade MAME, Atari et NES. Cela inclut Super Mario, Street Fighter, Tekken, Metal Slug, Crash Bandicoot, Mortal Kombat, Sonic, Pac-Man, les classiques de football et bien d'autres.",
  },
  {
    q: "Comment fonctionnent les 2 manettes sans fil ?",
    a: "Les manettes utilisent une technologie sans fil 2.4 GHz via un petit récepteur USB inclus. Elles fonctionnent avec 2 piles AAA standard chacune (faciles à trouver partout au Bénin) et offrent une portée confortable jusqu'à 10 mètres sans fil encombrant dans votre salon.",
  },
  {
    q: "Peut-on sauvegarder sa progression dans un jeu pour reprendre plus tard ?",
    a: "Oui ! Le Game Stick intègre une fonction de sauvegarde instantanée (Save State). Vous appuyez simplement sur Select + Start simultanément pour afficher le menu, sauvegarder votre partie en cours et reprendre exactement au même endroit à votre prochaine session.",
  },
  {
    q: "Comment se déroulent la livraison et le test au Bénin ?",
    a: "La livraison est effectuée en 24h à Cotonou, Abomey-Calavi et Porto-Novo. Vous avez la possibilité de brancher et tester l'appareil dès la réception devant le livreur, puis de régler les 22 900 FCFA en espèces en toute sérénité.",
  },
];

export default function GameStickLanding({ slug = "game-stick-4k" }: { slug?: string }) {
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
  const [customerEmail, setCustomerEmail] = useState("");
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
        product_title: "Game Stick 4K Pro™ - Console Rétro HDMI + 2 Manettes Sans Fil",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      });
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle, slug]);

  // Pixel ViewContent
  useEffect(() => {
    trackViewContent({
      content_name: "Game Stick 4K Pro™ - Console Rétro HDMI",
      content_category: "Jeux Vidéo & High-Tech",
      content_ids: [slug, "game-stick-4k-pro"],
      value: selectedBundle.price,
      currency: "XOF",
    });
  }, [selectedBundle, slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: "Game Stick 4K Pro™",
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
        customer_email: customerEmail.trim() || undefined,
        city: cityDetect.detectedCity,
        address: address.trim(),
        product_title: "Game Stick 4K Pro™ - Console Rétro HDMI + 2 Manettes Sans Fil",
        product_slug: slug,
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
        quantity: selectedBundle.quantity || 1,
        utm_source: utm?.utm_source || undefined,
        utm_medium: utm?.utm_medium || undefined,
        utm_campaign: utm?.utm_campaign || undefined,
      });

      markLeadConverted(customerPhone.trim(), slug);

      const successUrl = `/p/${slug}/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&email=${encodeURIComponent(customerEmail.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Erreur commande :", err);
      setOrderError(err.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FC] text-slate-900 font-sans antialiased selection:bg-red-100 selection:text-red-900">
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <aside
        aria-label="Annonce livraison"
        className="bg-amber-50/90 border-b border-amber-200/60 py-2 px-3 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          Livraison Express 24h à Cotonou, Calavi & Porto-Novo • <strong>Testez sur votre TV avant de payer</strong>
        </span>
      </aside>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-950 uppercase">
              ISI<span className="text-red-600">VENTE</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 border-l border-slate-200 pl-2">
              Jeux Vidéo & Divertissement Rétro
            </span>
          </div>

          <button
            onClick={scrollToOrder}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold tracking-wide">
            <Gamepad2 className="w-3.5 h-3.5 text-red-600" />
            <span>Console Rétro HDMI 4K Pro • 2 Manettes Sans Fil Incluses</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Game Stick 4K Pro™
            <span className="block text-red-600 text-xl sm:text-3xl mt-1">
              Plus de 10 000 Jeux Rétro sur Votre Téléviseur !
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transformez n'importe quelle TV en salle d'arcade culte. Retrouvez tous les classiques de votre enfance (Mario, Street Fighter, Crash Bandicoot, Tekken, Pac-Man) en 4K Ultra HD, <strong>sans abonnement</strong> et jouez à deux immédiatement.
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
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2 pt-2 border-t border-slate-100">
            {CAROUSEL_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImgIndex(i)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  i === activeImgIndex
                    ? "border-red-600 ring-2 ring-red-600/20"
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
            <div className="text-[11px] sm:text-xs font-bold text-slate-900">Zéro Abonnement</div>
            <div className="text-[10px] text-slate-500">+10 000 jeux inclus à vie</div>
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
            productTitle="Game Stick 4K Pro™ - Console Rétro HDMI + 2 Manettes Sans Fil"
            productImage="/images/game-stick/hero-game-stick-4k-pro.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => setSelectedBundle(b)}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerPhone2={customerPhone2}
            setCustomerPhone2={setCustomerPhone2}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            city={city}
            setCity={setCity}
            address={address}
            setAddress={setAddress}
            accentColor="#DC2626"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. GRILLE DES 4 BÉNÉFICES MAJEURS ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200/60">
              Technologie & Divertissement
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Pourquoi Tout le Monde Craque Pour le Game Stick 4K Pro ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une console puissante et minuscule qui remplace des dizaines d'appareils et procure des milliers d'heures de plaisir immédiat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                  01
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">+10 000 Jeux Rétro Préinstallés</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                9 émulateurs intégrés : PlayStation 1, Super Nintendo, Sega MegaDrive, Game Boy Advance, Arcade MAME, NES... Retrouvez tous vos héros sans rien télécharger.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  02
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">2 Manettes Ergonomiques Sans Fil 2.4G</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jouez confortablement installé dans votre canapé jusqu'à 10 mètres de distance. Zéro câble traînant au milieu du salon et prise en main ultra-précise.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                  03
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Branchement Plug & Play HDMI 4K</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Insérez la clé dans le port HDMI de votre écran plat, connectez le câble USB fourni et commencez à jouer immédiatement. Compatible avec 100% des TV.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                  04
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Sauvegarde Instantanée des Parties</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ne perdez plus jamais votre progression dans vos jeux d'aventure : appuyez sur Select + Start pour sauvegarder et reprendre exactement au même niveau !
              </p>
            </div>
          </div>
        </section>

        {/* ── 9. DÉMONSTRATION VIDÉO EN SITUATION RÉELLE (PILIER 4) ── */}
        <section className="bg-white rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200/60 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Démonstration Réelle • Prise en Main Directe</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Voyez le Game Stick 4K Pro en Action
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Déballage, branchement HDMI immédiat sur la TV et navigation fluide dans les catalogues de jeux cultes.
            </p>
          </div>

          <div className="relative aspect-[9/16] w-full max-w-xs sm:max-w-sm mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md">
            <video
              src="/videos/game-stick-demo.mp4"
              poster="/images/game-stick/video-poster.jpg"
              autoPlay
              muted
              playsInline
              loop
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center">
            <p className="text-[11px] sm:text-xs font-medium text-slate-500">
              🔊 Activez le son sur la vidéo pour entendre les effets sonores des jeux cultes !
            </p>
          </div>
        </section>

        {/* ── 10. MISE EN SITUATION : MULTIJOUEUR & FAMILLE ── */}
        <section className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="relative aspect-square sm:aspect-16/11 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/game-stick/deux-joueurs-ecran-scinde.jpg"
              alt="Deux joueurs sur un seul écran - Multijoueur sans fil"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
          <div className="text-center px-3">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              Des duels épiques et des tournois passionnants en famille ou entre amis, directement sur votre écran de salon.
            </p>
          </div>
        </section>

        {/* ── 10. GUIDE D'INSTALLATION SIMPLE EN 3 ÉTAPES CHRONO ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Prêt en 30 Secondes
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Installation Ultra-Simple : Branchez et Jouez !
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Aucune connaissance technique requise, aucune configuration compliquée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <div className="text-xs font-bold text-slate-900">Branchez le Stick HDMI</div>
              <div className="text-[11px] text-slate-500">
                Insérez le Game Stick sur le port HDMI de votre TV et alimentez-le via le câble USB fourni.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                2
              </div>
              <div className="text-xs font-bold text-slate-900">Allumez les Manettes</div>
              <div className="text-[11px] text-slate-500">
                Insérez les piles dans les 2 manettes sans fil. La synchronisation automatique se fait instantanément.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-2">
              <div className="w-8 h-8 mx-auto rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                3
              </div>
              <div className="text-xs font-bold text-slate-900">Choisissez et Jouez !</div>
              <div className="text-[11px] text-slate-500">
                Sélectionnez votre jeu favori parmi plus de 10 000 titres et lancez votre première partie.
              </div>
            </div>
          </div>

          <div className="relative aspect-square sm:aspect-16/11 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src="/images/game-stick/guide-installation-simple-hdmi.jpg"
              alt="Guide visuel d'installation simple du Game Stick 4K Pro"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        </section>

        {/* ── 11. BÉNÉFICES COMPARATIFS (TABLEAU CONSOLE CLASSIQUE VS GAME STICK) ── */}
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Pourquoi Choisir le Game Stick 4K Pro ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Comparez le coût et la liberté face aux consoles de salon modernes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-2 sm:px-4 font-semibold">Critère</th>
                  <th className="py-3 px-2 sm:px-4 font-bold text-red-600 bg-red-50/60 rounded-t-xl">
                    Game Stick 4K Pro™
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-semibold text-slate-400">
                    Consoles Modernes (PS5 / Xbox)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Prix d'acquisition</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    22 900 FCFA (Tout inclus)
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    300 000 à 450 000 FCFA
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Abonnement récurrent</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    0 FCFA (Jeux inclus à vie)
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    5 000 à 10 000 FCFA / mois
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Nombre de jeux</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    +10 000 jeux rétro prêts à jouer
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    35 000 à 50 000 FCFA par jeu
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Encombrement & Mobilité</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    Clé de poche invisible derrière la TV
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    Console lourde, encombrante et fragile
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-2 sm:px-4 font-medium text-slate-900">Manettes incluses</td>
                  <td className="py-3 px-2 sm:px-4 font-bold text-emerald-700 bg-red-50/40">
                    2 manettes sans fil fournies
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-slate-500">
                    1 seule manette (2ème payante ~45 000 F)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <section className="bg-gradient-to-br from-red-600 to-slate-900 rounded-3xl p-6 sm:p-10 text-white text-center space-y-5 shadow-lg">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-red-100 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Offre Spéciale Limitée au Bénin
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Offrez-Vous le Meilleur du Rétrogaming Dès Aujourd'hui
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            Le coffret complet avec la clé 4K Pro, les 2 manettes sans fil et les 10 000 jeux pour seulement <strong>22 900 FCFA</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              22 900 FCFA{" "}
              <span className="text-sm font-normal text-white/60 line-through">
                35 000 FCFA
              </span>
            </div>

            <button
              onClick={scrollToOrder}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-red-700 hover:bg-slate-100 text-sm font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Commander Maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-300 pt-1">
            ⚡ Paiement en espèces à la livraison • Test sur place possible
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
              Avis authentiques de joueurs et de familles à Cotonou, Calavi et Porto-Novo.
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
              Tout ce que vous devez savoir avant de commander en toute sérénité.
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
                        isOpen ? "rotate-180 text-red-600" : ""
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
        accentColor="#DC2626"
        buttonText="Commander"
      />
    </div>
  );
}
