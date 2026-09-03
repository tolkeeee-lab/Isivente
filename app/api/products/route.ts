import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uelognqedzqtvupwzejh.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";

  return createServerClient(url, key, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });
}

// GET ALL PRODUCTS VIA API DIRECTE
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, products: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST / UPSERT PRODUCT DIRECT
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .upsert([body], { onConflict: "slug" })
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE PRODUCT DIRECT
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const id = url.searchParams.get("id");

    if (!slug && !id) {
      return NextResponse.json({ success: false, error: "Slug ou ID requis" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    let query = supabase.from("products").delete();
    if (slug) query = query.eq("slug", slug);
    if (id) query = query.eq("id", id);

    const { error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Produit supprimé avec succès" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
