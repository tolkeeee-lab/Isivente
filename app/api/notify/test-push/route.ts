import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedTenant } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAuthenticatedTenant(req);
  if (!auth.ok || !auth.isFounder) {
    return NextResponse.json({ success: false, error: "Accès réservé au fondateur" }, { status: auth.ok ? 403 : auth.status });
  }

  const ntfyTopic = (process.env.NTFY_TOPIC || "isivente-commandes-tolkeeee").trim();

  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(ntfyTopic)}`, {
      method: "POST",
      headers: {
        "Title": "🔔 TEST NOTIFICATION ISIVENTE REUSSI !",
        "Priority": "urgent",
        "Tags": "tada,bell",
        "Actions": "view, Ouvrir Isivente, https://isivente.vercel.app/admin/orders",
      },
      body: `Félicitations ! Votre smartphone est maintenant connecté en direct aux commandes Isivente sur le canal : ${ntfyTopic}.`,
    });

    return NextResponse.json({
      success: res.ok,
      topic: ntfyTopic,
      message: res.ok
        ? "Notification push envoyée avec succès sur votre téléphone !"
        : "Erreur lors de l'envoi de la notification",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
