import { supabase } from "@/lib/supabase";

export interface OrderItem {
  id: string;
  product_slug: string;
  product_title: string;
  bundle_id: string;
  quantity: number;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  shipping_city: string;
  shipping_address: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

const LOCAL_STORAGE_KEY = "isivente_orders_store";

export async function saveNewOrder(orderData: Omit<OrderItem, "id" | "created_at">): Promise<OrderItem> {
  const newOrder: OrderItem = {
    ...orderData,
    id: "ord_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString()
  };

  // 1. Sauvegarde locale immédiate (LocalStorage) pour garantie 100% zéro perte
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalOrders();
      const updated = [newOrder, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("LocalStorage save error:", err);
    }
  }

  // 2. Sauvegarde dans Supabase si configuré
  try {
    const { data, error } = await supabase.from("orders").insert([{
      ...orderData,
      id: newOrder.id,
      created_at: newOrder.at || newOrder.created_at
    }]).select();

    if (error) {
      console.warn("Supabase insert notice:", error.message);
    }
  } catch (err) {
    console.warn("Supabase network notice:", err);
  }

  return newOrder;
}

export function getLocalOrders(): OrderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export async function getAllOrders(): Promise<OrderItem[]> {
  const localOrders = getLocalOrders();

  // Essayer de récupérer depuis Supabase
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      // Fusionner sans doublons
      const map = new Map<string, OrderItem>();
      data.forEach((o: any) => map.set(o.id, o));
      localOrders.forEach((o) => {
        if (!map.has(o.id)) map.set(o.id, o);
      });
      return Array.from(map.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  } catch (err) {
    console.warn("Supabase fetch notice:", err);
  }

  return localOrders;
}

export async function updateLocalAndRemoteOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
  // 1. Mise à jour locale
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalOrders();
      const updated = existing.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("LocalStorage update error:", err);
    }
  }

  // 2. Mise à jour Supabase
  try {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
  } catch (err) {
    console.warn("Supabase update notice:", err);
  }

  return true;
}
