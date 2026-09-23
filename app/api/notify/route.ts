import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotification } from "@/lib/notifyHelper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Format de données invalide" }, { status: 400 });
    }

    const { order } = body;
    if (!order || typeof order !== "object") {
      return NextResponse.json({ error: "Données de commande manquantes" }, { status: 400 });
    }

    // Validation minimale pour éviter l'envoi de faux messages ou spam
    const phone = String(order.customer_phone || order.phone || "").replace(/\D/g, "");
    if (!phone || phone.length < 8) {
      return NextResponse.json({ error: "Numéro de téléphone de commande invalide" }, { status: 400 });
    }

    const results = await sendOrderNotification(order);
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Notification webhook error:", err?.message);
    return NextResponse.json({ success: false, error: "Erreur lors de l'envoi de la notification" }, { status: 500 });
  }
}
