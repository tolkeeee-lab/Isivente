"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
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
  getAllProductsAnalytics,
  AnalyticsStats,
  ProductAnalyticsStats
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
  ChevronLeft,
  Phone,
  Truck,
  Store,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Activity,
  BarChart3
} from "lucide-react";
import { getAdminDashboardProducts } from "@/lib/defaultCatalog";

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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const kpiScrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const productsList = useMemo(() => getAdminDashboardProducts(), []);

  const handleCopyLink = (slug: string, withUtm = false) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://isivente.vercel.app";
    const url = withUtm
      ? `${origin}/p/${slug}?utm_source=meta&utm_medium=cpc&utm_campaign=${slug}_ads`
      : `${origin}/p/${slug}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedSlug(withUtm ? `${slug}_utm` : slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const loadAllData = async (silent = false) => {
    if (!silent && orders.length === 0) setLoading(true);
    try {
      const [ordersData, leadsData, analyticsData, prodsAnalyticsData] = await Promise.all([
        getAllOrders(),
        getAllLeads(),
        getAnalyticsStats(),
        getAllProductsAnalytics()
      ]);
      setOrders(ordersData);
      setLeads(leadsData);
      setAnalytics(analyticsData);
      setProductAnalytics(prodsAnalyticsData);
      setLastUpdated(new Date());
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

  const analyticsBySlug = useMemo(() => {
    const map: Record<string, ProductAnalyticsStats> = {};
    productAnalytics.forEach(p => {
      map[p.slug] = p;
    });
    return map;
  }, [productAnalytics]);

  const ordersCountBySlug = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const slug = o.product_slug || "microscope";
      map[slug] = (map[slug] || 0) + 1;
    });
    return map;
  }, [orders]);

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

      {/* ── LES 4 CARTES KPI MAÎTRESSES (DÉFILEMENT HORIZONTAL FLUIDE & TACTILE) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Indicateurs Clés (KPI)</span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">• Défilement horizontal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollContainer(kpiScrollRef, "left")}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Défiler vers la gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollContainer(kpiScrollRef, "right")}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Défiler vers la droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={kpiScrollRef}
          className="flex overflow-x-auto scrollbar-none gap-3 sm:gap-4 pb-2 pt-0.5 snap-x snap-mandatory scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0"
        >
          
          {/* KPI 1 : CA Confirmé */}
          <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-[290px] flex-1 shrink-0 snap-start card-figma p-4 sm:p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                CA Confirmé & Livré
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900 truncate">
                {loading ? "…" : fmt(metrics.confirmedRevenue)} <span className="text-xs font-normal text-slate-500 font-sans">FCFA</span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Commandes validées :</span>
                <span className="font-bold text-emerald-600 font-mono">{metrics.confirmedOrdersCount}</span>
              </div>
            </div>
          </div>

          {/* KPI 2 : Nouvelles Commandes À Confirmer */}
          <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-[290px] flex-1 shrink-0 snap-start card-figma p-4 sm:p-5 flex flex-col justify-between border-l-4 border-l-blue-500">
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
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900 truncate">
                {loading ? "…" : metrics.pendingOrdersCount} <span className="text-xs font-normal text-slate-500 font-sans">commandes</span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Montant à valider :</span>
                <span className="font-bold text-blue-700 font-mono">{fmt(metrics.pendingRevenue)} F</span>
              </div>
            </div>
          </div>

          {/* KPI 3 : Paniers Abandonnés (CA Récupérable) */}
          <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-[290px] flex-1 shrink-0 snap-start card-figma p-4 sm:p-5 flex flex-col justify-between border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                Paniers Abandonnés
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertCircle className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900 truncate">
                {loading ? "…" : fmt(metrics.recoverableRevenue)} <span className="text-xs font-normal text-slate-500 font-sans">FCFA</span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Clients à relancer :</span>
                <span className="font-bold text-rose-600 font-mono">{metrics.abandonedLeadsCount} prospects</span>
              </div>
            </div>
          </div>

          {/* KPI 4 : Trafic Ads & Visiteurs */}
          <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-[290px] flex-1 shrink-0 snap-start card-figma p-4 sm:p-5 flex flex-col justify-between border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>Trafic & Visiteurs Live</span>
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <MousePointerClick className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900 truncate">
                  {loading ? "…" : analytics.totalViews} <span className="text-xs font-normal text-slate-500 font-sans">visites</span>
                </div>
                {analytics.todayViews > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    +{analytics.todayViews} auj.
                  </span>
                )}
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Clics vers commande :</span>
                <span className="font-bold text-purple-700 font-mono">{analytics.totalClicks} ({analytics.ctr.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── BARRE DE RACCOURCIS RAPIDES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        <Link
          href="/admin/landings"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              Landing Pages
            </div>
            <div className="text-[11px] text-slate-400 truncate">{productsList.length} pages actives</div>
          </div>
        </Link>

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
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
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

      {/* ── SECTION BOÎTE À OUTILS : VOS LANDING PAGES PRODUITS (DÉFILEMENT HORIZONTAL FLUIDE) ── */}
      <div className="card-figma p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-600" />
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">
                Vos Landing Pages Produits en Ligne
              </h2>
              <Link
                href="/admin/landings"
                className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors inline-flex items-center gap-1"
              >
                <span>{productsList.length} pages actives</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Glissez horizontalement pour parcourir vos pages, ou cliquez sur l&apos;onglet dédié pour tout voir en grille.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => scrollContainer(productsScrollRef, "left")}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Défiler vers la gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollContainer(productsScrollRef, "right")}
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Défiler vers la droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={productsScrollRef}
          className="flex overflow-x-auto scrollbar-none gap-3.5 pb-2 pt-1 snap-x snap-mandatory scroll-smooth -mx-1 px-1"
        >
          {productsList.map((prod) => {
            const isCopied = copiedSlug === prod.slug;
            const isCopiedUtm = copiedSlug === `${prod.slug}_utm`;

            return (
              <div
                key={prod.slug}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {prod.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {fmt(prod.price)} FCFA
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[11px] text-slate-400 truncate">
                        /p/{prod.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action : Visiter & Copier */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={`/p/${prod.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Visiter</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(prod.slug, false)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCopied
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier lien</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(prod.slug, true)}
                    title="Copier avec tracking UTM Meta Ads (?utm_source=meta&...)"
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isCopiedUtm
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {isCopiedUtm ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="font-mono text-[10px] font-bold">UTM</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION DÉDIÉE : SUIVI DU TRAFIC & VISITEURS EN DIRECT PAR PRODUIT ── */}
      <div className="card-figma p-5 sm:p-6 space-y-4 border-t-2 border-t-purple-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <BarChart3 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-slate-900">
                  Trafic & Visites en Direct par Produit
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Supabase
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Suivi en temps réel des visiteurs, clics vers commande et taux de conversion de chaque landing page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/clicks"
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 inline-flex items-center gap-1.5 transition-all"
            >
              <span>Rapport détaillé des clics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Barre de stats globales condensée */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 text-xs">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">Total Visites</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-slate-900">{analytics.totalViews}</span>
              {analytics.todayViews > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                  +{analytics.todayViews} auj.
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">Clics Formulaire</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-purple-700">{analytics.totalClicks}</span>
              {analytics.todayClicks > 0 && (
                <span className="text-[10px] font-bold text-purple-600 bg-purple-100/70 px-1.5 py-0.2 rounded">
                  +{analytics.todayClicks} auj.
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">Taux de Clic CTA</span>
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {analytics.ctr.toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">Temps Moyen / Page</span>
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
              {analytics.formattedAvgTime || "—"}
            </span>
          </div>
        </div>

        {/* Tableau récapitulatif par produit */}
        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-left text-xs border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Produit</th>
                <th className="py-2.5 px-3 text-center">Visites (Total / Auj.)</th>
                <th className="py-2.5 px-3 text-center">Clics CTA Formulaire</th>
                <th className="py-2.5 px-3 text-center">Commandes Reçues</th>
                <th className="py-2.5 px-3 text-center">Taux Conv.</th>
                <th className="py-2.5 px-3 text-center">Temps Moyen</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productsList.map((prod) => {
                const stat = analyticsBySlug[prod.slug];
                const views = stat?.totalViews ?? 0;
                const todayViews = stat?.todayViews ?? 0;
                const clicks = stat?.totalClicks ?? 0;
                const ctr = stat?.ctr ?? 0;
                const ordersCount = ordersCountBySlug[prod.slug] || 0;
                const convRate = views > 0 ? ((ordersCount / views) * 100).toFixed(1) : "0.0";
                const avgTime = stat?.formattedAvgTime || "—";
                const isCopied = copiedSlug === prod.slug;

                return (
                  <tr key={prod.slug} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                            {prod.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            /p/{prod.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {views}
                      </div>
                      {todayViews > 0 ? (
                        <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                          +{todayViews} aujourd'hui
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">0 auj.</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-bold text-purple-700 text-sm">
                        {clicks}
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-mono">
                        CTR: {ctr.toFixed(1)}%
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-bold text-emerald-700 text-sm">
                        {ordersCount}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        commande{ordersCount > 1 ? "s" : ""}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        Number(convRate) >= 5 
                          ? "bg-emerald-100 text-emerald-800" 
                          : Number(convRate) > 0 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {convRate}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      {avgTime}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/p/${prod.slug}`}
                          target="_blank"
                          title="Voir la page de vente"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(prod.slug, false)}
                          title="Copier le lien direct"
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isCopied
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
