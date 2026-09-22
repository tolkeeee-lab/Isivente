"use client";

import { useEffect, useState } from "react";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

const SESSION_KEY = "isivente_utm";

/**
 * Reads UTM params from the URL on first visit and stores them in sessionStorage.
 * On subsequent calls (e.g. form step 2), returns the stored params.
 *
 * Usage in any landing component:
 *   const utm = useUTM();
 *   saveNewOrder({ ...orderData, ...utm });
 *
 * Supported ad URL examples:
 *   /p/microscope?utm_source=meta&utm_medium=paid&utm_campaign=microscope&utm_content=video_parents
 *   /p/microscope?utm_source=whatsapp&utm_medium=paid&utm_campaign=microscope&utm_content=video_agriculture
 */
export function useUTM(): UTMParams {
  const [utm, setUtm] = useState<UTMParams>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Try to read fresh UTM from current URL
    const sp = new URLSearchParams(window.location.search);
    const fresh: UTMParams = {};

    const source = sp.get("utm_source");
    const medium = sp.get("utm_medium");
    const campaign = sp.get("utm_campaign");
    const content = sp.get("utm_content");

    if (source) fresh.utm_source = source;
    if (medium) fresh.utm_medium = medium;
    if (campaign) fresh.utm_campaign = campaign;
    if (content) fresh.utm_content = content;

    if (Object.keys(fresh).length > 0) {
      // Fresh UTM found in URL → store and use
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
      } catch {}
      setUtm(fresh);
      return;
    }

    // 2. No UTM in URL → restore from sessionStorage (user navigated away then came back)
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UTMParams;
        setUtm(parsed);
      }
    } catch {}
  }, []);

  return utm;
}

/**
 * Server-safe helper: read UTM from a URLSearchParams object (for server components).
 * Pass `searchParams` from the page props.
 */
export function getUTMFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): UTMParams {
  const get = (key: string): string | undefined => {
    const v = searchParams[key];
    if (!v) return undefined;
    return Array.isArray(v) ? v[0] : v;
  };
  const utm: UTMParams = {};
  const source = get("utm_source");
  const medium = get("utm_medium");
  const campaign = get("utm_campaign");
  const content = get("utm_content");
  if (source) utm.utm_source = source;
  if (medium) utm.utm_medium = medium;
  if (campaign) utm.utm_campaign = campaign;
  if (content) utm.utm_content = content;
  return utm;
}
