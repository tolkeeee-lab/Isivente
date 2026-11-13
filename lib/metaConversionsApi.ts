import crypto from "crypto";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2150878529184686";
export const META_CAPI_TOKEN = process.env.META_CONVERSIONS_API_TOKEN || "";

/**
 * Hache une chaîne en SHA-256 selon les recommandations de Meta
 */
function hashSha256(val: string | undefined): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash("sha256").update(clean).digest("hex");
}

/**
 * Formate et hache un numéro de téléphone (ajoute l'indicatif 229 si manquant pour le Bénin)
 */
function hashPhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  // Si le numéro fait 8 ou 10 chiffres sans indicatif, ajouter 229 (Bénin)
  if (digits.length === 8 || digits.length === 10) {
    if (!digits.startsWith("229")) {
      digits = "229" + digits;
    }
  }
  return crypto.createHash("sha256").update(digits).digest("hex");
}

/**
 * Résout le département béninois à partir de la ville pour le paramètre 'st' de Meta CAPI
 */
function getStateFromCity(city: string | undefined): string {
  if (!city) return "littoral";
  const c = city.toLowerCase().trim();
  if (c.includes("calavi") || c.includes("ouidah") || c.includes("allada") || c.includes("godomey")) return "atlantique";
  if (c.includes("porto") || c.includes("seme") || c.includes("sema") || c.includes("ekpe")) return "oueme";
  if (c.includes("parakou")) return "borgou";
  if (c.includes("bohicon") || c.includes("abomey")) return "zou";
  if (c.includes("lokossa")) return "mono";
  if (c.includes("natitingou")) return "atacora";
  return "littoral"; // Cotonou par défaut
}

/**
 * Détecte si un événement provient d'un test interne (admin, mot-clé test, numéro factice)
 */
export function isTestEventData(data: {
  phone?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string | string[];
}): boolean {
  const phone = (data.phone || "").replace(/\D/g, "");
  const fullName = `${data.first_name || ""} ${data.last_name || ""} ${data.name || ""}`.toLowerCase();
  const emailList = Array.isArray(data.email) ? data.email : [data.email || ""];
  const isTestEmail = emailList.some((em) => {
    const e = (em || "").toLowerCase();
    return e.includes("test") || e.includes("example.com");
  });

  // 1. Numéros de test récurrents
  const testPhones = ["0100000000", "00000000", "2290100000000", "22900000000", "12345678", "0112345678", "2290112345678", "0197000000", "2290197000000"];
  if (testPhones.includes(phone) || /^0+$/.test(phone)) return true;

  // 2. Mots-clés évidents de test dans le nom
  if (
    fullName.includes("test") ||
    fullName.includes("admin") ||
    fullName.includes("essaie") ||
    fullName.includes("essai") ||
    fullName.includes("fictif")
  ) {
    return true;
  }

  // 3. Adresses email de test
  if (isTestEmail) {
    return true;
  }

  return false;
}

export interface MetaCapiEventOptions {
  event_name: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | string;
  event_time?: number;
  event_source_url?: string;
  event_id?: string;
  test_event_code?: string;
  user_data?: {
    phone?: string;
    email?: string | string[];
    first_name?: string;
    last_name?: string;
    city?: string;
    st?: string;
    country?: string;
    external_id?: string | string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    order_id?: string;
    num_items?: number;
  };
}

export interface MetaCapiResult {
  sent: boolean;
  events_received?: number;
  fbtrace_id?: string;
  error?: any;
}

/**
 * Envoie un événement serveur à Meta Conversions API (CAPI) avec Event Match Quality (EMQ) maximal
 */
