"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Sparkles, 
  Flame, 
  Heart, 
  Zap, 
  PackageCheck,
  Award,
  RefreshCw,
  Gift,
  ArrowRight,
  Activity,
  Check
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Crème Anti-Douleur Articulaire & Musculaire CapsaCare™ (Tube 100g)",
    subtitle: "Formule naturelle complète aux extraits de Capsaïcine, Menthol, Arnica, MSM et Glucosamine",
    price: 14900,
    originalPrice: 25000,
    savings: 10100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_SLIDES = [
  {
    image: "/images/capsacare/capsacare-hero.jpg",
    alt: "CapsaCare Pain Relief Cream - Dites adieu à la douleur",
  },
  {
    image: "/images/capsacare/capsacare-formule.jpg",
    alt: "Formule aux extraits naturels CapsaCare - Capsaïcine, Menthol, Arnica, MSM, Glucosamine",
  },
  {
    image: "/images/capsacare/capsacare-zones.jpg",
    alt: "Zones de soulagement ciblées CapsaCare - Dos, Genoux, Épaules, Cou",
  },
  {
    image: "/images/capsacare/capsacare-utilisation.jpg",
    alt: "Conseils d'utilisation simples CapsaCare - Appliquez, Massez, Profitez",
  },
  {
    image: "/images/capsacare/capsacare-mobilite.jpg",
    alt: "Retrouvez votre mobilité et une vie sans douleur avec CapsaCare",
  },
];

interface CustomerReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    name: "Mathieu G.",
    location: "Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes douleurs de bas du dos ont disparu en quelques minutes",
    comment: "Je passe 8 heures par jour assis au bureau et le soir j'avais des lombaires bloquées. Dès la première application de CapsaCare, on sent d'abord un effet frais très agréable suivi d'une chaleur profonde qui dénoue complètement le muscle. Je revis !",
    verified: true,
  },
  {
    name: "Bernadette K.",
    location: "Calavi (Arconville)",
    rating: 5,
    date: "Achat vérifié",
    title: "Mes genoux ne me font plus souffrir dans les escaliers",
    comment: "À 58 ans, monter les marches était devenu une corvée à cause de mes articulations du genou. J'applique cette crème matin et soir : la texture pénètre rapidement sans tacher les vêtements et le soulagement est impressionnant. Merci à Isivente pour la livraison rapide.",
    verified: true,
  },
  {
    name: "Romain D.",
    location: "Porto-Novo",
    rating: 5,
    date: "Achat vérifié",
    title: "Indispensable après mes séances de sport et de football",
    comment: "Après les matchs du week-end, j'avais toujours des courbatures et des tensions aux mollets et aux épaules. Un petit massage avec CapsaCare après la douche et le lendemain matin je n'ai aucune raideur. Très bon produit.",
    verified: true,
  },
];

const FAQS_DATA = [
  {
    q: "Comment agit la crème CapsaCare sur la douleur ?",
    a: "CapsaCare combine une double action thermique et anti-inflammatoire immédiate. Le menthol procure un effet rafraîchissant instantané qui anesthésie la sensation de tiraillement, tandis que la capsaïcine et le gingembre diffusent une chaleur bienfaisante qui stimule la micro-circulation et détend les fibres musculaires en profondeur."
  },
  {
    q: "Quelles sont les zones du corps que je peux traiter ?",
    a: "Vous pouvez appliquer CapsaCare sur le bas du dos (lombaires), la nuque et les trapèzes, les épaules, les genoux, les coudes, les chevilles ainsi que les mains et poignets. Évitez simplement les yeux, les muqueuses et les plaies ouvertes."
  },
  {
    q: "La crème colle-t-elle ou tache-t-elle les vêtements ?",
    a: "Absolument pas. La formule CapsaCare a été développée sous forme d'émulsion fluide non grasse à pénétration rapide. Dès que vous massez la zone pendant 1 à 2 minutes, la crème est entièrement absorbée par la peau sans laisser de film collant ni odeur médicamenteuse entêtante."
  },
  {
    q: "Combien de fois par jour puis-je l'appliquer ?",
    a: "Pour un résultat optimal, nous recommandons 2 à 3 applications par jour (par exemple matin et soir). Prélevez une noisette de crème et massez doucement la zone douloureuse jusqu'à absorption complète."
  },
  {
    q: "Comment se déroulent la livraison et le paiement au Bénin ?",
    a: "La livraison est effectuée en 24h chrono à Cotonou, Calavi, Porto-Novo et dans toutes les villes du Bénin. Vous payez en espèces (14 900 FCFA) uniquement après avoir reçu et inspecté votre colis auprès du livreur."
  }
];

