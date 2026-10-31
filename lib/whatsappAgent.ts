import { DEFAULT_CATALOG_MAP, CatalogProduct } from "@/lib/defaultCatalog";

export interface WhatsAppProcessResult {
  replyText: string;
  detectedSlug: string;
  detectedProductTitle: string;
  detectedPrice: number;
  detectedCity?: string;
  detectedAddress?: string;
  isOrderComplete: boolean;
  intent:
    | "order_confirmed"
    | "price_objection"
    | "delivery_question"
    | "quality_question"
    | "order_intent"
    | "product_info"
    | "greeting";
}

// Liste des villes et quartiers fréquents au Bénin pour détecter quand un client donne son adresse de livraison
const BENIN_LOCATIONS = [
  "cotonou",
  "calavi",
  "abomey-calavi",
  "porto-novo",
  "porto novo",
  "parakou",
  "bohicon",
  "ouidah",
  "natitingou",
  "lokossa",
  "abomey",
  "kandi",
  "djougou",
  "malanville",
  "pobe",
  "ketou",
  "allada",
  " Grand-Popo",
  "sema",
  "seme",
  "ekpe",
  "agla",
  "akpakpa",
  "godomey",
  "fidjrosse",
  "fidjrossè",
  "zogbo",
  "vedoko",
  "védoko",
  "kouhounou",
  "cadjehoun",
  "haie vive",
  "gbegamey",
  "gbégamey",
  "jericho",
  "jéricho",
  "sikecodji",
  "maro-militaire",
  "menontin",
  "ménontin",
  "kindonou",
  "ainte",
  "tankpe",
  "tankpè",
  "zoca",
  "arconville",
  " Maria-Gléta",
  "togbin",
  "pk10",
  "pk14",
  "pahou",
  "houeyiho",
  "houéyiho",
  "ste rita",
  "sainte rita",
  "midombo",
  "suru-lere",
  "st michel",
];

