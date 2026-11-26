"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Check,
  Flame,
  BatteryCharging,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Award,
  ArrowRight,
  Activity,
  Clock,
  Star,
  Sliders,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import ExitIntentModal from "@/components/features/ExitIntentModal";
import { trackViewContent, trackAddToCart, trackInitiateCheckout } from "@/lib/metaPixel";
import { saveNewOrder } from "@/lib/ordersStorage";
import { markLeadConverted, saveOrUpdateLead } from "@/lib/leadsStorage";
import { usePagePresence } from "@/hooks/usePagePresence";

// ── PILIER 1 : OFFRE UNIQUE HARMONISÉE (19 900 FCFA) ──
const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Masseur de Genou Électrique Sans Fil Chauffant™",
    subtitle:
      "Coffret complet : 1 appareil universel sans fil (genou gauche/droit, épaule ou coude) + sangle Velcro réglable + câble de recharge USB-C",
    price: 19900,
    originalPrice: 32000,
    savings: 12100,
    quantity: 1,
    popular: true,
  },
];

// ── RÈGLE DU CARROUSEL : EXACTEMENT 5 VISUELS NARRATIFS ──
const HERO_IMAGES = [
  {
    src: "/images/masseur-genou/hero-1.jpg",
    alt: "Masseur de Genou chauffant avec chaleur apaisante et massage vibrant",
  },
  {
    src: "/images/masseur-genou/hero-2.jpg",
    alt: "Appareil ergonomique sans fil pour le confort et le bien-être des genoux",
  },
  {
    src: "/images/masseur-genou/hero-3.jpg",
    alt: "Utilisation confortable à domicile sur le canapé avec maintien Velcro réglable",
  },
  {
    src: "/images/masseur-genou/hero-4.jpg",
    alt: "Intérieur équipé de LED lumière rouge infrarouge apaisante et port de charge USB-C",
  },
  {
    src: "/images/masseur-genou/hero-5.jpg",
    alt: "Panneau tactile LED intuitif avec plusieurs niveaux de chaleur et vibrations",
  },
];

// ── AVIS CLIENTS VÉRIFIÉS BÉNIN ──
const REVIEWS = [
  {
    name: "Célestin A.",
    city: "Cotonou (Cadjeoun)",
    rating: 5,
    title: "Mes genoux se détendent vraiment le soir après le travail",
    comment:
      "Je monte et descends beaucoup d'escaliers toute la journée. Je le pose 15 minutes devant la télé avec la chaleur et les vibrations : c'est sans fil, très agréable et super simple à régler sur l'écran tactile.",
  },
  {
    name: "Hortense G.",
    city: "Abomey-Calavi",
    rating: 5,
    title: "Offert à ma mère, elle l'utilise chaque soir",
    comment:
      "Ma maman avait souvent les genoux raides le matin et en fin de journée. Elle a tout de suite compris les boutons tactiles. Elle apprécie surtout la chaleur douce + la lumière rouge à l'intérieur.",
  },
  {
    name: "Romaric T.",
    city: "Porto-Novo",
    rating: 5,
    title: "Testé devant le livreur avant de payer",
    comment:
      "Colis reçu le lendemain. J'ai allumé l'écran, vérifié que la chaleur montait bien, testé les vibrations et les LED rouges devant le livreur avant de régler les 19 900 F. Sérieux et propre.",
  },
  {
    name: "Sébastien D.",
    city: "Cotonou (Akpakpa)",
    rating: 5,
    title: "Idéal après le foot et utilisable aussi sur l'épaule",
    comment:
      "Après mes matchs du week-end, mes genoux tiraient beaucoup. Avec la sangle Velcro réglable, il tient parfaitement sans glisser et je l'utilise aussi sur mon épaule quand elle est tendue.",
  },
];

