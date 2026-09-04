export interface OfferItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
  benefits?: string[];
}

export interface ProductUpsellConfig {
  bump?: OfferItem;
  upsell?: OfferItem;
  downsell?: OfferItem;
}

export const UPSELL_CONFIG: Record<string, ProductUpsellConfig> = {
  umei: {
    bump: {
      id: "serum-umei",
      title: "Huile de Soin & Sérum Végétal Thermo-Protecteur (60ml)",
      subtitle: "Nourrit intensément les pointes et décuple la brillance à la vapeur",
      description: "Appliquez 2 gouttes avant le lissage pour des cheveux doux, protégés de la chaleur et ultra-soyeux toute la journée.",
      price: 3900,
      originalPrice: 7000,
      image: "/images/umei-hero-real.jpg",
      badge: "-45% OFFRE SPÉCIALE",
      benefits: [
        "Protection thermique jusqu'à 230°C",
        "Formule 100% naturelle sans silicones lourds",
        "Compatible avec le réservoir de la brosse",
      ],
    },
    upsell: {
      id: "umei-duo-gift",
      title: "Deuxième Brosse Uméi™ 3-en-1 (Pour offrir)",
      subtitle: "Offrez le secret d'un démêlage sans douleur à votre soeur, maman ou amie",
      description: "Profitez de cette opportunité unique pour obtenir un 2ème exemplaire complet dans son coffret avec 50% de réduction immédiate.",
      price: 7450,
      originalPrice: 14900,
      image: "/images/umei-hero-real.jpg",
      badge: "ÉCONOMISEZ 7 450 FCFA (-50%)",
      benefits: [
        "Coffret complet avec accessoires inclus",
        "Garantie remplacement 1 an offerte sur les 2 brosses",
        "Livré ensemble dans le même paquet sans frais de port en plus",
      ],
    },
    downsell: {
      id: "umei-kit-soin",
      title: "Coffret Prestige : Sérum Argan Pur + 2 Flacons Recharges",
      subtitle: "Le kit indispensable pour entretenir votre brosse et vos pointes pendant 6 mois",
      description: "Pour seulement 4 900 FCFA, recevez le sérum grand format et les buses de rechange anti-calcaire.",
      price: 4900,
      originalPrice: 9000,
      image: "/images/umei-hero-real.jpg",
      badge: "OFFRE DE RATTRAPAGE EXCLUSIVE",
      benefits: [
        "Assure une vapeur pure sans traces blanches",
        "Flacon compte-gouttes haute précision",
        "Résultats salon garantis à domicile",
      ],
    },
  },

  eraclean: {
    bump: {
      id: "eraclean-cordon",
      title: "Support Magnétique Renforcé + Câble Tressé USB-C 2M",
      subtitle: "Fixez votre EraClean n'importe où dans votre véhicule ou placard",
      description: "Permet une recharge ultra-rapide et une fixation solide même sur routes cabossées.",
      price: 2900,
      originalPrice: 5500,
      image: "/images/eraclean-studio.jpg",
      badge: "-47% ORDER BUMP",
    },
    upsell: {
      id: "eraclean-pack-duo",
      title: "Second Purificateur EraClean™ 10 Ans",
      subtitle: "Protégez simultanément votre réfrigérateur ET votre voiture ou chambre",
      description: "90% des clients placent un appareil dans le frigo et un second dans leur véhicule pour éliminer radicalement les odeurs de transpiration et d'humidité.",
      price: 9900,
      originalPrice: 19900,
      image: "/images/eraclean-studio.jpg",
      badge: "-50% SPÉCIAL NOUVEAU CLIENT",
      benefits: [
        "Durée de vie certifiée 10 ans sans filtre à racheter",
        "Double protection pour votre foyer et vos trajets",
        "Aucun frais de port supplémentaire",
      ],
    },
    downsell: {
      id: "eraclean-diffuseur",
      title: "Diffuseur d'Huiles Essentielles Aromatiques Solaires",
      subtitle: "Diffuse une douce fraîcheur naturelle dans votre habitacle dès les premiers rayons du soleil",
      price: 4500,
      originalPrice: 8500,
      image: "/images/eraclean-studio.jpg",
      badge: "DERNIÈRE CHANCE",
      benefits: [
        "Rotation solaire 100% autonome",
        "Parfum longue durée doux et apaisant",
      ],
    },
  },

  turbofan: {
    bump: {
      id: "turbofan-cable",
      title: "Ceinture Tactique Molle Pro & Cordon Ultra-Résistant",
      subtitle: "Attache rapide anti-chute pour moto, chantier ou randonnée",
      description: "Évite tout risque de décrochage lors de vos trajets quotidiens.",
      price: 2500,
      originalPrice: 5000,
      image: "/images/turbofan-studio.jpg",
      badge: "-50% SPÉCIAL",
    },
    upsell: {
      id: "turbofan-second",
      title: "Deuxième TurboFan™ Max 8000mAh",
      subtitle: "Ne soyez jamais à court de batterie ni de fraîcheur",
      description: "Gardez-en un toujours en charge à la maison pendant que vous utilisez l'autre toute la journée, ou offrez-le à un collègue.",
      price: 8450,
      originalPrice: 16900,
      image: "/images/turbofan-studio.jpg",
      badge: "-50% OFFRE FLASH",
      benefits: [
        "Double autonomie : 32 heures cumulées de fraîcheur",
        "2 batteries de secours 8000mAh pour vos téléphones",
      ],
    },
    downsell: {
      id: "turbofan-kit",
      title: "Chargeur Rapide Double Port USB 20W + Pochette Étanche",
      subtitle: "Rechargez votre TurboFan et votre smartphone 2x plus vite",
      price: 4900,
      originalPrice: 9000,
      image: "/images/turbofan-studio.jpg",
      badge: "RATTRAPAGE EXCLUSIF",
    },
  },

  peeler: {
    bump: {
      id: "peeler-blades",
      title: "Set de 3 Lames Chirurgicales de Rechange en Inox",
      subtitle: "Gardez votre éplucheur tranchant comme un rasoir pour les 5 prochaines années",
      description: "Remplacement en 5 secondes, compatible pommes, ail, pommes de terre et agrumes.",
      price: 2900,
      originalPrice: 6000,
      image: "/images/peeler-hero.jpg",
      badge: "-52% ORDER BUMP",
    },
    upsell: {
      id: "peeler-second",
      title: "Deuxième Éplucheur ChefPeel™ Pro",
      subtitle: "Idéal pour équiper la cuisine de votre mère ou un collègue passionné de cuisine",
      description: "Obtenez un second appareil flambant neuf à moitié prix sur cette même commande.",
      price: 7450,
      originalPrice: 14900,
      image: "/images/peeler-hero.jpg",
      badge: "-50% CADEAU",
    },
    downsell: {
      id: "peeler-cutter",
      title: "Mini Hachoir Manuel Turbo 5 Lames (Cuisine Rapide)",
      subtitle: "Hache oignons, piments, ail et persil en 3 tractions sans pleurer",
      price: 4500,
      originalPrice: 8000,
      image: "/images/peeler-hero.jpg",
      badge: "-44% OFFRE SPÉCIALE",
    },
  },
};

