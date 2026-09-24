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
  UtensilsCrossed, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Waves, 
  Zap, 
  Heart,
  Timer,
  Salad,
  Egg
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
    name: "Mandoline & Coupe-Légumes Multifonction 6-en-1",
    subtitle: "Ensemble complet : bac transparent, panier égouttoir, poussoir protège-doigts, grille de découpe, râpe et séparateur d'œuf",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/peeler-hero.jpg", 
    alt: "Mandoline & Coupe-Légumes Multifonction 6-en-1 avec Bac Égouttoir et Séparateur d'Œuf",
    caption: "Mandoline 6-en-1 : découpe rapide, bac transparent récepteur, panier égouttoir et poussoir protecteur"
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
    name: "Bernadette D.",
    location: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes salades et assaisonnements en 5 minutes !",
    comment: "Découper les carottes et concombres pour les salades me prenait un temps fou. Avec cette mandoline et son poussoir, tout tombe proprement dans le bac sans salir ma table. Les rondelles sont parfaites et régulières.",
    verified: true,
  },
  {
    name: "Marcelle T.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le séparateur d'œuf et la râpe à ail sont géniaux",
    comment: "C'est vraiment un outil tout-en-un. Je râpe l'ail et le gingembre directement sur le couvercle et je rince les légumes directement dans le panier égouttoir sans sortir de passoire. Très facile à nettoyer.",
    verified: true,
  },
  {
    name: "Sébastien A.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Plus aucune coupure aux doigts",
    comment: "Je l'ai acheté pour ma femme qui avait souvent des coupures avec les couteaux de cuisine. Le capuchon protecteur avec picots maintient fermement les pommes de terre. Reçu en 24h avec le livreur.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Quels légumes et aliments peut-on préparer avec cet appareil ?",
    a: "Il est idéal pour découper en rondelles ou lamelles régulières concombres, carottes, pommes de terre (chips/frites), oignons, courgettes, choux et fruits fermes. Il intègre aussi une zone pour râper ail/gingembre et un séparateur de jaune d'œuf."
  },
  {
    q: "Est-ce sécurisé pour éviter de se couper les doigts ?",
    a: "Oui, à 100%. L'appareil est livré avec un poussoir ergonomique muni de picots qui agrippent le légume. Vos doigts restent toujours au-dessus du capuchon de protection et ne s'approchent jamais de la lame."
  },
  {
    q: "Comment fonctionne le bac égouttoir intégré ?",
    a: "Le bol intérieur fait office de passoire. Dès que vos légumes sont découpés, vous pouvez verser de l'eau pour les rincer directement dans le bac, puis vider l'eau d'un seul geste par l'orifice de vidange sans transvaser les aliments."
  },
  {
    q: "Quelles sont les conditions de livraison et de règlement au Bénin ?",
    a: "Livraison rapide sous 24h à Cotonou, Calavi et environs. Vous contrôlez votre colis avec le livreur avant de payer le montant en espèces."
  }
];

