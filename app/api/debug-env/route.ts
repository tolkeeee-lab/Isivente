import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const capiToken = process.env.META_CONVERSIONS_API_TOKEN || "";
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
  const testCode = process.env.META_TEST_EVENT_CODE || "";

  return NextResponse.json({
    env_check: {
      NEXT_PUBLIC_SUPABASE_URL: url ? `${url.substring(0, 20)}...` : "❌ NON DÉFINI",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? `${key.substring(0, 15)}...` : "❌ NON DÉFINI",
      NEXT_PUBLIC_META_PIXEL_ID: pixelId || "❌ NON DÉFINI",
      META_CONVERSIONS_API_TOKEN: capiToken ? `✅ DÉFINI (${capiToken.substring(0, 10)}... longueur: ${capiToken.length})` : "❌ NON DÉFINI",
      META_TEST_EVENT_CODE: testCode || "NON DÉFINI (Optionnel)",
    },
  });
}
