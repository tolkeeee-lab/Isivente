"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  getAllOrders, 
  getLocalOrders,
  updateOrderStatus as updateStorageStatus, 
  deleteOrder, 
  saveNewOrder, 
  OrderItem 
} from "@/lib/ordersStorage";
import { supabase } from "@/lib/supabase";
import { DEFAULT_CATALOG } from "@/lib/defaultCatalog";
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
  Clock,
  Trash2,
  Download,
  Plus,
  X,
  UserCheck,
  Bookmark,
  CalendarClock,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Tag,
  AlertCircle
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(() => getLocalOrders());
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return getLocalOrders().length === 0;
    }
    return false;
  });
  
  // ── Mode d'affichage principal : Triage commercial vs Flux logistique global ──
  const [viewMode, setViewMode] = useState<"triage" | "logistics">("triage");
  
  // ── Filtres pour le flux logistique global ──
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Mode d'affichage des sections dans le tableau de triage ──
  const [triageFilter, setTriageFilter] = useState<"all" | "pending" | "confirmed" | "reserved" | "postponed">("all");

  // ── Filtres dédiés et autonomes pour chaque section du tableau à part ──
  const [pendingFilters, setPendingFilters] = useState({
    search: "",
    city: "all",
    product: "all",
  });

  const [confirmedFilters, setConfirmedFilters] = useState({
    search: "",
    city: "all",
    product: "all",
  });

  const [reservedFilters, setReservedFilters] = useState({
    search: "",
    city: "all",
    product: "all",
    period: "all", // "all" | "payday" | "has_date" | "no_date"
  });

  const [postponedFilters, setPostponedFilters] = useState({
    search: "",
    city: "all",
    product: "all",
  });

  // ── États d'actions ──
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // ── Modale d'édition de note / date de réservation ──
  const [editingNoteOrder, setEditingNoteOrder] = useState<OrderItem | null>(null);
  const [noteForm, setNoteForm] = useState({ reservation_date: "", notes: "" });

  // ── Modale Saisie WhatsApp ──
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
    status: "confirmed",
    reservation_date: "",
    notes: "",
  });

  const fetchOrders = async (silent = false) => {
    if (!silent && orders.length === 0) setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    // Si on a déjà des commandes en local, fetch en arrière-plan sans bloquer
    const hasLocal = getLocalOrders().length > 0;
    fetchOrders(hasLocal);

    // 1. Polling silencieux espacé (30 secondes)
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 30000);

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

  // ── Changement de statut 1-Clic ──
  const handleStatusChange = async (
    id: string | undefined, 
    newStatus: string, 
    extraData?: { notes?: string; reservation_date?: string }
  ) => {
    if (!id) return;
    setUpdatingId(id);
    await updateStorageStatus(id, newStatus, extraData);
    setOrders(prev => prev.map(o => o.id === id ? { 
      ...o, 
      status: newStatus,
      ...(extraData?.notes !== undefined ? { notes: extraData.notes } : {}),
      ...(extraData?.reservation_date !== undefined ? { reservation_date: extraData.reservation_date } : {}),
    } : o));
    setUpdatingId(null);
  };

  // ── Enregistrement note / date de réservation ──
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteOrder?.id) return;
    await handleStatusChange(editingNoteOrder.id, editingNoteOrder.status || "reserved", {
      reservation_date: noteForm.reservation_date.trim(),
      notes: noteForm.notes.trim()
    });
    setEditingNoteOrder(null);
  };

  // ── Création manuelle (WhatsApp / Appel) ──
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
        status: manualForm.status,
        reservation_date: manualForm.reservation_date.trim(),
        notes: manualForm.notes.trim(),
      });
      alert("✅ Commande enregistrée avec succès !");
      setShowManualModal(false);
      setManualForm({
        customer_name: "",
        customer_phone: "",
        city: "Cotonou",
        address: "",
        product_slug: "microscope",
        product_title: "Microscope Numérique Portable HD 1000X",
        total_amount: 29900,
        status: "confirmed",
        reservation_date: "",
        notes: "",
      });
      fetchOrders();
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setManualLoading(false);
    }
  };

  // ── Suppression sécurisée ──
  const handleDelete = async (order: OrderItem) => {
    const ref = order.order_number || "cette commande";
    const customer = order.customer_name || "le client";
    const amount = order.total_amount ? ` (${new Intl.NumberFormat("fr-FR").format(order.total_amount)} FCFA)` : "";

    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement la commande ${ref} de ${customer}${amount} ?\nCette action est irréversible.`
    );
    if (!isConfirmed) return;

    setDeletingId(order.id || String(order.order_number));
    await deleteOrder(order.id, order.order_number, order);
    setOrders(prev => prev.filter(o => {
      if (order.id && o.id === order.id) return false;
      if (order.order_number && String(o.order_number) === String(order.order_number)) return false;
      if (o.created_at === order.created_at && o.customer_phone === order.customer_phone) return false;
      return true;
    }));
    setDeletingId(null);
  };

  // ── Calcul des groupes de triage ──
  const pendingOrders = useMemo(() => orders.filter(o => o.status === "pending" || !o.status), [orders]);
  const confirmedOrders = useMemo(() => orders.filter(o => o.status === "confirmed"), [orders]);
  const reservedOrders = useMemo(() => orders.filter(o => o.status === "reserved"), [orders]);
  const postponedOrders = useMemo(() => orders.filter(o => o.status === "postponed"), [orders]);
  
  const totalTriageCount = pendingOrders.length + confirmedOrders.length + reservedOrders.length + postponedOrders.length;
  const totalPendingAmount = pendingOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const totalConfirmedAmount = confirmedOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const totalReservedAmount = reservedOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const totalPostponedAmount = postponedOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

  // ── Liste des produits uniques pour filtre ──
  const productOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      if (o.product_title) set.add(o.product_title);
    });
    return Array.from(set).sort();
  }, [orders]);

  // ── Liste des villes uniques pour filtre ──
  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      const c = (o.shipping_city || o.city || "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [orders]);

  // ── Filtrage autonome : Section 0 (Nouvelles reçues à confirmer) ──
  const filteredPendingOrders = useMemo(() => {
    return pendingOrders.filter(order => {
      const q = pendingFilters.search.toLowerCase().trim();
      const matchesSearch = !q || (
        (order.customer_name || "").toLowerCase().includes(q) ||
        (order.customer_phone || "").toLowerCase().includes(q) ||
        (order.shipping_city || order.city || "").toLowerCase().includes(q) ||
        (order.shipping_address || order.address || "").toLowerCase().includes(q) ||
        String(order.order_number || "").toLowerCase().includes(q)
      );

      const cityVal = (order.shipping_city || order.city || "").toLowerCase();
      const matchesCity = pendingFilters.city === "all" || cityVal === pendingFilters.city.toLowerCase();
      const matchesProduct = pendingFilters.product === "all" || order.product_title === pendingFilters.product;

      return matchesSearch && matchesCity && matchesProduct;
    });
  }, [pendingOrders, pendingFilters]);

  // ── Filtrage autonome : Section 1 (Validées) ──
  const filteredConfirmedOrders = useMemo(() => {
    return confirmedOrders.filter(order => {
      const q = confirmedFilters.search.toLowerCase().trim();
      const matchesSearch = !q || (
        (order.customer_name || "").toLowerCase().includes(q) ||
        (order.customer_phone || "").toLowerCase().includes(q) ||
        (order.shipping_city || order.city || "").toLowerCase().includes(q) ||
        (order.shipping_address || order.address || "").toLowerCase().includes(q) ||
        String(order.order_number || "").toLowerCase().includes(q)
      );

      const cityVal = (order.shipping_city || order.city || "").toLowerCase();
      const matchesCity = confirmedFilters.city === "all" || cityVal === confirmedFilters.city.toLowerCase();
      const matchesProduct = confirmedFilters.product === "all" || order.product_title === confirmedFilters.product;

      return matchesSearch && matchesCity && matchesProduct;
    });
  }, [confirmedOrders, confirmedFilters]);

  // ── Filtrage autonome : Section 2 (Réservations & Précommandes) ──
  const filteredReservedOrders = useMemo(() => {
    return reservedOrders.filter(order => {
      const q = reservedFilters.search.toLowerCase().trim();
      const matchesSearch = !q || (
        (order.customer_name || "").toLowerCase().includes(q) ||
        (order.customer_phone || "").toLowerCase().includes(q) ||
        (order.shipping_city || order.city || "").toLowerCase().includes(q) ||
        String(order.order_number || "").toLowerCase().includes(q) ||
        (order.notes || "").toLowerCase().includes(q) ||
        (order.reservation_date || "").toLowerCase().includes(q)
      );

      const cityVal = (order.shipping_city || order.city || "").toLowerCase();
      const matchesCity = reservedFilters.city === "all" || cityVal === reservedFilters.city.toLowerCase();
      const matchesProduct = reservedFilters.product === "all" || order.product_title === reservedFilters.product;

      let matchesPeriod = true;
      const combinedDate = `${order.reservation_date || ""} ${order.notes || ""}`.toLowerCase();
      if (reservedFilters.period === "payday") {
        matchesPeriod = combinedDate.includes("25") || combinedDate.includes("26") || 
                        combinedDate.includes("27") || combinedDate.includes("28") || 
                        combinedDate.includes("29") || combinedDate.includes("30") || 
                        combinedDate.includes("31") || combinedDate.includes("paie") || 
                        combinedDate.includes("salaire") || combinedDate.includes("fin de mois");
      } else if (reservedFilters.period === "has_date") {
        matchesPeriod = !!order.reservation_date && order.reservation_date.trim().length > 0;
      } else if (reservedFilters.period === "no_date") {
        matchesPeriod = !order.reservation_date || order.reservation_date.trim().length === 0;
      }

      return matchesSearch && matchesCity && matchesProduct && matchesPeriod;
    });
  }, [reservedOrders, reservedFilters]);

  // ── Filtrage autonome : Section 3 (Mises à plus tard / Reports) ──
  const filteredPostponedOrders = useMemo(() => {
    return postponedOrders.filter(order => {
      const q = postponedFilters.search.toLowerCase().trim();
      const matchesSearch = !q || (
        (order.customer_name || "").toLowerCase().includes(q) ||
        (order.customer_phone || "").toLowerCase().includes(q) ||
        (order.shipping_city || order.city || "").toLowerCase().includes(q) ||
        String(order.order_number || "").toLowerCase().includes(q) ||
        (order.notes || "").toLowerCase().includes(q)
      );

      const cityVal = (order.shipping_city || order.city || "").toLowerCase();
      const matchesCity = postponedFilters.city === "all" || cityVal === postponedFilters.city.toLowerCase();
      const matchesProduct = postponedFilters.product === "all" || order.product_title === postponedFilters.product;

      return matchesSearch && matchesCity && matchesProduct;
    });
  }, [postponedOrders, postponedFilters]);

  // ── Filtrage pour le flux logistique global ──
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesFilter = filter === "all" || order.status === filter;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesFilter;

      const nameMatch = (order.customer_name || "").toLowerCase().includes(query);
      const phoneMatch = (order.customer_phone || "").toLowerCase().includes(query);
      const cityMatch = (order.shipping_city || order.city || "").toLowerCase().includes(query);
      const orderNumMatch = String(order.order_number || "").toLowerCase().includes(query);

      return matchesFilter && (nameMatch || phoneMatch || cityMatch || orderNumMatch);
    });
  }, [orders, filter, searchQuery]);

  const getStatusCount = (statusId: string) => {
    if (statusId === "all") return orders.length;
    return orders.filter(o => o.status === statusId).length;
  };

  const filterTabs = [
    { id: "all", label: "Toutes" },
    { id: "confirmed", label: "✅ Validées" },
    { id: "reserved", label: "📅 Réservations" },
    { id: "postponed", label: "⏳ Mises à plus tard" },
    { id: "pending", label: "📦 À confirmer" },
    { id: "shipped", label: "🚚 En cours livreur" },
    { id: "delivered", label: "🎉 Livrées" },
    { id: "cancelled", label: "❌ Annulées" }
  ];

  const exportToCSV = (listToExport: OrderItem[]) => {
    if (listToExport.length === 0) {
      alert("Aucune commande à exporter.");
      return;
    }

    const statusLabels: Record<string, string> = {
      confirmed: "Validée (Prête à livrer)",
      reserved: "Réservation",
      postponed: "Mis à plus tard",
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
      "Date Réservation / Note",
    ];

    const rows = listToExport.map((order) => [
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
      `"${(order.reservation_date || order.notes || "").replace(/"/g, '""')}"`,
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

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  return (
    <div className="space-y-6 animate-[staggerFadeUp_240ms_cubic-bezier(0.16,1,0.3,1)_both]">
      
      {/* ── HEADER PAGE & ACTIONS GLOBALES ── */}
      <div className="card-figma p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pilotage Commercial & Dispatch</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 flex items-center gap-3">
            <span>Gestion des Commandes</span>
            <span className="bg-slate-100 text-slate-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              {orders.length} total
            </span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Triage des réservations, validation des livraisons et suivi des reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.97] cursor-pointer"
            title="Ajouter une commande reçue par WhatsApp ou appel téléphonique"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Saisie WhatsApp / Appel</span>
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

      {/* ── SÉLECTEUR DE VUE PRINCIPAL : TABLEAU DE TRIAGE DÉDIÉ vs FLUX GÉNÉRAL ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex p-1 bg-slate-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("triage")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
              viewMode === "triage"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tableau Triage & Suivi (Validées • Réservées • Plus tard)</span>
            <span className="bg-indigo-50 text-indigo-700 text-[10.5px] font-mono px-2 py-0.2 rounded-full font-bold">
              {totalTriageCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("logistics")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 ${
              viewMode === "logistics"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-slate-500" />
            <span>Flux Logistique Global (Toutes les commandes)</span>
            <span className="bg-slate-200 text-slate-700 text-[10.5px] font-mono px-2 py-0.2 rounded-full font-bold">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Bouton Export CSV contextuel */}
        <button
          type="button"
          onClick={() => exportToCSV(viewMode === "triage" ? [...confirmedOrders, ...reservedOrders, ...postponedOrders] : filteredOrders)}
          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          VUE 1 : LE TABLEAU À PART DÉDIÉ AU TRIAGE COMMERCIAL
          (Validées • Réservations • Mises à plus tard avec filtres autonomes)
         ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === "triage" && (
        <div className="space-y-6">

          {/* 4 CARTES STATISTIQUES EN HAUT DU TABLEAU DE TRIAGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Carte Nouvelles Reçues (À Traiter) */}
            <div 
              onClick={() => setTriageFilter(triageFilter === "pending" ? "all" : "pending")}
              className={`card-figma p-4 cursor-pointer transition-all border-l-4 border-l-blue-500 hover:shadow-md ${
                triageFilter === "pending" ? "ring-2 ring-blue-500/40 bg-blue-50/20" : ""
              } ${pendingOrders.length > 0 ? "ring-1 ring-blue-400/30" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    {pendingOrders.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
                    <Package className="w-3.5 h-3.5" />
                    <span>Nouvelles Reçues</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {pendingOrders.length}
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                  pendingOrders.length > 0 ? "bg-blue-600 text-white shadow-xs" : "bg-blue-100 text-blue-800"
                }`}>
                  {fmt(totalPendingAmount)} F
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 mt-2">
                Commandes passées sur le site en attente de confirmation.
              </p>
            </div>

            {/* Carte Validées */}
            <div 
              onClick={() => setTriageFilter(triageFilter === "confirmed" ? "all" : "confirmed")}
              className={`card-figma p-4 cursor-pointer transition-all border-l-4 border-l-emerald-500 hover:shadow-md ${
                triageFilter === "confirmed" ? "ring-2 ring-emerald-500/40 bg-emerald-50/20" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Commandes Validées</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {confirmedOrders.length}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  {fmt(totalConfirmedAmount)} F
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 mt-2">
                Clients confirmés, prêts pour remise aux livreurs.
              </p>
            </div>

            {/* Carte Réservations */}
            <div 
              onClick={() => setTriageFilter(triageFilter === "reserved" ? "all" : "reserved")}
              className={`card-figma p-4 cursor-pointer transition-all border-l-4 border-l-amber-500 hover:shadow-md ${
                triageFilter === "reserved" ? "ring-2 ring-amber-500/40 bg-amber-50/20" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Réservations en cours</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {reservedOrders.length}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-800">
                  {fmt(totalReservedAmount)} F
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 mt-2">
                Colis mis de côté pour la paie ou une date ultérieure.
              </p>
            </div>

            {/* Carte Mises à plus tard */}
            <div 
              onClick={() => setTriageFilter(triageFilter === "postponed" ? "all" : "postponed")}
              className={`card-figma p-4 cursor-pointer transition-all border-l-4 border-l-purple-500 hover:shadow-md ${
                triageFilter === "postponed" ? "ring-2 ring-purple-500/40 bg-purple-50/20" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>Mises à plus tard / Reportées</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {postponedOrders.length}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-purple-100 text-purple-800">
                  {fmt(totalPostponedAmount)} F
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 mt-2">
                Clients ayant demandé un rappel ou actuellement injoignables.
              </p>
            </div>

          </div>

          {/* SÉLECTEUR D'AFFICHAGE RAPIDE DES SECTIONS DU TABLEAU À PART */}
          <div className="card-figma p-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Affichage des sections :</span>
              </span>
              <div className="flex p-0.5 bg-slate-200/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTriageFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    triageFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Toutes ({totalTriageCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTriageFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    triageFilter === "pending" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-blue-700"
                  }`}
                >
                  🚨 Nouvelles ({pendingOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTriageFilter("confirmed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    triageFilter === "confirmed" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-emerald-700"
                  }`}
                >
                  1. Validées ({confirmedOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTriageFilter("reserved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    triageFilter === "reserved" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-amber-700"
                  }`}
                >
                  2. Réservations ({reservedOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTriageFilter("postponed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    triageFilter === "postponed" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-purple-700"
                  }`}
                >
                  3. Plus tard ({postponedOrders.length})
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Chaque section dispose ci-dessous de ses propres filtres autonomes (recherche, ville, date, produit).
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SECTION 0 DU TABLEAU : LES NOUVELLES COMMANDES DU SITE (À CONFIRMER)
             ═══════════════════════════════════════════════════════════ */}
          {(triageFilter === "all" || triageFilter === "pending") && pendingOrders.length > 0 && (
            <div className="card-figma overflow-hidden border-blue-300 shadow-sm ring-1 ring-blue-400/20">
              
              {/* En-tête de la section À Confirmer */}
              <div className="bg-blue-50/90 px-5 py-3.5 border-b border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm text-blue-950 flex items-center gap-2">
                      <span>Section 0 • Nouvelles Commandes Reçues (À Traiter)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-200 text-blue-900 font-bold animate-pulse">
                        Action requise
                      </span>
                    </h2>
                    <p className="text-[11px] text-blue-800">
                      Commandes passées sur le site en attente de confirmation client avant expédition.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-mono font-bold bg-white text-blue-900 px-3 py-1 rounded-lg border border-blue-200 shadow-xs">
                    {filteredPendingOrders.length} affichée{filteredPendingOrders.length > 1 ? "s" : ""} / {pendingOrders.length} • {fmt(filteredPendingOrders.reduce((a, o) => a + (o.total_amount || 0), 0))} F
                  </span>
                </div>
              </div>

              {/* BARRE DE FILTRES DÉDIÉE À LA SECTION NOUVELLES COMMANDES */}
              <div className="bg-blue-50/30 px-4 py-2.5 border-b border-blue-100 flex flex-wrap items-center gap-2 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={pendingFilters.search}
                    onChange={(e) => setPendingFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Filtrer les nouvelles commandes (nom, tél, N° commande, adresse)..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filtre par Ville */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Ville :</span>
                  <select
                    value={pendingFilters.city}
                    onChange={(e) => setPendingFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">Toutes les villes</option>
                    {cityOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Filtre par Produit */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Produit :</span>
                  <select
                    value={pendingFilters.product}
                    onChange={(e) => setPendingFilters(prev => ({ ...prev, product: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer max-w-[180px] truncate"
                  >
                    <option value="all">Tous les produits</option>
                    {productOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Réinitialiser si filtre actif */}
                {(pendingFilters.search || pendingFilters.city !== "all" || pendingFilters.product !== "all") && (
                  <button
                    type="button"
                    onClick={() => setPendingFilters({ search: "", city: "all", product: "all" })}
                    className="px-2 py-1 rounded-md bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Effacer les filtres de cette section"
                  >
                    <X className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {/* Tableau de la section Nouvelles Commandes */}
              {renderOrderTable(filteredPendingOrders, "global")}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SECTION 1 DU TABLEAU : LES COMMANDES VALIDÉES
             ═══════════════════════════════════════════════════════════ */}
          {(triageFilter === "all" || triageFilter === "confirmed") && (
            <div className="card-figma overflow-hidden border-emerald-200/80 shadow-xs">
              
              {/* En-tête de la section Validées */}
              <div className="bg-emerald-50/90 px-5 py-3.5 border-b border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm text-emerald-950 flex items-center gap-2">
                      <span>Section 1 • Commandes Validées</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 font-bold">
                        Prêtes pour livraison
                      </span>
                    </h2>
                    <p className="text-[11px] text-emerald-800">
                      Clients confirmés à confier aux livreurs pour distribution immédiate.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-mono font-bold bg-white text-emerald-900 px-3 py-1 rounded-lg border border-emerald-200/80 shadow-xs">
                    {filteredConfirmedOrders.length} affichée{filteredConfirmedOrders.length > 1 ? "s" : ""} / {confirmedOrders.length} • {fmt(filteredConfirmedOrders.reduce((a, o) => a + (o.total_amount || 0), 0))} F
                  </span>
                </div>
              </div>

              {/* BARRE DE FILTRES DÉDIÉE À LA SECTION VALIDÉES */}
              <div className="bg-emerald-50/30 px-4 py-2.5 border-b border-emerald-100 flex flex-wrap items-center gap-2 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={confirmedFilters.search}
                    onChange={(e) => setConfirmedFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Filtrer les validées (nom, tél, N° commande, adresse)..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filtre par Ville pour répartition livreurs */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Ville :</span>
                  <select
                    value={confirmedFilters.city}
                    onChange={(e) => setConfirmedFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="all">Toutes les villes</option>
                    {cityOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Filtre par Produit */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Produit :</span>
                  <select
                    value={confirmedFilters.product}
                    onChange={(e) => setConfirmedFilters(prev => ({ ...prev, product: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[180px] truncate"
                  >
                    <option value="all">Tous les produits</option>
                    {productOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Réinitialiser si filtre actif */}
                {(confirmedFilters.search || confirmedFilters.city !== "all" || confirmedFilters.product !== "all") && (
                  <button
                    type="button"
                    onClick={() => setConfirmedFilters({ search: "", city: "all", product: "all" })}
                    className="px-2 py-1 rounded-md bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Effacer les filtres de cette section"
                  >
                    <X className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {/* Tableau de la section Validées */}
              {renderOrderTable(filteredConfirmedOrders, "confirmed")}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SECTION 2 DU TABLEAU : LES RÉSERVATIONS
             ═══════════════════════════════════════════════════════════ */}
          {(triageFilter === "all" || triageFilter === "reserved") && (
            <div className="card-figma overflow-hidden border-amber-200/80 shadow-xs">
              
              {/* En-tête de la section Réservations */}
              <div className="bg-amber-50/90 px-5 py-3.5 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm text-amber-950 flex items-center gap-2">
                      <span>Section 2 • Réservations & Précommandes</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold">
                        Stock bloqué
                      </span>
                    </h2>
                    <p className="text-[11px] text-amber-800">
                      Exemplaires réservés pour une date précise (paie de fin de mois, voyage, etc.).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-mono font-bold bg-white text-amber-900 px-3 py-1 rounded-lg border border-amber-200/80 shadow-xs">
                    {filteredReservedOrders.length} affichée{filteredReservedOrders.length > 1 ? "s" : ""} / {reservedOrders.length} • {fmt(filteredReservedOrders.reduce((a, o) => a + (o.total_amount || 0), 0))} F
                  </span>
                </div>
              </div>

              {/* BARRE DE FILTRES DÉDIÉE À LA SECTION RÉSERVATIONS */}
              <div className="bg-amber-50/30 px-4 py-2.5 border-b border-amber-100 flex flex-wrap items-center gap-2 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={reservedFilters.search}
                    onChange={(e) => setReservedFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Filtrer les réservations (nom, tél, note, date convenue)..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Filtre spécial Échéance / Paie */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                    <CalendarClock className="w-3 h-3 text-amber-600" />
                    <span>Échéance :</span>
                  </span>
                  <select
                    value={reservedFilters.period}
                    onChange={(e) => setReservedFilters(prev => ({ ...prev, period: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-white text-amber-900 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">Toutes les échéances</option>
                    <option value="payday">💰 Paie / Fin de mois (25 - 31)</option>
                    <option value="has_date">📅 Date convenue fixée</option>
                    <option value="no_date">❓ Date non précisée (à caler)</option>
                  </select>
                </div>

                {/* Filtre par Ville */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Ville :</span>
                  <select
                    value={reservedFilters.city}
                    onChange={(e) => setReservedFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">Toutes les villes</option>
                    {cityOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Filtre par Produit */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Produit :</span>
                  <select
                    value={reservedFilters.product}
                    onChange={(e) => setReservedFilters(prev => ({ ...prev, product: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-amber-500 cursor-pointer max-w-[180px] truncate"
                  >
                    <option value="all">Tous les produits</option>
                    {productOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Réinitialiser si filtre actif */}
                {(reservedFilters.search || reservedFilters.period !== "all" || reservedFilters.city !== "all" || reservedFilters.product !== "all") && (
                  <button
                    type="button"
                    onClick={() => setReservedFilters({ search: "", city: "all", product: "all", period: "all" })}
                    className="px-2 py-1 rounded-md bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Effacer les filtres de cette section"
                  >
                    <X className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {/* Tableau de la section Réservations */}
              {renderOrderTable(filteredReservedOrders, "reserved")}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SECTION 3 DU TABLEAU : LES MISES À PLUS TARD
             ═══════════════════════════════════════════════════════════ */}
          {(triageFilter === "all" || triageFilter === "postponed") && (
            <div className="card-figma overflow-hidden border-purple-200/80 shadow-xs">
              
              {/* En-tête de la section Mises à plus tard */}
              <div className="bg-purple-50/90 px-5 py-3.5 border-b border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <CalendarClock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm text-purple-950 flex items-center gap-2">
                      <span>Section 3 • Mises à plus tard</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-900 font-bold">
                        Clients à relancer
                      </span>
                    </h2>
                    <p className="text-[11px] text-purple-800">
                      Clients ayant demandé un rappel ou injoignables lors du premier appel.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-mono font-bold bg-white text-purple-900 px-3 py-1 rounded-lg border border-purple-200/80 shadow-xs">
                    {filteredPostponedOrders.length} affichée{filteredPostponedOrders.length > 1 ? "s" : ""} / {postponedOrders.length} • {fmt(filteredPostponedOrders.reduce((a, o) => a + (o.total_amount || 0), 0))} F
                  </span>
                </div>
              </div>

              {/* BARRE DE FILTRES DÉDIÉE À LA SECTION MISES À PLUS TARD */}
              <div className="bg-purple-50/30 px-4 py-2.5 border-b border-purple-100 flex flex-wrap items-center gap-2 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={postponedFilters.search}
                    onChange={(e) => setPostponedFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Filtrer les reports (nom, tél, motif, date)..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Filtre par Ville */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Ville :</span>
                  <select
                    value={postponedFilters.city}
                    onChange={(e) => setPostponedFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="all">Toutes les villes</option>
                    {cityOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Filtre par Produit */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Produit :</span>
                  <select
                    value={postponedFilters.product}
                    onChange={(e) => setPostponedFilters(prev => ({ ...prev, product: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-purple-500 cursor-pointer max-w-[180px] truncate"
                  >
                    <option value="all">Tous les produits</option>
                    {productOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Réinitialiser si filtre actif */}
                {(postponedFilters.search || postponedFilters.city !== "all" || postponedFilters.product !== "all") && (
                  <button
                    type="button"
                    onClick={() => setPostponedFilters({ search: "", city: "all", product: "all" })}
                    className="px-2 py-1 rounded-md bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Effacer les filtres de cette section"
                  >
                    <X className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {/* Tableau de la section Mises à plus tard */}
              {renderOrderTable(filteredPostponedOrders, "postponed")}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VUE 2 : LE FLUX LOGISTIQUE GLOBAL (Toutes les commandes)
         ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === "logistics" && (
        <div className="space-y-6">
          
          {/* BARRE DE RECHERCHE ET ONGLETS */}
          <div className="card-figma p-4 sm:p-5 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, téléphone, ville ou N°..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 outline-none"
              />
            </div>

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

          {/* TABLEAU GLOBAL */}
          <div className="card-figma overflow-hidden">
            {renderOrderTable(filteredOrders, "global")}
          </div>

        </div>
      )}

      {/* ── MODALE POUR NOTER LA DATE DE RÉSERVATION OU MOTIF DE REPORT ── */}
      {editingNoteOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">Détails de la Réservation / Report</h3>
                  <p className="text-[11px] text-slate-400">Commande {editingNoteOrder.order_number} ({editingNoteOrder.customer_name})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoteOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Date ou Période de livraison convenue :
                </label>
                <input
                  type="text"
                  value={noteForm.reservation_date}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, reservation_date: e.target.value }))}
                  placeholder="Ex: Paie du 28, Samedi prochain, le 5 octobre..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Note interne / Consignes pour le livreur :
                </label>
                <textarea
                  rows={3}
                  value={noteForm.notes}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ex: Client en voyage, rappeler la veille au soir. Préfère livraison au bureau."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNoteOrder(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs active:scale-[0.97] transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALE DE SAISIE COMMANDE DIRECTE WHATSAPP ── */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">Ajouter une Commande</h3>
                  <p className="text-[11px] text-slate-400">Pour les clients qui commandent par WhatsApp ou appel</p>
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
              
              {/* Statut initial de la commande */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Type de commande :
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setManualForm(prev => ({ ...prev, status: "confirmed" }))}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      manualForm.status === "confirmed" 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ✅ Validée
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualForm(prev => ({ ...prev, status: "reserved" }))}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      manualForm.status === "reserved" 
                        ? "bg-amber-500 text-white border-amber-500 shadow-xs" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    📅 Réservation
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualForm(prev => ({ ...prev, status: "postponed" }))}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      manualForm.status === "postponed" 
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ⏳ Plus tard
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nom du Client <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Koffi Mensah"
                  value={manualForm.customer_name}
                  onChange={(e) => setManualForm({ ...manualForm, customer_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Numéro de Téléphone (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 0197000000"
                  value={manualForm.customer_phone}
                  onChange={(e) => setManualForm({ ...manualForm, customer_phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ville</label>
                  <select
                    value={manualForm.city}
                    onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-slate-900 outline-none"
                  >
                    <option value="Cotonou">Cotonou</option>
                    <option value="Calavi">Calavi</option>
                    <option value="Porto-Novo">Porto-Novo</option>
                    <option value="Parakou">Parakou</option>
                    <option value="Autre ville">Autre ville</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quartier / Repère</label>
                  <input
                    type="text"
                    placeholder="Ex: Akpakpa, pharmacie"
                    value={manualForm.address}
                    onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Si réservation ou report : champ date */}
              {(manualForm.status === "reserved" || manualForm.status === "postponed") && (
                <div>
                  <label className="font-bold text-amber-800 block mb-1">
                    Date prévue / Note de rappel :
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Paie du 28, Rappeler samedi 10h..."
                    value={manualForm.reservation_date}
                    onChange={(e) => setManualForm({ ...manualForm, reservation_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/30 text-xs focus:border-amber-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Produit</label>
                <select
                  value={manualForm.product_slug}
                  onChange={(e) => {
                    const slug = e.target.value;
                    const item = DEFAULT_CATALOG.find(p => p.slug === slug) || DEFAULT_CATALOG[0];
                    setManualForm({
                      ...manualForm,
                      product_slug: slug,
                      product_title: item.title,
                      total_amount: item.price,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-slate-900 outline-none"
                >
                  {DEFAULT_CATALOG.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.shortTitle || item.title} ({new Intl.NumberFormat("fr-FR").format(item.price)} F)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Montant Total (FCFA)</label>
                <input
                  type="number"
                  value={manualForm.total_amount}
                  onChange={(e) => setManualForm({ ...manualForm, total_amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {manualLoading ? "Enregistrement en cours..." : "Valider et Ajouter au Tableau"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTION DE RENDU D'UN TABLEAU DE COMMANDES (Réutilisable & Modulaire)
  // ═══════════════════════════════════════════════════════════════════════════
  function renderOrderTable(orderList: OrderItem[], context: "confirmed" | "reserved" | "postponed" | "global") {
    if (loading) {
      return (
        <div className="p-8 text-center text-slate-400 animate-pulse text-xs">
          Chargement des commandes en temps réel...
        </div>
      );
    }

    if (orderList.length === 0) {
      return (
        <div className="py-12 text-center text-slate-400 font-medium text-xs bg-white">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <span>Aucune commande dans cette section pour le moment.</span>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              <th className="py-3 px-4">Réf.</th>
              <th className="py-3 px-4">Client & WhatsApp</th>
              <th className="py-3 px-4">Destination & Quartier</th>
              <th className="py-3 px-4">Produit</th>
              <th className="py-3 px-4 text-right">Montant</th>
              <th className="py-3 px-4">Date / Note</th>
              <th className="py-3 px-4 text-center">Triage & Statut</th>
              <th className="py-3 px-4 text-center">Actions Rapides</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {orderList.map((order, idx) => {
              const phoneClean = (order.customer_phone || "").replace(/\s+/g, "");
              const phoneDigits = phoneClean.replace(/[^0-9]/g, "");
              const hasReservationDate = !!(order.reservation_date || order.notes);

              // Messages WhatsApp contextualisés
              const whatsappReservationMsg = encodeURIComponent(
                `Bonjour ${order.customer_name || ""}, c'est Isivente au sujet de votre réservation du ${order.product_title || "produit"} (Réf: ${order.order_number || ""}).\n\nVotre colis a bien été mis de côté. Nous souhaitions faire le point avec vous pour caler la livraison (${order.reservation_date || "date à convenir"}). Êtes-vous disponible ?`
              );

              const whatsappRelanceMsg = encodeURIComponent(
                `Bonjour ${order.customer_name || ""}, c'est Isivente. Vous nous aviez demandé de vous recontacter un peu plus tard pour votre commande ${order.order_number || ""} (${order.product_title || ""}).\n\nNous préparons les tournées de nos livreurs : quel jour vous arrangerait cette semaine ?`
              );

              const whatsappDeliveryMsg = encodeURIComponent(
                `Bonjour ${order.customer_name || ""}, c'est Isivente. Votre commande ${order.order_number || ""} (${order.product_title || ""}) est validée et prête pour livraison à ${order.shipping_city || order.city || "Cotonou"}. Le livreur peut-il passer aujourd'hui ?`
              );

              return (
                <tr 
                  key={order.id || `ord_${idx}`} 
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* 1. N° COMMANDE */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {order.order_number || `CMD-${idx + 101}`}
                  </td>

                  {/* 2. CLIENT & TÉLÉPHONE */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{order.customer_name || "Client"}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] text-slate-500 font-medium">{order.customer_phone || "-"}</span>
                      {phoneDigits && (
                        <a
                          href={`https://wa.me/229${phoneDigits}?text=${
                            order.status === "reserved" ? whatsappReservationMsg :
                            order.status === "postponed" ? whatsappRelanceMsg :
                            whatsappDeliveryMsg
                          }`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200/60 inline-flex items-center gap-0.5"
                          title="Ouvrir la conversation WhatsApp avec message pré-rempli"
                        >
                          <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* 3. VILLE & QUARTIER */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{order.shipping_city || order.city || "Cotonou"}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5 max-w-[200px] truncate" title={order.shipping_address || order.address}>
                      {order.shipping_address || order.address || "-"}
                    </div>
                  </td>

                  {/* 4. PRODUIT */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="max-w-[190px] truncate" title={order.product_title}>{order.product_title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {(order.bundle_name || "1 Exemplaire").split("[OFFRE VIP]")[0].trim()} (x{order.quantity || 1})
                    </span>
                  </td>

                  {/* 5. MONTANT TOTAL */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="font-bold font-mono text-slate-900 tabular-nums">
                      {fmt(order.total_amount || 0)} FCFA
                    </span>
                  </td>

                  {/* 6. DATE / NOTE DE RÉSERVATION */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {order.reservation_date ? (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                        <CalendarClock className="w-3 h-3 text-amber-600" />
                        <span>{order.reservation_date}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(order.created_at || Date.now()).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                    {order.notes && (
                      <div className="text-[10.5px] text-slate-500 italic max-w-[150px] truncate mt-0.5" title={order.notes}>
                        📝 {order.notes}
                      </div>
                    )}
                  </td>

                  {/* 7. STATUT ACTUEL AVEC SÉLECTEUR */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <select
                      value={order.status || "pending"}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer transition-all ${
                        order.status === "confirmed" ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                        order.status === "reserved" ? "bg-amber-50 text-amber-800 border-amber-300" :
                        order.status === "postponed" ? "bg-purple-50 text-purple-800 border-purple-300" :
                        order.status === "shipped" ? "bg-sky-50 text-sky-800 border-sky-300" :
                        order.status === "delivered" ? "bg-emerald-100 text-emerald-900 border-emerald-400" :
                        order.status === "cancelled" ? "bg-rose-50 text-rose-800 border-rose-300" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <option value="confirmed">✅ Validée</option>
                      <option value="reserved">📅 Réservation</option>
                      <option value="postponed">⏳ Mis à plus tard</option>
                      <option value="pending">📦 À confirmer</option>
                      <option value="shipped">🚚 En cours livreur</option>
                      <option value="delivered">🎉 Livrée</option>
                      <option value="cancelled">❌ Annulée</option>
                    </select>
                  </td>

                  {/* 8. ACTIONS RAPIDES 1-CLIC */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      
                      {/* Si pas encore validée : bouton Valider 1-clic */}
                      {order.status !== "confirmed" && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(order.id, "confirmed")}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10.5px] font-bold inline-flex items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                          title="Marquer comme commande validée et prête pour livraison"
                        >
                          <Check className="w-3 h-3" />
                          <span>Valider</span>
                        </button>
                      )}

                      {/* Si pas réservée : bouton Réserver 1-clic */}
                      {order.status !== "reserved" && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteOrder(order);
                            setNoteForm({
                              reservation_date: order.reservation_date || "",
                              notes: order.notes || ""
                            });
                          }}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10.5px] font-bold inline-flex items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                          title="Mettre en réservation pour plus tard"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Réserver</span>
                        </button>
                      )}

                      {/* Si pas reportée : bouton Plus tard 1-clic */}
                      {order.status !== "postponed" && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(order.id, "postponed")}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[10.5px] font-bold inline-flex items-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                          title="Déplacer dans les reports / rappels plus tard"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Plus tard</span>
                        </button>
                      )}

                      {/* Si réservée : bouton éditer la note */}
                      {order.status === "reserved" && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteOrder(order);
                            setNoteForm({
                              reservation_date: order.reservation_date || "",
                              notes: order.notes || ""
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50"
                          title="Modifier la date ou note de réservation"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Suppression */}
                      <button
                        type="button"
                        onClick={() => handleDelete(order)}
                        disabled={deletingId === (order.id || String(order.order_number))}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 ml-1"
                        title="Supprimer la commande"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
