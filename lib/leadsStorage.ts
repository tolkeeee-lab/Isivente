import { supabase } from "@/lib/supabase";

export interface LeadRecord {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_phone2?: string;
  city?: string;
  address?: string;
  product_slug: string;
  product_title: string;
  bundle_name?: string;
  total_amount: number;
  status: "abandoned" | "contacted" | "converted";
  created_at: string;
  updated_at: string;
}

const LEADS_STORAGE_KEY = "isivente_leads_abandoned";

// Mémoire tampon de secours si localStorage est indisponible ou saturé
let memoryLeadsFallback: LeadRecord[] = [];

/* ── LocalStorage Helpers Sécurisés ── */
export function getLocalLeads(): LeadRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryLeadsFallback = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // Mode privé ou cookies désactivés
  }
  return memoryLeadsFallback;
}

export function saveLocalLeads(leads: LeadRecord[]) {
  const safeLeads = Array.isArray(leads) ? leads.slice(0, 1000) : [];
  memoryLeadsFallback = safeLeads;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(safeLeads));
  } catch (e) {
    // Quota dépassé
  }
}

/**
 * Enregistre ou met à jour un prospect silencieusement dès qu'il saisit son numéro
 */
export async function saveOrUpdateLead(data: {
  customer_name?: string;
  customer_phone: string;
  customer_phone2?: string;
  city?: string;
  address?: string;
  product_slug: string;
  product_title: string;
  bundle_name?: string;
  total_amount?: number;
}): Promise<LeadRecord | null> {
  const cleanPhone = (data.customer_phone || "").replace(/\D/g, "");
  if (cleanPhone.length < 8) return null;

  const rawSlug = String(data.product_slug || "product").trim();
  const cleanSlug = /^[a-zA-Z0-9_\-]+$/.test(rawSlug) ? rawSlug.slice(0, 50) : "product";

  const now = new Date().toISOString();
  // Générer un ID prévisible basé sur le téléphone et le produit pour dédupliquer
  const leadId = `lead_${cleanPhone}_${cleanSlug}`;

  const lead: LeadRecord = {
    id: leadId,
    customer_name: (data.customer_name || "").trim().slice(0, 100) || "Client intéressé",
    customer_phone: cleanPhone,
    customer_phone2: (data.customer_phone2 || "").trim().slice(0, 20),
    city: (data.city || "").trim().slice(0, 100) || "Cotonou",
    address: (data.address || "").trim().slice(0, 250),
    product_slug: cleanSlug,
    product_title: (data.product_title || "").trim().slice(0, 150) || "Produit Isivente",
    bundle_name: (data.bundle_name || "").trim().slice(0, 150) || "Offre standard",
    total_amount: Number(data.total_amount) || 0,
    status: "abandoned",
    created_at: now,
    updated_at: now,
  };

  // 1. Sauvegarde locale immédiate
  if (typeof window !== "undefined") {
    const localList = getLocalLeads();
    const existingIdx = localList.findIndex((l) => l.id === leadId);
    if (existingIdx >= 0) {
      if (localList[existingIdx].status === "converted") {
        lead.status = "converted";
      }
      lead.created_at = localList[existingIdx].created_at;
      localList[existingIdx] = lead;
      saveLocalLeads(localList);
    } else {
      saveLocalLeads([lead, ...localList]);
    }
  }

  // 2. Sauvegarde Supabase en arrière-plan
  try {
    await supabase.from("leads").upsert(
      [
        {
          id: lead.id,
          customer_name: lead.customer_name,
          customer_phone: lead.customer_phone,
          customer_phone2: lead.customer_phone2,
          city: lead.city,
          address: lead.address,
          product_slug: lead.product_slug,
          product_title: lead.product_title,
          bundle_name: lead.bundle_name,
          total_amount: lead.total_amount,
          status: lead.status,
          created_at: lead.created_at,
          updated_at: lead.updated_at,
        },
      ],
      { onConflict: "id" }
    );
  } catch (err) {
    // Fallback transparent
  }

  // 3. Notification serveur avec timeout
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: lead.customer_name,
          customer_phone: lead.customer_phone,
          customer_phone2: lead.customer_phone2,
          city: lead.city,
          address: lead.address,
          product_slug: lead.product_slug,
          product_title: lead.product_title,
          bundle_name: lead.bundle_name,
          total_amount: lead.total_amount,
        }),
        signal: controller.signal,
      }).then(() => clearTimeout(timeoutId)).catch(() => {});
    } catch (e) {}
  }

  return lead;
}