// Mots-clés permettant d'identifier chacun des 31 produits dans le message du client
const PRODUCT_KEYWORDS: { slug: string; keywords: string[] }[] = [
  {
    slug: "pare-soleil",
    keywords: ["pare-soleil", "pare soleil", "eblouissement", "éblouissement", "visiere", "visière", "pare-brise"],
  },
  {
    slug: "trousse-biometrique",
    keywords: ["trousse", "biometrique", "biométrique", "empreinte", "pochette cuir", "sacoche cuir"],
  },
  {
    slug: "umei",
    keywords: ["brosse", "yufan", "umei", "spray", "brume", "cheveux", "demelage", "démêlage"],
  },
  {
    slug: "stylo-3d",
    keywords: ["stylo 3d", "stylo-3d", "3d pen", "impression 3d", "stylo magique"],
  },
  {
    slug: "voiture-camera",
    keywords: ["voiture", "telecommandee", "télécommandée", "c6", "voiture camera", "voiture caméra"],
  },
  {
    slug: "cubicraft",
    keywords: ["cubicraft", "cubi-craft", "minecraft", "blocs magnetiques", "blocs magnétiques", "cubes"],
  },
  {
    slug: "shilajit",
    keywords: ["shilajit", "himalaya", "gummies shilajit", "energie", "vitalite"],
  },
  {
    slug: "filtre-eau",
    keywords: ["filtre", "purificateur", "robinet", "eau potable", "calcaire"],
  },
  {
    slug: "digestigum",
    keywords: ["digestigum", "digestion", "ballonnement", "ventre plat", "enzymes"],
  },
  {
    slug: "calendrier-3d",
    keywords: ["calendrier", "perpetuel", "perpétuel", "calendrier 3d", "moma"],
  },
  {
    slug: "savon-repousse",
    keywords: ["savon", "usma", "biota", "repousse", "alopecie", "chute de cheveux"],
  },
  {
    slug: "sourire-eclatant",
    keywords: ["dentifrice", "sourire", "blanchiment", "dents", "violet"],
  },
  {
    slug: "equilibre-feminin",
    keywords: ["probiotique", "intime", "equilibre feminin", "équilibre féminin", "femme"],
  },
  {
    slug: "capsacare",
    keywords: ["capsacare", "capsa", "douleur", "articulaire", "genou", "dos", "arthrose"],
  },
  {
    slug: "odoraway",
    keywords: ["odoraway", "odor", "deodorant", "déodorant", "aisselles", "transpiration"],
  },
  {
    slug: "bracelet-main",
    keywords: ["bracelet bague", "chaine de main", "chaîne de main", "bijou main"],
  },
  {
    slug: "duo-bracelets-coeur",
    keywords: ["duo bracelet", "bracelets coeur", "couple", "aimant"],
  },
  {
    slug: "carte-du-monde",
    keywords: ["carte du monde", "carte a gratter", "carte à gratter", "scratch map"],
  },
  {
    slug: "peeler",
    keywords: ["mandoline", "peeler", "coupe-legumes", "coupe légumes", "eplucheur", "éplucheur"],
  },
  {
    slug: "eraclean",
    keywords: ["eraclean", "desodorisant", "désodorisant", "frigo", "refrigerateur"],
  },
  {
    slug: "turbofan",
    keywords: ["turbofan", "ventilateur", "souffleur", "turbine"],
  },
  {
    slug: "stabilisateur",
    keywords: ["stabilisateur", "gimbal", "trepied", "trépied", "selfie"],
  },
  {
    slug: "trozk",
    keywords: ["trozk", "multiprise", "chargeur", "station de charge"],
  },
  {
    slug: "veilleuse",
    keywords: ["veilleuse", "lampe", "méduse", "meduse", "deco"],
  },
  {
    slug: "mini-lave-linge",
    keywords: ["lave-linge", "lave linge", "machine a laver", "pliable"],
  },
  {
    slug: "matelas",
    keywords: ["matelas", "gonflable", "camping"],
  },
  {
    slug: "microscope",
    keywords: ["microscope", "loupe"],
  },
  {
    slug: "camera",
    keywords: ["camera", "caméra", "surveillance", "wifi"],
  },
  {
    slug: "masseur-oculaire",
    keywords: ["masseur", "oculaire", "yeux", "migraine"],
  },
  {
    slug: "projecteur-noel",
    keywords: ["projecteur", "noel", "noël"],
  },
];

function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Identifie le produit dont parle le client dans son message WhatsApp
 */
export function detectProductFromMessage(
  message: string,
  fallbackSlug?: string
): { slug: string; product: CatalogProduct } {
  const norm = normalizeText(message);

  // 1. Chercher par mots-clés spécifiques
  for (const item of PRODUCT_KEYWORDS) {
    if (item.keywords.some((kw) => norm.includes(normalizeText(kw)))) {
      const prod = DEFAULT_CATALOG_MAP[item.slug];
      if (prod) return { slug: item.slug, product: prod };
    }
  }

  // 2. Chercher par correspondance avec les titres du catalogue
  for (const [slug, prod] of Object.entries(DEFAULT_CATALOG_MAP)) {
    const shortNorm = normalizeText(prod.shortTitle || "");
    if (shortNorm && shortNorm.length > 4 && norm.includes(shortNorm)) {
      return { slug, product: prod };
    }
  }

  // 3. Fallback sur le dernier produit connu du prospect ou "pare-soleil"
  const safeFallback =
    fallbackSlug && DEFAULT_CATALOG_MAP[fallbackSlug]
      ? fallbackSlug
      : "pare-soleil";
  return {
    slug: safeFallback,
    product: DEFAULT_CATALOG_MAP[safeFallback] || Object.values(DEFAULT_CATALOG_MAP)[0],
  };
}

/**
 * Détecte si le client vient de donner sa ville ou son quartier pour valider sa livraison
 */
