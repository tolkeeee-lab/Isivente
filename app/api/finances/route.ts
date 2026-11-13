import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("finances")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      // Si la table n'a pas encore été créée dans Supabase
      return NextResponse.json({
        success: true,
        hasTable: false,
        expenses: [],
        sales: [],
        message: "Table finances non trouvée dans Supabase. Le mode cache local est actif.",
      });
    }

    const expenses = (data || []).filter((item: any) => item.type === "expense");
    const sales = (data || []).filter((item: any) => item.type === "sale");

    return NextResponse.json({
      success: true,
      hasTable: true,
      expenses,
      sales,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      hasTable: false,
      expenses: [],
      sales: [],
      error: err?.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.item) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { type, item } = body;
    const supabase = getSupabase();

    const payload = {
      id: String(item.id),
      type: type === "sale" ? "sale" : "expense",
      date: item.date || new Date().toISOString().slice(0, 10),
      category: item.category || (type === "sale" ? "sale" : "other"),
      amount: Math.round(Number(item.amount) || 0),
      product_slug: item.product_slug || null,
      description: item.description || item.notes || null,
      order_number: item.order_number || null,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("finances")
      .upsert([payload], { onConflict: "id" })
      .select();

    if (error) {
      console.warn("Supabase finances insert/upsert warning (fallback local actif):", error.message);
      return NextResponse.json({
        success: true,
        hasTable: false,
        item: payload,
        warning: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      hasTable: true,
      item: data?.[0] || payload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const supabase = getSupabase();
    await supabase.from("finances").delete().eq("id", id);

    return NextResponse.json({ success: true, deleted: id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

