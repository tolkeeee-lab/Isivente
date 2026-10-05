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
  Leaf,
  Sun,
  Award
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackMultiViewContent as trackViewContent, trackMultiAddToCart as trackAddToCart, trackMultiInitiateCheckout as trackInitiateCheckout, trackMultiPurchase as trackPurchase } from "@/lib/trackingBridge";

const BUNDLES: BundleOption[] = [
  {
    id: "1x",
    name: "1x Sérum Éclat (Cure Initiale)",
    subtitle: "Idéal pour tester l'efficacité. Durée: ~1 mois.",
    price: 9900,
    originalPrice: 15000,
    savings: 5100,
    quantity: 1,
    popular: false,
  },
  {
    id: "2x",
    name: "2x Sérum Éclat (Cure Complète)",
    subtitle: "Résultats optimaux sur les taches tenaces.",
    price: 18000,
    originalPrice: 30000,
    savings: 12000,
    quantity: 2,
    popular: true,
  },
  {
    id: "3x",
    name: "3x Sérum Éclat (Pack Anti-Taches Pro)",
    subtitle: "Teint parfait & durable. La meilleure offre.",
    price: 25000,
    originalPrice: 45000,
    savings: 20000,
    quantity: 3,
    popular: false,
  },
];

interface CustomerReview {
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  title: string;
  image?: string;
}

const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    name: "Aïcha M.",
    location: "Cotonou",
    rating: 5,
    title: "Le glow est incroyable",
    comment: "Mes taches d'acné ont presque disparu en 3 semaines. L'effet glowy est immédiat après l'application. Je recommande à 100%.",
    date: "Il y a 2 jours",
    image: "/images/serum-eclat/avis-1.png"
  },
  {
    name: "Sarah T.",
    location: "Abomey-Calavi",
    rating: 5,
    title: "Vraiment efficace",
    comment: "Le meilleur sérum pour l'hyperpigmentation. L'acide kojique fait vraiment la différence sans irriter ma peau.",
    date: "Il y a 1 semaine",
    image: "/images/serum-eclat/avis-2.png"
  },
  {
    name: "Paméla D.",
    location: "Porto-Novo",
    rating: 5,
    title: "Teint unifié",
    comment: "Mon teint est beaucoup plus lumineux et unifié. J'ai pris la cure complète (2 flacons) et je ne regrette pas.",
    date: "Il y a 2 semaines",
    image: "/images/serum-eclat/avis-3.png"
  }
];

const FAQS_DATA = [
  {
    q: "Comment utiliser ce Sérum Éclat ?",
    a: "Appliquez 3 à 5 gouttes sur le visage et le cou préalablement nettoyés, matin et soir. Massez doucement jusqu'à absorption complète avant d'appliquer votre crème hydratante."
  },
  {
    q: "Est-ce adapté aux peaux sensibles ?",
    a: "Oui, sa formule inspirée de la K-Beauty est enrichie en extraits apaisants de Curcuma. Cependant, comme il contient de l'acide kojique, nous recommandons un test cutané préalable."
  },
  {
    q: "Quand verrai-je les premiers résultats ?",
    a: "L'effet 'Glow' est immédiat. Pour l'atténuation des taches brunes et l'hyperpigmentation, les premiers résultats durables sont visibles après 2 à 3 semaines d'utilisation quotidienne."
  },
  {
    q: "Dois-je utiliser une protection solaire ?",
    a: "Oui ! L'acide kojique aide à unifier le teint, mais il rend la peau légèrement plus sensible au soleil. Une protection solaire en journée est fortement recommandée pour maintenir vos résultats."
  }
];

