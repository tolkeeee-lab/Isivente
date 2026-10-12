"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Sun,
  Moon,
  Car,
  Eye,
  Zap,
  PackageCheck,
  Award,
  ArrowRight,
  Settings2,
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackInitiateCheckout, trackAddToCart } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Pare-Soleil Anti-Eblouissement 2-en-1 Jour/Nuit (Vision Claire HD)",
    subtitle: "Clip universel + 2 ecrans (jaune jour & fume nuit) + garantie Isivente",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const HERO_IMAGES = [
  { src: "/images/pare-soleil/pare-soleil-reel.jpg", alt: "Pare-soleil anti-eblouissement installe en situation reelle dans un vehicule" },
  { src: "/images/pare-soleil/pare-soleil-hero-1.jpg", alt: "Pare-soleil anti-eblouissement dans une voiture" },
  { src: "/images/pare-soleil/pare-soleil-hero-2.jpg", alt: "Les deux ecrans jaune et fume du pare-soleil" },
  { src: "/images/pare-soleil/pare-soleil-hero-3.jpg", alt: "Installation en 3 etapes du pare-soleil" },
  { src: "/images/pare-soleil/pare-soleil-hero-4.jpg", alt: "Un seul accessoire pour deux situations" },
  { src: "/images/pare-soleil/pare-soleil-hero-5.jpg", alt: "Comparaison jour et nuit avec le pare-soleil" },
];

const CUSTOMER_REVIEWS = [
  { name: "Prosper K.", location: "Cotonou (Fidjrosse)", rating: 5, title: "Conduite de nuit transformee", comment: "Les phares des voitures en face m'eblouissaient tellement. Depuis que j'utilise l'ecran fume la nuit, je vois parfaitement. Le clip tient parfaitement sur mon pare-soleil d'origine.", verified: true },
  { name: "Reine A.", location: "Porto-Novo", rating: 5, title: "Parfait contre le soleil couchant", comment: "La lumiere du soleil au coucher m'aveuglait tous les soirs. L'ecran jaune filtre exactement ce qu'il faut sans assombrir la route. Simple a basculer d'un ecran a l'autre.", verified: true },
  { name: "Marcel D.", location: "Calavi (Akassato)", rating: 5, title: "Livraison rapide, qualite solide", comment: "J'ai pu tester l'article avant de payer. Le mecanisme pivot est robuste, les deux ecrans se deploient facilement. Vraiment utile pour le trajet quotidien.", verified: true },
];

const FAQS_DATA = [
  { q: "Est-ce que le pare-soleil s'adapte a toutes les voitures ?", a: "Oui. Le systeme de clip universel se fixe sur le pare-soleil d'origine de pratiquement toutes les voitures (berlines, 4x4, monospaces). Il suffit de clipser le support sur votre pare-soleil existant sans percage ni modification." },
  { q: "Quelle est la difference entre l'ecran jaune et l'ecran fume ?", a: "L'ecran jaune (ambre) filtre la lumiere eblouissante du soleil rasant du matin ou du soir. L'ecran fume reduit l'eblouissement des phares des vehicules en face sans assombrir la route." },
  { q: "Est-ce legal de conduire avec ce pare-soleil ?", a: "Oui. Ce type d'accessoire est un complement au pare-soleil d'origine de votre voiture. Les ecrans laissent passer suffisamment de lumiere pour une conduite securisee." },
  { q: "Comment se deroulent la livraison et le paiement ?", a: "Livraison en 24h chrono a Cotonou, Calavi et partout au Benin. Vous payez 14 900 FCFA en especes uniquement apres avoir recu et verifie votre article. Zero risque." },
  { q: "Est-ce difficile a installer ?", a: "Non, l'installation prend moins de 30 secondes. Clipser le support, deployer les deux ecrans, puis pivoter selon la lumiere. Aucun outil necessaire." },
];

