"use client";

import React, { useState } from "react";
import { ShieldCheck, Truck, Zap, MessageCircle, Check, ArrowRight } from "lucide-react";

const THEME_PRESETS = [
  { id: "emerald", name: "Émeraude COD", color: "#059669", store: "Cotonou Express", city: "Cotonou" },
  { id: "indigo", name: "Indigo Tech", color: "#4F46E5", store: "Abidjan Tech", city: "Abidjan" },
  { id: "amber", name: "Or Prestige", color: "#B45309", store: "Dakar Luxe", city: "Dakar" },
  { id: "rose", name: "Corail Beauté", color: "#E11D48", store: "Lomé Glow", city: "Lomé" },
];

export default function SaasThemePreview() {
  const [active, setActive] = useState(THEME_PRESETS[0]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Colonne Gauche : Explication + Sélecteur interactif */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Thème COD Haute-Conversion Inclus
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
              Changez la couleur de votre marque en 1 clic — zéro thème à payer
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Testez ci-dessous : chaque boutique adapte automatiquement ses boutons, son formulaire
              anti-plaisantins et ses badges à son identité visuelle. Tout est pensé pour convertir
              sur smartphone en Afrique.
            </p>
          </div>

          {/* Boutons de sélection de thème */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Essayez un style en direct :
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = active.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setActive(preset)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-slate-900 shadow-md ring-2 ring-slate-900/10"
                        : "bg-slate-50/80 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-xl shrink-0 shadow-inner flex items-center justify-center text-white"
                      style={{ backgroundColor: preset.color }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{preset.store}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-lg font-black font-mono text-slate-950">&lt; 1s</div>
              <div className="text-[11px] text-slate-500 font-medium">Chargement 3G/4G</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-lg font-black font-mono text-slate-950">0 F</div>
              <div className="text-[11px] text-slate-500 font-medium">Thème inclus</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-lg font-black font-mono text-slate-950">100%</div>
              <div className="text-[11px] text-slate-500 font-medium">Isolé par vendeur</div>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Aperçu Smartphone Live */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[340px] rounded-[2.4rem] bg-slate-950 p-2.5 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.35)] border border-slate-800">
            <div className="bg-[#FAFBFC] rounded-[1.9rem] overflow-hidden text-slate-900">
              {/* Topbar annonce */}
              <div
                className="text-white text-[9.5px] font-bold py-1.5 px-3 text-center tracking-wide transition-colors duration-300"
                style={{ backgroundColor: active.color }}
              >
                LIVRAISON 24H {active.city.toUpperCase()} • PAIEMENT À LA RÉCEPTION
              </div>

              {/* Header boutique */}
              <div className="bg-white px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: active.color }}
                  />
                  <span className="font-extrabold text-xs text-slate-900">{active.store}</span>
                </div>
                <span
                  className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: active.color }}
                >
                  Commander (19 900 F)
                </span>
              </div>

              {/* Contenu maquette */}
              <div className="p-4 space-y-3.5">
                <div className="text-center space-y-1">
                  <div className="text-[13px] font-black text-slate-950 leading-snug">
                    Ampoule Caméra Wi-Fi 360° + Carte SD Offerte
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="text-sm font-black font-mono transition-colors duration-300"
                      style={{ color: active.color }}
                    >
                      19 900 FCFA
                    </span>
                    <span className="text-[11px] text-slate-400 line-through font-mono">
                      35 000 F
                    </span>
                    <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      -43%
                    </span>
                  </div>
                </div>

                {/* 3 badges */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-white border border-slate-200/80 rounded-xl p-2 space-y-0.5">
                    <Truck className="w-3.5 h-3.5 mx-auto text-emerald-600" />
                    <div className="text-[9px] font-bold text-slate-800">24h Express</div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-xl p-2 space-y-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 mx-auto text-indigo-600" />
                    <div className="text-[9px] font-bold text-slate-800">Test &amp; Pay</div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-xl p-2 space-y-0.5">
                    <Zap className="w-3.5 h-3.5 mx-auto text-amber-600" />
                    <div className="text-[9px] font-bold text-slate-800">100% Neuf</div>
                  </div>
                </div>

                {/* Mini Formulaire COD */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-3 space-y-2 shadow-xs">
                  <div className="h-7 rounded-lg bg-slate-50 border border-slate-200 px-2.5 flex items-center text-[10px] text-slate-400">
                    Nom complet (ex: Koffi Mensah)
                  </div>
                  <div className="h-7 rounded-lg bg-slate-50 border border-slate-200 px-2.5 flex items-center text-[10px] text-slate-400">
                    Téléphone WhatsApp
                  </div>
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-[9.5px] text-slate-700">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Je confirme être disponible et avoir les 19 900 F prêts.</span>
                  </div>
                  <div
                    className="w-full py-2.5 rounded-xl text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-colors duration-300"
                    style={{ backgroundColor: active.color }}
                  >
                    <span>Confirmer ma commande (19 900 F)</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center justify-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>Commander sur WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
