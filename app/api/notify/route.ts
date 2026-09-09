import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order } = body;

    if (!order) {
      return NextResponse.json({ error: "No order data provided" }, { status: 400 });
    }

    const recipientEmail = process.env.NOTIFICATION_EMAIL || "tolkeeee@gmail.com";
    const formattedAmount = new Intl.NumberFormat("fr-FR").format(order.total_amount || 0) + " FCFA";
    const cleanPhone = (order.customer_phone || "").replace(/[^0-9]/g, "");
    const whatsappLink = cleanPhone ? `https://wa.me/229${cleanPhone}` : "";
    const dateFormatted = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo" });

    // 1. ENVOI PAR RESEND (Si configuré - Solution 100% fiable pro)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Isivente Alertes <onboarding@resend.dev>",
            to: [recipientEmail],
            subject: `🎉 NOUVELLE COMMANDE - ${formattedAmount} (${order.product_title || "Produit"})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                <h2 style="color: #ea580c; margin-top: 0;">🎉 Nouvelle Commande Reçue !</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">📦 Produit :</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${order.product_title || "Non spécifié"}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">🏷️ Formule :</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${order.bundle_name || "Offre standard"}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">💰 Montant :</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #16a34a;">${formattedAmount}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">👤 Client :</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${order.customer_name || "Client"}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">📞 Téléphone :</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><a href="tel:${order.customer_phone}">${order.customer_phone}</a></td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">📍 Ville :</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${order.city || "Cotonou"}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">🏠 Adresse :</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${order.address || "Non précisé"}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">🆔 N° Commande :</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><code>${order.order_number || "CMD"}</code></td></tr>
                </table>
                ${whatsappLink ? `<a href="${whatsappLink}" style="display: inline-block; background-color: #22c55e; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">💬 Ouvrir sur WhatsApp</a>` : ""}
              </div>
            `,
          }),
        });
      } catch (resendErr) {
        console.error("Resend notification error:", resendErr);
      }
    }

    // 2. ENVOI PAR FORMSUBMIT (tolkeeee@gmail.com)
    try {
      const fsRes = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Origin": "https://isivente.vercel.app",
          "Referer": "https://isivente.vercel.app/",
        },
        body: JSON.stringify({
          _subject: `🎉 NOUVELLE COMMANDE ISIVENTE - ${formattedAmount} (${order.product_title || "Produit"})`,
          _template: "table",
          _captcha: "false",
          name: "Isivente Système",
          email: "notifications@isivente.vercel.app",
          "📦 Produit": order.product_title || "Non spécifié",
          "🏷️ Formule / Pack": order.bundle_name || "Offre standard",
          "💰 Montant Total": formattedAmount,
          "👤 Nom du Client": order.customer_name || "Client",
          "📞 Téléphone": order.customer_phone || "Non renseigné",
          "📍 Ville": order.city || "Cotonou",
          "🏠 Adresse / Quartier": order.address || "Non précisé",
          "🆔 N° Commande": order.order_number || "CMD-" + Date.now(),
          "📅 Date & Heure": dateFormatted,
          "💬 Contacter sur WhatsApp": whatsappLink || "Numéro indisponible",
        }),
      });
      const fsJson = await fsRes.json().catch(() => ({}));
      console.log("FormSubmit result:", fsJson);
    } catch (emailErr) {
      console.error("FormSubmit notification error:", emailErr);
    }

    // 3. ENVOI TELEGRAM (si configuré)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message = `🎉 *NOUVELLE COMMANDE REÇUE !*\n\n` +
        `📦 *Produit :* ${order.product_title || "Produit"}\n` +
        `🏷️ *Pack :* ${order.bundle_name || "Pack Standard"}\n` +
        `💰 *Montant :* ${formattedAmount}\n` +
        `👤 *Client :* ${order.customer_name || "Client"}\n` +
        `📞 *Téléphone :* ${order.customer_phone || "Non renseigné"}\n` +
        `📍 *Ville / Quartier :* ${order.city || "Cotonou"} - ${order.address || ""}\n` +
        `🆔 *Réf :* \`${order.order_number || "CMD"}\`\n\n` +
        (whatsappLink ? `👉 [Ouvrir WhatsApp Client](${whatsappLink})` : "");

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }).catch((tgErr) => console.error("Telegram notification error:", tgErr));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Notification webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
