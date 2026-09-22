import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendAbandonedLeadNotification } from "@/lib/notifyHelper";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, key, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });
}

// ── GET : Récupérer tous les prospects ──
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (error) {
      return NextResponse.json({ success: true, leads: [] });
    }

    return NextResponse.json({ success: true, leads: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: true, leads: [] });
  }
}

// ── POST : Capture automatique silencieuse dès 8 chiffres ──
export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    const cleanPhone = (customer_phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      return NextResponse.json({ error: "Numéro de téléphone incomplet" }, { status: 400 });
    }

    const supabase = getSupabase();
    const leadId = `lead_${cleanPhone}_${product_slug || "product"}`;
    const now = new Date().toISOString();

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

    const payload = {
      id: leadId,
      customer_name: (customer_name || "").trim() || "Client intéressé",
      customer_phone: cleanPhone,
      customer_phone2: customer_phone2?.trim() || "",
      city: city?.trim() || "Cotonou",
      address: address?.trim() || "",
      product_slug: product_slug || "microscope",
      product_title: product_title || "Produit Isivente",
      bundle_name: bundle_name || "Formule standard",
      total_amount: Number(total_amount) || 0,
      status: currentStatus,
      created_at: createdAt,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("leads")
      .upsert([payload], { onConflict: "id" })
      .select();

    // Si c'est un nouveau prospect détecté, envoyer l'alerte email immédiatement
    if (!existing && currentStatus === "abandoned") {
      sendAbandonedLeadNotification(payload).catch((err) =>
        console.error("Lead notification error:", err)
      );
    }

    return NextResponse.json({ success: true, lead: data?.[0] || payload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// ── PATCH : Mise à jour du statut (ex: 'contacted', 'converted') ──
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

// ── DELETE : Supprimer un prospect ──
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const supabase = getSupabase();
    await supabase.from("leads").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
