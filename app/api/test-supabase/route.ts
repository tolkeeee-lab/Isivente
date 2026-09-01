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

  // Exact schema: order_number, customer_name, customer_phone, city, shipping_address, total_amount, product_slug, product_title, quantity, status
  const testOrder = {
    order_number: "CMD-" + randomNum,
    customer_name: "Test Client Supabase",
    customer_phone: "97000000",
    city: "Cotonou",
    shipping_city: "Cotonou",
    shipping_address: "Haie Vive",
    total_amount: 14900,
    product_slug: "umei",
    product_title: "Brosse Démêlante Vapeur Uméi 3-en-1",
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
