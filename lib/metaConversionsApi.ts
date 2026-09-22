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

export interface MetaCapiEventOptions {
  event_name: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | string;
  event_time?: number;
  event_source_url?: string;
  event_id?: string;
  test_event_code?: string;
  user_data?: {
    phone?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    country?: string;
    external_id?: string;
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

/**
 * Envoie un événement serveur à Meta Conversions API (CAPI) avec Event Match Quality (EMQ) maximal
 */
export async function sendMetaConversionApiEvent(options: MetaCapiEventOptions): Promise<boolean> {
  const pixelId = META_PIXEL_ID;
  const token = META_CAPI_TOKEN;

  if (!pixelId) {
    console.warn("⚠️ Meta CAPI: Aucun Pixel ID configuré.");
    return false;
  }

  // Si le token n'est pas encore renseigné dans .env.local, loguer sans planter
  if (!token) {
    console.info(`ℹ️ Meta CAPI: Événement [${options.event_name}] prêt mais META_CONVERSIONS_API_TOKEN n'est pas encore défini dans .env.local`);
    return false;
  }

  const uData = options.user_data || {};
  const cData = options.custom_data || {};

  const payload = {
    data: [
      {
        event_name: options.event_name,
        event_time: options.event_time || Math.floor(Date.now() / 1000),
        event_id: options.event_id || (cData.order_id ? `order_${cData.order_id}` : undefined),
        action_source: "website",
        event_source_url: options.event_source_url,
        user_data: {
          ph: uData.phone ? [hashPhone(uData.phone)] : undefined,
          em: uData.email ? [hashSha256(uData.email)] : undefined,
          fn: uData.first_name ? [hashSha256(uData.first_name)] : undefined,
          ln: uData.last_name ? [hashSha256(uData.last_name)] : undefined,
          ct: uData.city ? [hashSha256(uData.city)] : [hashSha256("cotonou")],
          country: [hashSha256(uData.country || "bj")],
          external_id: uData.external_id ? [hashSha256(uData.external_id)] : undefined,
          client_ip_address: uData.client_ip_address,
          client_user_agent: uData.client_user_agent,
          fbc: uData.fbc,
          fbp: uData.fbp,
        },
        custom_data: {
          currency: cData.currency || "XOF",
          value: cData.value !== undefined ? cData.value : 0,
          content_name: cData.content_name,
          content_ids: cData.content_ids,
          content_type: cData.content_type || "product",
          order_id: cData.order_id,
          num_items: cData.num_items || 1,
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
      return true;
    } else {
      console.error(`❌ Meta CAPI: Erreur réponse Meta Graph:`, result);
      return false;
    }
  } catch (err) {
    console.error(`❌ Meta CAPI: Échec de connexion au serveur Meta:`, err);
    return false;
  }
}
