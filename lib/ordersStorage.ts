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
  city?: string;
  shipping_address?: string;
  address?: string;
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

/** Sauvegarde une nouvelle commande dans Supabase avec auto-adaptation au schéma */
export async function saveNewOrder(orderData: OrderItem): Promise<any> {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const orderNumberStr = "CMD-" + randomNum;

  const name = orderData.customer_name || "Client";
  const phone = orderData.customer_phone || "";
  const city = orderData.shipping_city || orderData.city || "Cotonou";
  const address = orderData.shipping_address || orderData.address || "";
  const totalAmount = orderData.total_amount || 14900;
  const quantity = orderData.quantity || 1;
  const productTitle = orderData.product_title || "Brosse Démêlante Vapeur Uméi 3-en-1";
  const productSlug = orderData.product_slug || "umei";
  const status = orderData.status || "pending";
  const createdAt = new Date().toISOString();

  // Objet de commande standard avec tous les alias de colonnes
  let payload: Record<string, any> = {
    order_number: orderNumberStr,
    name: name,
    customer_name: name,
    phone: phone,
    customer_phone: phone,
    city: city,
    shipping_city: city,
    address: address,
    shipping_address: address,
    total_amount: totalAmount,
    quantity: quantity,
    product_title: productTitle,
    product_slug: productSlug,
    status: status,
    created_at: createdAt,
  };

  // 1. Sauvegarde locale de sécurité
  saveToLocalStorage({ ...payload, id: "local_" + Date.now() });

  // 2. Insertion dans Supabase avec boucle de repli automatique en cas de colonne manquante
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    const res = await supabase.from("orders").insert([payload]).select();

    if (!res.error) {
      return res.data?.[0] || payload;
    }

    // Si une colonne n'existe pas dans la table Supabase, la retirer et réessayer
    const match = res.error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1]) {
      const missingColumn = match[1];
      delete payload[missingColumn];
      continue;
    }

    // Si erreur de type sur order_number (ex: attendu integer)
    if (res.error.message.includes("order_number") || res.error.code === "22P02") {
      payload.order_number = randomNum;
      continue;
    }

    console.warn("Supabase insert notice:", res.error.message);
    break;
  }

  return payload;
}

/** Normalise un objet commande pour le Dashboard */
function normalizeOrder(o: any): OrderItem {
  return {
    ...o,
    order_number: o.order_number || ("CMD-" + (o.id || "000").substring(0, 6)),
    customer_name: o.customer_name || o.name || "Client",
    customer_phone: o.customer_phone || o.phone || "",
    shipping_city: o.shipping_city || o.city || "Cotonou",
    shipping_address: o.shipping_address || o.address || "",
    total_amount: o.total_amount || o.amount || 14900,
    product_title: o.product_title || "Brosse Démêlante Vapeur Uméi 3-en-1",
    quantity: o.quantity || 1,
    status: o.status || "pending",
    created_at: o.created_at || new Date().toISOString()
  };
}

/** Retourne toutes les commandes depuis Supabase (avec fusion locale) */
export async function getAllOrders(): Promise<OrderItem[]> {
  let dbOrders: any[] = [];

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

  let localOrders: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) localOrders = JSON.parse(raw);
    } catch {}
  }

  const map = new Map<string, OrderItem>();
  dbOrders.forEach((o) => {
    const normalized = normalizeOrder(o);
    const key = normalized.id || `${normalized.customer_phone}_${normalized.created_at}`;
    map.set(key, normalized);
  });
  localOrders.forEach((o) => {
    const normalized = normalizeOrder(o);
    const key = normalized.id || `${normalized.customer_phone}_${normalized.created_at}`;
    if (!map.has(key)) map.set(key, normalized);
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
