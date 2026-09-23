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
      ${whatsappLink
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

/**
 * Envoie une notification immédiate lorsqu'un panier est abandonné / prospect chaud détecté
 */
export async function sendAbandonedLeadNotification(lead: {
  customer_name: string;
  customer_phone: string;
  customer_phone2?: string;
  city?: string;
  address?: string;
  product_title: string;
  bundle_name?: string;
  total_amount?: number;
}) {
  const recipientEmail = process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER || "tolkeeee@gmail.com";
  const cleanPhone = (lead.customer_phone || "").replace(/\D/g, "");
  const whatsappPhone = cleanPhone.startsWith("229") ? cleanPhone : `229${cleanPhone}`;
  const prefilledMsg = encodeURIComponent(
    `Bonjour ${lead.customer_name || ""}, j'ai vu que vous vous intéressiez à notre ${lead.product_title || "produit"} sur Isivente. Avez-vous rencontré une difficulté pour finaliser votre commande ? Nous pouvons vous livrer aujourd'hui avec paiement à la réception !`
  );
  const whatsappLink = cleanPhone ? `https://wa.me/${whatsappPhone}?text=${prefilledMsg}` : "";
  const callLink = cleanPhone ? `tel:${cleanPhone}` : "";
  const formattedAmount = lead.total_amount
    ? new Intl.NumberFormat("fr-FR").format(lead.total_amount) + " FCFA"
    : "Non calculé";
  const dateFormatted = new Date().toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo" });

  const emailSubject = `⚠️ PANIER ABANDONNÉ : ${lead.customer_name || "Prospect"} (${cleanPhone}) - ${lead.product_title}`;

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 18px 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">⚠️ Nouveau Prospect / Panier Abandonné !</h2>
        <p style="color: #fef3c7; margin: 4px 0 0 0; font-size: 13px;">Un client a saisi ses coordonnées sans cliquer sur "Commander". Relancez-le rapidement !</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">📦 Produit convoité :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">${lead.product_title}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">🏷️ Formule / Pack :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155;">${lead.bundle_name || "Formule standard"}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">💰 Valeur potentielle :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #d97706; font-size: 16px;">${formattedAmount}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">👤 Prospect :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">${lead.customer_name || "Client intéressé"}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">📞 Téléphone :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #2563eb;"><a href="${callLink}" style="color: #2563eb; text-decoration: none;">${cleanPhone}</a></td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">📍 Ville :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155;">${lead.city || "Cotonou"}</td></tr>
        <tr><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">📅 Détecté le :</td><td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">${dateFormatted}</td></tr>
      </table>

      <div style="display: flex; gap: 12px; justify-content: center; text-align: center; margin-top: 16px;">
        ${whatsappLink
      ? `<a href="${whatsappLink}" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); margin-right: 10px;">
                💬 Relancer sur WhatsApp
              </a>`
      : ""
    }
        ${callLink
      ? `<a href="${callLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px;">
                📞 Appeler directement
              </a>`
      : ""
    }
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="https://isivente.vercel.app/admin/prospects" style="color: #64748b; font-size: 12px; text-decoration: underline;">
          Accéder au tableau des Paniers Abandonnés sur Isivente
        </a>
      </div>
    </div>
  `;

  // Envoi Gmail SMTP
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
        from: `"Isivente Prospects ⚠️" <${gmailUser}>`,
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
      });
      return { success: true };
    } catch (smtpErr) {
      console.error("Nodemailer Lead SMTP error:", smtpErr);
    }
  }

  // Telegram fallback si configuré
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    try {
      const message = `⚠️ *NOUVEAU PANIER ABANDONNÉ !*\n\n` +
        `📦 *Produit :* ${lead.product_title}\n` +
        `💰 *Valeur :* \`${formattedAmount}\`\n` +
        `👤 *Prospect :* ${lead.customer_name || "Client"}\n` +
        `📞 *Téléphone :* \`${cleanPhone}\`\n` +
        `📍 *Ville :* ${lead.city || "Cotonou"}\n` +
        `📅 *Date :* ${dateFormatted}\n\n` +
        (whatsappLink ? `👉 [Ouvrir WhatsApp Client](${whatsappLink})\n` : "") +
        `🔗 [Voir sur Isivente](https://isivente.vercel.app/admin/prospects)`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
      });
    } catch (tgErr) { }
  }

  return { success: true };
}
