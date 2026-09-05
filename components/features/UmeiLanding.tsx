"use client";

import React, { useState, useEffect, useRef } from "react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
import { getProductUpsellConfig } from "@/lib/upsellConfig";
import { 
  Check, 
  ArrowRight, 
  ChevronDown, 
  Sparkles,
  Droplets,
  HeartHandshake,
  MessageCircle
} from "lucide-react";

interface ProductBundle {
  id: string;
  name: string;
  quantity: number;
  price: number;
  original_price: number;
  badge: string | null;
  description: string;
  popular?: boolean;
}

const BUNDLES: ProductBundle[] = [
  {
    id: "solo",
    name: "Pack Découverte (1 Brosse)",
    quantity: 1,
    price: 14900,
    original_price: 24900,
    badge: null,
    description: "Idéal pour tester l'expérience",
    popular: false
  },
  {
    id: "duo",
    name: "Pack Sérénité Duo (2 Brosses)",
    quantity: 2,
    price: 24900,
    original_price: 49800,
    badge: "⭐ Populaire (-50%)",
    description: "1 pour toi + 1 offerte pour ta fille ou amie",
    popular: true
  },
  {
    id: "famille",
    name: "Pack Famille (3 Brosses)",
    quantity: 3,
    price: 34900,
    original_price: 74700,
    badge: "🔥 Meilleur Prix",
    description: "Pour toute la maison au tarif le plus bas",
    popular: false
  }
];

