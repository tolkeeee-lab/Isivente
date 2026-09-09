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
  Scan, 
  Coins, 
  Bug, 
  Sparkles,
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
    subtitle: "2 Microscopes HD 1000X complets avec câbles de charge et dragonnes",
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
    src: "/images/microscope-monde-decouverte.jpg", 
    alt: "Un autre monde dans ses mains - Mini microscope numérique",
    caption: "Écran couleur LCD 2.0\" intégré, grossissement HD 1000X, éclairage 8 LEDs et batterie rechargeable USB"
  },
  { 
    src: "/images/microscope-scientifique-action.jpg", 
    alt: "Un petit scientifique en action - Observer Découvrir Apprendre",
    caption: "Développe la curiosité scientifique des enfants et les éloigne naturellement des écrans de smartphones"
  },
  { 
    src: "/images/microscope-detection-poux.jpg", 
    alt: "Détection des poux, lentes et examen du cuir chevelu",
    caption: "Examen direct et rapide du cuir chevelu, des racines, des fibres et des objets du quotidien"
  },
  { 
    src: "/images/microscope-cadeau-unboxing.jpg", 
    alt: "Le cadeau éducatif qui fait vraiment plaisir",
    caption: "Idée cadeau originale et ludique prête à offrir avec son coffret complet et ses accessoires"
  },
];

interface CustomerReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  image: string;
  imageCaption: string;
  verified: boolean;
}

