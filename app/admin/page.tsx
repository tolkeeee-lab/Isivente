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
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { getAdminDashboardProducts } from "@/lib/defaultCatalog";
import { getStoredTenantContext } from "@/lib/storesStorage";

type PeriodFilter = "today" | "7d" | "all";
type OrderQuickFilter = "all" | "pending" | "confirmed";
type WorkspaceTab = "products" | "cashflow";

interface DashboardProductItem {
  slug: string;
  title: string;
  price: number;
  image: string;
}

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
  const [tenantProducts, setTenantProducts] = useState<DashboardProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [orderTab, setOrderTab] = useState<OrderQuickFilter>("all");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("products");

  const tenantCtx = getStoredTenantContext();
  const isFounder = tenantCtx ? tenantCtx.isFounder : false;
  const founderProducts = useMemo<DashboardProductItem[]>(
    () => (isFounder ? getAdminDashboardProducts() : []),
    [isFounder]
  );

  // Produits de la boutique courante (catalogue fondateur ou produits Supabase du vendeur)
  const productsList = useMemo<DashboardProductItem[]>(() => {
    if (isFounder) {
      const seen = new Set(founderProducts.map((p) => p.slug));
      const extras = tenantProducts.filter((p) => !seen.has(p.slug));
      return [...extras, ...founderProducts];
    }
    return tenantProducts;
  }, [isFounder, founderProducts, tenantProducts]);

  // ── Rapprochement Livraisons & CA Réel ──
  const [deliveredOverrides, setDeliveredOverrides] = useState<Record<string, number>>({});
  const [showOnlyWithOrders, setShowOnlyWithOrders] = useState<boolean>(true);

  useEffect(() => {
    if (!isFounder) return;
    try {
      const saved = localStorage.getItem("isivente_delivered_counts");
      if (saved) setDeliveredOverrides(JSON.parse(saved));
    } catch {}
  }, [isFounder]);

  // Charger les produits créés en base pour la boutique active
  useEffect(() => {
    let active = true;
    async function loadStoreProducts() {
      if (!tenantCtx?.storeId) return;
      try {
        const { data } = await supabase
          .from("products")
          .select("slug, title, price, images")
          .eq("store_id", tenantCtx.storeId)
          .order("created_at", { ascending: false });
        if (!active || !data) return;
        setTenantProducts(
          data.map((row) => ({
            slug: row.slug,
            title: row.title,
            price: Number(row.price) || 0,
            image:
              Array.isArray(row.images) && row.images.length > 0
                ? String(row.images[0])
                : "/icon.svg",
          }))
        );
      } catch {}
    }
    loadStoreProducts();
    return () => {
      active = false;
    };
  }, [tenantCtx?.storeId]);

  const handleUpdateDeliveredCount = (slug: string, newCount: number) => {
    const safeCount = Math.max(0, Math.floor(newCount || 0));
    const updated = { ...deliveredOverrides, [slug]: safeCount };
    setDeliveredOverrides(updated);
    if (isFounder) {
      try {
        localStorage.setItem("isivente_delivered_counts", JSON.stringify(updated));
      } catch {}
    }
  };

  const handleResetToAutoDelivered = () => {
    setDeliveredOverrides({});
    if (isFounder) {
      try {
        localStorage.removeItem("isivente_delivered_counts");
      } catch {}
    }
  };

  const realDeliveryReport = useMemo(() => {
    const ordersBySlug: Record<string, { totalOrders: number; autoDelivered: number }> = {};
    orders.forEach((o) => {
      const s = o.product_slug || "autre";
      if (!ordersBySlug[s]) ordersBySlug[s] = { totalOrders: 0, autoDelivered: 0 };
      ordersBySlug[s].totalOrders += 1;
      if (o.status === "delivered") {
        ordersBySlug[s].autoDelivered += 1;
      }
    });

    const rows = productsList.map((p) => {
      const stat = ordersBySlug[p.slug] || { totalOrders: 0, autoDelivered: 0 };
      const isOverridden = deliveredOverrides[p.slug] !== undefined;
      const deliveredCount = isOverridden ? deliveredOverrides[p.slug] : stat.autoDelivered;
      const realRevenue = deliveredCount * p.price;
      const deliveryRate = stat.totalOrders > 0 ? (deliveredCount / stat.totalOrders) * 100 : 0;

      return {
        ...p,
        totalOrders: stat.totalOrders,
        autoDelivered: stat.autoDelivered,
        deliveredCount,
        realRevenue,
        deliveryRate,
        isOverridden,
      };
    });

    const totalDelivered = rows.reduce((sum, r) => sum + r.deliveredCount, 0);
    const totalRealRevenue = rows.reduce((sum, r) => sum + r.realRevenue, 0);
    const totalOrdersCount = rows.reduce((sum, r) => sum + r.totalOrders, 0);
    const globalDeliveryRate = totalOrdersCount > 0 ? (totalDelivered / totalOrdersCount) * 100 : 0;

    const displayedRows = showOnlyWithOrders
      ? rows.filter((r) => r.totalOrders > 0 || r.deliveredCount > 0)
      : rows;

    return {
      rows: displayedRows,
      totalDelivered,
      totalRealRevenue,
      totalOrdersCount,
      globalDeliveryRate,
      hasOverrides: Object.keys(deliveredOverrides).length > 0,
    };
  }, [orders, productsList, deliveredOverrides, showOnlyWithOrders]);

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

    return {
      confirmedRevenue,
      confirmedOrdersCount: confirmedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      pendingRevenue,
      recoverableRevenue,
      abandonedLeadsCount: abandonedLeads.length,
    };
  }, [filteredOrders, filteredLeads, orders]);

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

  const getOrderWhatsAppUrl = (order: OrderItem) => {
    const intlPhone = formatBeninPhoneForWhatsApp(order.customer_phone);
    const name = order.customer_name || "Client";
    const product = order.product_title || order.product_slug || "votre article";
    const total = fmt(order.total_amount || 0);
    const city = order.shipping_city || order.city || "Cotonou";
    const brand = tenantCtx?.storeName || "Isivente";
    const msg =
      `Bonjour ${name}, c'est le service client ${brand}.\n\n` +
      `Nous avons bien reçu votre commande pour : *${product}* (${total} FCFA) vers *${city}*.\n\n` +
      `Pouvez-vous nous confirmer votre disponibilité aujourd'hui pour la livraison ?`;
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`;
  };

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
    const brand = tenantCtx?.storeName || "Isivente";

    const message =
      `Bonjour${clientName}, c'est le service client ${brand}.\n\n` +
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
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Validée
          </span>
        );
      case "shipped":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            En livraison
          </span>
        );
      case "delivered":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200/80">
            Livrée
          </span>
        );
      case "reserved":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            Réservation
          </span>
        );
      case "postponed":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            Reportée
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
            Annulée
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
            À confirmer
          </span>
        );
    }
  };

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
      .slice(0, 6);
  }, [orders, orderTab]);

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
      const slug = o.product_slug || "autre";
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
      .slice(0, 6);
  }, [productsList, productAnalytics, orders]);

  const urgentLeads = useMemo(
    () =>
      leads
        .filter((l) => l.status === "abandoned" || !l.status)
        .slice(0, 5),
    [leads]
  );

  return (
    <div className="space-y-6 pb-10">
      {/* ── 1. EN-TÊTE ÉPURÉ (STYLE STRIPE / LINEAR) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Tableau de bord
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En direct
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Vue synthétique de vos ventes, relances et performances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur de période */}
          <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
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
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  period === tab.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              loadAllData();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            title="Actualiser les données"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? "animate-spin text-slate-900" : "text-slate-500"
              }`}
            />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* ── 2. LES 4 INDICATEURS CLÉS (GRILLE ÉPURÉE SANS BORDURES CRIARDES) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1 : CA Confirmé */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">
              CA Confirmé
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-950 tracking-tight truncate">
              {loading ? "—" : fmt(metrics.confirmedRevenue)}
              <span className="text-xs font-medium text-slate-400 font-sans ml-1">
                F
              </span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Encaissé réel</span>
              <span className="font-semibold text-emerald-700 font-mono">
                {loading ? "—" : fmt(realDeliveryReport.totalRealRevenue)} F
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2 : À Confirmer */}
        <Link
          href="/admin/orders"
          className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-4 sm:p-5 shadow-2xs flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              {metrics.pendingOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
              <span>À confirmer</span>
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-950 tracking-tight">
              {loading ? "—" : metrics.pendingOrdersCount}
              <span className="text-xs font-medium text-slate-400 font-sans ml-1.5">
                commandes
              </span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Potentiel</span>
              <span className="font-semibold text-slate-900 font-mono">
                {fmt(metrics.pendingRevenue)} F
              </span>
            </div>
          </div>
        </Link>

        {/* KPI 3 : Paniers à Relancer */}
        <Link
          href="/admin/prospects"
          className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-4 sm:p-5 shadow-2xs flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">
              Paniers à relancer
            </span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-950 tracking-tight">
              {loading ? "—" : metrics.abandonedLeadsCount}
              <span className="text-xs font-medium text-slate-400 font-sans ml-1.5">
                prospects
              </span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Récupérable</span>
              <span className="font-semibold text-rose-600 font-mono">
                {fmt(metrics.recoverableRevenue)} F
              </span>
            </div>
          </div>
        </Link>

        {/* KPI 4 : Trafic & Clics */}
        <Link
          href="/admin/clicks"
          className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-4 sm:p-5 shadow-2xs flex flex-col justify-between transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">
              Trafic & Clics
            </span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MousePointerClick className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-950 tracking-tight">
                {loading
                  ? "—"
                  : period === "today"
                  ? analytics.todayViews
                  : analytics.totalViews}
              </span>
              <span className="text-xs font-medium text-slate-400">visites</span>
              {period !== "today" && analytics.todayViews > 0 && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  +{analytics.todayViews} auj.
                </span>
              )}
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Clics CTA</span>
              <span className="font-semibold text-slate-900 font-mono">
                {period === "today" ? analytics.todayClicks : analytics.totalClicks} ({analytics.ctr.toFixed(1)}%)
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── 3. ACTIONS PRIORITAIRES : COMMANDES (GAUCHE) & RELANCES (DROITE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* DERNIÈRES COMMANDES (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-slate-950">
                Dernières commandes
              </h2>
              {metrics.pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {metrics.pendingOrdersCount} à traiter
                </span>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 text-[11px]">
                {(
                  [
                    { id: "all", label: "Toutes" },
                    { id: "pending", label: "À confirmer" },
                    { id: "confirmed", label: "Validées" },
                  ] as { id: OrderQuickFilter; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOrderTab(t.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      orderTab === t.id
                        ? "bg-white text-slate-950 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-slate-600 hover:text-slate-950 inline-flex items-center gap-0.5 shrink-0"
              >
                <span>Tout voir</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-2 sm:p-3">
            {loading ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Chargement des commandes…
              </div>
            ) : displayedOrders.length === 0 ? (
              <div className="py-10 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-600">
                  Aucune commande dans cette vue
                </p>
                <p className="text-[11px] text-slate-400">
                  Les nouvelles commandes apparaîtront ici en temps réel.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {displayedOrders.map((order) => {
                  const isPending = !order.status || order.status === "pending";
                  return (
                    <div
                      key={order.id || String(order.order_number)}
                      className="px-3 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs sm:text-[13px] text-slate-950 truncate">
                            {order.customer_name || "Client"}
                          </span>
                          {statusBadge(order.status || "pending")}
                          <span className="text-[11px] text-slate-400">
                            {order.shipping_city || order.city || "Cotonou"}
                          </span>
                          {order.created_at && (
                            <span className="text-[10px] text-slate-400 inline-flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {formatRelativeTime(order.created_at)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 truncate flex items-center gap-2">
                          <span className="truncate text-slate-600">
                            {order.product_title || order.product_slug}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono font-bold text-slate-900">
                            {fmt(order.total_amount || 0)} F
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleQuickConfirmOrder(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-semibold inline-flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
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
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
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
        </section>

        {/* PANIERS À RELANCER (5 cols) */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-slate-950">
                Paniers à relancer
              </h2>
              {urgentLeads.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {metrics.abandonedLeadsCount}
                </span>
              )}
            </div>
            <Link
              href="/admin/prospects"
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 inline-flex items-center gap-0.5"
            >
              <span>Tout voir</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3">
            {urgentLeads.length === 0 ? (
              <div className="py-10 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-600">
                  Aucun panier abandonné
                </p>
                <p className="text-[11px] text-slate-400">
                  Les numéros saisis sans validation finale apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-950 truncate">
                          {lead.customer_name || "Client intéressé"}
                        </span>
                        {lead.created_at && (
                          <span className="text-[10px] text-slate-400 shrink-0">
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
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Relancer</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── 4. ESPACE ANALYSE UNIFIÉ PAR ONGLETS (ZERO ENCOMBREMENT VERTICAL) ── */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Barre d'onglets */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-100/90 self-start">
            <button
              type="button"
              onClick={() => setWorkspaceTab("products")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                workspaceTab === "products"
                  ? "bg-white text-slate-950 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Produits & Trafic</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceTab("cashflow")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                workspaceTab === "cashflow"
                  ? "bg-white text-slate-950 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Point de Caisse COD</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {workspaceTab === "products" ? (
              <>
                <Link
                  href="/admin/landings"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Gérer ({productsList.length})</span>
                </Link>
                <Link
                  href="/admin/clicks"
                  className="text-xs font-semibold text-slate-950 hover:bg-slate-100 px-3 py-1.5 rounded-xl bg-slate-100/80 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Tous les KPIs</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-lg font-mono">
                  Encaissé : {fmt(realDeliveryReport.totalRealRevenue)} FCFA ({realDeliveryReport.totalDelivered} livrés)
                </span>
                <button
                  type="button"
                  onClick={() => setShowOnlyWithOrders(!showOnlyWithOrders)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
                >
                  {showOnlyWithOrders
                    ? `Avec commandes (${realDeliveryReport.rows.length})`
                    : `Tout (${productsList.length})`}
                </button>
                {realDeliveryReport.hasOverrides && (
                  <button
                    type="button"
                    onClick={handleResetToAutoDelivered}
                    className="text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contenu Onglet 1 : Top Produits & Liens Rapides */}
        {workspaceTab === "products" && (
          <div className="overflow-x-auto">
            {top5Products.length === 0 ? (
              <div className="py-12 px-5 text-center space-y-3">
                <p className="text-sm font-bold text-slate-800">
                  Aucune page produit publiée pour le moment
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Créez votre première page de vente en 2 minutes et commencez à encaisser vos commandes Cash-on-Delivery.
                </p>
                <Link
                  href="/admin/landings"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Créer ma première page produit</span>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-5">Produit</th>
                    <th className="py-2.5 px-3 text-center">Visites</th>
                    <th className="py-2.5 px-3 text-center">Clics CTA</th>
                    <th className="py-2.5 px-3 text-center">Commandes</th>
                    <th className="py-2.5 px-3 text-center">Conv.</th>
                    <th className="py-2.5 px-5 text-right">Liens rapides</th>
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
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200/80 shrink-0 bg-slate-50"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-950 truncate max-w-[220px]">
                                {prod.title}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {fmt(prod.price)} F • /p/{prod.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono">
                          <span className="font-bold text-slate-900">
                            {prod.views}
                          </span>
                          {prod.todayViews > 0 && (
                            <span className="ml-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              +{prod.todayViews}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                          {prod.clicks}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {prod.ordersCount}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-mono font-semibold text-[11px] ${
                              Number(prod.convRate) >= 5
                                ? "bg-emerald-50 text-emerald-700"
                                : Number(prod.convRate) > 0
                                ? "bg-sky-50 text-sky-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {prod.convRate}%
                          </span>
                        </td>

                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(prod.slug, false)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 border transition-colors cursor-pointer ${
                                isCopied
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
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
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border transition-colors cursor-pointer ${
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
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-950 hover:bg-slate-50 transition-colors"
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
            )}
          </div>
        )}

        {/* Contenu Onglet 2 : Point de Caisse & Livraisons par Produit */}
        {workspaceTab === "cashflow" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-5">Produit</th>
                  <th className="py-2.5 px-3 text-center">Commandes</th>
                  <th className="py-2.5 px-3 text-center">Colis livrés (ajustable)</th>
                  <th className="py-2.5 px-3 text-center">Taux livraison</th>
                  <th className="py-2.5 px-5 text-right">CA réel encaissé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {realDeliveryReport.rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                      Aucune commande enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  realDeliveryReport.rows.map((prod) => (
                    <tr key={prod.slug} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200/80 shrink-0 bg-slate-50"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/p/${prod.slug}`}
                              target="_blank"
                              className="font-semibold text-slate-950 hover:text-slate-700 transition-colors truncate max-w-[220px] block"
                            >
                              {prod.title}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {fmt(prod.price)} F / unité
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                        {prod.totalOrders}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateDeliveredCount(prod.slug, prod.deliveredCount - 1)}
                            disabled={prod.deliveredCount <= 0}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={prod.deliveredCount}
                            onChange={(e) => handleUpdateDeliveredCount(prod.slug, parseInt(e.target.value) || 0)}
                            className="w-11 text-center font-mono font-bold text-xs text-slate-950 bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateDeliveredCount(prod.slug, prod.deliveredCount + 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        {prod.isOverridden && (
                          <span className="block text-[9.5px] text-amber-600 font-medium mt-0.5">
                            Ajusté
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-mono font-semibold text-[11px] ${
                            prod.deliveryRate >= 70
                              ? "bg-emerald-50 text-emerald-700"
                              : prod.deliveryRate >= 40
                              ? "bg-amber-50 text-amber-700"
                              : prod.deliveryRate > 0
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {prod.deliveryRate.toFixed(0)}%
                        </span>
                      </td>

                      <td className="py-3 px-5 text-right">
                        <span className="font-mono font-bold text-sm text-emerald-700 tabular-nums">
                          {fmt(prod.realRevenue)} FCFA
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {realDeliveryReport.rows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50/90 border-t border-slate-200 font-bold text-xs text-slate-950">
                    <td className="py-3 px-5">TOTAL BOUTIQUE</td>
                    <td className="py-3 px-3 text-center font-mono">
                      {realDeliveryReport.totalOrdersCount}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-800">
                      {realDeliveryReport.totalDelivered} livrés
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-700">
                        {realDeliveryReport.globalDeliveryRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-extrabold text-sm text-emerald-700 tabular-nums">
                      {fmt(realDeliveryReport.totalRealRevenue)} FCFA
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