export default function CapsaCareLanding({ slug = "capsacare" }: { slug?: string }) {
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

  // Carrousel auto-défilant (Pilier 3)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  useEffect(() => {
    if (isCarouselHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isCarouselHovered]);

  // Capture silencieuse du prospect dès 8 chiffres
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 8) {
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        city: city,
        address: address,
        product_slug: "capsacare",
        product_title: "Crème Soulagement Douleurs CapsaCare™",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      }).catch(() => {});
    }
  }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);

  useEffect(() => {
    trackViewContent({
      content_name: "Crème Soulagement Douleurs CapsaCare™",
      content_ids: ["capsacare", "creme-douleur"],
      value: 14900,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    recordInteraction();
    trackInitiateCheckout({
      content_name: "Crème Soulagement Douleurs CapsaCare™",
      content_ids: ["capsacare"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: 1,
    });
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      setOrderError("Veuillez renseigner votre numéro de téléphone pour la livraison.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    try {
      const order = await saveNewOrder({
        product_title: "Crème Anti-Douleur Articulaire & Musculaire CapsaCare™ (Tube 100g)",
        product_slug: "capsacare",
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

      markLeadConverted(customerPhone.trim(), "capsacare");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: "Crème Soulagement Douleurs CapsaCare™",
          price: selectedBundle.price,
          quantity: 1,
        }));
      }

      const successUrl = `/p/capsacare/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* ── 1. BANDEAU TOP BAR CLAIR ÉPURÉ ── */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center tracking-wide">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Livraison express sous 24h à Cotonou, Calavi & tout le Bénin • Paiement en espèces à la livraison</span>
        </div>
      </div>

      {/* ── 2. HEADER NAVIGATION FOND CLAIR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Flame className="w-4 h-4 stroke-[1.75]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">ISIVENTE</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.97] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_2px_8px_-2px_rgba(217,119,6,0.4)] transition-all duration-100 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer"
          >
            <span>Commander</span>
            <span className="font-mono tabular-nums text-amber-100 text-[11px]">(14 900 F)</span>
          </button>
        </div>
      </header>

      {/* ── 3. CONTENEUR PRINCIPAL ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16 space-y-10">
        
        {/* ── 4. EN-TÊTE TITRE & ACCROCHE ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Soulagement Ciblé Articulations & Muscles</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-2xl mx-auto">
            Dites enfin <span className="text-amber-600">adieu à la douleur</span> et retrouvez votre <span className="text-blue-600">liberté de mouvement.</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Formule active concentrée aux extraits de Capsaïcine, Menthol, Arnica, MSM et Glucosamine. Agit en quelques minutes sur le dos, les genoux et les épaules.
          </p>
        </div>

        {/* ── 5. CARROUSEL D'IMAGES AUTO-DÉFILANT (PILIER 3 - SANS STICKER OBSTRUANT) ── */}
        <div 
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-3 sm:p-5"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl bg-slate-900/5 border border-slate-100 overflow-hidden">
            {CAROUSEL_SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-contain p-1 sm:p-3"
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ))}

            {/* Boutons précédent / suivant discrets */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicateurs de diapositives */}
            <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5">
              {CAROUSEL_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentSlide ? "w-6 bg-amber-600" : "w-2 bg-slate-300"
                  }`}
                  aria-label={`Aller à la diapositive ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. 3 BADGES DE RÉASSURANCE ISIVENTE (PILIER 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Livraison Express 24h</p>
              <p className="text-[11px] text-slate-500">Cotonou, Calavi & Départements</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Paiement à la Réception</p>
              <p className="text-[11px] text-slate-500">Réglez 14 900 F après contrôle</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Garantie & Test 100%</p>
              <p className="text-[11px] text-slate-500">Formule certifiée sous scellé</p>
            </div>
          </div>
        </div>

        {/* ── 7. PILIER 2 : FORMULAIRE DE COMMANDE PLACÉ IMMÉDIATEMENT SOUS LE HERO ── */}
        <div ref={orderSectionRef} id="commander" className="scroll-mt-20">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="capsacare"
            productTitle="Crème Anti-Douleur Articulaire & Musculaire CapsaCare™ (Tube 100g)"
            productImage="/images/capsacare/capsacare-hero.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => {
              setSelectedBundle(b);
              trackAddToCart({
                content_name: `CapsaCare - ${b.name}`,
                content_ids: ["capsacare", b.id || "solo"],
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
            accentColor="#d97706"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── 8. GRILLE DES BÉNÉFICES / 4 ACTIONS MAJEURES ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Efficacité Ciblée</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">4 actions thérapeutiques réunies dans une formule puissante</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Une technologie d'absorption rapide qui cible directement le foyer de l'inflammation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Action 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Flame className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Effet Thermique Actif</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                La capsaïcine et le menthol créent une sensation chaud-froid qui apaise immédiatement les récepteurs de la douleur.
              </p>
            </div>

            {/* Action 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Réduction de l&apos;Inflammation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                L&apos;Arnica et le gingembre naturel pénètrent les tissus profonds pour dégonfler les articulations douloureuses.
              </p>
            </div>

            {/* Action 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Activity className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Mobilité Articulaire</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le MSM et la glucosamine soutiennent la lubrification des cartilages et redonnent de la souplesse aux mouvements.
              </p>
            </div>

            {/* Action 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Absorption Sans Gras</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pénètre en moins de 2 minutes sans coller ni tacher les vêtements. Prêt pour continuer votre journée sereinement.
              </p>
            </div>

          </div>
        </section>

        {/* ── 9. DÉMONSTRATION D'UTILISATION (3 ÉTAPES FACILES) ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Application Quotidienne</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Un geste simple pour un soulagement durable
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Seulement 2 minutes par application pour retrouver votre confort corporel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Étape 1</span>
              <h3 className="font-bold text-slate-900 text-sm">Appliquez</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Déposez une petite quantité de crème directement sur la zone musculaire ou articulaire douloureuse.
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Étape 2</span>
              <h3 className="font-bold text-slate-900 text-sm">Massez</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Massez doucement en mouvements circulaires jusqu&apos;à pénétration et absorption complète dans la peau.
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Étape 3</span>
              <h3 className="font-bold text-slate-900 text-sm">Profitez</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ressentez l&apos;action de la chaleur apaisante qui détend les fibres et libère vos articulations.
              </p>
            </div>

          </div>

          <div className="relative max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/capsacare/capsacare-utilisation.jpg"
              alt="Guide visuel d'application de CapsaCare"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>

          <div className="text-center pt-2">
            <button
              onClick={scrollToOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Commander mon tube CapsaCare (14 900 FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── 10. BÉNÉFICES COMPARATIFS ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Comparatif : Pourquoi CapsaCare surpasse les solutions classiques</h3>
            <p className="text-xs sm:text-sm text-slate-500">La supériorité d&apos;une formule naturelle multi-actifs ciblée</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Solution Classique */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                <XCircle className="w-4 h-4" />
                <span>Baumes ordinaires & comprimés</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Effet superficiel et très bref qui ne traite pas la raideur articulaire en profondeur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Textures grasses et collantes qui tachent les habits avec une odeur forte.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Comprimés répétés agressifs pour l&apos;estomac et le système digestif.</span>
                </li>
              </ul>
            </div>

            {/* CapsaCare */}
            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                <span>CapsaCare™ Formule Thérapeutique</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Double action thermique (Chaud / Froid) qui apaise et libère la tension en profondeur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Enrichi en MSM et Glucosamine pour renforcer la souplesse et le confort des articulations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Formule douce 100% naturelle, pénétration rapide sans traces ni résidus gras.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── 11. INFOGRAPHIE FORMULE NATURELLE & ZONES CIBLÉES ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Actifs Révolutionnaires</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Les 5 piliers naturels de la formule CapsaCare
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Chaque ingrédient a été rigoureusement sélectionné pour son efficacité clinique sur les douleurs musculo-squelettiques.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
            <Image
              src="/images/capsacare/capsacare-formule.jpg"
              alt="Formule complète des extraits naturels de CapsaCare"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
        </section>

        {/* ── 12. BANNIÈRE PROMOTIONNELLE & RAPPEL PRIX ── */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Offre Spéciale Isivente Bénin</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold max-w-xl mx-auto leading-tight">
            Retrouvez le plaisir de bouger librement et sans douleur dès aujourd&apos;hui
          </h2>

          <p className="text-amber-100 text-xs sm:text-sm max-w-lg mx-auto">
            Livraison rapide sous 24h à Cotonou, Calavi et partout au Bénin. Vous ne payez qu&apos;à la réception après vérification de votre tube.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="font-mono text-xl sm:text-2xl font-bold text-white">
              14 900 FCFA <span className="line-through text-amber-300/70 text-base font-normal">25 000 FCFA</span>
            </div>

            <button
              onClick={scrollToOrder}
              className="px-6 py-3.5 bg-white text-amber-900 hover:bg-amber-50 active:scale-95 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Commander maintenant</span>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </button>
          </div>
        </div>

        {/* ── 13. AVIS CLIENTS VÉRIFIÉS BÉNIN ── */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-800 ml-1.5">4.9 / 5</span>
              <span className="text-xs text-slate-500">(148 clients satisfaits au Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Témoignages de nos clients</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Découvrez les retours d&apos;expérience de personnes qui ont soulagé leurs douleurs du quotidien grâce à CapsaCare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CUSTOMER_REVIEWS.map((rev, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-2.5 h-2.5" />
                      {rev.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">« {rev.title} »</h3>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-900">{rev.name}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 14. FAQ INTERACTIVE ── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Questions Fréquentes (FAQ)</h2>
            <p className="text-xs sm:text-sm text-slate-500">Tout ce que vous devez savoir avant de passer commande</p>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, i) => (
              <div key={i} className="py-3.5">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 animate-[fadeIn_150ms_ease-in-out]">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── 15. FOOTER OFFICIEL ── */}
      <footer className="bg-slate-900 text-white text-xs py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-bold tracking-tight text-sm">ISIVENTE BÉNIN</span>
          </div>
          <p className="text-slate-400 text-[11px] max-w-md mx-auto">
            Distributeur exclusif de produits de bien-être et de confort au Bénin. Livraison rapide et paiement sécurisé en espèces à la livraison.
          </p>
          <div className="text-slate-500 text-[10px] pt-3 border-t border-slate-800/80">
            © {new Date().getFullYear()} Isivente. Tous droits réservés. Service client WhatsApp disponible 7j/7.
          </div>
        </div>
      </footer>

      {/* ── 16. BARRE MOBILE STICKY CTA ── */}
      <StickyMobileCtaBar
        price={14900}
        targetSectionId="commander"
        buttonText="Commander"
        accentColor="#d97706"
      />

    </div>
  );
}
