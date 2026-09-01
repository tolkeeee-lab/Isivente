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

const LOCAL_STORAGE_KEY = "isivente_orders";

function getStore(): OrderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStore(orders: OrderItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
}

/** Sauvegarde une nouvelle commande */
export function saveNewOrder(orderData: Omit<OrderItem, "id" | "created_at">): OrderItem {
  const order: OrderItem = {
    ...orderData,
    id: "ord_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };

  const existing = getStore();
  setStore([order, ...existing]);
  return order;
}

/** Retourne toutes les commandes */
export function getAllOrders(): OrderItem[] {
  return getStore();
}

/** Met à jour le statut d'une commande */
export function updateOrderStatus(orderId: string, newStatus: string): void {
  const orders = getStore();
  const updated = orders.map((o) =>
    o.id === orderId ? { ...o, status: newStatus as OrderItem["status"] } : o
  );
  setStore(updated);
}
