/**
 * phoneUtils.ts - Gestion unifiée et intelligente des numéros de téléphone (Bénin & International)
 * 
 * Au Bénin :
 * - Nouveau format officiel (depuis la réforme) : 10 chiffres commençant par "01" (ex: 01 97 12 34 56)
 * - Ancien format toujours utilisé par les clients : 8 chiffres sans "01" (ex: 97 12 34 56)
 * - Indicatif international : +229
 * 
 * Règle d'or de capture :
 * - Si le client tape "01...", le numéro comporte 10 chiffres. Ne JAMAIS capturer à 8 chiffres car il manque 2 chiffres !
 * - Si le client tape sans "01...", le numéro comporte 8 chiffres complets.
 * - Pour WhatsApp (wa.me) et appels : si le numéro a 8 chiffres sans 01, ajouter automatiquement "01" (22901XXXXXXXX).
 */

/**
 * Nettoie une chaîne pour ne garder que les chiffres
 */
export function extractDigits(phone: string | null | undefined): string {
  return String(phone || "").replace(/\D/g, "");
}

/**
 * Vérifie si un numéro béninois saisi par le client est complet.
 * Évite de capturer un numéro tronqué pendant que le client tape "01..."
 */
export function isBeninPhoneComplete(phone: string | null | undefined): boolean {
  const digits = extractDigits(phone);
  if (!digits) return false;

  // Format international avec indicatif 229
  if (digits.startsWith("229")) {
    const after229 = digits.slice(3);
    if (after229.startsWith("01")) {
      return after229.length >= 10; // 229 + 01 + 8 chiffres = 13 chiffres
    }
    return after229.length >= 8; // 229 + 8 chiffres = 11 chiffres
  }

  // Si le client a commencé par "01", le numéro complet compte OBLIGATOIREMENT 10 chiffres !
  // Si digits.length est 8 ou 9, le client n'a pas encore fini de taper ses 2 derniers chiffres !
  if (digits.startsWith("01")) {
    return digits.length >= 10;
  }

  // Si le client n'a pas mis "01" (ancien format direct béninois à 8 chiffres : ex 97 12 34 56)
  return digits.length >= 8;
}

/**
 * Normalise un numéro pour WhatsApp (lien https://wa.me/...)
 * Le "01" n'étant pas obligatoire pour WhatsApp :
 * - Si le client a tapé avec "01" (10 chiffres), on garde son "01" : wa.me/22901XXXXXXXX
 * - Si le client a tapé sans "01" (8 chiffres), on garde tel quel : wa.me/229XXXXXXXX
 * - Évite tout doublon d'indicatif international 229
 */
export function formatBeninPhoneForWhatsApp(phone: string | null | undefined): string {
  let digits = extractDigits(phone);
  if (!digits) return "";

  // Retirer l'indicatif 229 s'il est déjà présent au début pour éviter 229229...
  if (digits.startsWith("229")) {
    digits = digits.slice(3);
  }

  return `229${digits}`;
}

/**
 * Normalise un numéro pour les appels téléphoniques GSM (lien tel:...)
 */
export function formatBeninPhoneForCall(phone: string | null | undefined): string {
  let digits = extractDigits(phone);
  if (!digits) return "";

  if (digits.startsWith("229")) {
    digits = digits.slice(3);
  }

  return `+229${digits}`;
}

/**
 * Formate un numéro de téléphone pour un affichage lisible et aéré dans l'interface
 * Ex: "01 97 12 34 56" ou "97 12 34 56"
 */
export function formatBeninPhoneDisplay(phone: string | null | undefined): string {
  let digits = extractDigits(phone);
  if (!digits) return phone || "-";

  if (digits.startsWith("229")) {
    digits = digits.slice(3);
  }

  if (digits.startsWith("01") && digits.length === 10) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }

  if (digits.length === 8) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)}`;
  }

  return phone || digits;
}
