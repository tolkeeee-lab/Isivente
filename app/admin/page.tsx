"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, OrderItem } from "@/lib/ordersStorage";
import { ShoppingBag, TrendingUp, Clock, CheckCircle2, Package, Truck, XCircle } from "lucide-react";

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
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const allOrders = await getAllOrders();
      
      if (allOrders) {
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
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-premium-accent/20 border-t-premium-accent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-semibold text-3xl mb-2 text-premium-dark">Vue d'ensemble</h1>
        <p className="text-gray-500 font-light">Suivez l'activité de vos ventes et livraisons.</p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Chiffre d'affaires</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-premium-dark">{stats.revenue.toLocaleString('fr-FR')} F</div>
          <p className="text-xs text-gray-400 mt-2">Encaissé et en cours de livraison</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Commandes Totales</h3>
            <div className="w-10 h-10 rounded-full bg-premium-bg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-premium-accent" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-premium-dark">{stats.totalOrders}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium text-sm">En attente</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-premium-dark">{stats.pendingOrders}</div>
          <p className="text-xs text-orange-500 font-medium mt-2">À confirmer</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium text-sm">En cours / Livrées</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-premium-dark">{stats.shippedOrders + stats.deliveredOrders}</div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-display font-semibold text-xl text-premium-dark">Dernières commandes</h2>
          <a href="/admin/orders" className="text-sm font-medium text-premium-accent hover:underline">Voir tout</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Ville</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Montant</th>
                <th className="px-6 py-4 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucune commande récente</td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-premium-dark">{order.customer_name}</td>
                    <td className="px-6 py-4 text-gray-500">{order.shipping_city}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 font-medium text-premium-dark">{order.total_amount.toLocaleString('fr-FR')} F</td>
                    <td className="px-6 py-4">
                      {order.status === 'pending' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">En attente</span>}
                      {order.status === 'shipped' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">En cours</span>}
                      {order.status === 'delivered' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Livrée</span>}
                      {order.status === 'cancelled' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Annulée</span>}
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
