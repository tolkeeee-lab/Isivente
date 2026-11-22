import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sendOrderNotification } from "@/lib/notifyHelper";
import { requireAuthenticatedTenant } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

/**
 * Route unifiée /api/notify (Fondateur uniquement)
 * - GET  /api/notify?type=push  -> Test push ntfy.sh
 * - GET  /api/notify?type=email -> Test SMTP Gmail
 * - POST /api/notify            -> Déclenchement manuel d'alerte commande (JWT fondateur)
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuthenticatedTenant(req);
  if (!auth.ok || !auth.isFounder) {
    return NextResponse.json(
      { success: false, error: "Accès réservé au fondateur" },
      { status: auth.ok ? 403 : auth.status }
    );
  }

  const type = (req.nextUrl.searchParams.get("type") || "push").toLowerCase();

  if (type === "email") {
    const gmailUser = (process.env.GMAIL_USER || process.env.EMAIL_USER || "").trim();
    const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || "";
    const gmailAppPass = rawPass.replace(/\s+/g, "").trim();
    const recipientEmail = process.env.NOTIFICATION_EMAIL || gmailUser || "tolkeeee@gmail.com";

    if (!gmailUser || !gmailAppPass) {
      return NextResponse.json(
        { success: false, error: "Variables GMAIL_USER ou GMAIL_APP_PASSWORD non configurées." },
        { status: 400 }
      );
    }

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailAppPass },
      });
      await transporter.verify();
      const info = await transporter.sendMail({
        from: `"Isivente Express Test" <${gmailUser}>`,
        to: recipientEmail,
        subject: "TEST ISIVENTE REUSSI - Notifications email actives",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;"><h2 style="color:#16a34a;margin-top:0;">Test réussi</h2><p>Vos alertes de commande Isivente sont connectées à <strong>${recipientEmail}</strong>.</p></div>`,
      });
      return NextResponse.json({
        success: true,
        type: "email",
        message: `Email de test envoyé à ${recipientEmail}`,
        messageId: info.messageId,
      });
    } catch (err: any) {
      console.error("Test email error:", err?.message);
      return NextResponse.json(
        { success: false, error: "Erreur lors de la connexion au serveur Gmail SMTP." },
        { status: 500 }
      );
    }
  }

  // Par défaut : test push ntfy.sh
  const ntfyTopic = (process.env.NTFY_TOPIC || "isivente-commandes-tolkeeee").trim();
  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(ntfyTopic)}`, {
      method: "POST",
      headers: {
        Title: "TEST NOTIFICATION ISIVENTE REUSSI",
        Priority: "urgent",
        Tags: "tada,bell",
        Actions: "view, Ouvrir Isivente, https://isivente.vercel.app/admin/orders",
      },
      body: `Votre smartphone est connecté aux commandes Isivente sur le canal : ${ntfyTopic}.`,
    });

    return NextResponse.json({
      success: res.ok,
      type: "push",
      topic: ntfyTopic,
      message: res.ok
        ? "Notification push envoyée sur votre téléphone."
        : "Erreur lors de l'envoi de la notification",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedTenant(req);
    if (!auth.ok || !auth.isFounder) {
      return NextResponse.json(
        { success: false, error: "Accès réservé au fondateur" },
        { status: auth.ok ? 403 : auth.status }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Format de données invalide" }, { status: 400 });
    }

    const { order } = body;
    if (!order || typeof order !== "object") {
      return NextResponse.json({ error: "Données de commande manquantes" }, { status: 400 });
    }

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
