"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
  QrCode,
  Zap,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Bot,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { getAdminDashboardProducts } from "@/lib/defaultCatalog";

interface SimulatedChatMsg {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  badge?: string;
}

export default function AdminWhatsAppPage() {
  const [idInstance, setIdInstance] = useState("710722786456");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [instanceState, setInstanceState] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Simulateur de conversation
  const products = getAdminDashboardProducts();
  const [selectedSlug, setSelectedSlug] = useState("pare-soleil");
  const [simInput, setSimInput] = useState("");
  const [simSending, setSimSending] = useState(false);
  const [chatHistory, setChatHistory] = useState<SimulatedChatMsg[]>([
    {
      id: "init-1",
      sender: "bot",
      text: "Simulateur Awa (Agent IA WhatsApp Isivente) prêt ! Clique sur un bouton d'objection ci-dessous ou écris un message comme le ferait un client sur WhatsApp.",
      time: "En direct",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedId = localStorage.getItem("isivente_greenapi_id");
      const savedToken = localStorage.getItem("isivente_greenapi_token");
      if (savedId) setIdInstance(savedId);
      if (savedToken) setApiTokenInstance(savedToken);
    } catch {}
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const saveCredentialsLocally = (id: string, token: string) => {
    try {
      localStorage.setItem("isivente_greenapi_id", id.trim());
      localStorage.setItem("isivente_greenapi_token", token.trim());
    } catch {}
  };

  const handleCheckStatusAndQr = async () => {
    if (!apiTokenInstance.trim()) {
      setFeedbackMsg({
        type: "error",
        text: "Colle d'abord ton ApiTokenInstance (visible quand tu cliques sur l'instance 710722786456 dans Green-API).",
      });
      return;
    }

    setStatusLoading(true);
    setFeedbackMsg(null);
    saveCredentialsLocally(idInstance, apiTokenInstance);

    try {
      const res = await fetch("/api/whatsapp/webhook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          idInstance: idInstance.trim(),
          apiTokenInstance: apiTokenInstance.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Impossible de joindre Green-API.",
        });
      } else {
        setInstanceState(data.stateInstance);
        setQrCodeBase64(data.qrCodeBase64 || null);
        if (data.stateInstance === "authorized") {
          setFeedbackMsg({
            type: "success",
            text: "Ton WhatsApp est bien connecté (Authorized) ! Clique maintenant sur 'Activer le Webhook Automatique'.",
          });
        } else {
          setFeedbackMsg({
            type: "error",
            text: "Ton instance est 'Not Authorized'. Scanne le QR Code ci-dessous (ou sur Green-API) avec ton téléphone WhatsApp !",
          });
        }
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: "Erreur réseau lors de la vérification Green-API.",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleConfigureWebhookOneClick = async () => {
    if (!apiTokenInstance.trim()) {
      setFeedbackMsg({
        type: "error",
        text: "Colle d'abord ton ApiTokenInstance dans le champ prévu.",
      });
      return;
    }

    setWebhookLoading(true);
    setFeedbackMsg(null);
    saveCredentialsLocally(idInstance, apiTokenInstance);

    const origin =
      typeof window !== "undefined" && !window.location.origin.includes("localhost")
        ? window.location.origin
        : "https://isivente.vercel.app";

    try {
      const res = await fetch("/api/whatsapp/webhook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "configure_webhook",
          idInstance: idInstance.trim(),
          apiTokenInstance: apiTokenInstance.trim(),
          siteOrigin: origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Échec de la configuration du Webhook.",
        });
      } else {
        setFeedbackMsg({
          type: "success",
          text: "✅ Webhook activé automatiquement sur Green-API ! Dès qu'un client t'écrit sur WhatsApp, Awa lui répondra et enregistrera ses commandes dans ton Admin.",
        });
      }
    } catch {
      setFeedbackMsg({
        type: "error",
        text: "Erreur lors de la connexion à Green-API.",
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const sendSimulatedMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || simSending) return;

    const userMsg: SimulatedChatMsg = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: clean,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setSimInput("");
    setSimSending(true);

    try {
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "simulate",
          phone: "2290197123456",
          senderName: "Moussa (Test)",
          message: clean,
          slug: selectedSlug,
        }),
      });
      const data = await res.json();
      if (data.ok && data.reply) {
        const botMsg: SimulatedChatMsg = {
          id: `b_${Date.now()}`,
          sender: "bot",
          text: data.reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          badge: data.isOrderComplete
            ? `Commande créée (${data.orderRef})`
            : "Prospect capturé dans Paniers Abandonnés",
        };
        setChatHistory((prev) => [...prev, botMsg]);
      }
    } catch {}
    setSimSending(false);
  };

  const selectedProductObj =
    products.find((p) => p.slug === selectedSlug) || products[0];

  const webhookFullUrl = `https://isivente.vercel.app/api/whatsapp/webhook?instance=${encodeURIComponent(
    idInstance.trim()
  )}&token=${encodeURIComponent(apiTokenInstance.trim() || "TON_TOKEN")}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-[staggerFadeUp_220ms_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* ── EN-TÊTE ── */}
      <div className="card-figma p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
                Agent & Répondeur WhatsApp 24/7
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Green-API Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Répond automatiquement aux clients sur WhatsApp, lève les objections et crée les commandes dans ton Admin.
            </p>
          </div>
        </div>

        <a
          href="https://console.green-api.com/instanceList"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all"
        >
          <Smartphone className="w-4 h-4" />
          <span>Ouvrir ma Console Green-API</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ── GRILLE : CONNEXION GREEN-API (GAUCHE) & SIMULATEUR LIVE (DROITE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE (6/12) : CONFIGURATION 1-CLIC GREEN-API */}
        <div className="lg:col-span-6 card-figma p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>1. Connecter ton Instance Green-API en 3 clics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ton instance <code className="font-mono font-bold text-slate-800">710722786456</code> est déjà pré-remplie ci-dessous !
            </p>
          </div>

          {/* Guide rapide 3 étapes */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
            <div className="font-bold text-slate-900">
              Que faire sur ton écran Green-API ?
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11.5px] leading-relaxed">
              <li>
                Clique sur la carte <strong>Instance 710722786456 (WhatsApp: Developer)</strong>.
              </li>
              <li>
                Copie la ligne <strong>apiTokenInstance</strong> et colle-la dans la case ci-dessous.
              </li>
              <li>
                Clique sur <strong>&laquo; Obtenir le QR Code / Vérifier &raquo;</strong> pour scanner avec ton WhatsApp, puis sur <strong>&laquo; Activer le Webhook en 1 clic &raquo;</strong> !
              </li>
            </ol>
          </div>

          {/* Champs ID & Token */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ID de ton Instance (idInstance)
              </label>
              <input
                type="text"
                value={idInstance}
                onChange={(e) => setIdInstance(e.target.value)}
                placeholder="710722786456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clé secrète (apiTokenInstance)
              </label>
              <input
                type="text"
                value={apiTokenInstance}
                onChange={(e) => setApiTokenInstance(e.target.value)}
                placeholder="Colle ici ton apiTokenInstance depuis Green-API..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Boutons d'action 1-clic */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleCheckStatusAndQr}
              disabled={statusLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {statusLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4" />
              )}
              <span>Vérifier Statut / Afficher QR Code</span>
            </button>

            <button
              type="button"
              onClick={handleConfigureWebhookOneClick}
              disabled={webhookLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {webhookLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Activer le Webhook en 1 clic</span>
            </button>
          </div>

          {/* Message de retour */}
          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              {feedbackMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Affichage direct du QR Code s'il n'est pas encore scanné */}
          {qrCodeBase64 && (
            <div className="p-4 rounded-2xl bg-white border-2 border-emerald-500 text-center space-y-2">
              <div className="text-xs font-bold text-slate-900">
                Scanne ce QR Code avec ton WhatsApp (Appareils connectés) :
              </div>
              <img
                src={qrCodeBase64}
                alt="QR Code WhatsApp Green-API"
                className="w-52 h-52 mx-auto rounded-xl border border-slate-200 p-2"
              />
              <p className="text-[11px] text-slate-500">
                Une fois scanné sur ton téléphone, reclique sur &laquo; Activer le Webhook en 1 clic &raquo;.
              </p>
            </div>
          )}

          {/* Lien Webhook manuel au cas où */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-500">
              URL Webhook automatique reliée à ton site :
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookFullUrl}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookFullUrl);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedWebhook ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (6/12) : SIMULATEUR EN DIRECT DU BOT AWA */}
        <div className="lg:col-span-6 card-figma p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>2. Tester les réponses d&apos;Awa en direct</span>
              </h2>
              <p className="text-xs text-slate-500">
                Vois exactement comment ton Bot répond et crée les commandes tout seul :
              </p>
            </div>

            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
            >
              {products.map((prod) => (
                <option key={prod.slug} value={prod.slug}>
                  {prod.title.slice(0, 32)} ({prod.price} F)
                </option>
              ))}
            </select>
          </div>

          {/* Boutons de test 1-clic (Scénarios réels) */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                sendSimulatedMessage(
                  `Bonjour Isivente, je m'intéresse au ${selectedProductObj?.title}, mais le prix dépasse un peu mon budget. Avez-vous une remise ?`
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              💰 Tester objection &laquo; Prix trop élevé &raquo;
            </button>

            <button
              type="button"
              onClick={() =>
                sendSimulatedMessage(
                  `Bonjour, je veux vérifier si vous livrez le ${selectedProductObj?.title} dans ma ville et quel est le délai ?`
                )
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              🚚 Tester question &laquo; Livraison / Ville &raquo;
            </button>

            <button
              type="button"
              onClick={() =>
                sendSimulatedMessage(
                  "C'est bon pour moi ! Livrez-moi à Cotonou quartier Agla près de la pharmacie"
                )
              }
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
            >
              ✅ Tester don d&apos;adresse (Crée une vraie commande !)
            </button>
          </div>

          {/* Fenêtre de chat style WhatsApp */}
          <div className="h-[340px] overflow-y-auto rounded-2xl bg-[#efeae2] p-3.5 space-y-3 border border-slate-200">
            {chatHistory.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow-2xs ${
                    m.sender === "user"
                      ? "bg-[#d9fdd3] text-slate-900 rounded-tr-xs"
                      : "bg-white text-slate-900 rounded-tl-xs"
                  }`}
                >
                  {m.text}
                  <div className="text-[9.5px] text-slate-400 text-right mt-1">
                    {m.time}
                  </div>
                </div>
                {m.badge && (
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold inline-flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {m.badge}
                  </span>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Barre de saisie */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendSimulatedMessage(simInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              placeholder="Écris un message client (ex: Cotonou Zogbo rue de l'école)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={simSending}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
