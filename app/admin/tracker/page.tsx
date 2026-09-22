"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart2,
  TrendingUp,
  ShoppingCart,
  Target,
  Megaphone,
  Image as ImageIcon,
  Globe,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";

/* ─── Types ─── */
interface OrderRow {
  id: string;
  order_number: string;
  product_slug: string;
  total_amount: number;
  status: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
}

interface CampaignStat {
  key: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  orders: number;
  confirmed: number;
  revenue: number;
  conversionRate: number;
}

/* ─── Helpers ─── */
const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n));

const STATUS_CONFIRMED = new Set([
  "confirmed", "shipped", "delivered", "paid",
]);

const sourceColor = (s: string | null) => {
  switch ((s || "").toLowerCase()) {
    case "meta":       return "bg-blue-100 text-blue-700";
    case "whatsapp":   return "bg-emerald-100 text-emerald-700";
    case "tiktok":     return "bg-pink-100 text-pink-700";
    case "google":     return "bg-amber-100 text-amber-700";
    default:           return "bg-slate-100 text-slate-600";
  }
};

/* ─── Main Page ─── */
export default function TrackerPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterCampaign, setFilterCampaign] = useState<string>("all");
  const [filterDays, setFilterDays] = useState<number>(30);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchOrders = async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - filterDays);

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, product_slug, total_amount, status, created_at, utm_source, utm_medium, utm_campaign, utm_content"
      )
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as OrderRow[]);
    }
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => { fetchOrders(); }, [filterDays]);

  /* ─── Derived stats ─── */
  const allSources = useMemo(() => {
    const s = new Set(orders.map((o) => o.utm_source || "organic"));
    return ["all", ...Array.from(s)];
  }, [orders]);

  const allCampaigns = useMemo(() => {
    const c = new Set(
      orders
        .filter((o) => filterSource === "all" || (o.utm_source || "organic") === filterSource)
        .map((o) => o.utm_campaign || "—")
    );
    return ["all", ...Array.from(c)];
  }, [orders, filterSource]);

  const filteredOrders = useMemo(() =>
    orders.filter((o) => {
      const src = o.utm_source || "organic";
      const camp = o.utm_campaign || "—";
      if (filterSource !== "all" && src !== filterSource) return false;
      if (filterCampaign !== "all" && camp !== filterCampaign) return false;
      return true;
    }),
    [orders, filterSource, filterCampaign]
  );

  /* Build campaign grid */
  const campaignStats = useMemo(() => {
    const map = new Map<string, CampaignStat>();
    for (const o of filteredOrders) {
      const src = o.utm_source || "organic";
      const med = o.utm_medium || "—";
      const camp = o.utm_campaign || "—";
      const cont = o.utm_content || "—";
      const key = `${src}||${camp}||${cont}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          utm_source: src,
          utm_medium: med,
          utm_campaign: camp,
          utm_content: cont,
          orders: 0,
          confirmed: 0,
          revenue: 0,
          conversionRate: 0,
        });
      }
      const stat = map.get(key)!;
      stat.orders++;
      if (STATUS_CONFIRMED.has(o.status)) {
        stat.confirmed++;
        stat.revenue += o.total_amount || 0;
      }
    }
    const arr = Array.from(map.values()).map((s) => ({
      ...s,
      conversionRate: s.orders > 0 ? (s.confirmed / s.orders) * 100 : 0,
    }));
    return arr.sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  /* KPIs globaux */
  const kpis = useMemo(() => {
    const total = filteredOrders.length;
    const confirmed = filteredOrders.filter((o) => STATUS_CONFIRMED.has(o.status)).length;
    const revenue = filteredOrders
      .filter((o) => STATUS_CONFIRMED.has(o.status))
      .reduce((s, o) => s + (o.total_amount || 0), 0);
    const adOrders = filteredOrders.filter((o) => o.utm_source).length;
    return { total, confirmed, revenue, adOrders };
  }, [filteredOrders]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tracker Publicité
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Attribution UTM · commandes générées par source &amp; créatif
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 active:scale-[0.97] transition-all duration-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 stroke-[1.75] ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-wrap gap-3">
        {/* Période */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Période</span>
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDays(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-100 active:scale-[0.97] ${
                filterDays === d
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {d}j
            </button>
          ))}
        </div>

        {/* Source */}
        <select
          value={filterSource}
          onChange={(e) => { setFilterSource(e.target.value); setFilterCampaign("all"); }}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        >
          {allSources.map((s) => (
            <option key={s} value={s}>{s === "all" ? "Toutes les sources" : s}</option>
          ))}
        </select>

        {/* Campagne */}
        <select
          value={filterCampaign}
          onChange={(e) => setFilterCampaign(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        >
          {allCampaigns.map((c) => (
            <option key={c} value={c}>{c === "all" ? "Toutes les campagnes" : c}</option>
          ))}
        </select>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Commandes totales",
            value: kpis.total,
            icon: ShoppingCart,
            color: "text-slate-700",
            bg: "bg-slate-50",
            format: (v: number) => String(v),
          },
          {
            label: "Commandes confirmées",
            value: kpis.confirmed,
            icon: Target,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            format: (v: number) => String(v),
          },
          {
            label: "CA confirmé",
            value: kpis.revenue,
            icon: TrendingUp,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            format: (v: number) => `${fmt(v)} F`,
          },
          {
            label: "Via publicité",
            value: kpis.adOrders,
            icon: Megaphone,
            color: "text-amber-600",
            bg: "bg-amber-50",
            format: (v: number) => String(v),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(0,0,0,0.06)]"
          >
            <div className={`w-8 h-8 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 stroke-[1.75] ${card.color}`} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className={`text-2xl font-bold font-mono tabular-nums tracking-tight mt-0.5 ${card.color}`}>
              {loading ? "…" : card.format(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Campaign Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <BarChart2 className="w-4 h-4 text-slate-400 stroke-[1.75]" />
          <span className="text-sm font-bold text-slate-900">Performance par Créatif</span>
          <span className="ml-auto text-[11px] font-semibold text-slate-400 font-mono tabular-nums">
            {campaignStats.length} lignes
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>
        ) : campaignStats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm font-semibold">Aucune commande avec UTM sur cette période</p>
            <p className="text-slate-400 text-xs mt-1">
              Lancez une pub avec <code className="bg-slate-100 px-1 rounded">?utm_source=meta&amp;utm_campaign=…</code>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Source", "Campagne", "Créatif", "Commandes", "Confirmées", "Taux", "CA Généré"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaignStats.map((stat, idx) => (
                  <React.Fragment key={stat.key}>
                    <tr
                      className="hover:bg-slate-50/60 transition-colors duration-75 cursor-pointer"
                      style={{ animationDelay: `${idx * 35}ms` }}
                      onClick={() =>
                        setExpandedRow(expandedRow === stat.key ? null : stat.key)
                      }
                    >
                      {/* Source badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${sourceColor(stat.utm_source)}`}>
                          {stat.utm_source}
                        </span>
                      </td>
                      {/* Campagne */}
                      <td className="px-4 py-3 text-slate-700 font-semibold whitespace-nowrap max-w-[160px] truncate">
                        {stat.utm_campaign}
                      </td>
                      {/* Créatif */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <ImageIcon className="w-3 h-3 text-slate-400 stroke-[1.75] shrink-0" />
                          <span className="max-w-[140px] truncate">{stat.utm_content}</span>
                        </span>
                      </td>
                      {/* Commandes */}
                      <td className="px-4 py-3 font-mono tabular-nums font-semibold text-slate-700">
                        {stat.orders}
                      </td>
                      {/* Confirmées */}
                      <td className="px-4 py-3 font-mono tabular-nums font-semibold text-emerald-600">
                        {stat.confirmed}
                      </td>
                      {/* Taux */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(stat.conversionRate, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-slate-600 font-semibold">
                            {stat.conversionRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      {/* CA */}
                      <td className="px-4 py-3 font-mono tabular-nums font-bold text-indigo-600 whitespace-nowrap">
                        {fmt(stat.revenue)} F
                      </td>
                      {/* Expand */}
                      <td className="px-4 py-3 text-slate-400">
                        {expandedRow === stat.key
                          ? <ChevronUp className="w-4 h-4 stroke-[1.75]" />
                          : <ChevronDown className="w-4 h-4 stroke-[1.75]" />
                        }
                      </td>
                    </tr>

                    {/* Expanded: list of individual orders for this creative */}
                    {expandedRow === stat.key && (
                      <tr>
                        <td colSpan={8} className="px-4 pb-3 bg-slate-50/80">
                          <div className="rounded-xl border border-slate-200 overflow-hidden mt-1">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-slate-100/80 border-b border-slate-200">
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">N° CMD</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Produit</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Statut</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Montant</th>
                                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredOrders
                                  .filter(
                                    (o) =>
                                      (o.utm_source || "organic") === stat.utm_source &&
                                      (o.utm_campaign || "—") === stat.utm_campaign &&
                                      (o.utm_content || "—") === stat.utm_content
                                  )
                                  .slice(0, 20)
                                  .map((o) => (
                                    <tr key={o.id} className="hover:bg-slate-50 transition-colors duration-75">
                                      <td className="px-3 py-2 font-mono tabular-nums text-slate-600 font-semibold">{o.order_number}</td>
                                      <td className="px-3 py-2 text-slate-600">{o.product_slug}</td>
                                      <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          STATUS_CONFIRMED.has(o.status)
                                            ? "bg-emerald-100 text-emerald-700"
                                            : o.status === "pending"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-slate-100 text-slate-600"
                                        }`}>
                                          {o.status}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 font-mono tabular-nums font-bold text-indigo-600">{fmt(o.total_amount)} F</td>
                                      <td className="px-3 py-2 text-slate-400">
                                        {new Date(o.created_at).toLocaleDateString("fr-FR", {
                                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                                        })}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-slate-400">
        Dernière actualisation : {lastRefresh.toLocaleTimeString("fr-FR")} ·{" "}
        {orders.length} commandes chargées
      </p>
    </div>
  );
}
