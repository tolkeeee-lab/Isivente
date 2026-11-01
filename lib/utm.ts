"use client";

import { useEffect, useState } from "react";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  fbclid?: string;
}

const SESSION_KEY = "isivente_utm";

/**
 * Capture et conserve :
 * 1. Les paramètres UTM (utm_source, utm_medium, utm_campaign, utm_content)
 * 2. Le paramètre Facebook Click ID (`fbclid`) et génère automatiquement le cookie officiel `_fbc`
 *    et `_fbp` pour maximiser le score de qualité d'attribution Meta (EMQ 9.5/10).
 * 3. Détecte automatiquement les visites provenant de Facebook/Instagram même si l'annonceur
 *    a oublié d'ajouter ?utm_source=meta dans son lien publicitaire.
 */
export function captureAndPersistAttribution(): UTMParams {
  if (typeof window === "undefined") return {};

  const sp = new URLSearchParams(window.location.search);
  const fbclid =
    sp.get("fbclid") ||
    sp.get("fb_action_ids") ||
    undefined;

  // 1. Si fbclid est présent dans l'URL, construire et persister le cookie officiel _fbc (format: fb.1.{timestamp}.{fbclid})
  if (fbclid) {
    try {
      const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
      document.cookie = `_fbc=${fbcValue}; path=/; max-age=7776000; SameSite=Lax`;
      localStorage.setItem("isivente_fbc", fbcValue);
    } catch {}
  }

  // 2. S'assurer qu'un identifiant navigateur _fbp existe même si un bloqueur retarde fbevents.js
  try {
    if (!document.cookie.includes("_fbp=")) {
      const existingFbp = localStorage.getItem("isivente_fbp");
      const fbpValue =
        existingFbp ||
        `fb.1.${Date.now()}.${Math.floor(100000000 + Math.random() * 900000000)}`;
      document.cookie = `_fbp=${fbpValue}; path=/; max-age=7776000; SameSite=Lax`;
      localStorage.setItem("isivente_fbp", fbpValue);
    }
  } catch {}

  // 3. Lire les paramètres UTM ou déduire automatiquement depuis fbclid / document.referrer / User-Agent
  const fresh: UTMParams = {};
  const source = sp.get("utm_source") || sp.get("source");
  const medium = sp.get("utm_medium") || sp.get("medium");
  const campaign =
    sp.get("utm_campaign") || sp.get("campaign") || sp.get("campaign_id");
  const content =
    sp.get("utm_content") || sp.get("content") || sp.get("ad_id") || sp.get("adset_id");

  if (source) fresh.utm_source = source;
  if (medium) fresh.utm_medium = medium;
  if (campaign) fresh.utm_campaign = campaign;
  if (content) fresh.utm_content = content;
  if (fbclid) fresh.fbclid = fbclid;

  // Auto-détection Meta (Facebook / Instagram) si le lien de la pub n'avait pas d'UTM mais a un fbclid ou navigateur in-app FB/IG
  if (!fresh.utm_source) {
    const ref = (document.referrer || "").toLowerCase();
    const ua = (navigator.userAgent || "").toLowerCase();
    if (
      fbclid ||
      ref.includes("facebook.com") ||
      ref.includes("instagram.com") ||
      ref.includes("fb.com") ||
      ua.includes("fban") ||
      ua.includes("fbav") ||
      ua.includes("instagram")
    ) {
      fresh.utm_source = "meta";
      fresh.utm_medium = fresh.utm_medium || (fbclid ? "paid_social" : "social_inapp");
    } else if (ref.includes("tiktok.com") || ua.includes("musical_ly") || ua.includes("tiktok")) {
      fresh.utm_source = "tiktok";
      fresh.utm_medium = fresh.utm_medium || "paid_social";
    }
  }

  if (Object.keys(fresh).length > 0) {
    try {
      const serialized = JSON.stringify(fresh);
      sessionStorage.setItem(SESSION_KEY, serialized);
      localStorage.setItem(SESSION_KEY, serialized);
    } catch {}
    return fresh;
  }

  try {
    const stored =
      sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored) as UTMParams;
    }
  } catch {}

  return {};
}

export function useUTM(): UTMParams {
  const [utm, setUtm] = useState<UTMParams>({});

  useEffect(() => {
    const captured = captureAndPersistAttribution();
    setUtm(captured);
  }, []);

  return utm;
}

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
  const fbclid = get("fbclid");
  if (source) utm.utm_source = source;
  if (medium) utm.utm_medium = medium;
  if (campaign) utm.utm_campaign = campaign;
  if (content) utm.utm_content = content;
  if (fbclid) utm.fbclid = fbclid;
  return utm;
}