export default function UmeiLanding({ slug }: { slug: string }) {
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle>(BUNDLES[1]);
  const [includeBump, setIncludeBump] = useState(false);
  const upsellConfig = getProductUpsellConfig(slug || "umei");
  const bumpOffer = upsellConfig?.bump;

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // ID de session stable — généré UNE SEULE FOIS au montage du composant
  const sessionIdRef = useRef(
    "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8)
  );
  const startTimeRef = useRef(Date.now());
  const clickedRef = useRef(false); // flag partagé entre cleanup et beforeunload

  useEffect(() => {
    const save = () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      trackUserSession(slug || "umei", duration, clickedRef.current, sessionIdRef.current);
    };

    window.addEventListener("beforeunload", save);
    return () => {
      save(); // cleanup React (navigation SPA)
      window.removeEventListener("beforeunload", save);
    };
  }, [slug]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
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

      const orderData = {
        product_slug: slug || "umei",
        product_title: "Brosse Démêlante Vapeur Uméi 3-en-1",
        bundle_id: selectedBundle.id,
        bundle_name: finalBundleName,
        quantity: selectedBundle.quantity,
        total_amount: finalTotal,
        customer_name: customerName,
        customer_phone: customerPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        shipping_city: city,
        city: city,
        shipping_address: address,
        address: address,
        status: 'pending' as const
      };

      const res = await saveNewOrder(orderData);
      // Marquer la session comme cliquée (conversion)
      clickedRef.current = true;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      await trackUserSession(slug || "umei", duration, true, sessionIdRef.current);
      const orderNum = res?.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
      setOrderNumber(orderNum);
      setOrderSuccess(true);
      setIsSubmitting(false);
      document.getElementById("commander")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Order error:", err);
      alert("Erreur lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F5F0FC] min-h-screen text-[#241B36] font-sans antialiased overflow-x-hidden w-full max-w-full relative selection:bg-purple-200 selection:text-purple-900 pb-24 md:pb-0">
      
      {/* 🌟 HEADER EXACT */}
      <header className="sticky top-0 z-50 bg-[#F5F0FC]/95 backdrop-blur-md border-b border-[#8B6FE0]/15 w-full">
        <nav className="flex items-center justify-between py-3.5 px-4 md:px-8 max-w-[1180px] mx-auto w-full">
          <div className="font-display text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            <span className="w-2.5 h-2.5 bg-[#FF5C93] rounded-full inline-block"></span>
            <span>uméi</span>
          </div>
          
          <ul className="hidden md:flex gap-8 text-[15px] font-semibold">
            <li>
              <button onClick={() => scrollToSection("demo-video")} className="hover:text-[#FF5C93] transition-colors opacity-75 hover:opacity-100">
                Démonstration
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("comment")} className="hover:text-[#FF5C93] transition-colors opacity-75 hover:opacity-100">
                Comment ça marche
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("avis")} className="hover:text-[#FF5C93] transition-colors opacity-75 hover:opacity-100">
                Avis
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("faq")} className="hover:text-[#FF5C93] transition-colors opacity-75 hover:opacity-100">
                Questions
              </button>
            </li>
          </ul>

          <button
            onClick={() => scrollToSection("commander")}
            className="bg-[#FF5C93] hover:bg-[#E13D74] text-white px-5 py-2 rounded-full text-sm font-bold shadow-[0_8px_20px_-8px_rgba(255,92,147,0.6)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Commander
          </button>
        </nav>
      </header>

      {/* 🚀 HERO SECTION EXACTE - IMAGE UNIQUE EN PREMIER PUIS ARGUMENTS DE VENTE */}
      <section className="pt-6 md:pt-14 pb-0 px-4 md:px-8 max-w-[1180px] mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
          
          {/* 1. VRAIE PHOTO DU PRODUIT AVEC STICKERS (EN PREMIER) */}
          <div className="md:col-span-5 flex justify-center items-center pt-2 md:pt-0 order-1">
            <div className="relative w-full max-w-[310px] sm:max-w-[360px] md:max-w-[400px] mx-auto px-2 select-none">
              
              {/* Badge avis affiché au-dessus sur mobile */}
              <div className="inline-flex md:hidden items-center gap-2 bg-white/90 border border-[#8B6FE0]/20 px-3 py-1 rounded-full shadow-xs mb-3">
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <span className="text-xs font-bold text-[#241B36]">4.9/5 (+1420 femmes comblées)</span>
              </div>

              {/* Conteneur image */}
              <div className="relative">
                {/* STICKER 1 HAUT GAUCHE */}
                <div className="absolute -top-2 left-0 sm:-left-4 w-[90px] h-[90px] sm:w-[105px] sm:h-[105px] bg-[#A8E6C9] text-[#241B36] rounded-full flex items-center justify-center text-center font-display font-bold text-[11px] sm:text-[12px] leading-tight p-2 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.18)] -rotate-12 z-20 pointer-events-none">
                  3-en-1 vapeur + huile + clic
                </div>

                {/* IMAGE RÉELLE */}
                <img 
                  src="/images/umei-hero-real.jpg" 
                  alt="Brosse vapeur uméi en action, jet de vapeur visible" 
                  className="rounded-[28px] sm:rounded-[32px] w-full shadow-[0_25px_50px_-20px_rgba(139,111,224,0.4)] object-cover"
                />

                {/* STICKER 2 BAS DROITE */}
                <div className="absolute -bottom-2 right-0 sm:-right-4 w-[80px] h-[80px] sm:w-[88px] sm:h-[88px] bg-[#F8D9B4] text-[#241B36] rounded-full flex items-center justify-center text-center font-display font-bold text-[10px] sm:text-[11px] leading-tight p-2 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.18)] rotate-12 z-20 pointer-events-none">
                  Sans chaleur agressive
                </div>
              </div>

            </div>
          </div>

          {/* 2. TEXTES ÉMOTIONNELS & CTA (EN DEUXIÈME) */}
          <div className="md:col-span-7 space-y-5 text-center md:text-left flex flex-col items-center md:items-start order-2">
            
            <div className="hidden md:inline-flex items-center gap-2 bg-white/80 border border-[#8B6FE0]/20 px-3.5 py-1 rounded-full shadow-sm">
              <div className="flex text-amber-400 text-xs">
                ★★★★★
              </div>
              <span className="text-xs font-bold text-[#241B36]">
                4.9/5 (+1420 femmes comblées)
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.12] text-[#241B36] tracking-tight max-w-xl text-center md:text-left">
              Démêler tes <span className="text-[#8B6FE0]">boucles</span> ne devrait pas <span className="text-[#FF5C93]">faire mal.</span>
            </h1>

            <p className="text-[#6B5F87] text-sm sm:text-base md:text-lg font-medium max-w-lg leading-relaxed text-center md:text-left">
              Vapeur, huile essentielle et clic libérateur — dans une seule brosse. Fini le peigne qui accroche et le fer qui abîme.
            </p>

            {/* BOUTONS D'ACTION DU HERO */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 w-full pt-1">
              <button
                onClick={() => scrollToSection("commander")}
                className="w-full sm:w-auto bg-[#FF5C93] hover:bg-[#E13D74] text-white px-7 py-3.5 rounded-full font-bold text-base shadow-[0_12px_28px_-10px_rgba(255,92,147,0.55)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
              >
                <span>Je commande — 14 900 FCFA</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>

              <button
                onClick={() => scrollToSection("demo-video")}
                className="w-full sm:w-auto bg-white text-[#241B36] hover:bg-[#EEE6FA] border border-[#8B6FE0]/20 px-6 py-3.5 rounded-full font-bold text-sm shadow-[0_6px_18px_-8px_rgba(139,111,224,0.35)] hover:-translate-y-0.5 transition-all text-center"
              >
                Voir comment ça marche
              </button>
            </div>

            {/* BADGES RÉASSURANCE */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1 w-full">
              <span className="bg-white text-[#6B5F87] text-xs font-bold py-1.5 px-3.5 rounded-full shadow-[0_4px_14px_-6px_rgba(139,111,224,0.3)] border border-[#8B6FE0]/15">
                💵 Paiement à la livraison
              </span>
              <span className="bg-white text-[#6B5F87] text-xs font-bold py-1.5 px-3.5 rounded-full shadow-[0_4px_14px_-6px_rgba(139,111,224,0.3)] border border-[#8B6FE0]/15">
                🚚 Livraison 24h–48h
              </span>
              <span className="bg-white text-[#6B5F87] text-xs font-bold py-1.5 px-3.5 rounded-full shadow-[0_4px_14px_-6px_rgba(139,111,224,0.3)] border border-[#8B6FE0]/15">
                🔍 Inspection du colis à l&apos;arrivée
              </span>
            </div>

          </div>

        </div>

        {/* BANDEAU MARQUEE DÉFILANT */}
        <div className="bg-[#8B6FE0] text-white py-3 overflow-hidden mt-8 md:mt-12 rounded-lg w-full max-w-full">
          <div className="flex whitespace-nowrap animate-marquee font-display font-semibold text-xs sm:text-sm md:text-base">
            <span className="px-4 flex items-center gap-3">VAPEUR <em className="not-italic text-[#F8D9B4]">✺</em> BRUME + HUILE <em className="not-italic text-[#F8D9B4]">✺</em> CLIC LIBÉRATEUR <em className="not-italic text-[#F8D9B4]">✺</em> SANS CHALEUR AGRESSIVE <em className="not-italic text-[#F8D9B4]">✺</em> POUR TOUTES LES TEXTURES <em className="not-italic text-[#F8D9B4]">✺</em></span>
            <span className="px-4 flex items-center gap-3">VAPEUR <em className="not-italic text-[#F8D9B4]">✺</em> BRUME + HUILE <em className="not-italic text-[#F8D9B4]">✺</em> CLIC LIBÉRATEUR <em className="not-italic text-[#F8D9B4]">✺</em> SANS CHALEUR AGRESSIVE <em className="not-italic text-[#F8D9B4]">✺</em> POUR TOUTES LES TEXTURES <em className="not-italic text-[#F8D9B4]">✺</em></span>
          </div>
        </div>
      </section>

      {/* 🎬 SECTION DÉMONSTRATION VIDÉO */}
      <section id="demo-video" className="py-12 md:py-20 bg-[#EEE6FA]/60 border-y border-[#8B6FE0]/15 mt-8 px-4 md:px-8 w-full overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="mb-6">
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-[#241B36]">
              Voyez la brosse uméi en action
            </h2>
            <p className="text-[#6B5F87] text-xs sm:text-base mt-2 max-w-lg mx-auto font-medium">
              Regardez comment la micro-brume détend les boucles pour un brossage fluide et sans douleur.
            </p>
          </div>

          <div className="bg-white p-2.5 sm:p-4 rounded-[24px] sm:rounded-[28px] shadow-[0_20px_50px_-15px_rgba(139,111,224,0.35)] border border-[#8B6FE0]/20 max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden bg-[#241B36] aspect-video flex items-center justify-center">
              
              <div className="absolute top-2.5 left-2.5 bg-[#241B36]/85 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 z-10">
                <span className="w-2 h-2 rounded-full bg-[#FF5C93] animate-ping"></span>
                <span>Démonstration en direct</span>
              </div>

              <video 
                src="/videos/demo-umei.mp4"
                poster="/images/umei-hero-real.jpg"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-cover"
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          </div>

        </div>
      </section>

      {/* 📝 FORMULAIRE DE COMMANDE DIRECT (MODÈLE UMÉI PLACÉ DIRECTEMENT SOUS LA VIDÉO) */}
      <UmeiStyleOrderSection
        productSlug={slug || "umei"}
        productTitle="Brosse Démêlante Vapeur Uméi 3-en-1"
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
        accentColor="#FF5C93"
        whatsappNumber="2290192901817"
        orderSuccess={orderSuccess}
        orderNumber={orderNumber}
        onResetOrder={() => {
          setOrderSuccess(false);
          setOrderNumber("");
        }}
      />

      {/* 🌿 SECTION 3 AVANTAGES ("Ce qu'il y a dedans, en vrai.") */}
      <section id="comment" className="py-12 md:py-20 px-4 md:px-8 max-w-[1180px] mx-auto w-full overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-[#241B36] mb-2">
            Ce qu'il y a dedans, en vrai.
          </h2>
          <p className="text-[#6B5F87] text-xs sm:text-base font-medium">
            Pas de magie — juste trois mécanismes qui font le travail à ta place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-white rounded-[22px] sm:rounded-[26px] p-6 sm:p-8 shadow-[0_16px_40px_-20px_rgba(139,111,224,0.35)] border border-[#8B6FE0]/10 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#B9A6F0] flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <Droplets className="w-6 h-6 sm:w-7 sm:h-7 text-[#241B36]" />
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#241B36] mb-2">Vapeur</h3>
            <p className="text-[#6B5F87] text-xs sm:text-[15px] font-medium leading-relaxed">
              Assouplit la fibre avant même que la brosse touche tes cheveux. Le démêlage devient presque agréable.
            </p>
          </div>

          <div className="bg-white rounded-[22px] sm:rounded-[26px] p-6 sm:p-8 shadow-[0_16px_40px_-20px_rgba(139,111,224,0.35)] border border-[#8B6FE0]/10 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#B7DEF0] flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#241B36]" />
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#241B36] mb-2">Brume + huile</h3>
            <p className="text-[#6B5F87] text-xs sm:text-[15px] font-medium leading-relaxed">
              Brumisation 360° qui diffuse ton huile essentielle préférée en même temps que l'eau. Hydratation intégrée.
            </p>
          </div>

          <div className="bg-white rounded-[22px] sm:rounded-[26px] p-6 sm:p-8 shadow-[0_16px_40px_-20px_rgba(139,111,224,0.35)] border border-[#8B6FE0]/10 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#A8E6C9] flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7 text-[#241B36]" />
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#241B36] mb-2">Clic libérateur</h3>
            <p className="text-[#6B5F87] text-xs sm:text-[15px] font-medium leading-relaxed">
              Un clic et tes cheveux se détachent de la brosse. Plus besoin de les décoincer un par un, à la main.
            </p>
          </div>
        </div>
      </section>

      {/* 💜 STATEMENT */}
      <section className="px-4 md:px-8 max-w-[1180px] mx-auto py-4 w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#B9A6F0] to-[#B7DEF0] rounded-[28px] sm:rounded-[36px] py-10 sm:py-14 px-6 text-center">
          <h2 className="font-display font-bold text-xl sm:text-3xl md:text-[44px] text-[#241B36] max-w-xl mx-auto leading-tight">
            Tes cheveux méritent <span className="text-white">mieux</span> qu'un peigne qui tire.
          </h2>
        </div>
      </section>

      {/* 📸 PHOTO FEATURE VRAIE PHOTO ("Un clic, et c'est réglé.") */}
      <section className="py-12 md:py-20 px-4 md:px-8 max-w-[1180px] mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex justify-center">
            <img 
              src="/images/umei-clic-real.jpg" 
              alt="Gros plan sur les picots et le clic de la brosse uméi" 
              className="rounded-[24px] sm:rounded-[28px] shadow-[0_20px_50px_-20px_rgba(139,111,224,0.4)] w-full max-w-xs sm:max-w-sm object-cover"
            />
          </div>
          
          <div className="md:col-span-7 space-y-4 text-center md:text-left">
            <span className="bg-[#F8D9B4] text-[#241B36] text-xs font-bold py-1.5 px-4 rounded-full inline-block">
              Le détail qui change tout
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-[#241B36]">
              Un clic, et c'est réglé.
            </h2>
            <p className="text-[#6B5F87] text-xs sm:text-base font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
              Sur une brosse classique, retirer les cheveux coincés prend souvent plus de temps que le coiffage lui-même. Le mécanisme à dégagement automatique d'uméi règle ça en une seconde.
            </p>
            
            <ul className="space-y-2.5 pt-2 text-xs sm:text-base font-semibold text-[#241B36] text-left max-w-md mx-auto md:mx-0">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FF5C93]/15 flex items-center justify-center text-[#FF5C93] shrink-0">✓</span>
                <span>Aucun cheveu coincé dans les poils</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FF5C93]/15 flex items-center justify-center text-[#FF5C93] shrink-0">✓</span>
                <span>Nettoyage en quelques secondes</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FF5C93]/15 flex items-center justify-center text-[#FF5C93] shrink-0">✓</span>
                <span>Poils doux, sans casse ni tiraillement</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 💬 SECTION AVIS ("On te laisse pas juste sur parole.") */}
      <section id="avis" className="py-12 md:py-20 px-4 md:px-8 max-w-[1180px] mx-auto w-full overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-[#241B36] mb-2">
            On te laisse pas juste sur parole.
          </h2>
          <p className="text-[#6B5F87] text-xs sm:text-base font-medium">
            Ce que disent celles qui ont déjà changé de rituel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="bg-[#B9A6F0] rounded-[22px] sm:rounded-[24px] p-6 shadow-[0_14px_34px_-18px_rgba(139,111,224,0.4)] border border-[#8B6FE0]/15 text-left">
            <p className="text-[#241B36] text-sm sm:text-[15.5px] font-semibold leading-relaxed mb-3">
              "Je ne savais même pas qu'un démêlage pouvait ne pas faire mal. Vie changée, sans exagérer."
            </p>
            <div className="font-display font-bold text-xs text-[#241B36] opacity-75">
              Amina G. — Cotonou
            </div>
          </div>

          <div className="bg-[#A8E6C9] rounded-[22px] sm:rounded-[24px] p-6 shadow-[0_14px_34px_-18px_rgba(139,111,224,0.4)] border border-[#8B6FE0]/15 text-left">
            <p className="text-[#241B36] text-sm sm:text-[15.5px] font-semibold leading-relaxed mb-3">
              "Mon fer à lisser prend la poussière depuis que j'ai reçu la brosse. Mes pointes me remercient."
            </p>
            <div className="font-display font-bold text-xs text-[#241B36] opacity-75">
              Christelle T. — Abomey-Calavi
            </div>
          </div>

          <div className="bg-[#F8D9B4] rounded-[22px] sm:rounded-[24px] p-6 shadow-[0_14px_34px_-18px_rgba(139,111,224,0.4)] border border-[#8B6FE0]/15 text-left">
            <p className="text-[#241B36] text-sm sm:text-[15.5px] font-semibold leading-relaxed mb-3">
              "Le clic pour libérer les cheveux, c'est le détail auquel personne ne pense — et qui change tout."
            </p>
            <div className="font-display font-bold text-xs text-[#241B36] opacity-75">
              Mireille D. — Porto-Novo
            </div>
          </div>
        </div>
      </section>

      {/* ❓ FAQ */}
      <section id="faq" className="py-12 px-4 md:px-8 max-w-[760px] mx-auto w-full overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-[#241B36]">
            Les questions qu'on nous pose
          </h2>
        </div>

        <div className="space-y-2.5">
          {[
            {
              q: "Convient-elle aux cheveux crépus et très bouclés ?",
              a: "Oui. La vapeur assouplit la fibre avant le passage de la brosse, ce qui la rend particulièrement adaptée aux textures bouclées, frisées et crépues."
            },
            {
              q: "Faut-il ajouter de l'eau à chaque utilisation ?",
              a: "Le réservoir se remplit en quelques secondes et suffit pour plusieurs séances. Tu peux y ajouter l'huile essentielle de ton choix."
            },
            {
              q: "La vapeur abîme-t-elle les cheveux comme un fer à lisser ?",
              a: "Non. Contrairement à un fer chauffant, la vapeur hydrate la fibre au lieu de l'assécher — c'est ce qui permet de démêler sans fragiliser tes cheveux."
            },
            {
              q: "Livrez-vous dans mon pays ?",
              a: "Nous livrons sous 24 à 48 heures dans les zones desservies (Cotonou, Calavi, Porto-Novo et environs), avec paiement à la livraison. Contacte-nous pour confirmer la disponibilité dans ta ville."
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-[#8B6FE0]/15 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-display font-bold text-xs sm:text-base text-[#241B36] flex justify-between items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#FF5C93] shrink-0 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-xs sm:text-sm text-[#6B5F87] font-medium leading-relaxed border-t border-[#8B6FE0]/10 bg-[#F5F0FC]/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 📦 COFFRET DÉBALLÉ & UNBOXING */}
      <section className="py-10 px-4 md:px-8 max-w-[900px] mx-auto w-full overflow-hidden">
        <div className="bg-[#241B36] text-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF5C93] font-bold bg-[#FF5C93]/20 px-3 py-1 rounded-full border border-[#FF5C93]/30">
              Coffret Prestige Soin
            </span>
            <h3 className="text-xl font-bold text-white font-display">Dans votre colis Uméi™</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                <span><strong>1x Brosse Démêlante Vapeur Uméi</strong> avec mécanisme de clic libérateur</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                <span><strong>1x Flacon pipette compte-gouttes</strong> pour remplir l'eau & huiles essentielles</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                <span><strong>1x Câble de recharge rapide</strong> USB universel</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">✓</span>
                <span><strong>1x Guide des rituels capillaires</strong> pour cheveux crépus, frisés et ondulés</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-center space-y-3">
            <div className="text-xs uppercase tracking-wider text-[#F8D9B4] font-bold">Paiement 100% à la Livraison</div>
            <div className="text-lg font-bold text-white">Livraison 24h & Contrôle Colis</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ouvrez le paquet avec le livreur à domicile avant de régler en espèces ou Mobile Money.
            </p>
            <button
              type="button"
              onClick={() => scrollToSection("commander")}
              className="w-full bg-[#FF5C93] hover:bg-[#E13D74] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-[#FF5C93]/30 cursor-pointer"
            >
              Commander ma brosse (14 900 F)
            </button>
          </div>
        </div>
      </section>

      {/* 🚀 FINAL CTA */}
      <section className="py-10 px-4 md:px-8 max-w-[1180px] mx-auto text-center w-full overflow-hidden">
        <div className="bg-[#241B36] text-white rounded-[28px] sm:rounded-[36px] py-10 sm:py-14 px-5">
          <h2 className="font-display font-bold text-xl sm:text-3xl md:text-4xl max-w-md mx-auto mb-5">
            Prête à changer ton rituel capillaire ?
          </h2>
          <button
            onClick={() => scrollToSection("commander")}
            className="w-full sm:w-auto bg-[#FF5C93] hover:bg-[#E13D74] text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Commander ma brosse — 14 900 FCFA
          </button>
        </div>
      </section>

      {/* 🦶 FOOTER */}
      <footer className="py-6 px-4 border-t border-[#8B6FE0]/15 max-w-[1180px] mx-auto w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-semibold text-[#6B5F87] text-center">
          <div>© 2026 uméi. Tous droits réservés.</div>
          <ul className="flex gap-4">
            <li><button onClick={() => scrollToSection("demo-video")}>Vidéo</button></li>
            <li><button onClick={() => scrollToSection("commander")}>Commander</button></li>
            <li><button onClick={() => scrollToSection("faq")}>Questions</button></li>
          </ul>
        </div>
      </footer>

    </div>
  );
}
