"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus as updateStorageStatus, deleteOrder, saveNewOrder, OrderItem } from "@/lib/ordersStorage";
import { supabase } from "@/lib/supabase";
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
  ChevronDown,
  Trash2,
  Download,
  Plus,
  X,
  UserCheck
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualForm, setManualForm] = useState({
    customer_name: "",
    customer_phone: "",
    city: "Cotonou",
    address: "",
    product_slug: "microscope",
    product_title: "Microscope Numérique Portable HD 1000X",
    total_amount: 29900,
  });

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // 1. Polling silencieux toutes les 8 secondes
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000);

    // 2. Événement local nouvelle commande
    const handleLocal = () => fetchOrders(true);
    window.addEventListener("isivente_new_order", handleLocal);

    // 3. BroadcastChannel cross-tab
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("isivente_orders_channel");
      bc.onmessage = () => fetchOrders(true);
    }

    // 4. Écoute Supabase Realtime directe
    const channel = supabase
      .channel("orders-page-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders(true);
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      window.removeEventListener("isivente_new_order", handleLocal);
      if (bc) bc.close();
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string | undefined, newStatus: string) => {
    if (!id) return;
    setUpdatingId(id);
    await updateStorageStatus(id, newStatus);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setUpdatingId(null);
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.customer_name.trim() || !manualForm.customer_phone.trim()) {
      alert("Veuillez renseigner au moins le nom et le numéro de téléphone.");
      return;
    }
    setManualLoading(true);
    try {
      await saveNewOrder({
        customer_name: manualForm.customer_name.trim(),
        customer_phone: manualForm.customer_phone.trim(),
        shipping_city: manualForm.city || "Cotonou",
        shipping_address: manualForm.address.trim() || `${manualForm.city} - Commande WhatsApp`,
        product_slug: manualForm.product_slug,
        product_title: manualForm.product_title,
        bundle_name: "Commande directe WhatsApp",
        quantity: 1,
        total_amount: Number(manualForm.total_amount) || 29900,
        status: "pending",
      });
      alert("✅ Commande WhatsApp enregistrée avec succès !");
      setShowManualModal(false);
      setManualForm({
        customer_name: "",
        customer_phone: "",
        city: "Cotonou",
        address: "",
        product_slug: "microscope",
        product_title: "Microscope Numérique Portable HD 1000X",
        total_amount: 29900,
      });
      fetchOrders();
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setManualLoading(false);
    }
  };

  const handleDelete = async (order: OrderItem) => {
    const ref = order.order_number || "cette commande";
    const customer = order.customer_name || "le client";
    const amount = order.total_amount ? ` (${new Intl.NumberFormat("fr-FR").format(order.total_amount)} FCFA)` : "";

    const isConfirmed = window.confirm(
      `⚠️ Confirmation de suppression :\n\nVoulez-vous vraiment supprimer définitivement la commande ${ref} de ${customer}${amount} ?\n\nCette action est irréversible et supprimera la commande de la base de données.`
    );

    if (!isConfirmed) {
      return;
    }

    const key = String(order.id || order.order_number);
    setDeletingId(key);
    await deleteOrder(order.id, order.order_number, order);
    setOrders(prev => prev.filter(o => {
      if (order.id && o.id === order.id) return false;
      if (order.order_number && String(o.order_number) === String(order.order_number)) return false;
      if (o.created_at === order.created_at && o.customer_phone === order.customer_phone) return false;
      return true;
    }));
    setDeletingId(null);
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

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert("Aucune commande à exporter.");
      return;
    }

    const statusLabels: Record<string, string> = {
      pending: "À confirmer",
      shipped: "En cours livreur",
      delivered: "Livrée et Encaissée",
      cancelled: "Annulée",
    };

    const headers = [
      "N° Commande",
      "Date",
      "Nom Client",
      "Téléphone",
      "Ville",
      "Adresse",
      "Produit",
      "Quantité",
      "Montant (FCFA)",
      "Statut",
    ];

    const rows = filteredOrders.map((order) => [
      order.order_number || order.id || "—",
      order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : "—",
      `"${(order.customer_name || "").replace(/"/g, '""')}"`,
      `"${(order.customer_phone || "").replace(/"/g, '""')}"`,
      `"${(order.shipping_city || order.city || "").replace(/"/g, '""')}"`,
      `"${(order.shipping_address || order.address || "").replace(/"/g, '""')}"`,
      `"${(order.product_title || order.product_slug || "").replace(/"/g, '""')}"`,
      order.quantity || 1,
      order.total_amount || 0,
      `"${statusLabels[order.status || "pending"] || order.status || "pending"}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `commandes-isivente-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        <div className="flex flex-wrap items-center gap-2">
          {filteredOrders.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  const numbers = filteredOrders
                    .map(o => (o.customer_phone || "").replace(/[^0-9]/g, ""))
                    .filter(Boolean)
                    .join("\n");
                  navigator.clipboard.writeText(numbers);
                  alert(`${filteredOrders.length} numéros WhatsApp copiés dans le presse-papier !`);
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.97] cursor-pointer"
                title="Copier tous les numéros de téléphone pour diffusion WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Copier les numéros WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={exportToCSV}
                className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.97] cursor-pointer"
                title="Exporter les commandes affichées au format Excel/CSV"
              >
                <Download className="w-3.5 h-3.5 stroke-[2] text-emerald-600" />
                <span>Exporter CSV</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.97] cursor-pointer"
            title="Ajouter manuellement une commande reçue par WhatsApp ou appel"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Saisie WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => fetchOrders()}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.97] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2] ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Actualiser</span>
          </button>
        </div>
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
                <th className="py-3.5 px-5 text-center">Action</th>
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
                    <td className="py-4 px-5 text-center"><div className="h-6 w-8 bg-slate-200 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400 font-medium">
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
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-slate-500 text-xs">
                          <span className="font-mono text-[11px] font-medium">{order.customer_phone || "-"}</span>
                          {phoneClean && (
                            <>
                              {/* Message Rupture / Réservation VIP */}
                              <a
                                href={`https://wa.me/229${phoneClean.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                  `Bonjour ${order.customer_name || ""}, c'est Isivente au sujet de votre commande du ${order.product_title || "Purificateur EraClean"} (Réf: ${order.order_number || ""}).\n\nSuite à une très forte demande, notre premier lot est en rupture immédiate. Le prochain arrivage est en cours d'acheminement.\n\nNous vous avons réservé un exemplaire prioritaire avec la LIVRAISON OFFERTE dès réception. Souhaitez-vous confirmer votre réservation ?`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-800 hover:text-amber-900 font-semibold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md text-[10.5px] inline-flex items-center gap-1 border border-amber-200 active:scale-[0.97] transition-all"
                                title="Envoyer le message WhatsApp de Précommande / Rupture de stock"
                              >
                                <MessageSquare className="w-3 h-3 text-amber-600" />
                                <span>Message Rupture/VIP</span>
                              </a>

                              {/* Message Direct Standard */}
                              <a
                                href={`https://wa.me/229${phoneClean.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                  `Bonjour ${order.customer_name || ""}, c'est Isivente. Nous vous contactons pour confirmer la livraison de votre commande ${order.order_number || ""} (${order.product_title || ""}). Êtes-vous disponible aujourd'hui ?`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md text-[10.5px] inline-flex items-center gap-1 border border-emerald-200/60 active:scale-[0.97] transition-all"
                                title="Confirmer la livraison sur WhatsApp"
                              >
                                <span>Direct</span>
                              </a>
                            </>
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
                        <div className="mt-1 flex flex-col gap-1">
                          <span className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md inline-block border border-slate-200/60 w-fit">
                            {(order.bundle_name || order.bundle_id || "Pack Découverte").split("[OFFRE VIP]")[0].trim()} (x{order.quantity || 1})
                          </span>
                          {(order.bundle_name || "").includes("[OFFRE VIP]") && (
                            <span className="text-[10.5px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-violet-200 w-fit animate-pulse">
                              <span>🎁 + UPSELL : {(order.bundle_name || "").split("[OFFRE VIP]")[1]?.trim()}</span>
                            </span>
                          )}
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

                      {/* 8. SUPPRESSION DÉFINITIVE */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(order)}
                          disabled={deletingId === (order.id || String(order.order_number))}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-150 active:scale-90 cursor-pointer disabled:opacity-40"
                          title="Supprimer définitivement cette commande"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* 📝 MODAL DE SAISIE COMMANDE DIRECTE WHATSAPP */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">Ajouter une Commande WhatsApp</h3>
                  <p className="text-[11px] text-slate-400">Pour les clients qui commandent directement en message privé</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom et Prénom du client *</label>
                <input
                  type="text"
                  required
                  value={manualForm.customer_name}
                  onChange={(e) => setManualForm({ ...manualForm, customer_name: e.target.value })}
                  placeholder="Ex: Salem Bosconovitch"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Numéro de téléphone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={manualForm.customer_phone}
                  onChange={(e) => setManualForm({ ...manualForm, customer_phone: e.target.value })}
                  placeholder="Ex: 0197100210"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono font-semibold focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ville *</label>
                  <select
                    value={manualForm.city}
                    onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-medium bg-white"
                  >
                    <option value="Cotonou">Cotonou</option>
                    <option value="Abomey-Calavi">Abomey-Calavi</option>
                    <option value="Porto-Novo">Porto-Novo</option>
                    <option value="Parakou">Parakou</option>
                    <option value="Ouidah">Ouidah</option>
                    <option value="Bohicon">Bohicon</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quartier / Repère</label>
                  <input
                    type="text"
                    value={manualForm.address}
                    onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                    placeholder="Ex: Akpakpa"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Produit commandé *</label>
                <select
                  value={manualForm.product_slug}
                  onChange={(e) => {
                    const slug = e.target.value;
                    const map: Record<string, { title: string; price: number }> = {
                      microscope: { title: "Microscope Numérique Portable HD 1000X", price: 29900 },
                      trozk: { title: "Système Électrique Modulaire 3-en-1 Trozk T3™ (15 000 mAh)", price: 29900 },
                      eraclean: { title: "Purificateur d'Air & Anti-Odeurs EraClean™", price: 19900 },
                      turbofan: { title: "Ventilateur Ceinture TurboFan™ Max", price: 16900 },
                      peeler: { title: "Éplucheur Automatique ChefPeel™ Pro", price: 14900 },
                      stabilisateur: { title: "Stabilisateur Trépied Z3 Zoom™", price: 49900 },
                      veilleuse: { title: "Veilleuse Projecteur LED 3D FRIOSZ", price: 14900 },
                      camera: { title: "Mini Caméra Espionne HD A9 Pro™", price: 16900 },
                      umei: { title: "Brosse Démêlante Vapeur Uméi 3-en-1", price: 14900 },
                    };
                    const sel = map[slug] || { title: "Produit Isivente", price: 29900 };
                    setManualForm({
                      ...manualForm,
                      product_slug: slug,
                      product_title: sel.title,
                      total_amount: sel.price,
                    });
                  }}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-medium bg-white"
                >
                  <option value="microscope">Microscope Numérique HD 1000X (29 900 F)</option>
                  <option value="trozk">Batterie Modulaire Trozk T3™ (29 900 F)</option>
                  <option value="eraclean">Purificateur d&apos;Air EraClean™ (19 900 F)</option>
                  <option value="turbofan">Ventilateur Ceinture TurboFan™ (16 900 F)</option>
                  <option value="peeler">Éplucheur ChefPeel™ Pro (14 900 F)</option>
                  <option value="stabilisateur">Stabilisateur Trépied Z3 (49 900 F)</option>
                  <option value="veilleuse">Veilleuse Projecteur 3D (14 900 F)</option>
                  <option value="camera">Mini Caméra Espionne HD A9 (16 900 F)</option>
                  <option value="umei">Brosse Démêlante Uméi (14 900 F)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Montant à encaisser (FCFA) *</label>
                <input
                  type="number"
                  required
                  value={manualForm.total_amount}
                  onChange={(e) => setManualForm({ ...manualForm, total_amount: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {manualLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Enregistrer la commande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
