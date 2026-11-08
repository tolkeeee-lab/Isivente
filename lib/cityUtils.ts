/**
 * cityUtils.ts - Détection intelligente et normalisation des villes et quartiers du Bénin
 * 
 * Résout le problème critique d'e-commerce COD :
 * Beaucoup de clients laissent "Cotonou" par défaut dans le sélecteur, mais écrivent
 * leur vraie ville ou localité dans le champ quartier/adresse (ex: "Parakou", "Cococodji", "Hêvié", "Porto-Novo").
 * 
 * Ce module :
 * 1. Détecte automatiquement la vraie ville à partir du texte tapé par le client.
 * 2. Associe le bon département béninois pour Meta CAPI (Littoral, Atlantique, Ouémé, Borgou...).
 * 3. Précise le délai et le type de livraison (Express 24h moto vs Expédition bus 48h).
 */

export interface BeninCityInfo {
  name: string;
  department: string;
  isExpressLocal: boolean; // Livrable à moto le jour même (Cotonou / Calavi)
  requiresPrepayment: boolean; // Paiement obligatoire par Mobile Money avant expédition par bus (ex: Parakou, Natitingou...)
  deliveryDelay: string;
  shippingNote?: string;
  keywords: string[];
}

export const BENIN_CITIES_CATALOG: BeninCityInfo[] = [
  {
    name: "Cotonou",
    department: "Littoral",
    isExpressLocal: true,
    requiresPrepayment: false,
    deliveryDelay: "Moins de 24h",
    keywords: [
      "cotonou",
      "akpakpa",
      "cadjehoun",
      "cadjèhoun",
      "haie vive",
      "gbegamey",
      "gbégamey",
      "sainte rita",
      "sainte-rita",
      "fidjrosse",
      "fidjrossè",
      "menontin",
      "mènontin",
      "agontikon",
      "vedoko",
      "vèdoko",
      "zogbo",
      "kouhounou",
      "dantokpa",
      "jonquet",
      "placodji",
      "enagnon",
      "sikecodji",
      "sikècodji",
      "hinde",
      "hindé",
      "vossa",
      "maro-militaire",
      "maro militaire",
      "etoile rouge",
      "étoile rouge",
      "saint michel",
      "saint-michel",
    ],
  },
  {
    name: "Abomey-Calavi",
    department: "Atlantique",
    isExpressLocal: true,
    requiresPrepayment: false,
    deliveryDelay: "Moins de 24h",
    keywords: [
      "calavi",
      "abomey-calavi",
      "abomey calavi",
      "cococodji",
      "cococodjy",
      "hevie",
      "hêvié",
      "godomey",
      "tankpe",
      "tankpè",
      "arconville",
      "togoudo",
      "zoundja",
      "ouedo",
      "ouèdo",
      "akassato",
      "zinvie",
      "zinvié",
      "kpanroun",
      "glo-djigbe",
      "glo djigbé",
      "glo-djigbé",
      "maria gleta",
      "maria-gléta",
      "maria gléta",
      "cocotomey",
      "dekoungbe",
      "dèkoungbé",
      "womey",
      "kansounkpa",
      "akossavie",
      "akossavié",
      "kpota",
    ],
  },
  {
    name: "Porto-Novo",
    department: "Ouémé",
    isExpressLocal: true,
    requiresPrepayment: false,
    deliveryDelay: "24h à 48h",
    shippingNote: "Livraison express 24h-48h",
    keywords: [
      "porto-novo",
      "porto novo",
      "portonovo",
      "ouando",
      "djassin",
      "avakpa",
      "tokpota",
      "louho",
      "attake",
      "attakè",
      "dowa",
      "adjarray",
      "adjarra",
      "dangbo",
      "seme",
      "sèmè",
      "seme-kpodji",
      "sèmè-kpodji",
      "ekpe",
      "ekpè",
      "agblangandan",
    ],
  },
  {
    name: "Parakou",
    department: "Borgou",
    isExpressLocal: false,
    requiresPrepayment: true,
    deliveryDelay: "48h",
    shippingNote: "Expédition sous 48h par compagnie de transport. Règlement Mobile Money avant départ.",
    keywords: [
      "parakou",
      "titirou",
      "albarika",
      "tourou",
      "banikanni",
      "madina",
      "amanwambou",
      "kpebie",
      "kpébié",
      "zongo parakou",
    ],
  },
  {
    name: "Bohicon",
    department: "Zou",
    isExpressLocal: false,
    requiresPrepayment: true,
    deliveryDelay: "24h à 48h",
    shippingNote: "Expédition par compagnie de transport",
    keywords: [
      "bohicon",
      "abomey",
      "zakpota",
      "zogbodomey",
      "tindji",
      "cana",
    ],
  },
  {
    name: "Ouidah",
    department: "Atlantique",
    isExpressLocal: false,
    requiresPrepayment: false,
    deliveryDelay: "24h à 48h",
    shippingNote: "Livraison sous 24h-48h",
    keywords: [
      "ouidah",
      "pahou",
      "tori",
      "tori-bossito",
      "kpomasse",
    ],
  },
  {
    name: "Natitingou",
    department: "Atacora",
    isExpressLocal: false,
    requiresPrepayment: true,
    deliveryDelay: "48h à 72h",
    shippingNote: "Expédition grand Nord par compagnie de transport. Paiement avant expédition.",
    keywords: ["natitingou", "nati", "tanguieta", "toucountouna", "kouande"],
  },
  {
    name: "Djougou",
    department: "Donga",
    isExpressLocal: false,
    requiresPrepayment: true,
    deliveryDelay: "48h",
    shippingNote: "Expédition par compagnie de transport. Paiement avant expédition.",
    keywords: ["djougou", "bassila", "copargo", "ouake"],
  },
  {
    name: "Lokossa",
    department: "Mono",
    isExpressLocal: false,
    requiresPrepayment: true,
    deliveryDelay: "24h à 48h",
    shippingNote: "Expédition Mono-Couffo sous 48h. Paiement avant expédition.",
    keywords: ["lokossa", "come", "comè", "athieme", "athiémé", "bopa", "grand-popo", "grand popo"],
  },
];

