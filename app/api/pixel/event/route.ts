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
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
      req.headers.get("x-real-ip") || 
      undefined;

    const cookies = req.cookies;
    const reqUserData = body.user_data || {};
    const fbp = cookies.get("_fbp")?.value || reqUserData.fbp;
    const fbc = cookies.get("_fbc")?.value || reqUserData.fbc;
    const testEventCode = body.test_event_code || req.nextUrl.searchParams.get("test_event_code") || undefined;

    // Relais serveur Meta CAPI ATTENDU (await indispensable sur Vercel Serverless pour éviter la coupure du processus)
    const result = await sendMetaConversionApiEvent({
      event_name: eventName,
      event_source_url: eventSourceUrl,
      event_id: body.event_id,
      test_event_code: testEventCode,
      user_data: {
        phone: reqUserData.phone,
        first_name: reqUserData.first_name,
        last_name: reqUserData.last_name,
        city: reqUserData.city,
        country: "bj",
        external_id: reqUserData.external_id,
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
