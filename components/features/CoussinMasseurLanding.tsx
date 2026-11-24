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
  Car,
  Power,
  CheckCircle2,
  ChevronDown,
  Award,
  ArrowRight,
  Activity,
  Clock,
  Star,
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

// ── PILIER 1 : OFFRE UNIQUE HARMONISÉE (16 900 FCFA) ──
const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Coussin Masseur Shiatsu Chauffant 4 Têtes™",
    subtitle: "Coffret complet : coussin 4 têtes chauffantes + adaptateur maison (secteur) + adaptateur voiture 12V + sangle de maintien",
    price: 16900,
    originalPrice: 28000,
    savings: 11100,
    quantity: 1,
    popular: true,
  },
];

// ── RÈGLE DU CARROUSEL : EXACTEMENT 5 VISUELS NARRATIFS ──
const HERO_IMAGES = [
  {
    src: "/images/coussin-masseur/hero-1.jpg",
    alt: "Coussin Masseur Électrique avec Chaleur - Nuque, Dos et Jambes",
  },
  {
    src: "/images/coussin-masseur/hero-2.jpg",
    alt: "Massage complet 5 zones : Épaules, Dos, Taille, Jambes et Pieds",
  },
  {
    src: "/images/coussin-masseur/hero-3.jpg",
    alt: "Utilisation Maison, Voiture et Bureau avec double alimentation 220V et 12V",
  },
  {
    src: "/images/coussin-masseur/hero-4.jpg",
    alt: "Fonctionnement simple en 4 étapes sur un seul bouton avec chaleur apaisante",
  },
  {
    src: "/images/coussin-masseur/hero-5.jpg",
    alt: "Dimensions 31 x 18 x 10 cm et accessoires inclus : secteur maison + allume-cigare voiture",
  },
];

// ── AVIS CLIENTS VÉRIFIÉS BÉNIN ──
const REVIEWS = [
  {
    name: "Gérard H.",
    city: "Cotonou (Akpakpa)",
    rating: 5,
    title: "Indispensable dans les embouteillages Cotonou–Calavi",
    comment:
      "Je passe plus de 2 heures par jour au volant. J'ai attaché le coussin sur mon appui-tête avec la sangle élastique et le câble allume-cigare 12V : la chaleur + les 4 boules débloquent complètement la nuque dès que je rentre.",
  },
  {
    name: "Mireille D.",
    city: "Abomey-Calavi",
    rating: 5,
    title: "Offert à ma mère pour ses douleurs de bas du dos",
    comment:
      "Je l'ai pris à 16 900 F pour ma maman qui se plaignait tout le temps du dos le soir. Elle l'utilise 15 minutes devant la télé, le bouton unique est super simple à comprendre et le pétrissage est vraiment puissant.",
  },
  {
    name: "Serge K.",
    city: "Porto-Novo",
    rating: 5,
    title: "Testé devant le livreur avant de payer",
    comment:
      "Livraison rapide le lendemain. J'ai branché le coussin devant le livreur pour vérifier que les 4 têtes chauffaient et tournaient bien dans les deux sens avant de régler. Service carré.",
  },
  {
    name: "Nadine A.",
    city: "Cotonou (Fidjrossè)",
    rating: 5,
    title: "Soulage aussi les mollets et les pieds fatigués",
    comment:
      "Je reste debout toute la journée dans ma boutique. Le soir je pose mes mollets ou mes pieds dessus avec la compresse chaude activée, la fatigue disparaît en 10 minutes.",
  },
];

