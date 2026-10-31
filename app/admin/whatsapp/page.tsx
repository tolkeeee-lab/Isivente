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
  Sparkles,
  Bot,
  Smartphone,
  ExternalLink,
  Terminal,
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
  // Statut Baileys Local (100% Gratuit & Illimité)
  const [baileysStatus, setBaileysStatus] = useState<{
    running: boolean;
    status: string;
    qrCodeBase64: string | null;
    connectedPhone: string | null;
    logs: string[];
  }>({
    running: false,
    status: "offline",
    qrCodeBase64: null,
    connectedPhone: null,
    logs: [],
  });

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

  const checkBaileysServer = async () => {
    try {
      const res = await fetch("http://localhost:4040/status", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setBaileysStatus({
          running: true,
          status: data.status || "starting",
          qrCodeBase64: data.qrCodeBase64 || null,
          connectedPhone: data.connectedPhone || null,
          logs: Array.isArray(data.logs) ? data.logs : [],
        });
        return;
      }
    } catch {}
    setBaileysStatus((prev) => ({ ...prev, running: false }));
  };

  useEffect(() => {
    checkBaileysServer();
    const interval = setInterval(checkBaileysServer, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-[staggerFadeUp_220ms_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* ── EN-TÊTE ── */}
      <div className="card-figma p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
                Agent & Répondeur WhatsApp 24/7
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Gratuit & Numéros Illimités (Baileys)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Répond automatiquement à tous tes clients sur WhatsApp, lève les objections et crée les commandes dans ton Admin.
            </p>
          </div>
        </div>

        <a
          href="http://localhost:4040"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all"
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Ouvrir la Console QR Code (Port 4040)</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* ── GRILLE : SERVEUR BAILEYS ILLIMITÉ (GAUCHE) & SIMULATEUR LIVE (DROITE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE (6/12) : CONNEXION QR CODE ILLIMITÉE BAILEYS */}
        <div className="lg:col-span-6 card-figma p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>1. Connexion WhatsApp Illimitée (Baileys)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Zéro abonnement, zéro limite de 3 numéros : répond à 100 % des clients.
              </p>
            </div>

            {baileysStatus.running && baileysStatus.status === "connected" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connecté ({baileysStatus.connectedPhone})
              </span>
            ) : baileysStatus.running ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                <QrCode className="w-3.5 h-3.5" />
                Prêt à scanner
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                Serveur local en pause
              </span>
            )}
          </div>

          {/* QR CODE EN DIRECT SI DISPONIBLE */}
          {baileysStatus.running && baileysStatus.qrCodeBase64 && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-500 text-center space-y-3">
              <div className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                📱 Scanne ce QR Code avec ton WhatsApp (Appareils connectés)
              </div>
              <img
                src={baileysStatus.qrCodeBase64}
                alt="QR Code WhatsApp Illimité"
                className="w-56 h-56 mx-auto rounded-2xl bg-white border border-emerald-200 p-2 shadow-sm"
              />
              <p className="text-xs text-slate-600">
                Sur ton téléphone : <strong>WhatsApp &rarr; Appareils connectés &rarr; Connecter un appareil</strong>
              </p>
            </div>
          )}

          {/* STATUT CONNECTÉ */}
          {baileysStatus.running && baileysStatus.status === "connected" && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-950 text-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-sm">
                  Ton WhatsApp ({baileysStatus.connectedPhone}) est connecté en illimité !
                </div>
                <p className="text-emerald-800 mt-0.5">
                  Tous les clients qui t&apos;écrivent reçoivent automatiquement la réponse d&apos;Awa et leurs commandes sont créées dans <strong>Commandes &amp; Dispatch</strong>.
                </p>
              </div>
            </div>
          )}

          {/* JOURNAL EN DIRECT */}
          {baileysStatus.logs.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Activité WhatsApp en direct :</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] max-h-44 overflow-y-auto leading-relaxed">
                {baileysStatus.logs.join("\n")}
              </pre>
            </div>
          )}

          {/* COMMANDE DE LANCEMENT */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div className="font-bold text-slate-900">
              Comment lancer le Bot Illimité sur ton PC :
            </div>
            <p className="text-slate-600 text-[11.5px]">
              Lance simplement la commande <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-900">node whatsapp-bot/server.mjs</code> (ou ouvre <a href="http://localhost:4040" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">http://localhost:4040</a>).
            </p>
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
