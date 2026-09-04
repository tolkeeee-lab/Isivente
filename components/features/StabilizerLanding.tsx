"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Check, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Star, 
  ChevronDown, 
  Sparkles, 
  Phone, 
  MessageSquare,
  Zap,
  Camera,
  Layers,
  Award,
  Video,
  Radio,
  Sliders,
  Maximize2
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
import { getProductUpsellConfig } from "@/lib/upsellConfig";

interface ProductBundle {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  price: number;
  originalPrice: number;
  savings: number;
  popular?: boolean;
  quantity: number;
}

const BUNDLES: ProductBundle[] = [
  {
    id: "solo",
    name: "Pack Solo Créateur (1 Kit)",
    subtitle: "1 Stabilisateur Z3 Zoom + Télécommande + Bague MagSafe + Câble",
    price: 49900,
    originalPrice: 65000,
    savings: 15100,
    quantity: 1,
  },
  {
    id: "duo",
    name: "Pack Duo Studio (2 Kits)",
    subtitle: "2 Stabilisateurs complets + 2 Anneaux MagSafe supplémentaires",
    badge: "🔥 L'OFFRE LA PLUS CHOISIE (ÉCONOMISEZ 40 100 F)",
    price: 89900,
    originalPrice: 130000,
    savings: 40100,
    popular: true,
    quantity: 2,
  },
  {
    id: "trio",
    name: "Pack Pro Équipe & Vidéaste (3 Kits)",
    subtitle: "3 Stabilisateurs complets + Kit fixations studio",
    badge: "💎 MEILLEUR PRIX / APPAREIL",
    price: 129900,
    originalPrice: 195000,
    savings: 65100,
    quantity: 3,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/stabilisateur-hero.jpg",
    alt: "Stabilisateur Pro-Mobile Z3 Zoom en main avec bague MagSafe",
    caption: "Stabilisation Pro, Zoom sans fil et Trépied intégré",
  },
  {
    src: "/images/stabilisateur-magsafe.jpg",
    alt: "Gros plan sur la commande de zoom et la bague magnétique MagSafe",
    caption: "Bague magnétique ultra-puissante & commande Zoom millimétrique",
  },
  {
    src: "/images/stabilisateur-tripod.jpg",
    alt: "Mode trépied de table déployé sur un bureau de tournage",
    caption: "Déploiement trépied en 1 seconde pour vidéos et visioconférences",
  },
  {
    src: "/images/stabilisateur-vlog.jpg",
    alt: "Créatrice de contenu filmant un vlog fluide dans la rue",
    caption: "Vidéos fluides et nettes sans tremblement même en marchant",
  },
];

const REVIEWS = [
  {
    author: "Marc-Aurèle K.",
    city: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Je fais des vidéos pour ma boutique de vêtements sur TikTok. Avant mes vidéos tremblaient toujours. Avec ce Z3, la qualité fait pro comme avec un iPhone 15 Pro sur caméra de cinéma ! La bague MagSafe tient très fort.",
  },
  {
    author: "Nadège T.",
    city: "Abomey-Calavi",
    rating: 5,
    date: "Il y a 3 jours",
    comment: "Le zoom à distance avec la télécommande détachable est génial ! Je pose le trépied sur la table et je gère mes prises sans toucher au téléphone. Livraison reçue le jour même en main propre.",
  },
  {
    author: "Yannick D.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 5 jours",
    comment: "J'ai pris le pack duo pour moi et ma sœur qui est photographe. Rien à dire, l'aluminium est de qualité supérieure et le trépied ne bouge pas d'un millimètre.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Est-il compatible avec mon téléphone (iPhone et Android) ?",
    a: "Oui, à 100% ! Il est directement compatible avec tous les iPhones MagSafe (séries 12, 13, 14, 15, 16). Pour tous les autres téléphones (Samsung, Xiaomi, Tecno, Infinix, Huawei...), un anneau magnétique mince adhésif ultra-puissant est fourni gratuitement dans le kit.",
  },
  {
    q: "Comment fonctionne la télécommande de zoom à distance ?",
    a: "La poignée intègre une télécommande Bluetooth amovible. Vous pouvez l'utiliser clipsée sur le stabilisateur ou la détacher pour déclencher vos photos/vidéos et zoomer jusqu'à 10 mètres de distance.",
  },
  {
    q: "Comment se fait la livraison et le paiement ?",
    a: "Nous livrons partout au Bénin sous 24h à 48h. Vous ne payez rien d'avance : vous inspectez le colis à l'arrivée et réglez en espèces ou Mobile Money directement au livreur.",
  },
  {
    q: "Le trépied est-il solide ?",
    a: "Absolument. La poignée s'ouvre en 3 pieds renforcés avec patins en silicone antidérapants pour garantir une stabilité totale sur table, sol, bitume ou herbe.",
  },
];

