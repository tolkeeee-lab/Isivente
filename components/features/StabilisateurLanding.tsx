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
  BatteryCharging, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Smartphone,
  Video,
  Radio,
  RotateCw,
  Compass,
  Layers
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Stabilisateur Pro-Mobile Z3 Zoom™ Officiel",
    subtitle: "Pack complet avec perche télescopique en alliage d'aluminium, trépied renforcé, télécommande sans fil 10m et câble de charge USB-C",
    price: 49900,
    originalPrice: 75000,
    savings: 25100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  { 
    src: "/images/stabilisateur-hero.jpg", 
    alt: "Stabilisateur Pro-Mobile Z3 Zoom - Présentation complète",
    caption: "Système complet 3-en-1 : Stabilisateur gyroscope, perche extensible et trépied tout-terrain"
  },
  { 
    src: "/images/stabilisateur-force-magnetique-20n.jpg", 
    alt: "Fixation magnétique ultra-puissante 20N",
    caption: "Fixation magnétique 20N haute sécurité : maintien instantané et inarrachable même en mouvement rapide"
  },
  { 
    src: "/images/stabilisateur-telecommande-10m.jpg", 
    alt: "Télécommande Bluetooth détachable longue portée 10m",
    caption: "Télécommande Bluetooth détachable : déclenchez photos et vidéos jusqu'à 10 mètres à distance"
  },
  { 
    src: "/images/stabilisateur-angles-rotation-360.jpg", 
    alt: "Rotation motorisée 360° portrait et paysage",
    caption: "Bascule instantanée portrait / paysage en 1 clic pour des cadrages parfaits sur TikTok, Réels et YouTube"
  },
  { 
    src: "/images/stabilisateur-perche-extensible.jpg", 
    alt: "Perche télescopique intégrée en alliage d'aluminium renforcé",
    caption: "Déploiement jusqu'à 1,05m en alliage d'aluminium léger : vos prises de vue en contre-plongée et selfies de groupe"
  },
];

const REVIEWS_DATA = [
  {
    author: "Brice T.",
    city: "Cotonou (Haie Vive)",
    rating: 5,
    title: "Vidéos ultra-fluides sans aucun tremblement",
    comment: "Je filme mes vidéos de présentation de produits pour ma boutique. La différence avec la tenue à la main est flagrante, le résultat fait directement pro.",
  },
  {
    author: "Marc-Aurele D.",
    city: "Calavi",
    rating: 5,
    title: "La télécommande à distance est un vrai régal",
    comment: "Je peux me filmer seul à distance sans avoir besoin de demander à quelqu'un. Le trépied est très stable sur carrelage et en extérieur.",
  },
  {
    author: "Syntyche K.",
    city: "Porto-Novo",
    rating: 5,
    title: "Aimant très puissant, aucun risque de chute",
    comment: "J'avais peur pour mon iPhone 14 Pro Max mais l'aimant est d'une puissance impressionnante. Très beau matériel, solide et bien fini.",
  },
];

const FAQS_DATA = [
  {
    q: "Est-il compatible avec mon téléphone (iPhone ou Android) ?",
    a: "Oui, absolument ! Le Z3 Zoom est universel. Il est directement compatible MagSafe pour iPhone (séries 12, 13, 14, 15, 16) et inclut une bague magnétique ultra-fine pour tous les smartphones Android (Samsung, Xiaomi, Tecno, Infinix, etc.)."
  },
  {
    q: "Comment fonctionne la télécommande ?",
    a: "La télécommande est intégrée sur le manche et se détache en un geste. Elle se connecte en Bluetooth en 3 secondes sans aucune application requise, et permet de déclencher l'enregistrement vidéo ou la photo jusqu'à 10 mètres."
  },
  {
    q: "Comment se passe la livraison et le paiement ?",
    a: "La livraison s'effectue en 24h partout à Cotonou, Calavi, Porto-Novo et environs. Vous vérifiez le colis et testez l'appareil avant de régler au livreur en espèces ou Mobile Money."
  },
  {
    q: "Quelle est l'autonomie de la batterie ?",
    a: "La batterie haute capacité offre plus de 12 heures d'utilisation continue. Elle se recharge rapidement via câble USB-C fourni."
  }
];

