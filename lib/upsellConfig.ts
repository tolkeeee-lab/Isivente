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
  savings?: number;
}

export interface ProductUpsellConfig {
  secondUnit?: OfferItem;
  bump?: OfferItem;
  upsell?: OfferItem;
  downsell?: OfferItem;
}

export const UPSELL_CONFIG: Record<string, ProductUpsellConfig> = {
  umei: {
    secondUnit: {
      id: "umei-second-unit",
      title: "Profitez d'une 2ème Brosse Uméi™ 3-en-1 pour un proche",
      subtitle: "Offrez le secret d'un démêlage doux sans douleur à votre fille, sœur ou maman",
      description: "Recevez un 2ème exemplaire complet dans son coffret neuf avec 5 000 FCFA de réduction immédiate.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/umei-hero-real.jpg",
      badge: "🎁 2ÈME EXEMPLAIRE (-34%)",
      benefits: [
        "Coffret complet avec réservoir & accessoires",
        "Livré ensemble dans le même paquet sans frais de port en plus",
        "Paiement groupé au livreur à la réception",
      ],
    },
    upsell: {
      id: "umei-duo-gift",
      title: "Ajoutez une 2ème Brosse Uméi™ 3-en-1 à prix réduit",
      subtitle: "Offrez le secret d'un démêlage sans douleur à votre soeur, maman ou amie",
      description: "Profitez de cette opportunité unique pour obtenir un 2ème exemplaire complet dans son coffret pour seulement 9 900 FCFA au lieu de 14 900 FCFA.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/umei-hero-real.jpg",
      badge: "ÉCONOMISEZ 5 000 FCFA",
      benefits: [
        "Coffret neuf complet pour offrir à un proche",
        "Livraison groupée dans le même colis",
        "Paiement à la réception",
      ],
    },
  },

  eraclean: {
    secondUnit: {
      id: "eraclean-second-unit",
      title: "Profitez d'un 2ème Purificateur EraClean™ 10 Ans",
      subtitle: "Protégez simultanément votre réfrigérateur ET votre voiture, WC ou chambre",
      description: "Placez un appareil dans le frigo et le second dans votre véhicule ou dressing pour détruire 99% des odeurs.",
      price: 12900,
      originalPrice: 19900,
      savings: 7000,
      image: "/images/eraclean-studio.jpg",
      badge: "🎁 2ÈME EXEMPLAIRE (-35%)",
      benefits: [
        "Durée de vie certifiée 10 ans sans filtre à changer",
        "Double protection pour votre foyer et vos trajets",
        "Livraison groupée sans frais de port supplémentaires",
      ],
    },
    upsell: {
      id: "eraclean-pack-duo",
      title: "Ajoutez un 2ème Purificateur EraClean™ 10 Ans",
      subtitle: "Protégez simultanément votre réfrigérateur ET votre voiture ou chambre",
      description: "Profitez de cette réduction immédiate de 7 000 FCFA pour équiper votre véhicule ou offrir un 2ème purificateur à un proche.",
      price: 12900,
      originalPrice: 19900,
      savings: 7000,
      image: "/images/eraclean-studio.jpg",
      badge: "ÉCONOMISEZ 7 000 FCFA",
      benefits: [
        "Deuxième appareil complet 10 ans de durée de vie",
        "Idéal pour voiture, frigo ou placards",
        "Paiement groupé à la livraison",
      ],
    },
  },

  turbofan: {
    secondUnit: {
      id: "turbofan-second-unit",
      title: "Profitez d'un 2ème TurboFan™ Max 8000mAh",
      subtitle: "Équipez votre conjoint(e), un proche ou gardez un appareil de secours",
      description: "Doublez votre autonomie de fraîcheur toute la journée avec 6 000 FCFA d'économie immédiate.",
      price: 10900,
      originalPrice: 16900,
      savings: 6000,
      image: "/images/turbofan-studio.jpg",
      badge: "🎁 2ÈME EXEMPLAIRE (-36%)",
      benefits: [
        "Double autonomie : 32 heures cumulées de ventilation",
        "2 batteries de secours 8000mAh pour recharger vos téléphones",
        "Colis unique livré à domicile",
      ],
    },
    upsell: {
      id: "turbofan-second",
      title: "Ajoutez un 2ème TurboFan™ Max 8000mAh",
      subtitle: "Ne soyez jamais à court de batterie ni de fraîcheur",
      description: "Obtenez un 2ème TurboFan complet pour un collègue, un proche ou pour vos déplacements moto à 10 900 FCFA au lieu de 16 900 FCFA.",
      price: 10900,
      originalPrice: 16900,
      savings: 6000,
      image: "/images/turbofan-studio.jpg",
      badge: "ÉCONOMISEZ 6 000 FCFA",
      benefits: [
        "2ème ventilateur de ceinture 8000mAh neuf",
        "Livraison groupée gratuite",
        "Paiement à la réception",
      ],
    },
  },

  peeler: {
    secondUnit: {
      id: "peeler-second-unit",
      title: "Profitez d'un 2ème Éplucheur ChefPeel™ Pro",
      subtitle: "Le cadeau idéal pour la cuisine de votre mère, tante ou une amie",
      description: "Épluchez fruits, légumes et gousses d'ail en 8 secondes dans deux foyers différents.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/peeler-hero.jpg",
      badge: "🎁 2ÈME EXEMPLAIRE (-34%)",
      benefits: [
        "Appareil neuf complet avec lame inox et câble",
        "Gain de temps précieux pour préparer les repas de famille",
        "Aucun frais de port en plus",
      ],
    },
    upsell: {
      id: "peeler-second",
      title: "Ajoutez un 2ème Éplucheur ChefPeel™ Pro",
      subtitle: "Idéal pour équiper la cuisine de votre mère ou une amie",
      description: "Obtenez un 2ème appareil flambant neuf à seulement 9 900 FCFA au lieu de 14 900 FCFA dans le même paquet.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/peeler-hero.jpg",
      badge: "ÉCONOMISEZ 5 000 FCFA",
      benefits: [
        "2ème éplucheur électrique neuf complet",
        "Cadeau parfait et très apprécié",
        "Paiement à la réception",
      ],
    },
  },

  stabilisateur: {
    secondUnit: {
      id: "stabilisateur-second-unit",
      title: "Profitez d'un 2ème Stabilisateur Pro-Mobile Z3 Zoom™",
      subtitle: "Équipez un proche créateur de contenu ou assurez un 2ème angle de caméra",
      description: "Recevez un 2ème pack Z3 complet (trépied + télécommande Bluetooth) avec 15 000 FCFA d'économie.",
      price: 34900,
      originalPrice: 49900,
      savings: 15000,
      image: "/images/stabilisateur-hero.jpg",
      badge: "🎁 2ÈME EXEMPLAIRE (-30%)",
      benefits: [
        "Kit complet avec trépied détachable & télécommande sans fil",
        "Idéal pour tournages vidéos pro, TikTok et live streaming",
        "Paiement unique à la livraison",
      ],
    },
    upsell: {
      id: "stabilisateur-second",
      title: "Ajoutez un 2ème Stabilisateur Pro-Mobile Z3 Zoom™",
      subtitle: "Équipez un proche créateur de contenu ou assurez un second angle vidéo",
      description: "Profitez de cette opportunité unique pour obtenir un 2ème pack complet Z3 Zoom pour seulement 34 900 FCFA au lieu de 49 900 FCFA.",
      price: 34900,
      originalPrice: 49900,
      savings: 15000,
      image: "/images/stabilisateur-hero.jpg",
      badge: "ÉCONOMISEZ 15 000 FCFA",
      benefits: [
        "2ème pack Pro-Mobile Z3 complet avec trépied & télécommande",
        "Livraison groupée sans frais supplémentaires",
        "Paiement à la réception",
      ],
    },
  },

  veilleuse: {
    secondUnit: {
      id: "veilleuse-second-unit",
      title: "Profitez d'une 2ème Veilleuse Projecteur LED 3D FRIOSZ",
      subtitle: "Équipez une seconde pièce (chambre des enfants, salon ou pour faire un cadeau)",
      description: "Recevez un second kit complet avec ses 24 disques HD à prix préférentiel dans le même colis.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/projecteur-hero.jpg",
      badge: "🎁 2ÈME EXEMPLAIRE (-34%)",
      benefits: [
        "Kit complet avec les 24 disques galaxie et nébuleuses",
        "Crée une atmosphère magique et apaisante pour le sommeil",
        "Livraison groupée sans frais en sus",
      ],
    },
    upsell: {
      id: "veilleuse-second",
      title: "Ajoutez une 2ème Veilleuse Projecteur LED 3D FRIOSZ",
      subtitle: "Équipez une seconde chambre ou offrez un cadeau magique à un proche",
      description: "Recevez un 2ème kit complet avec ses 24 disques HD pour seulement 9 900 FCFA au lieu de 14 900 FCFA.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/projecteur-hero.jpg",
      badge: "ÉCONOMISEZ 5 000 FCFA",
      benefits: [
        "2ème projecteur planétarium complet avec 24 disques",
        "Idéal pour chambre d'enfant ou cadeau",
        "Paiement à la réception",
      ],
    },
  },

  camera: {
    secondUnit: {
      id: "camera-second-unit",
      title: "Ajoutez une 2ème Mini Caméra HD pour surveiller un autre endroit",
      subtitle: "Protégez simultanément votre boutique ET votre domicile ou véhicule",
      description: "Recevez une 2ème caméra complète avec son support magnétique 360° pour seulement 10 900 FCFA au lieu de 16 900 FCFA.",
      price: 10900,
      originalPrice: 16900,
      savings: 6000,
      image: "/images/camera-hero.jpg",
      badge: "🎁 2ÈME PIÈCE (-35%)",
      benefits: [
        "Caméra HD 1080P supplémentaire avec vision nocturne",
        "Visualisable sur la même application smartphone en simultané",
        "Livraison groupée dans le même paquet sans frais en sus",
      ],
    },
    bump: {
      id: "camera-sd-card",
      title: "Carte Mémoire MicroSD 64GB Spéciale Vidéosurveillance HD",
      subtitle: "Enregistrement continu en boucle 24h/24 pendant 15 jours sans effacer",
      description: "Permet de conserver tous les enregistrements même en cas de coupure de courant.",
      price: 3900,
      originalPrice: 8000,
      savings: 4100,
      image: "/images/camera-hero.jpg",
      badge: "-51% ACCESSOIRE",
      benefits: [
        "Capacité 64GB classe 10 haute vitesse",
        "Enregistrement automatique en boucle",
        "Relecture facile des vidéos sur téléphone",
      ],
    },
    upsell: {
      id: "camera-second",
      title: "Deuxième Mini Caméra Espionne HD A9 Pro™",
      subtitle: "Protégez un second angle ou une deuxième pièce de votre maison",
      description: "Profitez de cette opportunité unique pour ajouter une 2ème caméra complète pour seulement 10 900 FCFA au lieu de 16 900 FCFA.",
      price: 10900,
      originalPrice: 16900,
      savings: 6000,
      image: "/images/camera-hero.jpg",
      badge: "ÉCONOMISEZ 6 000 FCFA",
      benefits: [
        "2ème caméra neuve avec support magnétique 360°",
        "Connectable sur la même application",
        "Paiement à la réception",
      ],
    },
  },

  trozk: {
    secondUnit: {
      id: "trozk-second-unit",
      title: "Profitez d'une 2ème Batterie Modulaire Trozk T3 pour un proche",
      subtitle: "Ne soyez plus jamais à court de batterie lors de vos déplacements ou coupures",
      description: "Recevez un 2ème exemplaire complet 15 000 mAh avec son étui rigide et tous ses modules pour 19 900 FCFA au lieu de 29 900 FCFA.",
      price: 19900,
      originalPrice: 29900,
      savings: 10000,
      image: "/images/trozk-hero.jpg",
      badge: "🎁 2ÈME EXEMPLAIRE (-33%)",
      benefits: [
        "Système modulaire 3-en-1 complet (15 000 mAh)",
        "Mini-batterie de poche 5 000 mAh détachable incluse",
        "Pochette rigide antichoc offerte pour chaque exemplaire",
        "Livraison groupée dans le même colis sans frais de port supplémentaires",
      ],
    },
    upsell: {
      id: "trozk-second",
      title: "Deuxième Batterie Modulaire 3-en-1 Trozk T3 (15 000 mAh)",
      subtitle: "Le cadeau high-tech parfait pour un membre de votre famille",
      description: "Profitez de cette opportunité unique pour ajouter une 2ème batterie complète avec tous ses accessoires pour 19 900 FCFA au lieu de 29 900 FCFA.",
      price: 19900,
      originalPrice: 29900,
      savings: 10000,
      image: "/images/trozk-hero.jpg",
      badge: "ÉCONOMISEZ 10 000 FCFA",
      benefits: [
        "Pack complet 15 000 mAh avec écran LED & mini bloc 5 000 mAh",
        "Sacoche de transport rigide offerte",
        "Paiement sécurisé à la réception",
      ],
    },
  },

  microscope: {
    secondUnit: {
      id: "microscope-second-unit",
      title: "Profitez d'un 2ème Microscope Numérique Portable 1000X",
      subtitle: "Offrez la magie de la découverte à un enfant ou à un proche curieux",
      description: "Recevez un 2ème microscope complet avec câble de charge et accessoires pour seulement 19 900 FCFA au lieu de 29 900 FCFA.",
      price: 19900,
      originalPrice: 29900,
      savings: 10000,
      image: "/images/microscope-hero.jpg",
      badge: "🎁 2ÈME EXEMPLAIRE (-33%)",
      benefits: [
        "Microscope complet neuf sous blister",
        "Livré ensemble dans le même colis sans frais de livraison en plus",
        "Paiement à la réception après vérification",
      ],
    },
    upsell: {
      id: "microscope-duo-gift",
      title: "Ajoutez un 2ème Microscope HD 1000X à prix réduit",
      subtitle: "Le cadeau éducatif et interactif par excellence",
      description: "Ajoutez un 2ème exemplaire pour votre famille ou vos proches pour seulement 19 900 FCFA.",
      price: 19900,
      originalPrice: 29900,
      savings: 10000,
      image: "/images/microscope-hero.jpg",
      badge: "ÉCONOMISEZ 10 000 FCFA",
      benefits: [
        "Écran 2.0\" couleur haute définition",
        "Batterie rechargeable nomade",
        "Paiement au livreur à l'arrivée",
      ],
    },
  },
};

