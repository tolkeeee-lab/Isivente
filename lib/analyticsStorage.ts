import { supabase } from './supabase';

export interface UserSession {
  slug: string;
  duration_seconds: number;
  clicked_order: boolean;
  session_id: string;
}

export interface AnalyticsStats {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  avgTimeSpentSeconds: number;
  formattedAvgTime: string;
}

export interface ProductAnalyticsStats {
  slug: string;
  totalViews: number;
  totalClicks: number;
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

export function trackUserSession(
  slug: string,
  duration_seconds: number,
  clicked_order: boolean,
  session_id: string
) {
  try {
    if (typeof window === 'undefined') return;
    const payload = {
      product_slug: slug,
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
    let query = supabase.from('analytics').select('duration_seconds, clicked');
    if (slug) {
      query = query.eq('product_slug', slug);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return {
        totalViews: 0,
        totalClicks: 0,
        ctr: 0,
        avgTimeSpentSeconds: 0,
        formattedAvgTime: "—",
      };
    }

    const totalViews = data.length;
    const totalClicks = data.filter((d: any) => d.clicked).length;
    const totalDuration = data.reduce((acc: number, d: any) => acc + (d.duration_seconds || 0), 0);
    const avgTimeSpentSeconds = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;
    const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;

    return {
      totalViews,
      totalClicks,
      ctr,
      avgTimeSpentSeconds,
      formattedAvgTime: formatDuration(avgTimeSpentSeconds),
    };
  } catch (err) {
    console.error('Error fetching analytics stats:', err);
    return {
      totalViews: 0,
      totalClicks: 0,
      ctr: 0,
      avgTimeSpentSeconds: 0,
      formattedAvgTime: "—",
    };
  }
}

export async function getAllProductsAnalytics(): Promise<ProductAnalyticsStats[]> {
  try {
    const { data, error } = await supabase.from('analytics').select('product_slug, duration_seconds, clicked');
    if (error || !data || data.length === 0) {
      return [];
    }

    const bySlug: Record<string, { views: number; clicks: number; duration: number }> = {};
    data.forEach((d: any) => {
      const slug = d.product_slug || 'autre';
      if (!bySlug[slug]) {
        bySlug[slug] = { views: 0, clicks: 0, duration: 0 };
      }
      bySlug[slug].views += 1;
      if (d.clicked) bySlug[slug].clicks += 1;
      bySlug[slug].duration += d.duration_seconds || 0;
    });

    return Object.entries(bySlug).map(([slug, stat]) => {
      const avg = stat.views > 0 ? Math.round(stat.duration / stat.views) : 0;
      const ctr = stat.views > 0 ? Math.round((stat.clicks / stat.views) * 1000) / 10 : 0;
      return {
        slug,
        totalViews: stat.views,
        totalClicks: stat.clicks,
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
