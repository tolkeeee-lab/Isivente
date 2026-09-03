"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  playOrderSound, 
  unlockAudio,
  getSavedSoundType, 
  saveSoundType, 
  getSavedVolume, 
  saveVolume, 
  AVAILABLE_SOUNDS, 
  SoundType, 
  requestNotificationPermission, 
  sendDesktopNotification 
} from "@/lib/soundEffects";
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  X, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  Sliders,
  Check,
  Play,
  Trash2
} from "lucide-react";
import { clearAllOrders } from "@/lib/ordersStorage";

interface RealtimeOrderToast {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  product_title: string;
  city: string;
  created_at: string;
}

export default function OrderRealtimeListener() {
  const [activeToast, setActiveToast] = useState<RealtimeOrderToast | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState<SoundType>("chaching");
  const [volume, setVolume] = useState<number>(0.8);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<SoundType | null>(null);

  useEffect(() => {
    // Charger les préférences de son sauvegardées
    setSelectedSound(getSavedSoundType());
    setVolume(getSavedVolume());

    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }

    const seenOrdersRef = new Set<string>();

    const handleNewOrder = (order: any) => {
      const orderKey = String(order.id || order.order_number || order.created_at || (order.customer_phone + order.total_amount));
      if (seenOrdersRef.has(orderKey)) return;
      seenOrdersRef.add(orderKey);
      setTimeout(() => seenOrdersRef.delete(orderKey), 10000);

      const toastData: RealtimeOrderToast = {
        id: order.id || String(Date.now()),
        order_number: String(order.order_number || "CMD-" + Math.floor(100000 + Math.random() * 900000)),
        customer_name: order.customer_name || "Client",
        customer_phone: order.customer_phone || "",
        total_amount: Number(order.total_amount) || 14900,
        product_title: order.product_title || "Nouvelle commande",
        city: order.city || order.shipping_city || "Cotonou",
        created_at: new Date().toISOString(),
      };

      // 1. Jouer le son sélectionné si activé
      if (soundEnabled) {
        playOrderSound();
      }

      // 2. Notification de bureau / smartphone
      const formattedAmount = new Intl.NumberFormat("fr-FR").format(toastData.total_amount) + " FCFA";
      sendDesktopNotification(
        `🎉 Nouvelle commande reçue ! (${formattedAmount})`,
        `${toastData.customer_name} • ${toastData.city} • ${toastData.product_title}`
      );

      // 3. Afficher le toast flottant
      setActiveToast(toastData);

      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 9000);

      return () => clearTimeout(timer);
    };

    const localListener = (e: any) => {
      if (e.detail) handleNewOrder(e.detail);
    };
    window.addEventListener("isivente_new_order", localListener);

    // Cross-tab BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("isivente_orders_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "new_order" && event.data?.data) {
          handleNewOrder(event.data.data);
        }
      };
    }

    // Storage cross-tab fallback
    const storageListener = (e: StorageEvent) => {
      if (e.key === "isivente_last_order_trigger" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleNewOrder(parsed);
        } catch {}
      }
    };
    window.addEventListener("storage", storageListener);

    const channel = supabase
      .channel("realtime-orders-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.new) {
            handleNewOrder(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("isivente_new_order", localListener);
      window.removeEventListener("storage", storageListener);
      if (bc) bc.close();
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const handleSoundSelect = (soundId: SoundType) => {
    setSelectedSound(soundId);
    saveSoundType(soundId);
    // Jouer un aperçu immédiat
    setPlayingPreview(soundId);
    playOrderSound(soundId, volume);
    setTimeout(() => setPlayingPreview(null), 800);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    saveVolume(newVol);
  };

  const previewSound = (soundId: SoundType, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingPreview(soundId);
    playOrderSound(soundId, volume);
    setTimeout(() => setPlayingPreview(null), 800);
  };

  const enableNotifications = async () => {
    const ok = await requestNotificationPermission();
    setNotifGranted(ok);
    playOrderSound();
  };

  const triggerTestOrder = () => {
    unlockAudio();
    const testOrder = {
      id: "demo_" + Date.now(),
      order_number: "CMD-" + Math.floor(100000 + Math.random() * 900000),
      customer_name: "Gérard Dossou",
      customer_phone: "01 97 22 33 44",
      total_amount: 27900,
      product_title: "Pack Duo (2x TurboFan™ Max)",
      city: "Cotonou (Fidjrossé)",
      created_at: new Date().toISOString(),
    };

    if (soundEnabled) {
      playOrderSound(selectedSound, volume);
    }
    sendDesktopNotification(
      `🎉 Nouvelle commande reçue ! (27 900 FCFA)`,
      `Gérard Dossou • Cotonou • Pack Duo TurboFan™ Max`
    );
    setActiveToast(testOrder);
    setTimeout(() => setActiveToast(null), 9000);
  };

  const handleHardPurge = async () => {
    if (!confirm("Voulez-vous supprimer définitivement toutes les commandes de test et vider le cache ?")) return;
    await clearAllOrders();
    if (typeof window !== "undefined") {
      localStorage.removeItem("isivente_orders_store");
      localStorage.removeItem("isivente_last_order_trigger");
      sessionStorage.clear();
      if ("caches" in window) {
        try {
          const names = await caches.keys();
          await Promise.all(names.map(n => caches.delete(n)));
        } catch {}
      }
      window.location.reload();
    }
  };

  return (
    <>
      {/* BARRE D'OUTILS SONORE DANS LE HEADER */}
      <div className="flex items-center gap-1.5">
        {/* Bouton Nettoyage Cache & Tests Direct */}
        <button
          type="button"
          onClick={handleHardPurge}
          className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Vider toutes les commandes de test et purger le cache"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden md:inline">Vider les tests</span>
        </button>

        {/* Bouton Testeur Direct */}
        <button
          type="button"
          onClick={triggerTestOrder}
          className="px-2.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Tester le son Cha-Ching et le toast de notification"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden sm:inline">Tester l&apos;alerte</span>
        </button>

        {/* Toggle On/Off rapide */}
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) playOrderSound(selectedSound, volume);
          }}
          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            soundEnabled
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
          }`}
          title={soundEnabled ? "Son activé (cliquez pour couper)" : "Son coupé (cliquez pour activer)"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">
                {AVAILABLE_SOUNDS.find((s) => s.id === selectedSound)?.emoji}{" "}
                {AVAILABLE_SOUNDS.find((s) => s.id === selectedSound)?.name}
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Son coupé</span>
            </>
          )}
        </button>

        {/* Bouton Personnaliser le son ⚙️ */}
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            setShowSettingsModal(true);
          }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          title="Modifier la sonnerie d'alerte et le volume"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden md:inline">Changer de son</span>
        </button>

        {!notifGranted && (
          <button
            type="button"
            onClick={enableNotifications}
            className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer active:scale-95"
            title="Activer les alertes push du navigateur"
          >
            <Bell className="w-4 h-4 text-amber-600" />
            <span className="hidden lg:inline">Activer push</span>
          </button>
        )}
      </div>

      {/* 🎛️ MODAL FIGMA-GRADE DE PERSONNALISATION SONORE */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fadeIn">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-[staggerFadeUp_200ms_cubic-bezier(0.16,1,0.3,1)_both] space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Sons des Commandes
                  </h3>
                  <p className="text-xs text-slate-400">
                    Choisissez le son joué à chaque nouvelle vente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slider de Volume */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Volume de l&apos;alerte</span>
                <span className="font-mono text-emerald-600 tabular-nums">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>

            {/* Liste des 5 Sonorités Disponibles */}
            <div className="space-y-2">
              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 px-1">
                Choisir une sonnerie
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {AVAILABLE_SOUNDS.map((s) => {
                  const isSelected = selectedSound === s.id;
                  const isPlaying = playingPreview === s.id;

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSoundSelect(s.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? "bg-emerald-50/50 border-emerald-500 shadow-sm"
                          : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">{s.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                            <span>{s.name}</span>
                            {isSelected && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                Actif
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
                        </div>
                      </div>

                      {/* Bouton d'écoute Play */}
                      <button
                        type="button"
                        onClick={(e) => previewSound(s.id, e)}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                          isPlaying
                            ? "bg-slate-900 text-white border-slate-900 scale-105"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                        title="Écouter un extrait"
                      >
                        <Play className={`w-3.5 h-3.5 ${isPlaying ? "fill-white text-white" : "text-slate-600"}`} />
                        <span className="text-[11px]">Écouter</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer de confirmation */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Sauvegardé automatiquement
              </span>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 TOAST FLOTTANT DE NOUVELLE COMMANDE */}
      {activeToast && (
        <div className="fixed top-5 right-4 sm:right-6 z-[100] max-w-sm w-[calc(100vw-2rem)] animate-[staggerFadeUp_260ms_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />

            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <ShoppingBag className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Nouvelle Commande Reçue !</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">{activeToast.order_number}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 space-y-1.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100">{activeToast.customer_name}</span>
                <span className="font-mono font-extrabold text-sm text-emerald-400 tabular-nums">
                  {new Intl.NumberFormat("fr-FR").format(activeToast.total_amount)} FCFA
                </span>
              </div>
              <div className="text-xs text-slate-300 truncate">{activeToast.product_title}</div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-700/60 font-mono">
                <span>📍 {activeToast.city}</span>
                <span>📞 {activeToast.customer_phone || "Sans tél."}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/orders"
                onClick={() => setActiveToast(null)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-98"
              >
                <span>Traiter la commande</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {activeToast.customer_phone && (
                <a
                  href={`tel:${activeToast.customer_phone}`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
                  title="Appeler immédiatement le client"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
