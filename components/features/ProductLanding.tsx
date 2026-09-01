"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Check, 
  Star, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  PhoneCall, 
  MessageCircle, 
  Droplets, 
  Zap, 
  HeartHandshake, 
  AlertCircle,
  XCircle,
  ThumbsUp,
  Volume2
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

interface FeatureItem {
  icon?: string;
  title: string;
  desc: string;
}

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  avatarText: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// Données riches par défaut pour une résilience maximale
const DEFAULT_PRODUCT_DATA = {
  title: "Brosse Démêlante Vapeur Uméi Pro 3-en-1",
  tagline: "Vapeur assouplissante, brume d'huile essentielle et clic libérateur. Fini les pleurs et les cheveux arrachés.",
  brand: "uméi.",
  image_url: "/images/umei-hero-real.jpg",
  secondary_image: "/images/umei-hero-transparent.png",
  click_image: "/images/umei-clic-real.jpg",
  video_url: "/videos/demo-umei.mp4",
  price: 7500,
  original_price: 15000,
  rating: 4.9,
  reviewsCount: 1420,
  description: "Dites adieu aux séances de coiffure douloureuses. La micro-brume thermo-active détend la fibre capillaire instantanément pour un glissement sans accroc.",
  bundles: [
    {
      id: "solo",
      name: "Pack Découverte (1 Brosse)",
      quantity: 1,
      price: 7500,
      original_price: 15000,
      badge: null,
      description: "Idéal pour tester l'expérience Uméi à la maison.",
      popular: false
    },
    {
      id: "duo",
      name: "Pack Sérénité Duo (2 Brosses)",
      quantity: 2,
      price: 13000,
      original_price: 30000,
      badge: "⭐ PLUS POPULAIRE - ÉCONOMISEZ 57%",
      description: "1 pour vous + 1 pour votre fille, sœur ou amie.",
      popular: true
    },
    {
      id: "famille",
      name: "Pack Famille (3 Brosses)",
      quantity: 3,
      price: 18000,
      original_price: 45000,
      badge: "🔥 MEILLEURE OFFRE",
      description: "Le pack complet pour toute la maison au tarif le plus avantageux.",
      popular: false
    }
  ] as ProductBundle[],
  features: [
    {
      title: "Zéro Douleur, Zéro Larme",
      desc: "Les picots flexibles combinés à la brume glissent à travers les nœuds les plus tenaces sans arracher le cuir chevelu."
    },
    {
      title: "Micro-Vapeur Hydratante",
      desc: "Hydrate chaque mèche en profondeur pendant le brossage, réduisant la casse de plus de 85%."
    },
    {
      title: "Parfait pour Cheveux Afro & Texturés",
      desc: "Spécialement calibrée pour les types 3A à 4C, ainsi que les extensions, perruques et cheveux épais d'enfants."
    }
  ] as FeatureItem[],
  testimonials: [
    {
      name: "Amina G.",
      location: "Cotonou (Haie Vive)",
      rating: 5,
      comment: "Mes séances de démêlage avec ma fille de 6 ans étaient un calvaire chaque dimanche. Depuis qu'on utilise la brosse Uméi avec un peu d'eau tiède, elle ne pleure plus du tout ! C'est devenu notre moment plaisir.",
      date: "Il y a 3 jours",
      verified: true,
      avatarText: "AG"
    },
    {
      name: "Christelle T.",
      location: "Abomey-Calavi",
      rating: 5,
      comment: "Très sceptique au début mais franchement impressionnée. Sur mes cheveux crépus 4C bien denses, ça glisse tout seul. Paiement fait au livreur après ouverture du paquet. Service client au top !",
      date: "Il y a 5 jours",
      verified: true,
      avatarText: "CT"
    },
    {
      name: "Mireille D.",
      location: "Porto-Novo",
      rating: 5,
      comment: "J'ai pris le pack duo pour offrir une brosse à ma sœur. La qualité est incroyable, la batterie tient longtemps et la brume est ultra fine. Je recommande à 100%.",
      date: "Il y a 1 semaine",
      verified: true,
      avatarText: "MD"
    }
  ] as Testimonial[],
  faqs: [
    {
      question: "Comment fonctionne le paiement à la livraison ?",
      answer: "Vous ne payez strictement rien en ligne. Vous remplissez le formulaire, nous confirmons votre adresse par appel ou WhatsApp, le livreur vous remet le colis et vous réglez directement en espèces à la livraison."
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "À Cotonou, Calavi et Porto-Novo, la livraison s'effectue en 24h à 48h ouvrées. Pour les autres villes du Bénin (Parakou, Ouidah, Bohicon...), comptez 48h à 72h."
    },
    {
      question: "Puis-je vérifier le colis avant de payer le livreur ?",
      answer: "Absolument ! Vous avez le droit d'ouvrir le carton de livraison devant le coursier pour vérifier l'état du produit avant d'effectuer le paiement."
    },
    {
      question: "Cette brosse est-elle adaptée aux cheveux de type 4C et aux enfants ?",
      answer: "Oui, elle a été tout particulièrement conçue pour les cheveux texturés, frisés, bouclés et afro (types 3 et 4), ainsi que pour le cuir chevelu sensible des enfants."
    },
    {
      question: "Que mettre dans le réservoir de la brosse ?",
      answer: "Vous pouvez y mettre simplement de l'eau claire (de préférence minérale ou filtrée) ou mélanger quelques gouttes de votre sérum capillaire aqueux préféré pour un soin nutritif instantané."
    }
  ] as FAQItem[]
};

