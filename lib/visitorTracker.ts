"use client";

/**
 * Utilitaire de suivi de fréquence de visite (Visites récurrentes Isivente)
 * Permet de savoir combien de fois un client est venu sur le site.
 */

const STORAGE_KEY_VISIT_COUNT = "isivente_visit_count";
const STORAGE_KEY_FIRST_SEEN = "isivente_first_visit_at";
const STORAGE_KEY_LAST_SEEN = "isivente_last_visit_at";
const STORAGE_KEY_CURRENT_SESSION = "isivente_session_active";

export interface VisitorHistory {
  visitCount: number;
  isFirstVisit: boolean;
  isReturningVisitor: boolean;
  firstVisitDate: string | null;
  lastVisitDate: string | null;
}

/**
 * Enregistre et incrémente la visite du visiteur si nouvelle session
 */
export function trackVisitorArrival(slug?: string): VisitorHistory {
  if (typeof window === "undefined") {
    return {
      visitCount: 1,
      isFirstVisit: true,
      isReturningVisitor: false,
      firstVisitDate: null,
      lastVisitDate: null,
    };
  }

  try {
    const now = new Date().toISOString();
    const storedCount = localStorage.getItem(STORAGE_KEY_VISIT_COUNT);
    const firstSeen = localStorage.getItem(STORAGE_KEY_FIRST_SEEN);
    const sessionActive = sessionStorage.getItem(STORAGE_KEY_CURRENT_SESSION);

    let count = storedCount ? parseInt(storedCount, 10) : 0;
    if (isNaN(count)) count = 0;

    // Si nouvelle session de navigation (l'utilisateur rouvre le navigateur ou revient après avoir fermé l'onglet)
    if (!sessionActive) {
      count += 1;
      localStorage.setItem(STORAGE_KEY_VISIT_COUNT, count.toString());
      sessionStorage.setItem(STORAGE_KEY_CURRENT_SESSION, "true");
      localStorage.setItem(STORAGE_KEY_LAST_SEEN, now);

      if (!firstSeen) {
        localStorage.setItem(STORAGE_KEY_FIRST_SEEN, now);
      }
    }

    return {
      visitCount: count,
      isFirstVisit: count <= 1,
      isReturningVisitor: count > 1,
      firstVisitDate: firstSeen || now,
      lastVisitDate: now,
    };
  } catch (e) {
    return {
      visitCount: 1,
      isFirstVisit: true,
      isReturningVisitor: false,
      firstVisitDate: null,
      lastVisitDate: null,
    };
  }
}

/**
 * Récupère le nombre actuel de visites sans l'incrémenter
 */
export function getVisitorVisitCount(): number {
  if (typeof window === "undefined") return 1;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISIT_COUNT);
    return raw ? parseInt(raw, 10) || 1 : 1;
  } catch {
    return 1;
  }
}
