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
  Camera,
  Eye,
  Wifi,
  Moon,
  BatteryCharging,
  Bell,
  Smartphone,
  ShieldAlert,
  Play
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import HorizontalCarousel from "@/components/ui/HorizontalCarousel";
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
    name: "Mini Caméra Espionne & Surveillance HD A9 Pro",
    subtitle: "Kit complet avec support magnétique 360°, câble de charge et application mobile",
    price: 16900,
    originalPrice: 25000,
    savings: 8100,
    quantity: 1,
  },
];

const CAROUSEL_IMAGES = [
  { src: "/images/camera-hero.jpg", alt: "Mini Caméra Magnétique HD A9 Pro" },
  { src: "/images/camera-app.jpg", alt: "Vision en direct sur smartphone avec alerte mouvement" },
  { src: "/images/camera-night.jpg", alt: "Vision nocturne infrarouge dans le noir total" },
  { src: "/images/camera-discreet.jpg", alt: "Installation magnétique discrète en boutique ou maison" },
];

const REVIEWS_DATA = [
  {
    author: "Brice T.",
    city: "Cotonou (Cadjehoun)",
    rating: 5,
    date: "Il y a 2 jours",
    comment: "Installée discrètement derrière ma caisse dans ma boutique de prêt-à-porter. La qualité d'image en direct sur mon téléphone est bluffante, même la nuit !",
  },
  {
    author: "Amina K.",
    city: "Calavi (Arconville)",
    rating: 5,
    date: "Il y a 3 jours",
    comment: "Je l'ai prise pour surveiller la nounou avec mon bébé de 10 mois quand je suis au travail. L'aimant tient super bien sur le frigo, et l'application est très simple.",
  },
  {
    author: "Marc O.",
    city: "Porto-Novo",
    rating: 5,
    date: "Il y a 5 jours",
    comment: "Reçu en moins de 24h à Porto-Novo. Livreur très courtois, j'ai vérifié le colis avant de payer. La détection de mouvement m'envoie une notification instantanée dès que quelqu'un entre.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne la caméra sans fil ?",
    a: "La mini caméra dispose d'une batterie rechargeable intégrée et se connecte en WiFi ou en point d'accès direct à votre téléphone (Android ou iPhone) via une application gratuite en français. Vous pouvez voir en direct ce qui se passe où que vous soyez.",
  },
  {
    q: "Peut-elle fonctionner sans WiFi ?",
    a: "Oui absolument ! Vous pouvez insérer une carte mémoire MicroSD : elle enregistre alors en continu en boucle sans avoir besoin d'internet. Vous pouvez aussi vous connecter directement en Bluetooth/Hotspot local à côté.",
  },
  {
    q: "Est-elle visible dans le noir ?",
    a: "Non ! Ses 6 LED infrarouges de vision nocturne sont invisibles à l'œil nu (pas de lumière rouge voyante), ce qui permet une discrétion totale même dans l'obscurité complète.",
  },
  {
    q: "Comment s'installe-t-elle ?",
    a: "Grâce à son aimant surpuissant intégré, elle se fixe instantanément sur n'importe quel métal (étagère, montant de porte, réfrigérateur, carrosserie). Un support rotatif 360° adhésif est également inclus pour les murs.",
  },
  {
    q: "Comment se passe la livraison au Bénin ?",
    a: "Livraison express en 24h à Cotonou, Calavi, Porto-Novo et partout au Bénin. Vous payez en espèces ou Mobile Money uniquement après avoir reçu et inspecté votre colis.",
  },
];

