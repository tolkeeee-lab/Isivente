/**
 * storesStorage.ts — Source unique pour la gestion multi-boutiques (SaaS Phase 1)
 * Types stricts, pays africains francophones, helpers de slug et CRUD Supabase sécurisé.
 */

import { supabase } from "./supabase";

export type AfricanCountryCode = "BJ" | "CI" | "TG" | "SN" | "CM" | "BF" | "ML" | "NE";

export interface AfricanCountryConfig {
  code: AfricanCountryCode;
  name: string;
  dialCode: string;
  currency: string;
  defaultCity: string;
}

export const AFRICAN_COUNTRIES: AfricanCountryConfig[] = [
  { code: "BJ", name: "Bénin", dialCode: "229", currency: "FCFA", defaultCity: "Cotonou" },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "225", currency: "FCFA", defaultCity: "Abidjan" },
  { code: "TG", name: "Togo", dialCode: "228", currency: "FCFA", defaultCity: "Lomé" },
  { code: "SN", name: "Sénégal", dialCode: "221", currency: "FCFA", defaultCity: "Dakar" },
  { code: "CM", name: "Cameroun", dialCode: "237", currency: "FCFA", defaultCity: "Douala" },
  { code: "BF", name: "Burkina Faso", dialCode: "226", currency: "FCFA", defaultCity: "Ouagadougou" },
  { code: "ML", name: "Mali", dialCode: "223", currency: "FCFA", defaultCity: "Bamako" },
  { code: "NE", name: "Niger", dialCode: "227", currency: "FCFA", defaultCity: "Niamey" },
];

export interface StoreConfig {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  country: AfricanCountryCode;
  currency: string;
  city: string;
  whatsapp_number: string;
  meta_pixel_id?: string | null;
  meta_capi_token?: string | null;
  accent_color: string;
  plan: "trial" | "starter" | "pro";
  trial_ends_at?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StoreUpsertPayload {
  name: string;
  slug: string;
  country: AfricanCountryCode;
  currency: string;
  city: string;
  whatsapp_number: string;
  meta_pixel_id?: string | null;
  meta_capi_token?: string | null;
  accent_color: string;
}

/**
 * Transforme un nom de boutique en slug URL propre (ex: "Koffi Shop Cotonou!" -> "koffi-shop-cotonou")
 */
export function slugifyStoreName(input: string): string {
  return (input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * Récupère la boutique de l'utilisateur authentifié (null si non connecté ou table non migrée)
 */
export async function getCurrentUserStore(): Promise<{
  store: StoreConfig | null;
  tableMissing: boolean;
  error?: string;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { store: null, tableMissing: false };
  }

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    const isMissing =
      error.code === "PGRST205" ||
      error.code === "42P01" ||
      (error.message || "").toLowerCase().includes("does not exist") ||
      (error.message || "").toLowerCase().includes("schema cache");
    return { store: null, tableMissing: isMissing, error: error.message };
  }

  return { store: (data as StoreConfig) || null, tableMissing: false };
}

/**
 * Crée ou met à jour la boutique de l'utilisateur authentifié
 */
export async function upsertUserStore(
  payload: StoreUpsertPayload,
  existingStoreId?: string
): Promise<{ store: StoreConfig | null; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { store: null, error: "Vous devez être connecté pour enregistrer votre boutique." };
  }

  const cleanSlug = slugifyStoreName(payload.slug || payload.name);
  if (cleanSlug.length < 3) {
    return {
      store: null,
      error: "L'identifiant de boutique (slug) doit contenir au moins 3 caractères.",
    };
  }

  const cleanWhatsapp = (payload.whatsapp_number || "").replace(/\D/g, "");

  const record = {
    owner_id: user.id,
    name: payload.name.trim(),
    slug: cleanSlug,
    country: payload.country,
    currency: payload.currency || "FCFA",
    city: payload.city.trim() || "Cotonou",
    whatsapp_number: cleanWhatsapp,
    meta_pixel_id: payload.meta_pixel_id?.trim() || null,
    meta_capi_token: payload.meta_capi_token?.trim() || null,
    accent_color: payload.accent_color || "#0F172A",
  };

  const query = existingStoreId
    ? supabase
        .from("stores")
        .update(record)
        .eq("id", existingStoreId)
        .eq("owner_id", user.id)
        .select("*")
        .single()
    : supabase.from("stores").insert([record]).select("*").single();

  const { data, error } = await query;

  if (error) {
    if (error.code === "23505") {
      return {
        store: null,
        error: `Le lien "${cleanSlug}" est déjà pris par une autre boutique. Choisissez un autre identifiant.`,
      };
    }
    return { store: null, error: error.message };
  }

  return { store: data as StoreConfig };
}

/**
 * Récupère les informations publiques d'une boutique par son slug (sans jamais exposer meta_capi_token)
 */
export async function getPublicStoreBySlug(
  slug: string
): Promise<Omit<StoreConfig, "owner_id" | "meta_capi_token" | "plan"> | null> {
  const cleanSlug = slugifyStoreName(slug);
  if (!cleanSlug) return null;

  const { data, error } = await supabase
    .from("public_stores")
    .select("id, name, slug, country, currency, city, whatsapp_number, meta_pixel_id, accent_color, is_active")
    .eq("slug", cleanSlug)
    .maybeSingle();

  if (error || !data) return null;
  return data as Omit<StoreConfig, "owner_id" | "meta_capi_token" | "plan">;
}
