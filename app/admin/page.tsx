"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getAllOrders,
  getLocalOrders,
  OrderItem
} from "@/lib/ordersStorage";
import {
  getAllLeads,
  getLocalLeads,
  updateLeadStatus,
  LeadRecord
} from "@/lib/leadsStorage";
import {
  getAnalyticsStats,
  AnalyticsStats
} from "@/lib/analyticsStorage";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  MousePointerClick,
  Clock,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Sparkles,
  ChevronRight,
  Phone,
  Truck,
  Store,
  ExternalLink
} from "lucide-react";

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<OrderItem[]>(() => getLocalOrders());
  const [leads, setLeads] = useState<LeadRecord[]>(() => getLocalLeads());
  const [analytics, setAnalytics] = useState<AnalyticsStats>({
    totalViews: 0,
    totalClicks: 0,
    ctr: 0,
    avgTimeSpentSeconds: 0,
    formattedAvgTime: "—",
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return getLocalOrders().length === 0;
    }
    return false;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadAllData = async (silent = false) => {
    if (!silent && orders.length === 0) setLoading(true);
    try {
      const [ordersData, leadsData, analyticsData] = await Promise.all([
        getAllOrders(),
        getAllLeads(),
        getAnalyticsStats()
      ]);
      setOrders(ordersData);
      setLeads(leadsData);
      setAnalytics(analyticsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Erreur lors du chargement de la vue d'ensemble :", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const hasLocal = getLocalOrders().length > 0;
    loadAllData(hasLocal);

    // Rafraîchissement automatique toutes les 30s
    const interval = setInterval(() => {
      loadAllData(true);
    }, 30000);

    // Écoute temps réel Supabase
    const channel = supabase
      .channel("overview-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadAllData(true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        loadAllData(true);
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

  // ── Calcul des métriques globales ──
  const metrics = useMemo(() => {
    const confirmedStatuses = new Set(["confirmed", "shipped", "delivered", "paid"]);
    
    // Commandes confirmées / livrées
    const confirmedOrders = orders.filter(o => confirmedStatuses.has(o.status || ""));
    const confirmedRevenue = confirmedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Nouvelles commandes en attente (à traiter)
    const pendingOrders = orders.filter(o => o.status === "pending" || !o.status);
    const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Réservations / Programmées
    const reservedOrders = orders.filter(o => o.status === "reserved" || o.status === "postponed");

    // Paniers abandonnés
    const abandonedLeads = leads.filter(l => l.status === "abandoned" || !l.status);
    const recoverableRevenue = abandonedLeads.reduce((sum, l) => sum + (l.total_amount || 0), 0);

    // CA Global potentiel
    const totalPotentialRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // Taux de validation
    const conversionRate = orders.length > 0 ? (confirmedOrders.length / orders.length) * 100 : 0;

    // Répartition par produit
    const productStats: Record<string, { title: string; count: number; revenue: number }> = {};
    orders.forEach(o => {
      const slug = o.product_slug || "microscope";
      const title = o.product_title || slug;
      if (!productStats[slug]) {
        productStats[slug] = { title, count: 0, revenue: 0 };
      }
      productStats[slug].count++;
      if (confirmedStatuses.has(o.status || "")) {
        productStats[slug].revenue += (o.total_amount || 0);
      }
    });

    const topProducts = Object.values(productStats).sort((a, b) => b.count - a.count);

    return {
      confirmedRevenue,
      confirmedOrdersCount: confirmedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      pendingRevenue,
      reservedOrdersCount: reservedOrders.length,
      recoverableRevenue,
      abandonedLeadsCount: abandonedLeads.length,
      totalOrdersCount: orders.length,
      totalPotentialRevenue,
      conversionRate,
      topProducts
    };
  }, [orders, leads]);

  // Relance WhatsApp 1-clic pour un prospect
  const handleWhatsAppRelance = async (lead: LeadRecord) => {
    await updateLeadStatus(lead.id, "contacted");
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "contacted" } : l));

    const cleanPhone = lead.customer_phone.replace(/\D/g, "");
    const intlPhone = cleanPhone.startsWith("229") ? cleanPhone : `229${cleanPhone}`;
    const clientName = lead.customer_name && lead.customer_name !== "Client intéressé" 
      ? ` ${lead.customer_name}` 
      : "";

    const message = 
      `Bonjour${clientName}, c'est le service client Isivente.\n\n` +
      `J'ai vu que vous aviez commencé à commander notre *${lead.product_title}* (${fmt(lead.total_amount)} FCFA) sur notre site.\n\n` +
      `Avez-vous rencontré un problème lors de votre commande ?\n` +
      `Si vous le souhaitez, je peux directement valider votre livraison à *${lead.city || "Cotonou"}* avec *paiement en espèces à la livraison* (après vérification du produit).`;

    const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800">✅ Validée</span>;
      case "shipped":
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-blue-800">🚚 En livraison</span>;
      case "delivered":
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-100 text-purple-800">🎉 Livrée</span>;
      case "reserved":
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-100 text-indigo-800">📅 Réservation</span>;
      case "postponed":
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800">⏳ Reportée</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600">✕ Annulée</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800">📦 À confirmer</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-[staggerFadeUp_240ms_cubic-bezier(0.16,1,0.3,1)_both]">
      
      {/* ── HEADER DE BIENVENUE & STATUT LIVE ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-figma p-5 sm:p-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-bold">Cockpit En Direct</span>
            <span>•</span>
            <span>Isivente Boutique Bénin</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-indigo-600 stroke-[2.25]" />
            <span>Vue d&apos;ensemble</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Performance commerciale, commandes en temps réel, paniers à relancer et métriques marketing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              loadAllData();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
            <span>Actualiser</span>
          </button>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-[0.98] shadow-sm"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Gérer les commandes</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ── LES 4 CARTES KPI MAÎTRESSES (FIGMA-GRADE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : CA Confirmé */}
        <div className="card-figma p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CA Confirmé & Livré
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
              {loading ? "…" : fmt(metrics.confirmedRevenue)} <span className="text-xs font-normal text-slate-500 font-sans">FCFA</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Commandes validées :</span>
              <span className="font-bold text-emerald-600 font-mono">{metrics.confirmedOrdersCount}</span>
            </div>
          </div>
        </div>

        {/* KPI 2 : Nouvelles Commandes À Confirmer */}
        <div className="card-figma p-5 flex flex-col justify-between border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              {metrics.pendingOrdersCount > 0 && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
              <span>À Confirmer</span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Package className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
              {loading ? "…" : metrics.pendingOrdersCount} <span className="text-xs font-normal text-slate-500 font-sans">commandes</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Montant à valider :</span>
              <span className="font-bold text-blue-700 font-mono">{fmt(metrics.pendingRevenue)} F</span>
            </div>
          </div>
        </div>

        {/* KPI 3 : Paniers Abandonnés (CA Récupérable) */}
        <div className="card-figma p-5 flex flex-col justify-between border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Paniers Abandonnés
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
              {loading ? "…" : fmt(metrics.recoverableRevenue)} <span className="text-xs font-normal text-slate-500 font-sans">FCFA</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Clients à relancer :</span>
              <span className="font-bold text-rose-600 font-mono">{metrics.abandonedLeadsCount} prospects</span>
            </div>
          </div>
        </div>

        {/* KPI 4 : Trafic Ads & Visiteurs */}
        <div className="card-figma p-5 flex flex-col justify-between border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trafic & Attention Ads
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <MousePointerClick className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
              {loading ? "…" : analytics.totalViews} <span className="text-xs font-normal text-slate-500 font-sans">visites</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Clics boutons d&apos;achat :</span>
              <span className="font-bold text-purple-700 font-mono">{analytics.totalClicks} ({analytics.ctr.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── BARRE DE RACCOURCIS RAPIDES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/orders"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              Commandes & Dispatch
            </div>
            <div className="text-[11px] text-slate-400 truncate">{orders.length} commandes au total</div>
          </div>
        </Link>

        <Link
          href="/admin/prospects"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
              Paniers Abandonnés
            </div>
            <div className="text-[11px] text-slate-400 truncate">{metrics.abandonedLeadsCount} à relancer sur WhatsApp</div>
          </div>
        </Link>

        <Link
          href="/admin/clicks"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              Entonnoir & Clics Ads
            </div>
            <div className="text-[11px] text-slate-400 truncate">{analytics.formattedAvgTime} d&apos;attention moyenne</div>
          </div>
        </Link>

        <Link
          href="/admin/tracker"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
              Tracker UTM & ROI
            </div>
            <div className="text-[11px] text-slate-400 truncate">Attribution campagnes & créatifs</div>
          </div>
        </Link>
      </div>

      {/* ── GRILLE PRINCIPALE : DERNIÈRES COMMANDES (60%) vs ACTIONS PRIORITAIRES (40%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLONNE GAUCHE : FLUX DES DERNIÈRES COMMANDES */}
        <div className="lg:col-span-7 card-figma p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-600" />
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Dernières Commandes Passées
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
            >
              <span>Voir tout ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Chargement des commandes…</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Aucune commande enregistrée pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 6).map((order) => {
                const cleanPhone = (order.customer_phone || "").replace(/\D/g, "");
                const intlPhone = cleanPhone.startsWith("229") ? cleanPhone : `229${cleanPhone}`;
                return (
                  <div key={order.id || String(order.order_number)} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {order.customer_name || "Client"}
                        </span>
                        {statusBadge(order.status || "pending")}
                        <span className="text-[11px] text-slate-400 font-mono">
                          {order.shipping_city || order.city || "Cotonou"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-2">
                        <span className="truncate">{order.product_title || order.product_slug}</span>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-900">{fmt(order.total_amount || 0)} F</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/${intlPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors shadow-2xs"
                        title="Ouvrir WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : PANIERS À RELANCER & PERFORMANCE PRODUIT */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* BLOC 1 : PANIERS ABANDONNÉS DU JOUR */}
          <div className="card-figma p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h2 className="font-bold text-sm sm:text-base text-slate-900">
                  Relances Urgentes WhatsApp
                </h2>
              </div>
              <Link
                href="/admin/prospects"
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
              >
                <span>Voir tout ({leads.filter(l => l.status === "abandoned").length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {leads.filter(l => l.status === "abandoned" || !l.status).length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                🎉 Aucun panier abandonné en attente de relance !
              </div>
            ) : (
              <div className="space-y-2.5">
                {leads
                  .filter(l => l.status === "abandoned" || !l.status)
                  .slice(0, 4)
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {lead.customer_name || "Client intéressé"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lead.product_title} • <span className="font-mono font-semibold text-slate-800">{fmt(lead.total_amount)} F</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleWhatsAppRelance(lead)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <MessageSquare className="w-3 h-3 fill-current" />
                        <span>Relancer</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* BLOC 2 : TOP PRODUITS PAR COMMANDES */}
          <div className="card-figma p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-500" />
                <h2 className="font-bold text-sm sm:text-base text-slate-900">
                  Performance par Produit
                </h2>
              </div>
            </div>

            {metrics.topProducts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Aucune donnée produit disponible.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.topProducts.slice(0, 5).map((prod) => {
                  const share = metrics.totalOrdersCount > 0 
                    ? (prod.count / metrics.totalOrdersCount) * 100 
                    : 0;
                  return (
                    <div key={prod.title} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {prod.title}
                        </span>
                        <span className="font-mono text-slate-600 font-bold tabular-nums">
                          {prod.count} cmd • {fmt(prod.revenue)} F
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(share, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
