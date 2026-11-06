import { supabase } from './supabase';

export interface UserSession {
  slug: string;
  duration_seconds: number;
  clicked_order: boolean;
  session_id: string;
}

export interface AnalyticsStats {
  totalViews: number;
  todayViews: number;
  totalClicks: number;
  todayClicks: number;
  ctr: number;
  avgTimeSpentSeconds: number;
  formattedAvgTime: string;
}

export interface ProductAnalyticsStats {
  slug: string;
  totalViews: number;
  todayViews: number;
  totalClicks: number;
  todayClicks: number;
  ctr: number;
  avgTimeSpentSeconds: number;
  formattedAvgTime: string;
}

export const BOT_UA_REGEX =
  /bot|crawler|spider|crawling|headless|lighthouse|facebookexternalhit|facebot|whatsapp|telegrambot|twitterbot|slackbot|discordbot|linkedinbot|embedly|quora|pinterest|outbrain|vkshare|w3c_validator|vercel|prerender|preview|curl|wget|python|node-fetch|axios/i;

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function getStartOfTodayIso(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function isValidAnalyticsRow(d: any): boolean {
  const s = d?.product_slug;
  if (!s || typeof s !== 'string') return false;
  if (
    s.startsWith('admin') ||
    s === 'admin' ||
    s === 'autre' ||
    s.includes('_exit_')
  ) {
    return false;
  }
  if (d?.session_id && String(d.session_id).startsWith('exit_')) {
    return false;
  }
  return true;
}

/**
 * Déduplique strictement les lignes d'analytics par session unique (session_id).
 * Chaque session_id correspond à un visiteur unique (verrouillé sur 6h par produit).
 * Fusionne les pulsations d'une même session sans jamais écraser deux visiteurs distincts.
 */
function deduplicateAnalyticsRows(rows: any[]): any[] {
  const valid = rows.filter(isValidAnalyticsRow);
  const bySessionId = new Map<string, any>();

  for (const row of valid) {
    const sId = String(row.session_id || "").trim();
    if (!sId) continue;

    const existing = bySessionId.get(sId);
    if (existing) {
      existing.clicked = Boolean(existing.clicked || row.clicked);
      existing.duration_seconds = Math.max(
        Number(existing.duration_seconds) || 0,
        Number(row.duration_seconds) || 0
      );
      if (!existing.created_at || (row.created_at && row.created_at < existing.created_at)) {
        existing.created_at = row.created_at;
      }
    } else {
      bySessionId.set(sId, {
        ...row,
        product_slug: String(row.product_slug).trim().toLowerCase(),
      });
    }
  }

  return Array.from(bySessionId.values());
}

export function trackUserSession(
  slug: string,
  duration_seconds: number,
  clicked_order: boolean,
  session_id: string,
  initial_created_at?: string
) {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    // 1. Protection anti-robot et anti-admin
    if (
      navigator.webdriver ||
      BOT_UA_REGEX.test(navigator.userAgent || '') ||
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/api') ||
      localStorage.getItem("isivente_is_admin") === "true" ||
      sessionStorage.getItem("isivente_is_admin") === "true" ||
      document.cookie.includes("isivente_admin=true")
    ) {
      return;
    }

    // 2. Uniquement pour les vraies landing pages de produits
    const cleanSlug = slug?.trim().toLowerCase();
    if (
      !cleanSlug ||
      cleanSlug.startsWith('admin') ||
      cleanSlug === 'autre' ||
      cleanSlug === 'admin' ||
      cleanSlug.includes('_exit_')
    ) {
      return;
    }

    const safeDuration = Math.max(0, Math.min(1800, Math.round(Number(duration_seconds) || 0)));

    const payload: Record<string, any> = {
      product_slug: cleanSlug,
      duration_seconds: safeDuration,
      clicked: Boolean(clicked_order),
      session_id,
    };

    if (initial_created_at) {
      payload.created_at = initial_created_at;
    }

    // Enregistrement unique via l'API serveur (et fallback direct Supabase uniquement en cas d'erreur réseau)
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      Promise.resolve(
        supabase
          .from('analytics')
          .upsert([payload], { onConflict: 'session_id' })
      ).catch(() => {});
    });
  } catch {}
}

/**
 * Marque immédiatement la session courante du visiteur comme ayant cliqué (Intention de commande)
 * Utilisé dès qu'un visiteur interagit avec le formulaire, sélectionne une formule ou soumet une commande.
 */
export function markCurrentSessionClicked(slug: string) {
  try {
    if (typeof window === "undefined") return;
    const cleanSlug = slug.trim().toLowerCase();
    const storageKey = `isivente_visit_session_${cleanSlug}`;
    const raw = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sessionId) {
        parsed.alreadyClicked = true;
        const serialized = JSON.stringify(parsed);
        localStorage.setItem(storageKey, serialized);
        sessionStorage.setItem(storageKey, serialized);

        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: parsed.sessionId,
            product_slug: cleanSlug,
            clicked: true,
            duration_seconds: Math.max(1, Number(parsed.accumulatedSeconds) || 5),
          }),
          keepalive: true,
        }).catch(() => {});
      }
    }
  } catch {}
}

/**
 * Récupère l'intégralité des sessions d'analytics depuis Supabase avec pagination par page de 1000.
 * Résout la limitation par défaut de PostgREST qui plafonne chaque requête brute à 1000 lignes.
 */
