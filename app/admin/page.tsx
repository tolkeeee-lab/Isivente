"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  deliveredOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    deliveredOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase.from("orders").select("status, total_amount");
      if (data) {
        let pending = 0;
        let delivered = 0;
        let revenue = 0;

        data.forEach(order => {
          if (order.status === 'pending') pending++;
          if (order.status === 'delivered') delivered++;
          // Calculate potential revenue from all non-cancelled orders for COD
          if (order.status !== 'cancelled') {
            revenue += order.total_amount || 0;
          }
        });

        setStats({
          totalOrders: data.length,
          pendingOrders: pending,
          revenue,
          deliveredOrders: delivered
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Chargement des statistiques...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Vue d'ensemble</h1>
        <p className="text-ink-soft font-medium">Suivez l'activité de vos ventes et livraisons.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-ink-soft">Chiffre d'affaires (Potentiel)</CardTitle>
            <TrendingUp className="w-5 h-5 text-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{stats.revenue.toLocaleString('fr-FR')} F</div>
            <p className="text-xs text-ink-soft font-medium mt-1">Généré par les commandes non-annulées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-ink-soft">Commandes Totales</CardTitle>
            <ShoppingBag className="w-5 h-5 text-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-ink-soft">En attente de traitement</CardTitle>
            <Clock className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-orange-600">{stats.pendingOrders}</div>
            <p className="text-xs text-ink-soft font-medium mt-1">À confirmer et expédier</p>
          </CardContent>
        </Card>

        <Card className="border-mint-deep/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-ink-soft">Livrées (COD Encaissé)</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-mint-deep" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-mint-deep">{stats.deliveredOrders}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
