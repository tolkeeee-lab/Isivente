import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "YOUR_SUPABASE_URL") {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  // Use service role key if available, otherwise anon key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || key;

  const supabase = createServerClient(url, serviceKey, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });

  // Create the orders table via RPC or raw SQL
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        product_slug TEXT,
        product_title TEXT,
        bundle_id TEXT,
        quantity INTEGER DEFAULT 1,
        total_amount INTEGER DEFAULT 0,
        customer_name TEXT,
        customer_phone TEXT,
        shipping_city TEXT,
        shipping_address TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public insert" ON orders;
      CREATE POLICY "Allow public insert" ON orders FOR INSERT WITH CHECK (true);
      DROP POLICY IF EXISTS "Allow public select" ON orders;
      CREATE POLICY "Allow public select" ON orders FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Allow public update" ON orders;
      CREATE POLICY "Allow public update" ON orders FOR UPDATE USING (true);
    `
  });

  if (error) {
    // RPC might not exist, return the SQL for manual execution
    return NextResponse.json({
      message: "La fonction RPC n'existe pas. Exécutez ce SQL manuellement dans Supabase SQL Editor :",
      sql: `CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_slug TEXT,
  product_title TEXT,
  bundle_id TEXT,
  quantity INTEGER DEFAULT 1,
  total_amount INTEGER DEFAULT 0,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_city TEXT,
  shipping_address TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON orders FOR UPDATE USING (true);`,
      rpc_error: error.message
    });
  }

  return NextResponse.json({ success: true, message: "Table orders créée avec succès" });
}
