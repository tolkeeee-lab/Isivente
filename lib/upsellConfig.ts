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
      title: "Ajouter une 2ème Brosse Uméi™ 3-en-1 pour un proche",
      subtitle: "Offrez le secret d'un démêlage doux sans douleur à votre fille, sœur ou maman",
      description: "Recevez un 2ème exemplaire complet dans son coffret neuf avec 5 000 FCFA de réduction immédiate.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/umei-hero-real.jpg",
      badge: "🎁 OFFRE 2ÈME PIÈCE (-34%)",
      benefits: [
        "Coffret complet avec réservoir & accessoires",
        "Livré ensemble dans le même paquet",
        "Paiement groupé au livreur",
      ],
    },
    bump: {
      id: "serum-umei",
      title: "Huile de Soin & Sérum Végétal Thermo-Protecteur (60ml)",
      subtitle: "Nourrit intensément les pointes et décuple la brillance à la vapeur",
      description: "Appliquez 2 gouttes avant le lissage pour des cheveux soyeux et protégés de la chaleur toute la journée.",
      price: 3900,
      originalPrice: 7000,
      savings: 3100,
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
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/umei-hero-real.jpg",
      badge: "ÉCONOMISEZ 5 000 FCFA",
    },
    downsell: {
      id: "umei-kit-soin",
      title: "Coffret Prestige : Sérum Argan Pur + 2 Flacons Recharges",
      subtitle: "Le kit indispensable pour entretenir votre brosse et vos pointes pendant 6 mois",
      description: "Pour seulement 4 900 FCFA, recevez le sérum grand format et les buses de rechange anti-calcaire.",
      price: 4900,
      originalPrice: 9000,
      savings: 4100,
      image: "/images/umei-hero-real.jpg",
      badge: "OFFRE DE RATTRAPAGE EXCLUSIVE",
    },
  },

  eraclean: {
    secondUnit: {
      id: "eraclean-second-unit",
      title: "Ajouter un 2ème Purificateur EraClean™ 10 Ans",
      subtitle: "Protégez simultanément votre réfrigérateur ET votre voiture, WC ou chambre",
      description: "Placez un appareil dans le frigo et le second dans votre véhicule ou dressing pour détruire 99% des odeurs.",
      price: 12900,
      originalPrice: 19900,
      savings: 7000,
      image: "/images/eraclean-studio.jpg",
      badge: "🎁 OFFRE 2ÈME PIÈCE (-35%)",
      benefits: [
        "Durée de vie certifiée 10 ans sans filtre à changer",
        "Double protection pour votre foyer et vos trajets",
        "Livraison groupée sans frais de port supplémentaires",
      ],
    },
    bump: {
      id: "eraclean-cordon",
      title: "Support Magnétique Renforcé + Câble Tressé USB-C 2M",
      subtitle: "Fixez votre EraClean n'importe où dans votre véhicule ou placard",
      description: "Permet une recharge ultra-rapide et une fixation solide même sur routes cabossées.",
      price: 2900,
      originalPrice: 5500,
      savings: 2600,
      image: "/images/eraclean-studio.jpg",
      badge: "-47% ACCESSOIRE",
    },
    upsell: {
      id: "eraclean-pack-duo",
      title: "Second Purificateur EraClean™ 10 Ans",
      subtitle: "Protégez simultanément votre réfrigérateur ET votre voiture ou chambre",
      description: "90% des clients placent un appareil dans le frigo et un second dans leur véhicule pour éliminer radicalement les odeurs de transpiration et d'humidité.",
      price: 12900,
      originalPrice: 19900,
      savings: 7000,
      image: "/images/eraclean-studio.jpg",
      badge: "-35% SPÉCIAL NOUVEAU CLIENT",
    },
    downsell: {
      id: "eraclean-diffuseur",
      title: "Diffuseur d'Huiles Essentielles Aromatiques Solaires",
      subtitle: "Diffuse une douce fraîcheur naturelle dans votre habitacle dès les premiers rayons du soleil",
      price: 4500,
      originalPrice: 8500,
      savings: 4000,
      image: "/images/eraclean-studio.jpg",
      badge: "DERNIÈRE CHANCE",
    },
  },

  turbofan: {
    secondUnit: {
      id: "turbofan-second-unit",
      title: "Ajouter un 2ème TurboFan™ Max 8000mAh",
      subtitle: "Équipez votre conjoint(e), un collègue de travail ou gardez une batterie de secours",
      description: "Doublez votre autonomie de fraîcheur toute la journée avec 6 000 FCFA d'économie immédiate.",
      price: 10900,
      originalPrice: 16900,
      savings: 6000,
      image: "/images/turbofan-studio.jpg",
      badge: "🎁 OFFRE 2ÈME PIÈCE (-36%)",
      benefits: [
        "Double autonomie : 32 heures cumulées de ventilation",
        "2 batteries de secours 8000mAh pour recharger vos téléphones",
        "Colis unique livré à domicile",
      ],
    },
    bump: {
      id: "turbofan-cable",
      title: "Ceinture Tactique Molle Pro & Cordon Renforcé",
      subtitle: "Attache rapide anti-chute pour moto, chantier ou déplacements quotidiens",
      description: "Évite tout risque de décrochage lors de vos trajets à moto.",
      price: 2500,
      originalPrice: 5000,
      savings: 2500,
      image: "/images/turbofan-studio.jpg",
      badge: "-50% SPÉCIAL",
    },
    upsell: {
      id: "turbofan-second",
      title: "Deuxième TurboFan™ Max 8000mAh",
      subtitle: "Ne soyez jamais à court de batterie ni de fraîcheur",
      description: "Gardez-en un toujours en charge à la maison pendant que vous utilisez l'autre toute la journée.",
      price: 10900,
      originalPrice: 16900,
      savings: 6000,
      image: "/images/turbofan-studio.jpg",
      badge: "ÉCONOMISEZ 6 000 FCFA",
    },
    downsell: {
      id: "turbofan-kit",
      title: "Chargeur Rapide Double Port USB 20W + Pochette Étanche",
      subtitle: "Rechargez votre TurboFan et votre smartphone 2x plus vite",
      price: 4900,
      originalPrice: 9000,
      savings: 4100,
      image: "/images/turbofan-studio.jpg",
      badge: "RATTRAPAGE EXCLUSIF",
    },
  },

  peeler: {
    secondUnit: {
      id: "peeler-second-unit",
      title: "Ajouter un 2ème Éplucheur ChefPeel™ Pro",
      subtitle: "Le cadeau idéal pour la cuisine de votre mère, tante ou une amie",
      description: "Épluchez fruits, légumes et gousses d'ail en 8 secondes dans deux foyers différents.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/peeler-hero.jpg",
      badge: "🎁 OFFRE 2ÈME PIÈCE (-34%)",
      benefits: [
        "Appareil neuf complet avec lame inox et câble",
        "Gain de temps précieux pour préparer les repas de famille",
        "Aucun frais de port en plus",
      ],
    },
    bump: {
      id: "peeler-blades",
      title: "Set de 3 Lames Chirurgicales de Rechange en Inox",
      subtitle: "Gardez votre éplucheur tranchant comme un rasoir pour les 5 prochaines années",
      description: "Remplacement en 5 secondes, compatible pommes, ail, pommes de terre et agrumes.",
      price: 2900,
      originalPrice: 6000,
      savings: 3100,
      image: "/images/peeler-hero.jpg",
      badge: "-52% ACCESSOIRE",
    },
    upsell: {
      id: "peeler-second",
      title: "Deuxième Éplucheur ChefPeel™ Pro",
      subtitle: "Idéal pour équiper la cuisine de votre mère ou un collègue passionné de cuisine",
      description: "Obtenez un second appareil flambant neuf à prix préférentiel sur cette même commande.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/peeler-hero.jpg",
      badge: "-34% CADEAU",
    },
    downsell: {
      id: "peeler-cutter",
      title: "Mini Hachoir Manuel Turbo 5 Lames (Cuisine Rapide)",
      subtitle: "Hache oignons, piments, ail et persil en 3 tractions sans pleurer",
      price: 4500,
      originalPrice: 8000,
      savings: 3500,
      image: "/images/peeler-hero.jpg",
      badge: "-44% OFFRE SPÉCIALE",
    },
  },

  stabilisateur: {
    secondUnit: {
      id: "stabilisateur-second-unit",
      title: "Ajouter un 2ème Stabilisateur Pro-Mobile Z3 Zoom™",
      subtitle: "Équipez un proche créateur de contenu ou assurez un 2ème angle de caméra",
      description: "Recevez un 2ème pack Z3 complet (trépied + télécommande Bluetooth) avec 15 000 FCFA d'économie.",
      price: 34900,
      originalPrice: 49900,
      savings: 15000,
      image: "/images/stabilisateur-hero.jpg",
      badge: "🎁 OFFRE 2ÈME PIÈCE (-30%)",
      benefits: [
        "Kit complet avec trépied détachable & télécommande sans fil",
        "Idéal pour tournages vidéos pro, TikTok et live streaming",
        "Paiement unique à la livraison",
      ],
    },
    bump: {
      id: "stabilisateur-coldshoe",
      title: "Support Cold-Shoe Studio + 2 Anneaux MagSafe Universels",
      subtitle: "Permet de fixer un micro ou une torche LED et d'utiliser tout smartphone",
      description: "Adaptation immédiate sur Android & iPhone avec force magnétique renforcée.",
      price: 3900,
      originalPrice: 8000,
      savings: 4100,
      image: "/images/stabilisateur-magsafe.jpg",
      badge: "-51% ACCESSOIRE",
    },
    upsell: {
      id: "stabilisateur-second",
      title: "Deuxième Stabilisateur Pro-Mobile Z3 Zoom™",
      subtitle: "Équipez un proche créateur de contenu ou assurez un second angle de caméra",
      description: "Profitez d'un tarif exclusif pour ajouter un 2ème exemplaire complet dans votre colis.",
      price: 34900,
      originalPrice: 49900,
      savings: 15000,
      image: "/images/stabilisateur-hero.jpg",
      badge: "ÉCONOMISEZ 15 000 FCFA",
    },
    downsell: {
      id: "stabilisateur-micro",
      title: "Micro Cravate Sans Fil Plug & Play (Type-C / Lightning)",
      subtitle: "Un son clair et net sans bruit de vent pour vos vidéos TikTok & Facebook",
      price: 8900,
      originalPrice: 16000,
      savings: 7100,
      image: "/images/stabilisateur-vlog.jpg",
      badge: "-45% OFFRE SPÉCIALE",
    },
  },

  veilleuse: {
    secondUnit: {
      id: "veilleuse-second-unit",
      title: "Ajouter une 2ème Veilleuse Projecteur LED 3D FRIOSZ",
      subtitle: "Équipez une seconde pièce (chambre des enfants, salon ou pour faire un cadeau)",
      description: "Recevez un second kit complet avec ses 24 disques HD à prix préférentiel dans le même colis.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/projecteur-hero.jpg",
      badge: "🎁 OFFRE 2ÈME PIÈCE (-34%)",
      benefits: [
        "Kit complet avec les 24 disques galaxie et nébuleuses",
        "Crée une atmosphère magique et apaisante pour le sommeil",
        "Livraison groupée sans frais en sus",
      ],
    },
    bump: {
      id: "veilleuse-adaptateur",
      title: "Adaptateur Secteur Silencieux 5V/2A + Cordon Rallonge USB 2M",
      subtitle: "Branchez et positionnez votre projecteur n'importe où dans la pièce",
      description: "Assure une intensité lumineuse constante et une sécurité électrique totale.",
      price: 2500,
      originalPrice: 5000,
      savings: 2500,
      image: "/images/projecteur-hero.jpg",
      badge: "-50% ACCESSOIRE",
    },
    upsell: {
      id: "veilleuse-second",
      title: "Deuxième Veilleuse Projecteur LED 3D FRIOSZ",
      subtitle: "Équipez une seconde chambre (chambre des parents ou chambre d'enfant)",
      description: "Recevez un 2ème kit complet avec ses 24 disques HD à moitié prix dans votre colis.",
      price: 9900,
      originalPrice: 14900,
      savings: 5000,
      image: "/images/projecteur-hero.jpg",
      badge: "ÉCONOMISEZ 5 000 FCFA",
    },
    downsell: {
      id: "veilleuse-pack-disques",
      title: "Coffret Prestige 12 Nouveaux Disques HD Thématiques Exclusifs",
      subtitle: "Aurores Boréales, Nébuleuse d'Orion et Faune Tropicale Lumineuse",
      price: 3900,
      originalPrice: 8000,
      savings: 4100,
      image: "/images/projecteur-galaxie.jpg",
      badge: "-51% RATTRAPAGE EXCLUSIF",
    },
  },
};

