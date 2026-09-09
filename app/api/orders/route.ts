import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendOrderNotification } from "@/lib/notifyHelper";

const defaultUrl = "https://uelognqedzqtvupwzejh.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;

  return createServerClient(url, key, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });
}

// 1. GET ALL ORDERS DIRECTEMENT DEPUIS SUPABASE
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ success: false, error: error.message, orders: [] }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
      count: data ? data.length : 0,
    });
  } catch (err: any) {
    console.error("Orders GET route error:", err);
    return NextResponse.json({ success: false, error: err.message, orders: [] }, { status: 500 });
  }
}

// 2. CREATE NEW ORDER (INSERTION SUPABASE GARANTIE)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseClient();

    const orderNumberStr = body.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
    const name = body.customer_name || body.name || "Client";
    const phone = body.customer_phone || body.phone || "";
    const city = body.city || body.shipping_city || "Cotonou";
    const address = body.address || body.shipping_address || "";
    const totalAmount = Number(body.total_amount) || 14900;
    const quantity = Number(body.quantity) || 1;
    const status = body.status || "pending";
    const createdAt = body.created_at || new Date().toISOString();

    const payload: Record<string, any> = {
      order_number: orderNumberStr,
      customer_name: name,
      customer_phone: phone,
      city: city,
      address: address,
      product_slug: body.product_slug || "umei",
      product_title: body.product_title || "Produit Isivente",
      bundle_name: body.bundle_name || "Offre standard",
      total_amount: totalAmount,
      quantity: quantity,
      status: status,
      created_at: createdAt,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Déclencher l'alerte email & mobile immédiatement de manière attendue (AWAITED)
    try {
      await sendOrderNotification(data?.[0] || payload);
    } catch (e) {
      console.error("Server notify error:", e);
    }

    return NextResponse.json({
      success: true,
      order: data?.[0] || payload,
      message: "Commande enregistrée dans Supabase avec succès",
    });
  } catch (error: any) {
    console.error("Orders POST error:", error);
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

    const supabase = getSupabaseClient();
    const isUuid = id.includes("-") && id.length > 30;

    let query = supabase.from("orders").update({ status });
    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.eq("order_number", id);
    }

    const { error } = await query;
    if (error) {
      console.error("Supabase PATCH error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 4. DELETE ORDER
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const clearAll = url.searchParams.get("clearAll");
    const supabase = getSupabaseClient();

    if (clearAll === "true") {
      await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      return NextResponse.json({ success: true, message: "Toutes les commandes ont été supprimées" });
    }

    if (id) {
      const isUuid = id.includes("-") && id.length > 30;
      if (isUuid) {
        await supabase.from("orders").delete().eq("id", id);
      } else {
        await supabase.from("orders").delete().eq("order_number", id);
      }
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ success: false, error: "ID ou clearAll requis" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