export default function ProductLanding({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+229 ");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Social Proof Toast dynamique
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ name: "Fatima", city: "Cotonou", time: "il y a 3 min", pack: "Pack Duo" });

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();
        
        if (data && !error) {
          const merged = {
            ...DEFAULT_PRODUCT_DATA,
            ...data,
            bundles: (data.bundles && data.bundles.length > 0) ? data.bundles : DEFAULT_PRODUCT_DATA.bundles,
            features: (data.features && data.features.length > 0) ? data.features : DEFAULT_PRODUCT_DATA.features,
            testimonials: (data.testimonials && data.testimonials.length > 0) ? data.testimonials : DEFAULT_PRODUCT_DATA.testimonials,
            faqs: (data.faqs && data.faqs.length > 0) ? data.faqs : DEFAULT_PRODUCT_DATA.faqs,
          };
          setProduct(merged);
          const defaultBundle = merged.bundles.find((b: any) => b.popular || b.id === 'duo') || merged.bundles[0];
          setSelectedBundle(defaultBundle);
        } else {
          // Fallback avec les données Uméi
          setProduct(DEFAULT_PRODUCT_DATA);
          setSelectedBundle(DEFAULT_PRODUCT_DATA.bundles[1]);
        }
      } catch (err) {
        setProduct(DEFAULT_PRODUCT_DATA);
        setSelectedBundle(DEFAULT_PRODUCT_DATA.bundles[1]);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  // Déclenchement périodique des toasts d'achats récents
  useEffect(() => {
    const buyers = [
      { name: "Fatima S.", city: "Cotonou (Cadjehoun)", pack: "Pack Sérénité Duo" },
      { name: "Bérénice K.", city: "Abomey-Calavi (Tankpè)", pack: "Pack Découverte" },
      { name: "Esther A.", city: "Porto-Novo (Avakpa)", pack: "Pack Sérénité Duo" },
      { name: "Priscille D.", city: "Cotonou (Fidjrossè)", pack: "Pack Famille" },
      { name: "Sylvie M.", city: "Ouidah", pack: "Pack Sérénité Duo" }
    ];

    const interval = setInterval(() => {
      const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
      setToastData({
        name: randomBuyer.name,
        city: randomBuyer.city,
        pack: randomBuyer.pack,
        time: "à l'instant"
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  const scrollToCheckout = () => {
    const element = document.getElementById("commander");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWhatsAppOrder = () => {
    const phone = "22997000000"; // Numéro commercial
    const message = encodeURIComponent(
      `Bonjour ! Je souhaite commander la *${product?.title}* (${selectedBundle?.name} - ${selectedBundle?.price?.toLocaleString('fr-FR')} FCFA). Mon nom est ${customerName || '...'} à ${city}. Merci de me recontacter !`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !selectedBundle) return;
    
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert("Veuillez saisir un numéro de téléphone valide pour la confirmation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        product_slug: slug || "umei-pro",
        product_title: product.title,
        bundle_id: selectedBundle.id,
        quantity: selectedBundle.quantity,
        total_amount: selectedBundle.price,
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_city: city,
        shipping_address: address + (notes ? ` (Note: ${notes})` : ""),
        status: 'pending'
      };

      try {
        const { error } = await supabase.from("orders").insert([orderData]);
        if (error) console.warn("Supabase order insert note:", error);
      } catch (e) {
        console.warn("Storage fallback triggered:", e);
      }

      window.location.href = `/p/${slug}/success`;
    } catch (err) {
      alert("Une erreur est survenue lors de l'enregistrement de votre commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-premium-bg gap-4">
        <div className="w-12 h-12 border-4 border-premium-accent/20 border-t-premium-accent rounded-full animate-spin"></div>
        <p className="font-display text-premium-dark font-medium animate-pulse">Chargement de votre offre exclusive...</p>
      </div>
    );
  }

  const p = product || DEFAULT_PRODUCT_DATA;

  return (
    <div className="bg-premium-bg min-h-screen text-premium-dark selection:bg-purple-200 selection:text-purple-900 overflow-x-hidden font-sans pb-20 md:pb-0">
      
      {/* 🔴 BANDEAU D'URGENCE TOP BAR */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-950 text-white text-xs md:text-sm py-2.5 px-4 text-center font-medium sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
            Offre Flash Spéciale
          </span>
          <span>
            🎁 <strong>Livraison Gratuite 24h & Paiement à la réception</strong> aujourd'hui à Cotonou et environs !
          </span>
        </div>
      </div>

      {/* 🌟 HEADER PRINCIPAL */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-[37px] z-40 transition-all">
        <div className="flex justify-between items-center max-w-6xl mx-auto px-4 md:px-8 py-3.5">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-premium-dark bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-950">
              {p.brand || "uméi."}
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              Boutique Officielle
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleWhatsAppOrder}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-full hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Besoin d'aide ? WhatsApp
            </button>
            
            <button 
              onClick={scrollToCheckout}
              className="bg-purple-900 text-white px-5 py-2 rounded-full font-medium text-xs md:text-sm shadow-md hover:bg-purple-800 hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Commander</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION AVEC VISUEL INTERACTIF */}
      <section className="relative pt-6 pb-16 md:pt-12 md:pb-24 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* COLONNE GAUCHE : TEXTE & VALEUR AJOUTÉE */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Social Proof badge */}
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 px-3.5 py-1.5 rounded-full">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-semibold text-purple-900">
                {p.rating || 4.9}/5 (+{p.reviewsCount || 1420} femmes comblées)
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-[1.15] text-premium-dark tracking-tight">
              {p.title}
            </h1>

            <p className="text-gray-600 text-base md:text-xl font-normal leading-relaxed max-w-xl">
              {p.tagline || p.description}
            </p>

            {/* PRIX EN GRAND & ÉCONOMIE */}
            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm inline-block w-full max-w-md">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-black text-3xl sm:text-4xl text-purple-900">
                  {p.price?.toLocaleString('fr-FR')} FCFA
                </span>
                {p.original_price && (
                  <span className="text-gray-400 line-through text-lg font-medium">
                    {p.original_price?.toLocaleString('fr-FR')} FCFA
                  </span>
                )}
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-md ml-auto">
                  -40% AUJOURD'HUI
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> En stock • Livraison sous 24h à 48h
              </p>
            </div>

            {/* BULLET POINTS RAPIDES */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-purple-700" />
                </div>
                <span className="text-sm md:text-base font-medium text-gray-700">
                  <strong>Paiement 100% à la livraison :</strong> Payez en espèces au coursier après vérification
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-purple-700" />
                </div>
                <span className="text-sm md:text-base font-medium text-gray-700">
                  <strong>Démêlage instantané :</strong> Fini les cheveux arrachés et les larmes d'enfants
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-purple-700" />
                </div>
                <span className="text-sm md:text-base font-medium text-gray-700">
                  <strong>Convient à tous types de cheveux :</strong> Bouclés, frisés, lisses et afro crépus 4C
                </span>
              </div>
            </div>

            {/* BOUTON D'ACTION PRINCIPAL */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 max-w-md">
              <button 
                onClick={scrollToCheckout}
                className="w-full bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white font-bold text-base md:text-lg py-4 px-8 rounded-2xl shadow-lg hover:shadow-purple-300 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Commander Maintenant</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* BADGES DE RÉASSURANCE SOUS CTA */}
            <div className="flex items-center gap-6 pt-2 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Satisfait ou échangé
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-600" /> Livraison sécurisée
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> Support 7j/7
              </span>
            </div>

          </div>

          {/* COLONNE DROITE : VISUEL PRODUIT HAUTE FIDÉLITÉ */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Lueur de fond décorative */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-purple-300/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            <div className="relative bg-gradient-to-b from-white/90 to-purple-50/50 p-6 sm:p-8 rounded-[2.5rem] border border-white/80 shadow-xl backdrop-blur-sm w-full max-w-md text-center">
              
              {/* Badge flottant sur l'image */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-100 shadow-sm flex items-center gap-1.5 z-20">
                <Droplets className="w-4 h-4 text-purple-600 animate-bounce" />
                <span className="text-xs font-bold text-purple-900">Vapeur Relaxante</span>
              </div>

              <div className="absolute top-4 right-4 bg-purple-900 text-white px-3 py-1.5 rounded-full shadow-md text-xs font-bold z-20">
                Original Certifié
              </div>

              {/* Image principale */}
              <div className="relative py-4 flex justify-center items-center overflow-hidden">
                <img 
                  src={p.image_url || "/images/brosse-transparente.png"} 
                  alt={p.title}
                  className="w-full max-w-[280px] sm:max-w-[320px] object-contain drop-shadow-[0_20px_35px_rgba(147,51,234,0.25)] hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Barre d'urgence stock */}
              <div className="mt-4 bg-white/80 p-3 rounded-xl border border-rose-100 text-left">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-rose-600 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-rose-500" /> Stock limité pour cette tournée
                  </span>
                  <span className="text-gray-700">Il reste 9 exemplaires</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 w-[82%] rounded-full animate-pulse"></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 🎬 SECTION DÉMONSTRATION VIDÉO EN DIRECT */}
      <section id="demo-video" className="py-12 md:py-16 bg-gradient-to-b from-purple-100/60 to-white border-y border-purple-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          
          <div className="mb-8">
            <span className="text-xs font-extrabold tracking-widest uppercase text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
              Démonstration Vidéo
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl text-premium-dark mt-3">
              Voyez la brosse uméi en action
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-2 max-w-xl mx-auto font-normal">
              Regardez comment la micro-brume thermo-active détend instantanément les boucles pour un brossage fluide et sans douleur.
            </p>
          </div>

          <div className="relative bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-purple-200 overflow-hidden max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden bg-purple-950 aspect-video flex items-center justify-center">
              
              {/* Badge direct */}
              <div className="absolute top-3 left-3 bg-purple-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 z-10">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Vidéo Démonstration</span>
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
            
            <div className="mt-3 flex items-center justify-center gap-4 text-xs font-semibold text-purple-900">
              <span className="flex items-center gap-1">✨ 100% Sans douleur</span>
              <span>•</span>
              <span className="flex items-center gap-1">💧 Hydratation instantanée</span>
              <span>•</span>
              <span className="flex items-center gap-1">⚡ Nettoyage 1-clic</span>
            </div>
          </div>

        </div>
      </section>

      {/* 🌿 SECTION 3 AVANTAGES MAJEURS (CARDS ÉLÉGANTES) */}
      <section className="py-16 md:py-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              Technologie & Soin
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl text-premium-dark mt-3">
              Pourquoi la Brosse Uméi change tout
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-2 font-normal">
              Une conception ergonomique et bienfaisante pensée pour préserver votre santé capillaire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {p.features?.map((feat: FeatureItem, idx: number) => (
              <div 
                key={idx} 
                className="bg-gradient-to-b from-purple-50/40 to-white p-8 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md shadow-purple-200">
                  {idx === 0 ? <HeartHandshake className="w-6 h-6" /> : idx === 1 ? <Droplets className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>
                <h3 className="font-display font-bold text-xl text-premium-dark mb-3">
                  {feat.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 📸 SECTION PHOTO DÉTAIL : LE CLIC LIBÉRATEUR */}
      <section className="py-16 md:py-20 bg-purple-50/50">
        <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-purple-100">
            <img 
              src="/images/umei-click.jpg" 
              alt="Nettoyage 1 clic brosse uméi" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
              Le détail qui change tout
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-premium-dark">
              Un clic, et vos cheveux se détachent tout seuls.
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Sur une brosse ordinaire, retirer les cheveux coincés prend des minutes et salit vos doigts. Grâce au système d’éjection breveté de la brosse uméi, une simple pression expulse tous les cheveux résiduels en une fraction de seconde.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                <Check className="w-4 h-4 text-purple-700" />
                <span>Zéro cheveu coincé entre les picots</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                <Check className="w-4 h-4 text-purple-700" />
                <span>Nettoyage instantané et 100% hygiénique</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                <Check className="w-4 h-4 text-purple-700" />
                <span>Picots doux anti-casse pour cuir chevelu sensible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⚖️ SECTION COMPARATIF AVANT / APRÈS */}
      <section className="py-16 md:py-20 max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-extrabold text-2xl md:text-4xl text-premium-dark">
            Faites la comparaison
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-2">
            Voyez pourquoi des centaines de familles ont abandonné les peignes classiques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Peigne traditionnel */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-rose-950">Démêlage Classique & Peignes</h3>
                <p className="text-xs text-rose-600 font-medium">Les méthodes traditionnelles</p>
              </div>
            </div>
            
            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Tire et arrache les cheveux aux racines</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Douleurs intenses et pleurs fréquents chez les enfants</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Cheveux cassés qui s'accumulent dans le lavabo</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Prend 45 minutes à 1 heure à chaque lavage</span>
              </li>
            </ul>
          </div>

          {/* Brosse Uméi */}
          <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 relative shadow-sm">
            <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Recommandé
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-emerald-950">Avec la Brosse Uméi Pro</h3>
                <p className="text-xs text-emerald-700 font-medium">La nouvelle routine douce</p>
              </div>
            </div>
            
            <ul className="space-y-4 text-sm text-gray-800">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Zéro douleur :</strong> La brume détend le nœud avant le passage du picot</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Préservation du volume :</strong> Moins de 85% de casse constatée</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Hydratation intégrée :</strong> Vos cheveux restent doux et brillants</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Gain de temps :</strong> Démêlage bouclé en moins de 10 minutes</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 📖 SECTION COMMENT L'UTILISER (3 ÉTAPES FACILES) */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              Simple & Rapide
            </span>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl text-premium-dark mt-3">
              Comment l'utiliser en 3 étapes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="text-center p-6 rounded-2xl bg-purple-50/30 border border-purple-50">
              <div className="w-12 h-12 rounded-full bg-purple-900 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-premium-dark">Remplissez le réservoir</h3>
              <p className="text-gray-600 text-sm">
                Ajoutez de l'eau claire ou un mélange d'eau et de sérum nourrissant dans le petit réservoir dédié.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-purple-50/30 border border-purple-50">
              <div className="w-12 h-12 rounded-full bg-purple-900 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-premium-dark">Activez la micro-vapeur</h3>
              <p className="text-gray-600 text-sm">
                Appuyez sur le bouton central. Une brume ultra-fine et apaisante commence instantanément à se diffuser.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-purple-50/30 border border-purple-50">
              <div className="w-12 h-12 rounded-full bg-purple-900 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-premium-dark">Brossez en douceur</h3>
              <p className="text-gray-600 text-sm">
                Glissez la brosse des racines vers les pointes. Les nœuds s'évanouissent sans effort ni tiraillement.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 💬 SECTION TÉMOIGNAGES & AVIS CLIENTS */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex justify-center text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <h2 className="font-display font-extrabold text-2xl md:text-4xl text-premium-dark">
            Ce que disent nos clientes
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-2">
            Retours d'expérience authentiques vérifiés après livraison.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {p.testimonials?.map((t: Testimonial, idx: number) => (
            <div key={idx} className="bg-white p-7 rounded-3xl border border-purple-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-light">{t.date}</span>
                </div>

                <p className="text-gray-700 text-sm md:text-base italic leading-relaxed mb-6">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-sm">
                  {t.avatarText || t.name.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-premium-dark flex items-center gap-1.5">
                    {t.name}
                    {t.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </h4>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🛒 SECTION CHECKOUT / COMMANDER EN CASH ON DELIVERY */}
      <section id="commander" className="py-16 md:py-24 bg-white border-t border-gray-100 relative">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Paiement à la livraison
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-premium-dark mt-3">
              Finalisez votre commande
            </h2>
            <p className="text-gray-500 text-sm md:text-base mt-2">
              Remplissez ce court formulaire. Vous ne réglez qu'à la réception de votre colis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* SÉLECTION DES PACKS (OFFRES BUNDLES) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-lg text-premium-dark">
                  1. Choisissez votre Pack
                </h3>
                <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-full">
                  Étape 1/2
                </span>
              </div>

              {p.bundles?.map((bundle: ProductBundle) => {
                const isSelected = selectedBundle?.id === bundle.id;
                return (
                  <div
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle)}
                    className={`relative p-5 sm:p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                      isSelected 
                        ? 'border-purple-800 bg-purple-50/50 shadow-md ring-2 ring-purple-600/20' 
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    {bundle.badge && (
                      <div className="absolute -top-3 left-4 bg-gradient-to-r from-purple-700 to-indigo-800 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {bundle.badge}
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                          isSelected ? 'border-purple-700 bg-purple-700' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-base sm:text-lg text-premium-dark">
                            {bundle.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">{bundle.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-display font-extrabold text-lg sm:text-xl text-purple-950">
                          {bundle.price.toLocaleString('fr-FR')} F
                        </div>
                        {bundle.original_price && (
                          <div className="text-xs text-gray-400 line-through">
                            {bundle.original_price.toLocaleString('fr-FR')} F
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* BOUTON ALTERNATIF WHATSAPP RAPIDE */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Commander directement par WhatsApp</span>
                </button>
              </div>

              {/* RAPPEL GARANTIES */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Votre colis est vérifiable avant paiement</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span>Livraison gratuite et rapide à Cotonou & environs</span>
                </div>
              </div>

            </div>

            {/* FORMULAIRE DE LIVRAISON COD */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-lg text-premium-dark">
                  2. Adresse de Livraison
                </h3>
                <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-full">
                  Étape 2/2
                </span>
              </div>

              <form onSubmit={handleSubmit} className="bg-gradient-to-b from-purple-50/30 to-white p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-sm space-y-4">
                
                {/* NOM */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nom & Prénom <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 text-sm transition-all" 
                    placeholder="Ex: Aïcha Dossou" 
                  />
                </div>

                {/* TÉLÉPHONE */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Numéro de Téléphone (Appel & WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      required 
                      type="tel" 
                      value={customerPhone} 
                      onChange={e => setCustomerPhone(e.target.value)} 
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 text-sm font-medium transition-all pl-10" 
                      placeholder="+229 97 00 00 00" 
                    />
                    <PhoneCall className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Nous vous appellerons sur ce numéro pour confirmer l'heure exacte de livraison.</p>
                </div>

                {/* VILLE & QUARTIER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Ville (Bénin) <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 text-sm transition-all cursor-pointer font-medium"
                    >
                      <option value="Cotonou">Cotonou</option>
                      <option value="Abomey-Calavi">Abomey-Calavi</option>
                      <option value="Porto-Novo">Porto-Novo</option>
                      <option value="Parakou">Parakou</option>
                      <option value="Ouidah">Ouidah</option>
                      <option value="Bohicon">Bohicon</option>
                      <option value="Autre ville">Autre ville du Bénin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Quartier & Repère précis <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 text-sm transition-all" 
                      placeholder="Ex: Haie Vive, en face pharmacie..." 
                    />
                  </div>
                </div>

                {/* REMARQUE OPTIONNELLE */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Instructions particulières (Optionnel)
                  </label>
                  <input 
                    type="text" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/30 text-xs transition-all" 
                    placeholder="Ex: Livrer après 17h, appeler avant d'arriver..." 
                  />
                </div>
                
                {/* TOTAL & CONFIRMATION */}
                <div className="pt-5 mt-4 border-t border-gray-200">
                  <div className="flex justify-between items-baseline mb-4 bg-purple-100/50 p-4 rounded-xl">
                    <div>
                      <span className="text-xs text-gray-600 font-medium block">Total à régler au livreur :</span>
                      <span className="text-xs text-emerald-700 font-bold">Livraison Gratuite incluse</span>
                    </div>
                    <span className="font-display font-black text-2xl sm:text-3xl text-purple-900">
                      {selectedBundle?.price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white font-bold text-base md:text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-purple-300 hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Validation en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Valider ma Commande (Paiement à la réception)</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-gray-400 mt-2">
                    🔒 Vos données restent strictement confidentielles et ne servent qu'à la livraison de votre commande.
                  </p>
                </div>

              </form>
            </div>

          </div>

        </div>
      </section>

      {/* ❓ SECTION FAQ ACCORDÉON */}
      <section className="py-16 md:py-20 max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            Foire Aux Questions
          </span>
          <h2 className="font-display font-extrabold text-2xl md:text-4xl text-premium-dark mt-3">
            Des questions ? Nous avons les réponses.
          </h2>
        </div>

        <div className="space-y-4">
          {p.faqs?.map((faq: FAQItem, idx: number) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-display font-bold text-base md:text-lg text-premium-dark flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-purple-700 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-100 bg-purple-50/20 font-light">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 📱 STICKY FLOATING MOBILE CTA BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 px-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-gray-500 font-medium">Prix Spécial COD</div>
          <div className="font-display font-black text-lg text-purple-900 leading-none">
            {selectedBundle?.price.toLocaleString('fr-FR')} F
          </div>
        </div>
        <button
          onClick={scrollToCheckout}
          className="bg-purple-900 text-white font-bold text-sm py-2.5 px-5 rounded-full shadow-md hover:bg-purple-800 transition-all flex items-center gap-1.5"
        >
          <span>Commander</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 🔔 LIVE SOCIAL PROOF TOAST */}
      {showToast && (
        <div className="fixed bottom-20 md:bottom-6 left-4 z-50 bg-white/95 backdrop-blur-md border border-purple-200 shadow-xl rounded-2xl p-3.5 flex items-center gap-3 max-w-xs animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-gray-800">
              {toastData.name} ({toastData.city})
            </p>
            <p className="text-gray-500 text-[11px]">
              Vient de commander le <strong>{toastData.pack}</strong> ({toastData.time})
            </p>
          </div>
        </div>
      )}

      {/* 🦶 FOOTER */}
      <footer className="bg-purple-950 text-white py-12 px-4 text-center border-t border-purple-900">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="font-display font-extrabold text-2xl tracking-tight">
            {p.brand || "uméi."}
          </div>
          <p className="text-purple-200/70 text-xs max-w-md mx-auto">
            Isivente © {new Date().getFullYear()} - Plateforme de vente et distribution directe. Service client & commandes disponibles 7j/7.
          </p>
        </div>
      </footer>

    </div>
  );
}
