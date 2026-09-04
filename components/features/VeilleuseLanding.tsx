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
  Moon,
  Compass,
  Layers,
  Award,
  Eye,
  RotateCw,
  SunMedium
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";

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
    name: "Pack Solo Découverte (1 Kit Complet)",
    subtitle: "1 Projecteur LED USB Flexible + 24 Disques de projection HD",
    price: 14900,
    originalPrice: 22000,
    savings: 7100,
    quantity: 1,
  },
  {
    id: "duo",
    name: "Pack Duo Magique (2 Kits Complets)",
    subtitle: "2 Projecteurs USB + 48 Disques HD (Chambre Enfants + Chambre Parents)",
    badge: "🔥 L'OFFRE LA PLUS CHOISIE (ÉCONOMISEZ 18 100 F)",
    price: 25900,
    originalPrice: 44000,
    savings: 18100,
    popular: true,
    quantity: 2,
  },
  {
    id: "trio",
    name: "Pack Trio Famille & Cadeaux (3 Kits)",
    subtitle: "3 Projecteurs USB complets + 72 Disques de projection HD",
    badge: "💎 MEILLEUR PRIX / APPAREIL",
    price: 36900,
    originalPrice: 66000,
    savings: 29100,
    quantity: 3,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/projecteur-hero.jpg",
    alt: "Veilleuse Projecteur LED 3D USB Flexible FRIOSZ FP-032 avec ses 24 disques de projection",
    caption: "Kit complet : Projecteur USB 360° tactile + Coffret de 24 disques HD",
  },
  {
    src: "/images/projecteur-galaxie.jpg",
    alt: "Projection d'une galaxie spirale ultra-détaillée au plafond de la chambre",
    caption: "Projection Galaxie & Voie Lactée 3D haute définition au plafond",
  },
  {
    src: "/images/projecteur-enfant.jpg",
    alt: "Enfant émerveillé dans son lit devant le ciel étoilé au plafond",
    caption: "Aide au sommeil magique : apaise les enfants et élimine la peur du noir",
  },
  {
    src: "/images/projecteur-ocean.jpg",
    alt: "Ambiance sous-marine féérique avec projection de méduses lumineuses",
    caption: "Mode Océan & Méduses 3D pour une détente totale en fin de journée",
  },
  {
    src: "/images/projecteur-saturne.jpg",
    alt: "Projection spectaculaire de Saturne et de ses anneaux en chambre moderne",
    caption: "Ambiance astronomique spectaculaire avec mise au point optique ultra-nette",
  },
];

const REVIEWS = [
  {
    author: "Clarisse A.",
    city: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Mon fils de 5 ans refusait de dormir seul dans sa chambre à cause de la peur du noir. Depuis qu'on allume le projecteur avec le disque des étoiles, il s'endort paisiblement en 10 minutes avec le sourire !",
  },
  {
    author: "Dr. Boris M.",
    city: "Abomey-Calavi",
    rating: 5,
    date: "Il y a 4 jours",
    comment: "La qualité de projection est impressionnante pour un appareil aussi compact. On peut régler la netteté avec la bague en haut comme sur un vrai objectif photo. Le rendu de Saturne et des galaxies est splendide.",
  },
  {
    author: "Fabiola S.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 6 jours",
    comment: "J'ai pris le pack duo pour offrir à mes nièces. Elles ont adoré changer les disques (galaxie, méduses, aurore). Branchement USB super pratique sur n'importe quel chargeur ou powerbank.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne le projecteur et comment l'alimenter ?",
    a: "Le projecteur est équipé d'un col flexible avec embout USB standard. Vous pouvez le brancher directement sur une prise murale avec un chargeur de téléphone, sur une batterie externe (Powerbank), ou sur un ordinateur portable. Il est totalement silencieux et consomme très peu d'énergie.",
  },
  {
    q: "Comment changer de projection et régler la netteté ?",
    a: "Chaque disque de projection se glisse facilement dans la fente latérale de la tête du projecteur. La bague rotative située à l'avant vous permet d'ajuster la mise au point optique pour obtenir une image parfaitement nette, que votre plafond soit à 1m ou 4m de hauteur.",
  },
  {
    q: "Quels sont les thèmes inclus dans les 24 disques ?",
    a: "Le coffret comprend 24 thèmes HD variés : Système solaire (Terre, Lune, Saturne, Mars), Galaxies spirales, Nébuleuses profondes, Monde marin féérique (Méduses lumineuses), Aurores boréales et thèmes festifs.",
  },
  {
    q: "Comment se déroule la livraison et le paiement au Bénin ?",
    a: "Nous livrons directement à votre domicile ou bureau sous 24h à 48h (Cotonou, Calavi, Porto-Novo, Parakou, etc.). Vous vérifiez votre colis à la réception et vous réglez en espèces ou Mobile Money directement au livreur.",
  },
];

