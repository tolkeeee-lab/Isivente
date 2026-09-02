"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { playChaChingSound, requestNotificationPermission, sendDesktopNotification } from "@/lib/soundEffects";
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  X, 
  ArrowRight,
  Sparkles,
  PhoneCall
} from "lucide-react";

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
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    // Vérifier l'état de la permission des notifications
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }

    const handleNewOrder = (order: any) => {
      const toastData: RealtimeOrderToast = {
        id: order.id || String(Date.now()),
        order_number: order.order_number || "CMD-" + Math.floor(100000 + Math.random() * 900000),
        customer_name: order.customer_name || "Client",
        customer_phone: order.customer_phone || "",
        total_amount: order.total_amount || 14900,
        product_title: order.product_title || "Nouvelle commande",
        city: order.city || order.shipping_city || "Cotonou",
        created_at: new Date().toISOString(),
      };

      // 1. Jouer l'effet sonore de caisse si activé
      if (soundEnabled) {
        playChaChingSound();
      }

      // 2. Notification de bureau / smartphone si onglet en arrière-plan
      const formattedAmount = new Intl.NumberFormat("fr-FR").format(toastData.total_amount) + " FCFA";
      sendDesktopNotification(
        `🎉 Nouvelle commande reçue ! (${formattedAmount})`,
        `${toastData.customer_name} • ${toastData.city} • ${toastData.product_title}`
      );

      // 3. Afficher le toast flottant à l'écran
      setActiveToast(toastData);

      // Auto-fermeture après 8 secondes
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 8000);

      return () => clearTimeout(timer);
    };

    // Écoute des événements locaux
    const localListener = (e: any) => {
      if (e.detail) handleNewOrder(e.detail);
    };
    window.addEventListener("isivente_new_order", localListener);

    // Écoute Supabase Realtime
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
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const enableNotifications = async () => {
    const ok = await requestNotificationPermission();
    setNotifGranted(ok);
    // Jouer un son test pour débloquer l'AudioContext du navigateur
    playChaChingSound();
  };

  const testSound = () => {
    playChaChingSound();
  };

  return (
    <>
      {/* BOUTON D'ÉTAT DU SON & NOTIFICATIONS (Fixé dans la barre admin) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            soundEnabled
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
          }`}
          title={soundEnabled ? "Son de caisse activé (cliquez pour couper)" : "Son coupé (cliquez pour activer)"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Son Ca-ching</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Son coupé</span>
            </>
          )}
        </button>

        {!notifGranted && (
          <button
            type="button"
            onClick={enableNotifications}
            className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer active:scale-95"
            title="Activer les alertes sonores & notifications du navigateur"
          >
            <Bell className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">Activer alertes</span>
          </button>
        )}

        <button
          type="button"
          onClick={testSound}
          className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-xs"
          title="Tester le son Cha-Ching!"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Test son</span>
        </button>
      </div>

      {/* 🔔 TOAST FLOTTANT DE NOUVELLE COMMANDE (Figma-Grade) */}
      {activeToast && (
        <div className="fixed top-5 right-4 sm:right-6 z-[100] max-w-sm w-[calc(100vw-2rem)] animate-[staggerFadeUp_260ms_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 backdrop-blur-xl relative overflow-hidden">
            {/* Liseré supérieur biseauté */}
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

            {/* Corps du toast */}
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

            {/* Actions rapides */}
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
