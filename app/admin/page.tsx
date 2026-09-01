"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, OrderItem } from "@/lib/ordersStorage";
import { getAnalyticsStats, AnalyticsStats } from "@/lib/analyticsStorage";
import { TrendingUp, ShoppingBag, Clock, Truck, MousePointerClick, Timer, Eye, Copy, Check, ExternalLink, Package } from "lucide-react";

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
    formattedAvgTime: "0s"
  });
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const productsList = [
    {
      title: "Brosse Démêlante Vapeur Uméi 3-en-1",
      slug: "umei",
      price: 14900,
      image: "/images/umei-hero-real.jpg"
    }
  ];

  useEffect(() => {
    async function fetchData() {
      const allOrders = await getAllOrders();
      const analyticsData = await getAnalyticsStats();
      setAnalytics(analyticsData);
      
      let pending = 0;
      let shipped = 0;
      let delivered = 0;
      let cancelled = 0;
      let revenue = 0;

      allOrders.forEach(order => {
        if (order.status === 'pending') pending++;
        if (order.status === 'shipped') shipped++;
        if (order.status === 'delivered') delivered++;
        if (order.status === 'cancelled') cancelled++;
        
        if (order.status === 'delivered' || order.status === 'shipped' || order.status === 'pending') {
          revenue += order.total_amount || 0;
        }
      });

      setStats({
        totalOrders: allOrders.length,
        pendingOrders: pending,
        shippedOrders: shipped,
        deliveredOrders: delivered,
        cancelledOrders: cancelled,
        revenue
      });

      setRecentOrders(allOrders.slice(0, 5));
      setLoading(false);
    }
    fetchData();
  }, []);

  const copyProductLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-3xl mb-1 text-premium-dark">Vue d'ensemble</h1>
        <p className="text-gray-500 font-light text-sm">Suivez l'activité des ventes, l'engagement et vos liens de produits.</p>
      </div>

      {/* KPI GRID - DÉFILEMENT HORIZONTAL REORGANISÉ SUR MOBILE */}
      <div>
        <div className="flex items-center justify-between mb-3 md:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">📊 Métriques (Glisser horizontalement)</span>
          <span className="text-[11px] text-purple-600 font-semibold">← Glisser →</span>
        </div>

        <div className="flex overflow-x-auto snap-x md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 pb-3 md:pb-0 scrollbar-none">
          
          {/* 1. CHIFFRE D'AFFAIRES */}
          <div className="min-w-[260px] sm:min-w-[280px] snap-center bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Chiffre d'affaires</h3>
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-premium-dark">{stats.revenue.toLocaleString('fr-FR')} F</div>
            <p className="text-[11px] text-gray-400 mt-1">Encaissé & en livraison</p>
          </div>

          {/* 2. COMMANDES TOTALES */}
          <div className="min-w-[260px] sm:min-w-[280px] snap-center bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Commandes Totales</h3>
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-purple-700" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-premium-dark">{stats.totalOrders}</div>
            <p className="text-[11px] text-purple-600 font-medium mt-1">{stats.pendingOrders} à confirmer</p>
          </div>

          {/* 3. TAUX DE CLICS (CTR) */}
          <div className="min-w-[260px] sm:min-w-[280px] snap-center bg-white p-5 rounded-3xl border border-purple-100 shadow-[0_8px_30px_rgba(139,111,224,0.08)] flex flex-col justify-between bg-gradient-to-br from-white to-purple-50/40">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-purple-900 font-bold text-xs sm:text-sm">Taux de Clics (CTR)</h3>
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4 text-purple-700" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-purple-900">
              {analytics.ctr}%
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {analytics.totalClicks} clics sur {analytics.totalViews} visites
            </p>
          </div>

          {/* 4. TEMPS MOYEN PASSÉ */}
          <div className="min-w-[260px] sm:min-w-[280px] snap-center bg-white p-5 rounded-3xl border border-purple-100 shadow-[0_8px_30px_rgba(139,111,224,0.08)] flex flex-col justify-between bg-gradient-to-br from-white to-pink-50/30">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-purple-900 font-bold text-xs sm:text-sm">Temps Moyen Passé</h3>
              <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                <Timer className="w-4 h-4 text-pink-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-pink-900">
              {analytics.formattedAvgTime}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Durée moyenne par visiteur
            </p>
          </div>

        </div>
      </div>

      {/* LIENS DIRECTS DE PRODUITS AVEC BOUTON COPIER */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-display font-semibold text-lg text-premium-dark flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-700" />
            <span>Vos Liens Produits Directs (Option Copier)</span>
          </h2>
          <a href="/admin/products" className="text-xs font-bold text-purple-700 hover:underline">
            Voir le catalogue
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {productsList.map((prod) => {
            const isCopied = copiedSlug === prod.slug;
            const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${prod.slug}` : `/p/${prod.slug}`;

            return (
              <div key={prod.slug} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={prod.image} alt={prod.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-purple-100" />
                  <div className="overflow-hidden">
                    <div className="font-bold text-xs sm:text-sm text-premium-dark truncate">{prod.title}</div>
                    <div className="text-[11px] font-mono text-purple-900 truncate">/p/{prod.slug}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyProductLink(prod.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isCopied ? "bg-emerald-600 text-white" : "bg-white text-purple-800 border border-purple-200 hover:bg-purple-100 shadow-sm"
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "Copié !" : "Copier"}</span>
                  </button>

                  <a
                    href={`/p/${prod.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-800 hover:bg-purple-100 shadow-sm"
                    title="Voir la page client"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-display font-semibold text-xl text-premium-dark">Dernières commandes</h2>
          <a href="/admin/orders" className="text-sm font-bold text-purple-700 hover:underline">Voir tout</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Ville</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucune commande récente</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id || Math.random()} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-premium-dark">{order.customer_name}</td>
                    <td className="px-6 py-4 text-gray-500">{order.shipping_city || order.city}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at || Date.now()).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 font-extrabold text-premium-dark">{(order.total_amount || 0).toLocaleString('fr-FR')} F</td>
                    <td className="px-6 py-4">
                      {order.status === 'pending' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">En attente</span>}
                      {order.status === 'shipped' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">En cours</span>}
                      {order.status === 'delivered' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Livrée</span>}
                      {order.status === 'cancelled' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Annulée</span>}
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
