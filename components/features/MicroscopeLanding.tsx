"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  ChevronDown, 
  ZoomIn, 
  BatteryCharging, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Scan, 
  Coins, 
  Bug, 
  Sparkles,
  Layers,
  Check
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";

const BUNDLES: BundleOption[] = [
  {
    id: "duo",
    name: "Pack Famille & Duo (2 Microscopes)",
    subtitle: "2 Microscopes HD 1000X avec câbles USB-C et dragonnes de maintien",
    price: 29900,
    originalPrice: 50000,
    savings: 20100,
    quantity: 2,
    popular: true,
  },
  {
    id: "solo",
    name: "Pack Découverte (1 Microscope)",
    subtitle: "1 Microscope de poche avec écran couleur 2.0\", 8 LEDs et batterie rechargeable",
    price: 16900,
    originalPrice: 25000,
    savings: 8100,
    quantity: 1,
    popular: false,
  },
  {
    id: "pro_sd",
    name: "Pack Explorateur VIP (+ Carte SD 32Go)",
    subtitle: "1 Microscope HD 1000X + Carte mémoire 32Go pour capture photo et vidéo",
    price: 21900,
    originalPrice: 32000,
    savings: 10100,
    quantity: 1,
    popular: false,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/microscope-hero.jpg", 
    alt: "Microscope Numérique Portable HD 1000X",
    caption: "Boîtier ergonomique avec écran LCD couleur 2.0\" et bague de mise au point micrométrique"
  },
  { 
    src: "/images/microscope-skin.jpg", 
    alt: "Inspection de la peau et des pores au microscope",
    caption: "Observation directe des pores cutanés, racines capillaires et micro-textures"
  },
  { 
    src: "/images/microscope-circuit.jpg", 
    alt: "Vérification des billets de banque et micro-soudures",
    caption: "Contrôle des filigranes de sécurité et inspection des composants électroniques SMD"
  },
];

const REVIEWS_DATA = [
  {
    name: "Mathieu T.",
    city: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Rendu optique très net. Les enfants observent les insectes et les feuilles sans difficulté. Nous avons également vérifié les micro-impressions d'un billet de banque.",
    verified: true,
  },
  {
    name: "Serge K.",
    city: "Abomey-Calavi",
    rating: 5,
    date: "Il y a 4 jours",
    comment: "Utilisé pour le diagnostic de cartes mères de smartphones. Les pistes et soudures apparaissent nettement sur l'écran sans fatigue oculaire.",
    verified: true,
  },
  {
    name: "Aïcha G.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 6 jours",
    comment: "Appareil compact et immédiatement fonctionnel dès le déballage. Le livreur a patienté pendant la vérification du produit.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "L'appareil nécessite-t-il une connexion smartphone ou un ordinateur ?",
    a: "Non. Le microscope intègre son propre écran couleur LCD de 2.0 pouces et sa batterie interne. L'affichage s'effectue directement sur l'appareil dès l'allumage."
  },
  {
    q: "Quelles sont les capacités réelles d'observation ?",
    a: "Le système optique permet de distinguer les micro-soudures électroniques, les pores de la peau, les fibres textiles, les trames d'impression de sécurité et les détails anatomiques d'insectes (jusqu'à 1000X avec grossissement optique et numérique)."
  },
  {
    q: "Comment fonctionne l'enregistrement des images ?",
    a: "L'appareil dispose d'un emplacement pour carte Micro-SD. Un bouton physique dédié permet de déclencher une capture photo ou un enregistrement vidéo."
  },
  {
    q: "Quelles sont les conditions de livraison et de règlement au Bénin ?",
    a: "Livraison sous 24h à Cotonou, Calavi et Porto-Novo. Le règlement s'effectue en espèces à la livraison après contrôle du colis."
  }
];

