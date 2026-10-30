"use client";

import { useEffect, useRef } from "react";
import { trackUserSession } from "@/lib/analyticsStorage";

const BOT_UA_REGEX =
  /bot|crawler|spider|crawling|headless|lighthouse|facebookexternalhit|facebot|whatsapp|telegrambot|twitterbot|slackbot|discordbot|linkedinbot|embedly|quora|pinterest|outbrain|vkshare|w3c_validator|vercel|prerender|preview|curl|wget|python|node-fetch|axios/i;

function isBotOrAutomated(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return true;
  }
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  if (!ua || BOT_UA_REGEX.test(ua)) return true;
  return false;
}

/**
 * Récupère ou crée une session unique par produit valable pendant 6 heures
 * afin qu'un rechargement de page, un retour arrière ou un double rendu React
 * ne crée JAMAIS +2 ou +3 visites pour la même personne.
 */
function getOrCreateProductSession(slug: string): {
  sessionId: string;
  createdAt: string;
  accumulatedSeconds: number;
  alreadyClicked: boolean;
} {
  const cleanSlug = slug.trim().toLowerCase();
  const storageKey = `isivente_visit_session_${cleanSlug}`;
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

  try {
    const raw =
      localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.sessionId &&
        parsed.createdAt &&
        Date.now() - new Date(parsed.createdAt).getTime() < SIX_HOURS_MS
      ) {
        return {
          sessionId: parsed.sessionId,
          createdAt: parsed.createdAt,
          accumulatedSeconds: Number(parsed.accumulatedSeconds) || 0,
          alreadyClicked: Boolean(parsed.alreadyClicked),
        };
      }
    }
  } catch {}

  const fresh = {
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    accumulatedSeconds: 0,
    alreadyClicked: false,
  };

  try {
    const serialized = JSON.stringify(fresh);
    localStorage.setItem(storageKey, serialized);
    sessionStorage.setItem(storageKey, serialized);
  } catch {}

  return fresh;
}

function saveProductSessionState(
  slug: string,
  state: {
    sessionId: string;
    createdAt: string;
    accumulatedSeconds: number;
    alreadyClicked: boolean;
  }
) {
  const cleanSlug = slug.trim().toLowerCase();
  const storageKey = `isivente_visit_session_${cleanSlug}`;
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(storageKey, serialized);
    sessionStorage.setItem(storageKey, serialized);
  } catch {}
}

/**
 * Hook de suivi de présence humaine réelle
 * - Bloque les robots, aperçus de liens (WhatsApp, Facebook/Meta, Googlebot) et pré-chargements
 * - Exige une interaction physique réelle (scroll, touch, clic ou mouvement de souris)
 * - Déduplique strictement la session par produit sur 6h (1 visiteur = 1 seule visite)
 */
