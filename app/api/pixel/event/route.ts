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
      undefined;

    const cookies = req.cookies;
    const reqUserData = body.user_data || {};
    const fbp = cookies.get("_fbp")?.value || reqUserData.fbp;
    const fbc = cookies.get("_fbc")?.value || reqUserData.fbc;
    const testEventCode = body.test_event_code || req.nextUrl.searchParams.get("test_event_code") || undefined;

    // Normalisation nom / prénom si fournis
    let firstName = reqUserData.first_name;
    let lastName = reqUserData.last_name;
    if (reqUserData.customer_name && !firstName) {
      const parts = String(reqUserData.customer_name).trim().split(/\s+/);
      firstName = parts[0] || undefined;
      lastName = parts.slice(1).join(" ") || undefined;
    }

    // Relais serveur Meta CAPI ATTENDU (await indispensable sur Vercel Serverless pour éviter la coupure du processus)
    const result = await sendMetaConversionApiEvent({
      event_name: eventName,
      event_source_url: eventSourceUrl,
      event_id: body.event_id,
      test_event_code: testEventCode,
      user_data: {
        phone: reqUserData.phone || reqUserData.customer_phone,
        first_name: firstName,
        last_name: lastName,
        city: reqUserData.city || "Cotonou",
        country: "bj",
        external_id: reqUserData.external_id || body.event_id,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbp,
        fbc,
      },
      custom_data: customData,
    }).catch((e) => ({ sent: false, error: e?.message }));

    return NextResponse.json({ success: true, capi: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
