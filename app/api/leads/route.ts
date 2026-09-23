import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendAbandonedLeadNotification } from "@/lib/notifyHelper";

export const dynamic = "force-dynamic";

const ALLOWED_LEAD_STATUSES = new Set(["abandoned", "contacted", "converted"]);

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

// ── GET : Récupérer tous les prospects (limité à 1000) ──
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Leads GET error:", error?.message);
      return NextResponse.json({ success: true, leads: [] });
    }

    return NextResponse.json({ success: true, leads: data || [] });
  } catch (err: any) {
    console.error("Leads GET catch:", err?.message);
    return NextResponse.json({ success: true, leads: [] });
  }
}

// ── POST : Capture automatique silencieuse dès 8 chiffres ──
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Données de prospect invalides" }, { status: 400 });
    }

    const {
      customer_name,
      customer_phone,
      customer_phone2,
      city,
      address,
      product_slug,
      product_title,
      bundle_name,
      total_amount,
      action,
    } = body;

    const cleanPhone = String(customer_phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 8 || cleanPhone.length > 15) {
      return NextResponse.json({ error: "Numéro de téléphone incomplet (8 à 15 chiffres requis)" }, { status: 400 });
    }

    // Assainissement du slug pour éviter toute injection dans l'ID
    const rawSlug = String(product_slug || "microscope").trim();
    const cleanSlug = /^[a-zA-Z0-9_\-]+$/.test(rawSlug) ? rawSlug.slice(0, 50) : "microscope";
    const leadId = `lead_${cleanPhone}_${cleanSlug}`;
    const now = new Date().toISOString();

    const supabase = getSupabase();

    // Si action est 'convert', marquer comme commande validée
    if (action === "convert") {
      await supabase
        .from("leads")
        .update({ status: "converted", updated_at: now })
        .eq("id", leadId);
      return NextResponse.json({ success: true, converted: true });
    }

    // Capture standard : si le lead existe déjà et est déjà "converted", ne pas écraser son statut
    const { data: existing } = await supabase
      .from("leads")
      .select("status, created_at")
      .eq("id", leadId)
      .maybeSingle();

    const currentStatus = existing?.status === "converted" ? "converted" : "abandoned";
    const createdAt = existing?.created_at || now;

    const safeName = String(customer_name || "").trim().slice(0, 100).replace(/[<>]/g, "") || "Client intéressé";
    const safePhone2 = String(customer_phone2 || "").trim().slice(0, 20).replace(/[<>]/g, "");
    const safeCity = String(city || "Cotonou").trim().slice(0, 100).replace(/[<>]/g, "");
    const safeAddress = String(address || "").trim().slice(0, 250).replace(/[<>]/g, "");
    const safeTitle = String(product_title || "Produit Isivente").trim().slice(0, 150).replace(/[<>]/g, "");
    const safeBundle = String(bundle_name || "Formule standard").trim().slice(0, 150).replace(/[<>]/g, "");
    const safeAmount = !isNaN(Number(total_amount)) && Number(total_amount) >= 0 ? Math.round(Number(total_amount)) : 0;

    const payload = {
      id: leadId,
      customer_name: safeName,
      customer_phone: cleanPhone,
      customer_phone2: safePhone2,
      city: safeCity,
      address: safeAddress,
      product_slug: cleanSlug,
      product_title: safeTitle,
      bundle_name: safeBundle,
      total_amount: safeAmount,
      status: currentStatus,
      created_at: createdAt,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("leads")
      .upsert([payload], { onConflict: "id" })
      .select();

    if (error) {
      console.warn("Supabase lead upsert warning:", error?.message);
    }

    // Si c'est un nouveau prospect détecté, envoyer l'alerte email immédiatement
    if (!existing && currentStatus === "abandoned") {
      sendAbandonedLeadNotification(payload).catch((err) =>
        console.error("Lead notification error:", err?.message)
      );
    }

    return NextResponse.json({ success: true, lead: data?.[0] || payload });
  } catch (err: any) {
    console.error("Leads POST catch:", err?.message);
    return NextResponse.json({ success: false, error: "Erreur serveur lors de la capture" }, { status: 500 });
  }
}

// ── PATCH : Mise à jour du statut (ex: 'contacted', 'converted') ──
export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const { id, status } = body;
    const safeId = String(id || "").trim();
    const safeStatus = String(status || "").trim();

    if (!safeId || !safeStatus || !ALLOWED_LEAD_STATUSES.has(safeStatus)) {
      return NextResponse.json({ error: "ID ou statut de prospect invalide" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("leads")
      .update({ status: safeStatus, updated_at: new Date().toISOString() })
      .eq("id", safeId);

    if (error) {
      console.error("Leads PATCH error:", error?.message);
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Leads PATCH catch:", err?.message);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// ── DELETE : Supprimer un prospect ──
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id || !/^[a-zA-Z0-9_\-]+$/.test(id)) {
      return NextResponse.json({ error: "ID de prospect invalide" }, { status: 400 });
    }

    const supabase = getSupabase();
    await supabase.from("leads").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Leads DELETE catch:", err?.message);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
