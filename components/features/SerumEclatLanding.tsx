"use client";

import React from "react";
import UniversalLandingTemplate, { Benefit, FAQ, Step, TestimonialImage } from "@/components/templates/UniversalLandingTemplate";
import { BundleOption } from "@/components/features/UmeiStyleOrderSection";

const BUNDLES: BundleOption[] = [
  {
    id: "1x",
    name: "1x Sérum Éclat (Cure Initiale)",
    subtitle: "Idéal pour tester l'efficacité. Durée: ~1 mois.",
    price: 9900,
    originalPrice: 15000,
    savings: 5100,
    quantity: 1,
    popular: false,
  },
  {
    id: "2x",
    name: "2x Sérum Éclat (Cure Complète)",
    subtitle: "Résultats optimaux sur les taches tenaces.",
    price: 18000,
    originalPrice: 30000,
    savings: 12000,
    quantity: 2,
    popular: true,
  },
  {
    id: "3x",
    name: "3x Sérum Éclat (Pack Anti-Taches Pro)",
    subtitle: "Teint parfait & durable. La meilleure offre.",
    price: 25000,
    originalPrice: 45000,
    savings: 20000,
    quantity: 3,
    popular: false,
  },
];

const TESTIMONIALS: TestimonialImage[] = [
  { name: "Aïcha M.", image: "/images/serum-eclat/avis-1.png" },
  { name: "Sarah T.", image: "/images/serum-eclat/avis-2.png" },
  { name: "Paméla D.", image: "/images/serum-eclat/avis-3.png" }
];

const FAQS: FAQ[] = [
  {
    q: "Comment utiliser ce Sérum Éclat ?",
    a: "Appliquez 3 à 5 gouttes sur le visage et le cou préalablement nettoyés, matin et soir. Massez doucement jusqu'à absorption complète avant d'appliquer votre crème hydratante."
  },
  {
    q: "Est-ce adapté aux peaux sensibles ?",
    a: "Oui, sa formule inspirée de la K-Beauty est enrichie en extraits apaisants de Curcuma. Cependant, comme il contient de l'acide kojique, nous recommandons un test cutané préalable."
  },
  {
    q: "Quand verrai-je les premiers résultats ?",
    a: "L'effet 'Glow' est immédiat. Pour l'atténuation des taches brunes et l'hyperpigmentation, les premiers résultats durables sont visibles après 2 à 3 semaines d'utilisation quotidienne."
  },
  {
    q: "Dois-je utiliser une protection solaire ?",
    a: "Oui ! L'acide kojique aide à unifier le teint, mais il rend la peau légèrement plus sensible au soleil. Une protection solaire en journée est fortement recommandée pour maintenir vos résultats."
  }
];

const BENEFITS: Benefit[] = [
  {
    iconName: "Sun",
    iconColorClass: "text-orange-500",
    title: "Teint Lumineux & Unifié",
    description: (
      <>
        L'association du <strong className="text-orange-700">Curcuma</strong> et de <strong className="text-orange-700">l'Acide Kojique</strong> cible et estompe les taches brunes, l'hyperpigmentation et les cicatrices d'acné.
      </>
    )
  },
  {
    iconName: "Droplets",
    iconColorClass: "text-blue-500",
    title: "Hydratation Profonde",
    description: "Pénètre en profondeur pour repulper la peau, lisser les ridules et restaurer une barrière cutanée saine pour un 'Glow' immédiat."
  },
  {
    iconName: "Leaf",
    iconColorClass: "text-green-500",
    title: "Inspiré de la K-Beauty",
    description: "Formulation douce aux extraits naturels purs. Convient à tous les types de peau, même les plus sensibles, sans irritation."
  }
];

const HOW_IT_WORKS: Step[] = [
  { number: 1, text: "Nettoyez votre visage et séchez-le délicatement." },
  { number: 2, text: "Appliquez 3 à 5 gouttes de sérum au creux de votre main." },
  { number: 3, text: "Massez doucement sur votre visage jusqu'à absorption complète." }
];

const HERO_IMAGES = [
  "/images/serum-eclat/serum-main.png",
  "/images/serum-eclat/serum-luxe-dore.png",
  "/images/serum-eclat/serum-kbeauty.png",
  "/images/serum-eclat/serum-rituel.png"
];

export default function SerumEclatLanding() {
  return (
    <UniversalLandingTemplate
      productSlug="serum-eclat"
      productTitle="Sérum Éclat au Curcuma & Acide Kojique"
      pageSubTitle="L'élixir anti-taches pour un teint radieux, lumineux et uniforme en 3 semaines."
      categoryTag="Soin Skincare K-Beauty"
      primaryColorHex="#ea580c"
      colorTheme="orange"
      heroImages={HERO_IMAGES}
      bundles={BUNDLES}
      benefits={BENEFITS}
      howItWorksSteps={HOW_IT_WORKS}
      testimonials={TESTIMONIALS}
      faqs={FAQS}
      whatsappMessage="Bonjour Isivente, je souhaite commander le Sérum Éclat au Curcuma & Acide Kojique."
    />
  );
}
