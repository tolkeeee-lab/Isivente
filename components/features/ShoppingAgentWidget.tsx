"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Flame,
  ChevronDown
} from "lucide-react";
import { AgentMessage, getLocalAgentResponse } from "@/lib/commerceAgent";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";

interface ShoppingAgentWidgetProps {
  slug: string;
}

const QUICK_QUESTIONS = [
  { label: "🚚 Délai de livraison ?", query: "Quel est le délai de livraison à Cotonou et Calavi ?" },
  { label: "💵 Paiement à la réception ?", query: "Comment fonctionne le paiement en espèces à la livraison ?" },
  { label: "🛡️ Tester avant de payer ?", query: "Est-ce que je peux ouvrir et tester le colis avant de payer le livreur ?" },
  { label: "📝 Passer commande", query: "Je souhaite passer commande pour ce produit." }
];

export default function ShoppingAgentWidget({ slug }: ShoppingAgentWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggeredBubble, setHasTriggeredBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const product = DEFAULT_CATALOG_MAP[slug.toLowerCase()];
  const productTitle = product?.shortTitle || product?.title || "ce produit";

  // Apparition de la petite bulle d'accroche après 6 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTriggeredBubble(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // Initialisation du premier message d'accueil de l'agent
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "agent",
          text: `Bonjour et bienvenue sur **Isivente** ! 👋\n\nJe suis Awa, votre conseillère. Avez-vous une question sur la livraison sous 24h ou le paiement à la réception pour **${productTitle}** ?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
    }
  }, [productTitle, messages.length]);

  // Scroll automatique au dernier message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const scrollToOrderSection = () => {
    setIsOpen(false);
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = el.querySelector("input[type='text'], input[type='tel']") as HTMLInputElement | null;
        if (input) input.focus({ preventScroll: true });
      }, 500);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: AgentMessage = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Appel API backend
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          slug: slug,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setTimeout(() => {
            setMessages((prev) => [...prev, data.reply]);
            setIsTyping(false);
          }, 400);
          return;
        }
      }
      throw new Error("Fallback local");
    } catch {
      // Fallback local instantané
      setTimeout(() => {
        const localReply = getLocalAgentResponse(text, slug);
        setMessages((prev) => [...prev, localReply]);
        setIsTyping(false);
      }, 400);
    }
  };

  const handleQuickQuestion = (query: string) => {
    handleSendMessage(query);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const whatsappMessage = `Bonjour Isivente, je suis sur la page de ${productTitle} et j'ai une question avant de commander.`;
  const whatsappUrl = `https://wa.me/2290192901817?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 select-none font-sans">
      
      {/* ── BULLE D'ACCROCHE INITIALE (PROMPT PROSPECT) ── */}
      {!isOpen && hasTriggeredBubble && !bubbleDismissed && (
        <div className="mb-2.5 max-w-[270px] bg-white p-3 rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-900/10 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBubbleDismissed(true);
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-[10px] cursor-pointer"
            title="Fermer"
          >
            ✕
          </button>
          <div 
            onClick={() => setIsOpen(true)}
            className="cursor-pointer space-y-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-bold text-slate-900">Awa de chez Isivente</p>
            </div>
            <p className="text-xs text-slate-600 leading-tight">
              Une question sur la livraison ou le paiement pour <strong>{productTitle}</strong> ?
            </p>
          </div>
        </div>
      )}

      {/* ── BOUTON FLOTTANT D'OUVERTURE DU CHAT ── */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setBubbleDismissed(true);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all cursor-pointer border border-slate-700/50"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">Conseiller Isivente</p>
            <p className="text-[10px] text-emerald-400 font-medium">En ligne • Réponse immédiate</p>
          </div>
        </button>
      )}

      {/* ── FENÊTRE DE CHAT DÉPLIÉE ── */}
      {isOpen && (
        <div className="w-[330px] sm:w-[370px] h-[490px] sm:h-[530px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header du Chat */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-tight">Awa • Isivente Bénin</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                    Officiel
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Livraison 24h & Paiement à réception</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Réduire"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Corps des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc] text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-xs shadow-xs"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs"
                  }`}
                >
                  {m.text}

                  {/* Bouton d'action contextuel intégré */}
                  {m.action && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={scrollToOrderSection}
                        className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-[11px] inline-flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>{m.action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 max-w-[100px] bg-white rounded-2xl border border-slate-200 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions de questions rapides en 1 clic */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto scrollbar-none flex gap-1.5">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q.query)}
                className="shrink-0 text-[10px] font-semibold bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Lien WhatsApp de secours & Champ de Saisie */}
          <div className="p-3 bg-white border-t border-slate-200/80 space-y-2">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Posez votre question ici..."
                className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer"
                title="Envoyer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Conseillère disponible 7j/7</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <span>WhatsApp Direct</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