// ── FAQ INTERACTIVE ──
const FAQS = [
  {
    q: "Comment s'alimente le coussin masseur ?",
    a: "Le coffret inclut une double alimentation filaire : un adaptateur secteur pour la maison ou le bureau, ainsi qu'un câble allume-cigare 12V pour l'utiliser directement dans votre voiture. Il fonctionne en basse tension 12V sécurisée dès qu'il est branché.",
  },
  {
    q: "Comment fonctionne le bouton unique en 4 étapes ?",
    a: "1er appui : active la compresse chaude + le pétrissage avec inversion automatique du sens de rotation. 2e appui : maintient la chaleur et inverse le sens. 3e appui : désactive la chaleur tout en continuant le massage. 4e appui : arrêt complet.",
  },
  {
    q: "Quelles zones du corps peut-on masser ?",
    a: "Grâce à son format ergonomique (31 × 18 × 10 cm) et sa sangle élastique arrière, il s'utilise sur la nuque/cervicales, les épaules, le bas du dos/lombaires, la taille, les jambes/mollets et la voûte plantaire.",
  },
  {
    q: "Puis-je tester l'appareil avant de payer ?",
    a: "Oui, à 100 %. Vous ne payez rien en ligne : le livreur vous remet le colis à Cotonou, Calavi, Porto-Novo ou partout au Bénin, vous le branchez pour vérifier la chaleur et les 4 têtes rotatives avant de payer les 16 900 FCFA.",
  },
];

