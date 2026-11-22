import { NextRequest, NextResponse } from "next/server";
import { sendMetaConversionApiEvent, META_PIXEL_ID } from "@/lib/metaConversionsApi";
import { requireAuthenticatedTenant } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Mode test CAPI unifié (réservé aux utilisateurs authentifiés — remplace /api/pixel/test)
    if (body.action === "test") {
      const auth = await requireAuthenticatedTenant(req);
      if (!auth.ok) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
      }
      const pixelId = body.pixel_id || META_PIXEL_ID;
      const token = body.token || process.env.META_CONVERSIONS_API_TOKEN || "";
      const testEventCode = body.test_event_code || process.env.META_TEST_EVENT_CODE || "";
      if (!token) {
        return NextResponse.json(
          { success: false, error: "Token Meta CAPI manquant." },
          { status: 400 }
        );
      }
      const testPayload: any = {
        data: [
          {
            event_name: body.event_name || "InitiateCheckout",
            event_time: Math.floor(Date.now() / 1000),
            event_id: "test_" + Date.now(),
            action_source: "website",
            event_source_url: "https://isivente.vercel.app/p/microscope",
            user_data: {
              ph: ["b68a4be46cb61d9a2ff507c57b9856f64264627d3fae1f2cfcbff64b18f8444a"],
              ct: ["ca759714c30c33a903061266d713c7ff8fb177242c7526715f20f0cc207a1ffb"],
              country: ["04b2a4729c13d8032512f49aa602aa4c57abefaa30f24ee437db87596ae3bf67"],
            },
            custom_data: { currency: "XOF", value: 24900, content_name: "Test CAPI Isivente", content_type: "product" },
          },
        ],
      };
      if (testEventCode) testPayload.test_event_code = String(testEventCode).trim();
      const testRes = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${String(token).trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });
      const testResult = await testRes.json();
      return NextResponse.json(
        { success: testRes.ok && Boolean(testResult?.events_received), meta_response: testResult },
        { status: testRes.ok ? 200 : 400 }
      );
    }

    const eventName = body.event_name || "PageView";
    const customData = body.custom_data || {};
    const eventSourceUrl = body.event_source_url || req.headers.get("referer") || "";

    const userAgent = req.headers.get("user-agent") || undefined;
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      (req as any).ip ||
      undefined;

    const cookies = req.cookies;
    const reqUserData = body.user_data || {};

    // 1. Couverture fbp garantie à 100% (lecture cookies, payload ou génération standard fb.1.{ts}.{10digits})
    let finalFbp = cookies.get("_fbp")?.value || reqUserData.fbp;
    if (!finalFbp || !/^fb\.\d+\.\d+\.\d+$/.test(finalFbp)) {
      finalFbp = `fb.1.${Date.now()}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }

    // 2. Couverture fbc garantie à 100% sur clics Meta (lecture cookies, payload ou extraction fbclid)
    let finalFbc = cookies.get("_fbc")?.value || reqUserData.fbc;
    if (!finalFbc) {
      if (eventSourceUrl) {
        try {
          const urlObj = new URL(eventSourceUrl.startsWith("http") ? eventSourceUrl : `https://isivente.com${eventSourceUrl}`);
          const fbclid = urlObj.searchParams.get("fbclid") || urlObj.searchParams.get("fb_action_ids");
          if (fbclid && fbclid.trim().length > 5) {
            finalFbc = `fb.1.${Date.now()}.${fbclid.trim()}`;
          }
        } catch {}
      }
      if (!finalFbc && req.headers.get("referer")) {
        try {
          const refUrl = new URL(req.headers.get("referer")!);
          const fbclid = refUrl.searchParams.get("fbclid") || refUrl.searchParams.get("fb_action_ids");
          if (fbclid && fbclid.trim().length > 5) {
            finalFbc = `fb.1.${Date.now()}.${fbclid.trim()}`;
          }
        } catch {}
      }
    }

    const testEventCode = body.test_event_code || req.nextUrl.searchParams.get("test_event_code") || undefined;

    // 3. Normalisation contact et téléphone (Bénin 229)
    let rawPhone = reqUserData.phone || reqUserData.customer_phone;
    let cleanPhone = rawPhone ? String(rawPhone).replace(/\D/g, "") : undefined;
    if (cleanPhone && (cleanPhone.length === 8 || cleanPhone.length === 10) && !cleanPhone.startsWith("229")) {
      cleanPhone = "229" + cleanPhone;
    }

    let firstName = reqUserData.first_name;
    let lastName = reqUserData.last_name;
    if (reqUserData.customer_name && !firstName) {
      const parts = String(reqUserData.customer_name).trim().split(/\s+/);
      firstName = parts[0] || undefined;
      lastName = parts.slice(1).join(" ") || undefined;
    }

    const rawEmail = String(reqUserData.email || reqUserData.customer_email || "").trim().toLowerCase();
    const customerEmail = rawEmail.includes("@") ? rawEmail : undefined;

    // 4. Relais serveur Meta CAPI ATTENDU (await indispensable sur Vercel Serverless pour éviter la coupure du processus)
    const result = await sendMetaConversionApiEvent({
      event_name: eventName,
      event_source_url: eventSourceUrl,
      event_id: body.event_id,
      test_event_code: testEventCode,
      user_data: {
        phone: cleanPhone,
        email: customerEmail,
        first_name: firstName,
        last_name: lastName,
        city: reqUserData.city || "Cotonou",
        country: "bj",
        external_id: reqUserData.external_id || body.event_id,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbp: finalFbp,
        fbc: finalFbc,
      },
      custom_data: customData,
    }).catch((e) => ({ sent: false, error: e?.message }));

    // 5. Réponse avec persistance cookies 1st-party longue durée (90 jours)
    const response = NextResponse.json({
      success: true,
      capi: result,
      fbp: finalFbp,
      fbc: finalFbc,
    });

    if (finalFbp) {
      response.cookies.set("_fbp", finalFbp, {
        maxAge: 90 * 24 * 60 * 60, // 90 jours
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
    }
    if (finalFbc) {
      response.cookies.set("_fbc", finalFbc, {
        maxAge: 90 * 24 * 60 * 60, // 90 jours
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
