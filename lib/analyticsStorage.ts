import { supabase } from "@/lib/supabase";

export interface AnalyticsStats {
  totalViews: number;
  totalClicks: number;
  ctr: number;               // CTR réel en % (ex: 18.5)
  avgTimeSpentSeconds: number;
  formattedAvgTime: string;  // ex: "1m 45s"
}

// Stat par produit
export interface ProductAnalyticsStats extends AnalyticsStats {
  slug: string;
}

const ANALYTICS_LOCAL_KEY = "isivente_analytics_store";

export interface AnalyticsSession {
  id: string;
  slug: string;
  durationSeconds: number;
  clicked: boolean;
  timestamp: string;
}

/* ─── LocalStorage helpers ─── */
function getLocalSessions(): AnalyticsSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANALYTICS_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSession(session: AnalyticsSession) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalSessions();
    // Dédupliquer : si une session existe déjà pour cet ID, la remplacer
    const deduped = list.filter((s) => s.id !== session.id);
    localStorage.setItem(
      ANALYTICS_LOCAL_KEY,
      JSON.stringify([session, ...deduped].slice(0, 2000)) // cap 2000 sessions
    );
  } catch {}
}

/**
 * Enregistre UNE SEULE session par visiteur.
 * Appelée avec un ID stable (généré au montage de la page) pour éviter les doublons.
 */
export async function trackUserSession(
  slug: string,
  durationSeconds: number,
  clicked: boolean,
  sessionId?: string // ID stable pour dédupliquer les appels
) {
  const id =
    sessionId ||
    "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

  const session: AnalyticsSession = {
    id,
    slug,
    durationSeconds: Math.max(1, Math.round(durationSeconds)),
    clicked,
    timestamp: new Date().toISOString(),
  };

  // 1. LocalStorage (avec déduplication par ID)
  saveLocalSession(session);

  // 2. Supabase (upsert pour éviter les doublons)
  try {
    await supabase.from("analytics").upsert(
      [
        {
          session_id: session.id,
          product_slug: slug,
          duration_seconds: session.durationSeconds,
          clicked: session.clicked,
          created_at: session.timestamp,
        },
      ],
      { onConflict: "session_id" }
    );
  } catch (err) {
    console.warn("Analytics Supabase:", err);
  }
}

/* ─── Calcul des stats à partir des sessions brutes ─── */
function computeStats(sessions: AnalyticsSession[]): AnalyticsStats {
  if (sessions.length === 0) {
    return {
      totalViews: 0,
      totalClicks: 0,
      ctr: 0,
      avgTimeSpentSeconds: 0,
      formattedAvgTime: "—",
    };
  }

  const totalViews = sessions.length;
  const totalClicks = sessions.filter((s) => s.clicked).length;
  const ctr =
    Math.round((totalClicks / Math.max(1, totalViews)) * 1000) / 10;

  const totalTime = sessions.reduce(
    (acc, s) => acc + (s.durationSeconds || 0),
    0
  );
  const avgTimeSpentSeconds = Math.round(totalTime / Math.max(1, totalViews));

  const minutes = Math.floor(avgTimeSpentSeconds / 60);
  const seconds = avgTimeSpentSeconds % 60;
  const formattedAvgTime =
    minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return { totalViews, totalClicks, ctr, avgTimeSpentSeconds, formattedAvgTime };
}

/** Stats globales toutes pages confondues */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  let sessions: AnalyticsSession[] = [];

  try {
    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!error && data && data.length > 0) {
      sessions = data.map((d) => ({
        id: d.session_id || d.id,
        slug: d.product_slug || "unknown",
        durationSeconds: d.duration_seconds || 0,
        clicked: d.clicked || false,
        timestamp: d.created_at || new Date().toISOString(),
      }));
    }
  } catch {}

  // Fusion avec localStorage si Supabase vide
  if (sessions.length === 0) {
    sessions = getLocalSessions();
  }

  return computeStats(sessions);
}

/** Stats par slug produit */
export async function getAnalyticsStatsBySlug(
  slug: string
): Promise<AnalyticsStats> {
  let sessions: AnalyticsSession[] = [];

  try {
    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .eq("product_slug", slug)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!error && data && data.length > 0) {
      sessions = data.map((d) => ({
        id: d.session_id || d.id,
        slug: d.product_slug || slug,
        durationSeconds: d.duration_seconds || 0,
        clicked: d.clicked || false,
        timestamp: d.created_at || new Date().toISOString(),
      }));
    }
  } catch {}

  if (sessions.length === 0) {
    sessions = getLocalSessions().filter((s) => s.slug === slug);
  }

  return computeStats(sessions);
}

/** Stats par produit pour le dashboard admin */
export async function getAllProductsAnalytics(): Promise<
  ProductAnalyticsStats[]
> {
  let allSessions: AnalyticsSession[] = [];

  try {
    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!error && data && data.length > 0) {
      allSessions = data.map((d) => ({
        id: d.session_id || d.id,
        slug: d.product_slug || "unknown",
        durationSeconds: d.duration_seconds || 0,
        clicked: d.clicked || false,
        timestamp: d.created_at || new Date().toISOString(),
      }));
    }
  } catch {}

  if (allSessions.length === 0) {
    allSessions = getLocalSessions();
  }

  // Grouper par slug
  const bySlug: Record<string, AnalyticsSession[]> = {};
  for (const s of allSessions) {
    if (!bySlug[s.slug]) bySlug[s.slug] = [];
    bySlug[s.slug].push(s);
  }

  return Object.entries(bySlug).map(([slug, sessions]) => ({
    slug,
    ...computeStats(sessions),
  }));
}