const REVIEWS_DATA: CustomerReview[] = [
  {
    name: "rbrown",
    location: "Client Amazon Vérifié",
    rating: 5,
    date: "Achat vérifié",
    title: "Outil parfait pour explorer et apprendre pour les enfants !!",
    comment: "J'en ai commandé deux pour mes petits-enfants de 2 ans et de 4 ans. Ils en sont ravis. Mon fils dit qu'ils prennent de très belles photos et que les images sont très nettes. N'hésitez pas à commander !",
    image: "/images/microscope-real-spider.jpg",
    imageCaption: "Grossissement net d'une araignée sur l'écran 2.0\"",
    verified: true,
  },
  {
    name: "Saad Mehmood",
    location: "Client Vérifié",
    rating: 5,
    date: "Achat vérifié",
    title: "Le plaisir commence tout de suite",
    comment: "Un jouet vraiment sympa où tu peux apprendre beaucoup. Très intéressant pour les enfants de 4 à 14 ans, mais n'importe qui peut être émerveillé par les détails des choses autour de nous. Très facile à utiliser et s'amuse même avec des objets du quotidien.",
    image: "/images/microscope-real-leaf.jpg",
    imageCaption: "Nervures et cellules végétales d'une feuille",
    verified: true,
  },
  {
    name: "Laura M.",
    location: "Acheteuse Vérifiée",
    rating: 5,
    date: "Achat vérifié",
    title: "Vraiment génial !",
    comment: "Whaou top !! Mon fils de 4 ans adore ! Il l'emmène partout dans le jardin pour observer les insectes et les fleurs en direct sur l'écran.",
    image: "/images/microscope-real-ladybug.jpg",
    imageCaption: "Observation directe d'une coccinelle en extérieur",
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

import { trackViewContent, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";

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
    trackViewContent({
      content_name: "Microscope Numérique Portable HD 1000X",
      content_ids: ["microscope"],
      value: 16900,
      currency: "XOF",
    });
  }, [slug]);

  const scrollToOrder = () => {
    trackInitiateCheckout({
      content_name: "Microscope Numérique Portable HD 1000X",
      content_ids: ["microscope"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: selectedBundle.quantity || 1,
    });
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

      // Stocker les infos pour Meta Pixel Purchase sur la page success
      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Microscope Numérique Portable HD 1000X",
          price: selectedBundle.price,
          quantity: selectedBundle.quantity || 1,
        }));
      }

      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      }).catch(() => {});

      const successUrl = `/p/microscope/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-50 selection:text-indigo-900">
      
      {/* ── BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Livraison express sous 24h • Règlement en espèces après vérification du colis</span>
        </div>
      </div>

      {/* ── HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Scan className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(99,102,241,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-indigo-100 text-[11px]">(16 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* En-tête Titre & Accroche */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <ZoomIn className="w-3.5 h-3.5 text-indigo-600 stroke-[1.75]" />
            <span>Optique Numérique 1000X</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900 leading-tight">
            Microscope Numérique Portable HD
          </h1>
          
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Observation directe sur écran couleur LCD 2.0 pouces avec éclairage 8 LED intégré. Conçu pour le contrôle de précision, la réparation électronique et la découverte scientifique.
          </p>
        </div>

        {/* ── GALERIE PHOTOS FOND BLANC BISEAUTÉ ── */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-5 space-y-3">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60">
            <img 
              src={CAROUSEL_IMAGES[activeImgIndex].src} 
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
            />
            <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 text-center font-medium shadow-md">
              {CAROUSEL_IMAGES[activeImgIndex].caption}
            </div>
          </div>

          {/* Miniatures 4 photos */}
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] cursor-pointer ${
                  activeImgIndex === idx 
                    ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm" 
                    : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── BADGES TECHNIQUES ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-indigo-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
            <div className="text-[10px] text-slate-500 font-mono">Cotonou & Calavi</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Test à Réception</div>
            <div className="text-[10px] text-slate-500 font-mono">Paiement après vérification</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <BatteryCharging className="w-5 h-5 text-amber-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">100% Rechargeable</div>
            <div className="text-[10px] text-slate-500 font-mono">Batterie USB-C</div>
          </div>
        </div>

        {/* ── SECTION VIDÉO DÉMONSTRATION TIKTOK LIVE ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 stroke-[1.75]" />
              <span>Démonstration Vidéo en Direct</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              Regardez ce que vos enfants peuvent observer en direct
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Voyez la simplicité d'utilisation et la précision optique en situation réelle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Lecteur Vidéo Vertical TikTok HD */}
            <div className="md:col-span-6 lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[290px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-950 border-4 border-slate-900 shadow-2xl">
                <video
                  src="/videos/microscope-demo.mp4"
                  poster="/images/microscope-video-cover.webp"
                  controls
                  playsInline
                  loop
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Témoignage & Points Forts Vidéo */}
            <div className="md:col-span-6 lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="flex text-amber-400 text-xs tracking-tight">★★★★★</div>
                <p className="text-xs sm:text-sm font-semibold text-indigo-950 italic leading-relaxed">
                  « Mes enfants adorent explorer la nature avec ce microscope ! Ils veulent vraiment tout observer dans le jardin et à la maison. »
                </p>
                <div className="text-[11px] text-indigo-700 font-medium">— Aurélie, Maman comblée</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <ZoomIn className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Grossissement instantané jusqu'à 1000X</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Observation nette et sans déformation directement sur l'écran couleur 2.0".</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">100% Autonome & Transportable</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Batterie rechargeable intégrée, 8 éclairages LEDs et dragonne de transport.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Plus de 200 000 familles conquises</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">Le jouet éducatif scientifique n°1 plébiscité par les parents et enseignants.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={scrollToOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
              >
                <span>Commander maintenant (16 900 FCFA)</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION VISUELLE 1 : UN PETIT SCIENTIFIQUE EN ACTION ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="relative aspect-square sm:aspect-auto sm:h-full bg-slate-100 min-h-[300px]">
              <img 
                src="/images/microscope-scientifique-action.jpg" 
                alt="Un petit scientifique en action"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[1.75]" />
                <span>Alternative Intelligente aux Écrans</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
                Éveillez sa curiosité et son intelligence loin des smartphones
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Offrez à votre enfant le plaisir d'observer la nature de ses propres yeux. Grâce à l'écran LCD haute définition, chaque feuille, fleur, insecte ou objet du quotidien devient une aventure scientifique captivante.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Stimule la concentration et le goût de la recherche</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Prise en main immédiate et adaptée aux petites mains</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Rechargeable par câble USB, sans piles à remplacer</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION VISUELLE 2 : DÉTECTION POUX & CUIR CHEVELU ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="p-6 sm:p-8 space-y-4 order-2 md:order-1">
              <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Scan className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
                <span>Santé & Hygiène Familiale</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
                Vérifiez les poux, lentes et la santé des cheveux en 5 secondes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Plus besoin de chercher à l'aveugle ou de vous inquiéter inutilement. Posez simplement l'embout lumineux sur les racines des cheveux : l'écran affiche instantanément les micro-détails avec une netteté absolue.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
                  <span>Inspection des cheveux et du cuir chevelu sans douleur</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
                  <span>Grossissement optique jusqu'à 1000X avec éclairage 8 LED</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
                  <span>Utile pour toute la famille (peau, cheveux, petits bobos)</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-square sm:aspect-auto sm:h-full bg-slate-100 min-h-[300px] order-1 md:order-2">
              <img 
                src="/images/microscope-detection-poux.jpg" 
                alt="Détection des poux et cuir chevelu au microscope"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── SECTION VISUELLE 3 : LE CADEAU QUI FAIT VRAIMENT PLAISIR ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
            <div className="relative aspect-square sm:aspect-auto sm:h-full bg-slate-100 min-h-[300px]">
              <img 
                src="/images/microscope-cadeau-unboxing.jpg" 
                alt="Le cadeau éducatif idéal pour enfant"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 stroke-[1.75]" />
                <span>Idée Cadeau Prête à Offrir</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
                Le cadeau original et ludique qui fait briller les yeux
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Anniversaire, récompense scolaire ou fête : ce microscope est le cadeau parfait qui combine plaisir de jeu et apprentissage. Livré dans son coffret protecteur officiel avec tous ses câbles.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Coffret soigné prêt à emballer ou offrir</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Appareil léger et robuste avec dragonne de sécurité</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span>Test du produit autorisé à la livraison avant paiement</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CAS D'USAGE & DOMAINES D'APPLICATION ── */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-600">Applications</div>
            <h2 className="text-xl font-bold text-slate-900 tracking-[-0.02em]">Ce que vous pouvez observer :</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Cpu className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">Micro-électronique & Cartes Mères</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Contrôle des pistes de cuivre, diagnostic des composants SMD et vérification des micro-soudures de smartphones.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Coins className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">Authentification & Billets de Banque</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Examen des micro-lignes de sécurité, filigranes et reliefs sur les billets de 10 000 FCFA et pièces de collection.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Scan className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">Dermatologie & Textures Cutanées</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inspection de la structure de la peau, des pores, des follicules pileux, des fibres textiles et des surfaces.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Bug className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">Éveil des Enfants & Sciences Naturelles</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Étude des nervures des feuilles, des ailes d'insectes et des minéraux pour développer la curiosité loin des écrans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CARACTÉRISTIQUES TECHNIQUES ── */}
        <section className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="text-xs font-bold text-slate-900">Caractéristiques techniques</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 text-[10.5px]">Grossissement</div>
              <div className="text-slate-900 font-mono tabular-nums font-bold mt-0.5">50X à 1000X</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 text-[10.5px]">Affichage</div>
              <div className="text-slate-900 font-bold mt-0.5">Écran LCD 2.0"</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 text-[10.5px]">Éclairage</div>
              <div className="text-slate-900 font-bold mt-0.5">8 LEDs réglables</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 text-[10.5px]">Alimentation</div>
              <div className="text-slate-900 font-bold mt-0.5">Port USB Type-C</div>
            </div>
          </div>
        </section>

        {/* ── FORMULAIRE DE COMMANDE ENCADRÉ ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="microscope"
            productTitle="Microscope Numérique Portable HD 1000X"
            productImage="/images/microscope-monde-decouverte.jpg"
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
            accentColor="#4f46e5"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── AVIS CLIENTS & PHOTOS RÉELLES DES ACHETEURS ── */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-indigo-600">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Retours d'Expérience & Photos Réelles</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-[-0.02em]">
              Ce que nos acheteurs observent au quotidien :
            </h2>
            <p className="text-xs text-slate-600 max-w-xl">
              Photos réelles capturées directement sur l'écran LCD 2.0" par des parents et utilisateurs vérifiés.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4.5">
            {REVIEWS_DATA.map((rev, idx) => (
              <div 
                key={idx} 
                className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row gap-5 items-stretch"
              >
                {/* Photo réelle cadrée bord à bord à gauche */}
                <div className="w-full sm:w-60 h-60 sm:h-auto min-h-[200px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/70 relative shrink-0 shadow-2xs">
                  <img 
                    src={rev.image} 
                    alt={rev.imageCaption} 
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-950/85 backdrop-blur-sm text-white text-[10px] font-medium py-1.5 px-3 rounded-xl text-center leading-tight shadow-md border border-white/10">
                    {rev.imageCaption}
                  </div>
                </div>

                {/* Avis & Détails à droite */}
                <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm tracking-tight">{rev.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{rev.location}</div>
                      </div>
                      <div className="flex text-amber-400 text-sm tracking-tight">
                        {"★".repeat(rev.rating)}
                      </div>
                    </div>

                    <div className="text-sm font-bold text-slate-900 leading-snug">
                      « {rev.title} »
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-3 border-t border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.75]" />
                    <span>Achat vérifié Isivente</span>
                  </div>
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
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors duration-100 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeFaq === idx ? "rotate-180 text-indigo-600" : ""}`} />
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

      {/* ── BARRE MOBILE FLOTTANTE POUR COMMANDER ── */}
      <StickyMobileCtaBar
        price={16900}
        accentColor="#4f46e5"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Microscope Numérique Portable HD 1000X à 16 900 FCFA avec livraison à domicile."
      />

    </div>
  );
}
