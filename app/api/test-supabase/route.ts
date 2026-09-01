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

  // Try minimal insert to see what works
  const minimalOrder = {
    customer_name: "Test Minimal",
    customer_phone: "97000000",
    shipping_city: "Cotonou",
    shipping_address: "Haie Vive",
    total_amount: 14900,
    status: "pending"
  };

  const { data: minData, error: minError } = await supabase
    .from("orders")
    .insert([minimalOrder])
    .select();

  return NextResponse.json({
    minimal_insert: {
      success: !minError,
      error: minError ? minError.message : null,
      data: minData
    }
  });
}
