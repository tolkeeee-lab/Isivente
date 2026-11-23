import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedTenant } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedTenant(req);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.error, hasTable: true, expenses: [], sales: [], startingCapital: 0 },
        { status: auth.status }
      );
    }

    if (!auth.isFounder && !auth.storeId) {
      return NextResponse.json({
        success: true,
        hasTable: true,
        expenses: [],
        sales: [],
        startingCapital: 0,
      });
    }

    const supabase = auth.authedClient;
    let query = supabase
      .from("finances")
      .select("*")
      .order("date", { ascending: false });

    if (!auth.isFounder && auth.storeId) {
      query = query.eq("store_id", auth.storeId);
    }

    const { data, error } = await query;

    if (error) {
      // Si la table n'a pas encore été créée dans Supabase
      return NextResponse.json({
        success: true,
        hasTable: false,
        expenses: [],
        sales: [],
        startingCapital: null,
        message: "Table finances non trouvée dans Supabase. Le mode cache local est actif.",
      });
    }

    const expenses = (data || []).filter((item: any) => item.type === "expense");
    const sales = (data || []).filter((item: any) => item.type === "sale");
    const capitalRow = (data || []).find((item: any) => item.id === "capital_initial" || item.type === "capital");

    return NextResponse.json({
      success: true,
      hasTable: true,
      expenses,
      sales,
      startingCapital: capitalRow ? Number(capitalRow.amount) || 0 : null,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      hasTable: false,
      expenses: [],
      sales: [],
      startingCapital: null,
      error: err?.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedTenant(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (!auth.isFounder && !auth.storeId) {
      return NextResponse.json({ error: "Boutique introuvable" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.item) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { type, item } = body;
    const supabase = auth.authedClient;

    const normalizedType = type === "sale" ? "sale" : type === "capital" ? "capital" : "expense";
    const storeId = auth.isFounder ? null : auth.storeId;
    const payload = {
      id:
        normalizedType === "capital"
          ? storeId
            ? `capital_${storeId}`
            : "capital_initial"
          : String(item.id),
      ...(storeId ? { store_id: storeId } : {}),
      type: normalizedType,
      date: item.date || new Date().toISOString().slice(0, 10),
      category: item.category || (normalizedType === "sale" ? "sale" : normalizedType === "capital" ? "capital" : "other"),
      amount: Math.round(Number(item.amount) || 0),
      product_slug: item.product_slug || null,
      product_title: item.product_title || null,
      quantity: Math.max(1, Number(item.quantity) || 1),
      customer_name: item.customer_name || null,
      city: item.city || null,
      notes: item.notes || null,
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
    const auth = await requireAuthenticatedTenant(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (!auth.isFounder && !auth.storeId) {
      return NextResponse.json({ error: "Boutique introuvable" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const supabase = auth.authedClient;
    let delQuery = supabase.from("finances").delete().eq("id", id);
    if (!auth.isFounder && auth.storeId) {
      delQuery = delQuery.eq("store_id", auth.storeId);
    }
    await delQuery;

    return NextResponse.json({ success: true, deleted: id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

