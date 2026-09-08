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

    // 1. ENVOI PAR EMAIL (tolkeeee@gmail.com)
    try {
      await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          _subject: `🎉 NOUVELLE COMMANDE ISIVENTE - ${formattedAmount} (${order.product_title || "Produit"})`,
          _template: "table",
          _captcha: "false",
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
    } catch (emailErr) {
      console.error("Email notification error:", emailErr);
    }

    // 2. ENVOI TELEGRAM (si configuré)
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

