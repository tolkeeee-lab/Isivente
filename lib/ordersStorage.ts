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

/** Sauvegarde une nouvelle commande dans Supabase avec sécurité et gestion automatique du numéro de commande */
export async function saveNewOrder(orderData: OrderItem): Promise<any> {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const orderNumberStr = "CMD-" + randomNum;

  const fullOrder = {
    ...orderData,
    order_number: orderNumberStr,
    created_at: new Date().toISOString(),
  };

  // Sauvegarde locale de secours immédiate
  saveToLocalStorage(fullOrder);

  // 1. Premier essai d'insertion avec order_number format texte
  let res = await supabase.from("orders").insert([fullOrder]).select();

  // 2. Si échec de type (ex: order_number attend un entier), essai avec un entier
  if (res.error && (res.error.message.includes("order_number") || res.error.code === "22P02")) {
    const integerOrder = {
      ...fullOrder,
      order_number: randomNum,
    };
    res = await supabase.from("orders").insert([integerOrder]).select();
  }

  // 3. Si échec sur bundle_id manquant dans Supabase
  if (res.error && res.error.message.includes("bundle_id")) {
    const { bundle_id, ...withoutBundle } = fullOrder;
    res = await supabase.from("orders").insert([withoutBundle]).select();
  }

  // 4. Si toujours une erreur de colonnes inconnues, repli sur les colonnes standard avec order_number
  if (res.error && res.error.code === "PGRST204") {
    const coreOrder = {
      order_number: orderNumberStr,
      customer_name: orderData.customer_name || "Client",
      customer_phone: orderData.customer_phone || "",
      shipping_city: orderData.shipping_city || "",
      shipping_address: orderData.shipping_address || "",
      total_amount: orderData.total_amount || 14900,
      status: "pending"
    };
    res = await supabase.from("orders").insert([coreOrder]).select();
  }

  if (res.error) {
    console.error("Supabase insert notice:", res.error.message);
  }

  return res.data?.[0] || fullOrder;
}

/** Retourne toutes les commandes depuis Supabase (avec fusion du LocalStorage) */
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
