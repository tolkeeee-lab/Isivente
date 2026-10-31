import http from "node:http";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import pino from "pino";

const PORT = process.env.WHATSAPP_BOT_PORT || 4040;
const WEBHOOK_URL =
  process.env.ISIVENTE_WEBHOOK_URL ||
  "https://isivente.vercel.app/api/whatsapp/webhook";

let currentStatus = "starting"; // "starting" | "qr_ready" | "connected" | "disconnected"
let currentQrDataUrl = null;
let connectedPhone = null;
let sockInstance = null;
const recentLogs = [];

function addLog(text) {
  const entry = `[${new Date().toLocaleTimeString("fr-FR")}] ${text}`;
  console.log(entry);
  recentLogs.unshift(entry);
  if (recentLogs.length > 40) recentLogs.pop();
}

async function startBaileysBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      ".whatsapp-session"
    );
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Isivente Bot 24/7", "Chrome", "1.0.0"],
      syncFullHistory: false,
    });

    sockInstance = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentStatus = "qr_ready";
        currentQrDataUrl = await QRCode.toDataURL(qr, {
          width: 320,
          margin: 2,
        });
        addLog(
          "Nouveau QR Code généré ! Ouvre http://localhost:" +
            PORT +
            " ou /admin/whatsapp pour scanner."
        );
      }

      if (connection === "open") {
        currentStatus = "connected";
        currentQrDataUrl = null;
        connectedPhone = sock.user?.id?.split(":")[0] || "Connecté";
        addLog(
          `✅ CONNECTÉ EN ILLIMITÉ sur WhatsApp (${connectedPhone}) ! Awa écoute tous tes clients 24/7.`
        );
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        currentStatus = "disconnected";
        addLog(
          `Connexion fermée (code ${statusCode}). Reconnexion auto : ${shouldReconnect}`
        );
        if (shouldReconnect) {
          setTimeout(startBaileysBot, 3000);
        } else {
          addLog(
            "Session déconnectée. Supprime le dossier .whatsapp-session ou relance pour scanner un nouveau QR."
          );
        }
      }
    });

    // Réception de TOUS les messages entrants sans aucune limite de numéros !
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        try {
          if (!msg.message) continue;
          // Ignorer les messages envoyés par nous-mêmes
          if (msg.key.fromMe) continue;

          const remoteJid = msg.key.remoteJid || "";
          // Ignorer les groupes (@g.us), les chaînes (@newsletter) et les statuts (status@broadcast)
          if (
            !remoteJid ||
            remoteJid.endsWith("@g.us") ||
            remoteJid.endsWith("@newsletter") ||
            remoteJid.includes("status")
          ) {
            continue;
          }

          // Extraire le texte du message
          const incomingText =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            "";

          if (!incomingText || !incomingText.trim()) continue;

          const senderPhone = remoteJid
            .replace("@s.whatsapp.net", "")
            .replace("@c.us", "")
            .replace(/\D/g, "");
          const senderName = msg.pushName || "Client WhatsApp";

          addLog(
            `📩 Message reçu de ${senderName} (${senderPhone}) : "${incomingText.slice(
              0,
              60
            )}"`
          );

          // Simuler "en train d'écrire..." sur le WhatsApp du client pendant 1.5s
          await sock.sendPresenceUpdate("composing", remoteJid);

          // Appeler le cerveau Awa sur Isivente (/api/whatsapp/webhook)
          const res = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source: "baileys",
              typeWebhook: "incomingMessageReceived",
              senderData: {
                chatId: `${senderPhone}@c.us`,
                senderName,
              },
              messageData: {
                textMessageData: {
                  textMessage: incomingText,
                },
              },
            }),
          });

          const data = await res.json();
          if (data && data.ok && data.reply) {
            await new Promise((r) => setTimeout(r, 1400));
            await sock.sendPresenceUpdate("paused", remoteJid);
            await sock.sendMessage(remoteJid, { text: data.reply });
            addLog(
              `🤖 Réponse envoyée à ${senderName} (${data.detectedSlug} - ${data.intent})`
            );
          }
        } catch (err) {
          addLog(`⚠️ Erreur traitement message : ${err?.message || err}`);
        }
      }
    });
  } catch (err) {
    addLog(`Erreur critique démarrage Baileys : ${err?.message || err}`);
    setTimeout(startBaileysBot, 5000);
  }
}

// Serveur HTTP local (port 4040) avec CORS activé pour que /admin/whatsapp puisse afficher le QR Code et le statut en direct !
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        status: currentStatus,
        qrCodeBase64: currentQrDataUrl,
        connectedPhone,
        logs: recentLogs,
      })
    );
    return;
  }

  // Page Web directe sur http://localhost:4040
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Bot WhatsApp Illimité Isivente (Baileys)</title>
  <meta http-equiv="refresh" content="4" />
  <style>
    body { font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a; max-width: 680px; margin: 32px auto; padding: 0 16px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .ok { background: #dcfce7; color: #166534; }
    .wait { background: #fef3c7; color: #92400e; }
    pre { background: #0f172a; color: #f8fafc; padding: 14px; border-radius: 12px; font-size: 12px; overflow-x: auto; max-height: 260px; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin-top:0">🤖 Isivente — Bot WhatsApp 100% Gratuit & Illimité</h2>
    <p>Statut : <span class="badge ${
      currentStatus === "connected" ? "ok" : "wait"
    }">${
    currentStatus === "connected"
      ? "✅ CONNECTÉ (" + connectedPhone + ")"
      : currentStatus === "qr_ready"
      ? "📱 EN ATTENTE DE SCAN QR CODE"
      : "⏳ CONNEXION EN COURS..."
  }</span></p>
    ${
      currentQrDataUrl
        ? `<div style="text-align:center; margin: 20px 0;">
            <p><strong>Scanne ce QR Code avec ton WhatsApp (Appareils connectés) :</strong></p>
            <img src="${currentQrDataUrl}" style="width:260px;height:260px;border:2px solid #10b981;border-radius:16px;padding:8px;" />
           </div>`
        : ""
    }
    <h4>Journal d'activité en direct :</h4>
    <pre>${recentLogs.join("\n") || "Aucun événement pour le moment..."}</pre>
  </div>
</body>
</html>`);
});

server.listen(PORT, () => {
  addLog(
    `🚀 Serveur Bot WhatsApp Illimité démarré sur http://localhost:${PORT}`
  );
  startBaileysBot();
});
