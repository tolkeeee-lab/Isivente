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

export async function saveNewOrder(orderData: Partial<Order>) {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to save order via API');
    const data = await res.json();
    return data.order || data;
  } catch (err) {
    console.error('Error saving order:', err);
    // Fallback direct supabase
    const orderNum = orderData.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
    const { data, error } = await supabase.from('orders').insert([{
      ...orderData,
      order_number: orderNum,
      status: orderData.status || 'pending',
    }]).select().single();
    if (error) console.error('Supabase fallback error:', error);
    return data || { order_number: orderNum };
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

export const getAllOrders = getOrders;

export async function updateOrderStatus(
  orderIdOrNumber: string,
  status: string,
  extraData?: { notes?: string; reservation_date?: string; [key: string]: any }
) {
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
  try {
    const { data } = await supabase
      .from('orders')
      .select('total_amount, product_title')
      .eq('order_number', orderRef)
      .single();
    if (data) {
      await supabase
        .from('orders')
        .update({
          total_amount: (data.total_amount || 0) + upsellPrice,
          product_title: `${data.product_title || ''} + ${upsellTitle}`,
        })
        .eq('order_number', orderRef);
    }
  } catch (err) {
    console.error('Error upgrading order:', err);
  }
}