// ── FAQ INTERACTIVE ──
const FAQS = [
  {
    q: "L'offre à 19 900 FCFA comprend-elle 1 ou 2 appareils ?",
    a: "Le coffret comprend 1 appareil universel sans fil qui s'adapte aussi bien au genou gauche qu'au genou droit, ainsi qu'à l'épaule ou au coude grâce à sa sangle Velcro réglable. Une séance dure seulement 15 minutes par genou.",
  },
  {
    q: "Fonctionne-t-il sans fil ? Comment se recharge-t-il ?",
    a: "Oui, il intègre une batterie rechargeable pour une utilisation 100 % sans fil sur votre canapé ou au lit. Il se recharge facilement via le câble USB-C inclus (sur chargeur de téléphone classique).",
  },
  {
    q: "Quels sont les modes disponibles sur l'écran tactile ?",
    a: "Vous contrôlez indépendamment la chaleur apaisante (plusieurs niveaux), le massage vibrant et la lumière rouge infrarouge. Un arrêt automatique après 15 minutes protège l'appareil et vos articulations.",
  },
  {
    q: "Puis-je tester le masseur devant le livreur avant de payer ?",
    a: "Oui, à 100 %. Vous ne payez aucune avance en ligne : le livreur vous remet l'appareil à Cotonou, Calavi, Porto-Novo ou partout au Bénin, vous vérifiez l'écran, la chaleur, les vibrations et les LED rouges avant de payer les 19 900 FCFA.",
  },
];

