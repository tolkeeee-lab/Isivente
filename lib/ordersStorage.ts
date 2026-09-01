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

export function saveLocalOrder(order: OrderItem) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalOrders();
    const filtered = existing.filter((o) => o.id !== order.id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([order, ...filtered]));
  } catch (err) {
    console.warn("LocalStorage error:", err);
  }
}

// 🚀 SAUVEGARDE COMMANDE (CLIENT -> SERVEUR + LOCAL)
export async function saveNewOrder(orderData: Omit<OrderItem, "id" | "created_at">): Promise<OrderItem> {
  const tempOrder: OrderItem = {
    ...orderData,
    id: "ord_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString()
  };

  // 1. Sauvegarde locale immédiate
  saveLocalOrder(tempOrder);

  // 2. Appel de l'API Serveur centralisée (/api/orders)
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.order) {
        saveLocalOrder(data.order);
        return data.order;
      }
    }
  } catch (err) {
    console.warn("API POST error, order kept in local storage:", err);
  }

  return tempOrder;
}

// 📦 RÉCUPÉRATION COMMANDE (DASHBOARD ADMIN)
export async function getAllOrders(): Promise<OrderItem[]> {
  const localOrders = getLocalOrders();

  try {
    const response = await fetch("/api/orders", {
      method: "GET",
      headers: { "Cache-Control": "no-cache" }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.orders && Array.isArray(data.orders)) {
        // Fusionner serveur + local sans doublon
        const map = new Map<string, OrderItem>();
        data.orders.forEach((o: OrderItem) => map.set(o.id, o));
        localOrders.forEach((o: OrderItem) => {
          if (!map.has(o.id)) map.set(o.id, o);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        }

        return merged;
      }
    }
  } catch (err) {
    console.warn("API GET error, returning local orders:", err);
  }

  return localOrders;
}

// 🔄 MISE À JOUR STATUT
export async function updateLocalAndRemoteOrderStatus(orderId: string, newStatus: string): Promise<boolean> {
  // 1. Mise à jour locale
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalOrders();
      const updated = existing.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {}
  }

  // 2. Mise à jour serveur
  try {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
  } catch (err) {
    console.warn("API PATCH error:", err);
  }

  return true;
}