export default function StabilizerLanding({ slug = "stabilisateur" }: { slug?: string }) {
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle>(BUNDLES[1]);
  const [includeBump, setIncludeBump] = useState(false);
  const upsellConfig = getProductUpsellConfig(slug || "stabilisateur");
  const bumpOffer = upsellConfig?.bump;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Autoplay carrousel d'images HD toutes les 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const sessionIdRef = useRef("sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8));
  const startTimeRef = useRef(Date.now());
  const clickedRef = useRef(false);

  useEffect(() => {
    const save = () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      trackUserSession(slug, duration, clickedRef.current, sessionIdRef.current);
    };

    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("beforeunload", save);
    };
  }, [slug]);

  const scrollToOrder = () => {
    const el = document.getElementById("commander");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert("Veuillez saisir un numéro de téléphone valide pour la confirmation de livraison.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bumpPrice = includeBump && bumpOffer ? bumpOffer.price : 0;
      const finalTotal = selectedBundle.price + bumpPrice;
      const finalBundleName = selectedBundle.name + (includeBump && bumpOffer ? ` + ${bumpOffer.title}` : "");

      const orderPayload = {
        product_slug: slug,
        product_title: "Stabilisateur Pro-Mobile Z3 Zoom™",
        bundle_id: selectedBundle.id,
        bundle_name: finalBundleName,
        quantity: selectedBundle.quantity,
        total_amount: finalTotal,
        customer_name: customerName || "Client",
        customer_phone: customerPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        shipping_city: city || "Cotonou",
        city: city || "Cotonou",
        shipping_address: address || "",
        address: address || "",
        status: "pending" as const,
      };

      const res = await saveNewOrder(orderPayload);
      clickedRef.current = true;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      await trackUserSession(slug, duration, true, sessionIdRef.current);

      const orderNum = res?.order_number || "";
      window.location.href = `/p/${slug}/upsell?order=${encodeURIComponent(orderNum)}&phone=${encodeURIComponent(customerPhone)}`;
    } catch (err) {
      console.error("Order error:", err);
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  // VUE SUCCÈS COMMANDE CONFIRMÉE
  if (orderSuccess) {
    const cleanPhone = (customerPhone || "0192901817").replace(/[^0-9]/g, "");
    const orderNum = orderInfo?.order_number || "CMD-" + Math.floor(100000 + Math.random() * 900000);
    const whatsappMsg = encodeURIComponent(
      `Bonjour Isivente, je viens de commander le *Stabilisateur Pro-Mobile Z3 Zoom* (${selectedBundle.name}) pour un montant de *${new Intl.NumberFormat("fr-FR").format(selectedBundle.price)} FCFA*. Référence : *${orderNum}*. Merci de confirmer ma livraison !`
    );

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-[staggerFadeUp_240ms_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Commande Enregistrée avec Succès
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mt-3">
              Félicitations {customerName || "Cher Client"} !
            </h1>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Votre commande pour le <strong className="text-slate-900">Stabilisateur Pro-Mobile Z3 Zoom</strong> est bien reçue. Notre service logistique prépare votre colis pour expédition.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>N° Commande :</span>
              <span className="text-slate-900 font-bold">{orderNum}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Pack sélectionné :</span>
              <span className="text-amber-700 font-bold">{selectedBundle.name}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Montant à régler au livreur :</span>
              <span className="text-emerald-700 font-black text-sm">
                {new Intl.NumberFormat("fr-FR").format(selectedBundle.price)} FCFA
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Destination :</span>
              <span className="text-slate-900 font-semibold">{city || "Cotonou"}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/2290192901817?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all text-sm uppercase tracking-wide"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Accélérer ma livraison sur WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setOrderSuccess(false);
                setCustomerName("");
                setCustomerPhone("");
                setCustomerPhone2("");
                setAddress("");
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors pt-2"
            >
              Retourner à la page produit
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Paiement 100% sécurisé en espèces ou MoMo à la livraison</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* 🌟 BANDEAU SUPÉRIEUR D'URGENCE SOLAIRE */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 py-2.5 px-4 text-center text-xs font-bold tracking-wide shadow-sm flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 fill-current" />
        <span>OFFRE FLASH : -35% DE RÉDUCTION + PAIEMENT À LA RÉCEPTION AU BÉNIN</span>
        <Sparkles className="w-3.5 h-3.5 fill-current" />
      </div>

      {/* 🌟 HEADER ÉPURÉ LUXURY LIGHT */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black font-display text-base shadow-sm">
              Z3
            </div>
            <div>
              <span className="font-display font-black tracking-tight text-slate-950 text-base sm:text-lg">
                STABILISATEUR PRO-MOBILE
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-amber-600 font-bold -mt-0.5">
                WONEW™ Z3 ZOOM MAGSAFE
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToOrder}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md shadow-amber-500/20"
          >
            Commander
          </button>
        </div>
      </header>

      {/* 🌟 HERO SECTION */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* GAUCHE : GALERIE D'IMAGES HD AVEC CARROUSEL */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl group">
              <img
                src={CAROUSEL_IMAGES[activeImageIndex].src}
                alt={CAROUSEL_IMAGES[activeImageIndex].alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200/90 px-3 py-1.5 rounded-full text-[11px] font-mono text-amber-700 font-bold flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Kit Studio Nomade 4-en-1</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200/90 px-4 py-2.5 rounded-2xl text-xs text-slate-800 font-semibold shadow-lg">
                {CAROUSEL_IMAGES[activeImageIndex].caption}
              </div>
            </div>

            {/* MINIATURES CLIQUABLES */}
            <div className="grid grid-cols-4 gap-3">
              {CAROUSEL_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 bg-white transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-amber-500 shadow-md shadow-amber-500/25 scale-[1.02]"
                      : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* DROITE : ARGUMENTAIRE & OFFRE HORMOZI */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-slate-600 font-mono font-bold">4.9/5 (184 avis vérifiés)</span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
                Stabilisateur Pro-Mobile Z3 Zoom™
              </h1>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed font-medium">
                Transformez instantanément votre smartphone en une véritable <strong className="text-slate-900">caméra de cinéma sans aucun tremblement</strong>. Fixation magnétique MagSafe, contrôle de zoom sans fil et trépied déployable en 1 seconde.
              </p>
            </div>

            {/* POINTS FORTS TACTILES */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                  <Video className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Zéro Tremblement</div>
                  <div className="text-slate-500 text-[11px]">Vidéos ultra-fluides</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200/60">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">MagSafe Instantané</div>
                  <div className="text-slate-500 text-[11px]">Clipse en 0.5s</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Zoom Sans Fil</div>
                  <div className="text-slate-500 text-[11px]">Télécommande 10m</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Trépied Intégré</div>
                  <div className="text-slate-500 text-[11px]">Pieds renforcés</div>
                </div>
              </div>
            </div>

            {/* PACKS HORMOZI */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                1. Choisissez votre Pack Promo :
              </label>

              {BUNDLES.map((bundle) => {
                const isSelected = selectedBundle.id === bundle.id;
                return (
                  <div
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-amber-50/40 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    {bundle.badge && (
                      <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                        {bundle.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-500 text-slate-950"
                              : "border-slate-300 bg-slate-100"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{bundle.name}</div>
                          <div className="text-xs text-slate-600">{bundle.subtitle}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-base text-amber-600 tabular-nums">
                          {new Intl.NumberFormat("fr-FR").format(bundle.price)} F
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 line-through tabular-nums">
                          {new Intl.NumberFormat("fr-FR").format(bundle.originalPrice)} F
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA RAPIDE */}
            <button
              type="button"
              onClick={scrollToOrder}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all text-sm uppercase tracking-wider"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>S&apos;offrir le Kit Studio Z3 Zoom</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Livraison 24h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Paiement à la livraison</span>
              </div>
            </div>

          </div>

        </div>

        {/* 🌟 SECTION FONCTIONNALITÉS EN DÉTAIL */}
        <section className="border-t border-slate-200 pt-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Ingénierie & Ergonomie Studio
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Pourquoi le Z3 Zoom est indispensable à vos vidéos ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Stabilisation Pro-Active</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Fini les vidéos amateurs saccadées. Le gyroscope et le contre-balancement mécanique absorbent chaque choc pendant la marche pour un rendu digne des studios cinéma.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Aimant MagSafe 16N Ultra-Puissant</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Posez simplement votre smartphone : il s&apos;aimante instantanément avec une force de maintien testée contre les chutes brutales. Bague magnétique incluse pour téléphones Android.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Molette de Zoom Précise & Déclencheur</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ajustez le zoom au millimètre directement avec le pouce sans jamais toucher votre écran, et détachez la commande pour déclencher vos enregistrements à distance.
              </p>
            </div>

          </div>
        </section>

        {/* 🌟 FORMULAIRE DE COMMANDE DIRECTE (MODÈLE UMÉI) */}
        <UmeiStyleOrderSection
          productSlug={slug}
          productTitle="Stabilisateur Pro-Mobile Z3 Zoom™"
          bundles={BUNDLES}
          selectedBundle={selectedBundle}
          onSelectBundle={(b) => setSelectedBundle(b as ProductBundle)}
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
          includeBump={includeBump}
          setIncludeBump={setIncludeBump}
          bumpOffer={bumpOffer}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          accentColor="#F59E0B"
          whatsappNumber="2290192901817"
        />

        {/* 🌟 AVIS CLIENTS VÉRIFIÉS */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <h2 className="font-display font-bold text-2xl text-slate-950">Ce qu&apos;en disent les créateurs & utilisateurs</h2>
            <p className="text-slate-600 text-xs">Retours d&apos;expérience après livraison au Bénin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS.map((rev, i) => (
              <div key={i} className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rev.author}</span>
                  <span className="text-slate-500 font-mono">{rev.city}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🌟 FAQ ACCORDÉON */}
        <section className="max-w-2xl mx-auto space-y-4 pt-4">
          <h2 className="font-display font-bold text-xl text-slate-950 text-center mb-6">
            Questions Fréquentes
          </h2>

          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${isOpen ? "rotate-180 text-amber-600" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </section>

      </main>

      {/* 🌟 FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-600 space-y-2">
        <p className="font-bold text-slate-800">Isivente • Commerce Pro Bénin</p>
        <p>Service Client WhatsApp : +229 01 92 90 18 17 • Cotonou, Bénin</p>
        <p className="text-[10px] text-slate-400">© 2026 Isivente. Tous droits réservés.</p>
      </footer>

    </div>
  );
}
