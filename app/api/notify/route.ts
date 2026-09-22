import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotification } from "@/lib/notifyHelper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order } = body;

    if (!order) {
      return NextResponse.json({ error: "No order data provided" }, { status: 400 });
    }

    const results = await sendOrderNotification(order);
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Notification webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