export default function CoussinMasseurLanding({ slug = "coussin-masseur" }: { slug?: string }) {
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
        product_title: "Coussin Masseur Shiatsu Chauffant 4 Têtes™",
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
        product_title: "Coussin Masseur Shiatsu Chauffant 4 Têtes™",
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
            title: "Coussin Masseur Shiatsu Chauffant 4 Têtes™",
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
      <div className="bg-[#7C2D12] text-white text-center py-2 px-4 text-xs font-medium tracking-wide">
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
            className="px-4 py-2 rounded-xl bg-[#fafafa] hover:bg-[#f4f4f5] border border-black/[0.12] text-[#171717] text-xs sm:text-sm font-semibold font-mono tabular-nums transition-colors cursor-pointer"
          >
            Commander (16 900 F)
          </button>
        </div>
      </header>

      {/* 3. CONTENEUR PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 pt-6 sm:pt-10 space-y-12 sm:space-y-16">
        {/* 4. EN-TÊTE TITRE & ACCROCHE */}
        <section className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fef2f2] border border-[#7C2D12]/15 text-[#7C2D12] text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>4 Têtes Rotatives + Compresse Chaude · Maison &amp; Voiture</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#171717] leading-tight">
            Soulagez votre nuque et votre dos en 15 minutes par jour
          </h1>
          <p className="text-sm sm:text-base text-[#525252] leading-relaxed">
            Coussin Masseur Shiatsu Électrique Chauffant avec pétrissage bidirectionnel profond.
            Livré complet avec <strong>câble secteur maison + adaptateur voiture 12V</strong> et sangle élastique.
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
                    ? "border-[#7C2D12] opacity-100 ring-2 ring-[#7C2D12]/20"
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
              <Truck className="w-4 h-4 stroke-[1.75] text-[#7C2D12] mx-auto" />
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
            productTitle="Coussin Masseur Shiatsu Chauffant 4 Têtes™"
            productImage="/images/coussin-masseur/hero-1.jpg"
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
            accentColor="#7C2D12"
          />
        </section>

        {/* 8. GRILLE DES 4 BÉNÉFICES MAJEURS */}
        <section className="space-y-6 pt-6 border-t border-black/[0.08]">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
              Pourquoi il soulage dès la première séance
            </h2>
            <p className="text-xs sm:text-sm text-[#525252]">
              Conçu pour imiter le pétrissage profond des mains d&apos;un kinésithérapeute
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-2">
              <Flame className="w-5 h-5 stroke-[1.75] text-[#7C2D12]" />
              <h3 className="font-semibold text-sm text-[#171717]">Chaleur infrarouge apaisante</h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                La compresse chaude détend instantanément les muscles contractés de la nuque et des lombaires pour une récupération rapide.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-2">
              <Activity className="w-5 h-5 stroke-[1.75] text-[#7C2D12]" />
              <h3 className="font-semibold text-sm text-[#171717]">4 têtes rotatives bidirectionnelles</h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Les 4 boules changent automatiquement de sens de rotation pour dénouer en profondeur les tensions du dos, des épaules et des jambes.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-2">
              <Car className="w-5 h-5 stroke-[1.75] text-[#7C2D12]" />
              <h3 className="font-semibold text-sm text-[#171717]">Double usage Maison &amp; Voiture</h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Fixez-le sur un siège auto ou une chaise de bureau grâce à sa sangle élastique et branchez-le sur secteur ou allume-cigare 12V.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-2">
              <Power className="w-5 h-5 stroke-[1.75] text-[#7C2D12]" />
              <h3 className="font-semibold text-sm text-[#171717]">Commande 1 bouton ultra-simple</h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                4 étapes intuitives sur un seul bouton (avec ou sans chaleur) + sécurité basse tension 12V idéale pour les parents et seniors.
              </p>
            </div>
          </div>
        </section>

        {/* 9. COMPARATIF CLASSIQUE VS ISIVENTE */}
        <section className="space-y-5 pt-6 border-t border-black/[0.08]">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-[#171717]">
            Séance de massage classique vs Coussin Shiatsu 4 Têtes™
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Solutions classiques
              </div>
              <ul className="space-y-2 text-xs text-[#525252]">
                <li>• 15 000 à 25 000 F pour une seule séance en institut</li>
                <li>• Crèmes chauffantes temporaires à racheter chaque semaine</li>
                <li>• Trajets et temps perdu après une longue journée</li>
              </ul>
            </div>
            <div className="p-5 rounded-2xl bg-[#fef2f2]/50 border border-[#7C2D12]/25 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#7C2D12]">
                Coussin Shiatsu 4 Têtes™ (16 900 F)
              </div>
              <ul className="space-y-2 text-xs text-[#171717] font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                  <span>Un seul achat de 16 900 F pour des centaines de séances à domicile</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                  <span>Utilisable partout : salon, bureau et siège voiture (câble 12V inclus)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                  <span>Test complet devant le livreur avant de payer</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 10. INFOGRAPHIE QUALITÉ & CONSTRUCTION */}
        <section className="space-y-4 pt-6 border-t border-black/[0.08]">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
              Finitions durables &amp; composants certifiés
            </h2>
            <p className="text-xs sm:text-sm text-[#525252]">
              Cuir PU respirant, maille résistante, 4 têtes de massage et alimentation sécurisée 12V
            </p>
          </div>
          <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-black/[0.08] bg-[#faf8fc]">
            <img
              src="/images/coussin-masseur/detail-qualite.jpg"
              alt="Détails qualité du Coussin de Massage Cervical : cuir, puces, alimentation et têtes de massage"
              loading="lazy"
              className="w-full h-auto object-contain"
            />
          </div>
        </section>

        {/* 11. BANNIÈRE PROMO & RAPPEL PRIX */}
        <section className="rounded-2xl bg-[#14281D] text-white p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Stock disponible à Cotonou · Livraison express 24h</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Coffret Complet Maison + Voiture à 16 900 FCFA
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto">
            Prix habituel <span className="line-through">28 000 F</span> — vous économisez 11 100 F et vous ne payez qu&apos;à la livraison après avoir testé l&apos;appareil.
          </p>
          <button
            type="button"
            onClick={scrollToOrder}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E8643C] hover:bg-[#d6552f] text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <span>Commander maintenant (16 900 F)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* 12. AVIS CLIENTS VÉRIFIÉS */}
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

        {/* 13. FAQ INTERACTIVE */}
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

      {/* 14. FOOTER OFFICIEL */}
      <footer className="mt-16 border-t border-black/[0.08] py-8 px-4 text-center text-xs text-[#737373] space-y-2">
        <div className="inline-flex items-center gap-1.5 font-semibold text-[#171717]">
          <Award className="w-4 h-4 text-[#14281D]" />
          <span>ISIVENTE — Boutique Officielle Bénin</span>
        </div>
        <p>Livraison express 24h Cotonou, Abomey-Calavi, Porto-Novo et expéditions partout au Bénin.</p>
      </footer>

      {/* 15. BARRE MOBILE STICKY CTA */}
      <StickyMobileCtaBar
        price={16900}
        targetSectionId="commander"
        accentColor="#7C2D12"
        buttonText="Commander"
        whatsappMessage="Bonjour Isivente ! Je suis intéressé(e) par le Coussin Masseur Shiatsu Chauffant à 16 900 FCFA."
      />

      {/* 16. POP-UP D'ABANDON INTELLIGENT (PILIER 7) */}
      <ExitIntentModal slug={slug} />
    </div>
  );
}
