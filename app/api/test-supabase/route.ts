import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

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

  // Test insert with all standard column aliases to satisfy any schema variant
  const testOrder = {
    order_number: "CMD-" + randomNum,
    customer_name: "Test Client Supabase",
    name: "Test Client Supabase",
    customer_phone: "97000000",
    phone: "97000000",
    shipping_city: "Cotonou",
    city: "Cotonou",
    shipping_address: "Haie Vive",
    address: "Haie Vive",
    product_slug: "umei",
    product_title: "Brosse Démêlante Vapeur Uméi 3-en-1",
    total_amount: 14900,
    amount: 14900,
    quantity: 1,
    status: "pending",
    created_at: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase
    .from("orders")
    .insert([testOrder])
    .select();

  return NextResponse.json({
    insert_test: {
      success: !insertError,
      error: insertError ? insertError : null,
      data: insertData
    }
  });
}