/**
 * Récupère la config d'upsell pour un produit donné, avec un fallback intelligent pour les produits créés dynamiquement
 */
export function getProductUpsellConfig(slug: string, productTitle?: string, productPrice?: number): ProductUpsellConfig {
  const normalized = (slug || "").toLowerCase().trim();
  if (UPSELL_CONFIG[normalized]) {
    return UPSELL_CONFIG[normalized];
  }

  // Fallback intelligent pour les nouveaux produits créés dans l'admin
  const price = productPrice || 14900;
  const title = productTitle || "Produit Sélectionné";
  const halfPrice = Math.round((price * 0.5) / 100) * 100;
  const bumpPrice = Math.round((price * 0.25) / 100) * 100;
  const downsellPrice = Math.round((price * 0.35) / 100) * 100;

  return {
    bump: {
      id: `bump-${normalized}`,
      title: "Garantie Remplacement VIP 1 An + Support Prioritaire",
      subtitle: "En cas de panne ou de casse accidentelle, remplacement neuf immédiat à domicile",
      description: "Aucun frais de réparation, échange direct par notre coursier en moins de 24h.",
      price: bumpPrice > 1500 ? bumpPrice : 1900,
      originalPrice: (bumpPrice > 1500 ? bumpPrice : 1900) * 2,
      image: "/images/default-hero.jpg",
      badge: "SÉRÉNITÉ TOTALE",
    },
    upsell: {
      id: `upsell-${normalized}`,
      title: `Deuxième exemplaire de « ${title} »`,
      subtitle: "Profitez d'un tarif exclusif réservé aux nouveaux acheteurs sur votre commande",
      description: "Une offre exceptionnelle valable uniquement maintenant pour recevoir 2 unités dans votre colis.",
      price: halfPrice,
      originalPrice: price,
      image: "/images/default-hero.jpg",
      badge: "-50% OFFRE UNIQUE",
      benefits: [
        "50% de réduction immédiate",
        "Aucun frais de livraison additionnel",
        "Paiement groupé à la livraison",
      ],
    },
    downsell: {
      id: `downsell-${normalized}`,
      title: "Pack Accessoires Essentiels & Entretien Longue Durée",
      subtitle: "Optimisez la longévité de votre appareil à un prix imbattable",
      description: "Recevez les accessoires indispensables pour une utilisation optimale au quotidien.",
      price: downsellPrice > 2500 ? downsellPrice : 2900,
      originalPrice: (downsellPrice > 2500 ? downsellPrice : 2900) * 2,
      image: "/images/default-hero.jpg",
      badge: "DERNIÈRE CHANCE",
    },
  };
}
