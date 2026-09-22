import { NextRequest, NextResponse } from "next/server";
import { META_PIXEL_ID } from "@/lib/metaConversionsApi";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = process.env.META_CONVERSIONS_API_TOKEN;
    const pixelId = META_PIXEL_ID;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Token Meta non configuré dans Vercel",
        data: null,
      });
    }

    const results: any = {
      pixelId,
      hasToken: true,
      pixelStats: null,
      adAccounts: null,
      campaigns: null,
      errors: [],
    };

    // 1. Tenter de récupérer les statistiques du Pixel (événements reçus par Meta)
    try {
      const pixelRes = await fetch(
        `https://graph.facebook.com/v19.0/${pixelId}?fields=name,last_fired_time,data_source_stats&access_token=${token}`
      );
      const pixelData = await pixelRes.json();
      if (pixelRes.ok) {
        results.pixelStats = pixelData;
      } else {
        results.errors.push({ source: "pixel", error: pixelData });
      }
    } catch (e: any) {
      results.errors.push({ source: "pixel_catch", error: e.message });
    }

    // 2. Tenter de récupérer les statistiques publicitaires (Ad Accounts & Insights / Clics)
    try {
      const meRes = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,adaccounts{id,name,account_status,amount_spent,insights{clicks,impressions,spend,ctr,cpc,actions}}&access_token=${token}`
      );
      const meData = await meRes.json();
      if (meRes.ok && meData?.adaccounts) {
        results.adAccounts = meData.adaccounts;
      } else {
        results.errors.push({ source: "adaccounts", error: meData });
      }
    } catch (e: any) {
      results.errors.push({ source: "adaccounts_catch", error: e.message });
    }

    // 3. Tenter via /v19.0/{pixel_id}/stats
    try {
      const statsRes = await fetch(
        `https://graph.facebook.com/v19.0/${pixelId}/stats?aggregation=event&access_token=${token}`
      );
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        results.eventStats = statsData;
      }
    } catch (e: any) {}

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
