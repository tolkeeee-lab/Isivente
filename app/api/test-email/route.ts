import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(req: NextRequest) {
  // Protection de sécurité : autoriser en dev ou si secret administrateur fourni
  const secretParam = req.nextUrl.searchParams.get("secret");
  const adminSecret = process.env.ADMIN_API_SECRET;
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev && (!adminSecret || secretParam !== adminSecret)) {
    return NextResponse.json(
      { success: false, error: "Accès restreint. Paramètre secret administrateur requis." },
      { status: 403 }
    );
  }

  const gmailUser = (process.env.GMAIL_USER || process.env.EMAIL_USER || "").trim();
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || "";
  const gmailAppPass = rawPass.replace(/\s+/g, "").trim();
  const recipientEmail = process.env.NOTIFICATION_EMAIL || gmailUser || "tolkeeee@gmail.com";

  if (!gmailUser || !gmailAppPass) {
    return NextResponse.json({
      success: false,
      error: "Variables d'environnement GMAIL_USER ou GMAIL_APP_PASSWORD non configurées sur le serveur.",
    }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPass,
      },
    });

    // Test de connexion SMTP
    await transporter.verify();

    // Envoi du mail de test
    const info = await transporter.sendMail({
      from: `"Isivente Express Test" <${gmailUser}>`,
      to: recipientEmail,
      subject: "🎉 TEST ISIVENTE REUSSI - Vos notifications email sont fonctionnelles !",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #16a34a; margin-top: 0;">🎉 Test Réussi avec Succès !</h2>
          <p>Vos alertes de commande Isivente sont maintenant 100% connectées à votre boîte Gmail <strong>${recipientEmail}</strong>.</p>
          <p>Chaque nouvelle commande arrivera directement ici sans passer par les spams.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Isivente Notifications System</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé avec succès à ${recipientEmail} !`,
      messageId: info.messageId,
    });
  } catch (err: any) {
    console.error("Test email error:", err?.message);
    return NextResponse.json({
      success: false,
      error: "Erreur lors de la connexion au serveur Gmail SMTP.",
      details: isDev ? err?.message : undefined,
    }, { status: 500 });
  }
}
