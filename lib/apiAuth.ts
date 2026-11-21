import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { isFounderEmail } from "./storesStorage";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://uelognqedzqtvupwzejh.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";

/**
 * Helper client-side : retourne l'en-tête Authorization Bearer du vendeur connecté.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {}
  return {};
}

export type AuthenticatedTenantResult =
  | {
      ok: true;
      userId: string;
      email: string | null;
      isFounder: boolean;
      storeId: string | null;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

/**
 * Garde d'authentification serveur stricte pour toutes les routes Admin API.
 * Vérifie le JWT Supabase, résout le store_id réel côté serveur et bloque les boutiques en pause.
 */
export async function requireAuthenticatedTenant(
  req: Request
): Promise<AuthenticatedTenantResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: "Authentification requise",
    };
  }

  try {
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await authedClient.auth.getUser(token);

    if (userError || !user) {
      return {
        ok: false,
        status: 401,
        error: "Session invalide ou expirée",
      };
    }

    const isFounder = isFounderEmail(user.email);

    const { data: store } = await authedClient
      .from("stores")
      .select("id, is_active")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!isFounder && store && store.is_active === false) {
      return {
        ok: false,
        status: 403,
        error: "Boutique en pause",
      };
    }

    return {
      ok: true,
      userId: user.id,
      email: user.email || null,
      isFounder,
      storeId: store?.id || null,
    };
  } catch {
    return {
      ok: false,
      status: 401,
      error: "Erreur de vérification de session",
    };
  }
}