export default function VeilleuseLanding({ slug = "veilleuse" }: { slug?: string }) {
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle>(BUNDLES[1]);
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
    const el = document.getElementById("order-form-section");
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
      const orderPayload = {
        product_slug: slug,
        product_title: "Veilleuse Projecteur LED 3D Tactile FRIOSZ FP-032",
        bundle_id: selectedBundle.id,
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity,
        total_amount: selectedBundle.price,
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

      setOrderInfo(res || orderPayload);
      setOrderSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Order error:", err);
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // VUE SUCCÈS COMMANDE CONFIRMÉE
  if (orderSuccess) {
    const cleanPhone = (customerPhone || "0192901817").replace(/[^0-9]/g, "");
    const orderNum = orderInfo?.order_number || "CMD-" + Math.floor(100000 + Math.random() * 900000);
    const whatsappMsg = encodeURIComponent(
      `Bonjour Isivente, je viens de commander la *Veilleuse Projecteur LED 3D Tactile* (${selectedBundle.name}) pour un montant de *${new Intl.NumberFormat("fr-FR").format(selectedBundle.price)} FCFA*. Référence : *${orderNum}*. Merci de confirmer ma livraison !`
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
              Votre commande pour la <strong className="text-slate-900">Veilleuse Projecteur LED 3D Tactile (FRIOSZ FP-032)</strong> est bien reçue. Notre service logistique prépare votre colis.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>N° Commande :</span>
              <span className="text-slate-900 font-bold">{orderNum}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Pack sélectionné :</span>
              <span className="text-indigo-700 font-bold">{selectedBundle.name}</span>
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* 🌟 BANDEAU SUPÉRIEUR D'URGENCE SOLAIRE */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white py-2.5 px-4 text-center text-xs font-bold tracking-wide shadow-sm flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
        <span>OFFRE FLASH : -35% DE RÉDUCTION + 24 DISQUES HD OFFERTS + PAIEMENT À LA RÉCEPTION AU BÉNIN</span>
        <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
      </div>

      {/* 🌟 HEADER ÉPURÉ LUXURY LIGHT */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black font-display text-base shadow-sm">
              ✨
            </div>
            <div>
              <span className="font-display font-black tracking-tight text-slate-950 text-base sm:text-lg block leading-none">
                VEILLEUSE PROJECTEUR 3D
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-bold mt-0.5">
                FRIOSZ™ FP-032 • 24 THÈMES HD
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToOrder}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md shadow-indigo-500/20"
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
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200/90 px-3 py-1.5 rounded-full text-[11px] font-mono text-indigo-700 font-bold flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>24 Disques Haute Définition Inclus</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200/90 px-4 py-2.5 rounded-2xl text-xs text-slate-800 font-semibold shadow-lg">
                {CAROUSEL_IMAGES[activeImageIndex].caption}
              </div>
            </div>

            {/* MINIATURES CLIQUABLES */}
            <div className="grid grid-cols-5 gap-2.5">
              {CAROUSEL_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 bg-white transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.03]"
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
                <span className="text-xs text-slate-600 font-mono font-bold">4.9/5 (243 avis vérifiés)</span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
                Veilleuse Projecteur LED 3D Tactile™
              </h1>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed font-medium">
                Transformez instantanément votre chambre ou salon en un <strong className="text-slate-900">univers féérique apaisant</strong>. Col USB flexible 360°, contrôle tactile instantané, mise au point ultra-nette et coffret de 24 disques astronomiques et marins.
              </p>
            </div>

            {/* POINTS FORTS TACTILES */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200/60">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">24 Thèmes 3D</div>
                  <div className="text-slate-500 text-[11px]">Galaxies, Océan & Étoiles</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Col Flexible 360°</div>
                  <div className="text-slate-500 text-[11px]">Orientez où vous voulez</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Focus Optique Net</div>
                  <div className="text-slate-500 text-[11px]">Image ultra-claire</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 p-3 rounded-2xl flex items-start gap-2.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Sommeil Réparateur</div>
                  <div className="text-slate-500 text-[11px]">Anti-peur du noir</div>
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
                        ? "bg-indigo-50/40 border-indigo-600 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-600"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    {bundle.badge && (
                      <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                        {bundle.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
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
                        <div className="font-mono font-bold text-base text-indigo-700 tabular-nums">
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
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/25 active:scale-[0.98] transition-all text-sm uppercase tracking-wider cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-amber-300" />
              <span>Commander Ma Veilleuse 3D (14 900 F)</span>
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
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Expérience Visuelle & Sérénité
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Pourquoi cette veilleuse 3D transforme vos nuits ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">24 Disques Haute Précision</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Variez les ambiances selon vos envies : explorez les anneaux de Saturne, plongez sous l&apos;océan avec les méduses lumineuses ou admirez les aurores boréales depuis votre lit.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
                <RotateCw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Orientation Flexible & Branchement USB</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Son col flexible en silicone se tord dans toutes les directions pour projeter au plafond ou sur un mur. Se branche sur n&apos;importe quel chargeur, prise USB murale ou batterie nomade.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-6 rounded-3xl space-y-4 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
                <Moon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-950">Bouton Tactile & Focus Manuel</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Allumez d&apos;un simple contact du doigt sur le dessus. Ajustez la bague rotative de la lentille pour une netteté de projection cristalline sans aucune déformation optique.
              </p>
            </div>

          </div>
        </section>

        {/* 🌟 FORMULAIRE DE COMMANDE DIRECTE COD LIGHT */}
        <section id="order-form-section" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Livraison Express Bénin (24h - 48h)
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Commandez maintenant, payez à la livraison
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Remplissez ce formulaire en 30 secondes. Notre livreur vous contactera avant de passer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* RÉCAPITULATIF PACK SÉLECTIONNÉ */}
            <div className="bg-slate-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-700 font-bold">Pack sélectionné</span>
                <div className="font-bold text-sm text-slate-900">{selectedBundle.name}</div>
              </div>
              <div className="font-mono font-bold text-lg text-indigo-700">
                {new Intl.NumberFormat("fr-FR").format(selectedBundle.price)} FCFA
              </div>
            </div>

            {/* NOM & PRÉNOM */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom & Prénom <span className="text-indigo-600">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex : Aminata Dossou"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium"
              />
            </div>

            {/* NUMÉRO DE TÉLÉPHONE (WHATSAPP / APPEL) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Numéro de Téléphone (WhatsApp / Appel Livreur) <span className="text-indigo-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ex : 01 97 00 00 00"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all font-mono font-semibold"
              />
            </div>

            {/* DEUXIÈME NUMÉRO OPTIONNEL */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Deuxième numéro en cas d&apos;indisponibilité (Optionnel)
              </label>
              <input
                type="tel"
                value={customerPhone2}
                onChange={(e) => setCustomerPhone2(e.target.value)}
                placeholder="Ex : 01 95 00 00 00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 transition-all font-mono"
              />
            </div>

            {/* VILLE & QUARTIER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ville / Commune <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex : Cotonou, Calavi, Porto-Novo..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Quartier & Précision Adresse <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex : Akpakpa, près de la pharmacie..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* BOUTON DE SOUMISSION COD */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 active:scale-[0.98] transition-all text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <span>Enregistrement en cours...</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Confirmer Ma Commande ({new Intl.NumberFormat("fr-FR").format(selectedBundle.price)} FCFA)</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-slate-500 pt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantie Satisfait ou Échangé sous 14 jours • Paiement à la réception</span>
            </div>

          </form>
        </section>

        {/* 🌟 AVIS CLIENTS VÉRIFIÉS */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <h2 className="font-display font-bold text-2xl text-slate-950">Ce qu&apos;en disent nos clients</h2>
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
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
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

      {/* 🌟 BOUTON FLOTTANT WHATSAPP ASSISTANCE */}
      <a
        href="https://wa.me/2290192901817?text=Bonjour%20Isivente%2C%20j%27ai%20une%20question%20sur%20la%20Veilleuse%20Projecteur%20LED%203D"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs tracking-wide transition-all duration-150 active:scale-90 hover:scale-105"
        title="Discuter avec un conseiller sur WhatsApp"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline">Besoin d&apos;aide ?</span>
      </a>

      {/* 🌟 FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-600 space-y-2">
        <p className="font-bold text-slate-800">Isivente • Commerce Pro Bénin</p>
        <p>Service Client WhatsApp : +229 01 92 90 18 17 • Cotonou, Bénin</p>
        <p className="text-[10px] text-slate-400">© 2026 Isivente. Tous droits réservés.</p>
      </footer>

    </div>
  );
}
