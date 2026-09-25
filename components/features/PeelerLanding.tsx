"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  ChevronDown, 
  UtensilsCrossed, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Waves, 
  Zap, 
  Timer, 
  Salad, 
  Egg,
  ArrowRight,
  PackageCheck,
  Gift
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
    id: "duo-malin",
    name: "Pack Duo Cuisine Malin (Mandoline 12-en-1 + Plateau de Conservation Élastique)",
    subtitle: "L'ensemble complet : Mandoline Essoreuse Multifonction + 1 Plateau Hermétique Zéro Gaspillage offert",
    price: 17900,
    originalPrice: 32000,
    savings: 14100,
    quantity: 1,
    popular: true,
  },
  {
    id: "solo",
    name: "Mandoline Essoreuse 12-en-1 Seule",
    subtitle: "Bac égouttoir, manivelle essoreuse, poussoir protège-doigts et grille de découpe",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
  },
  {
    id: "pack-famille",
    name: "Pack Famille (2 Mandolines + 2 Plateaux de Conservation)",
    subtitle: "Idéal pour équiper deux cuisines ou faire un cadeau utile à un proche",
    price: 29900,
    originalPrice: 60000,
    savings: 30100,
    quantity: 2,
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
    name: "Bernadette D.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes salades et assaisonnements prêts en 3 minutes !",
    comment: "Découper les carottes, oignons et concombres me prenait un temps fou. Avec cette mandoline, tout tombe directement dans le bol sans salir ma table. Et le plateau élastique conserve le reste au frigo sans odeur !",
    verified: true,
  },
  {
    name: "Marcelle T.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "L'essoreuse et le panier égouttoir sont géniaux",
    comment: "Je lave mes légumes directement dans le panier égouttoir, je tourne la manivelle pour essorer la salade en 5 secondes, et je change de lame d'un clic. C'est le meilleur ustensile de ma cuisine.",
    verified: true,
  },
  {
    name: "Sébastien A.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Plus aucune coupure aux doigts pour ma femme",
    comment: "Le poussoir protège-doigts est solide et maintient fermement les pommes de terre. Fini les petites blessures au couteau. Livraison reçue en 24h et payée au livreur après contrôle.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Qu'est-ce qui est inclus dans le Pack Duo Cuisine Malin ?",
    a: "Le pack comprend la grande mandoline essoreuse 12-en-1 (bol transparent, panier passoire égouttoir, couvercle essoreuse à manivelle, grille de découpe interchangeable avec toutes les lames, poussoir de sécurité, presse-agrumes et séparateur d'œuf) + 1 Plateau de conservation hermétique à membrane élastique réutilisable."
  },
  {
    q: "Est-ce sécurisé pour éviter de se couper les doigts ?",
    a: "Oui, à 100%. L'appareil est livré avec un poussoir ergonomique muni de picots qui agrippent le légume. Vos doigts restent toujours au-dessus du capuchon de protection et ne s'approchent jamais des lames tranchantes."
  },
  {
    q: "Comment fonctionne le plateau de conservation élastique ?",
    a: "Dès que vous avez terminé de découper, placez les morceaux non utilisés (demi-oignon, tranches de tomate, poivron, etc.) sur le plateau et clipsez le couvercle. La membrane étirable s'adapte à la hauteur des aliments, chasse l'air et garde vos légumes frais pendant 7 jours sans plastique jetable."
  },
  {
    q: "Quels sont les délais et conditions de livraison au Bénin ?",
    a: "Livraison rapide sous 24h à Cotonou, Calavi et partout au Bénin. Vous avez la garantie d'ouvrir et de contrôler votre colis avec le livreur avant de régler les 17 900 FCFA en espèces."
  }
];

