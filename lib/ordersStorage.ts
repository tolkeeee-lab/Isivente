import { supabase } from "@/lib/supabase";

export interface OrderItem {
  id?: string;
  order_number?: string | number;
  product_slug?: string;
  product_title?: string;
  bundle_id?: string;
  bundle_name?: string;
  quantity?: number;
  total_amount?: number;
  customer_name?: string;
  customer_phone?: string;
  city?: string;
  shipping_city?: string;
  address?: string;
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

/** Sauvegarde une nouvelle commande dans Supabase avec auto-adaptation au schéma exact */
export async function saveNewOrder(orderData: OrderItem): Promise<any> {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const orderNumberStr = "CMD-" + randomNum;

  const name = orderData.customer_name || "Client";
  const phone = orderData.customer_phone || "";
  const city = orderData.city || orderData.shipping_city || "Cotonou";
  const address = orderData.address || orderData.shipping_address || "";
  const totalAmount = orderData.total_amount || 14900;
  const quantity = orderData.quantity || 1;
  const status = orderData.status || "pending";
  const createdAt = new Date().toISOString();

  // Schéma exact et complet de votre table Supabase
  let payload: Record<string, any> = {
    order_number: orderNumberStr,
    customer_name: name,
    customer_phone: phone,
    city: city,
    address: address,
    product_slug: orderData.product_slug || "umei",
    product_title: orderData.product_title || "Brosse Démêlante Vapeur Uméi 3-en-1",
    bundle_name: orderData.bundle_name || "Pack Découverte (1 Brosse)",
    total_amount: totalAmount,
    quantity: quantity,
    status: status,
    created_at: createdAt,
  };

  // 1. Sauvegarde locale de sécurité
  saveToLocalStorage({ ...payload, id: "local_" + Date.now() });

  // 2. Déclencher immédiatement l'événement local & cross-tab (BroadcastChannel / window / storage)
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("isivente_new_order", { detail: payload })
      );
      // Cross-tab broadcast pour réveiller le dashboard admin dans un autre onglet
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("isivente_orders_channel");
        bc.postMessage({ type: "new_order", data: payload });
        bc.close();
      }
      localStorage.setItem("isivente_last_order_trigger", JSON.stringify({ ...payload, _t: Date.now() }));
      
      // Déclencher le webhook de notification mobile (Telegram / WhatsApp)
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: payload }),
      }).catch(() => {});
    } catch (e) {
      console.warn("Realtime local trigger error:", e);
    }
  }

  // 3. Insertion dans Supabase avec boucle de repli automatique en cas de colonne manquante
  let attempts = 0;
  let finalResult = payload;
  while (attempts < 5) {
    attempts++;
    const res = await supabase.from("orders").insert([payload]).select();

    if (!res.error) {
      finalResult = res.data?.[0] || payload;
      break;
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

  return finalResult;
}

/** Normalise un objet commande pour le Dashboard */
function normalizeOrder(o: any): OrderItem {
  const stableId = String(o.id || o._id || o.order_number || `ord_${o.created_at || ""}_${o.customer_phone || ""}`);
  return {
    ...o,
    id: stableId,
    order_number: o.order_number || ("CMD-" + stableId.substring(0, 6)),
    customer_name: o.customer_name || o.name || "Client",
    customer_phone: o.customer_phone || o.phone || "",
    shipping_city: o.city || o.shipping_city || "Cotonou",
    city: o.city || o.shipping_city || "Cotonou",
    shipping_address: o.address || o.shipping_address || "",
    address: o.address || o.shipping_address || "",
    total_amount: Number(o.total_amount || o.amount || 14900),
    product_title: o.product_title || "Brosse Démêlante Vapeur Uméi 3-en-1",
    quantity: Number(o.quantity || 1),
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
    const key = String(normalized.id || normalized.order_number || `${normalized.customer_phone}_${normalized.created_at}`);
    map.set(key, normalized);
  });
  localOrders.forEach((o) => {
    const normalized = normalizeOrder(o);
    const key = String(normalized.id || normalized.order_number || `${normalized.customer_phone}_${normalized.created_at}`);
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

/** Supprime définitivement une commande de Supabase, du Serveur et du LocalStorage */
export async function deleteOrder(orderId?: string, orderNumber?: string | number, orderData?: Partial<OrderItem>): Promise<boolean> {
  const targetId = orderId ? String(orderId) : "";
  const targetNum = orderNumber ? String(orderNumber) : "";

  // 1. Suppression dans Supabase
  try {
    if (targetId && !targetId.startsWith("local_") && !targetId.startsWith("ord_")) {
      await supabase.from("orders").delete().eq("id", targetId);
    }
    if (targetNum) {
      await supabase.from("orders").delete().eq("order_number", targetNum);
    }
  } catch (err) {
    console.warn("Supabase delete notice:", err);
  }

  // 2. Suppression côté serveur (API Route)
  if (typeof window !== "undefined") {
    try {
      if (targetId) {
        fetch(`/api/orders?id=${encodeURIComponent(targetId)}`, { method: "DELETE" }).catch(() => {});
      }
      if (targetNum) {
        fetch(`/api/orders?id=${encodeURIComponent(targetNum)}`, { method: "DELETE" }).catch(() => {});
      }
    } catch {}
  }

  // 3. Suppression dans LocalStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        const filtered = list.filter((o: any) => {
          const oId = String(o.id || o._id || "");
          const oNum = String(o.order_number || "");
          const oPhone = String(o.customer_phone || o.phone || "");
          const oDate = String(o.created_at || "");

          if (targetId && (oId === targetId || oNum === targetId)) return false;
          if (targetNum && (oNum === targetNum || oId === targetNum)) return false;
          if (orderData?.customer_phone && orderData?.created_at && oPhone === orderData.customer_phone && oDate === orderData.created_at) return false;
          return true;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn("LocalStorage delete notice:", e);
    }
  }

  return true;
}

/** Supprime toutes les commandes (utile pour nettoyer les tests) */
export async function clearAllOrders(): Promise<boolean> {
  try {
    await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } catch {}

  // Purge serveur
  if (typeof window !== "undefined") {
    try {
      fetch("/api/orders?clearAll=true", { method: "DELETE" }).catch(() => {});
    } catch {}
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem("isivente_last_order_trigger");
  }
  return true;
}
