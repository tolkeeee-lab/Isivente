"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllOrders, OrderItem } from "@/lib/ordersStorage";
import { getAnalyticsStats, getAllProductsAnalytics, AnalyticsStats, ProductAnalyticsStats } from "@/lib/analyticsStorage";
import { 
  TrendingUp, 
  ShoppingBag, 
  MousePointerClick, 
  Timer, 
  Copy, 
  Check, 
  ExternalLink, 
  Package,
  ArrowUpRight,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight
} from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenue: number; // CA total engagé
  deliveredRevenue: number; // CA réel encaissé
  shippedRevenue: number; // CA en cours de livraison
  pendingRevenue: number; // CA à confirmer
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    revenue: 0,
    deliveredRevenue: 0,
    shippedRevenue: 0,
    pendingRevenue: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsStats>({
    totalViews: 0,
    totalClicks: 0,
    ctr: 0,
    avgTimeSpentSeconds: 0,
    formattedAvgTime: "—"
  });
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalyticsStats[]>([]);
  const [productFinancials, setProductFinancials] = useState<Record<string, { totalOrders: number; deliveredOrders: number; deliveredRevenue: number; totalRevenue: number }>>({});
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const productsList = [
    {
      title: "Brosse Démêlante Vapeur Uméi 3-en-1",
      slug: "umei",
      price: 14900,
      image: "/images/umei-hero-real.jpg"
    },
    {
      title: "Purificateur d'Air EraClean™ 10 Ans",
      slug: "eraclean",
      price: 19900,
      image: "/images/eraclean-studio.jpg"
    },
    {
      title: "Ventilateur Ceinture & Powerbank TurboFan™",
      slug: "turbofan",
      price: 16900,
      image: "/images/turbofan-studio.jpg"
    },
    {
      title: "Éplucheur Automatique ChefPeel™ Pro",
      slug: "peeler",
      price: 14900,
      image: "/images/peeler-hero.jpg"
    }
  ];

  useEffect(() => {
    async function fetchData() {
      const [allOrders, analyticsData, perProductData] = await Promise.all([
        getAllOrders(),
        getAnalyticsStats(),
        getAllProductsAnalytics(),
      ]);

      setAnalytics(analyticsData);
      setProductAnalytics(perProductData);
      
      let pending = 0, shipped = 0, delivered = 0, cancelled = 0;
      let totalRev = 0, deliveredRev = 0, shippedRev = 0, pendingRev = 0;
      const productMap: Record<string, { totalOrders: number; deliveredOrders: number; deliveredRevenue: number; totalRevenue: number }> = {};

      allOrders.forEach(order => {
        const pSlug = order.product_slug || "umei";
        if (!productMap[pSlug]) {
          productMap[pSlug] = { totalOrders: 0, deliveredOrders: 0, deliveredRevenue: 0, totalRevenue: 0 };
        }
        productMap[pSlug].totalOrders++;

        const amt = order.total_amount || 0;

        if (order.status === 'pending') {
          pending++;
          pendingRev += amt;
          productMap[pSlug].totalRevenue += amt;
        } else if (order.status === 'shipped') {
          shipped++;
          shippedRev += amt;
          productMap[pSlug].totalRevenue += amt;
        } else if (order.status === 'delivered') {
          delivered++;
          deliveredRev += amt;
          productMap[pSlug].deliveredOrders++;
          productMap[pSlug].deliveredRevenue += amt;
          productMap[pSlug].totalRevenue += amt;
        } else if (order.status === 'cancelled') {
          cancelled++;
        }

        if (['delivered', 'shipped', 'pending'].includes(order.status || '')) {
          totalRev += amt;
        }
      });

      setProductFinancials(productMap);
      setStats({ 
        totalOrders: allOrders.length, 
        pendingOrders: pending, 
        shippedOrders: shipped, 
        deliveredOrders: delivered, 
        cancelledOrders: cancelled, 
        revenue: totalRev,
        deliveredRevenue: deliveredRev,
        shippedRevenue: shippedRev,
        pendingRevenue: pendingRev,
      });
      setRecentOrders(allOrders.slice(0, 6));
      setLoading(false);
    }
    fetchData();
  }, []);

  const copyProductLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            À confirmer
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
            <Truck className="w-3 h-3 stroke-[2]" />
            En livraison
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 stroke-[2]" />
            Livrée & Encaissée
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <XCircle className="w-3 h-3 stroke-[2]" />
            Annulée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            En attente
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-[staggerFadeUp_240ms_cubic-bezier(0.16,1,0.3,1)_both]">
      
      {/* PAGE TITLE & SUBTITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1">
            Tableau de Bord
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Vue d'ensemble de l'activité
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Suivi des encaissements, performance des campagnes et dispatch des commandes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all duration-150 active:scale-[0.98]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Traiter les commandes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 📊 KPI BAR : RUBAN HORIZONTAL DÉFILABLE & COMPACT */}
      <div className="relative -mx-2 px-2">
        <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory">
          
          {/* KPI 1 : CA RÉEL ENCAISSÉ (LIVRÉES & PAYÉES) */}
          <div className="card-figma p-4 min-w-[260px] sm:min-w-[280px] shrink-0 snap-start flex flex-col justify-between border-emerald-300/80 bg-emerald-50/20 hover:border-emerald-400 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CA Réel Encaissé (Livrées)</span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-32 rounded-lg skeleton-shimmer my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-emerald-950">
                {new Intl.NumberFormat("fr-FR").format(stats.deliveredRevenue)} <span className="text-xs font-sans font-normal text-emerald-700">FCFA</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
              <span>{stats.deliveredOrders} {stats.deliveredOrders > 1 ? "commandes livrées" : "commande livrée"}</span>
              <span className="font-semibold font-mono">100% Encaissé</span>
            </div>
          </div>

          {/* KPI 2 : CA EN COURS DE LIVRAISON */}
          <div className="card-figma p-4 min-w-[240px] sm:min-w-[260px] shrink-0 snap-start flex flex-col justify-between border-sky-200/70 bg-sky-50/15 hover:border-sky-300 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">CA En Livraison</span>
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200">
                <Truck className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-28 rounded-lg skeleton-shimmer my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
                {new Intl.NumberFormat("fr-FR").format(stats.shippedRevenue)} <span className="text-xs font-sans font-normal text-slate-400">FCFA</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Colis sur le terrain :</span>
              <span className="font-semibold text-sky-600 font-mono">{stats.shippedOrders} en cours</span>
            </div>
          </div>

          {/* KPI 3 : CA TOTAL ENGAGÉ */}
          <div className="card-figma p-4 min-w-[240px] sm:min-w-[260px] shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">CA Total Engagé</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-28 rounded-lg skeleton-shimmer my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
                {new Intl.NumberFormat("fr-FR").format(stats.revenue)} <span className="text-xs font-sans font-normal text-slate-400">FCFA</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{stats.totalOrders} commandes totales</span>
              <span className="font-semibold text-amber-600 font-mono">{stats.pendingOrders} en attente</span>
            </div>
          </div>

          {/* KPI 4 : TAUX DE CLICS (CTR) */}
          <div className="card-figma p-4 min-w-[220px] sm:min-w-[240px] shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">CTR (Conversion)</span>
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                <MousePointerClick className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-16 rounded-lg skeleton-shimmer my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
                {analytics.ctr}<span className="text-sm text-slate-400 font-sans">%</span>
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Clics / Vues :</span>
              <span className="font-semibold text-slate-700 font-mono">{analytics.totalClicks} / {analytics.totalViews}</span>
            </div>
          </div>

          {/* KPI 5 : TEMPS MOYEN PASSÉ */}
          <div className="card-figma p-4 min-w-[220px] sm:min-w-[240px] shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Temps Moyen</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Timer className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-16 rounded-lg skeleton-shimmer my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
                {analytics.formattedAvgTime}
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Engagement :</span>
              <span className="font-semibold text-slate-700">Visiteurs réels</span>
            </div>
          </div>

        </div>
      </div>

      {/* LIENS DIRECTS DE PRODUITS + ANALYTICS PAR PRODUIT */}
      <div className="card-figma p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">Performance par Produit</h2>
              <p className="text-xs text-slate-400">CA Encaissé réel, commandes, CTR et temps moyen par produit</p>
            </div>
          </div>
          <Link href="/admin/products" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
            <span>Gérer le catalogue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {productsList.map((prod) => {
            const isCopied = copiedSlug === prod.slug;
            const pa = productAnalytics.find(p => p.slug === prod.slug);
            const fin = productFinancials[prod.slug] || { totalOrders: 0, deliveredOrders: 0, deliveredRevenue: 0, totalRevenue: 0 };
            const ctr = pa?.ctr ?? null;
            const avgTime = pa?.formattedAvgTime ?? null;

            return (
              <div
                key={prod.slug}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-3 hover:bg-slate-50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-200 bg-white"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{prod.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">/p/{prod.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyProductLink(prod.slug)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.97] ${
                        isCopied
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.75]" />}
                      <span>{isCopied ? "Copié !" : "Copier"}</span>
                    </button>
                    <a
                      href={`/p/${prod.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-xs transition-colors"
                      title="Aperçu client"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Métriques Financières & Analytics Produit */}
                <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-slate-200/60 text-center">
                  <div className="bg-white rounded-lg p-2 border border-slate-200/70 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-emerald-600 truncate">CA Livré</div>
                    <div className="text-xs font-bold font-mono text-emerald-700 tabular-nums">
                      {new Intl.NumberFormat("fr-FR").format(fin.deliveredRevenue)} F
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-200/70 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 truncate">Livrées</div>
                    <div className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                      {fin.deliveredOrders} / {fin.totalOrders}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-200/70 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 truncate">CTR</div>
                    <div className={`text-xs font-bold font-mono tabular-nums ${
                      ctr !== null && ctr > 0 ? "text-violet-700" : "text-slate-400"
                    }`}>
                      {ctr !== null ? `${ctr}%` : "—"}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-200/70 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 truncate">Tps Moy.</div>
                    <div className="text-xs font-bold font-mono text-slate-700 tabular-nums">
                      {avgTime || "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* TABLEAU DES DERNIÈRES COMMANDES */}
      <div className="card-figma overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">Dernières Commandes Enregistrées</h2>
            <p className="text-xs text-slate-400">Flux temps réel des nouvelles demandes clients</p>
          </div>
          <Link 
            href="/admin/orders" 
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>Voir toutes les commandes ({stats.totalOrders})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Client</th>
                <th className="py-3 px-5">Destination</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5 text-right">Montant</th>
                <th className="py-3 px-5 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                    <td className="py-4 px-5 text-center"><div className="h-5 w-24 bg-slate-200 rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Aucune commande enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => (
                  <tr 
                    key={order.id || index} 
                    className="hover:bg-slate-50/70 transition-colors"
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{order.customer_name || "Client anonyme"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{order.customer_phone || "-"}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {order.shipping_city || order.city || "Non précisé"}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                      {new Date(order.created_at || Date.now()).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {new Intl.NumberFormat("fr-FR").format(order.total_amount || 0)} FCFA
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
