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

/** Sauvegarde une nouvelle commande dans Supabase */
export async function saveNewOrder(orderData: Omit<OrderItem, "id" | "created_at">): Promise<OrderItem> {
  const newOrder = {
    ...orderData,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("orders")
    .insert([newOrder])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error.message);
    throw new Error("Erreur d'enregistrement: " + error.message);
  }

  return data as OrderItem;
}

/** Retourne toutes les commandes depuis Supabase */
export async function getAllOrders(): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return [];
  }

  return (data || []) as OrderItem[];
}

/** Met à jour le statut d'une commande dans Supabase */
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Supabase update error:", error.message);
  }
}
