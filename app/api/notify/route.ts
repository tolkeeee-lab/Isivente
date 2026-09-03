import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order } = body;

    if (!order) {
      return NextResponse.json({ error: "No order data provided" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Si Telegram est configuré, envoyer l'alerte directe sur smartphone
    if (botToken && chatId) {
      const formattedAmount = new Intl.NumberFormat("fr-FR").format(order.total_amount || 0) + " FCFA";
      const message = `🎉 *NOUVELLE COMMANDE REÇUE !*\n\n` +
        `📦 *Produit :* ${order.product_title || "Produit"}\n` +
        `🏷️ *Pack :* ${order.bundle_name || "Pack Standard"}\n` +
        `💰 *Montant :* ${formattedAmount}\n` +
        `👤 *Client :* ${order.customer_name || "Client"}\n` +
        `📞 *Téléphone :* ${order.customer_phone || "Non renseigné"}\n` +
        `📍 *Ville / Quartier :* ${order.city || "Cotonou"} - ${order.address || ""}\n` +
        `🆔 *Réf :* \`${order.order_number || "CMD"}\`\n\n` +
        `👉 [Ouvrir WhatsApp Client](https://wa.me/229${(order.customer_phone || "").replace(/[^0-9]/g, "")})`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Notification webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
