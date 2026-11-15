"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, Trophy, ArrowRight, Clock } from "lucide-react";
import { trackCustomEvent } from "@/lib/metaPixel";

interface SpinToWinModalProps {
  productTitle?: string;
  originalPrice?: number;
  discountPrice?: number;
  discountPercentage?: number;
  onApplyDiscount: (newPrice: number) => void;
  storageKey?: string;
}

interface Segment {
  label: string;
  sublabel?: string;
  color: string;
  textColor: string;
  isWinner?: boolean;
}

const SEGMENTS: Segment[] = [
  {
    label: "-12%",
    sublabel: "14 900 F",
    color: "#7e22ce", // purple-700
    textColor: "#ffffff",
    isWinner: true,
  },
  {
    label: "Pas de chance",
    sublabel: "Réessaie",
    color: "#f8fafc",
    textColor: "#64748b",
  },
  {
    label: "Cadeau",
    sublabel: "Surprise",
    color: "#eab308", // amber-500
    textColor: "#ffffff",
  },
  {
    label: "Perdu",
    sublabel: "Dommage",
    color: "#f1f5f9",
    textColor: "#64748b",
  },
  {
    label: "Bon 1 000 F",
    sublabel: "Remise",
    color: "#9333ea", // purple-600
    textColor: "#ffffff",
  },
  {
    label: "Passe",
    sublabel: "Ton tour",
    color: "#f8fafc",
    textColor: "#64748b",
  },
  {
    label: "-5%",
    sublabel: "Duo",
    color: "#d97706", // amber-600
    textColor: "#ffffff",
  },
  {
    label: "Presque !",
    sublabel: "Dommage",
    color: "#f1f5f9",
    textColor: "#64748b",
  },
];