export default function CameraLanding({ slug = "camera" }: { slug?: string }) {
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle>(BUNDLES[1]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [includeBump, setIncludeBump] = useState(false);
  const [includeSecondUnit, setIncludeSecondUnit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Autoplay carrousel photos toutes les 4.5s
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

  const upsellConfig = getProductUpsellConfig(slug, "Mini Caméra Espionne HD A9 Pro", 16900);
  const secondUnitPrice = includeSecondUnit && upsellConfig.secondUnit ? upsellConfig.secondUnit.price : 0;
  const bumpPrice = includeBump && upsellConfig.bump ? upsellConfig.bump.price : 0;
  const totalAmount = selectedBundle.price + secondUnitPrice + bumpPrice;

  const scrollToCommander = () => {
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = document.getElementById("customer-name-input") as HTMLInputElement | null;
        if (input) input.focus({ preventScroll: true });
      }, 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const finalBundleName = selectedBundle.name 
        + (includeSecondUnit && upsellConfig.secondUnit ? ` + 2ème Exemplaire (${upsellConfig.secondUnit.title})` : "")
        + (includeBump && upsellConfig.bump ? ` + [BUMP] ${upsellConfig.bump.title}` : "");

      const createdOrder = await saveNewOrder({
        product_slug: slug,
        product_title: "Mini Caméra Espionne & Surveillance Magnétique HD A9 Pro™",
        bundle_name: finalBundleName,
        quantity: selectedBundle.quantity + (includeSecondUnit ? 1 : 0),
        total_amount: totalAmount,
        customer_name: customerName,
        customer_phone: customerPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        shipping_city: city,
        city: city,
        shipping_address: address,
        address: address,
        status: "pending",
      });

      clickedRef.current = true;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      await trackUserSession(slug, duration, true, sessionIdRef.current);

      const orderRef = createdOrder?.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
      setOrderInfo({
        order_number: orderRef,
        total_amount: totalAmount,
        customer_phone: customerPhone,
        customer_name: customerName,
      });

      setOrderSuccess(true);
      setIsSubmitting(false);
      isSubmittingRef.current = false;

      // Redirection immédiate vers l'Upsell en 1 clic
      if (upsellConfig?.upsell) {
        router.push(`/p/${slug}/upsell?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(String(totalAmount))}`);
      } else {
        router.push(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(String(totalAmount))}`);
      }
    } catch (err) {
      console.error("Erreur commande:", err);
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  return (
    <div className="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen selection:bg-emerald-500/20">

      {/* 🌟 BARRE D'URGENCE SUPÉRIEURE FIGMA-GRADE */}
      <div className="bg-slate-950 text-white text-[11px] font-bold py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 border-b border-white/10 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>PROMOTION SÉCURITÉ : -44% SUR LE PACK DUO + LIVRAISON 24H GRATUITE AU BÉNIN</span>
      </div>

      {/* 🌟 HEADER PRINCIPAL */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-sm shadow-sm">
              <Camera className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-display font-black text-lg text-slate-950 tracking-tight">
              Isivente <span className="text-xs font-mono font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Sécurité Pro</span>
            </span>
          </div>

          <button
            onClick={scrollToCommander}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(5,150,105,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            Commander (Paiement Réception)
          </button>
        </div>
      </header>

      {/* 🌟 SECTION HERO HARMONISÉE FIGMA-GRADE */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* CARROUSEL D'IMAGES HD */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <HorizontalCarousel
              slides={CAROUSEL_IMAGES}
              accentColor="#059669"
              autoplayInterval={4500}
            />
          </div>

          {/* ARGUMENTS D'ACCROCHE */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              <span>Surveillance Discrète 24h/24 & 7j/7</span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
              Protégez votre boutique, maison et voiture en direct sur votre téléphone !
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              De la taille d&apos;une pièce de monnaie, cette mini caméra magnétique sans fil s&apos;aimante discrètement n&apos;importe où, filme en HD 1080P et vous alerte instantanément en cas d&apos;intrusion.
            </p>

            {/* PUCES D'AVANTAGES CLÉS */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>Vision en direct HD 1080P sur smartphone (iPhone & Android)</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Moon className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>Vision nocturne infrarouge invisible dans l&apos;obscurité totale</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bell className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>Détection de mouvement intelligente avec notifications instantanées</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Wifi className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>Aimant puissant intégré + Enregistrement continu sur carte SD</span>
              </div>
            </div>

            {/* PRIX ET BOUTON HERO */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center sm:text-left">
                <div className="text-[11px] font-semibold text-slate-500 line-through">25 000 FCFA</div>
                <div className="font-mono font-black text-2xl text-emerald-700">16 900 FCFA</div>
              </div>

              <button
                onClick={scrollToCommander}
                className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-[0_10px_25px_-5px_rgba(5,150,105,0.4)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>COMMANDER MAINTENANT</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Paiement Réception</span>
              </button>
            </div>

          </div>

        </div>

        {/* 🌟 SECTION COMMANDE (MODÈLE UMÉI AVEC PACKS & BUMP) */}
        <UmeiStyleOrderSection
          productSlug={slug}
          productTitle="Mini Caméra Espionne & Surveillance Magnétique HD A9 Pro™"
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
          bumpOffer={upsellConfig.bump}
          includeSecondUnit={includeSecondUnit}
          setIncludeSecondUnit={setIncludeSecondUnit}
          secondUnitOffer={upsellConfig.secondUnit}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          whatsappNumber="2290192901817"
          orderSuccess={orderSuccess}
          orderNumber={orderInfo?.order_number || ""}
          onResetOrder={() => setOrderSuccess(false)}
        />

        {/* 🌟 4 CAS D'USAGE INCONTOURNABLES AU BÉNIN */}
        <section className="space-y-6 pt-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Applications Pratiques
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-950">
              Où installer votre mini caméra ?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                🏪
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900">Boutique & Caisse</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Surveillez la caisse, les rayons et l&apos;activité des employés en temps réel depuis chez vous.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                👶
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900">Nounou & Enfants</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gardez un œil rassurant sur vos enfants et la nounou à la maison pendant vos heures de bureau.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                🚗
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900">Voiture & Parking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aimantez la caméra sur le tableau de bord pour enregistrer toute tentative de dégradation ou de vol.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-2 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                🚪
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900">Entrée & Portail</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Soyez alerté sur votre smartphone dès qu&apos;une personne s&apos;approche de votre porte la nuit.
              </p>
            </div>

          </div>
        </section>

        {/* 🌟 AVIS CLIENTS VÉRIFIÉS */}
        <section className="space-y-6 pt-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Témoignages Clients
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-950">
              Ce que disent nos clients au Bénin
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{rev.author}</span>
                  <span className="font-normal text-slate-500 font-mono text-[11px]">{rev.city}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🌟 FAQ ACCORDÉON */}
        <section className="space-y-4 pt-6 max-w-2xl mx-auto">
          <div className="text-center space-y-1 mb-4">
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-950">
              Questions Fréquentes
            </h2>
            <p className="text-xs text-slate-600">Tout ce que vous devez savoir avant de commander</p>
          </div>

          <div className="space-y-2.5">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-emerald-600" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* 🌟 FOOTER CLAIR */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-2 mt-12 pb-24 md:pb-8">
        <p className="font-bold text-slate-800">Isivente • Sécurité & Innovations au Bénin</p>
        <p>Service Client WhatsApp : +229 01 92 90 18 17 • Cotonou, Bénin</p>
        <p className="text-[11px] text-slate-400">Paiement 100% sécurisé à la livraison • Garantie échange 30 jours</p>
      </footer>

      {/* 📱 STICKY BAR MOBILE */}
      <StickyMobileCtaBar
        price={selectedBundle.price}
        targetSectionId="commander"
        accentColor="#059669"
        whatsappNumber="2290192901817"
        whatsappMessage={`Bonjour Isivente, je souhaite commander la Mini Caméra de Surveillance HD (${selectedBundle.name}).`}
      />

    </div>
  );
}
