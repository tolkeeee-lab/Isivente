import { supabase } from "@/lib/supabase";

export interface OrderItem {
  id?: string;
  order_number?: string | number;
  product_slug?: string;
  product_title?: string;
  bundle_id?: string;
  quantity?: number;
  total_amount?: number;
  customer_name?: string;
  customer_phone?: string;
  shipping_city?: string;
  shipping_address?: string;
  status?: "pending" | "shipped" | "delivered" | "cancelled" | string;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = "isivente_orders_store";

function saveToLocalStorage(order: any) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([order, ...list]));
  } catch {}
}

/** Sauvegarde une nouvelle commande dans Supabase */
export async function saveNewOrder(orderData: OrderItem): Promise<any> {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const orderNumberStr = "CMD-" + randomNum;

  // Préparation de l'objet de commande sans forcer un ID textuel incompatible avec le type UUID de Postgres
  const { id: _unusedId, ...cleanOrderData } = orderData;

  const payload: any = {
    ...cleanOrderData,
    order_number: orderNumberStr,
    created_at: new Date().toISOString(),
  };

  // 1. Sauvegarde locale de sécurité immédiate
  saveToLocalStorage({ ...payload, id: "local_" + Date.now() });

  // 2. Insertion dans Supabase
  let res = await supabase.from("orders").insert([payload]).select();

  // Si colonne bundle_id non existante dans le schéma Supabase, réessayer sans bundle_id
  if (res.error && res.error.message.includes("bundle_id")) {
    const { bundle_id, ...withoutBundle } = payload;
    res = await supabase.from("orders").insert([withoutBundle]).select();
  }

  // Si erreur de type sur order_number (ex: attendu integer au lieu de text)
  if (res.error && (res.error.message.includes("order_number") || res.error.code === "22P02")) {
    const { bundle_id, ...withoutBundle } = payload;
    const integerPayload = {
      ...withoutBundle,
      order_number: randomNum
    };
    res = await supabase.from("orders").insert([integerPayload]).select();
  }

  if (res.error) {
    console.error("Supabase insert notice:", res.error.message);
  }

  return res.data?.[0] || payload;
}

/** Retourne toutes les commandes depuis Supabase */
export async function getAllOrders(): Promise<OrderItem[]> {
  let dbOrders: OrderItem[] = [];

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      dbOrders = data;
    }
  } catch (err) {
    console.warn("Supabase fetch notice:", err);
  }

  // Récupérer et fusionner aussi les commandes locales
  let localOrders: OrderItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) localOrders = JSON.parse(raw);
    } catch {}
  }

  const map = new Map<string, OrderItem>();
  dbOrders.forEach((o) => {
    const key = o.id || `${o.customer_phone}_${o.created_at}`;
    map.set(key, o);
  });
  localOrders.forEach((o) => {
    const key = o.id || `${o.customer_phone}_${o.created_at}`;
    if (!map.has(key)) map.set(key, o);
  });

  return Array.from(map.values()).sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

/** Met à jour le statut d'une commande dans Supabase */
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
  try {
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
  } catch (error) {
    console.error("Supabase update error:", error);
  }
}