export default function MasseurGenouLanding({ slug = "masseur-genou" }: { slug?: string }) {
  const router = useRouter();
  const { recordInteraction } = usePagePresence(slug);
  const orderSectionRef = useRef<HTMLDivElement>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Meta Pixel ViewContent au chargement
  useEffect(() => {
    trackViewContent({
      content_name: selectedBundle.name,
      content_ids: [slug],
      value: selectedBundle.price,
      currency: "XOF",
    });
  }, [slug, selectedBundle.name, selectedBundle.price]);

  // Pilier 3 : Carrousel auto-défilant avec pause au survol
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  // Pilier 9 : Capture silencieuse des prospects dès 8 chiffres
  useEffect(() => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 8) return;
    const timer = setTimeout(() => {
      saveOrUpdateLead({
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        customer_email: customerEmail,
        city,
        address,
        product_slug: slug,
        product_title: "Masseur de Genou Électrique Sans Fil Chauffant™",
        bundle_name: selectedBundle.name,
        total_amount: selectedBundle.price,
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [customerPhone, customerName, customerPhone2, customerEmail, city, address, selectedBundle, slug]);

  const scrollToOrder = () => {
    recordInteraction();
    trackAddToCart({
      content_name: selectedBundle.name,
      content_ids: [slug],
      value: selectedBundle.price,
      currency: "XOF",
    });
    orderSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 8) {
      setOrderError("Veuillez saisir un numéro WhatsApp valide (au moins 8 chiffres).");
      return;
    }

    setIsSubmitting(true);
    recordInteraction();
    trackInitiateCheckout({
      content_name: selectedBundle.name,
      content_ids: [slug],
      value: selectedBundle.price,
      currency: "XOF",
      customer_phone: cleanPhone,
      customer_name: customerName,
      city,
    });

    try {
      const created = await saveNewOrder({
        product_slug: slug,
        product_title: "Masseur de Genou Électrique Sans Fil Chauffant™",
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity || 1,
        total_amount: selectedBundle.price,
        customer_name: customerName.trim() || "Client",
        customer_phone: cleanPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        customer_email: customerEmail.trim() || undefined,
        shipping_city: city,
        city,
        shipping_address: address.trim(),
        address: address.trim(),
        status: "pending",
      });

      await markLeadConverted(cleanPhone, slug);

      const orderRef =
        created?.order_number || "CMD-" + Math.floor(100000 + Math.random() * 900000);

      try {
        sessionStorage.setItem(
          "isivente_last_purchase_meta",
          JSON.stringify({
            title: "Masseur de Genou Électrique Sans Fil Chauffant™",
            price: selectedBundle.price,
            quantity: selectedBundle.quantity || 1,
            customer_email: customerEmail.trim() || undefined,
          })
        );
      } catch {}

      router.push(
        `/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(
          cleanPhone
        )}&name=${encodeURIComponent(customerName.trim() || "Client")}&total=${encodeURIComponent(
          String(selectedBundle.price)
        )}`
      );
    } catch (err) {
      console.error("Order submit error:", err);
      setOrderError("Erreur réseau lors de la validation. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased pb-24 md:pb-12">
      {/* 1. BANDEAU TOP BAR CLAIR ÉPURÉ */}
      <div className="bg-[#0B3B8C] text-white text-center py-2 px-4 text-xs font-medium tracking-wide">
        Livraison Express 24h au Bénin · Paiement en espèces à la réception après test
      </div>

      {/* 2. HEADER NAVIGATION FOND CLAIR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-black/[0.08]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#14281D] text-white flex items-center justify-center font-bold text-xs">
              IS
            </span>
            <span className="font-semibold text-base tracking-tight text-[#171717]">ISIVENTE</span>
          </div>
          <button
            type="button"
            onClick={scrollToOrder}
            className="px-4 py-2 rounded-xl bg-[#0B3B8C] hover:bg-[#082d6b] text-white text-xs sm:text-sm font-semibold font-mono tabular-nums shadow-xs transition-colors cursor-pointer"
          >
            Commander (19 900 F)
          </button>
        </div>
      </header>

      {/* 3. CONTENEUR PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 pt-6 sm:pt-10 space-y-12 sm:space-y-16">
        {/* 4. EN-TÊTE TITRE & ACCROCHE (MIROIR DE LA GÊNE — 100% CONFORME META) */}
        <section className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff6ff] border border-[#0B3B8C]/15 text-[#0B3B8C] text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Chaleur Apaisante · Vibrations · Lumière Rouge · Sans Fil</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#171717] leading-tight">
            Genoux raides en fin de journée ou en montant les escaliers ?
          </h1>
          <p className="text-sm sm:text-base text-[#525252] leading-relaxed">
            Offrez à vos genoux <strong>15 minutes de chaleur douce, de vibrations ciblées et de lumière rouge apaisante</strong> chez vous, sans fil.
            Un appareil universel rechargeable (genou gauche, genou droit, épaule ou coude) pour retrouver un vrai confort articulaire au quotidien.
          </p>
        </section>

        {/* 5. CARROUSEL HERO (EXACTEMENT 5 VISUELS, SANS BADGE SUPERPOSÉ) */}
        <section className="space-y-4">
          <div
            onMouseEnter={() => setIsHeroHovered(true)}
            onMouseLeave={() => setIsHeroHovered(false)}
            className="relative aspect-square max-w-xl mx-auto rounded-2xl overflow-hidden bg-[#faf8fc] border border-black/[0.08]"
          >
            <Image
              src={HERO_IMAGES[currentSlide].src}
              alt={HERO_IMAGES[currentSlide].alt}
              fill
              priority={currentSlide === 0}
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)
              }
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border border-black/[0.1] text-[#171717] flex items-center justify-center shadow-xs hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 border border-black/[0.1] text-[#171717] flex items-center justify-center shadow-xs hover:bg-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
            {HERO_IMAGES.map((img, idx) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden border shrink-0 transition-opacity cursor-pointer ${
                  currentSlide === idx
                    ? "border-[#0B3B8C] opacity-100 ring-2 ring-[#0B3B8C]/20"
                    : "border-black/[0.08] opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.src} alt="" loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* 6. 3 BADGES DE RÉASSURANCE */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-xl mx-auto pt-2">
            <div className="p-3 rounded-xl bg-[#fafafa] border border-black/[0.08] text-center space-y-1">
              <Truck className="w-4 h-4 stroke-[1.75] text-[#0B3B8C] mx-auto" />
              <div className="text-[11px] sm:text-xs font-semibold text-[#171717]">Livraison Express 24h</div>
              <div className="text-[10px] text-[#737373]">Cotonou, Calavi &amp; Bénin</div>
            </div>
            <div className="p-3 rounded-xl bg-[#fafafa] border border-black/[0.08] text-center space-y-1">
              <ShieldCheck className="w-4 h-4 stroke-[1.75] text-[#15803d] mx-auto" />
              <div className="text-[11px] sm:text-xs font-semibold text-[#171717]">Paiement à la Réception</div>
              <div className="text-[10px] text-[#737373]">Zéro avance demandée</div>
            </div>
            <div className="p-3 rounded-xl bg-[#fafafa] border border-black/[0.08] text-center space-y-1">
              <RefreshCw className="w-4 h-4 stroke-[1.75] text-[#171717] mx-auto" />
              <div className="text-[11px] sm:text-xs font-semibold text-[#171717]">Garantie &amp; Test 100%</div>
              <div className="text-[10px] text-[#737373]">Testez devant le livreur</div>
            </div>
          </div>
        </section>

        {/* 7. FORMULAIRE DE COMMANDE COD — IMMÉDIATEMENT APRÈS LE HERO ET LES BADGES */}
        <section ref={orderSectionRef} id="commander" className="scroll-mt-20 max-w-xl mx-auto space-y-3">
          {orderError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
              {orderError}
            </div>
          )}
          <UmeiStyleOrderSection
            productSlug={slug}
            productTitle="Masseur de Genou Électrique Sans Fil Chauffant™"
            productImage="/images/masseur-genou/hero-1.jpg"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={setSelectedBundle}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerPhone2={customerPhone2}
            setCustomerPhone2={setCustomerPhone2}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            city={city}
            setCity={setCity}
            address={address}
            setAddress={setAddress}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitOrder}
            accentColor="#0B3B8C"
          />

          {/* BOUTON COMMANDE DIRECTE WHATSAPP (1 CLIC) */}
          <div className="pt-1 text-center space-y-1.5">
            <p className="text-[11px] font-medium text-[#737373]">
              Vous préférez commander ou poser une question directement ?
            </p>
            <a
              href={`https://wa.me/2290192901817?text=${encodeURIComponent(
                "Bonjour Isivente ! Je souhaite commander le Masseur de Genou Sans Fil Chauffant à 19 900 FCFA (paiement à la livraison)."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                recordInteraction();
                trackAddToCart({
                  content_name: selectedBundle.name,
                  content_ids: [slug],
                  value: selectedBundle.price,
                  currency: "XOF",
                });
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#16A34A] hover:bg-[#15803d] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 stroke-[2]" />
              <span>Commander par WhatsApp (1 clic)</span>
            </a>
          </div>
        </section>

        {/* 8. MIROIR D'IDENTIFICATION */}
        <section className="space-y-5 pt-6 border-t border-black/[0.08]">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
              Reconnaissez-vous l&apos;une de ces situations ?
            </h2>
            <p className="text-xs sm:text-sm text-[#525252]">
              Un appareil pensé pour apporter détente et confort articulaire à domicile, sans contrainte de fil.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#eff6ff]/60 border border-[#0B3B8C]/15 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 stroke-[2] text-[#0B3B8C] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-[#171717]">Genoux lourds après la marche ou la station debout</div>
                <p className="text-xs text-[#525252] leading-relaxed">
                  Après une longue journée debout au commerce, au bureau ou sur le terrain, 15 minutes de chaleur détendent l&apos;articulation.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#eff6ff]/60 border border-[#0B3B8C]/15 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 stroke-[2] text-[#0B3B8C] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-[#171717]">Raideur au réveil ou en montant les escaliers</div>
                <p className="text-xs text-[#525252] leading-relaxed">
                  La chaleur progressive et les vibrations douces aident à retrouver une sensation de souplesse et de bien-être.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#eff6ff]/60 border border-[#0B3B8C]/15 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 stroke-[2] text-[#0B3B8C] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-[#171717]">Cadeau utile pour papa ou maman</div>
                <p className="text-xs text-[#525252] leading-relaxed">
                  Grand écran tactile lisible, arrêt automatique 15 min et zéro câble qui gêne dans le salon.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#eff6ff]/60 border border-[#0B3B8C]/15 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 stroke-[2] text-[#0B3B8C] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-[#171717]">Récupération après le sport ou la conduite</div>
                <p className="text-xs text-[#525252] leading-relaxed">
                  Sangle Velcro ajustable : utilisable sur le genou gauche, le genou droit, l&apos;épaule ou le coude.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. GRILLE DES 4 BÉNÉFICES MAJEURS */}
        <section className="space-y-6 pt-6 border-t border-black/[0.08]">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
              3 actions combinées dans un seul appareil sans fil
            </h2>
            <p className="text-xs sm:text-sm text-[#525252]">
              Conçu pour épouser parfaitement la forme du genou et diffuser un confort homogène
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-2">
              <Flame className="w-5 h-5 stroke-[1.75] text-[#0B3B8C]" />
              <h3 className="font-semibold text-sm text-[#171717]">Chaleur apaisante multi-niveaux</h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Montée en température douce et réglable pour envelopper toute l&apos;articulation d&apos;une chaleur relaxante.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-2">
              <Sparkles className="w-5 h-5 stroke-[1.75] text-[#0B3B8C]" />
              <h3 className="font-semibold text-sm text-[#171717]">Couronne de LED lumière rouge</h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Des LED infrarouges intégrées au cœur du coussinet accompagnent la chaleur pour une détente en profondeur.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-2">
              <Activity className="w-5 h-5 stroke-[1.75] text-[#0B3B8C]" />
              <h3 className="font-semibold text-sm text-[#171717]">Massage vibrant haute précision</h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Plusieurs modes de vibration réglables indépendamment pour détendre les tensions autour du genou, de l&apos;épaule ou du coude.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-2">
              <BatteryCharging className="w-5 h-5 stroke-[1.75] text-[#0B3B8C]" />
              <h3 className="font-semibold text-sm text-[#171717]">100 % sans fil &amp; écran tactile LED</h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Batterie rechargeable en USB-C, maintien Velcro ajustable, affichage clair et minuterie automatique 15 minutes.
              </p>
            </div>
          </div>
        </section>

        {/* 10. COMPARATIF CLASSIQUE VS ISIVENTE */}
        <section className="space-y-5 pt-6 border-t border-black/[0.08]">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-[#171717]">
            Solutions temporaires vs Masseur de Genou Sans Fil™
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Habitudes classiques
              </div>
              <ul className="space-y-2 text-xs text-[#525252]">
                <li>• Pommades et baumes qui tachent et s&apos;achètent chaque semaine</li>
                <li>• Serviettes chaudes qui refroidissent en 3 minutes</li>
                <li>• Genouillères simples qui serrent sans détendre l&apos;articulation</li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-[#eff6ff]/70 border border-[#0B3B8C]/25 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0B3B8C]">
                Masseur de Genou Sans Fil™ (19 900 F)
              </div>
              <ul className="space-y-2 text-xs text-[#171717] font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                  <span>Un seul achat de 19 900 F réutilisable chaque jour à volonté</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                  <span>Triple action chaleur constante + vibrations + lumière rouge sans fil</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                  <span>Test complet devant le livreur avant de payer</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 11. INFOGRAPHIE & CONTENU DU COFFRET */}
        <section className="space-y-4 pt-6 border-t border-black/[0.08]">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
              Design ergonomique &amp; prise en main immédiate
            </h2>
            <p className="text-xs sm:text-sm text-[#525252]">
              1 appareil universel sans fil (genou gauche/droit, épaule, coude), sangle Velcro ajustable et câble USB-C inclus
            </p>
          </div>
          <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-black/[0.08] bg-[#faf8fc]">
            <img
              src="/images/masseur-genou/detail-appareil.jpg"
              alt="Vue studio du Masseur de Genou sans fil avec panneau tactile LED et sangle ergonomique"
              loading="lazy"
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="max-w-xl mx-auto grid grid-cols-3 gap-2.5 text-center pt-1">
            <div className="p-3 rounded-xl bg-[#fafafa] border border-black/[0.08]">
              <Sliders className="w-4 h-4 text-[#0B3B8C] mx-auto mb-1 stroke-[1.75]" />
              <div className="text-xs font-semibold text-[#171717]">Multi-niveaux</div>
              <div className="text-[10px] text-[#737373]">Chaleur &amp; vibrations</div>
            </div>
            <div className="p-3 rounded-xl bg-[#fafafa] border border-black/[0.08]">
              <Clock className="w-4 h-4 text-[#0B3B8C] mx-auto mb-1 stroke-[1.75]" />
              <div className="text-xs font-semibold text-[#171717]">Arrêt auto 15 min</div>
              <div className="text-[10px] text-[#737373]">Sécurité intégrée</div>
            </div>
            <div className="p-3 rounded-xl bg-[#fafafa] border border-black/[0.08]">
              <BatteryCharging className="w-4 h-4 text-[#0B3B8C] mx-auto mb-1 stroke-[1.75]" />
              <div className="text-xs font-semibold text-[#171717]">Recharge USB-C</div>
              <div className="text-[10px] text-[#737373]">100 % sans fil</div>
            </div>
          </div>
        </section>

        {/* 12. BANNIÈRE PROMO & RAPPEL PRIX */}
        <section className="rounded-2xl bg-[#14281D] text-white p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Stock limité disponible à Cotonou · Livraison express 24h</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Coffret Complet Masseur de Genou Sans Fil à 19 900 FCFA
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto">
            Prix habituel <span className="line-through">32 000 F</span> — vous économisez 12 100 F et vous ne payez qu&apos;à la livraison après avoir testé l&apos;appareil devant le livreur.
          </p>
          <button
            type="button"
            onClick={scrollToOrder}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E8643C] hover:bg-[#d6552f] text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <span>Commander mon Masseur de Genou (19 900 F)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* 13. AVIS CLIENTS VÉRIFIÉS */}
        <section id="avis" className="space-y-6 pt-6 border-t border-black/[0.08]">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1 text-amber-500 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-1.5 text-sm font-bold text-[#171717]">4,9 / 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
              Avis clients vérifiés au Bénin
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REVIEWS.map((rev) => (
              <div
                key={rev.name}
                className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <h3 className="font-semibold text-sm text-[#171717]">{rev.title}</h3>
                  <p className="text-xs text-[#525252] leading-relaxed">{rev.comment}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] text-[11px] text-[#737373]">
                  <span className="font-semibold text-[#171717]">{rev.name}</span>
                  <span className="inline-flex items-center gap-1 text-[#15803d]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {rev.city}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 14. FAQ INTERACTIVE */}
        <section className="space-y-5 pt-6 border-t border-black/[0.08] max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-[#171717]">
            Questions fréquentes
          </h2>
          <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {FAQS.map((item, idx) => (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-[#171717] cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#737373] shrink-0 transition-transform ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="pb-4 text-xs sm:text-sm text-[#525252] leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 15. FOOTER OFFICIEL */}
      <footer className="mt-16 border-t border-black/[0.08] py-8 px-4 text-center text-xs text-[#737373] space-y-2">
        <div className="inline-flex items-center gap-1.5 font-semibold text-[#171717]">
          <Award className="w-4 h-4 text-[#14281D]" />
          <span>ISIVENTE — Boutique Officielle Bénin</span>
        </div>
        <p>Livraison express 24h Cotonou, Abomey-Calavi, Porto-Novo et expéditions partout au Bénin.</p>
      </footer>

      {/* 16. BARRE MOBILE STICKY CTA */}
      <StickyMobileCtaBar
        price={19900}
        targetSectionId="commander"
        accentColor="#0B3B8C"
        buttonText="Commander"
        whatsappMessage="Bonjour Isivente ! Je suis intéressé(e) par le Masseur de Genou Électrique Sans Fil Chauffant à 19 900 FCFA."
      />

      {/* 17. POP-UP D'ABANDON INTELLIGENT (PILIER 7) */}
      <ExitIntentModal slug={slug} />
    </div>
  );
}