export default function SerumEclatLanding() {
  const router = useRouter();
  const utm = useUTM();

  // Page presence tracking
  usePagePresence("serum-eclat");

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [selectedBundle, setSelectedBundle] = useState<BundleOption | undefined>(BUNDLES[1]); // Default to popular
  const [reservationDate, setReservationDate] = useState("");

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Constants
  const PRODUCT_SLUG = "serum-eclat";
  const PRIMARY_COLOR = "#ea580c"; // orange-600
  const THEME_COLOR = "orange";

  const heroImages = [
    "/images/serum-eclat/serum-main.png",
    "/images/serum-eclat/serum-luxe-dore.png",
    "/images/serum-eclat/serum-kbeauty.png",
    "/images/serum-eclat/serum-rituel.png"
  ];

  const handleNextImage = () => setCurrentHeroImage((p) => (p + 1) % heroImages.length);
  const handlePrevImage = () => setCurrentHeroImage((p) => (p - 1 + heroImages.length) % heroImages.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);


  // Tracking
  useEffect(() => {
    trackViewContent({
      content_name: "Sérum Éclat au Curcuma & Acide Kojique",
      content_ids: ["serum-eclat"],
      value: 9900,
      currency: "XOF"
    });
  }, []);

  const scrollToOrder = () => {
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      trackInitiateCheckout({ content_name: "Sérum Éclat au Curcuma & Acide Kojique", content_ids: ["serum-eclat"] });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bundleToSave = selectedBundle || BUNDLES[0];

      const finalOrder = {
        product_slug: PRODUCT_SLUG,
        product_title: "Sérum Éclat au Curcuma & Acide Kojique",
        bundle_name: bundleToSave.name,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_phone2: "",
        city: city,
        address: address,
        total_amount: bundleToSave.price,
        status: "Nouveau",
        extraData: {
          isReservation: reservationDate.trim().length > 0,
          reservationDate: reservationDate.trim() || null,
          fromOrderForm: true,
          quantity: bundleToSave.quantity,
          utm: utm,
        }
      };

      const result = await saveNewOrder(finalOrder);

      if (result && result.success) {
        trackPurchase({
          content_name: "Sérum Éclat au Curcuma & Acide Kojique",
          content_ids: [PRODUCT_SLUG],
          value: bundleToSave.price,
          currency: "XOF",
          num_items: bundleToSave.quantity
        });
        await markLeadConverted(customerPhone, PRODUCT_SLUG);
        const orderIdParams = result.order?.id ? `&orderId=${result.order.id}` : '';
        router.push(`/p/${PRODUCT_SLUG}/success?name=${encodeURIComponent(customerName)}${orderIdParams}`);
      } else {
        alert("Une erreur est survenue lors de la validation. Veuillez réessayer.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue. Veuillez vérifier vos informations.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-orange-200">
      <main className="max-w-2xl mx-auto bg-white min-h-screen sm:shadow-2xl sm:border-x border-slate-100 overflow-hidden relative">

        {/* TOP BANNER */}
        <div className="bg-orange-600 text-white text-[11px] font-bold tracking-wide text-center py-2 px-4 shadow-sm relative z-10 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          STOCK LIMITÉ : LIVRAISON GRATUITE SUR COTONOU/CALAVI
        </div>

        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-b from-orange-50 to-white pb-6 pt-4">
          <div className="px-5 mb-4 text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-1.5 bg-orange-100/80 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">
              <Award className="w-3.5 h-3.5" />
              Soin Skincare K-Beauty
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-[1.15] tracking-tight">
              Sérum Éclat <span className="text-orange-600">Curcuma & Acide Kojique</span>
            </h1>
            <p className="text-sm font-medium text-slate-600 leading-snug max-w-md mx-auto">
              L'élixir anti-taches pour un teint radieux, lumineux et uniforme en 3 semaines.
            </p>
          </div>

          <div className="relative w-full aspect-square max-w-md mx-auto px-4">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-orange-900/10 border border-slate-100 bg-white">
              {heroImages.map((src, idx) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    idx === currentHeroImage ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Sérum Éclat au Curcuma vue ${idx + 1}`}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              ))}

              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-20 flex justify-between items-end">
                <div className="flex gap-1.5">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentHeroImage(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentHeroImage ? "w-6 bg-white" : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                <div className="bg-orange-600/90 backdrop-blur text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-orange-500/30">
                  -34% AUJOURD'HUI
                </div>
              </div>

              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-800 rounded-full shadow-md z-20 active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-800 rounded-full shadow-md z-20 active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-2 mt-6 max-w-sm mx-auto px-4">
            <div className="flex flex-col items-center justify-center p-2.5 bg-orange-50 rounded-2xl border border-orange-100/50">
              <Truck className="w-5 h-5 text-orange-600 mb-1" />
              <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide">Paiement à la<br/>Livraison</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 bg-orange-50 rounded-2xl border border-orange-100/50">
              <ShieldCheck className="w-5 h-5 text-orange-600 mb-1" />
              <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide">Testé &<br/>Approuvé</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 bg-orange-50 rounded-2xl border border-orange-100/50">
              <CheckCircle2 className="w-5 h-5 text-orange-600 mb-1" />
              <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide">Résultats<br/>Prouvés</span>
            </div>
          </div>
        </section>

        {/* ORDER FORM SECTION */}
        <div id="commander" className="py-6 px-4 scroll-mt-4">
          <div className="text-center mb-6">
             <h2 className="text-2xl font-black text-slate-900">Finaliser ma commande</h2>
             <p className="text-sm text-slate-500 mt-1">Paiement à la livraison, 100% sécurisé.</p>
          </div>

        {/* POURQUOI CHOISIR CE SÉRUM */}
        <section className="px-5 py-10 bg-white">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full">Secret de beauté</span>
            <h2 className="text-xl sm:text-2xl font-bold mt-3 text-slate-900 leading-tight">
              Pourquoi votre peau va l'adorer
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Une formule puissante qui cible les problèmes de peau à la source.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-4 items-start shadow-sm">
              <div className="bg-white shadow-sm p-2.5 rounded-xl border border-slate-100 flex-shrink-0">
                <Sun className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-[15px] mb-1">Teint Lumineux & Unifié</h3>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  L'association du <strong className="text-orange-700">Curcuma</strong> et de <strong className="text-orange-700">l'Acide Kojique</strong> cible et estompe les taches brunes, l'hyperpigmentation et les cicatrices d'acné.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-4 items-start shadow-sm">
              <div className="bg-white shadow-sm p-2.5 rounded-xl border border-slate-100 flex-shrink-0">
                <Droplets className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-[15px] mb-1">Hydratation Profonde</h3>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  Pénètre en profondeur pour repulper la peau, lisser les ridules et restaurer une barrière cutanée saine pour un "Glow" immédiat.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-4 items-start shadow-sm">
              <div className="bg-white shadow-sm p-2.5 rounded-xl border border-slate-100 flex-shrink-0">
                <Leaf className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-[15px] mb-1">Inspiré de la K-Beauty</h3>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  Formulation douce aux extraits naturels purs. Convient à tous les types de peau, même les plus sensibles, sans irritation.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* COMMENT CA MARCHE */}
        <section className="px-5 py-10 bg-orange-50 border-y border-orange-100">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Une routine simple pour un éclat absolu
            </h2>
          </div>

          <div className="max-w-sm mx-auto space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <p className="text-sm text-slate-700 font-medium">Nettoyez votre visage et séchez-le délicatement.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <p className="text-sm text-slate-700 font-medium">Appliquez 3 à 5 gouttes de sérum au creux de votre main.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <p className="text-sm text-slate-700 font-medium">Massez doucement sur votre visage jusqu'à absorption complète.</p>
            </div>
          </div>
        </section>

        {/* ── BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="mx-4 my-6 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-3xl p-6 text-white text-center flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-orange-900/10">
          <div className="space-y-1.5 w-full">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
              Testez le Sérum Éclat
            </h4>
            <p className="text-orange-100 text-xs sm:text-sm mt-1">
              Seulement <strong className="text-white font-mono text-base">9 900 FCFA</strong> (Cure initiale).
            </p>
            <button
              onClick={scrollToOrder}
              className="mt-4 w-full px-6 py-3.5 bg-white text-orange-700 font-bold text-sm rounded-xl hover:bg-orange-50 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Voir toutes les offres promotionnelles
            </button>
          </div>
        </div>

        {/* SECTION AVIS CLIENTS */}
        <section className="bg-slate-50 px-5 py-10 border-y border-slate-100">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-slate-800 font-bold text-sm ml-1.5">4.9/5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Elles l'ont adopté et partagent leurs résultats
            </h2>
          </div>

          <div className="space-y-8 max-w-sm mx-auto">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div key={idx} className="relative w-full shadow-lg rounded-2xl overflow-hidden border border-slate-100">
                {rev.image && (
                  <Image
                    src={rev.image}
                    alt={`Résultat ${rev.name}`}
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover block"
                  />
                )}
              </div>
            ))}
          </div>
        </section>


          <UmeiStyleOrderSection
            productSlug={PRODUCT_SLUG}
            productTitle="Sérum Éclat au Curcuma & Acide Kojique"
            productImage={heroImages[0]}
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={setSelectedBundle}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            address={address}
            setAddress={setAddress}
            city={city}
            setCity={setCity}
            reservationDate={reservationDate}
            setReservationDate={setReservationDate}
            isSubmitting={isSubmitting}
            onSubmit={handleOrderSubmit}
            accentColor={PRIMARY_COLOR}
          />
        </div>

        {/* FAQ SECTION */}
        <section className="px-5 py-10 bg-white">
          <div className="text-center mb-8">
            <h3 className="font-bold text-slate-900 text-xl">Questions Fréquentes</h3>
            <p className="text-xs text-slate-500 mt-1">Tout ce que vous devez savoir</p>
          </div>

          <div className="divide-y divide-slate-100 max-w-md mx-auto">
            {FAQS_DATA.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="py-3">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <span className="font-semibold text-sm text-slate-800 group-hover:text-orange-600 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-orange-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pt-2.5 pr-6 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-xs text-slate-400 space-y-2 py-8 bg-slate-50 border-t border-slate-200">
          <p>© {new Date().getFullYear()} ISIVENTE Bénin - Tous droits réservés.</p>
          <p className="text-[11px] px-4">Boutique officielle de distribution en ligne. Service client disponible 7j/7.</p>
        </footer>

      </main>

      <StickyMobileCtaBar
        price={selectedBundle ? selectedBundle.price : BUNDLES[0].price}
        targetSectionId="commander"
        accentColor={PRIMARY_COLOR}
        buttonText={`Commander (${selectedBundle ? selectedBundle.price : BUNDLES[0].price} F)`}
        whatsappMessage="Bonjour Isivente, je souhaite commander le Sérum Éclat au Curcuma & Acide Kojique."
      />

    </div>
  );
}
