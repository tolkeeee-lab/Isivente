import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "Missing env vars" });
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });

  // 1. Try to test connection and select
  const { data: selectData, error: selectError } = await supabase
    .from("orders")
    .select("*")
    .limit(1);

  // 2. Try test insert
  const testOrder = {
    id: "test_" + Date.now(),
    product_slug: "umei",
    product_title: "Test Uméi",
    bundle_id: "solo",
    quantity: 1,
    total_amount: 14900,
    customer_name: "Test Diagnostic",
    customer_phone: "97000000",
    shipping_city: "Cotonou",
    shipping_address: "Haie Vive",
    status: "pending",
    created_at: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase
    .from("orders")
    .insert([testOrder])
    .select();

  return NextResponse.json({
    connection: {
      url: url.substring(0, 25) + "...",
      key_present: !!key,
    },
    select_test: {
      success: !selectError,
      error: selectError ? {
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint,
        code: selectError.code
      } : null,
      data: selectData
    },
    insert_test: {
      success: !insertError,
      error: insertError ? {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      } : null,
      data: insertData
    }
  });
}
