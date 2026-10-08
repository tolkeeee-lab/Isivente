"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  Star,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Sparkles,
  Droplets,
  Heart,
  Zap,
  PackageCheck,
  Award,
  ArrowRight,
  Smile
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
    name: "Routine Sourire Éclatant (Spray + Dentifrice)",
    subtitle: "Spray buccal Haleine Fraîche + Dentifrice Violet Correcteur Raisin & Menthe",
    price: 14900,
    originalPrice: 20000,
    savings: 9000,
    quantity: 1,
    popular: true,
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
    name: "Amina T.",
    location: "Cotonou (Fidjrossè)",
    rating: 5,
    date: "Achat vérifié",
    title: "Le dentifrice violet est magique",
    comment: "Je bois beaucoup de café et j'avais les dents un peu jaunes. Dès la première semaine d'utilisation, j'ai vu la différence. Le spray est super pratique dans le sac à main !",
    verified: true,
  },
  {
    name: "Jules K.",
    location: "Calavi (Arbre de la paix)",
    rating: 5,
    date: "Achat vérifié",
    title: "Très bonne haleine toute la journée",
    comment: "Le goût raisin-menthe du dentifrice change des menthes fortes classiques, c'est très agréable. Et le spray donne vraiment un coup de frais instantané avant une réunion.",
    verified: true,
  },
  {
    name: "Gloria M.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Kit indispensable",
    comment: "Livraison rapide. J'ai payé à la réception sans problème. Le duo fonctionne super bien ensemble, mes dents sont plus blanches et brillantes.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Comment fonctionne le dentifrice violet ?",
    a: "Le dentifrice utilise la technologie de correction de couleur. Le violet est l'opposé du jaune sur le cercle chromatique. En appliquant le dentifrice violet, il neutralise les sous-tons jaunes de vos dents, les rendant instantanément plus blanches."
  },
  {
    q: "Le spray buccal contient-il de l'alcool ?",
    a: "Non, notre spray buccal est formulé sans alcool pour ne pas assécher la bouche. Il utilise des extraits naturels pour rafraîchir l'haleine instantanément et éliminer les mauvaises odeurs."
  },
  {
    q: "Combien de fois par jour puis-je utiliser le spray ?",
    a: "Vous pouvez utiliser le spray buccal aussi souvent que nécessaire, par exemple après un repas, un café ou avant un rendez-vous important."
  },
  {
    q: "Est-ce adapté aux dents sensibles ?",
    a: "Oui, la formule du dentifrice est douce et n'agresse pas l'émail, ce qui le rend parfaitement adapté aux personnes ayant les dents et les gencives sensibles."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison s'effectue en 24h chrono à Cotonou, Calavi et partout au Bénin. Vous payez en espèces (14 900 FCFA) uniquement après avoir reçu votre colis auprès du livreur."
  }
];

