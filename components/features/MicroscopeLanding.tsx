"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Eye,
  ZoomIn,
  Camera,
  BatteryCharging,
  Cpu,
  Layers,
  Lock,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scan,
  Lightbulb,
  Coins,
  Bug,
  Smartphone,
  Play
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";

const BUNDLES: BundleOption[] = [
  {
    id: "duo",
    name: "Offre Spéciale Famille & Duo (2 Microscopes)",
    subtitle: "Pack 2 Microscopes HD 1000X + Câbles Type-C + Dragonnes de sécurité (Idéal enfants & adultes)",
    price: 29900,
    originalPrice: 50000,
    savings: 20100,
    quantity: 2,
    popular: true,
  },
  {
    id: "solo",
    name: "Pack Découverte (1 Microscope HD 1000X)",
    subtitle: "Microscope de poche avec écran couleur 2.0\" + 8 LEDs + Batterie rechargeable + Câble",
    price: 16900,
    originalPrice: 25000,
    savings: 8100,
    quantity: 1,
    popular: false,
  },
  {
    id: "pro_sd",
    name: "Pack Explorateur VIP (+ Carte Mémoire 32Go)",
    subtitle: "1 Microscope HD 1000X + Carte Micro-SD 32Go incluse pour enregistrer 10 000 photos et vidéos HD",
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
    alt: "Microscope Numérique Portable HD 1000X Isivente",
    caption: "Format de poche ultra-ergonomique avec écran couleur 2.0\" haute luminosité"
  },
  { 
    src: "/images/microscope-skin.jpg", 
    alt: "Observation de la peau, pores et ongles au microscope",
    caption: "Découvrez en direct ce qui se cache dans les pores de votre peau, sous les ongles et les cheveux"
  },
  { 
    src: "/images/microscope-circuit.jpg", 
    alt: "Inspection de billets de banque et circuits électroniques",
    caption: "Idéal pour vérifier les faux billets de banque et réparer les composants électroniques & cartes mères"
  },
];

