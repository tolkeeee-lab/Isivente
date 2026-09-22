import { NextRequest, NextResponse } from "next/server";
import { sendMetaConversionApiEvent, META_PIXEL_ID } from "@/lib/metaConversionsApi";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pixelId = body.pixel_id || META_PIXEL_ID;
    const token = body.token || process.env.META_CONVERSIONS_API_TOKEN || "";
    const testEventCode = body.test_event_code || process.env.META_TEST_EVENT_CODE || "";

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Aucun jeton d'accès Meta (Token CAPI) fourni. Veuillez renseigner META_CONVERSIONS_API_TOKEN dans Vercel ou dans ce formulaire de test.",
      }, { status: 400 });
    }

    // Appel direct à l'API Meta Graph avec le test_event_code
    const payload: any = {
      data: [
        {
          event_name: body.event_name || "InitiateCheckout",
          event_time: Math.floor(Date.now() / 1000),
          event_id: "test_" + Date.now(),
          action_source: "website",
          event_source_url: "https://isivente.vercel.app/p/microscope",
          user_data: {
            ph: ["b68a4be46cb61d9a2ff507c57b9856f64264627d3fae1f2cfcbff64b18f8444a"], // hashé
            ct: ["ca759714c30c33a903061266d713c7ff8fb177242c7526715f20f0cc207a1ffb"], // cotonou hashé
            country: ["04b2a4729c13d8032512f49aa602aa4c57abefaa30f24ee437db87596ae3bf67"], // bj hashé
          },
          custom_data: {
            currency: "XOF",
            value: 29900,
            content_name: "Microscope Numérique Portable HD 1000X",
            content_type: "product",
          },
        },
      ],
    };

    if (testEventCode) {
      payload.test_event_code = testEventCode.trim();
    }

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token.trim()}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (res.ok && result?.events_received) {
      return NextResponse.json({
        success: true,
        message: `✅ Succès ! ${result.events_received} événement(s) reçu(s) par le serveur Meta. Regardez votre onglet 'Tester les événements' dans Meta Events Manager !`,
        meta_response: result,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result?.error?.message || "Erreur renvoyée par Meta",
        meta_response: result,
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