/**
 * Normalise un texte (minuscules, sans accents, sans ponctuation inutile)
 */
function cleanText(text: string): string {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim();
}

/**
 * Détecte intelligemment la ville réelle et le département à partir
 * de la ville déclarée et surtout de l'adresse / quartier saisi par le client.
 */
export function detectBeninCity(
  declaredCity?: string | null,
  addressText?: string | null,
  customerName?: string | null
): {
  detectedCity: string;
  department: string;
  isExpressLocal: boolean;
  requiresPrepayment: boolean;
  deliveryDelay: string;
  wasOverridden: boolean;
  shippingNote?: string;
} {
  const normAddress = cleanText(addressText || "");
  const normDeclared = cleanText(declaredCity || "");
  const normName = cleanText(customerName || "");
  const combinedText = `${normAddress} ${normName}`;

  // 1. Analyse prioritaire de l'adresse texte (là où le client écrit sa vraie ville)
  for (const cityInfo of BENIN_CITIES_CATALOG) {
    for (const kw of cityInfo.keywords) {
      const cleanKw = cleanText(kw);
      // Correspondance en mot entier ou expression
      const regex = new RegExp(`(^|\\s)${cleanKw}(\\s|$)`, "i");
      if (regex.test(combinedText)) {
        const wasOverridden = Boolean(
          declaredCity &&
          declaredCity.toLowerCase() !== cityInfo.name.toLowerCase() &&
          declaredCity.toLowerCase() === "cotonou" &&
          cityInfo.name.toLowerCase() !== "cotonou"
        );

        return {
          detectedCity: cityInfo.name,
          department: cityInfo.department,
          isExpressLocal: cityInfo.isExpressLocal,
          requiresPrepayment: cityInfo.requiresPrepayment,
          deliveryDelay: cityInfo.deliveryDelay,
          wasOverridden,
          shippingNote: cityInfo.shippingNote,
        };
      }
    }
  }

  // 2. Si aucun mot-clé spécifique n'a été trouvé dans l'adresse, vérifier la ville déclarée
  if (normDeclared) {
    for (const cityInfo of BENIN_CITIES_CATALOG) {
      const cleanName = cleanText(cityInfo.name);
      if (normDeclared.includes(cleanName) || cleanName.includes(normDeclared)) {
        return {
          detectedCity: cityInfo.name,
          department: cityInfo.department,
          isExpressLocal: cityInfo.isExpressLocal,
          requiresPrepayment: cityInfo.requiresPrepayment,
          deliveryDelay: cityInfo.deliveryDelay,
          wasOverridden: false,
          shippingNote: cityInfo.shippingNote,
        };
      }
    }
  }

  // 3. Repli par défaut sur Cotonou / Littoral si rien n'est détecté
  return {
    detectedCity: declaredCity?.trim() || "Cotonou",
    department: "Littoral",
    isExpressLocal: true,
    requiresPrepayment: false,
    deliveryDelay: "Moins de 24h",
    wasOverridden: false,
  };
}