export function detectLocationFromMessage(message: string): {
  city: string;
  address: string;
} | null {
  const norm = normalizeText(message);

  // Ignorer si c'est juste la question pré-remplie du tiroir d'abandon ("livrez dans ma ville/commune")
  if (
    norm.includes("livrez dans ma ville") ||
    norm.includes("quel est le delai") ||
    norm.includes("depasse un peu mon budget") ||
    norm.includes("plus de details/videos")
  ) {
    return null;
  }

  for (const loc of BENIN_LOCATIONS) {
    const cleanLoc = normalizeText(loc);
    if (norm.includes(cleanLoc)) {
      // Déterminer la ville principale
      let mainCity = "Cotonou";
      if (norm.includes("calavi") || norm.includes("tankpe") || norm.includes("zoca") || norm.includes("arconville") || norm.includes("togbin")) {
        mainCity = "Abomey-Calavi";
      } else if (norm.includes("porto-novo") || norm.includes("porto novo")) {
        mainCity = "Porto-Novo";
      } else if (norm.includes("parakou")) {
        mainCity = "Parakou";
      } else if (norm.includes("bohicon")) {
        mainCity = "Bohicon";
      } else if (norm.includes("ouidah") || norm.includes("pahou")) {
        mainCity = "Ouidah";
      } else if (norm.includes("natitingou")) {
        mainCity = "Natitingou";
      } else if (norm.includes("lokossa")) {
        mainCity = "Lokossa";
      } else if (norm.includes("abomey") && !norm.includes("calavi")) {
        mainCity = "Abomey";
      }

      // Si c'est une question pure sur la livraison ("vous livrez à Parakou ?") sans intention d'adresse
      const isPureQuestion =
        (norm.includes("?") || norm.startsWith("est-ce que") || norm.startsWith("vous livrez")) &&
        message.trim().split(/\s+/).length > 6 &&
        !norm.includes("quartier") &&
        !norm.includes("adresse") &&
        !norm.includes("maison") &&
        !norm.includes("rue") &&
        !norm.includes("face") &&
        !norm.includes("pres") &&
        !norm.includes("von");

      if (isPureQuestion) {
        return null;
      }

      return {
        city: mainCity,
        address: message.trim().slice(0, 220),
      };
    }
  }

  // Si le client écrit explicitement "Quartier : ..." ou "Adresse : ..." ou "Ville : ..."
  if (
    norm.includes("quartier") ||
    norm.includes("carrefour") ||
    norm.includes("pharmacie") ||
    norm.includes("ecole") ||
    norm.includes("eglise") ||
    norm.includes("mosquee") ||
    norm.includes("immeuble") ||
    norm.includes("von ")
  ) {
    return {
      city: "Cotonou",
      address: message.trim().slice(0, 220),
    };
  }

  return null;
}

/**
 * Génère la réponse commerciale WhatsApp d'Awa (Conseillère Isivente)
 */
