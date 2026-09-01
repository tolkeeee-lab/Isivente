import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(url, key, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });

  const randomNum = Math.floor(100000 + Math.random() * 900000);

  // Test insert with order_number
  const testOrder = {
    order_number: "CMD-" + randomNum,
    customer_name: "Test Validation",
    customer_phone: "97000000",
    shipping_city: "Cotonou",
    shipping_address: "Haie Vive",
    total_amount: 14900,
    status: "pending",
    created_at: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase
    .from("orders")
    .insert([testOrder])
    .select();

  return NextResponse.json({
    insert_with_order_number: {
      success: !insertError,
      error: insertError ? insertError : null,
      data: insertData
    }
  });
}
