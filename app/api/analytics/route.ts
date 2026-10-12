import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uelognqedzqtvupwzejh.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";
  return createServerClient(url, key, {
    cookies: {
      get() { return undefined; },
      set() { },
      remove() { },
    },
  });
}

// ── GET : Récupérer les sessions ou statistiques réelles ──
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    let query = supabase
      .from("analytics")
      .select("product_slug, duration_seconds, clicked, created_at")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (slug) {
      query = query.eq("product_slug", slug);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message, rows: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0, rows: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Erreur serveur", rows: [] }, { status: 500 });
  }
}

// ── POST : Enregistrement résilient d'une session visiteur (contourne les adblockers côté client) ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.session_id || !body.product_slug) {
      return NextResponse.json({ error: "Données de session incomplètes" }, { status: 400 });
    }

    const cleanSlug = String(body.product_slug).trim().toLowerCase();
    if (cleanSlug.startsWith("admin") || cleanSlug === "autre" || cleanSlug === "admin") {
      return NextResponse.json({ success: false, message: "Trafic admin ignoré" });
    }

    const supabase = getSupabase();
    const payload = {
      session_id: String(body.session_id).slice(0, 100),
      product_slug: cleanSlug.slice(0, 80),
      duration_seconds: Math.max(0, Math.min(86400, Number(body.duration_seconds) || 0)),
      clicked: Boolean(body.clicked),
      created_at: body.created_at || new Date().toISOString(),
    };

    const { error } = await supabase.from("analytics").upsert([payload], { onConflict: "session_id" });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Erreur serveur" }, { status: 500 });
  }
}