export function generateWhatsAppAgentReply(params: {
  message: string;
  senderName?: string;
  fallbackSlug?: string;
  orderNumberIfCreated?: string;
}): WhatsAppProcessResult {
  const { message, senderName, fallbackSlug, orderNumberIfCreated } = params;
  const norm = normalizeText(message);
  const { slug, product } = detectProductFromMessage(message, fallbackSlug);
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

  const prodTitle = product?.shortTitle || product?.title || "notre produit";
  const price = product?.price || 14900;
  const clientFirstName =
    senderName &&
    senderName !== "Client" &&
    senderName !== "Client intéressé" &&
    senderName !== "Prospect WhatsApp"
      ? ` ${senderName.split(" ")[0]}`
      : "";

  // 1. Vérifier si le client vient de donner sa ville / son quartier pour être livré
  const locationMatch = detectLocationFromMessage(message);
  if (locationMatch) {
    const ref = orderNumberIfCreated || `CMD-${Math.floor(100000 + Math.random() * 900000)}`;
    const replyText =
      `✅ *C'est bien noté${clientFirstName} ! Votre commande est enregistrée.*\n\n` +
      `📦 *Article :* ${prodTitle}\n` +
      `💰 *Total à payer à la livraison :* ${fmt(price)} FCFA\n` +
      `📍 *Lieu de livraison :* ${locationMatch.city} (${locationMatch.address})\n` +
      `🔖 *Réf. Commande :* ${ref}\n\n` +
      `🚚 Notre livreur vous appellera sur votre numéro avant de passer aujourd'hui. Vous pourrez *ouvrir et vérifier votre colis* avant de régler en espèces.\n\n` +
      `Merci pour votre confiance chez *Isivente Bénin* !`;

    return {
      replyText,
      detectedSlug: slug,
      detectedProductTitle: product?.title || prodTitle,
      detectedPrice: price,
      detectedCity: locationMatch.city,
      detectedAddress: locationMatch.address,
      isOrderComplete: true,
      intent: "order_confirmed",
    };
  }

  // 2. Objection PRIX / REMISE (issue du Tiroir WhatsApp ou question directe)
  if (
    norm.includes("budget") ||
    norm.includes("remise") ||
    norm.includes("reduction") ||
    norm.includes("trop eleve") ||
    norm.includes("trop cher") ||
    norm.includes("diminuer") ||
    norm.includes("dernier prix") ||
    norm.includes("facilite")
  ) {
    const specialPrice = Math.max(10000, price - 1000);
    const replyText =
      `Bonjour${clientFirstName} ! 😊 Merci pour votre intérêt pour le *${prodTitle}*.\n\n` +
      `Le tarif est déjà en promotion à *${fmt(price)} FCFA* (au lieu de ${fmt((product as any)?.originalPrice || product?.original_price || price + 8000)} F) avec la *livraison express incluse* et la garantie officielle.\n\n` +
      `🎁 *Exceptionnellement pour vous sur WhatsApp*, si vous validez votre livraison pour aujourd'hui, je peux vous accorder une *remise directe de 1 000 FCFA* (soit *${fmt(specialPrice)} FCFA* à régler à la réception après vérification du produit) !\n\n` +
      `👉 Dans quelle *Ville et quel Quartier* souhaitez-vous être livré(e) pour que je réserve votre colis à ce tarif ?`;

    return {
      replyText,
      detectedSlug: slug,
      detectedProductTitle: product?.title || prodTitle,
      detectedPrice: specialPrice,
      isOrderComplete: false,
      intent: "price_objection",
    };
  }

  // 3. Question LIVRAISON / VILLE / DÉLAI
  if (
    norm.includes("livraison") ||
    norm.includes("livrez") ||
    norm.includes("delai") ||
    norm.includes("commune") ||
    norm.includes("ville") ||
    norm.includes("quand")
  ) {
    const replyText =
      `Bonjour${clientFirstName} ! 🚚 Voici comment fonctionne notre livraison au Bénin pour le *${prodTitle}* (*${fmt(price)} FCFA*) :\n\n` +
      `⚡ *Cotonou, Calavi, Porto-Novo & Ouidah :* Livraison express en *moins de 24h* (souvent le jour même).\n` +
      `📦 *Parakou, Bohicon, Abomey, Lokossa & autres villes :* Expédition rapide sous *24h à 48h*.\n` +
      `💵 *Zéro avance :* Vous payez en espèces directement au livreur après avoir ouvert et vérifié votre article.\n\n` +
      `👉 Indiquez-moi simplement votre *Ville et votre Quartier précis* en réponse à ce message et je lance votre livraison tout de suite !`;

    return {
      replyText,
      detectedSlug: slug,
      detectedProductTitle: product?.title || prodTitle,
      detectedPrice: price,
      isOrderComplete: false,
      intent: "delivery_question",
    };
  }

  // 4. Question QUALITÉ / GARANTIE / TEST AVANT PAIEMENT
  if (
    norm.includes("qualite") ||
    norm.includes("garantie") ||
    norm.includes("tester") ||
    norm.includes("verifier") ||
    norm.includes("ouvrir") ||
    norm.includes("video") ||
    norm.includes("details") ||
    norm.includes("original") ||
    norm.includes("marche")
  ) {
    const replyText =
      `Bonjour${clientFirstName} ! 🛡️ Je vous rassure à 100 % concernant le *${prodTitle}* (*${fmt(price)} FCFA*) :\n\n` +
      `1️⃣ *Vérification avant paiement :* Lorsque le livreur arrive chez vous, vous avez le droit d'*ouvrir le colis et de vérifier la qualité* de l'article avant de donner votre argent.\n` +
      `2️⃣ *Garantie Isivente :* Si l'article présente le moindre défaut, nous le remplaçons immédiatement et gratuitement.\n` +
      `3️⃣ *Lien officiel avec vidéos :* https://isivente.vercel.app/p/${slug}\n\n` +
      `👉 Souhaitez-vous qu'on vous l'apporte aujourd'hui pour le voir par vous-même ? Dites-moi juste votre *Ville et votre Quartier* !`;

    return {
      replyText,
      detectedSlug: slug,
      detectedProductTitle: product?.title || prodTitle,
      detectedPrice: price,
      isOrderComplete: false,
      intent: "quality_question",
    };
  }

  // 5. Intention de COMMANDE DIRECTE ("Je souhaite commander...", "Je veux acheter...")
  if (
    norm.includes("commander") ||
    norm.includes("acheter") ||
    norm.includes("je veux") ||
    norm.includes("interesse") ||
    norm.includes("valider ma commande")
  ) {
    const replyText =
      `Bonjour${clientFirstName} ! 🎉 C'est un excellent choix.\n\n` +
      `Pour expédier votre *${prodTitle}* (*${fmt(price)} FCFA* — paiement en espèces à la réception après vérification), envoyez-moi simplement :\n\n` +
      `📍 *Votre Ville et votre Quartier précis* (ex: *Cotonou, Agla près de la pharmacie...*)\n\n` +
      `Dès que vous me répondez, j'enregistre votre commande immédiatement pour le livreur !`;

    return {
      replyText,
      detectedSlug: slug,
      detectedProductTitle: product?.title || prodTitle,
      detectedPrice: price,
      isOrderComplete: false,
      intent: "order_intent",
    };
  }

  // 6. Réponse par défaut accueillante et orientée closing
  const replyText =
    `Bonjour${clientFirstName} et bienvenue chez *Isivente Bénin* ! 👋\n\n` +
    `Je suis Awa, votre conseillère client. Je vois que vous vous intéressez à notre *${prodTitle}* en promotion à *${fmt(price)} FCFA*.\n\n` +
    `✅ Livraison express 24h partout au Bénin\n` +
    `✅ Paiement en espèces à la réception (après vérification du colis)\n\n` +
    `👉 Avez-vous une question, ou souhaitez-vous m'indiquer votre *Ville + Quartier* pour être livré(e) dès aujourd'hui ?`;

  return {
    replyText,
    detectedSlug: slug,
    detectedProductTitle: product?.title || prodTitle,
    detectedPrice: price,
    isOrderComplete: false,
    intent: "greeting",
  };
}

