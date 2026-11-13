import { NextRequest, NextResponse } from "next/server";
import { sendMetaConversionApiEvent } from "@/lib/metaConversionsApi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
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
