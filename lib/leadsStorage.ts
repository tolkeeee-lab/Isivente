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

/* ── LocalStorage Helpers ── */
export function getLocalLeads(): LeadRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalLeads(leads: LeadRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads.slice(0, 1000)));
  } catch {}
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

  const now = new Date().toISOString();
  // Générer un ID prévisible basé sur le téléphone et le produit pour dédupliquer
  const leadId = `lead_${cleanPhone}_${data.product_slug || "product"}`;

  const lead: LeadRecord = {
    id: leadId,
    customer_name: (data.customer_name || "").trim() || "Client intéressé",
    customer_phone: cleanPhone,
    customer_phone2: data.customer_phone2?.trim() || "",
    city: data.city?.trim() || "Cotonou",
    address: data.address?.trim() || "",
    product_slug: data.product_slug || "microscope",
    product_title: data.product_title || "Produit Isivente",
    bundle_name: data.bundle_name || "Offre standard",
    total_amount: data.total_amount || 0,
    status: "abandoned",
    created_at: now,
    updated_at: now,
  };

  // 1. Sauvegarde locale immédiate
  if (typeof window !== "undefined") {
    const localList = getLocalLeads();
    const existingIdx = localList.findIndex((l) => l.id === leadId);
    if (existingIdx >= 0) {
      // Si déjà converti en commande, ne pas repasser en abandoned
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

  // 2. Sauvegarde Supabase (si table 'leads' existe)
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
    // Fallback transparent sur localStorage
  }

  // 3. Notification serveur & synchronisation en arrière-plan
  if (typeof window !== "undefined") {
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
    }).catch(() => {});
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
