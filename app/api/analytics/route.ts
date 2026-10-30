import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

const BOT_UA_REGEX =
  /bot|crawler|spider|crawling|headless|lighthouse|facebookexternalhit|facebot|whatsapp|telegrambot|twitterbot|slackbot|discordbot|linkedinbot|embedly|quora|pinterest|outbrain|vkshare|w3c_validator|vercel|prerender|preview|curl|wget|python|node-fetch|axios/i;

function getSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://uelognqedzqtvupwzejh.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";
  return createServerClient(url, key, {
    cookies: {
      get() {
        return undefined;
      },
      set() {},
      remove() {},
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
      .select("session_id, product_slug, duration_seconds, clicked, created_at")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (slug) {
      query = query.eq("product_slug", slug);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, rows: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      rows: data || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur serveur", rows: [] },
      { status: 500 }
    );
  }
}

// ── POST : Enregistrement résilient d'une session visiteur humaine ──
export async function POST(req: NextRequest) {
  try {
    // 1. Exclure les robots, crawlers et administrateurs côté serveur
    const ua = req.headers.get("user-agent") || "";
    const cookieHeader = req.headers.get("cookie") || "";
    if (!ua || BOT_UA_REGEX.test(ua) || cookieHeader.includes("isivente_admin=true")) {
      return NextResponse.json({
        success: false,
        message: "Trafic robot ou admin ignoré",
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.session_id || !body.product_slug) {
      return NextResponse.json(
        { error: "Données de session incomplètes" },
        { status: 400 }
      );
    }

    const cleanSlug = String(body.product_slug).trim().toLowerCase();
    const cleanSessionId = String(body.session_id).slice(0, 100);

    if (
      cleanSlug.startsWith("admin") ||
      cleanSlug === "autre" ||
      cleanSlug === "admin" ||
      cleanSlug.includes("_exit_") ||
      cleanSessionId.startsWith("exit_")
    ) {
      return NextResponse.json({
        success: false,
        message: "Trafic non-produit ignoré",
      });
    }

    const supabase = getSupabase();
    const payload: Record<string, any> = {
      session_id: cleanSessionId,
      product_slug: cleanSlug.slice(0, 80),
      duration_seconds: Math.max(
        0,
        Math.min(1800, Math.round(Number(body.duration_seconds) || 0))
      ),
      clicked: Boolean(body.clicked),
    };

    if (body.created_at) {
      payload.created_at = body.created_at;
    }

    const { error } = await supabase
      .from("analytics")
      .upsert([payload], { onConflict: "session_id" });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
