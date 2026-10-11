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

export function trackUserSession(
  slug: string,
  duration_seconds: number,
  clicked_order: boolean,
  session_id: string
) {
  try {
    if (typeof window === 'undefined') return;

    // Protection absolue : Ne JAMAIS comptabiliser les pages admin ni les administrateurs
    if (
      window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/api') ||
      localStorage.getItem("isivente_is_admin") === "true" ||
      sessionStorage.getItem("isivente_is_admin") === "true" ||
      document.cookie.includes("isivente_admin=true")
    ) {
      return;
    }

    // Uniquement pour les vraies landing pages de produits (exclure tout slug admin ou invalide)
    const cleanSlug = slug?.trim();
    if (!cleanSlug || cleanSlug.startsWith('admin') || cleanSlug === 'autre' || cleanSlug === 'admin') {
      return;
    }

    const payload = {
      product_slug: cleanSlug,
      duration_seconds,
      clicked: clicked_order,
      session_id,
      created_at: new Date().toISOString(),
    };
    Promise.resolve(
      supabase
        .from('analytics')
        .upsert([payload], { onConflict: 'session_id' })
    ).catch(() => {});
  } catch {}
}

export async function getAnalyticsStats(slug?: string): Promise<AnalyticsStats> {
  try {
    let query = supabase
      .from('analytics')
      .select('product_slug, duration_seconds, clicked, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (slug) {
      query = query.eq('product_slug', slug);
    }
    const { data, error } = await query;
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

    // Filtrage anti-parasite : exclure formellement toute entrée admin ou slug invalide
    const validData = data.filter((d: any) => {
      const s = d.product_slug;
      return s && !s.startsWith('admin') && s !== 'admin' && s !== 'autre';
    });

    const startOfToday = getStartOfTodayIso();
    const totalViews = validData.length;
    const todayRows = validData.filter((d: any) => d.created_at && d.created_at >= startOfToday);
    const todayViews = todayRows.length;
    const totalClicks = validData.filter((d: any) => d.clicked).length;
    const todayClicks = todayRows.filter((d: any) => d.clicked).length;
    const totalDuration = validData.reduce((acc: number, d: any) => acc + (d.duration_seconds || 0), 0);
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
    const { data, error } = await supabase
      .from('analytics')
      .select('product_slug, duration_seconds, clicked, created_at')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (error || !data || data.length === 0) {
      return [];
    }

    const startOfToday = getStartOfTodayIso();
    const bySlug: Record<string, { views: number; todayViews: number; clicks: number; todayClicks: number; duration: number }> = {};
    
    data.forEach((d: any) => {
      const slug = d.product_slug;
      // Exclure formellement l'admin et les slugs vides
      if (!slug || slug.startsWith('admin') || slug === 'autre' || slug === 'admin') {
        return;
      }
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
      bySlug[slug].duration += d.duration_seconds || 0;
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