export default function SourireEclatantLanding({ slug = "sourire-eclatant" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
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
        product_slug: "sourire-eclatant",
        product_title: "Routine Sourire Éclatant",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Routine Sourire Éclatant",
      content_ids: ["sourire-eclatant", "soin-dentaire"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Routine Sourire Éclatant",
      content_ids: ["sourire-eclatant"],
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
        product_title: "Routine Sourire Éclatant (Spray + Dentifrice)",
        product_slug: "sourire-eclatant",
        customer_name: customerName.trim() || "Cliente Isivente",
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

      markLeadConverted(customerPhone.trim(), "sourire-eclatant");



      const successUrl = `/p/sourire-eclatant/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">

      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Smile className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(147,51,234,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-purple-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">

        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-100 text-purple-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Soin Bucco-Dentaire Premium</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Un sourire <span className="text-purple-600">éclatant</span> et une haleine <span className="text-teal-600">fraîche</span> toute la journée.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Le duo parfait pour corriger les taches jaunes et garder une haleine purifiée en toute circonstance. Retrouvez confiance en votre sourire.
          </p>
        </div>

        {/* ── IMAGE HERO UNIQUE (SANS TEXTE, SANS CARROUSEL) ── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5">
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">

            {/* 🏷️ BADGE CIRCULAIRE EMBLÉMATIQUE : 3-en-1 (HAUT GAUCHE) */}
            <div className="absolute -top-3 -left-2 sm:-left-4 w-[92px] h-[92px] sm:w-[106px] sm:h-[106px] bg-[#E9D5FF] text-[#241B36] rounded-full flex items-center justify-center text-center font-black text-[11px] sm:text-[12px] leading-tight p-2 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.22)] -rotate-12 z-20 pointer-events-none border-2 border-white select-none">
              Duo Spray + Dentifrice
            </div>

            {/* 🏷️ BADGE CIRCULAIRE EMBLÉMATIQUE : Sans chaleur agressive (BAS DROITE) */}
            <div className="absolute -bottom-3 -right-2 sm:-right-4 w-[84px] h-[84px] sm:w-[94px] sm:h-[94px] bg-[#CCFBF1] text-[#134E4A] rounded-full flex items-center justify-center text-center font-black text-[10px] sm:text-[11px] leading-tight p-2 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.22)] rotate-12 z-20 pointer-events-none border-2 border-white select-none">
              Correction V34
            </div>

            {/* Cadre image produit interne avec coins arrondis */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
              <Image
                src="/images/sourire-eclatant/offre-duo.png"
                alt="Routine Sourire Éclatant Duo"
                fill
                className="object-contain p-2 sm:p-4"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />

              {/* Pastille Prix Officiel */}
              <div className="absolute top-3 right-3 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                  14 900 FCFA
                </span>
              </div>

              {/* Sous-titre rassurant en bas */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-4 text-white text-xs sm:text-sm font-medium z-10">
                <p className="line-clamp-1">Spray haleine fraîche & dentifrice correcteur couleur V34 - Action immédiate</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après réception</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Sûr et Efficace</p>
              <p className="text-[11px] text-slate-500">Formule douce pour l'émail</p>
            </div>
          </div>
        </div>

        {/* ── PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug="sourire-eclatant"
            productTitle="Routine Sourire Éclatant (Spray + Dentifrice)"
            productImage="/images/sourire-eclatant/offre-duo.png"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Routine Sourire - ${b.name}`,
                content_ids: ["sourire-eclatant", b.id || "solo"],
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
            accentColor="#9333ea"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 4 FONCTIONS MAJEURES DU DUO SOURIRE ÉCLATANT ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">L'alliance parfaite</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 raisons d'adopter cette routine</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une technologie avancée pour un résultat visible rapidement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

            {/* Action 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Technologie V34</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le dentifrice violet neutralise optiquement les sous-tons jaunes de l'émail pour révéler des dents visiblement plus blanches.
              </p>
            </div>

            {/* Action 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Zap className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Haleine fraîche instantanée</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le spray buccal combat les bactéries responsables de la mauvaise haleine d'un seul pschitt.
              </p>
            </div>

            {/* Action 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Heart className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Doux pour l'émail</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contrairement aux traitements blanchissants abrasifs, cette routine respecte l'émail et prévient la sensibilité dentaire.
              </p>
            </div>

            {/* Action 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Award className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Saveur Raisin & Menthe</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Une combinaison unique et agréable qui laisse une sensation de propreté et de fraîcheur durable en bouche.
              </p>
            </div>

          </div>
        </section>

        {/* ── SECTION DÉMONSTRATION (Remplacement Vidéo par Image) ── */}
        <section id="demo-video" className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Un résultat éclatant</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Découvrez la puissance du violet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Le secret pour illuminer votre sourire sans traitement lourd.
            </p>
          </div>

          <div className="relative max-w-sm sm:max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/sourire-eclatant/routine.png"
              alt="Routine en action"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander le duo (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Pourquoi choisir cette routine ?</h3>
            <p className="text-xs sm:text-sm text-slate-500">La différence est immédiate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Classique */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Dentifrice ordinaire</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Nettoie mais ne corrige pas les reflets jaunes du quotidien (thé, café).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Effet rafraîchissant qui s'estompe très vite.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Traitements blanchissants souvent agressifs pour l'émail et douloureux.</span>
                </li>
              </ul>
            </div>

            {/* Routine YUFAN */}
            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-200/80 space-y-3">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Routine Sourire Éclatant</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span><strong>Technologie V34</strong> : corrige optiquement le jaune pour des dents plus blanches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span><strong>Spray nomade</strong> : une haleine irréprochable partout avec vous.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span><strong>Soin respectueux</strong> : pas de sensibilité dentaire, idéal pour un usage quotidien.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── SECTION INFOGRAPHIE & GUIDE VISUEL COMPLET ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Le duo gagnant</span>
            <h3 className="font-bold text-slate-900 text-base sm:text-xl">
              Votre arme secrète pour un sourire radieux
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Utilisez le dentifrice matin et soir, et gardez le spray avec vous la journée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
              <Image
                src="/images/sourire-eclatant/dentifrice.png"
                alt="Dentifrice Violet V34"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
              />
            </div>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
              <Image
                src="/images/sourire-eclatant/spray.png"
                alt="Spray Buccal Haleine Fraîche"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
              />
            </div>
          </div>
        </section>

        {/* ── BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-3xl p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-purple-950/10">
          <div className="space-y-1.5">
            <span className="bg-white/20 backdrop-blur-md text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Offre Spéciale Isivente
            </span>
            <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Commandez votre Routine Sourire Éclatant
            </h4>
            <p className="text-purple-100 text-xs sm:text-sm">
              Seulement <strong className="text-white font-mono text-base">14 900 FCFA</strong> au lieu de <span className="line-through opacity-75">20 000 FCFA</span>.
            </p>
          </div>
          <button
            onClick={scrollToOrder}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-purple-900 font-bold text-sm rounded-xl hover:bg-purple-50 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            Commander maintenant (14 900 F)
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
              <span className="text-slate-500 text-xs">(Avis clients certifiés au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ce que disent nos clients</h2>
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
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-semibold border border-purple-100">
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
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-purple-700 transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-purple-600" : ""
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

      {/* ── BARRE MOBILE STICKY CTA (PILIER 1 & 2) ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        accentColor="#9333ea"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander la Routine Sourire Éclatant à 14 900 FCFA."
      />

    </div>
  );
}
