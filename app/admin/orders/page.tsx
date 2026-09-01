"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } else {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">En attente</span>;
      case 'confirmed': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Confirmé</span>;
      case 'shipped': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">En livraison</span>;
      case 'delivered': return <span className="bg-mint-deep/20 text-mint-deep px-3 py-1 rounded-full text-xs font-bold border border-mint-deep/30">Livré</span>;
      case 'cancelled': return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">Annulé</span>;
      default: return <span>{status}</span>;
    }
  };

  const openWhatsApp = (order: any) => {
    // Format phone number: remove spaces, ensure + prefix if not present (assuming Benin +229 if missing, but user requested input)
    let phone = order.customer_phone.replace(/\s+/g, '');
    if (!phone.startsWith('+')) phone = '+229' + phone;

    const message = `Bonjour ${order.customer_name},\n\nNous avons bien reçu votre commande pour le produit "${order.product_title}" (${order.bundle_name}).\nLe montant total à payer à la livraison est de ${order.total_amount.toLocaleString('fr-FR')} FCFA.\n\nPouvons-nous confirmer la livraison pour l'adresse : ${order.city} - ${order.address} ?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return <div className="p-8 flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin text-magenta" /> Chargement des commandes...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-3xl mb-2">Commandes</h1>
          <p className="text-ink-soft font-medium">Gérez toutes les commandes COD (Cash On Delivery).</p>
        </div>
        <button onClick={fetchOrders} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors">
          Actualiser
        </button>
      </div>

      <div className="bg-white border-2 border-ink rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-ink text-sm font-bold text-ink-soft">
                <th className="p-4">Réf</th>
                <th className="p-4">Client</th>
                <th className="p-4">Ville & Adresse</th>
                <th className="p-4">Produit</th>
                <th className="p-4">Total (FCFA)</th>
                <th className="p-4">Date</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-ink-soft font-medium">Aucune commande pour le moment.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-sm text-slate-500">{order.order_number}</td>
                    <td className="p-4">
                      <div className="font-bold">{order.customer_name}</div>
                      <div className="text-xs font-mono text-ink-soft mt-0.5">{order.customer_phone}</div>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      <div className="text-ink">{order.city}</div>
                      <div className="text-ink-soft text-xs truncate max-w-[150px]">{order.address}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-bold">{order.product_title}</div>
                      <div className="text-ink-soft text-xs">{order.bundle_name} (x{order.quantity})</div>
                    </td>
                    <td className="p-4 font-display font-bold text-magenta">
                      {order.total_amount?.toLocaleString('fr-FR')} F
                    </td>
                    <td className="p-4 text-xs font-medium text-ink-soft">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs font-bold border-2 border-slate-200 rounded-lg p-1.5 focus:border-purple focus:ring-0 cursor-pointer bg-white"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="shipped">En livraison</option>
                        <option value="delivered">Livré (Encaissé)</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                      <div className="mt-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openWhatsApp(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-bold hover:bg-[#128C7E] transition-colors shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964 1.003-3.588c-.608-1.065-.928-2.294-.928-3.567 0-3.866 3.15-7.01 7.02-7.01s7.01 3.144 7.01 7.01c0 3.868-3.149 7.035-7.11 7.035z"/></svg>
                        WhatsApp
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