export default function SpinToWinModal({
  productTitle = "Masseur Vibrant Portable 2-en-1",
  originalPrice = 16900,
  discountPrice = 14900,
  discountPercentage = 12,
  onApplyDiscount,
  storageKey = "isivente_spin_shown_masseur",
}: SpinToWinModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [discountClaimed, setDiscountClaimed] = useState(false);

  const hasTriggeredRef = useRef(false);
  const isOpenRef = useRef(false);

  const triggerModal = () => {
    if (hasTriggeredRef.current || discountClaimed) return;
    hasTriggeredRef.current = true;
    isOpenRef.current = true;

    try {
      sessionStorage.setItem(storageKey, "true");
    } catch (_) {}

    setIsOpen(true);
    trackCustomEvent("SpinWheel_Triggered", { product: productTitle });
  };

  const openManually = () => {
    isOpenRef.current = true;
    setIsOpen(true);
    trackCustomEvent("SpinWheel_ManualClick", { product: productTitle });
  };

  const handleClose = () => {
    isOpenRef.current = false;
    setIsOpen(false);
  };

  // Exit intent & déclencheurs ultra-rapides Facebook
  useEffect(() => {
    if (typeof window === "undefined") return;

    const alreadyShown = sessionStorage.getItem(storageKey);
    if (alreadyShown) {
      hasTriggeredRef.current = true;
    }

    // Détection du trafic Facebook / Instagram
    const isFacebookTraffic =
      navigator.userAgent.includes("FBAN") ||
      navigator.userAgent.includes("FBAV") ||
      navigator.userAgent.includes("Instagram") ||
      window.location.search.includes("fbclid") ||
      window.location.search.includes("facebook");

    // 1. Déclencheur Auto Facebook (8 à 10 secondes d'attention)
    const facebookTimerDelay = isFacebookTraffic ? 9000 : 12000;
    const autoTimer = setTimeout(() => {
      if (!hasTriggeredRef.current && !discountClaimed) {
        triggerModal();
      }
    }, facebookTimerDelay);

    // 2. Déclencheur Remontée Brusque (Scroll-Up après avoir vu le Hero)
    let lastScrollY = window.scrollY;
    let maxScrollY = 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > maxScrollY) {
        maxScrollY = currentY;
      }
      // Dès que le visiteur a scrollé > 250px et remonte de 35px vers le haut
      if (maxScrollY > 250 && currentY < lastScrollY - 35 && !hasTriggeredRef.current && !discountClaimed) {
        triggerModal();
      }
      lastScrollY = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 3. Desktop : curseur vers le haut (barre d'onglets)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && !hasTriggeredRef.current && !discountClaimed) {
        triggerModal();
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // 4. Mobile : Verrouillage immédiat d'historique (Back Button / Swipe)
    try {
      window.history.pushState({ isiventeWheel: 1 }, "");
      window.history.pushState({ isiventeWheel: 2 }, "");
    } catch (_) {}

    const handlePopState = () => {
      if (!hasTriggeredRef.current && !discountClaimed) {
        try {
          window.history.pushState({ isiventeWheel: 3 }, "");
        } catch (_) {}
        triggerModal();
      } else if (isOpenRef.current) {
        handleClose();
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearTimeout(autoTimer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [storageKey, discountClaimed]);

  // Fonction de rotation de la roue
  const handleSpin = () => {
    if (isSpinning || hasWon) return;
    setIsSpinning(true);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }

    // 6 tours complets + arrêt sur le segment 0 (-12%)
    const totalSpins = 6;
    const winningOffset = 0;
    const targetDegrees = 360 * totalSpins + (360 - winningOffset);

    setRotationDegrees(targetDegrees);

    setTimeout(() => {
      setIsSpinning(false);
      setHasWon(true);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }

      trackCustomEvent("SpinWheel_Won", {
        product: productTitle,
        discountPrice,
        discountPercentage,
      });
    }, 4500);
  };

  const handleClaim = () => {
    setDiscountClaimed(true);
    onApplyDiscount(discountPrice);
    handleClose();

    setTimeout(() => {
      const orderEl = document.getElementById("commander");
      if (orderEl) {
        orderEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  const numSegments = SEGMENTS.length;
  const anglePerSegment = 360 / numSegments;

  return (
    <>
      {/* ── PASTILLE FLOTTANTE INTERACTIVE FACEBOOK (Toujours visible si pas encore gagné) ── */}
      {!isOpen && !discountClaimed && (
        <button
          onClick={openManually}
          type="button"
          aria-label="Tenter votre chance à la roue de réduction"
          className="fixed bottom-20 left-3 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-purple-700 to-indigo-800 text-white font-extrabold text-[11px] shadow-lg shadow-purple-500/40 border border-purple-300 animate-pulse hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>Roue -12% (14 900 F)</span>
        </button>
      )}

      {/* ── MODALE ROULETTE ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 text-center my-auto overflow-hidden">
            {/* Bouton fermeture discret */}
            <button
              onClick={handleClose}
              aria-label="Fermer la fenêtre"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* En-tête */}
            <div className="space-y-1.5 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 stroke-[2]" />
                <span>Cadeau Exclusif Visiteur</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {hasWon ? "🎉 Félicitations !" : "Tournez la Roue de la Chance !"}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
                {hasWon
                  ? "Vous avez décroché la remise exclusive de 12 % !"
                  : "Tentez de gagner votre bon de réduction immédiat sur le Masseur Vibrant."}
              </p>
            </div>

            {/* Roue interactive */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-2 flex items-center justify-center">
              {/* Pointeur fixe en haut */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-30 drop-shadow-md">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-500" />
              </div>

              {/* Roue animée */}
              <div
                className="w-full h-full rounded-full border-4 border-amber-400 shadow-xl overflow-hidden relative"
                style={{
                  transform: `rotate(${rotationDegrees}deg)`,
                  transition: isSpinning
                    ? "transform 4.5s cubic-bezier(0.12, 0.8, 0.2, 1)"
                    : "none",
                }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {SEGMENTS.map((seg, idx) => {
                    const startAngle = idx * anglePerSegment - 90;
                    const endAngle = (idx + 1) * anglePerSegment - 90;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    const x1 = 100 + 100 * Math.cos(startRad);
                    const y1 = 100 + 100 * Math.sin(startRad);
                    const x2 = 100 + 100 * Math.cos(endRad);
                    const y2 = 100 + 100 * Math.sin(endRad);

                    const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

                    const midAngle = startAngle + anglePerSegment / 2;
                    const midRad = (midAngle * Math.PI) / 180;
                    const textRadius = 66;
                    const tx = 100 + textRadius * Math.cos(midRad);
                    const ty = 100 + textRadius * Math.sin(midRad);

                    return (
                      <g key={idx}>
                        <path
                          d={pathData}
                          fill={seg.color}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x={tx}
                          y={ty - (seg.sublabel ? 3 : 0)}
                          fill={seg.textColor}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                        >
                          {seg.label}
                        </text>
                        {seg.sublabel && (
                          <text
                            x={tx}
                            y={ty + 7}
                            fill={seg.textColor}
                            fontSize="7"
                            fontWeight="semibold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            opacity="0.9"
                            transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                          >
                            {seg.sublabel}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Centre de la roue */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 shadow-md flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* État : Gagné vs Bouton Lancer */}
            {hasWon ? (
              <div className="mt-3 space-y-2.5 animate-scale-in">
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-left space-y-1 shadow-inner">
                  <div className="flex items-center gap-2 text-purple-900 font-extrabold text-sm sm:text-base">
                    <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>Gain débloqué : -12 % de réduction !</span>
                  </div>
                  <p className="text-xs text-purple-800">
                    Votre Masseur 2-en-1 passe de{" "}
                    <span className="line-through text-slate-400">
                      {new Intl.NumberFormat("fr-FR").format(originalPrice)} F
                    </span>{" "}
                    à{" "}
                    <strong className="text-purple-950 font-black text-sm">
                      {new Intl.NumberFormat("fr-FR").format(discountPrice)} FCFA
                    </strong>
                    .
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-bold pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Offre réservée active pendant 10 minutes</span>
                  </div>
                </div>

                <button
                  onClick={handleClaim}
                  className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Appliquer mes 14 900 F & Commander</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSpinning
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95 shadow-amber-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isSpinning ? "La roue tourne..." : "TOURNER LA ROUE (1 ESSAI)"}</span>
                </button>

                <p className="text-[11px] text-slate-400">
                  100 % gratuit • Sans engagement d'achat immédiat
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
