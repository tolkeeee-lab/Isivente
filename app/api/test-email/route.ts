import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(req: NextRequest) {
  const gmailUser = (process.env.GMAIL_USER || process.env.EMAIL_USER || "").trim();
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || "";
  const gmailAppPass = rawPass.replace(/\s+/g, "").trim();
  const recipientEmail = process.env.NOTIFICATION_EMAIL || gmailUser || "tolkeeee@gmail.com";

  const diag = {
    has_GMAIL_USER: Boolean(gmailUser),
    gmailUser_value: gmailUser ? `${gmailUser.slice(0, 4)}***@${gmailUser.split("@")[1] || "gmail.com"}` : "NON DEFINI",
    has_GMAIL_APP_PASSWORD: Boolean(gmailAppPass),
    password_length: gmailAppPass.length,
    recipientEmail: recipientEmail,
  };

  if (!gmailUser || !gmailAppPass) {
    return NextResponse.json({
      success: false,
      error: "Variables d'environnement GMAIL_USER ou GMAIL_APP_PASSWORD non trouvées sur Vercel.",
      diagnostic: diag,
      solution: "Vérifiez que GMAIL_USER et GMAIL_APP_PASSWORD sont bien enregistrés dans Vercel > Settings > Environment Variables, puis faites un Redeploy.",
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
      diagnostic: diag,
    });
  } catch (err: any) {
    console.error("Test email error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
      code: err.code,
      diagnostic: diag,
      aide: err.message?.includes("Invalid login") || err.code === "EAUTH"
        ? "Erreur d'authentification Google : Le mot de passe d'application de 16 lettres n'est pas reconnu. Générez un nouveau mot de passe sur https://myaccount.google.com/apppasswords et mettez-le dans GMAIL_APP_PASSWORD sur Vercel."
        : "Erreur lors de la connexion au serveur Gmail SMTP.",
    }, { status: 500 });
  }
}
