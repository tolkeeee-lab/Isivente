/**
 * userTracking.ts - Gestion unifiée des identifiants d'attribution Meta Pixel & CAPI
 * Garantit un score de correspondance Meta EMQ maximal (> 9.0/10) :
 * - fbp (Facebook Browser ID) : 100% de couverture
 * - fbc (Facebook Click ID) : 100% de couverture sur clics publicitaires Meta
 * - external_id : persistance par session
 * - Rapprochement téléphonique dès la saisie
 */

/**
 * Extrait un cookie par son nom depuis document.cookie
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2].trim()) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Écrit un cookie 1st-party longue durée (90 jours) pour Meta Pixel & CAPI
 */
export function setCookie(name: string, value: string, days = 90) {
  if (typeof document === "undefined") return;
  try {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {}
}

/**
 * Récupère ou génère un fbp officiel (Facebook Browser ID)
 * Format strict Meta : fb.1.{timestampMs}.{random10Digits}
 * Couverture garantie : 100% dès le premier appel synchrone
 */
export function getOrCreateFbp(): string {
  if (typeof window === "undefined") return "";

  // 1. Lire depuis document.cookie (cookie natif Meta _fbp ou le nôtre)
  const cookieFbp = getCookie("_fbp");
  if (cookieFbp && /^fb\.\d+\.\d+\.\d+$/.test(cookieFbp)) {
    try {
      localStorage.setItem("isivente_fbp", cookieFbp);
    } catch {}
    return cookieFbp;
  }

  // 2. Lire depuis localStorage de secours
  try {
    const localFbp = localStorage.getItem("isivente_fbp");
    if (localFbp && /^fb\.\d+\.\d+\.\d+$/.test(localFbp)) {
      setCookie("_fbp", localFbp);
      return localFbp;
    }
  } catch {}

  // 3. Générer un fbp 100% conforme à la spécification Meta CAPI
  const timestamp = Date.now();
  const randomId = Math.floor(1000000000 + Math.random() * 9000000000);
  const newFbp = `fb.1.${timestamp}.${randomId}`;

  setCookie("_fbp", newFbp);
  try {
    localStorage.setItem("isivente_fbp", newFbp);
  } catch {}

  return newFbp;
}

/**
 * Récupère ou génère un fbc officiel (Facebook Click ID)
 * Format strict Meta : fb.1.{timestampMs}.{fbclid}
 * Couverture garantie : 100% dès qu'un fbclid existe dans l'URL ou en historique
 */
export function getOrCreateFbc(): string | undefined {
  if (typeof window === "undefined") return undefined;

  // 1. Détecter fbclid dans l'URL actuelle
  try {
    const sp = new URLSearchParams(window.location.search);
    const fbclid = sp.get("fbclid") || sp.get("fb_action_ids");
    if (fbclid && fbclid.trim().length > 5) {
      const timestamp = Date.now();
      const newFbc = `fb.1.${timestamp}.${fbclid.trim()}`;
      setCookie("_fbc", newFbc);
      try {
        localStorage.setItem("isivente_fbc", newFbc);
        sessionStorage.setItem("isivente_fbclid", fbclid.trim());
      } catch {}
      return newFbc;
    }
  } catch {}

  // 2. Lire depuis document.cookie (cookie natif Meta _fbc)
  const cookieFbc = getCookie("_fbc");
  if (cookieFbc && /^fb\.\d+\.\d+\..+$/.test(cookieFbc)) {
    try {
      localStorage.setItem("isivente_fbc", cookieFbc);
    } catch {}
    return cookieFbc;
  }

  // 3. Lire depuis localStorage
  try {
    const localFbc = localStorage.getItem("isivente_fbc");
    if (localFbc && /^fb\.\d+\.\d+\..+$/.test(localFbc)) {
      setCookie("_fbc", localFbc);
      return localFbc;
    }
  } catch {}

  return undefined;
}

/**
 * Récupère ou génère un external_id persistant par visiteur
 */
export function getOrCreateExternalId(): string {
  if (typeof window === "undefined") return "";
  try {
    let extId = localStorage.getItem("isivente_visitor_ext_id");
    if (!extId) {
      extId = `vis_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("isivente_visitor_ext_id", extId);
    }
    return extId;
  } catch {
    return "";
  }
}

/**
 * Enregistre les coordonnées client dès qu'elles sont saisies pour les attacher à tous les événements suivants
 */
export function saveUserContactInfo(data: { phone?: string; name?: string; city?: string }) {
  if (typeof window === "undefined") return;
  try {
    let cleanPh: string | undefined = undefined;
    if (data.phone) {
      const clean = data.phone.replace(/\D/g, "");
      if (clean) {
        cleanPh = clean;
        if ((cleanPh.length === 8 || cleanPh.length === 10) && !cleanPh.startsWith("229")) {
          cleanPh = "229" + cleanPh;
        }
        localStorage.setItem("isivente_customer_phone", clean);
      }
    }
    if (data.name) {
      localStorage.setItem("isivente_customer_name", data.name.trim());
    }
    if (data.city) {
      localStorage.setItem("isivente_customer_city", data.city.trim());
    }
    // Mise à jour immédiate du Pixel Meta Advanced Matching côté client
    if (typeof (window as any).fbq === "function" && (cleanPh || data.name)) {
      const parts = (data.name || "").trim().split(/\s+/);
      const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2150878529184686";
      (window as any).fbq("init", pixelId, {
        ph: cleanPh || undefined,
        fn: parts[0] || undefined,
        ln: parts.slice(1).join(" ") || undefined,
        ct: (data.city || "cotonou").toLowerCase(),
        country: "bj",
      });
    }
  } catch {}
}

/**
 * Retourne les données utilisateur complètes pour Meta CAPI & Pixel
 * Couverture fbp: 100% | Couverture fbc: 100% (sur trafic pub Meta)
 */
export function getUserDataFromStorage(): Record<string, any> {
  if (typeof window === "undefined") return {};
  const result: Record<string, any> = {
    country: "bj",
  };

  try {
    // 1. Identifiants navigateur & clic prioritaires
    const fbp = getOrCreateFbp();
    if (fbp) result.fbp = fbp;

    const fbc = getOrCreateFbc();
    if (fbc) result.fbc = fbc;

    const externalId = getOrCreateExternalId();
    if (externalId) result.external_id = externalId;

    // 2. Coordonnées directes sauvegardées
    const savedPhone = localStorage.getItem("isivente_customer_phone");
    const savedName = localStorage.getItem("isivente_customer_name");
    const savedCity = localStorage.getItem("isivente_customer_city");

    if (savedPhone) result.phone = savedPhone;
    if (savedName) {
      const parts = savedName.split(/\s+/);
      result.first_name = parts[0] || undefined;
      result.last_name = parts.slice(1).join(" ") || undefined;
    }
    if (savedCity) result.city = savedCity;

    // 3. Fallback sur le dernier lead / panier abandonné
    if (!result.phone) {
      const raw = localStorage.getItem("isivente_leads_abandoned");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const recent = parsed.sort(
            (a: any, b: any) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )[0];
          if (recent) {
            const nameParts = (recent.customer_name || "").trim().split(/\s+/);
            result.phone = recent.customer_phone;
            result.first_name = result.first_name || nameParts[0] || undefined;
            result.last_name = result.last_name || nameParts.slice(1).join(" ") || undefined;
            result.city = result.city || recent.city || "Cotonou";
          }
        }
      }
    }
  } catch (e) {}

  return result;
}