export default function PeelerLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug || "peeler");
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
        product_slug: "peeler",
        product_title: selectedBundle.name,
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Duo Cuisine Malin - Mandoline & Plateau Fraîcheur",
      content_ids: ["peeler", "mandoline"],
      value: 17900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: selectedBundle.name,
      content_ids: ["peeler", "mandoline"],
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
        product_title: selectedBundle.name,
        product_slug: "peeler",
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

      markLeadConverted(customerPhone.trim(), "peeler");

      trackPurchase({
        content_name: selectedBundle.name,
        content_ids: ["peeler", "mandoline"],
        value: selectedBundle.price,
        currency: "XOF",
        num_items: 1,
      });

      const successUrl = `/p/peeler/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
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
              <UtensilsCrossed className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• Cuisine & Maison</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(5,150,105,0.4)] transition-all cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-emerald-100 text-[11px]">({selectedBundle.price.toLocaleString("fr-FR")} F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 stroke-[1.75]" />
            <span>Le Duo Cuisine Malin • Zéro Gaspillage</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Gagnez du temps : <span className="text-emerald-600">Préparez, Essorez</span> & <span className="text-amber-600">Conservez.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Lavez, essorez, râpez et tranchez tous vos légumes en 2 minutes chrono. Et conservez vos restes frais 7 jours grâce au plateau hermétique réutilisable.
          </p>
        </div>

        {/* ── IMAGE HERO UNIQUE AVEC BADGES FLOTTANTS ── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5">
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            
            {/* 🏷️ BADGE CIRCULAIRE HAUT GAUCHE */}
            <div className="absolute -top-3 -left-2 sm:-left-4 w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] bg-[#A8E6C9] text-[#1b3d2f] rounded-full flex items-center justify-center text-center font-black text-[11px] sm:text-[12px] leading-tight p-2 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.22)] -rotate-12 z-20 pointer-events-none border-2 border-white select-none">
              12-en-1 Découpe + Essoreuse
            </div>

            {/* 🏷️ BADGE CIRCULAIRE BAS DROITE */}
            <div className="absolute -bottom-3 -right-2 sm:-right-4 w-[88px] h-[88px] sm:w-[98px] sm:h-[98px] bg-[#F8D9B4] text-[#4a2e18] rounded-full flex items-center justify-center text-center font-black text-[10px] sm:text-[11px] leading-tight p-2 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.22)] rotate-12 z-20 pointer-events-none border-2 border-white select-none">
              100% Anti-Coupure
            </div>

            {/* Cadre image interne */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
              <Image
                src="/images/mandoline-hero-avant-apres.jpg"
                alt="Gagnez du temps en cuisine : Avant Long et fatigant / Après Rapide et facile"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />

              {/* Pastille Prix Officiel */}
              <div className="absolute top-3 right-3 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                  17 900 FCFA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE ISIVENTE ── */}
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
              <p className="text-[11px] text-slate-500">Réglez après vérification du colis</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Sécurité Totale Protège-Doigts</p>
              <p className="text-[11px] text-slate-500">Poussoir ergonomique anti-blessure</p>
            </div>
          </div>
        </div>

        {/* ── PILIER 2 : FORMULAIRE DE COMMANDE IMMÉDIATEMENT ACCESSIBLE ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="peeler"
            productTitle="Duo Cuisine Malin : Mandoline Essoreuse 12-en-1 & Plateau Fraîcheur"
            productImage="/images/mandoline-hero-avant-apres.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Mandoline - ${b.name}`,
                content_ids: ["peeler", b.id || "duo-malin"],
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

        {/* ── SECTION INFOGRAPHIE 1 : LE DUO CUISINE MALIN (COMBO PARFAIT) ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Le Combo Zéro Gaspillage</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Préparez aujourd&apos;hui • Savourez • Conservez pour demain
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Ne jetez plus jamais la moitié d&apos;un oignon ou des tranches de légumes. Le plateau hermétique élastique garde vos aliments frais sans film plastique.
            </p>
          </div>

          <div className="relative aspect-video sm:aspect-[16/10] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
            <Image
              src="/images/mandoline-duo-cuisine-malin.jpg"
              alt="Le Duo Cuisine Malin : Mandoline Essoreuse et Plateau de Conservation Hermétique"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </section>

        {/* ── 🎬 DÉMONSTRATION VIDÉO RÉELLE DU PLATEAU EN ACTION ── */}
        <section id="demo-plateau" className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-7 space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Démonstration Vidéo en Direct</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Voyez l&apos;élasticité magique du plateau en action
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Le film en silicone ultra-extensible épouse la forme des légumes, chasse l&apos;air et garantit un frigo propre et zéro gaspillage.
            </p>
          </div>

          <div className="relative aspect-[9/16] max-w-[340px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xl">
            <video
              src="/videos/plateau-demo-1.mp4"
              poster="/images/plateau-demo-1-cover.jpg"
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="auto"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center pt-1">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander le Pack Duo Malin (17 900 F)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── SECTION INFOGRAPHIE 2 : LAVER, ESSORER, PRÉPARER EN 1 SEUL USTENSILE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Tout-En-Un Révolutionnaire</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Laver, essorer, préparer tout dans un seul ustensile !
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Fini de sortir 4 bols différents. Rincez, essorez votre salade en un tour de manivelle et tranchez directement dans le récipient.
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
            <Image
              src="/images/mandoline-guide-laver-essorer.jpg"
              alt="Guide complet : Laver, essorer, couper en tranches, râper, émincer"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 576px"
            />
          </div>
        </section>

        {/* ── SECTION INFOGRAPHIE 3 : CHOISISSEZ VOTRE DÉCOUPE (12 LAMES ET ACCESSOIRES) ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Polyvalence Totale</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Toutes les découpes de chef à votre portée
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Râper gros, râper fin, rondelles ondulées, bâtonnets, dés, presse-agrumes et séparateur d&apos;œufs inclus.
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
            <Image
              src="/images/mandoline-guide-lames.jpg"
              alt="Toutes les lames de la mandoline : trancher, râper, dés, bâtonnets, presse-agrumes"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 576px"
            />
          </div>
        </section>

        {/* ── SECTION INFOGRAPHIE 4 : DE LA PRÉPARATION À LA SALADE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Rapidité & Fraîcheur</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              De la préparation à l&apos;assiette en 5 minutes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Vos légumes restent croquants, bien égouttés et parfaitement taillés pour régaler toute la famille.
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
            <Image
              src="/images/mandoline-guide-salade.jpg"
              alt="De la préparation à la salade fraîche servie et dégustée"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 576px"
            />
          </div>
        </section>

        {/* ── BANNIÈRE PROMOTIONNELLE RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-emerald-950/10">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Pack Duo Cuisine Malin
            </h4>
            <p className="text-emerald-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">17 900 FCFA</strong> au lieu de <span className="line-through opacity-75">32 000 FCFA</span>.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-900 font-bold text-sm rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Commander mon Pack (17 900 F)
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

      {/* ── BARRE MOBILE STICKY CTA ── */}
      <StickyMobileCtaBar
        price={selectedBundle.price}
        targetSectionId="commander"
        accentColor="#059669"
        buttonText={`Commander (${selectedBundle.price.toLocaleString("fr-FR")} F)`}
        whatsappMessage={`Bonjour Isivente, je souhaite commander le ${selectedBundle.name} à ${selectedBundle.price.toLocaleString("fr-FR")} FCFA.`}
      />

    </div>
  );
}