export default function MicroscopeLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
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

  useEffect(() => {
    trackUserSession(slug || "microscope", 0, false, "sess_" + Date.now());
  }, [slug]);

  const scrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");

    if (!customerName.trim()) {
      setOrderError("Veuillez renseigner votre nom complet.");
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8) {
      setOrderError("Veuillez renseigner un numéro de téléphone valide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await saveNewOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: address.trim() || `${city} - Livraison à domicile`,
        shipping_city: city,
        product_slug: "microscope",
        product_title: "Microscope Numérique Portable HD 1000X",
        bundle_id: selectedBundle.id || "solo",
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity || 1,
        total_amount: selectedBundle.price,
        status: "pending",
      });

      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      }).catch(() => {});

      router.push(`/p/microscope/success?order=${order.order_number || ""}`);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* ── BANDEAU TOP BAR SUBTIL ── */}
      <div className="bg-[#11131a] border-b border-white/[0.06] text-slate-300 text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Livraison express sous 24h • Règlement à la réception après vérification</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FIGMA-GRADE ── */}
      <header className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scan className="w-3.5 h-3.5 stroke-[1.75]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-100">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] rounded-xl border border-indigo-400/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_12px_rgba(99,102,241,0.25)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-indigo-200 text-[11px]">(16 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Display & Titre */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
            <ZoomIn className="w-3.5 h-3.5 text-indigo-400 stroke-[1.75]" />
            <span>Optique Numérique 1000X</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-[-0.03em] text-slate-50 leading-tight">
            Microscope Numérique Portable HD
          </h1>
          
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Observation directe sur écran LCD 2.0 pouces avec éclairage 8 LED intégré. Conçu pour le contrôle de précision, l'électronique et l'exploration scientifique.
          </p>
        </div>

        {/* ── GALERIE DE SURFACE BISEAUTÉE (Obsidian Pro) ── */}
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.035] to-transparent bg-[#11131a] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_-4px_rgba(0,0,0,0.5)] p-3 sm:p-4 space-y-3">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#090a0f] border border-white/[0.06]">
            <img 
              src={CAROUSEL_IMAGES[activeImgIndex].src} 
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
            />
            <div className="absolute bottom-3 inset-x-3 bg-[#090a0f]/85 backdrop-blur-md border border-white/[0.08] rounded-lg p-2.5 text-xs text-slate-300 text-center font-normal shadow-lg">
              {CAROUSEL_IMAGES[activeImgIndex].caption}
            </div>
          </div>

          {/* Miniatures */}
          <div className="grid grid-cols-3 gap-2">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] cursor-pointer ${
                  activeImgIndex === idx 
                    ? "border-indigo-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(99,102,241,0.5)]" 
                    : "border-white/[0.08] opacity-50 hover:opacity-90"
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── GRILLE DE STATUTS TECHNIQUES ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent bg-[#11131a] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] text-center space-y-1">
            <Truck className="w-4 h-4 text-indigo-400 mx-auto stroke-[1.75]" />
            <div className="text-xs font-semibold text-slate-200">Livraison 24h</div>
            <div className="text-[10px] text-slate-400 font-mono">Cotonou & Calavi</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent bg-[#11131a] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] text-center space-y-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto stroke-[1.75]" />
            <div className="text-xs font-semibold text-slate-200">Contrôle à Réception</div>
            <div className="text-[10px] text-slate-400 font-mono">Paiement après test</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent bg-[#11131a] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] text-center space-y-1">
            <BatteryCharging className="w-4 h-4 text-amber-400 mx-auto stroke-[1.75]" />
            <div className="text-xs font-semibold text-slate-200">USB-C Intégré</div>
            <div className="text-[10px] text-slate-400 font-mono">Batterie autonome</div>
          </div>
        </div>

        {/* ── CAS D'USAGE & DOMAINES D'APPLICATION ── */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">Applications</div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-[-0.02em]">Domaines d'utilisation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#11131a] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Cpu className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-200">Micro-électronique & Cartes Mères</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Contrôle des pistes de cuivre, diagnostic des composants de montage en surface (SMD) et vérification des micro-soudures.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#11131a] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Coins className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-200">Authentification & Numismatique</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Examen des micro-lignes de sécurité, filigranes et reliefs sur les billets de banque, poinçons de métaux précieux et timbres.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#11131a] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Scan className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-200">Dermatologie & Textures Biologiques</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Inspection de la structure cutanée, de la racine des follicules pileux, des fibres textiles et des surfaces minérales.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#11131a] border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Bug className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-200">Éducation & Observation Naturelle</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Étude de la structure des feuilles végétales, micro-organismes, cristaux de sel et insectes pour l'apprentissage scientifique.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CARACTÉRISTIQUES TECHNIQUES ── */}
        <section className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent bg-[#11131a] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-4">
          <div className="text-xs font-semibold text-slate-200">Caractéristiques techniques</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#090a0f] p-3 rounded-lg border border-white/[0.06]">
              <div className="text-slate-400 text-[10.5px]">Grossissement</div>
              <div className="text-slate-100 font-mono tabular-nums font-semibold mt-0.5">50X à 1000X</div>
            </div>
            <div className="bg-[#090a0f] p-3 rounded-lg border border-white/[0.06]">
              <div className="text-slate-400 text-[10.5px]">Affichage</div>
              <div className="text-slate-100 font-semibold mt-0.5">Écran LCD 2.0"</div>
            </div>
            <div className="bg-[#090a0f] p-3 rounded-lg border border-white/[0.06]">
              <div className="text-slate-400 text-[10.5px]">Éclairage</div>
              <div className="text-slate-100 font-semibold mt-0.5">8 LEDs réglables</div>
            </div>
            <div className="bg-[#090a0f] p-3 rounded-lg border border-white/[0.06]">
              <div className="text-slate-400 text-[10.5px]">Connectique</div>
              <div className="text-slate-100 font-semibold mt-0.5">Port USB Type-C</div>
            </div>
          </div>
        </section>

        {/* ── FORMULAIRE DE COMMANDE ENCADRÉ ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="microscope"
            productTitle="Microscope Numérique Portable HD 1000X"
            productImage="/images/microscope-hero.jpg"
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
            accentColor="#6366f1"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── RETOURS D'EXPÉRIENCE ── */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">Avis</div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-[-0.02em]">Retours d'expérience clients</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#11131a] border border-white/[0.07] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 text-xs">{rev.name}</div>
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                </div>
                <div className="text-[10.5px] text-slate-400 font-mono">{rev.city} • {rev.date}</div>
                <p className="text-xs text-slate-300 leading-relaxed">« {rev.comment} »</p>
                <div className="flex items-center gap-1 text-[10.5px] text-emerald-400 font-medium pt-1 border-t border-white/[0.05]">
                  <CheckCircle2 className="w-3 h-3 stroke-[1.75]" />
                  <span>Achat vérifié</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOIRE AUX QUESTIONS ── */}
        <section className="p-5 rounded-2xl bg-[#11131a] border border-white/[0.08] space-y-3">
          <div className="text-xs font-semibold text-slate-200">Questions fréquentes</div>

          <div className="divide-y divide-white/[0.06]">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-indigo-300 transition-colors duration-100 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── BARRE MOBILE FLOTTANTE ── */}
      <StickyMobileCtaBar
        price={16900}
        accentColor="#6366f1"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Microscope Numérique Portable HD 1000X à 16 900 FCFA avec livraison à domicile."
      />

    </div>
  );
}