async function fetchAllAnalyticsRows(slug?: string): Promise<{ data: any[] | null; error: any }> {
  try {
    const pageSize = 1000;
    let allRows: any[] = [];
    let from = 0;

    while (true) {
      let query = supabase
        .from('analytics')
        .select('session_id, product_slug, duration_seconds, clicked, created_at')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (slug) {
        query = query.eq('product_slug', slug);
      }

      const res = await query;
      if (res.error) {
        if (allRows.length > 0) return { data: allRows, error: null };
        return { data: null, error: res.error };
      }

      const chunk = res.data || [];
      allRows.push(...chunk);
      if (chunk.length < pageSize) break;
      from += pageSize;
      if (from >= 50000) break; // Sécurité anti-boucle
    }

    return { data: allRows, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function getAnalyticsStats(slug?: string): Promise<AnalyticsStats> {
  try {
    let { data, error } = await fetchAllAnalyticsRows(slug);

    if ((error || !data || data.length === 0) && typeof window !== 'undefined') {
      try {
        const url = slug ? `/api/analytics?slug=${encodeURIComponent(slug)}` : '/api/analytics';
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.rows) && json.rows.length > 0) {
            data = json.rows;
            error = null;
          }
        }
      } catch {}
    }

    if (error || !data || data.length === 0) {
      return {
        totalViews: 0,
        todayViews: 0,
        totalClicks: 0,
        todayClicks: 0,
        ctr: 0,
        avgTimeSpentSeconds: 0,
        formattedAvgTime: "—",
      };
    }

    const validData = deduplicateAnalyticsRows(data);

    const startOfToday = getStartOfTodayIso();
    const totalViews = validData.length;
    const todayRows = validData.filter((d: any) => d.created_at && d.created_at >= startOfToday);
    const todayViews = todayRows.length;
    const totalClicks = validData.filter((d: any) => d.clicked).length;
    const todayClicks = todayRows.filter((d: any) => d.clicked).length;
    const totalDuration = validData.reduce(
      (acc: number, d: any) => acc + Math.min(1800, Math.max(0, Number(d.duration_seconds) || 0)),
      0
    );
    const avgTimeSpentSeconds = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;
    const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;

    return {
      totalViews,
      todayViews,
      totalClicks,
      todayClicks,
      ctr,
      avgTimeSpentSeconds,
      formattedAvgTime: formatDuration(avgTimeSpentSeconds),
    };
  } catch (err) {
    console.error('Error fetching analytics stats:', err);
    return {
      totalViews: 0,
      todayViews: 0,
      totalClicks: 0,
      todayClicks: 0,
      ctr: 0,
      avgTimeSpentSeconds: 0,
      formattedAvgTime: "—",
    };
  }
}

export async function getAllProductsAnalytics(): Promise<ProductAnalyticsStats[]> {
  try {
    let { data, error } = await fetchAllAnalyticsRows();

    if ((error || !data || data.length === 0) && typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/analytics', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.rows)) {
            data = json.rows;
            error = null;
          }
        }
      } catch {}
    }

    if (error || !data || data.length === 0) {
      return [];
    }

    const dedupedData = deduplicateAnalyticsRows(data);
    const startOfToday = getStartOfTodayIso();
    const bySlug: Record<string, { views: number; todayViews: number; clicks: number; todayClicks: number; duration: number }> = {};

    dedupedData.forEach((d: any) => {
      const slug = d.product_slug;
      if (!bySlug[slug]) {
        bySlug[slug] = { views: 0, todayViews: 0, clicks: 0, todayClicks: 0, duration: 0 };
      }
      bySlug[slug].views += 1;
      const isToday = d.created_at && d.created_at >= startOfToday;
      if (isToday) bySlug[slug].todayViews += 1;
      if (d.clicked) {
        bySlug[slug].clicks += 1;
        if (isToday) bySlug[slug].todayClicks += 1;
      }
      bySlug[slug].duration += Math.min(1800, Math.max(0, Number(d.duration_seconds) || 0));
    });

    return Object.entries(bySlug).map(([slug, stat]) => {
      const avg = stat.views > 0 ? Math.round(stat.duration / stat.views) : 0;
      const ctr = stat.views > 0 ? Math.round((stat.clicks / stat.views) * 1000) / 10 : 0;
      return {
        slug,
        totalViews: stat.views,
        todayViews: stat.todayViews,
        totalClicks: stat.clicks,
        todayClicks: stat.todayClicks,
        ctr,
        avgTimeSpentSeconds: avg,
        formattedAvgTime: formatDuration(avg),
      };
    });
  } catch (err) {
    console.error('Error fetching all products analytics:', err);
    return [];
  }
}

export async function resetAnalyticsStats(): Promise<void> {
  try {
    await supabase.from('analytics').delete().neq('session_id', 'preserve_none');
  } catch (err) {
    console.error('Error resetting analytics stats:', err);
  }
}

export async function getAnalyticsSummary(slug?: string) {
  const stats = await getAnalyticsStats(slug);
  return {
    total_views: stats.totalViews,
    total_clicks: stats.totalClicks,
    ctr: stats.ctr,
    avg_duration: stats.avgTimeSpentSeconds,
  };
}
