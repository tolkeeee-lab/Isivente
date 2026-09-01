import { supabase } from "@/lib/supabase";

export interface OrderItem {
  id?: string;
  order_number?: string | number;
  product_slug?: string;
  product_title?: string;
  bundle_id?: string;
  quantity?: number;
  total_amount?: number;
  amount?: number;
  customer_name?: string;
  name?: string;
  customer_phone?: string;
  phone?: string;
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

/** Sauvegarde une nouvelle commande dans Supabase avec mapping complet de toutes les colonnes possibles */
export async function saveNewOrder(orderData: OrderItem): Promise<any> {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const orderNumberStr = "CMD-" + randomNum;

  const name = orderData.customer_name || orderData.name || "Client";
  const phone = orderData.customer_phone || orderData.phone || "";
  const city = orderData.shipping_city || orderData.city || "";
  const address = orderData.shipping_address || orderData.address || "";
  const amount = orderData.total_amount || orderData.amount || 14900;
  const quantity = orderData.quantity || 1;
  const productTitle = orderData.product_title || "Brosse Démêlante Vapeur Uméi 3-en-1";
  const productSlug = orderData.product_slug || "umei";
  const status = orderData.status || "pending";
  const createdAt = new Date().toISOString();

  // Payload universel contenant les noms de colonnes et leurs alias (pour satisfaire les contraintes NOT NULL)
  const fullPayload: any = {
    order_number: orderNumberStr,
    customer_name: name,
    name: name,
    customer_phone: phone,
    phone: phone,
    shipping_city: city,
    city: city,
    shipping_address: address,
    address: address,
    total_amount: amount,
    amount: amount,
    quantity: quantity,
    product_title: productTitle,
    product_slug: productSlug,
    status: status,
    created_at: createdAt,
  };

  // 1. Sauvegarde locale de sécurité
  saveToLocalStorage({ ...fullPayload, id: "local_" + Date.now() });

  // 2. Premier essai d'insertion complète dans Supabase
  let res = await supabase.from("orders").insert([fullPayload]).select();

  // 3. Si certaines colonnes n'existent pas dans la table, filtrer et réessayer
  if (res.error) {
    console.warn("Supabase initial insert notice:", res.error.message);

    // Essayer avec uniquement le schéma classique standard (city, address, phone, name)
    const standardPayload: any = {
      order_number: orderNumberStr,
      name: name,
      phone: phone,
      city: city,
      address: address,
      amount: amount,
      total_amount: amount,
      quantity: quantity,
      status: status,
      created_at: createdAt
    };
    let res2 = await supabase.from("orders").insert([standardPayload]).select();
    if (!res2.error) return res2.data?.[0] || standardPayload;

    // Essayer avec le schéma alternatif (customer_name, customer_phone, shipping_city, shipping_address)
    const altPayload: any = {
      order_number: orderNumberStr,
      customer_name: name,
      customer_phone: phone,
      shipping_city: city,
      shipping_address: address,
      total_amount: amount,
      quantity: quantity,
      status: status,
      created_at: createdAt
    };
    let res3 = await supabase.from("orders").insert([altPayload]).select();
    if (!res3.error) return res3.data?.[0] || altPayload;
  }

  return res.data?.[0] || fullPayload;
}

/** Normalise un objet commande pour affichage sans faille dans le Dashboard */
function normalizeOrder(o: any): OrderItem {
  return {
    ...o,
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