export default function PeelerLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug || "peeler");
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

  // Défilement automatique du carrousel si plusieurs visuels
  useEffect(() => {
    if (isHeroHovered || CAROUSEL_IMAGES.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  // Capture silencieuse du prospect (Ghost lead) dès qu'il saisit 8 chiffres
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
        product_title: "Mandoline & Coupe-Légumes Multifonction 6-en-1",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Mandoline & Coupe-Légumes Multifonction 6-en-1",
      content_ids: ["peeler", "mandoline"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Mandoline & Coupe-Légumes Multifonction 6-en-1",
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
        product_title: "Mandoline & Coupe-Légumes Multifonction 6-en-1 avec Bac Égouttoir",
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
        content_name: "Mandoline & Coupe-Légumes Multifonction 6-en-1",
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
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Livraison express sous 24h à Cotonou & Calavi • Paiement en espèces après vérification du colis</span>
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
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• Boutique Officielle</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(5,150,105,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-emerald-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 stroke-[1.75]" />
            <span>Cuisine Facile & Rapide</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900 leading-tight">
            Mandoline & Coupe-Légumes Multifonction 6-en-1
          </h1>
          
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Tranchez, râpez, lavez et égouttez vos légumes dans un seul récipient. Équipé d&apos;un poussoir de sécurité protège-doigts, d&apos;une râpe à ail et d&apos;un séparateur d&apos;œufs.
          </p>
        </div>

        {/* ── GALERIE PHOTOS FOND BLANC AVEC RATIO PROPRE ── */}
        <div 
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="max-w-[480px] mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4 space-y-3"
        >
          {/* Cadre de l'image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
            <img
              src={CAROUSEL_IMAGES[activeImgIndex].src}
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              className="w-full h-full object-contain p-1"
            />

            {/* Badge promotionnel élégant */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Promo Spéciale : 14 900 FCFA</span>
            </div>
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE PRIORITAIRES ── */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xl mx-auto">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
            <div className="text-[10px] text-slate-500 font-mono">Cotonou & Calavi</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Test à Réception</div>
            <div className="text-[10px] text-slate-500 font-mono">Paiement après vérification</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Sparkles className="w-5 h-5 text-amber-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">100% Anti-Coupure</div>
            <div className="text-[10px] text-slate-500 font-mono">Poussoir protecteur inclus</div>
          </div>
        </div>

        {/* ── FORMULAIRE DE COMMANDE ENCADRÉ (DIRECTEMENT SOUS LES BADGES) ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="peeler"
            productTitle="Mandoline & Coupe-Légumes Multifonction 6-en-1 avec Bac Égouttoir"
            productImage="/images/peeler-hero.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Mandoline 6-en-1 - ${b.name}`,
                content_ids: ["peeler", b.id || "solo"],
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

        {/* ── BÉNÉFICES CLÉS & ARGUMENTS EMOTIONNELS ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              6 outils essentiels réunis dans un seul récipient
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Fini l&apos;encombrement des tiroirs avec 10 accessoires différents. Cette mandoline tout-en-un révolutionne votre temps en cuisine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Salad className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Découpe Tranches & Julienne</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Rondelles régulières de concombres et carottes râpées en quelques secondes sans aucun effort.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Poussoir de Sécurité Ergonomique</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Les picots agrippent solidement le légume. Vos mains restent totalement protégées des lames tranchantes.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Waves className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Bac Égouttoir & Rançage Direct</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Lavez vos légumes à grande eau dans le panier intérieur et videz l&apos;eau par l&apos;orifice de vidange sans passoire.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Egg className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Séparateur d&apos;Œuf & Râpe à Ail</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Séparez le blanc du jaune d&apos;œuf en 1 seconde et râpez ail, gingembre et muscade directement sur le couvercle.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-sm">
              {"★".repeat(5)}
            </div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
              Retour d&apos;expérience de nos clientes au Bénin
            </h2>
            <p className="text-xs text-slate-500">
              Note moyenne 4.9/5 basée sur plus de 120 commandes livrées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{rev.name}</div>
                      <div className="text-[10px] text-slate-500">{rev.location}</div>
                    </div>
                    <div className="flex text-amber-400 text-xs">
                      {"★".repeat(rev.rating)}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-snug">« {rev.title} »</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-2 border-t border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Achat vérifié Isivente</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOIRE AUX QUESTIONS ── */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3">
          <div className="text-xs font-bold text-slate-900">Questions fréquentes</div>

          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-emerald-600 transition-colors duration-100 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeFaq === idx ? "rotate-180 text-emerald-600" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed pt-1">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── BARRE MOBILE FLOTTANTE POUR COMMANDER & BOUTON WHATSAPP ── */}
      <StickyMobileCtaBar
        price={14900}
        accentColor="#059669"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander la Mandoline & Coupe-Légumes Multifonction 6-en-1 à 14 900 FCFA avec livraison à domicile."
      />

    </div>
  );
}
