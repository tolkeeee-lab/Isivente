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
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    revenue: 0
  });
  const [analytics, setAnalytics] = useState<AnalyticsStats>({
    totalViews: 0,
    totalClicks: 0,
    ctr: 0,
    avgTimeSpentSeconds: 0,
    formattedAvgTime: "—"
  });
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalyticsStats[]>([]);
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
      title: "Purificateur d'Air & Anti-Odeurs EraClean",
      slug: "eraclean",
      price: 19900,
      image: "/images/eraclean-1.jpg"
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
      
      let pending = 0, shipped = 0, delivered = 0, cancelled = 0, revenue = 0;
      allOrders.forEach(order => {
        if (order.status === 'pending') pending++;
        if (order.status === 'shipped') shipped++;
        if (order.status === 'delivered') delivered++;
        if (order.status === 'cancelled') cancelled++;
        if (['delivered', 'shipped', 'pending'].includes(order.status || '')) {
          revenue += order.total_amount || 0;
        }
      });

      setStats({ totalOrders: allOrders.length, pendingOrders: pending, shippedOrders: shipped, deliveredOrders: delivered, cancelledOrders: cancelled, revenue });
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
          
          {/* KPI 1 : CHIFFRE D'AFFAIRES */}
          <div className="card-figma p-4 min-w-[240px] sm:min-w-[260px] shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Chiffre d&apos;Affaires</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
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
              <span>Encaissé / En cours</span>
              <span className="font-semibold text-emerald-600 font-mono">100% COD</span>
            </div>
          </div>

          {/* KPI 2 : COMMANDES TOTALES */}
          <div className="card-figma p-4 min-w-[220px] sm:min-w-[240px] shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Commandes</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-16 rounded-lg skeleton-shimmer my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
                {stats.totalOrders}
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>À traiter :</span>
              <span className="font-semibold text-amber-600 font-mono">{stats.pendingOrders} en attente</span>
            </div>
          </div>

          {/* KPI 3 : LIVRÉES & ENCAISSÉES */}
          <div className="card-figma p-4 min-w-[220px] sm:min-w-[240px] shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Livrées & Encaissées</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-16 rounded-lg skeleton-shimmer my-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
                {stats.deliveredOrders}
              </div>
            )}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>En cours livraison :</span>
              <span className="font-semibold text-sky-600 font-mono">{stats.shippedOrders} colis</span>
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
              <p className="text-xs text-slate-400">Vues, CTR et temps moyen — données réelles de vos visiteurs</p>
            </div>
          </div>
          <Link href="/admin/products" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
            <span>Gérer le catalogue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {productsList.map((prod) => {
            const isCopied = copiedSlug === prod.slug;
            // Analytics réelles pour ce produit
            const pa = productAnalytics.find(p => p.slug === prod.slug);
            const views = pa?.totalViews ?? null;
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

                {/* Analytics mini-row */}
                <div className="flex items-center gap-3 border-t border-slate-200/60 pt-3">
                  <div className="flex-1 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Vues</div>
                    {loading ? (
                      <div className="h-4 w-10 bg-slate-200 rounded animate-pulse mx-auto" />
                    ) : (
                      <div className="font-mono font-bold text-sm tabular-nums text-slate-900">
                        {views !== null ? new Intl.NumberFormat("fr-FR").format(views) : "—"}
                      </div>
                    )}
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex-1 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">CTR</div>
                    {loading ? (
                      <div className="h-4 w-10 bg-slate-200 rounded animate-pulse mx-auto" />
                    ) : (
                      <div className={`font-mono font-bold text-sm tabular-nums ${
                        ctr !== null && ctr > 0
                          ? ctr >= 10 ? "text-emerald-600" : ctr >= 5 ? "text-amber-600" : "text-rose-500"
                          : "text-slate-400"
                      }`}>
                        {ctr !== null && views !== null && views > 0 ? `${ctr.toFixed(1)}%` : "—"}
                      </div>
                    )}
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="flex-1 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Tps Moy.</div>
                    {loading ? (
                      <div className="h-4 w-12 bg-slate-200 rounded animate-pulse mx-auto" />
                    ) : (
                      <div className="font-mono font-bold text-sm tabular-nums text-slate-900">
                        {avgTime && views !== null && views > 0 ? avgTime : "—"}
                      </div>
                    )}
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
