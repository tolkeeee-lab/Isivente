import { DEFAULT_CATALOG_MAP, CatalogProduct } from "./defaultCatalog";

export interface AgentMessage {
  id: string;
  sender: "agent" | "user" | "system";
  text: string;
  timestamp: string;
  action?: {
    type: "scroll_to_order" | "whatsapp" | "prefill_order";
    label: string;
    payload?: any;
  };
}

export interface AgentContext {
  productSlug: string;
  product?: CatalogProduct;
  customerName?: string;
  customerPhone?: string;
  city?: string;
}

const COMMON_OBJECTIONS_BENIN = [
  {
    keywords: ["payer", "paiement", "especes", "cash", "argent", "avance", "payer avant"],
    response: (prod?: CatalogProduct) => 
      `Chez Isivente, vous ne payez **aucun franc d'avance** ! Vous payez en espèces (Cash) directement au livreur, uniquement **après avoir reçu et vérifié votre colis**.`
  },
  {
    keywords: ["livraison", "delai", "temps", "quand", "recu", "expedition", "cotonou", "calavi", "porto-novo", "parakou"],
    response: (prod?: CatalogProduct) =>
      `La livraison est ultra-rapide sous **24h chrono** à Cotonou, Calavi et environs. Nous livrons également dans tous les départements du Bénin. Le livreur vous contacte par téléphone avant de passer chez vous.`
  },
  {
    keywords: ["tester", "verifier", "ouvrir", "essayer", "verif", "test", "colis"],
    response: (prod?: CatalogProduct) =>
      `Oui, tout à fait ! C'est la règle d'or chez Isivente : vous pouvez **ouvrir le carton et tester l'appareil** en présence du livreur avant de régler votre achat.`
  },
  {
    keywords: ["garantie", "panne", "probleme", "rembourse", "echange", "reclamation"],
    response: (prod?: CatalogProduct) =>
      `Tous nos produits bénéficient de la **garantie officielle Isivente**. En cas de moindre anomalie technique, nous procédons à un échange immédiat sans frais ou à un remboursement.`
  },
  {
    keywords: ["prix", "combien", "coute", "tarif", "montant"],
    response: (prod?: CatalogProduct) => {
      const priceStr = prod ? `${new Intl.NumberFormat("fr-FR").format(prod.price)} FCFA` : "le prix promotionnel affiché";
      return `Le prix promotionnel actuel est de **${priceStr}** avec les accessoires inclus et la livraison express au Bénin.`;
    }
  },
  {
    keywords: ["commander", "acheter", "je veux", "reserver", "prendre", "livrez-moi"],
    response: (prod?: CatalogProduct) =>
      `Excellente décision ! Pour que notre équipe prépare votre expédition dès aujourd'hui, vous pouvez remplir le petit formulaire juste au-dessus, ou m'indiquer directement votre **Nom, Numéro de téléphone et Ville** ici.`
  },
];

/**
 * Moteur conversationnel local expert Isivente
 */
export function getLocalAgentResponse(userText: string, slug: string): AgentMessage {
  const norm = userText.toLowerCase().trim();
  const prod = DEFAULT_CATALOG_MAP[slug.toLowerCase()];

  // Détection de numéro de téléphone (au moins 8 chiffres)
  const phoneMatch = norm.replace(/\s+/g, "").match(/(\+?229)?[0-9]{8,10}/);
  if (phoneMatch) {
    return {
      id: Math.random().toString(36).substring(7),
      sender: "agent",
      text: `Parfait, j'ai bien noté votre numéro **${phoneMatch[0]}** ! Notre service de livraison vous appellera pour confirmer l'heure de passage chez vous. Cliquez ci-dessous pour finaliser votre adresse :`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      action: {
        type: "scroll_to_order",
        label: "Valider ma commande maintenant",
      }
    };
  }

  // Recherche dans les objections fréquentes
  for (const obj of COMMON_OBJECTIONS_BENIN) {
    const hasKeyword = obj.keywords.some((kw) => norm.includes(kw));
    if (hasKeyword) {
      return {
        id: Math.random().toString(36).substring(7),
        sender: "agent",
        text: obj.response(prod),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }
  }

  // Réponse par défaut chaleureuse orientée vente
  const title = prod?.shortTitle || prod?.title || "ce produit";
  return {
    id: Math.random().toString(36).substring(7),
    sender: "agent",
    text: `Bonjour ! Je suis à votre disposition pour vous conseiller sur **${title}**. 
Nos livraisons sont assurées sous **24h au Bénin** avec **paiement en espèces après vérification**. 
Avez-vous une question sur son fonctionnement ou souhaitez-vous être livré aujourd'hui ?`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    action: {
      type: "scroll_to_order",
      label: "Passer commande en 30 secondes",
    }
  };
}