/**
 * Envoie un message WhatsApp sortant via Green-API
 */
export async function sendGreenApiWhatsAppMessage(params: {
  chatId: string;
  message: string;
  idInstance?: string;
  apiTokenInstance?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const idInstance =
    params.idInstance ||
    process.env.GREEN_API_ID_INSTANCE ||
    "710722786456";
  const apiTokenInstance =
    params.apiTokenInstance || process.env.GREEN_API_TOKEN_INSTANCE || "";

  if (!idInstance || !apiTokenInstance) {
    return {
      ok: false,
      error: "Clé apiTokenInstance Green-API non configurée",
    };
  }

  // Déterminer le sous-domaine Green-API (ex: 7107.api.greenapi.com pour les instances 7107...)
  const prefix = idInstance.slice(0, 4);
  const endpoints = [
    `https://${prefix}.api.greenapi.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
    `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
  ];

  // Normaliser le chatId (ex: "2290197123456@c.us")
  const cleanChatId = params.chatId.includes("@")
    ? params.chatId
    : `${params.chatId.replace(/\D/g, "")}@c.us`;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: cleanChatId,
          message: params.message,
        }),
      });
      if (res.ok) {
        return { ok: true };
      }
    } catch {}
  }

  return { ok: false, error: "Échec d'envoi vers Green-API" };
}
