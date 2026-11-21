"use client";

import React, { useState } from "react";
import { ShieldCheck, Truck, Zap, MessageCircle, Check, ArrowRight } from "lucide-react";

const THEME_PRESETS = [
  { id: "emerald", name: "Émeraude", color: "#15803d", store: "Cotonou Express", city: "Cotonou" },
  { id: "ink", name: "Ardoise", color: "#1e293b", store: "Abidjan Tech", city: "Abidjan" },
  { id: "ochre", name: "Ocre", color: "#b45309", store: "Dakar Atelier", city: "Dakar" },
  { id: "terracotta", name: "Terracotta", color: "#be123c", store: "Lomé Beauté", city: "Lomé" },
];

export default function SaasThemePreview() {
  const [active, setActive] = useState(THEME_PRESETS[0]);

  return (
    <div className="w-full max-w-[380px] mx-auto space-y-4">
      {/* Sélecteur de couleur sobre */}
      <div className="flex items-center justify-between gap-2 bg-[#fdfbf7] border border-black/[0.08] rounded-[12px] p-2">
        <span className="text-[12px] text-[#7b7266] pl-2 shrink-0">
          Couleur boutique
        </span>
        <div className="flex items-center gap-1.5">
          {THEME_PRESETS.map((preset) => {
            const isSelected = active.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActive(preset)}
                title={`${preset.name} — ${preset.store}`}
                className={`h-7 px-2.5 rounded-[8px] text-[12px] inline-flex items-center gap-1.5 transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-[#efe9df] text-[#1f1b16] font-medium"
                    : "text-[#7b7266] hover:text-[#1f1b16]"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="hidden sm:inline">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aperçu smartphone réel */}
      <div className="rounded-[28px] bg-[#1f1b16] p-2.5 shadow-[0_12px_32px_rgba(31,27,22,0.14)]">
        <div className="bg-[#fafafa] rounded-[20px] overflow-hidden text-[#171717]">
          {/* Bandeau livraison */}
          <div
            className="text-white text-[11px] font-medium py-2 px-3 text-center transition-colors duration-200"
            style={{ backgroundColor: active.color }}
          >
            Livraison 24h {active.city} · Paiement à la réception
          </div>

          {/* En-tête boutique */}
          <div className="bg-white px-4 py-3 border-b border-black/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full transition-colors duration-200"
                style={{ backgroundColor: active.color }}
              />
              <span className="font-medium text-[13px] text-[#171717]">{active.store}</span>
            </div>
            <span
              className="text-white text-[11px] font-medium px-2.5 py-1 rounded-[6px] font-mono tabular-nums transition-colors duration-200"
              style={{ backgroundColor: active.color }}
            >
              19 900 F
            </span>
          </div>

          {/* Fiche produit & formulaire COD */}
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="text-[14px] font-medium text-[#171717] leading-snug">
                Ampoule Caméra Wi-Fi 360° avec carte mémoire incluse
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[16px] font-medium font-mono tabular-nums transition-colors duration-200"
                  style={{ color: active.color }}
                >
                  19 900 F
                </span>
                <span className="text-[12px] text-[#737373] line-through font-mono tabular-nums">
                  35 000 F
                </span>
              </div>
            </div>

            {/* 3 points de réassurance */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border border-black/[0.08] rounded-[10px] p-2 text-center space-y-1">
                <Truck className="w-3.5 h-3.5 mx-auto stroke-[1.5] text-[#525252]" />
                <div className="text-[11px] text-[#525252]">Livré 24h</div>
              </div>
              <div className="bg-white border border-black/[0.08] rounded-[10px] p-2 text-center space-y-1">
                <ShieldCheck className="w-3.5 h-3.5 mx-auto stroke-[1.5] text-[#525252]" />
                <div className="text-[11px] text-[#525252]">Testé avant</div>
              </div>
              <div className="bg-white border border-black/[0.08] rounded-[10px] p-2 text-center space-y-1">
                <Zap className="w-3.5 h-3.5 mx-auto stroke-[1.5] text-[#525252]" />
                <div className="text-[11px] text-[#525252]">Cash reçu</div>
              </div>
            </div>

            {/* Formulaire COD */}
            <div className="bg-white rounded-[12px] border border-black/[0.08] p-3 space-y-2">
              <div className="h-8 rounded-[8px] bg-[#fafafa] border border-black/[0.08] px-3 flex items-center text-[12px] text-[#737373]">
                Koffi Mensah
              </div>
              <div className="h-8 rounded-[8px] bg-[#fafafa] border border-black/[0.08] px-3 flex items-center text-[12px] font-mono text-[#737373]">
                +229 01 97 00 00 00
              </div>
              <div className="flex items-start gap-2 p-2 rounded-[8px] bg-[#f4f4f5] text-[11px] text-[#525252] leading-snug">
                <Check className="w-3.5 h-3.5 text-[#15803d] stroke-[1.75] shrink-0 mt-0.5" />
                <span>Je confirme être disponible et avoir 19 900 F prêts à la livraison</span>
              </div>
              <div
                className="w-full h-9 rounded-[8px] text-white font-medium text-[12px] flex items-center justify-center gap-1.5 transition-colors duration-200"
                style={{ backgroundColor: active.color }}
              >
                <span>Confirmer la commande</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
              <div className="w-full h-8 rounded-[8px] bg-white border border-black/[0.08] text-[#171717] font-medium text-[12px] flex items-center justify-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 stroke-[1.5] text-[#15803d]" />
                <span>Commander sur WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