/**
 * Marque un prospect comme converti lorsqu'il valide sa commande avec succès
 */
export async function markLeadConverted(phone: string, productSlug?: string) {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (!cleanPhone) return;

  if (typeof window !== "undefined") {
    const list = getLocalLeads();
    let changed = false;
    const updated = list.map((l) => {
      const matchPhone = l.customer_phone.replace(/\D/g, "") === cleanPhone;
      const matchSlug = !productSlug || l.product_slug === productSlug;
      if (matchPhone && matchSlug) {
        changed = true;
        return { ...l, status: "converted" as const, updated_at: new Date().toISOString() };
      }
      return l;
    });
    if (changed) saveLocalLeads(updated);
  }

  try {
    let query = supabase.from("leads").update({
      status: "converted",
      updated_at: new Date().toISOString(),
    }).eq("customer_phone", cleanPhone);
    if (productSlug) {
      query = query.eq("product_slug", productSlug);
    }
    await query;
  } catch {}
}

/**
 * Récupère tous les prospects (fusion Supabase + localStorage)
 */
export async function getAllLeads(): Promise<LeadRecord[]> {
  let dbLeads: LeadRecord[] = [];

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1000);

    if (!error && data && data.length > 0) {
      dbLeads = data.map((d: any) => ({
        id: d.id,
        customer_name: d.customer_name || "Client",
        customer_phone: d.customer_phone,
        customer_phone2: d.customer_phone2 || "",
        city: d.city || "Cotonou",
        address: d.address || "",
        product_slug: d.product_slug || "produit",
        product_title: d.product_title || "Produit Isivente",
        bundle_name: d.bundle_name || "Offre standard",
        total_amount: Number(d.total_amount) || 0,
        status: d.status || "abandoned",
        created_at: d.created_at || new Date().toISOString(),
        updated_at: d.updated_at || new Date().toISOString(),
      }));
    }
  } catch {}

  const localLeads = getLocalLeads();
  const map = new Map<string, LeadRecord>();

  // Fusionner les données de la base
  dbLeads.forEach((l) => map.set(l.id, l));
  // Fusionner les données locales (si plus récentes ou manquantes)
  localLeads.forEach((l) => {
    if (!map.has(l.id)) {
      map.set(l.id, l);
    } else {
      const existing = map.get(l.id)!;
      if (new Date(l.updated_at).getTime() > new Date(existing.updated_at).getTime()) {
        map.set(l.id, l);
      }
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

/**
 * Met à jour le statut d'un lead (ex: "contacted", "abandoned")
 */
export async function updateLeadStatus(id: string, status: "abandoned" | "contacted" | "converted") {
  if (typeof window !== "undefined") {
    const list = getLocalLeads();
    const updated = list.map((l) => (l.id === id ? { ...l, status, updated_at: new Date().toISOString() } : l));
    saveLocalLeads(updated);
  }

  try {
    await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  } catch {}
}

/**
 * Supprime définitivement un prospect
 */
export async function deleteLead(id: string) {
  if (typeof window !== "undefined") {
    const list = getLocalLeads();
    saveLocalLeads(list.filter((l) => l.id !== id));
  }

  try {
    await supabase.from("leads").delete().eq("id", id);
  } catch {}
}
