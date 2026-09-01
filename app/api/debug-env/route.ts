import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return NextResponse.json({
    env_check: {
      NEXT_PUBLIC_SUPABASE_URL: url ? `${url.substring(0, 20)}...` : "❌ NON DÉFINI",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? `${key.substring(0, 15)}...` : "❌ NON DÉFINI",
      url_is_placeholder: url === "YOUR_SUPABASE_URL" || url.includes("placeholder"),
      key_is_placeholder: key === "YOUR_SUPABASE_ANON_KEY" || key === "placeholder-key",
      url_length: url.length,
      key_length: key.length,
    },
    all_supabase_env_keys: Object.keys(process.env).filter(k => 
      k.toLowerCase().includes("supabase") || k.toLowerCase().includes("supa")
    ),
  });
}
