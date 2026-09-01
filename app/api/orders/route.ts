import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Cache mémoire serveur global
declare global {
  var _serverOrdersStore: any[] | undefined;
}

if (!global._serverOrdersStore) {
  global._serverOrdersStore = [];
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && url !== "YOUR_SUPABASE_URL" && !url.includes("placeholder")) {
    return createServerClient(url, key, {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    });
  }
  return null;
}

// 1. GET ALL ORDERS
export async function GET() {
  const supabase = getSupabaseClient();
  let dbOrders: any[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        dbOrders = data;
      }
    } catch (err) {
      console.error("Supabase GET error:", err);
    }
  }

  // Fusionner les commandes Supabase et la mémoire serveur
  const map = new Map<string, any>();
  dbOrders.forEach((o) => map.set(o.id, o));
  (global._serverOrdersStore || []).forEach((o) => {
    if (!map.has(o.id)) map.set(o.id, o);
  });

  const orders = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json({
    success: true,
    orders,
    supabaseConnected: !!supabase,
  });
}

// 2. CREATE NEW ORDER
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder = {
      id: "ord_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      product_slug: body.product_slug || "umei",
      product_title: body.product_title || "Brosse Démêlante Vapeur Uméi 3-en-1",
      bundle_id: body.bundle_id || "solo",
      quantity: Number(body.quantity) || 1,
      total_amount: Number(body.total_amount) || 14900,
      customer_name: body.customer_name || "Client",
      customer_phone: body.customer_phone || "",
      shipping_city: body.shipping_city || "",
      shipping_address: body.shipping_address || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // Stockage mémoire serveur
    if (!global._serverOrdersStore) global._serverOrdersStore = [];
    global._serverOrdersStore.unshift(newOrder);

    // Stockage Supabase si connecté
    const supabase = getSupabaseClient();
    let supabaseSaved = false;

    if (supabase) {
      try {
        const { error } = await supabase.from("orders").insert([newOrder]);
        if (!error) supabaseSaved = true;
      } catch (err) {
        console.error("Supabase POST error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      supabaseSaved,
      message: "Commande enregistrée avec succès",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// 3. UPDATE ORDER STATUS
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID et statut requis" }, { status: 400 });
    }

    // Mise à jour mémoire serveur
    if (global._serverOrdersStore) {
      global._serverOrdersStore = global._serverOrdersStore.map((o) =>
        o.id === id ? { ...o, status } : o
      );
    }

    // Mise à jour Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("orders").update({ status }).eq("id", id);
      } catch (err) {
        console.error("Supabase PATCH error:", err);
      }
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
