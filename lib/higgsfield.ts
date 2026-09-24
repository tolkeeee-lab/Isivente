/**
 * Client pour l'API Higgsfield Marketing Studio Image
 * Endpoint: https://api.higgsfield.ai/marketing-studio/image
 */

export interface HiggsfieldGenerateParams {
  prompt: string;
  quality?: "low" | "medium" | "high";
  moderation?: "auto" | "low";
  resolution?: "1k" | "2k" | "4k";
  aspect_ratio?: "auto" | "1:1" | "3:2" | "2:3" | "4:3" | "3:4" | "16:9" | "9:16" | "21:9";
  enhance_prompt?: boolean;
  preset_id?: string;
  image_urls?: string[];
}

export interface HiggsfieldPresetItem {
  id: string;
  name: string;
  type: string;
  preview_url?: string;
  description?: string;
}

export interface HiggsfieldPresetResponse {
  total: number;
  cursor: string | null;
  items: HiggsfieldPresetItem[];
}

export interface HiggsfieldRequestStatus {
  request_id: string;
  status: "queued" | "in_progress" | "completed" | "failed" | "canceled" | "nsfw";
  status_url?: string;
  cancel_url?: string;
  error?: string;
  images?: { url: string }[];
}

export function getHiggsfieldCredentials(customKey?: string): string | null {
  if (customKey && customKey.trim()) return customKey.trim();
  return (
    process.env.HF_CREDENTIALS ||
    process.env.HF_KEY ||
    null
  );
}

/**
 * Récupère les presets visuels Ads officiels de Higgsfield
 */
export async function getHiggsfieldPresets(customKey?: string): Promise<HiggsfieldPresetResponse> {
  const credentials = getHiggsfieldCredentials(customKey);
  if (!credentials) {
    throw new Error("Clé API Higgsfield manquante. Veuillez configurer HF_CREDENTIALS ou HF_KEY.");
  }

  const res = await fetch("https://api.higgsfield.ai/marketing-studio/image/presets?size=50", {
    method: "GET",
    headers: {
      Authorization: `Key ${credentials}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur Higgsfield Presets (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Soumet une requête de génération d'image marketing
 */
export async function submitHiggsfieldImage(
  params: HiggsfieldGenerateParams,
  customKey?: string
): Promise<HiggsfieldRequestStatus> {
  const credentials = getHiggsfieldCredentials(customKey);
  if (!credentials) {
    throw new Error("Clé API Higgsfield manquante. Veuillez configurer HF_CREDENTIALS ou HF_KEY.");
  }

  const payload: any = {
    prompt: params.prompt,
    quality: params.quality || "high",
    moderation: params.moderation || "auto",
    resolution: params.resolution || "2k",
    aspect_ratio: params.aspect_ratio || "auto",
    enhance_prompt: Boolean(params.enhance_prompt),
  };

  if (params.preset_id) {
    payload.preset_id = params.preset_id;
  }

  if (params.image_urls && params.image_urls.length > 0) {
    payload.image_urls = params.image_urls;
  }

  const res = await fetch("https://api.higgsfield.ai/marketing-studio/image", {
    method: "POST",
    headers: {
      Authorization: `Key ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur soumission Higgsfield (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Interroge le statut d'un job de rendu jusqu'à son achèvement (polling)
 */
export async function pollHiggsfieldJob(
  statusUrlOrRequestId: string,
  customKey?: string,
  maxAttempts: number = 30,
  delayMs: number = 2500
): Promise<HiggsfieldRequestStatus> {
  const credentials = getHiggsfieldCredentials(customKey);
  if (!credentials) {
    throw new Error("Clé API Higgsfield manquante.");
  }

  const url = statusUrlOrRequestId.startsWith("http")
    ? statusUrlOrRequestId
    : `https://api.higgsfield.ai/marketing-studio/image/requests/${statusUrlOrRequestId}`;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Key ${credentials}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erreur polling Higgsfield (${res.status}): ${errText}`);
    }

    const data: HiggsfieldRequestStatus = await res.json();

    if (data.status === "completed") {
      return data;
    }

    if (data.status === "failed") {
      throw new Error(data.error || "La génération a échoué chez Higgsfield.");
    }

    if (data.status === "nsfw" || data.status === "canceled") {
      throw new Error(`Génération interrompue : statut ${data.status}.`);
    }

    // Attente avant la prochaine tentative
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Délai d'attente dépassé (timeout) pour le rendu de l'image.");
}
