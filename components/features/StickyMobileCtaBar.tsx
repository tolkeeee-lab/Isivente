"use client";

import React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";

interface StickyMobileCtaBarProps {
  price: number | string;
  targetSectionId?: string;
  accentColor?: string;
  buttonText?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export default function StickyMobileCtaBar({
  price,
  targetSectionId = "commander",
  accentColor = "#FF5C93",
  buttonText = "Commander",
  whatsappNumber = "2290192901817",
  whatsappMessage = "Bonjour ! J'ai une question concernant le produit.",
}: StickyMobileCtaBarProps) {
  const fmt = (n: number | string) => {
    if (typeof n === "string") return n;
    return new Intl.NumberFormat("fr-FR").format(n);
  };

  const handleScrollToForm = () => {
    const el = document.getElementById(targetSectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const input = (document.getElementById("customer-name-input") ||
          el.querySelector("input[type='text'], input[type='tel']")) as HTMLInputElement | null;
        if (input) input.focus({ preventScroll: true });
      }, 400);
    }
  };

  return (
    <>
      {/* 📱 BARRE FIXE EN BAS SUR MOBILE (PRIX & BOUTON TOUJOURS ACCESSIBLES) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 px-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 max-w-full">
        <div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Prix promo :
          </div>
          <div
            className="font-display font-black text-base font-mono tabular-nums leading-none mt-0.5"
            style={{ color: accentColor }}
          >
            {fmt(price)} FCFA
          </div>
        </div>
        <button
          type="button"
          onClick={handleScrollToForm}
          className="text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 💬 BOUTON FLOTTANT WHATSAPP ASSISTANCE */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 md:bottom-6 right-4 z-40 bg-[#25D366] hover:bg-[#20BD5A] text-white p-3 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border-2 border-white"
        title="Besoin d'aide ? Écrivez-nous sur WhatsApp (+229 01 92 90 18 17)"
      >
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
      </a>
    </>
  );
}