const REVIEWS_DATA = [
  {
    name: "Mathieu T.",
    city: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Incroyable cet appareil ! Mes deux enfants ont passé tout le weekend à observer les fourmis, les feuilles et même leurs ongles. On a aussi vérifié un billet de 10 000 F, les détails cachés sont hallucinants.",
    verified: true,
  },
  {
    name: "Serge K.",
    city: "Abomey-Calavi",
    rating: 5,
    date: "Il y a 4 jours",
    comment: "Je fais de la réparation de téléphones portables GSM. Ce mini microscope est mille fois plus pratique qu'une loupe classique. On voit chaque soudure de carte mère avec une netteté impressionnante.",
    verified: true,
  },
  {
    name: "Aïcha G.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 6 jours",
    comment: "Livré en moins de 24h par le livreur. J'ai allumé et testé le microscope directement devant lui avant de payer. La batterie dure longtemps et l'écran est très clair même en plein soleil.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "A-t-on besoin d'un téléphone ou d'un ordinateur pour l'utiliser ?",
    a: "Non, absolument pas ! Le microscope possède son propre écran couleur LCD haute résolution de 2.0 pouces et sa batterie rechargeable intégrée. Vous l'allumez et vous voyez directement en direct, n'importe où sans aucun fil."
  },
  {
    q: "Jusqu'à quel niveau de détail peut-on voir ?",
    a: "Grâce à son grossissement optique et numérique continu jusqu'à 1000X et ses 8 LEDs blanches, vous pouvez voir la structure des cellules végétales, les pores et follicules de la peau, les micro-écritures de sécurité des billets de banque, les yeux d'une fourmi et les micro-soudures électroniques."
  },
  {
    q: "Peut-on enregistrer des photos et des vidéos ?",
    a: "Oui ! En appuyant simplement sur le bouton photo/vidéo sur l'appareil, vous pouvez capturer des clichés et vidéos en haute définition sur une carte Micro-SD pour les garder ou les transférer sur ordinateur."
  },
  {
    q: "Comment se passe la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée en 24h partout à Cotonou, Calavi, Porto-Novo et environs. Vous payez en espèces (Cash on Delivery) uniquement après avoir reçu et inspecté le colis."
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
      setOrderError("Veuillez renseigner un numéro de téléphone valide (ex: 0192901817).");
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

      // Notification API webhook
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* ── BANDEAU D'URGENCE PROMO DU JOUR ── */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white text-[11px] sm:text-xs font-semibold py-2 px-3 text-center flex items-center justify-center gap-2 shadow-sm tracking-wide">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>PROMOTION SPÉCIALE : -40% DE RÉDUCTION + PAIEMENT CASH À LA LIVRAISON PARTOUT AU BÉNIN 🇧🇯</span>
      </div>

      {/* ── HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20">
              <Scan className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-cyan-500/25 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Commander (16 900 F)
          </button>
        </div>
      </header>

      {/* ── SECTION HERO PRINCIPALE ── */}
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-12 space-y-8">
        
        {/* Titre & Accroche */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
            <ZoomIn className="w-3 h-3" />
            <span>Optique Numérique Ultra HD 1000X</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Voyez <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">l'Infiniment Petit</span> en Direct sur Écran HD
          </h1>
          
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Pores de la peau, billets de banque, insectes, composants de téléphones : découvrez un monde invisible à l’œil nu avec ce microscope de poche 100% autonome.
          </p>
        </div>

        {/* ── GALERIE PHOTOS / CARROUSEL FIGMA-GRADE ── */}
        <div className="card-figma bg-slate-900 border-slate-800 p-3 sm:p-4 rounded-3xl space-y-3">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80">
            <img 
              src={CAROUSEL_IMAGES[activeImgIndex].src} 
              alt={CAROUSEL_IMAGES[activeImgIndex].alt}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-300 text-center font-medium shadow-lg">
              {CAROUSEL_IMAGES[activeImgIndex].caption}
            </div>
          </div>

          {/* Vignettes miniatures */}
          <div className="grid grid-cols-3 gap-2">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImgIndex === idx 
                    ? "border-cyan-500 shadow-md shadow-cyan-500/20 scale-[1.02]" 
                    : "border-slate-800 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── BADGES DE CONFIANCE LOCAUX ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
            <Truck className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-[11px] sm:text-xs font-bold text-slate-200">Livraison 24h</div>
            <div className="text-[9.5px] sm:text-[10.5px] text-slate-400">Partout au Bénin</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] sm:text-xs font-bold text-slate-200">Test à Réception</div>
            <div className="text-[9.5px] sm:text-[10.5px] text-slate-400">Payez après vérification</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
            <BatteryCharging className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-[11px] sm:text-xs font-bold text-slate-200">100% Rechargeable</div>
            <div className="text-[9.5px] sm:text-[10.5px] text-slate-400">Autonomie 3h en continu</div>
          </div>
        </div>

        {/* ── CE QUE VOUS POUVEZ OBSERVER (4 CAS D'USAGE VIRAUX) ── */}
        <section className="space-y-4">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Expérience Immersive</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Ce que vous allez découvrir en 1 clic :</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/70 border border-slate-800/90 p-4 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Scan className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">La peau, les ongles & cheveux</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Zoomez sur vos pores, découvrez le sébum et les micro-particules sous les ongles ou la texture de vos cheveux en ultra-haute résolution.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/90 p-4 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Détection des faux billets de banque</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Révélez instantanément les micro-écritures secrètes et les filaments fluorescents invisibles sur les coupures de 10 000 F et 5 000 F CFA.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/90 p-4 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Réparation Téléphones & Électronique</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Examinez les micro-puces SMD, les pistes coupées et les soudures de cartes mères de smartphones avec une précision chirurgicale.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/90 p-4 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Éveil des enfants & Nature</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Éloignez les enfants des jeux vidéo ! Ils adorent observer les ailes de papillons, les fourmis et les nervures des feuilles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SPÉCIFICATIONS TECHNIQUES D'ÉLITE ── */}
        <section className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Fiche Technique & Performances</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[10.5px]">Grossissement</div>
              <div className="text-slate-100 font-bold font-mono text-sm mt-0.5">Jusqu'à 1000X</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[10.5px]">Écran Intégré</div>
              <div className="text-slate-100 font-bold text-sm mt-0.5">2.0" LCD Couleur</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[10.5px]">Éclairage</div>
              <div className="text-slate-100 font-bold text-sm mt-0.5">8 LEDs Réglables</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-500 text-[10.5px]">Alimentation</div>
              <div className="text-slate-100 font-bold text-sm mt-0.5">USB-C Rechargeable</div>
            </div>
          </div>
        </section>

        {/* ── SECTION COMMANDE & FORMULAIRE DIRECT SUPABASE ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
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
            accentColor="#06b6d4"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── AVIS CLIENTS VÉRIFIÉS AU BÉNIN ── */}
        <section className="space-y-4">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Témoignages Clients</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Ce qu'en pensent nos acheteurs :</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 text-xs">{rev.name}</div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="text-[10.5px] text-slate-500">{rev.city} • {rev.date}</div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                <div className="flex items-center gap-1 text-[10.5px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Achat vérifié Isivente</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOIRE AUX QUESTIONS (FAQ) ── */}
        <section className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-3xl space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Questions Fréquentes</span>
          </h2>

          <div className="divide-y divide-slate-800">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-200 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180" : ""}`} />
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

      {/* ── BARRE MOBILE FLOTTANTE POUR COMMANDER ── */}
      <StickyMobileCtaBar
        price={16900}
        accentColor="#06b6d4"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander le Microscope Numérique Portable HD 1000X à 16 900 FCFA avec livraison à domicile."
      />

    </div>
  );
}
