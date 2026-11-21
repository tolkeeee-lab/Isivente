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
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Store,
  ExternalLink,
  Copy,
  Check,
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

  const productsList = useMemo<DashboardProductItem[]>(() => {
    if (isFounder) {
      const seen = new Set(founderProducts.map((p) => p.slug));
      const extras = tenantProducts.filter((p) => !seen.has(p.slug));
      return [...extras, ...founderProducts];
    }
    return tenantProducts;
  }, [isFounder, founderProducts, tenantProducts]);

  const [deliveredOverrides, setDeliveredOverrides] = useState<Record<string, number>>({});
  const [showOnlyWithOrders, setShowOnlyWithOrders] = useState<boolean>(true);

  useEffect(() => {
    if (!isFounder) return;
    try {
      const saved = localStorage.getItem("isivente_delivered_counts");
      if (saved) setDeliveredOverrides(JSON.parse(saved));
    } catch {}
  }, [isFounder]);

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
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
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

  // Répartition visuelle du pipeline COD (le "Moment" visuel du dashboard)
  const pipelineShare = useMemo(() => {
    const delivered = realDeliveryReport.totalRealRevenue;
    const confirmedNotDelivered = Math.max(0, metrics.confirmedRevenue - delivered);
    const pending = metrics.pendingRevenue;
    const total = delivered + confirmedNotDelivered + pending;
    if (total <= 0) {
      return { deliveredPct: 0, confirmedPct: 0, pendingPct: 0, total: 0 };
    }
    return {
      deliveredPct: Math.round((delivered / total) * 100),
      confirmedPct: Math.round((confirmedNotDelivered / total) * 100),
      pendingPct: Math.round((pending / total) * 100),
      total,
    };
  }, [realDeliveryReport.totalRealRevenue, metrics.confirmedRevenue, metrics.pendingRevenue]);

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

  // Signature visuelle : pastille 6px + texte sobre aligné sans badges criards
  const renderOrderStatus = (status: string) => {
    const map: Record<string, { label: string; dot: string; text: string }> = {
      confirmed: { label: "Validée", dot: "bg-[#15803d]", text: "text-[#171717]" },
      shipped: { label: "En livraison", dot: "bg-[#525252]", text: "text-[#525252]" },
      delivered: { label: "Livrée", dot: "bg-[#15803d]", text: "text-[#15803d]" },
      reserved: { label: "Réservation", dot: "bg-[#525252]", text: "text-[#525252]" },
      postponed: { label: "Reportée", dot: "bg-[#a3a3a3]", text: "text-[#737373]" },
      cancelled: { label: "Annulée", dot: "bg-[#d4d4d4]", text: "text-[#737373]" },
      pending: { label: "À confirmer", dot: "bg-[#d97706]", text: "text-[#171717]" },
    };
    const item = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 text-[12px] font-normal ${item.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dot}`} />
        <span>{item.label}</span>
      </span>
    );
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

  const periodLabel =
    period === "today" ? "Aujourd'hui" : period === "7d" ? "7 derniers jours" : "Depuis le début";

  return (
    <div className="space-y-6 pb-8">
      {/* 1. En-tête de page */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[1.15] font-medium text-[#171717] tracking-[-0.02em]">
            Tableau de bord
          </h1>
          <p className="text-[14px] font-normal text-[#737373] mt-1">
            {periodLabel} · suivi des commandes et encaissements à la livraison
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-[10px] bg-white border border-black/[0.08]">
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
                className={`h-7 px-3 rounded-[6px] text-[13px] transition-colors duration-150 cursor-pointer ${
                  period === tab.id
                    ? "bg-[#f4f4f5] text-[#171717] font-medium"
                    : "text-[#737373] hover:text-[#171717] font-normal"
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
            className="h-9 px-3 rounded-[8px] bg-white border border-black/[0.08] hover:bg-[#f4f4f5] text-[#525252] hover:text-[#171717] text-[13px] font-medium inline-flex items-center gap-2 transition-colors duration-150 cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw
              className={`w-4 h-4 stroke-[1.5] text-[#737373] ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </header>

      {/* 2. Quatre cartes chiffres (zéro icône décorative, chiffres tabulaires nets) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[14px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-between">
          <span className="text-[13px] font-normal text-[#737373]">
            CA confirmé
          </span>
          <div className="mt-3 text-[26px] sm:text-[28px] leading-none font-medium font-mono tabular-nums text-[#171717] truncate">
            {loading ? "—" : `${fmt(metrics.confirmedRevenue)} F`}
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[12px]">
            <span className="text-[#737373]">Encaissé réel</span>
            <span className="font-mono tabular-nums font-medium text-[#15803d]">
              {loading ? "—" : `${fmt(realDeliveryReport.totalRealRevenue)} F`}
            </span>
          </div>
        </div>

        <Link
          href="/admin/orders"
          className="bg-white rounded-[14px] border border-black/[0.08] hover:border-black/[0.16] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-between transition-colors duration-150"
        >
          <span className="text-[13px] font-normal text-[#737373]">
            À confirmer
          </span>
          <div className="mt-3 text-[26px] sm:text-[28px] leading-none font-medium font-mono tabular-nums text-[#171717]">
            {loading ? "—" : metrics.pendingOrdersCount}
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[12px]">
            <span className="text-[#737373]">Montant en attente</span>
            <span className="font-mono tabular-nums font-medium text-[#525252]">
              {fmt(metrics.pendingRevenue)} F
            </span>
          </div>
        </Link>

        <Link
          href="/admin/prospects"
          className="bg-white rounded-[14px] border border-black/[0.08] hover:border-black/[0.16] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-between transition-colors duration-150"
        >
          <span className="text-[13px] font-normal text-[#737373]">
            Paniers à relancer
          </span>
          <div className="mt-3 text-[26px] sm:text-[28px] leading-none font-medium font-mono tabular-nums text-[#171717]">
            {loading ? "—" : metrics.abandonedLeadsCount}
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[12px]">
            <span className="text-[#737373]">Récupérable</span>
            <span className="font-mono tabular-nums font-medium text-[#525252]">
              {fmt(metrics.recoverableRevenue)} F
            </span>
          </div>
        </Link>

        <Link
          href="/admin/clicks"
          className="bg-white rounded-[14px] border border-black/[0.08] hover:border-black/[0.16] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-between transition-colors duration-150"
        >
          <span className="text-[13px] font-normal text-[#737373]">
            Visites boutique
          </span>
          <div className="mt-3 text-[26px] sm:text-[28px] leading-none font-medium font-mono tabular-nums text-[#171717]">
            {loading
              ? "—"
              : fmt(period === "today" ? analytics.todayViews : analytics.totalViews)}
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[12px]">
            <span className="text-[#737373]">Clics commande</span>
            <span className="font-mono tabular-nums font-medium text-[#525252]">
              {period === "today" ? analytics.todayClicks : analytics.totalClicks} ({analytics.ctr.toFixed(1)}%)
            </span>
          </div>
        </Link>
      </section>

      {/* 2.5 Moment visuel : barre de répartition du pipeline COD */}
      {pipelineShare.total > 0 && (
        <section className="bg-white rounded-[14px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-[13px] font-medium text-[#171717]">
              Répartition de la caisse COD
            </span>
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#525252]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#15803d]" />
                <span>Encaissé {pipelineShare.deliveredPct}%</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#171717]" />
                <span>Validé en cours {pipelineShare.confirmedPct}%</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d4d4d4]" />
                <span>À confirmer {pipelineShare.pendingPct}%</span>
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-[#f4f4f5] overflow-hidden flex">
            {pipelineShare.deliveredPct > 0 && (
              <div
                style={{ width: `${pipelineShare.deliveredPct}%` }}
                className="h-full bg-[#15803d]"
              />
            )}
            {pipelineShare.confirmedPct > 0 && (
              <div
                style={{ width: `${pipelineShare.confirmedPct}%` }}
                className="h-full bg-[#171717]"
              />
            )}
            {pipelineShare.pendingPct > 0 && (
              <div
                style={{ width: `${pipelineShare.pendingPct}%` }}
                className="h-full bg-[#d4d4d4]"
              />
            )}
          </div>
        </section>
      )}

      {/* 3. Flux opérationnel prioritaire : Commandes (7) & Relances (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white rounded-[14px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-medium text-[#171717]">
                Dernières commandes
              </h2>
              {metrics.pendingOrdersCount > 0 && (
                <span className="text-[12px] font-mono tabular-nums text-[#737373]">
                  · {metrics.pendingOrdersCount} en attente
                </span>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="inline-flex p-0.5 rounded-[8px] bg-[#f4f4f5] text-[12px]">
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
                    className={`h-7 px-2.5 rounded-[6px] transition-colors duration-150 cursor-pointer ${
                      orderTab === t.id
                        ? "bg-white text-[#171717] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                        : "text-[#737373] hover:text-[#171717] font-normal"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <Link
                href="/admin/orders"
                className="text-[13px] font-normal text-[#525252] hover:text-[#171717] inline-flex items-center gap-1 transition-colors duration-150 shrink-0"
              >
                <span>Tout voir</span>
                <ChevronRight className="w-4 h-4 stroke-[1.5] text-[#737373]" />
              </Link>
            </div>
          </div>

          <div className="p-2">
            {loading ? (
              <div className="py-10 text-center text-[13px] text-[#737373]">
                Chargement des commandes
              </div>
            ) : displayedOrders.length === 0 ? (
              <div className="py-10 text-center space-y-1">
                <p className="text-[14px] font-medium text-[#171717]">
                  Aucune commande dans cette vue
                </p>
                <p className="text-[13px] text-[#737373]">
                  Les nouvelles commandes apparaîtront ici dès réception
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {displayedOrders.map((order) => {
                  const isPending = !order.status || order.status === "pending";
                  return (
                    <div
                      key={order.id || String(order.order_number)}
                      className="px-3 py-3 flex items-center justify-between gap-4 hover:bg-[#fafafa] rounded-[8px] transition-colors duration-150"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-[14px] text-[#171717] truncate">
                            {order.customer_name || "Client"}
                          </span>
                          {renderOrderStatus(order.status || "pending")}
                          <span className="text-[12px] text-[#737373]">
                            {order.shipping_city || order.city || "Cotonou"}
                          </span>
                          {order.created_at && (
                            <span className="text-[12px] font-mono text-[#737373]">
                              {formatRelativeTime(order.created_at)}
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] text-[#525252] mt-1 truncate flex items-center gap-2">
                          <span className="truncate">
                            {order.product_title || order.product_slug}
                          </span>
                          <span className="text-[#d4d4d4]">·</span>
                          <span className="font-mono tabular-nums font-medium text-[#171717]">
                            {fmt(order.total_amount || 0)} F
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleQuickConfirmOrder(order)}
                            className="h-8 px-3 rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[12px] font-medium inline-flex items-center gap-1.5 active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
                            title="Valider cette commande"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
                            <span className="hidden sm:inline">Valider</span>
                          </button>
                        )}

                        <a
                          href={getOrderWhatsAppUrl(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 px-3 rounded-[8px] bg-white hover:bg-[#f4f4f5] text-[#171717] border border-black/[0.08] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors duration-150"
                          title="Contacter sur WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4 stroke-[1.5] text-[#15803d]" />
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

        {/* Paniers à relancer (5 cols) */}
        <section className="lg:col-span-5 bg-white rounded-[14px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.08] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-medium text-[#171717]">
                Paniers à relancer
              </h2>
              {metrics.abandonedLeadsCount > 0 && (
                <span className="text-[12px] font-mono tabular-nums text-[#737373]">
                  · {metrics.abandonedLeadsCount}
                </span>
              )}
            </div>
            <Link
              href="/admin/prospects"
              className="text-[13px] font-normal text-[#525252] hover:text-[#171717] inline-flex items-center gap-1 transition-colors duration-150"
            >
              <span>Tout voir</span>
              <ChevronRight className="w-4 h-4 stroke-[1.5] text-[#737373]" />
            </Link>
          </div>

          <div className="p-2">
            {urgentLeads.length === 0 ? (
              <div className="py-10 text-center space-y-1">
                <p className="text-[14px] font-medium text-[#171717]">
                  Aucun panier abandonné
                </p>
                <p className="text-[13px] text-[#737373]">
                  Les numéros saisis sans validation finale apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {urgentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="px-3 py-3 flex items-center justify-between gap-3 hover:bg-[#fafafa] rounded-[8px] transition-colors duration-150"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[14px] text-[#171717] truncate">
                          {lead.customer_name || "Client intéressé"}
                        </span>
                        {lead.created_at && (
                          <span className="text-[12px] font-mono text-[#737373] shrink-0">
                            {formatRelativeTime(lead.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="text-[13px] text-[#525252] truncate mt-0.5">
                        {lead.product_title} ·{" "}
                        <span className="font-mono tabular-nums font-medium text-[#171717]">
                          {fmt(lead.total_amount)} F
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppRelance(lead)}
                      className="h-8 px-3 rounded-[8px] bg-[#15803d] hover:bg-[#166534] text-white text-[12px] font-medium inline-flex items-center gap-1.5 active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer shrink-0"
                    >
                      <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                      <span>Relancer</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 4. Espace d'analyse unifié par onglets */}
      <section className="bg-white rounded-[14px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-[10px] bg-[#f4f4f5] self-start">
            <button
              type="button"
              onClick={() => setWorkspaceTab("products")}
              className={`h-8 px-3.5 rounded-[6px] text-[13px] transition-colors duration-150 cursor-pointer ${
                workspaceTab === "products"
                  ? "bg-white text-[#171717] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  : "text-[#737373] hover:text-[#171717] font-normal"
              }`}
            >
              Produits et trafic
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceTab("cashflow")}
              className={`h-8 px-3.5 rounded-[6px] text-[13px] transition-colors duration-150 cursor-pointer ${
                workspaceTab === "cashflow"
                  ? "bg-white text-[#171717] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  : "text-[#737373] hover:text-[#171717] font-normal"
              }`}
            >
              Point de caisse COD
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {workspaceTab === "products" ? (
              <>
                <Link
                  href="/admin/landings"
                  className="h-8 px-3 rounded-[8px] border border-black/[0.08] hover:bg-[#f4f4f5] text-[13px] font-medium text-[#525252] hover:text-[#171717] inline-flex items-center gap-1.5 transition-colors duration-150"
                >
                  <Store className="w-4 h-4 stroke-[1.5] text-[#737373]" />
                  <span>Gérer ({productsList.length})</span>
                </Link>
                <Link
                  href="/admin/clicks"
                  className="h-8 px-3 rounded-[8px] bg-[#f4f4f5] hover:bg-[#e5e5e5] text-[13px] font-medium text-[#171717] inline-flex items-center gap-1 transition-colors duration-150"
                >
                  <span>Tous les indicateurs</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[1.5] text-[#737373]" />
                </Link>
              </>
            ) : (
              <>
                <span className="text-[13px] font-mono tabular-nums font-medium text-[#15803d] px-2">
                  Encaissé : {fmt(realDeliveryReport.totalRealRevenue)} F ({realDeliveryReport.totalDelivered} livrés)
                </span>
                <button
                  type="button"
                  onClick={() => setShowOnlyWithOrders(!showOnlyWithOrders)}
                  className="h-8 px-3 rounded-[8px] bg-[#f4f4f5] hover:bg-[#e5e5e5] text-[13px] font-medium text-[#171717] transition-colors duration-150 cursor-pointer"
                >
                  {showOnlyWithOrders
                    ? `Avec commandes (${realDeliveryReport.rows.length})`
                    : `Tout le catalogue (${productsList.length})`}
                </button>
                {realDeliveryReport.hasOverrides && (
                  <button
                    type="button"
                    onClick={handleResetToAutoDelivered}
                    className="h-8 px-3 rounded-[8px] border border-black/[0.08] hover:bg-[#f4f4f5] text-[12px] font-medium text-[#525252] inline-flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Onglet 1 : Produits et trafic */}
        {workspaceTab === "products" && (
          <div className="overflow-x-auto">
            {top5Products.length === 0 ? (
              <div className="py-12 px-5 text-center space-y-3">
                <p className="text-[15px] font-medium text-[#171717]">
                  Aucune page produit publiée
                </p>
                <p className="text-[13px] text-[#737373] max-w-sm mx-auto">
                  Créez votre première page de vente et commencez à recevoir vos commandes à la livraison
                </p>
                <Link
                  href="/admin/landings"
                  className="h-9 px-4 rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium inline-flex items-center gap-2 transition-colors duration-150"
                >
                  <Store className="w-4 h-4 stroke-[1.5]" />
                  <span>Créer une page produit</span>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-[13px] border-collapse min-w-[620px]">
                <thead>
                  <tr className="border-b border-black/[0.08] bg-[#fafafa] text-[#737373] font-normal text-[12px]">
                    <th className="py-3 px-5 font-normal">Produit</th>
                    <th className="py-3 px-3 text-right font-normal">Visites</th>
                    <th className="py-3 px-3 text-right font-normal">Clics</th>
                    <th className="py-3 px-3 text-right font-normal">Commandes</th>
                    <th className="py-3 px-3 text-right font-normal">Conversion</th>
                    <th className="py-3 px-5 text-right font-normal">Liens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {top5Products.map((prod) => {
                    const isCopied = copiedSlug === prod.slug;
                    const isCopiedUtm = copiedSlug === `${prod.slug}_utm`;

                    return (
                      <tr
                        key={prod.slug}
                        className="hover:bg-[#fafafa] transition-colors duration-150"
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-9 h-9 rounded-[8px] object-cover border border-black/[0.08] shrink-0 bg-[#f4f4f5]"
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-[#171717] truncate max-w-[240px]">
                                {prod.title}
                              </div>
                              <div className="text-[12px] text-[#737373] font-mono tabular-nums">
                                {fmt(prod.price)} F · /p/{prod.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#171717]">
                          <span>{fmt(prod.views)}</span>
                          {prod.todayViews > 0 && (
                            <span className="ml-1.5 text-[12px] text-[#15803d]">
                              +{prod.todayViews}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#525252]">
                          {fmt(prod.clicks)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-[#171717]">
                          {fmt(prod.ordersCount)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono tabular-nums text-[#525252]">
                          {prod.convRate}%
                        </td>

                        <td className="py-3 px-5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(prod.slug, false)}
                              className={`h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1 border transition-colors duration-150 cursor-pointer ${
                                isCopied
                                  ? "bg-[#15803d] text-white border-[#15803d]"
                                  : "bg-white hover:bg-[#f4f4f5] text-[#171717] border-black/[0.08]"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[1.5]" />
                                  <span>Copié</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 stroke-[1.5] text-[#737373]" />
                                  <span>Lien</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyLink(prod.slug, true)}
                              title="Copier le lien avec UTM Meta Ads"
                              className={`h-7 px-2 rounded-[6px] text-[12px] font-mono border transition-colors duration-150 cursor-pointer ${
                                isCopiedUtm
                                  ? "bg-[#f4f4f5] text-[#15803d] border-[#15803d]/40"
                                  : "bg-[#fafafa] hover:bg-[#f4f4f5] text-[#525252] border-black/[0.08]"
                              }`}
                            >
                              {isCopiedUtm ? "OK" : "UTM"}
                            </button>

                            <Link
                              href={`/p/${prod.slug}`}
                              target="_blank"
                              title="Ouvrir la page"
                              className="h-7 w-7 rounded-[6px] border border-black/[0.08] text-[#737373] hover:text-[#171717] hover:bg-[#f4f4f5] inline-flex items-center justify-center transition-colors duration-150"
                            >
                              <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
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

        {/* Onglet 2 : Point de caisse COD */}
        {workspaceTab === "cashflow" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-black/[0.08] bg-[#fafafa] text-[#737373] font-normal text-[12px]">
                  <th className="py-3 px-5 font-normal">Produit</th>
                  <th className="py-3 px-3 text-right font-normal">Commandes</th>
                  <th className="py-3 px-3 text-center font-normal">Colis livrés</th>
                  <th className="py-3 px-3 text-right font-normal">Taux livraison</th>
                  <th className="py-3 px-5 text-right font-normal">CA réel encaissé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {realDeliveryReport.rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#737373] text-[13px]">
                      Aucune commande enregistrée pour le moment
                    </td>
                  </tr>
                ) : (
                  realDeliveryReport.rows.map((prod) => (
                    <tr key={prod.slug} className="hover:bg-[#fafafa] transition-colors duration-150">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-9 h-9 rounded-[8px] object-cover border border-black/[0.08] shrink-0 bg-[#f4f4f5]"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/p/${prod.slug}`}
                              target="_blank"
                              className="font-medium text-[#171717] hover:underline truncate max-w-[240px] block"
                            >
                              {prod.title}
                            </Link>
                            <span className="text-[12px] text-[#737373] font-mono tabular-nums">
                              {fmt(prod.price)} F / unité
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#525252]">
                        {prod.totalOrders}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-white border border-black/[0.08] rounded-[8px] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateDeliveredCount(prod.slug, prod.deliveredCount - 1)}
                            disabled={prod.deliveredCount <= 0}
                            className="w-6 h-6 rounded-[6px] hover:bg-[#f4f4f5] text-[#525252] font-medium flex items-center justify-center text-[13px] transition-colors duration-150 disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={prod.deliveredCount}
                            onChange={(e) => handleUpdateDeliveredCount(prod.slug, parseInt(e.target.value) || 0)}
                            className="w-11 text-center font-mono tabular-nums font-medium text-[13px] text-[#171717] bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateDeliveredCount(prod.slug, prod.deliveredCount + 1)}
                            className="w-6 h-6 rounded-[6px] hover:bg-[#f4f4f5] text-[#525252] font-medium flex items-center justify-center text-[13px] transition-colors duration-150 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        {prod.isOverridden && (
                          <span className="block text-[11px] text-[#737373] mt-0.5">
                            Ajusté
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#525252]">
                        {prod.deliveryRate.toFixed(0)}%
                      </td>

                      <td className="py-3 px-5 text-right font-mono tabular-nums font-medium text-[#15803d]">
                        {fmt(prod.realRevenue)} F
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {realDeliveryReport.rows.length > 0 && (
                <tfoot>
                  <tr className="bg-[#fafafa] border-t border-black/[0.08] font-medium text-[13px] text-[#171717]">
                    <td className="py-3 px-5">Total boutique</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {realDeliveryReport.totalOrdersCount}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-[#15803d]">
                      {realDeliveryReport.totalDelivered} livrés
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {realDeliveryReport.globalDeliveryRate.toFixed(0)}%
                    </td>
                    <td className="py-3 px-5 text-right font-mono tabular-nums text-[#15803d]">
                      {fmt(realDeliveryReport.totalRealRevenue)} F
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