/**
 * Récupère la config d'upsell pour un produit donné, avec un fallback intelligent pour les produits créés dynamiquement
 */
export function getProductUpsellConfig(slug: string, productTitle?: string, productPrice?: number): ProductUpsellConfig {
  const normalized = (slug || "").toLowerCase().trim();
  if (UPSELL_CONFIG[normalized]) {
    const config = UPSELL_CONFIG[normalized];
    return {
      ...config,
      secondUnit: config.secondUnit || config.upsell,
    };
  }

  // Fallback intelligent pour les nouveaux produits créés dans l'admin
  const price = productPrice || 14900;
  const title = productTitle || "Produit Sélectionné";
  const secondUnitPrice = Math.round((price * 0.65) / 100) * 100;
  const bumpPrice = Math.round((price * 0.25) / 100) * 100;
  const downsellPrice = Math.round((price * 0.35) / 100) * 100;

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
    bump: {
      id: `bump-${normalized}`,
      title: "Préparation Logistique Prioritaire + Emballage Renforcé",
      subtitle: "Votre colis préparé, inspecté et remis en priorité au coursier",
      description: "Protection renforcée et prise en charge express pour une livraison ultra-rapide.",
      price: bumpPrice > 1500 ? bumpPrice : 1900,
      originalPrice: (bumpPrice > 1500 ? bumpPrice : 1900) * 2,
      savings: bumpPrice > 1500 ? bumpPrice : 1900,
      image: "/images/default-hero.jpg",
      badge: "EXPÉDITION EXPRESS",
    },
    upsell: defaultSecondUnit,
    downsell: {
      id: `downsell-${normalized}`,
      title: "Pack Accessoires Essentiels & Entretien Longue Durée",
      subtitle: "Optimisez la longévité de votre appareil à un prix imbattable",
      description: "Recevez les accessoires indispensables pour une utilisation optimale au quotidien.",
      price: downsellPrice > 2500 ? downsellPrice : 2900,
      originalPrice: (downsellPrice > 2500 ? downsellPrice : 2900) * 2,
      savings: downsellPrice > 2500 ? downsellPrice : 2900,
      image: "/images/default-hero.jpg",
      badge: "DERNIÈRE CHANCE",
    },
  };
}
