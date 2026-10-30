"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getAllOrders,
  getLocalOrders,
  updateOrderStatus,
  OrderItem,
} from "@/lib/ordersStorage";
import {
  getAllLeads,
  getLocalLeads,
  updateLeadStatus,
  LeadRecord,
} from "@/lib/leadsStorage";
import {
  getAnalyticsStats,
  getAllProductsAnalytics,
  AnalyticsStats,
  ProductAnalyticsStats,
} from "@/lib/analyticsStorage";
import { supabase } from "@/lib/supabase";
import { formatBeninPhoneForWhatsApp } from "@/lib/phoneUtils";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  MousePointerClick,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Store,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  Clock,
} from "lucide-react";
import { getAdminDashboardProducts } from "@/lib/defaultCatalog";

type PeriodFilter = "today" | "7d" | "all";
type OrderQuickFilter = "all" | "pending" | "confirmed";

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats>({
    totalViews: 0,
    todayViews: 0,
    totalClicks: 0,
    todayClicks: 0,
    ctr: 0,
    avgTimeSpentSeconds: 0,
    formattedAvgTime: "—",
  });
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalyticsStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [orderTab, setOrderTab] = useState<OrderQuickFilter>("all");

  const productsList = useMemo(() => getAdminDashboardProducts(), []);

  const handleCopyLink = (slug: string, withUtm = false) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://isivente.vercel.app";
    const url = withUtm
      ? `${origin}/p/${slug}?utm_source=meta&utm_medium=cpc&utm_campaign=${slug}_ads`
      : `${origin}/p/${slug}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedSlug(withUtm ? `${slug}_utm` : slug);
      setTimeout(() => setCopiedSlug(null), 2200);
    }
  };

  const loadAllData = async (silent = false) => {
    if (!silent && orders.length === 0) setLoading(true);
    try {
      const [ordersData, leadsData, analyticsData, prodsAnalyticsData] =
        await Promise.all([
          getAllOrders(),
          getAllLeads(),
          getAnalyticsStats(),
          getAllProductsAnalytics(),
        ]);
      setOrders(ordersData);
      setLeads(leadsData);
      setAnalytics(analyticsData);
      setProductAnalytics(prodsAnalyticsData);
    } catch (err) {
      console.error("Erreur lors du chargement de la vue d'ensemble :", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const localO = getLocalOrders();
    const localL = getLocalLeads();
    if (localO.length > 0) setOrders(localO);
    if (localL.length > 0) setLeads(localL);
    if (localO.length > 0 || localL.length > 0) setLoading(false);

    loadAllData(localO.length > 0);

    const interval = setInterval(() => {
      loadAllData(true);
    }, 30000);

    const channel = supabase
      .channel("overview-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadAllData(true)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => loadAllData(true)
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

  const formatRelativeTime = (iso?: string) => {
    if (!iso) return "";
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  // Filtrage temporel
  const isWithinPeriod = (isoDate?: string) => {
    if (period === "all" || !isoDate) return true;
    const d = new Date(isoDate);
    const now = new Date();
    if (period === "today") {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }
    if (period === "7d") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return d.getTime() >= sevenDaysAgo;
    }
    return true;
  };

  const filteredOrders = useMemo(
    () => orders.filter((o) => isWithinPeriod(o.created_at)),
    [orders, period]
  );

  const filteredLeads = useMemo(
    () => leads.filter((l) => isWithinPeriod(l.created_at)),
    [leads, period]
  );

  // Calcul des métriques
  const metrics = useMemo(() => {
    const confirmedStatuses = new Set([
      "confirmed",
      "shipped",
      "delivered",
      "paid",
    ]);

    const confirmedOrders = filteredOrders.filter((o) =>
      confirmedStatuses.has(o.status || "")
    );
    const confirmedRevenue = confirmedOrders.reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0
    );

    // Les commandes "À confirmer" restent globales pour ne jamais rater une urgence
    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || !o.status
    );
    const pendingRevenue = pendingOrders.reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0
    );

    const abandonedLeads = filteredLeads.filter(
      (l) => l.status === "abandoned" || !l.status
    );
    const recoverableRevenue = abandonedLeads.reduce(
      (sum, l) => sum + (l.total_amount || 0),
      0
    );

    const conversionRate =
      filteredOrders.length > 0
        ? (confirmedOrders.length / filteredOrders.length) * 100
        : 0;

    return {
      confirmedRevenue,
      confirmedOrdersCount: confirmedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      pendingRevenue,
      recoverableRevenue,
      abandonedLeadsCount: abandonedLeads.length,
      conversionRate,
    };
  }, [filteredOrders, filteredLeads, orders]);

  // Validation 1-clic d'une commande depuis la vue d'ensemble
  const handleQuickConfirmOrder = async (order: OrderItem) => {
    const targetId = order.id || order.order_number;
    if (!targetId) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === targetId || o.order_number === targetId
          ? { ...o, status: "confirmed" }
          : o
      )
    );
    await updateOrderStatus(String(targetId), "confirmed");
  };

  // Message WhatsApp de confirmation commande
  const getOrderWhatsAppUrl = (order: OrderItem) => {
    const intlPhone = formatBeninPhoneForWhatsApp(order.customer_phone);
    const name = order.customer_name || "Client";
    const product = order.product_title || order.product_slug || "votre article";
    const total = fmt(order.total_amount || 0);
    const city = order.shipping_city || order.city || "Cotonou";
    const msg =
      `Bonjour ${name}, c'est le service client Isivente.\n\n` +
      `Nous avons bien reçu votre commande pour : *${product}* (${total} FCFA) vers *${city}*.\n\n` +
      `Pouvez-vous nous confirmer votre disponibilité aujourd'hui pour la livraison ?`;
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Relance WhatsApp 1-clic pour un prospect
  const handleWhatsAppRelance = async (lead: LeadRecord) => {
    await updateLeadStatus(lead.id, "contacted");
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: "contacted" } : l))
    );

    const intlPhone = formatBeninPhoneForWhatsApp(lead.customer_phone);
    const clientName =
      lead.customer_name && lead.customer_name !== "Client intéressé"
        ? ` ${lead.customer_name}`
        : "";

    const message =
      `Bonjour${clientName}, c'est le service client Isivente.\n\n` +
      `J'ai vu que vous aviez commencé à commander notre *${lead.product_title}* (${fmt(lead.total_amount)} FCFA) sur notre site.\n\n` +
      `Avez-vous rencontré un problème lors de votre commande ?\n` +
      `Si vous le souhaitez, je peux directement valider votre livraison à *${lead.city || "Cotonou"}* avec *paiement en espèces à la livraison*.`;

    const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Validée
          </span>
        );
      case "shipped":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            En livraison
          </span>
        );
      case "delivered":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            Livrée
          </span>
        );
      case "reserved":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            Réservation
          </span>
        );
      case "postponed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            Reportée
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
            Annulée
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
            À confirmer
          </span>
        );
    }
  };

  // Commandes affichées dans le flux opérationnel
  const displayedOrders = useMemo(() => {
    const confirmedStatuses = new Set([
      "confirmed",
      "shipped",
      "delivered",
      "paid",
    ]);
    return orders
      .filter((o) => {
        if (orderTab === "pending") return !o.status || o.status === "pending";
        if (orderTab === "confirmed") return confirmedStatuses.has(o.status || "");
        return true;
      })
      .slice(0, 7);
  }, [orders, orderTab]);

  // Top 5 produits (triés par commandes puis par visites)
  const top5Products = useMemo(() => {
    const analyticsMap: Record<string, ProductAnalyticsStats> = {};
    productAnalytics.forEach((p) => {
      analyticsMap[p.slug] = p;
    });

    const ordersBySlug: Record<string, { count: number; revenue: number }> = {};
    const confirmedStatuses = new Set([
      "confirmed",
      "shipped",
      "delivered",
      "paid",
    ]);
    orders.forEach((o) => {
      const slug = o.product_slug || "umei";
      if (!ordersBySlug[slug]) ordersBySlug[slug] = { count: 0, revenue: 0 };
      ordersBySlug[slug].count += 1;
      if (confirmedStatuses.has(o.status || "")) {
        ordersBySlug[slug].revenue += o.total_amount || 0;
      }
    });

    return productsList
      .map((prod) => {
        const stat = analyticsMap[prod.slug];
        const ord = ordersBySlug[prod.slug] || { count: 0, revenue: 0 };
        const views = stat?.totalViews ?? 0;
        const todayViews = stat?.todayViews ?? 0;
        const clicks = stat?.totalClicks ?? 0;
        return {
          ...prod,
          views,
          todayViews,
          clicks,
          ordersCount: ord.count,
          revenue: ord.revenue,
          convRate: views > 0 ? ((ord.count / views) * 100).toFixed(1) : "0.0",
        };
      })
      .sort((a, b) => {
        if (b.ordersCount !== a.ordersCount) return b.ordersCount - a.ordersCount;
        if (b.todayViews !== a.todayViews) return b.todayViews - a.todayViews;
        return b.views - a.views;
      })
      .slice(0, 5);
  }, [productsList, productAnalytics, orders]);

  const urgentLeads = useMemo(
    () =>
      leads
        .filter((l) => l.status === "abandoned" || !l.status)
        .slice(0, 5),
    [leads]
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10 animate-[staggerFadeUp_220ms_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* ── 1. HEADER COMPACT & FILTRE TEMPOREL ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 card-figma px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <LayoutDashboard className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                Cockpit Isivente
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En direct
              </span>
            </div>
            <p className="text-slate-500 text-xs">
              Synthèse financière et actions prioritaires du jour
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Sélecteur de période */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            {(
              [
                { id: "today", label: "Aujourd'hui" },
                { id: "7d", label: "7 jours" },
                { id: "all", label: "Tout" },
              ] as { id: PeriodFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPeriod(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === tab.id
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsRefreshing(true);
                loadAllData();
              }}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
              title="Actualiser les données"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRefreshing ? "animate-spin text-indigo-600" : "text-slate-500"
                }`}
              />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-2xs"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Commandes</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. LES 4 CARTES KPI EN GRILLE DIRECTE (SANS SCROLL HORIZONTAL) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1 : CA Confirmé */}
        <div className="card-figma p-4 sm:p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              CA Confirmé
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 truncate">
              {loading ? "…" : fmt(metrics.confirmedRevenue)}{" "}
              <span className="text-[11px] font-normal text-slate-400 font-sans">
                FCFA
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Validées :</span>
              <span className="font-bold text-emerald-700 font-mono">
                {metrics.confirmedOrdersCount} cmd ({metrics.conversionRate.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2 : À Confirmer (Urgent) */}
        <Link
          href="/admin/orders"
          className="card-figma p-4 sm:p-5 flex flex-col justify-between border-l-4 border-l-amber-500 hover:border-amber-500 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              {metrics.pendingOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
              <span>À Confirmer</span>
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 truncate">
              {loading ? "…" : metrics.pendingOrdersCount}{" "}
              <span className="text-[11px] font-normal text-slate-400 font-sans">
                en attente
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Potentiel :</span>
              <span className="font-bold text-amber-700 font-mono">
                {fmt(metrics.pendingRevenue)} F
              </span>
            </div>
          </div>
        </Link>

        {/* KPI 3 : Paniers Abandonnés */}
        <Link
          href="/admin/prospects"
          className="card-figma p-4 sm:p-5 flex flex-col justify-between border-l-4 border-l-rose-500 hover:border-rose-500 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Paniers à Relancer
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900 truncate">
              {loading ? "…" : metrics.abandonedLeadsCount}{" "}
              <span className="text-[11px] font-normal text-slate-400 font-sans">
                prospects
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Récupérable :</span>
              <span className="font-bold text-rose-600 font-mono">
                {fmt(metrics.recoverableRevenue)} F
              </span>
            </div>
          </div>
        </Link>

        {/* KPI 4 : Trafic & Clics Live */}
        <Link
          href="/admin/clicks"
          className="card-figma p-4 sm:p-5 flex flex-col justify-between border-l-4 border-l-purple-500 hover:border-purple-500 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Trafic & Clics
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900">
                {loading
                  ? "…"
                  : period === "today"
                  ? analytics.todayViews
                  : analytics.totalViews}
              </span>
              <span className="text-[11px] text-slate-400">visites</span>
              {period !== "today" && analytics.todayViews > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                  +{analytics.todayViews} auj.
                </span>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Clics CTA :</span>
              <span className="font-bold text-purple-700 font-mono">
                {period === "today" ? analytics.todayClicks : analytics.totalClicks} (
                {analytics.ctr.toFixed(1)}%)
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── 3. CŒUR OPÉRATIONNEL : COMMANDES À TRAITER (GAUCHE) & RELANCES WHATSAPP (DROITE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLONNE GAUCHE (7/12) : DERNIÈRES COMMANDES & VALIDATION 1-CLIC */}
        <div className="lg:col-span-7 card-figma p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Dernières Commandes
              </h2>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              {/* Filtre rapide interne */}
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 text-[11px]">
                <button
                  type="button"
                  onClick={() => setOrderTab("all")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    orderTab === "all"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Toutes
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTab("pending")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    orderTab === "pending"
                      ? "bg-white text-amber-800 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>À confirmer</span>
                  {metrics.pendingOrdersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                      {metrics.pendingOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTab("confirmed")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    orderTab === "confirmed"
                      ? "bg-white text-emerald-800 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Validées
                </button>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5 shrink-0"
              >
                <span>Tout voir</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Chargement des commandes…
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Aucune commande dans cette catégorie.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayedOrders.map((order) => {
                const isPending = !order.status || order.status === "pending";
                return (
                  <div
                    key={order.id || String(order.order_number)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {order.customer_name || "Client"}
                        </span>
                        {statusBadge(order.status || "pending")}
                        <span className="text-[11px] text-slate-400 font-medium">
                          • {order.shipping_city || order.city || "Cotonou"}
                        </span>
                        {order.created_at && (
                          <span className="text-[10px] text-slate-400 inline-flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatRelativeTime(order.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-2">
                        <span className="truncate font-medium text-slate-700">
                          {order.product_title || order.product_slug}
                        </span>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-900">
                          {fmt(order.total_amount || 0)} FCFA
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleQuickConfirmOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                          title="Valider immédiatement cette commande"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Valider</span>
                        </button>
                      )}

                      <a
                        href={getOrderWhatsAppUrl(order)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                        title="Contacter le client sur WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLONNE DROITE (5/12) : RELANCES URGENTES WHATSAPP */}
        <div className="lg:col-span-5 card-figma p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Paniers à Relancer
              </h2>
              {urgentLeads.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {metrics.abandonedLeadsCount} en attente
                </span>
              )}
            </div>
            <Link
              href="/admin/prospects"
              className="text-xs font-bold text-rose-600 hover:text-rose-800 inline-flex items-center gap-0.5"
            >
              <span>Tout voir</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {urgentLeads.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Aucun panier abandonné en attente de relance.
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {lead.customer_name || "Client intéressé"}
                      </span>
                      {lead.created_at && (
                        <span className="text-[10px] text-slate-400">
                          • {formatRelativeTime(lead.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lead.product_title} •{" "}
                      <span className="font-mono font-bold text-slate-800">
                        {fmt(lead.total_amount)} F
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppRelance(lead)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <MessageSquare className="w-3 h-3 fill-current" />
                    <span>Relancer</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. TOP 5 PRODUITS ACTIFS (CONDENSÉ & LIENS RAPIDES) ── */}
      <div className="card-figma p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Top 5 Produits Actifs (Trafic & Conversions)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/landings"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-indigo-600" />
              <span>Catalogue ({productsList.length})</span>
            </Link>
            <Link
              href="/admin/clicks"
              className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg border border-purple-200 inline-flex items-center gap-1 transition-colors"
            >
              <span>Tous les KPIs ({productsList.length} pages)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-left text-xs border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2 px-2.5">Produit</th>
                <th className="py-2 px-2.5 text-center">Visites</th>
                <th className="py-2 px-2.5 text-center">Clics CTA</th>
                <th className="py-2 px-2.5 text-center">Commandes</th>
                <th className="py-2 px-2.5 text-center">Taux Conv.</th>
                <th className="py-2 px-2.5 text-right">Lien Rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top5Products.map((prod) => {
                const isCopied = copiedSlug === prod.slug;
                const isCopiedUtm = copiedSlug === `${prod.slug}_utm`;

                return (
                  <tr
                    key={prod.slug}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-[200px]">
                            {prod.title}
                          </div>
                          <div className="text-[10.5px] text-slate-400 font-mono">
                            {fmt(prod.price)} F • /p/{prod.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 text-center font-mono">
                      <span className="font-bold text-slate-900">
                        {prod.views}
                      </span>
                      {prod.todayViews > 0 && (
                        <span className="ml-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                          +{prod.todayViews} auj.
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-2.5 text-center font-mono font-bold text-purple-700">
                      {prod.clicks}
                    </td>

                    <td className="py-2.5 px-2.5 text-center font-mono font-bold text-emerald-700">
                      {prod.ordersCount}
                    </td>

                    <td className="py-2.5 px-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                          Number(prod.convRate) >= 5
                            ? "bg-emerald-100 text-emerald-800"
                            : Number(prod.convRate) > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {prod.convRate}%
                      </span>
                    </td>

                    <td className="py-2.5 px-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(prod.slug, false)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-colors cursor-pointer ${
                            isCopied
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Lien</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(prod.slug, true)}
                          title="Copier le lien avec UTM Meta Ads"
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                            isCopiedUtm
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isCopiedUtm ? "OK" : "UTM"}
                        </button>

                        <Link
                          href={`/p/${prod.slug}`}
                          target="_blank"
                          title="Ouvrir la page"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
