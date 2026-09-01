"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus as updateStorageStatus, OrderItem } from "@/lib/ordersStorage";
import { Search, Filter, Phone, MapPin, Package, Calendar, RefreshCw, MessageSquare } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string | undefined, newStatus: string) => {
    if (!id) return;
    setUpdatingId(id);
    await updateStorageStatus(id, newStatus);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || order.status === filter;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesFilter;

    const nameMatch = (order.customer_name || "").toLowerCase().includes(query);
    const phoneMatch = (order.customer_phone || "").toLowerCase().includes(query);
    const cityMatch = (order.shipping_city || order.city || "").toLowerCase().includes(query);
    const orderNumMatch = String(order.order_number || "").toLowerCase().includes(query);

    return matchesFilter && (nameMatch || phoneMatch || cityMatch || orderNumMatch);
  });

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="font-display font-bold text-2xl text-premium-dark flex items-center gap-3">
            <span>Gestion des Commandes</span>
            <span className="bg-purple-100 text-purple-800 text-xs font-extrabold px-3 py-1 rounded-full">
              {filteredOrders.length} {filteredOrders.length > 1 ? "commandes" : "commande"}
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tableau récapitulatif complet de toutes les commandes enregistrées.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-premium-dark px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* FILTRES & RECHERCHE */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* BARRE DE RECHERCHE */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, téléphone, ville ou N° commande..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-gray-50/50 text-premium-dark focus:bg-white focus:border-purple-400 outline-none transition-all"
          />
        </div>

        {/* ONGLETS FILTRES */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "Toutes" },
            { id: "pending", label: "À confirmer" },
            { id: "shipped", label: "En cours (Livreur)" },
            { id: "delivered", label: "Livrées" },
            { id: "cancelled", label: "Annulées" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-premium-dark text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* TABLEAU COMPLET DES COMMANDES */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11.5px] font-extrabold uppercase text-gray-400 tracking-wider">
                <th className="py-4 px-5">N° Commande</th>
                <th className="py-4 px-5">Client & Contact</th>
                <th className="py-4 px-5">Livraison (Ville & Adresse)</th>
                <th className="py-4 px-5">Produit & Pack</th>
                <th className="py-4 px-5">Montant Total</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Statut / Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Chargement des commandes...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const phoneClean = (order.customer_phone || "").replace(/\s+/g, "");
                  const whatsappUrl = phoneClean ? `https://wa.me/${phoneClean.replace(/[^0-9]/g, "")}` : "#";

                  return (
                    <tr key={order.id || `ord_${idx}`} className="hover:bg-purple-50/20 transition-colors">
                      
                      {/* 1. N° COMMANDE */}
                      <td className="py-4 px-5 font-mono font-bold text-purple-700 whitespace-nowrap">
                        {order.order_number || `CMD-${idx + 101}`}
                      </td>

                      {/* 2. CLIENT & TÉLÉPHONE */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-premium-dark">{order.customer_name || "Client"}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-gray-500 text-xs">
                          <Phone className="w-3 h-3 shrink-0 text-gray-400" />
                          <span>{order.customer_phone || "-"}</span>
                          {phoneClean && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] inline-flex items-center gap-1"
                              title="Contacter sur WhatsApp"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 3. VILLE & ADRESSE */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-premium-dark flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{order.shipping_city || order.city || "Non spécifiée"}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5 max-w-[200px] truncate" title={order.shipping_address || order.address}>
                          {order.shipping_address || order.address || "-"}
                        </div>
                      </td>

                      {/* 4. PRODUIT & PACK */}
                      <td className="py-4 px-5">
                        <div className="font-medium text-premium-dark flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{order.product_title || "Brosse Uméi 3-en-1"}</span>
                        </div>
                        <div className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-1">
                          {order.bundle_name || order.bundle_id || "Pack Découverte"} (x{order.quantity || 1})
                        </div>
                      </td>

                      {/* 5. MONTANT TOTAL */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-extrabold text-base text-premium-dark">
                          {(order.total_amount || 0).toLocaleString("fr-FR")} FCFA
                        </span>
                      </td>

                      {/* 6. DATE */}
                      <td className="py-4 px-5 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{new Date(order.created_at || Date.now()).toLocaleDateString("fr-FR")}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 pl-4 mt-0.5">
                          {new Date(order.created_at || Date.now()).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* 7. STATUT ET MODIFICATION EN UN CLIC */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <select
                          value={order.status || "pending"}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all ${getStatusBadgeClass(order.status)}`}
                        >
                          <option value="pending" className="bg-white text-gray-800 font-medium">🟠 À confirmer</option>
                          <option value="shipped" className="bg-white text-gray-800 font-medium">🔵 En cours (Livreur)</option>
                          <option value="delivered" className="bg-white text-gray-800 font-medium">🟢 Livrée & Encaissée</option>
                          <option value="cancelled" className="bg-white text-gray-800 font-medium">🔴 Annulée</option>
                        </select>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
