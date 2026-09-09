import nodemailer from "nodemailer";

export interface NotificationOrderData {
  order_number?: string | number;
  customer_name?: string;
  customer_phone?: string;
  city?: string;
  shipping_city?: string;
  address?: string;
  shipping_address?: string;
  product_title?: string;
  product_slug?: string;
  bundle_name?: string;
  total_amount?: number;
  quantity?: number;
  status?: string;
  created_at?: string;
  is_upsell?: boolean;
}

export async function sendOrderNotification(order: NotificationOrderData) {
  const recipientEmail = process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER || "tolkeeee@gmail.com";
  const formattedAmount = new Intl.NumberFormat("fr-FR").format(order.total_amount || 0) + " FCFA";
  const cleanPhone = (order.customer_phone || "").replace(/[^0-9]/g, "");
  const whatsappLink = cleanPhone ? `https://wa.me/229${cleanPhone}` : "";
  const dateFormatted = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo" });
  const city = order.shipping_city || order.city || "Cotonou";
  const address = order.shipping_address || order.address || "Non précisé";
  const orderRef = String(order.order_number || "CMD-" + Date.now().toString().slice(-6));
  const isUpsell = order.is_upsell || (order.bundle_name || "").includes("[OFFRE VIP]");

  const results: {
    gmailSmtp?: boolean;
    telegram?: boolean;
    resend?: boolean;
    formsubmit?: boolean;
  } = {};

  const emailSubject = isUpsell
    ? `🚀 UPSELL ACCEPTÉ #${orderRef} (${order.customer_name || "Client"}) - Nouveau Total : ${formattedAmount}`
    : `🚨 NOUVELLE COMMANDE #${orderRef} (${order.customer_name || "Client"}) - ${formattedAmount}`;

  const headerBg = isUpsell
    ? "background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);"
    : "background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);";

  const headerTitle = isUpsell
    ? "🚀 UPSELL VIP AJOUTÉ AU COLIS !"
    : "🎉 Nouvelle Commande Isivente !";

  const headerSubtitle = isUpsell
    ? "Le client a accepté l'offre supplémentaire. Le montant total et le colis ont été mis à jour."
    : "Livraison Paiement à la réception (COD)";

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="${headerBg} padding: 18px 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${headerTitle}</h2>
        <p style="color: #f5f3ff; margin: 4px 0 0 0; font-size: 13px;">${headerSubtitle}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">📦 Produit principal :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">${order.product_title || "Non spécifié"}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">🏷️ Contenu du Colis :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: ${isUpsell ? '#6d28d9' : '#334155'};">${order.bundle_name || "Offre standard"}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">💰 Total à Encaisser :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #16a34a; font-size: 17px;">${formattedAmount}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">👤 Client :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">${order.customer_name || "Client"}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">📞 Téléphone :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #2563eb;"><a href="tel:${order.customer_phone}" style="color: #2563eb; text-decoration: none;">${order.customer_phone}</a></td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">📍 Ville :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155;">${city}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">🏠 Quartier / Adresse :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155;">${address}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">🆔 Réf. Commande :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-weight: bold; color: #0f172a;">${orderRef}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">📅 Date :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">${dateFormatted}</td></tr>
      </table>
      ${
        whatsappLink
          ? `<div style="text-align: center; margin-top: 16px;">
              <a href="${whatsappLink}" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                💬 Contacter le client sur WhatsApp
              </a>
            </div>`
          : ""
      }
    </div>
  `;

  // 1. GMAIL SMTP DIRECT VIA NODEMAILER (100% GRATUIT, 0 SPAM, INBOX DIRECTE)
  const gmailUser = (process.env.GMAIL_USER || process.env.EMAIL_USER || "").trim();
  const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || "";
  const gmailAppPass = rawPass.replace(/\s+/g, "").trim();

  if (gmailUser && gmailAppPass) {
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

      await transporter.sendMail({
        from: `"Isivente Commandes 📦" <${gmailUser}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
      });
      results.gmailSmtp = true;
    } catch (smtpErr) {
      console.error("Nodemailer Gmail SMTP error:", smtpErr);
    }
  }

  // 2. TELEGRAM INSTANTANÉ (100% GRATUIT, ALERTE SONORE MOBILE INSTANTANÉE)
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    try {
      const tgTitle = isUpsell ? "🚀 *UPSELL VIP ACCEPTÉ (PANIER BOOTSTÉ) !*" : "🎉 *NOUVELLE COMMANDE ISIVENTE !*";
      const message = `${tgTitle}\n\n` +
        `📦 *Produit :* ${order.product_title || "Produit"}\n` +
        `🏷️ *Pack / Colis :* ${order.bundle_name || "Offre standard"}\n` +
        `💰 *Nouveau Total :* \`${formattedAmount}\`\n` +
        `👤 *Client :* ${order.customer_name || "Client"}\n` +
        `📞 *Téléphone :* \`${order.customer_phone || "Non renseigné"}\`\n` +
        `📍 *Destination :* ${city} (${address})\n` +
        `🆔 *Réf :* \`${orderRef}\`\n` +
        `📅 *Date :* ${dateFormatted}\n\n` +
        (whatsappLink ? `👉 [Ouvrir WhatsApp Client](${whatsappLink})` : "");

      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
      results.telegram = tgRes.ok;
    } catch (tgErr) {
      console.error("Telegram notification error:", tgErr);
    }
  }

  // 3. RESEND API (100% GRATUIT JUSQU'À 3000 EMAILS/MOIS)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Isivente Alertes <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });
      results.resend = res.ok;
    } catch (resendErr) {
      console.error("Resend notification error:", resendErr);
    }
  }

  // 4. FORMSUBMIT FALLBACK (uniquement si aucun envoi direct n'a réussi)
  if (!results.gmailSmtp && !results.resend) {
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
          _subject: emailSubject,
          _template: "table",
          _captcha: "false",
          name: "Isivente Système",
          email: "notifications@isivente.vercel.app",
          "📦 Produit": order.product_title || "Non spécifié",
          "🏷️ Formule / Pack": order.bundle_name || "Offre standard",
          "💰 Montant Total": formattedAmount,
          "👤 Nom du Client": order.customer_name || "Client",
          "📞 Téléphone": order.customer_phone || "Non renseigné",
          "📍 Ville": city,
          "🏠 Adresse / Quartier": address,
          "🆔 N° Commande": orderRef,
          "📅 Date & Heure": dateFormatted,
          "💬 WhatsApp Direct": whatsappLink || "Numéro indisponible",
        }),
      });
      results.formsubmit = fsRes.ok;
    } catch (emailErr) {
      console.error("FormSubmit notification error:", emailErr);
    }
  }

  return results;
}