export async function sendMetaConversionApiEvent(options: MetaCapiEventOptions): Promise<MetaCapiResult> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || META_PIXEL_ID || "2150878529184686";
  const token = (process.env.META_CONVERSIONS_API_TOKEN || META_CAPI_TOKEN || "").trim();

  if (!pixelId) {
    console.warn("⚠️ Meta CAPI: Aucun Pixel ID configuré.");
    return { sent: false, error: "missing_pixel_id" };
  }

  // Si le token n'est pas encore renseigné dans l'environnement, loguer sans planter
  if (!token) {
    console.info(`ℹ️ Meta CAPI: Événement [${options.event_name}] prêt mais META_CONVERSIONS_API_TOKEN n'est pas défini.`);
    return { sent: false, error: "missing_token" };
  }

  const uData = options.user_data || {};
  const cData = options.custom_data || {};

  // Si c'est un événement de test interne (nom "test", "admin", "essaie" ou numéro factice), ignorer l'envoi pour ne pas polluer Meta Events Manager
  if (
    isTestEventData({
      phone: uData.phone,
      first_name: uData.first_name,
      last_name: uData.last_name,
      email: uData.email,
    })
  ) {
    console.info(`🛡️ Meta CAPI: Événement [${options.event_name}] ignoré car identifié comme un TEST interne (${uData.first_name || ""} ${uData.phone || ""}).`);
    return { sent: false, error: "ignored_test_event" };
  }

  // Nettoyer les clés undefined dans user_data pour un payload Graph API 100% strict
  const clientIp = (uData.client_ip_address || "").replace(/::ffff:/, "").trim();
  const rawUserData: Record<string, any> = {
    ph: uData.phone ? [hashPhone(uData.phone)] : undefined,
    em: uData.email
      ? (Array.isArray(uData.email)
          ? uData.email.map((e) => hashSha256(e)).filter((x): x is string => Boolean(x))
          : [hashSha256(uData.email)].filter((x): x is string => Boolean(x)))
      : undefined,
    fn: uData.first_name ? [hashSha256(uData.first_name)] : undefined,
    ln: uData.last_name ? [hashSha256(uData.last_name)] : undefined,
    ct: uData.city ? [hashSha256(uData.city)] : [hashSha256("cotonou")],
    st: [hashSha256(uData.st || getStateFromCity(uData.city))],
    country: [hashSha256(uData.country || "bj")],
    external_id: uData.external_id
      ? (Array.isArray(uData.external_id)
          ? uData.external_id.map((id) => hashSha256(id)).filter((x): x is string => Boolean(x))
          : [hashSha256(uData.external_id)].filter((x): x is string => Boolean(x)))
      : undefined,
    client_ip_address: clientIp || undefined,
    client_user_agent: uData.client_user_agent || undefined,
    fbc: uData.fbc || undefined,
    fbp: uData.fbp || undefined,
  };
  const cleanUserData = Object.fromEntries(
    Object.entries(rawUserData).filter(([, v]) => v !== undefined && v !== "")
  );

  const payload = {
    data: [
      {
        event_name: options.event_name,
        event_time: options.event_time || Math.floor(Date.now() / 1000),
        event_id: options.event_id || (cData.order_id ? String(cData.order_id) : undefined),
        action_source: "website",
        event_source_url: options.event_source_url,
        user_data: cleanUserData,
        custom_data: {
          currency: cData.currency || "XOF",
          value: cData.value !== undefined ? cData.value : 0,
          content_name: cData.content_name,
          content_ids: cData.content_ids,
          content_type: cData.content_type || "product",
          order_id: cData.order_id,
          num_items: cData.num_items || 1,
          delivery_category: "home_delivery",
          contents:
            cData.content_ids && cData.content_ids.length > 0
              ? cData.content_ids.map((id) => ({
                  id,
                  quantity: cData.num_items || 1,
                  item_price: cData.value || 0,
                }))
              : undefined,
        },
      },
    ],
    test_event_code: options.test_event_code || process.env.META_TEST_EVENT_CODE || undefined,
  };

  // Nettoyer si undefined
  if (!payload.test_event_code) {
    delete (payload as any).test_event_code;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok && result?.events_received) {
      console.log(`✅ Meta CAPI: Événement [${options.event_name}] envoyé avec succès au serveur Meta !`, result);
      return {
        sent: true,
        events_received: result.events_received,
        fbtrace_id: result.fbtrace_id,
      };
    } else {
      console.error(`❌ Meta CAPI: Erreur réponse Meta Graph:`, result);
      return { sent: false, error: result?.error || result };
    }
  } catch (err: any) {
    console.error(`❌ Meta CAPI: Échec de connexion au serveur Meta:`, err);
    return { sent: false, error: err?.message || "network_error" };
  }
}