export function usePagePresence(slug: string) {
  const sessionIdRef = useRef<string>("");
  const sessionCreatedAtRef = useRef<string>("");
  const baseSecondsRef = useRef<number>(0);
  const activeStartRef = useRef<number>(Date.now());
  const clickedRef = useRef<boolean>(false);
  const hasHumanInteractionRef = useRef<boolean>(false);
  const lastSavedDurationRef = useRef<number>(0);

  useEffect(() => {
    if (!slug || typeof window === "undefined") return;

    // 1. Exclure les administrateurs et les robots / aperçus automatiques
    try {
      if (
        isBotOrAutomated() ||
        window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/api") ||
        localStorage.getItem("isivente_is_admin") === "true" ||
        sessionStorage.getItem("isivente_is_admin") === "true" ||
        document.cookie.includes("isivente_admin=true")
      ) {
        return;
      }
    } catch {
      return;
    }

    // 2. Récupérer ou créer la session dédupliquée pour ce produit
    const sessionState = getOrCreateProductSession(slug);
    sessionIdRef.current = sessionState.sessionId;
    sessionCreatedAtRef.current = sessionState.createdAt;
    baseSecondsRef.current = sessionState.accumulatedSeconds;
    clickedRef.current = sessionState.alreadyClicked;
    lastSavedDurationRef.current = sessionState.accumulatedSeconds;
    activeStartRef.current = Date.now();

    // Si cette session avait déjà été validée lors d'un chargement précédent, elle est déjà humaine
    if (sessionState.accumulatedSeconds > 0 || sessionState.alreadyClicked) {
      hasHumanInteractionRef.current = true;
    }

    const computeTotalElapsed = () => {
      const currentMountSeconds =
        document.visibilityState === "visible"
          ? Math.round((Date.now() - activeStartRef.current) / 1000)
          : 0;
      // Plafonner à 1800s (30 min) pour éviter qu'un onglet oublié fausse la moyenne
      return Math.min(
        1800,
        Math.max(0, baseSecondsRef.current + currentMountSeconds)
      );
    };

    const flushDuration = () => {
      // Ne JAMAIS enregistrer tant qu'aucun geste humain réel n'a été détecté
      if (!hasHumanInteractionRef.current && !clickedRef.current) return;

      const totalElapsed = computeTotalElapsed();
      if (totalElapsed < 2 && !clickedRef.current) return;

      if (
        totalElapsed > lastSavedDurationRef.current ||
        clickedRef.current
      ) {
        lastSavedDurationRef.current = totalElapsed;
        saveProductSessionState(slug, {
          sessionId: sessionIdRef.current,
          createdAt: sessionCreatedAtRef.current,
          accumulatedSeconds: totalElapsed,
          alreadyClicked: clickedRef.current,
        });
        trackUserSession(
          slug,
          totalElapsed,
          clickedRef.current,
          sessionIdRef.current,
          sessionCreatedAtRef.current
        );
      }
    };

    // 3. Détecter le premier geste humain réel (scroll, touch, souris, clavier)
    const markHumanActivity = () => {
      if (document.visibilityState !== "visible") return;
      if (!hasHumanInteractionRef.current) {
        hasHumanInteractionRef.current = true;
        // Valider la visite après 2 secondes de présence réelle
        setTimeout(() => {
          flushDuration();
        }, 2000);
      }
    };

    window.addEventListener("scroll", markHumanActivity, { passive: true });
    window.addEventListener("touchstart", markHumanActivity, { passive: true });
    window.addEventListener("pointerdown", markHumanActivity, { passive: true });
    window.addEventListener("mousemove", markHumanActivity, { passive: true });
    window.addEventListener("keydown", markHumanActivity, { passive: true });

    // 4. Pulsation toutes les 10 secondes uniquement si la page est visible et active
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        flushDuration();
      }
    }, 10000);

    // 5. Gestion de la mise en veille / changement d'onglet pour ne pas compter le temps en arrière-plan
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushDuration();
        baseSecondsRef.current = lastSavedDurationRef.current;
      } else if (document.visibilityState === "visible") {
        activeStartRef.current = Date.now();
      }
    };

    const handlePageHide = () => {
      flushDuration();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", flushDuration);

    return () => {
      clearInterval(interval);
      flushDuration();
      window.removeEventListener("scroll", markHumanActivity);
      window.removeEventListener("touchstart", markHumanActivity);
      window.removeEventListener("pointerdown", markHumanActivity);
      window.removeEventListener("mousemove", markHumanActivity);
      window.removeEventListener("keydown", markHumanActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", flushDuration);
    };
  }, [slug]);

  const recordInteraction = () => {
    hasHumanInteractionRef.current = true;
    clickedRef.current = true;
    const elapsed = Math.max(
      2,
      baseSecondsRef.current +
        Math.round((Date.now() - activeStartRef.current) / 1000)
    );
    saveProductSessionState(slug, {
      sessionId: sessionIdRef.current,
      createdAt: sessionCreatedAtRef.current || new Date().toISOString(),
      accumulatedSeconds: elapsed,
      alreadyClicked: true,
    });
    trackUserSession(
      slug,
      elapsed,
      true,
      sessionIdRef.current,
      sessionCreatedAtRef.current
    );
  };

  return { recordInteraction };
}
