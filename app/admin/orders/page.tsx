"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus as updateStorageStatus, OrderItem } from "@/lib/ordersStorage";
import { Search, Filter, MoreVertical, MapPin, Phone, User, Package, Calendar } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => filter === "all" || order.status === filter);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    await updateStorageStatus(id, newStatus);
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
    }
    setUpdating(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">À confirmer</span>;
      case 'shipped': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">En cours (Livreur)</span>;
      case 'delivered': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Livrée & Encaissée</span>;
      case 'cancelled': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Annulée</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">En attente</span>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* LISTE DES COMMANDES */}
      <div className={`flex-1 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden ${selectedOrder ? 'hidden lg:block' : 'block'}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-display font-semibold text-2xl text-premium-dark">Suivi des Livraisons</h1>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "all" ? "bg-premium-dark text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Toutes</button>
            <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "pending" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>À confirmer</button>
            <button onClick={() => setFilter("shipped")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "shipped" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>En cours</button>
            <button onClick={() => setFilter("delivered")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "delivered" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Livrées</button>
            <button onClick={() => setFilter("cancelled")} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "cancelled" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Annulées</button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Aucune commande trouvée</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <li 
                  key={order.id || Math.random()}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-6 hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-premium-bg border-l-4 border-l-premium-accent' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-premium-dark">{order.customer_name}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.shipping_city}</span>
                    <span className="font-medium text-premium-dark">{(order.total_amount || 0).toLocaleString('fr-FR')} F</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* DETAILS COMMANDE (SIDE PANEL) */}
      {selectedOrder && (
        <div className="flex-[0.8] bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-[calc(100vh-120px)] lg:sticky top-6">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-display font-semibold text-lg text-premium-dark">Détails de la commande</h2>
            <button onClick={() => setSelectedOrder(null)} className="lg:hidden text-gray-400 hover:text-gray-600">
              Fermer
            </button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-display font-bold text-2xl text-premium-dark mb-1">{selectedOrder.customer_name}</h3>
                <p className="text-gray-500 flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedOrder.customer_phone}</p>
              </div>
              {getStatusBadge(selectedOrder.status)}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lieu de livraison</h4>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-premium-dark">{selectedOrder.shipping_city}</p>
                    <p className="text-gray-600">{selectedOrder.shipping_address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Produit commandé</h4>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-premium-dark">{selectedOrder.product_title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-600 text-sm">Quantité: {selectedOrder.quantity || 1}</span>
                      <span className="font-bold text-premium-dark">{(selectedOrder.total_amount || 0).toLocaleString('fr-FR')} F</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-2xl">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Date</h4>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <p className="font-medium text-premium-dark">{new Date(selectedOrder.created_at || Date.now()).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Changer le statut (Livreur)</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                disabled={updating || selectedOrder.status === 'pending'}
                onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${selectedOrder.status === 'pending' ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                À confirmer
              </button>
              <button 
                disabled={updating || selectedOrder.status === 'shipped'}
                onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${selectedOrder.status === 'shipped' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                En cours
              </button>
              <button 
                disabled={updating || selectedOrder.status === 'delivered'}
                onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${selectedOrder.status === 'delivered' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Livrée
              </button>
              <button 
                disabled={updating || selectedOrder.status === 'cancelled'}
                onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${selectedOrder.status === 'cancelled' ? 'bg-red-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