export default function StabilisateurLanding({ slug = "stabilisateur" }: { slug?: string }) {
  const router = useRouter();
  const utm = useUTM();
  const { recordInteraction } = usePagePresence(slug);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const orderSectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-scroll carousel photos toutes les 3.8s
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

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
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 8) {
      setOrderError("Veuillez renseigner un numéro de téléphone valide (au moins 8 chiffres).");
      return;
    }

    setIsSubmitting(true);
    recordInteraction();

    try {
      const order = await saveNewOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: address.trim() || `${city} - Livraison à domicile`,
        shipping_city: city,
        product_slug: "stabilisateur",
        product_title: "Stabilisateur Pro-Mobile Z3 Zoom™",
        bundle_id: selectedBundle.id || "solo",
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity || 1,
        total_amount: selectedBundle.price,
        status: "pending",
        ...utm,
      });

      await markLeadConverted(customerPhone, "stabilisateur");

      const successUrl = `/p/stabilisateur/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-28">
      {/* ── HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-tight text-slate-950 text-sm sm:text-base">ISIVENTE</span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• Boutique Officielle</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-1.5 rounded-full shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <span>Commander (49 900 F)</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* ── TITRE HERO & PRIX D'ACCROCHE ── */}
        <section className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[1.75]" />
            <span>Création de Contenu Pro & Stabilisation Studio</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl font-black tracking-[-0.02em] text-slate-950 leading-tight">
            Stabilisateur Pro-Mobile Z3 Zoom™ 3-en-1
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Perche télescopique 1,05m, trépied renforcé tout-terrain et télécommande Bluetooth 10m. Fini les vidéos tremblotantes sur vos tournages.
          </p>
        </section>

        {/* ── CARROUSEL HERO AUTO-DÉFILANT AVEC MINIATURES ── */}
        <section 
          className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5 space-y-3"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
            <img
              src={CAROUSEL_IMAGES[activeImgIndex].src}
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Badge Prix Direct */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-md">
              <span className="text-amber-600 font-black">49 900 FCFA</span>
              <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">75 000 F</span>
            </div>

            {/* Flèches Navigation Manuelle */}
            <button
              onClick={() => setActiveImgIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 shadow-md transition-all active:scale-90"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <button
              onClick={() => setActiveImgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 shadow-md transition-all active:scale-90"
              aria-label="Photo suivante"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Légende Bas d'Image */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 text-white text-[11px] sm:text-xs">
              <p className="font-semibold leading-snug line-clamp-2">
                {CAROUSEL_IMAGES[activeImgIndex].caption}
              </p>
            </div>
          </div>

          {/* Miniatures Synchronisées */}
          <div className="grid grid-cols-5 gap-2">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImgIndex === idx 
                    ? "border-amber-600 ring-2 ring-amber-600/30 scale-95" 
                    : "border-slate-200 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* ── 3 BADGES DE RÉASSURANCE PRIORITAIRES ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
            <div className="text-[10px] text-slate-500 font-mono">Bénin à domicile</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Test à Réception</div>
            <div className="text-[10px] text-slate-500 font-mono">Paiement après vérification</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <BatteryCharging className="w-5 h-5 text-amber-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">12h d&apos;Autonomie</div>
            <div className="text-[10px] text-slate-500 font-mono">Recharge USB-C</div>
          </div>
        </div>

        {/* ── FORMULAIRE DE COMMANDE COD PLACÉ PRIORITAIREMENT ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="stabilisateur"
            productTitle="Stabilisateur Pro-Mobile Z3 Zoom™"
            productImage="/images/stabilisateur-hero.jpg"
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
            accentColor="#d97706"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── SECTION VIDÉO DÉMONSTRATION RÉELLE (AUTOPLAY AVEC CONTRÔLES) ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Video className="w-3.5 h-3.5 text-amber-600 stroke-[1.75]" />
              <span>Démonstration Réelle en Direct</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              Regardez la stabilité et la fluidité en action
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              La vidéo se lance automatiquement. Vous pouvez la mettre en pause ou activer le son à tout moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Lecteur Vidéo Vertical TikTok HD */}
            <div className="md:col-span-6 lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-950 border-4 border-slate-900 shadow-2xl">
                <video
                  ref={videoRef}
                  src="/videos/stabilisateur-demo.mp4"
                  poster="/images/stabilisateur-hero.jpg"
                  autoPlay
                  muted
                  playsInline
                  loop
                  controls
                  preload="auto"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Points Forts & Avantages */}
            <div className="md:col-span-6 lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                <div className="flex text-amber-500 text-xs tracking-tight">★★★★★</div>
                <p className="text-xs sm:text-sm font-semibold text-amber-950 italic leading-relaxed">
                  « Le test en direct montre la différence immédiate entre un smartphone tenu à bout de bras et le Z3 Zoom. Même en courant, l&apos;image reste parfaitement stable. »
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <RotateCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Stabilisation Mécanique Anti-Vibrations</h4>
                    <p className="text-[11px] text-slate-600">Absorption active des soubresauts de la marche et des gestes brusques.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Radio className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Télécommande Sans Fil 10 Mètres</h4>
                    <p className="text-[11px] text-slate-600">Détachez la télécommande pour vous enregistrer seul sans couper le plan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Fixation Magnétique MagSafe & Universelle</h4>
                    <p className="text-[11px] text-slate-600">Aimant 20N ultra-puissant. Bague d&apos;adaptation fournie pour Android.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Avis Clients Vérifiés (Bénin)</div>
              <div className="text-[11px] text-slate-500 font-mono">4.9 / 5 sur 187 commandes livrées</div>
            </div>
            <div className="flex text-amber-400 text-sm">★★★★★</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{rev.author}</span>
                    <span className="text-[10px] text-slate-400">{rev.city}</span>
                  </div>
                  <div className="text-amber-400 text-xs">{"★".repeat(rev.rating)}</div>
                  <p className="text-xs font-semibold text-slate-900">« {rev.title} »</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium pt-2 border-t border-slate-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Commande vérifiée Isivente</span>
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
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180 text-amber-600" : ""}`} />
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
        price={49900}
        accentColor="#d97706"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Stabilisateur Pro-Mobile Z3 Zoom à 49 900 FCFA avec livraison à domicile."
      />
    </div>
  );
}
