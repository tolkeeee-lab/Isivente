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

    // Relais serveur Meta CAPI en tâche de fond non bloquante avec données utilisateur
    sendMetaConversionApiEvent({
      event_name: eventName,
      event_source_url: eventSourceUrl,
      event_id: body.event_id,
      user_data: {
        phone: reqUserData.phone,
        first_name: reqUserData.first_name,
        last_name: reqUserData.last_name,
        city: reqUserData.city,
        country: "bj",
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbp,
        fbc,
      },
      custom_data: customData,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