/**
 * Récupère la config d'upsell pour un produit donné (uniquement offre 2ème pièce avec réduction)
 */
export function getProductUpsellConfig(slug: string, productTitle?: string, productPrice?: number): ProductUpsellConfig {
  const normalized = (slug || "").toLowerCase().trim();
  if (UPSELL_CONFIG[normalized]) {
    const config = UPSELL_CONFIG[normalized];
    return {
      secondUnit: config.secondUnit || config.upsell,
      upsell: config.upsell || config.secondUnit,
      downsell: undefined,
    };
  }

  // Fallback intelligent pour les nouveaux produits créés dans l'admin
  const price = productPrice || 14900;
  const title = productTitle || "Produit Sélectionné";
  const secondUnitPrice = Math.round((price * 0.65) / 100) * 100;

  const defaultSecondUnit: OfferItem = {
    id: `second-${normalized}`,
    title: `Ajouter un 2ème exemplaire de « ${title} » pour un proche`,
    subtitle: "Profitez d'un tarif préférentiel exclusif pour offrir un 2ème exemplaire complet",
    description: "Une offre exceptionnelle pour recevoir 2 unités dans votre colis sans payer de frais de livraison supplémentaires.",
    price: secondUnitPrice,
    originalPrice: price,
    savings: price - secondUnitPrice,
    image: "/images/default-hero.jpg",
    badge: "🎁 OFFRE 2ÈME PIÈCE",
    benefits: [
      "Produit neuf complet dans son emballage d'origine",
      "Économie immédiate sur le 2ème article",
      "Paiement groupé à la livraison",
    ],
  };

  return {
    secondUnit: defaultSecondUnit,
    upsell: defaultSecondUnit,
    downsell: undefined,
  };
}
