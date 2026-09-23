import { supabase } from './supabase';

export interface Order {
  id?: string;
  order_number?: string;
  customer_name?: string;
  name?: string;
  customer_phone?: string;
  phone?: string;
  customer_email?: string;
  product_id?: string;
  product_title?: string;
  product_name?: string;
  product_slug?: string;
  bundle_id?: string;
  bundle_name?: string;
  quantity?: number;
  total_amount?: number;
  price?: number;
  shipping_address?: string;
  address?: string;
  city?: string;
  shipping_city?: string;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export type OrderItem = Order;

const ORDERS_STORAGE_KEY = 'isivente_cached_orders';

// Mémoire tampon de secours en cas de désactivation ou de quota dépassé sur localStorage (Safari Privé, etc.)
let memoryOrdersFallback: Order[] = [];

export function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryOrdersFallback = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // LocalStorage inaccessible ou bloqué
  }
  return memoryOrdersFallback;
}

export function saveLocalOrders(orders: Order[]) {
  const safeOrders = Array.isArray(orders) ? orders.slice(0, 1000) : [];
  memoryOrdersFallback = safeOrders;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(safeOrders));
  } catch (e) {
    // QuotaExceededError ou Navigation Privée Safari : les données restent en mémoire
  }
}

/**
 * Enregistrement résilient d'une nouvelle commande :
 * 1. Tente l'API Next.js avec un timeout de 7.5s (optimisé pour réseaux mobiles 3G/4G).
 * 2. En cas de timeout ou d'erreur réseau, tente Supabase directement.
 * 3. En cas d'échec total de connexion, stocke localement et renvoie la commande pour garantir que le client n'est JAMAIS bloqué.
 */
export async function saveNewOrder(orderData: Partial<Order>): Promise<Order> {
  const orderNum = orderData.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
  const fallbackOrder: Order = {
    ...orderData,
    order_number: orderNum,
    status: orderData.status || 'pending',
    created_at: orderData.created_at || new Date().toISOString(),
  };

  // 1. Tenter via l'API sécurisée avec timeout défensif
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fallbackOrder }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const saved = data?.order || data;
      // Mettre à jour le cache local immédiatement
      const current = getLocalOrders();
      saveLocalOrders([saved, ...current.filter(o => o.order_number !== saved.order_number)]);
      return saved;
    }
  } catch (err: any) {
    console.warn('API orders non disponible ou timeout, bascule sur Supabase direct:', err?.message);
  }

  // 2. Fallback direct Supabase
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([fallbackOrder])
      .select()
      .single();

    if (!error && data) {
      const current = getLocalOrders();
      saveLocalOrders([data, ...current.filter(o => o.order_number !== data.order_number)]);
      return data;
    }
  } catch (supErr: any) {
    console.warn('Supabase direct fallback indisponible:', supErr?.message);
  }

  // 3. Fallback ultime local (zéro perte de commande)
  const current = getLocalOrders();
  saveLocalOrders([fallbackOrder, ...current.filter(o => o.order_number !== fallbackOrder.order_number)]);
  return fallbackOrder;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;
    if (data && data.length > 0) {
      saveLocalOrders(data);
      return data;
    }
    return getLocalOrders();
  } catch (err) {
    console.warn('Erreur récupération commandes distantes, chargement local:', err);
    return getLocalOrders();
  }
}

export const getAllOrders = getOrders;

export async function updateOrderStatus(
  orderIdOrNumber: string,
  status: string,
  extraData?: { notes?: string; reservation_date?: string;[key: string]: any }
) {
  if (!orderIdOrNumber) return;

  // Mise à jour locale immédiate
  const local = getLocalOrders();
  const updatedLocal = local.map(o => {
    if (o.id === orderIdOrNumber || o.order_number === orderIdOrNumber) {
      return { ...o, status, ...(extraData || {}) };
    }
    return o;
  });
  saveLocalOrders(updatedLocal);

  try {
    const updatePayload: Record<string, any> = { status };
    if (extraData) {
      if (extraData.notes !== undefined) updatePayload.notes = extraData.notes;
      if (extraData.reservation_date !== undefined) updatePayload.reservation_date = extraData.reservation_date;
    }
    const query = supabase.from('orders').update(updatePayload);
    if (orderIdOrNumber.includes('-') && isNaN(Number(orderIdOrNumber))) {
      await query.eq('order_number', orderIdOrNumber);
    } else {
      await query.eq('id', orderIdOrNumber);
    }
  } catch (err) {
    console.error('Error updating order status:', err);
  }
}

export async function deleteOrder(orderId?: string, orderNumber?: string, orderObj?: any) {
  const targetId = orderId || orderNumber;
  if (!targetId) return;

  // Suppression locale
  const local = getLocalOrders();
  saveLocalOrders(local.filter(o => o.id !== targetId && o.order_number !== targetId));

  try {
    const query = supabase.from('orders').delete();
    if (orderId) {
      await query.eq('id', orderId);
    } else if (orderNumber) {
      await query.eq('order_number', orderNumber);
    }
  } catch (err) {
    console.error('Error deleting order:', err);
  }
}

export async function upgradeOrderWithUpsell(orderRef: string, upsellPrice: number, upsellTitle: string) {
  if (!orderRef) return;

  // Mise à jour locale
  const local = getLocalOrders();
  const updated = local.map(o => {
    if (o.order_number === orderRef || o.id === orderRef) {
      return {
        ...o,
        total_amount: (Number(o.total_amount) || 0) + upsellPrice,
        bundle_name: `${o.bundle_name || ''} + [OFFRE VIP] ${upsellTitle}`,
      };
    }
    return o;
  });
  saveLocalOrders(updated);

  try {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upgrade_upsell',
        orderRef,
        additionalAmount: upsellPrice,
        addedItemTitle: upsellTitle,
      }),
    });
  } catch (err) {
    console.error('Error upgrading order with upsell:', err);
  }
}
