"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus as updateStorageStatus, OrderItem } from "@/lib/ordersStorage";
import { 
  Search, 
  Phone, 
  MapPin, 
  Package, 
  Calendar, 
  RefreshCw, 
  MessageSquare,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronDown
} from "lucide-react";

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

  const getStatusCount = (statusId: string) => {
    if (statusId === "all") return orders.length;
    return orders.filter(o => o.status === statusId).length;
  };

  const filterTabs = [
    { id: "all", label: "Toutes" },
    { id: "pending", label: "À confirmer" },
    { id: "shipped", label: "En cours livreur" },
    { id: "delivered", label: "Livrées & Encaissées" },
    { id: "cancelled", label: "Annulées" }
  ];

  return (
    <div className="space-y-6 animate-[staggerFadeUp_240ms_cubic-bezier(0.16,1,0.3,1)_both]">
      
      {/* HEADER PAGE */}
      <div className="card-figma p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1">
            Dispatch & Logistique
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 flex items-center gap-3">
            <span>Gestion des Commandes</span>
            <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredOrders.length} {filteredOrders.length > 1 ? "commandes" : "commande"}
            </span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Suivi des appels clients, assignation des livreurs et statut des encaissements COD.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.97] cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 stroke-[2] ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* 📊 RUBAN HORIZONTAL DÉFILABLE DES STATUTS */}
      <div className="relative -mx-2 px-2">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
          <div className="card-figma p-3.5 min-w-[180px] shrink-0 snap-start flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</div>
              <div className="text-lg font-bold font-mono text-slate-900">{orders.length}</div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              ∑
            </div>
          </div>

          <div className="card-figma p-3.5 min-w-[180px] shrink-0 snap-start flex items-center justify-between border-amber-200/70 bg-amber-50/20">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">En attente</div>
              <div className="text-lg font-bold font-mono text-amber-700">{getStatusCount("pending")}</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <div className="card-figma p-3.5 min-w-[180px] shrink-0 snap-start flex items-center justify-between border-sky-200/70 bg-sky-50/20">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">En livraison</div>
              <div className="text-lg font-bold font-mono text-sky-700">{getStatusCount("shipped")}</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          </div>

          <div className="card-figma p-3.5 min-w-[180px] shrink-0 snap-start flex items-center justify-between border-emerald-200/70 bg-emerald-50/20">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Livrées</div>
              <div className="text-lg font-bold font-mono text-emerald-700">{getStatusCount("delivered")}</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* RECHERCHE ET ONGLETS DE FILTRES */}
      <div className="card-figma p-4 sm:p-5 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        
        {/* BARRE DE RECHERCHE */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, téléphone, ville ou N°..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 outline-none transition-all"
          />
        </div>

        {/* ONGLETS FILTRES AVEC COMPTEURS */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {filterTabs.map((tab) => {
            const count = getStatusCount(tab.id);
            const isActive = filter === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all duration-150 cursor-pointer active:scale-[0.97] ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* TABLEAU COMPLET DES COMMANDES */}
      <div className="card-figma overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-5">Réf.</th>
                <th className="py-3.5 px-5">Client & Contact</th>
                <th className="py-3.5 px-5">Destination & Adresse</th>
                <th className="py-3.5 px-5">Produit / Pack</th>
                <th className="py-3.5 px-5 text-right">Montant</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5 text-center">Statut Commande</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5 text-center"><div className="h-6 w-28 bg-slate-200 rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 font-medium">
                    Aucune commande ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const phoneClean = (order.customer_phone || "").replace(/\s+/g, "");
                  const whatsappUrl = phoneClean ? `https://wa.me/${phoneClean.replace(/[^0-9]/g, "")}` : "#";

                  return (
                    <tr 
                      key={order.id || `ord_${idx}`} 
                      className="hover:bg-slate-50/70 transition-colors"
                      style={{ animationDelay: `${idx * 25}ms` }}
                    >
                      
                      {/* 1. N° COMMANDE */}
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {order.order_number || `CMD-${idx + 101}`}
                      </td>

                      {/* 2. CLIENT & TÉLÉPHONE */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{order.customer_name || "Client"}</div>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                          <span className="font-mono text-[11px]">{order.customer_phone || "-"}</span>
                          {phoneClean && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[10.5px] inline-flex items-center gap-1 border border-emerald-200/60 active:scale-[0.97] transition-all"
                              title="Contacter sur WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* 3. VILLE & ADRESSE */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{order.shipping_city || order.city || "Non spécifiée"}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5 max-w-[220px] truncate" title={order.shipping_address || order.address}>
                          {order.shipping_address || order.address || "-"}
                        </div>
                      </td>

                      {/* 4. PRODUIT & PACK */}
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{order.product_title || "Brosse Uméi 3-en-1"}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1 border border-slate-200/60">
                          {order.bundle_name || order.bundle_id || "Pack Découverte"} (x{order.quantity || 1})
                        </div>
                      </td>

                      {/* 5. MONTANT TOTAL */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span className="font-bold font-mono text-slate-900 tabular-nums text-sm">
                          {new Intl.NumberFormat("fr-FR").format(order.total_amount || 0)} FCFA
                        </span>
                      </td>

                      {/* 6. DATE */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(order.created_at || Date.now()).toLocaleDateString("fr-FR")}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pl-4 mt-0.5">
                          {new Date(order.created_at || Date.now()).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* 7. STATUT DÉROULANT SENIOR */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        <select
                          value={order.status || "pending"}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all ${
                            order.status === "pending" ? "bg-amber-50 text-amber-800 border-amber-200/80" :
                            order.status === "shipped" ? "bg-sky-50 text-sky-800 border-sky-200/80" :
                            order.status === "delivered" ? "bg-emerald-50 text-emerald-800 border-emerald-200/80" :
                            order.status === "cancelled" ? "bg-rose-50 text-rose-800 border-rose-200/80" :
                            "bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          <option value="pending">En attente / À confirmer</option>
                          <option value="shipped">En cours (Livreur assigné)</option>
                          <option value="delivered">Livrée & Encaissée</option>
                          <option value="cancelled">Annulée</option>
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
