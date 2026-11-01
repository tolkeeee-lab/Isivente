import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface MetaInsightRow {
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend: number;
  impressions: number;
  clicks: number;
  inline_link_clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  landing_page_views: number;
  add_to_cart: number;
  initiate_checkout: number;
  purchases: number;
  currency?: string;
}

function extractActionCount(actions: any[] | undefined, types: string[]): number {
  if (!Array.isArray(actions)) return 0;
  for (const t of types) {
    const found = actions.find((a) => a?.action_type === t);
    if (found && found.value !== undefined) {
      return Number(found.value) || 0;
    }
  }
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawAccountId = String(
      body.ad_account_id || process.env.META_AD_ACCOUNT_ID || ""
    ).trim();
    const accessToken = String(
      body.access_token ||
        process.env.META_MARKETING_API_TOKEN ||
        process.env.META_CONVERSIONS_API_TOKEN ||
        ""
    ).trim();
    const datePreset = String(body.date_preset || "last_7d").trim();
    const level = String(body.level || "ad").trim(); // "campaign" | "adset" | "ad"

    if (!rawAccountId || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Identifiant de compte publicitaire (act_XXX) ou jeton d'accès Meta manquant.",
        },
        { status: 400 }
      );
    }

    const accountId = rawAccountId.startsWith("act_")
      ? rawAccountId
      : `act_${rawAccountId.replace(/\D/g, "")}`;

    // 1. Récupérer la devise du compte publicitaire
    const accountInfoUrl = `https://graph.facebook.com/v20.0/${accountId}?fields=name,currency,account_status&access_token=${encodeURIComponent(
      accessToken
    )}`;
    const accRes = await fetch(accountInfoUrl, { cache: "no-store" });
    const accJson = await accRes.json();

    if (accJson.error) {
      return NextResponse.json(
        {
          success: false,
          error: accJson.error.message || "Erreur d'authentification Meta API",
          code: accJson.error.code,
        },
        { status: 400 }
      );
    }

    const accountCurrency = accJson.currency || "USD";
    const accountName = accJson.name || accountId;

    // 2. Récupérer les Insights détaillés par publicité / campagne
    const fields = [
      "campaign_id",
      "campaign_name",
      "adset_id",
      "adset_name",
      "ad_id",
      "ad_name",
      "spend",
      "impressions",
      "clicks",
      "inline_link_clicks",
      "ctr",
      "cpc",
      "cpm",
      "actions",
    ].join(",");

    const insightsUrl = `https://graph.facebook.com/v20.0/${accountId}/insights?level=${encodeURIComponent(
      level
    )}&date_preset=${encodeURIComponent(
      datePreset
    )}&fields=${encodeURIComponent(fields)}&limit=200&access_token=${encodeURIComponent(
      accessToken
    )}`;

    const insRes = await fetch(insightsUrl, { cache: "no-store" });
    const insJson = await insRes.json();

    if (insJson.error) {
      return NextResponse.json(
        {
          success: false,
          error:
            insJson.error.message ||
            "Erreur lors de la récupération des statistiques Meta Ads",
        },
        { status: 400 }
      );
    }

    const rawData: any[] = Array.isArray(insJson.data) ? insJson.data : [];

    const rows: MetaInsightRow[] = rawData.map((r) => {
      const actions = r.actions || [];
      return {
        campaign_id: r.campaign_id,
        campaign_name: r.campaign_name || "Campagne sans nom",
        adset_id: r.adset_id,
        adset_name: r.adset_name || "Ensemble sans nom",
        ad_id: r.ad_id,
        ad_name: r.ad_name || r.campaign_name || "Publicité",
        spend: Number(r.spend) || 0,
        impressions: Number(r.impressions) || 0,
        clicks: Number(r.clicks) || 0,
        inline_link_clicks:
          Number(r.inline_link_clicks) ||
          extractActionCount(actions, ["link_click"]) ||
          Number(r.clicks) ||
          0,
        ctr: Number(r.ctr) || 0,
        cpc: Number(r.cpc) || 0,
        cpm: Number(r.cpm) || 0,
        landing_page_views: extractActionCount(actions, [
          "landing_page_view",
          "omni_landing_page_view",
        ]),
        add_to_cart: extractActionCount(actions, [
          "offsite_conversion.fb_pixel_add_to_cart",
          "omni_add_to_cart",
          "add_to_cart",
        ]),
        initiate_checkout: extractActionCount(actions, [
          "offsite_conversion.fb_pixel_initiate_checkout",
          "omni_initiated_checkout",
          "initiate_checkout",
        ]),
        purchases: extractActionCount(actions, [
          "offsite_conversion.fb_pixel_purchase",
          "omni_purchase",
          "purchase",
        ]),
        currency: accountCurrency,
      };
    });

    return NextResponse.json({
      success: true,
      account: {
        id: accountId,
        name: accountName,
        currency: accountCurrency,
      },
      rows,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Erreur serveur lors de la connexion à Meta",
      },
      { status: 500 }
    );
  }
}
