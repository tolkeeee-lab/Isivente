import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  generateWhatsAppAgentReply,
  sendGreenApiWhatsAppMessage,
} from "@/lib/whatsappAgent";
import {
  sendOrderNotification,
  sendAbandonedLeadNotification,
} from "@/lib/notifyHelper";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://uelognqedzqtvupwzejh.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";
  return createServerClient(url, key, {
    cookies: {
      get() {
        return undefined;
      },
      set() {},
      remove() {},
    },
  });
}

// ── GET : Vérification Webhook Meta Cloud API ou statut de santé ──
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge) {
    const verifyToken =
      process.env.WHATSAPP_VERIFY_TOKEN || "isivente_whatsapp_2026";
    if (token === verifyToken) {
      return new NextResponse(challenge, { status: 200 });
    }
    return NextResponse.json({ error: "Invalid verify token" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    service: "Isivente WhatsApp AI Sales Agent Webhook",
    defaultInstance: "710722786457",
  });
}

// ── POST : Réception des messages entrants (Green-API, Meta Cloud API, ou Simulateur Admin) ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const urlToken = searchParams.get("token") || "";
    const urlInstance = searchParams.get("instance") || "";

    let senderPhone = "";
    let senderName = "Client WhatsApp";
    let incomingText = "";
    let chatId = "";
    let idInstance =
      urlInstance || process.env.GREEN_API_ID_INSTANCE || "710722786457";
    let apiTokenInstance =
      urlToken ||
      process.env.GREEN_API_TOKEN_INSTANCE ||
      "99dea8e77aaf4ca383583b213ab2a5b37f0b3f9114fa48e59d";
    let isSimulation = false;
    let forcedFallbackSlug: string | undefined = undefined;

    // CAS 1 : Simulateur Admin (/admin/whatsapp)
    if (body.mode === "simulate") {
      isSimulation = true;
      senderPhone = String(body.phone || "2290197000000").replace(/\D/g, "");
      senderName = String(body.senderName || "Client Test");
      incomingText = String(body.message || "").trim();
      forcedFallbackSlug = body.slug || undefined;
    }
    // CAS 2 : Webhook entrant GREEN-API
    else if (body.typeWebhook) {
      // Ignorer tout ce qui n'est pas un message entrant d'un client
      if (body.typeWebhook !== "incomingMessageReceived") {
        return NextResponse.json({ ok: true, ignored: body.typeWebhook });
      }

      if (body.instanceData?.idInstance) {
        idInstance = String(body.instanceData.idInstance);
      }

      chatId = String(body.senderData?.chatId || "");
      // Ignorer les groupes WhatsApp (@g.us) et les statuts
      if (!chatId || chatId.endsWith("@g.us") || chatId.includes("status")) {
        return NextResponse.json({ ok: true, ignored: "group_or_status" });
      }

      senderPhone = chatId.replace("@c.us", "").replace(/\D/g, "");
      senderName =
        String(
          body.senderData?.senderName ||
            body.senderData?.chatName ||
            "Client WhatsApp"
        ).trim() || "Client WhatsApp";

      const msgData = body.messageData;
      incomingText =
        msgData?.textMessageData?.textMessage ||
        msgData?.extendedTextMessageData?.text ||
        msgData?.quotedMessage?.textMessage ||
        "";
    }
    // CAS 3 : Webhook entrant Meta WhatsApp Cloud API officiel
    else if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0]?.changes?.[0]?.value;
      const msg = entry?.messages?.[0];
      if (!msg || msg.type !== "text") {
        return NextResponse.json({ ok: true, ignored: "non_text_meta" });
      }
      senderPhone = String(msg.from || "").replace(/\D/g, "");
      chatId = `${senderPhone}@c.us`;
      senderName =
        entry?.contacts?.[0]?.profile?.name || "Client WhatsApp";
      incomingText = msg.text?.body || "";
    }

    if (!incomingText || !incomingText.trim()) {
      return NextResponse.json({ ok: true, ignored: "empty_text" });
    }

    // Si le message est déjà une confirmation automatique de commande envoyée par le site ("Bonjour Isivente, je viens de valider ma commande sur le site !"),
    // on répond par un message court de bienvenue sans recréer une commande en doublon
    if (incomingText.includes("je viens de valider ma commande sur le site")) {
      const quickAck =
        `Merci ${senderName} ! ✅ Nous avons bien reçu le récapitulatif de votre commande sur WhatsApp. Notre service d'expédition vous appelle très vite pour la livraison.`;
      if (!isSimulation && chatId && apiTokenInstance) {
        await sendGreenApiWhatsAppMessage({
          chatId,
          message: quickAck,
          idInstance,
          apiTokenInstance,
        });
      }
      return NextResponse.json({
        ok: true,
        reply: quickAck,
        intent: "already_ordered_ack",
      });
    }

    const supabase = getSupabase();

    // Chercher si ce numéro WhatsApp a déjà un prospect récent dans Supabase (pour garder le contexte du produit et du prix négocié)
    const cleanLocalPhone = senderPhone.startsWith("229")
      ? senderPhone.slice(3)
      : senderPhone;
    const normalizedKey =
      cleanLocalPhone.startsWith("01") && cleanLocalPhone.length === 10
        ? cleanLocalPhone.slice(2)
        : cleanLocalPhone;

    let previousLead: any = null;
    try {
      const { data: existingLeads } = await supabase
        .from("leads")
        .select("*")
        .or(
          `customer_phone.ilike.%${normalizedKey}%,id.ilike.lead_${normalizedKey}_%`
        )
        .order("updated_at", { ascending: false })
        .limit(1);
      if (existingLeads && existingLeads.length > 0) {
        previousLead = existingLeads[0];
      }
    } catch {}

    const orderRef = `CMD-${Math.floor(100000 + Math.random() * 900000)}`;
    const agentResult = generateWhatsAppAgentReply({
      message: incomingText,
      senderName:
        previousLead?.customer_name &&
        previousLead.customer_name !== "Client intéressé"
          ? previousLead.customer_name
          : senderName,
      fallbackSlug: forcedFallbackSlug || previousLead?.product_slug,
      orderNumberIfCreated: orderRef,
    });

    // Si le client avait déjà obtenu une remise de 1 000 F lors du message précédent, conserver son prix remisé
    const finalPrice =
      previousLead &&
      previousLead.product_slug === agentResult.detectedSlug &&
      previousLead.total_amount > 0 &&
      previousLead.total_amount < agentResult.detectedPrice
        ? previousLead.total_amount
        : agentResult.detectedPrice;

    const now = new Date().toISOString();
    const leadId = `lead_${normalizedKey}_${agentResult.detectedSlug}`;

    // CAS A : Le client a donné sa ville / son quartier -> CRÉATION AUTOMATIQUE DE LA COMMANDE DANS /admin/orders !
    if (agentResult.isOrderComplete) {
      const orderPayload = {
        order_number: orderRef,
        customer_name:
          senderName !== "Client WhatsApp"
            ? senderName
            : previousLead?.customer_name || "Client WhatsApp",
        customer_phone: cleanLocalPhone || senderPhone,
        city: agentResult.detectedCity || "Cotonou",
        address:
          agentResult.detectedAddress || "Confirmé via Bot WhatsApp",
        product_slug: agentResult.detectedSlug,
        product_title: agentResult.detectedProductTitle,
        bundle_name: "Commande Bot WhatsApp",
        quantity: 1,
        total_amount: finalPrice,
        status: "pending",
        created_at: now,
      };

      try {
        await supabase.from("orders").insert([orderPayload]);
      } catch (e) {
        console.error("Erreur insertion commande WhatsApp :", e);
      }

      // Marquer le prospect comme converti
      try {
        await supabase.from("leads").upsert(
          [
            {
              id: leadId,
              customer_name: orderPayload.customer_name,
              customer_phone: orderPayload.customer_phone,
              city: orderPayload.city,
              address: orderPayload.address,
              product_slug: agentResult.detectedSlug,
              product_title: agentResult.detectedProductTitle,
              bundle_name: "Converti par Bot WhatsApp",
              total_amount: finalPrice,
              status: "converted",
              created_at: previousLead?.created_at || now,
              updated_at: now,
            },
          ],
          { onConflict: "id" }
        );
      } catch {}

      if (!isSimulation) {
        sendOrderNotification(orderPayload).catch(() => {});
      }
    }
    // CAS B : C'est une question / objection -> CAPTURER IMMÉDIATEMENT LE NUMÉRO DANS LES PANIERS ABANDONNÉS (/admin/prospects)
    else {
      const leadPayload = {
        id: leadId,
        customer_name:
          senderName !== "Client WhatsApp"
            ? senderName
            : previousLead?.customer_name || "Prospect WhatsApp",
        customer_phone: cleanLocalPhone || senderPhone,
        customer_phone2: "",
        city: previousLead?.city || "Cotonou",
        address: `Question WhatsApp : "${incomingText.slice(0, 120)}"`,
        product_slug: agentResult.detectedSlug,
        product_title: agentResult.detectedProductTitle,
        bundle_name: "Discussion WhatsApp en cours",
        total_amount: finalPrice,
        status:
          previousLead?.status === "converted" ? "converted" : "abandoned",
        created_at: previousLead?.created_at || now,
        updated_at: now,
      };

      try {
        await supabase
          .from("leads")
          .upsert([leadPayload], { onConflict: "id" });
      } catch {}

      if (!isSimulation && !previousLead) {
        sendAbandonedLeadNotification(leadPayload).catch(() => {});
      }
    }

    // Envoyer la réponse automatique au client sur WhatsApp via Green-API
    let sentViaGreenApi = false;
    if (!isSimulation && chatId && apiTokenInstance) {
      const sendRes = await sendGreenApiWhatsAppMessage({
        chatId,
        message: agentResult.replyText,
        idInstance,
        apiTokenInstance,
      });
      sentViaGreenApi = sendRes.ok;
    }

    return NextResponse.json({
      ok: true,
      reply: agentResult.replyText,
      detectedSlug: agentResult.detectedSlug,
      detectedProductTitle: agentResult.detectedProductTitle,
      detectedPrice: finalPrice,
      isOrderComplete: agentResult.isOrderComplete,
      intent: agentResult.intent,
      orderRef: agentResult.isOrderComplete ? orderRef : null,
      sentViaGreenApi,
    });
  } catch (err: any) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ── PUT : Configuration automatique 1-clic de l'instance Green-API depuis l'Admin (/admin/whatsapp) ──
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Paramètres manquants" }, { status: 400 });
    }

    const idInstance = String(
      body.idInstance || process.env.GREEN_API_ID_INSTANCE || "710722786457"
    ).trim();
    const apiTokenInstance = String(
      body.apiTokenInstance ||
        process.env.GREEN_API_TOKEN_INSTANCE ||
        "99dea8e77aaf4ca383583b213ab2a5b37f0b3f9114fa48e59d"
    ).trim();
    const action = String(body.action || "status");
    const prefix = idInstance.slice(0, 4);
    const baseUrl = `https://${prefix}.api.greenapi.com/waInstance${idInstance}`;

    if (!idInstance || !apiTokenInstance) {
      return NextResponse.json(
        { ok: false, error: "Veuillez saisir votre apiTokenInstance Green-API" },
        { status: 400 }
      );
    }

    // Action 1 : Vérifier l'état de l'instance (authorized / notAuthorized) + récupérer le QR Code si besoin
    if (action === "status") {
      const stateRes = await fetch(
        `${baseUrl}/getStateInstance/${apiTokenInstance}`,
        { cache: "no-store" }
      );
      if (!stateRes.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: "Identifiants Green-API invalides (vérifiez idInstance et apiTokenInstance)",
          },
          { status: 400 }
        );
      }
      const stateData = await stateRes.json();
      let qrCodeBase64: string | null = null;

      if (stateData?.stateInstance === "notAuthorized") {
        try {
          const qrRes = await fetch(`${baseUrl}/qr/${apiTokenInstance}`, {
            cache: "no-store",
          });
          if (qrRes.ok) {
            const qrData = await qrRes.json();
            if (qrData?.type === "qrCode" && qrData?.message) {
              qrCodeBase64 = `data:image/png;base64,${qrData.message}`;
            }
          }
        } catch {}
      }

      return NextResponse.json({
        ok: true,
        stateInstance: stateData?.stateInstance || "unknown",
        qrCodeBase64,
      });
    }

    // Action 2 : Configurer automatiquement le Webhook Green-API vers notre site en 1 clic !
    if (action === "configure_webhook") {
      const siteOrigin =
        body.siteOrigin || "https://isivente.vercel.app";
      const webhookUrl = `${siteOrigin}/api/whatsapp/webhook?instance=${encodeURIComponent(
        idInstance
      )}&token=${encodeURIComponent(apiTokenInstance)}`;

      const settingsRes = await fetch(
        `${baseUrl}/setSettings/${apiTokenInstance}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl,
            webhookUrlToken: "",
            incomingWebhook: "yes",
            outgoingMessageWebhook: "no",
            outgoingAPIMessageWebhook: "no",
            stateWebhook: "no",
          }),
        }
      );

      if (!settingsRes.ok) {
        return NextResponse.json(
          { ok: false, error: "Impossible de configurer le Webhook sur Green-API" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        webhookUrl,
        message: "Webhook Green-API activé automatiquement avec succès !",
      });
    }

    return NextResponse.json({ ok: false, error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Erreur réseau Green-API" },
      { status: 500 }
    );
  }
}

