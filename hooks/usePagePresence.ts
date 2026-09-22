"use client";

import { useEffect, useRef } from "react";
import { trackUserSession } from "@/lib/analyticsStorage";

/**
 * Hook de suivi de présence en temps réel (Heartbeat)
 * - Calcule la durée réelle passée par le visiteur sur la page
 * - Envoie une pulsation toutes les 5 secondes (heartbeat)
 * - Enregistre la durée exacte lors de la fermeture, changement d'onglet ou retour en arrière
 */
export function usePagePresence(slug: string) {
  const sessionIdRef = useRef<string>("");
  const startTimeRef = useRef<number>(Date.now());
  const clickedRef = useRef<boolean>(false);
  const lastSavedDurationRef = useRef<number>(0);

  useEffect(() => {
    if (!slug || typeof window === "undefined") return;

    // Ignorer si l'utilisateur est administrateur (ne pas fausser les stats avec ses propres clics de test)
    try {
      if (localStorage.getItem("isivente_is_admin") === "true") {
        return;
      }
    } catch {}

    // ID de session unique et stable pour toute la durée de la visite
    sessionIdRef.current = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    startTimeRef.current = Date.now();

    const flushDuration = () => {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      // Ignorer les rebonds immédiats de moins de 2 secondes pour ne jamais enregistrer de session fantôme à 1s
      if (elapsed < 2 && !clickedRef.current) return;

      // Éviter d'enregistrer si pas de changement
      if (elapsed > lastSavedDurationRef.current) {
        lastSavedDurationRef.current = elapsed;
        trackUserSession(slug, elapsed, clickedRef.current, sessionIdRef.current);
      }
    };

    // 1. Enregistrement initial (au bout de 2.5 secondes pour valider la visite humaine)
    const initialTimer = setTimeout(() => {
      flushDuration();
    }, 2500);

    // 2. Pulsation continue toutes les 5 secondes (Heartbeat)
    const interval = setInterval(() => {
      flushDuration();
    }, 5000);

    // 3. Écouteurs de sortie mobile et bureau
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushDuration();
      }
    };

    const handlePageHide = () => {
      flushDuration();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", flushDuration);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      flushDuration();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", flushDuration);
    };
  }, [slug]);

  const recordInteraction = () => {
    clickedRef.current = true;
    const elapsed = Math.max(2, Math.round((Date.now() - startTimeRef.current) / 1000));
    trackUserSession(slug, elapsed, true, sessionIdRef.current);
  };

  return { recordInteraction };
}