export default function ParesoleilLanding({ slug = "pare-soleil" }: { slug?: string }) {
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
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (isHeroHovered) return;
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), 3800);
    return () => clearInterval(timer);
  }, [isHeroHovered]);

  const heroNext = useCallback(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), []);
  const heroPrev = useCallback(() => setHeroIndex((i) => (i - 1 + HERO_IMAGES.length) % HERO_IMAGES.length), []);

  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        city,
        address,
        product_slug: slug,
        product_title: "Pare-Soleil Anti-Eblouissement 2-en-1",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle, slug]);

  useEffect(() => {
    trackViewContent({
      content_name: "Pare-Soleil Anti-Eblouissement 2-en-1 Jour/Nuit",
      content_ids: [slug, "pare-soleil"],
      value: 14900,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Pare-Soleil Anti-Eblouissement 2-en-1",
      content_ids: [slug],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    document.getElementById("commander")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      setOrderError("Veuillez renseigner votre numero de telephone pour la livraison.");
      return;
    }
    setIsSubmitting(true);
    setOrderError("");
    try {
      const order = await saveNewOrder({
        product_title: "Pare-Soleil Anti-Eblouissement 2-en-1 Jour/Nuit",
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
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Pare-Soleil Anti-Eblouissement 2-en-1",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }
      router.push(`/p/${slug}/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`);
    } catch (err: any) {
      setOrderError(err?.message || "Une erreur est survenue. Veuillez reessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">

      {/* BANDEAU TOP BAR */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Livraison express 24h a Cotonou, Calavi & tout le Benin • Paiement en especes a la livraison</span>
        </div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Car className="w-4 h-4 text-amber-600 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>
          <button
            onClick={scrollToOrder}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_2px_8px_-2px_rgba(245,158,11,0.45)] transition-all duration-100 cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-amber-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">

        {/* TITRE & ACCROCHE */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
            <Car className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Accessoire auto anti-eblouissement</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Conduire sans etre <span className="text-amber-500">aveugle</span>{" "}
            — de jour comme <span className="text-slate-500">de nuit.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Deux ecrans interchangeables sur un seul clip : jaune pour bloquer le soleil eblouissant, fume pour attenuer les phares des voitures en face.
          </p>
        </div>

        {/* CARROUSEL HERO */}
        <div
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-4"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
            {HERO_IMAGES.map((img, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === heroIndex ? "opacity-100" : "opacity-0"}`}>
                <Image src={img.src} alt={img.alt} fill className="object-cover" priority={i === 0} sizes="(max-width: 768px) 100vw, 768px" />
              </div>
            ))}

            <button onClick={heroPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center transition-all cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button onClick={heroNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center transition-all cursor-pointer">
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 pt-3">
            {HERO_IMAGES.map((img, i) => (
              <button key={i} onClick={() => setHeroIndex(i)} className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${i === heroIndex ? "border-amber-500 shadow-md scale-110" : "border-slate-200 opacity-60 hover:opacity-90"}`}>
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
        </div>

        {/* 3 BADGES RÉASSURANCE */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Truck className="w-4 h-4 stroke-[1.75]" />, label: "Livraison Express 24h", cls: "text-emerald-700 bg-emerald-50 border-emerald-100" },
            { icon: <PackageCheck className="w-4 h-4 stroke-[1.75]" />, label: "Paiement a la Reception", cls: "text-blue-700 bg-blue-50 border-blue-100" },
            { icon: <ShieldCheck className="w-4 h-4 stroke-[1.75]" />, label: "Garantie & Test 100%", cls: "text-amber-700 bg-amber-50 border-amber-100" },
          ].map((b, i) => (
            <div key={i} className={`flex flex-col items-center gap-1.5 text-center p-3 rounded-2xl border ${b.cls}`}>
              <div>{b.icon}</div>
              <span className="text-[10px] sm:text-xs font-semibold leading-tight">{b.label}</span>
            </div>
          ))}
        </div>

        {/* FORMULAIRE COD */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          <UmeiStyleOrderSection
            productSlug={slug}
            productTitle="Pare-Soleil Anti-Éblouissement 2-en-1 Jour/Nuit (Vision Claire HD)"
            productImage="/images/pare-soleil/pare-soleil-reel.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `Pare-Soleil - ${b.name}`,
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
            accentColor="#f59e0b"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* BÉNÉFICES */}
        <section className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">Deux ecrans, une seule solution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Sun className="w-5 h-5 text-amber-500 stroke-[1.75]" />, bg: "bg-amber-50 border-amber-100", title: "Ecran Jaune — Le jour", desc: "Filtre la lumiere eblouissante du soleil rasant (matin & soir) tout en conservant une excellente visibilite. Ideal pour le trajet domicile-travail." },
              { icon: <Moon className="w-5 h-5 text-slate-500 stroke-[1.75]" />, bg: "bg-slate-50 border-slate-200", title: "Ecran Fume — La nuit", desc: "Attenue l'eblouissement des phares des voitures en sens inverse. Reduisez la fatigue oculaire sur les routes non eclairees." },
              { icon: <Settings2 className="w-5 h-5 text-blue-500 stroke-[1.75]" />, bg: "bg-blue-50 border-blue-100", title: "Reglable selon votre hauteur", desc: "Le mecanisme pivot vous permet d'ajuster l'angle des deux ecrans independamment. Parfait pour tout conducteur." },
              { icon: <Car className="w-5 h-5 text-emerald-600 stroke-[1.75]" />, bg: "bg-emerald-50 border-emerald-100", title: "Clip Universel Sans Percage", desc: "Se fixe en 5 secondes sur votre pare-soleil d'origine sans colle, sans vis, sans outil. Compatible avec pratiquement toutes les voitures." },
            ].map((b, i) => (
              <div key={i} className={`flex gap-4 p-4 rounded-2xl border ${b.bg}`}>
                <div className="mt-0.5 shrink-0">{b.icon}</div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 mb-1">{b.title}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EN SITUATION RÉELLE (REMPLACE LA VIDÉO POUR UN CHARGEMENT ULTRA RAPIDE) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 uppercase tracking-wider px-3 py-1 rounded-full">
              En Condition Réelle de Conduite
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Voyez le rendu en utilisation réelle
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Fixation instantanée par clip sur votre pare-soleil d&apos;origine. Les deux écrans s&apos;ajustent d&apos;un simple geste pour une visibilité haute définition.
            </p>
          </div>

          <div className="relative max-w-sm sm:max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
            <Image
              src="/images/pare-soleil/pare-soleil-reel.jpg"
              alt="Pare-soleil anti-éblouissement 2-en-1 testé en condition réelle"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 448px"
              loading="lazy"
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.97] text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_4px_14px_-4px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
            >
              <span>Commander maintenant (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* COMPARATIF */}
        <section className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">Pare-soleil classique vs 2-en-1</h2>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
              <div className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Critere</div>
              <div className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center border-x border-slate-200">Classique</div>
              <div className="p-3 text-xs font-semibold text-amber-600 uppercase tracking-wider text-center">2-en-1 Isivente</div>
            </div>
            {[
              ["Soleil matin/soir", "Couvre partiellement", "Filtrage total ecran jaune"],
              ["Phares la nuit", "Aucune protection", "Reduction immediate"],
              ["Reglage en hauteur", "Position fixe", "Pivot ajustable"],
              ["Installation", "Integre vehicule", "30 sec. clip universel"],
              ["2 situations couvertes", "Non", "Oui — jour ET nuit"],
            ].map(([crit, old, nw], i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-slate-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                <div className="p-3 text-xs text-slate-700 font-medium">{crit}</div>
                <div className="p-3 flex items-center justify-center gap-1 border-x border-slate-100">
                  <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="text-xs text-slate-400">{old}</span>
                </div>
                <div className="p-3 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs text-emerald-700 font-medium">{nw}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GUIDE INSTALLATION */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">Installation en 3 etapes</h2>
          <div className="rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            <Image src="/images/pare-soleil/pare-soleil-hero-3.jpg" alt="Guide installation pare-soleil en 3 etapes" width={800} height={600} className="w-full h-auto object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: "1", label: "Fixez", desc: "Clipser sur votre pare-soleil d'origine" },
              { step: "2", label: "Deployez", desc: "Installer les deux ecrans" },
              { step: "3", label: "Ajustez", desc: "Pivoter selon la lumiere" },
            ].map((s) => (
              <div key={s.step} className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center space-y-1">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white text-sm font-black flex items-center justify-center mx-auto">{s.step}</div>
                <div className="font-bold text-sm text-slate-900">{s.label}</div>
                <p className="text-[11px] text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BANNIÈRE PROMO */}
        <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            Offre Limitee — Stock reduit
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Conduisez en toute securite pour <span className="text-amber-400">14 900 FCFA</span>
          </h2>
          <p className="text-sm text-slate-300 max-w-xs mx-auto">Paiement a la livraison. Vous verifiez avant de payer. Livraison 24h.</p>
          <button onClick={scrollToOrder} className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm rounded-2xl active:scale-[0.97] transition-all cursor-pointer">
            Je commande maintenant <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* AVIS CLIENTS */}
        <section className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Avis Clients Verifies</h2>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              <span className="text-sm font-bold text-slate-700 ml-1">4.9/5</span>
              <span className="text-xs text-slate-400 ml-1">· 127 avis verifies</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((r, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{r.name}</div>
                    <div className="text-[11px] text-slate-400">{r.location}</div>
                  </div>
                  {r.verified && <span className="shrink-0 inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Verifie</span>}
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <div className="font-medium text-sm text-slate-800">{r.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">Questions Frequentes</h2>
          <div className="space-y-2">
            {FAQS_DATA.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 pt-8 text-center space-y-2 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-600 text-xs">ISIVENTE — Commerce en ligne au Benin</p>
          <p>Livraison partout au Benin · Paiement en especes a la reception · Service client WhatsApp</p>
          <p>&copy; {new Date().getFullYear()} Isivente. Tous droits reserves.</p>
        </footer>
      </main>

      {/* STICKY MOBILE CTA */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        accentColor="#f59e0b"
        buttonText="Commander (14 900 F)"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Pare-Soleil Anti-Éblouissement 2-en-1 Jour/Nuit à 14 900 FCFA."
      />
    </div>
  );
}
