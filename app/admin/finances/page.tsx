"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw,
  Calendar,
  DollarSign,
  Receipt,
  Truck,
  Package,
  Megaphone,
  Boxes,
  Users,
  PhoneCall,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Sparkles,
  PieChart,
  Layers,
  ArrowDownRight,
  X
} from "lucide-react";
import {
  ExpenseItem,
  SaleItem,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  fetchAllFinances,
  addExpense,
  removeExpense,
  addSale,
  removeSale,
} from "@/lib/financesStorage";
import { getAllOrders, OrderItem } from "@/lib/ordersStorage";
import { getAdminDashboardProducts, DEFAULT_CATALOG } from "@/lib/defaultCatalog";

type PeriodFilter = "today" | "yesterday" | "7d" | "30d" | "month" | "all";
type TabView = "overview" | "expenses" | "sales";

export default function AdminFinancesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [manualSales, setManualSales] = useState<SaleItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [includeDeliveredOrders, setIncludeDeliveredOrders] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [activeTab, setActiveTab] = useState<TabView>("overview");

  // Modales d'ajout
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Formulaire nouvelle dépense
  const [expenseForm, setExpenseForm] = useState<{
    date: string;
    category: ExpenseCategory;
    amount: string;
    product_slug: string;
    description: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    category: "ads",
    amount: "",
    product_slug: "",
    description: "",
  });

  // Formulaire nouvelle vente manuelle
  const [saleForm, setSaleForm] = useState<{
    date: string;
    amount: string;
    product_slug: string;
    quantity: number;
    customer_name: string;
    city: string;
    notes: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    product_slug: "game-stick-4k",
    quantity: 1,
    customer_name: "",
    city: "Cotonou",
    notes: "",
  });

  const [hasTable, setHasTable] = useState<boolean>(true);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const productsList = useMemo(() => getAdminDashboardProducts(), []);

  // Formatage des montants
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

  // Chargement des données
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [financesData, allOrders] = await Promise.all([
        fetchAllFinances(),
        getAllOrders(),
      ]);
      setExpenses(financesData.expenses);
      setManualSales(financesData.sales);
      setOrders(allOrders);
    } catch (e) {
      console.error("Erreur chargement finances:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Définition des dates pour les filtres
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgoDate.toISOString().slice(0, 10);

  const thirtyDaysAgoDate = new Date();
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgoDate.toISOString().slice(0, 10);

  const currentMonthPrefix = todayStr.slice(0, 7); // YYYY-MM

  // Filtrage par date helper
  const isInPeriod = (dateStr: string) => {
    if (!dateStr) return false;
    const d = dateStr.slice(0, 10);
    switch (period) {
      case "today":
        return d === todayStr;
      case "yesterday":
        return d === yesterdayStr;
      case "7d":
        return d >= sevenDaysAgoStr && d <= todayStr;
      case "30d":
        return d >= thirtyDaysAgoStr && d <= todayStr;
      case "month":
        return d.startsWith(currentMonthPrefix);
      case "all":
      default:
        return true;
    }
  };

  // 1. Ventes issues des commandes livrées réelles du site (status === 'delivered')
  const deliveredOrdersSales = useMemo<SaleItem[]>(() => {
    if (!includeDeliveredOrders) return [];
    return orders
      .filter((o) => {
        const s = (o.status || "").toLowerCase();
        return s === "delivered" || s.includes("livr") || s === "completed";
      })
      .map((o) => {
        const d = (o.created_at || todayStr).slice(0, 10);
        return {
          id: `order_${o.order_number || o.id}`,
          date: d,
          amount: Number(o.total_amount ?? o.price) || 0,
          product_slug: o.product_slug || "umei",
          product_title: o.product_title || o.product_slug,
          quantity: Number(o.quantity) || 1,
          order_number: o.order_number,
          customer_name: o.customer_name,
          city: o.city || o.shipping_city,
          notes: "Commande site livrée & encaissée",
          is_delivered_order: true,
          created_at: o.created_at || new Date().toISOString(),
        };
      });
  }, [orders, includeDeliveredOrders, todayStr]);

  // Toutes les ventes combinées (Manuelles + Commandes Livrées)
  const allSalesCombined = useMemo(() => {
    return [...deliveredOrdersSales, ...manualSales];
  }, [deliveredOrdersSales, manualSales]);

  // Ventes et Dépenses filtrées selon la période active
  const filteredSales = useMemo(() => {
    return allSalesCombined.filter((s) => isInPeriod(s.date));
  }, [allSalesCombined, period]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => isInPeriod(e.date));
  }, [expenses, period]);

  // Métriques financières globales
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  }, [filteredSales]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const netProfit = totalRevenue - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Dépenses Pub Meta/TikTok
  const adsExpenses = useMemo(() => {
    return filteredExpenses
      .filter((e) => e.category === "ads")
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const roas = adsExpenses > 0 ? totalRevenue / adsExpenses : 0;

  // Répartition des dépenses par catégorie
  const expensesByCategory = useMemo(() => {
    const acc: Record<ExpenseCategory, number> = {
      ads: 0,
      cogs: 0,
      delivery: 0,
      telecom: 0,
      packaging: 0,
      salary: 0,
      other: 0,
    };
    filteredExpenses.forEach((e) => {
      const cat = (e.category in acc ? e.category : "other") as ExpenseCategory;
      acc[cat] = (acc[cat] || 0) + (Number(e.amount) || 0);
    });
    return acc;
  }, [filteredExpenses]);

  // Bilan journalier agrégé
  const dailyBreakdown = useMemo(() => {
    const map: Record<string, { date: string; sales: number; expenses: number; ads: number; salesCount: number; expCount: number }> = {};

    filteredSales.forEach((s) => {
      const d = s.date || todayStr;
      if (!map[d]) {
        map[d] = { date: d, sales: 0, expenses: 0, ads: 0, salesCount: 0, expCount: 0 };
      }
      map[d].sales += Number(s.amount) || 0;
      map[d].salesCount += 1;
    });

    filteredExpenses.forEach((e) => {
      const d = e.date || todayStr;
      if (!map[d]) {
        map[d] = { date: d, sales: 0, expenses: 0, ads: 0, salesCount: 0, expCount: 0 };
      }
      map[d].expenses += Number(e.amount) || 0;
      map[d].expCount += 1;
      if (e.category === "ads") {
        map[d].ads += Number(e.amount) || 0;
      }
    });

    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredSales, filteredExpenses, todayStr]);

  // Soumission nouvelle dépense
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.round(Number(expenseForm.amount) || 0);
    if (amountNum <= 0) {
      alert("Veuillez saisir un montant valide supérieur à 0 FCFA");
      return;
    }

    const created = await addExpense({
      date: expenseForm.date || todayStr,
      category: expenseForm.category,
      amount: amountNum,
      product_slug: expenseForm.product_slug || undefined,
      description: expenseForm.description.trim() || EXPENSE_CATEGORIES[expenseForm.category].label,
    });

    setExpenses((prev) => [created, ...prev]);
    setShowExpenseModal(false);
    setExpenseForm({
      date: todayStr,
      category: "ads",
      amount: "",
      product_slug: "",
      description: "",
    });
  };

  // Soumission nouvelle vente manuelle
  const handleAddSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.round(Number(saleForm.amount) || 0);
    if (amountNum <= 0) {
      alert("Veuillez saisir un montant valide supérieur à 0 FCFA");
      return;
    }

    const productMatch = productsList.find((p) => p.slug === saleForm.product_slug);

    const created = await addSale({
      date: saleForm.date || todayStr,
      amount: amountNum,
      product_slug: saleForm.product_slug,
      product_title: productMatch?.title || saleForm.product_slug,
      quantity: Number(saleForm.quantity) || 1,
      customer_name: saleForm.customer_name.trim() || undefined,
      city: saleForm.city.trim() || "Cotonou",
      notes: saleForm.notes.trim() || "Vente directe enregistrée",
    });

    setManualSales((prev) => [created, ...prev]);
    setShowSaleModal(false);
    setSaleForm({
      date: todayStr,
      amount: "",
      product_slug: "game-stick-4k",
      quantity: 1,
      customer_name: "",
      city: "Cotonou",
      notes: "",
    });
  };

  // Suppression dépense
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cette dépense ?")) return;
    await removeExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Suppression vente manuelle
  const handleDeleteSale = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cette vente manuelle ?")) return;
    await removeSale(id);
    setManualSales((prev) => prev.filter((s) => s.id !== id));
  };

  // Export CSV
  const handleExportCsv = () => {
    const rows = [
      ["Type", "Date", "Catégorie / Produit", "Détail / Client", "Montant (FCFA)"],
      ...filteredSales.map((s) => [
        "VENTE RÉELLE",
        s.date,
        s.product_title || s.product_slug || "Vente",
        s.customer_name || s.order_number || s.notes || "Client",
        String(s.amount),
      ]),
      ...filteredExpenses.map((e) => [
        "DÉPENSE",
        e.date,
        EXPENSE_CATEGORIES[e.category]?.label || e.category,
        e.description || e.product_slug || "Charge",
        `-${e.amount}`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `isivente-finances-${period}-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySql = () => {
    const sql = `CREATE TABLE IF NOT EXISTS public.finances (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    product_slug TEXT,
    description TEXT,
    order_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon all on finances" ON public.finances FOR ALL USING (true) WITH CHECK (true);`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* ── EN-TÊTE PRINCIPAL : TITRE & BOUTONS D'ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Wallet className="w-5 h-5 stroke-[2]" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Finances & Rentabilité Réelle
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Suivi au franc près : Chiffre d'affaires encaissé, dépenses réelles et bénéfice net
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'actions rapides */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Ajouter Dépense</span>
          </button>

          <button
            onClick={() => setShowSaleModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Ajouter Vente</span>
          </button>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Exporter en CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── BARRE DE SÉLECTION DE PÉRIODE & OPTIONS DE SYNCHRO ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Sélecteur de période */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Période :
          </span>
          {(
            [
              { id: "today", label: "Aujourd'hui" },
              { id: "yesterday", label: "Hier" },
              { id: "7d", label: "7 jours" },
              { id: "month", label: "Ce mois" },
              { id: "30d", label: "30 jours" },
              { id: "all", label: "Tout l'historique" },
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPeriod(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                period === btn.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Toggle Synchronisation Commandes Livrées du Site */}
        <div className="flex items-center gap-2 px-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={includeDeliveredOrders}
              onChange={(e) => setIncludeDeliveredOrders(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <span>Inclure automatiquement les commandes livrées du site ({deliveredOrdersSales.length} encaissées)</span>
          </label>
        </div>
      </div>

      {/* ── 4 CARTES KPI MAJEURES (CHIC & TACTILE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : VENTES RÉELLES (CA ENCAISSÉ) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventes Réelles (Encaissé)</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {fmt(totalRevenue)} <span className="text-sm font-bold text-slate-500">FCFA</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{filteredSales.length} encaissement(s) confirmé(s)</span>
            </div>
          </div>
        </div>

        {/* KPI 2 : DÉPENSES RÉELLES */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dépenses Réelles</span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-600">
              {fmt(totalExpenses)} <span className="text-sm font-bold text-slate-500">FCFA</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Dont <strong>{fmt(adsExpenses)} F</strong> en publicité Meta/TikTok</span>
            </div>
          </div>
        </div>

        {/* KPI 3 : BÉNÉFICE NET RÉEL (PROFIT) */}
        <div className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between relative overflow-hidden transition-all ${
          netProfit >= 0
            ? "bg-emerald-950 text-white border-emerald-900"
            : "bg-rose-950 text-white border-rose-900"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200/90">Bénéfice Net Réel</span>
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
              netProfit >= 0 ? "bg-emerald-800" : "bg-rose-800"
            }`}>
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {netProfit >= 0 ? "+" : ""}{fmt(netProfit)} <span className="text-sm font-medium text-slate-300">FCFA</span>
            </div>
            <div className="text-xs mt-1 flex items-center gap-1.5 opacity-90">
              <span>{netProfit >= 0 ? "🟢 Activité Bénéficiaire" : "🔴 Déficit sur la période"}</span>
            </div>
          </div>
        </div>

        {/* KPI 4 : MARGE NETTE & ROAS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marge & ROAS Réel</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieChart className="w-4 h-4 stroke-[2]" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                {netMargin.toFixed(1)}%
              </span>
              <span className="text-xs font-bold text-slate-500">Marge Nette</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span>ROAS Réel : <strong className="text-slate-900">{roas > 0 ? `${roas.toFixed(2)}x` : "—"}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* ── VENTILATION DES DÉPENSES PAR CATÉGORIE ── */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Où part votre argent ? (Ventilation par poste de dépense)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Total : {fmt(totalExpenses)} FCFA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((catKey) => {
            const cat = EXPENSE_CATEGORIES[catKey];
            const amount = expensesByCategory[catKey] || 0;
            const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

            return (
              <div
                key={catKey}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 truncate">{cat.label}</span>
                  <span className="font-mono font-bold text-slate-900">{fmt(amount)} F</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right font-medium">
                    {pct.toFixed(1)}% du total
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SOUS-ONGLETS DE NAVIGATION DU DASHBOARD ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          📊 Bilan Journalier ({dailyBreakdown.length} jours)
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "expenses"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          💸 Toutes les Dépenses ({filteredExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "sales"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          🛒 Toutes les Ventes Réelles ({filteredSales.length})
        </button>
      </div>

      {/* ══════════════ TAB 1 : BILAN JOURNALIER AGRÉGÉ ══════════════ */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Historique quotidien des entrées / sorties
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Bénéfice cumulé : <strong>{fmt(netProfit)} FCFA</strong>
            </span>
          </div>

          {dailyBreakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucune opération enregistrée pour la période sélectionnée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Ventes Réelles</th>
                    <th className="py-3 px-4">Dépenses Réelles</th>
                    <th className="py-3 px-4">Dépenses Pub</th>
                    <th className="py-3 px-4">Bénéfice Net</th>
                    <th className="py-3 px-4 text-right">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyBreakdown.map((row) => {
                    const profit = row.sales - row.expenses;
                    const dayRoas = row.ads > 0 ? row.sales / row.ads : 0;
                    return (
                      <tr key={row.date} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {row.date}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          +{fmt(row.sales)} F <span className="text-[10px] text-slate-400">({row.salesCount})</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">
                          -{fmt(row.expenses)} F <span className="text-[10px] text-slate-400">({row.expCount})</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {row.ads > 0 ? `${fmt(row.ads)} F` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono font-black px-2 py-0.5 rounded-lg text-xs ${
                              profit >= 0
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {profit >= 0 ? "+" : ""}{fmt(profit)} F
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {dayRoas > 0 ? `${dayRoas.toFixed(2)}x` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TAB 2 : TABLEAU DÉTAILLÉ DES DÉPENSES ══════════════ */}
      {activeTab === "expenses" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Journal des dépenses engagées ({filteredExpenses.length})
            </h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              + Ajouter une dépense
            </button>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucune dépense enregistrée pour cette période.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Poste / Catégorie</th>
                    <th className="py-3 px-4">Description / Note</th>
                    <th className="py-3 px-4">Produit lié</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => {
                    const catMeta = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.other;
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                          {exp.date}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block"
                            style={{
                              backgroundColor: catMeta.badgeBg,
                              color: catMeta.badgeText,
                            }}
                          >
                            {catMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {exp.description}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {exp.product_slug || "Général"}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-rose-600 whitespace-nowrap">
                          -{fmt(exp.amount)} FCFA
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer cette dépense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TAB 3 : TABLEAU DÉTAILLÉ DES VENTES RÉELLES ══════════════ */}
      {activeTab === "sales" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Journal des ventes et encaissements réels ({filteredSales.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Combine les commandes livrées du site et vos encaissements manuels
              </p>
            </div>
            <button
              onClick={() => setShowSaleModal(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              + Ajouter une vente manuelle
            </button>
          </div>

          {filteredSales.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucune vente enregistrée pour cette période.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Client / Destination</th>
                    <th className="py-3 px-4">Origine</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {sale.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {sale.product_title || sale.product_slug}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {sale.customer_name || "Client"} {sale.city ? `(${sale.city})` : ""}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {sale.is_delivered_order ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Commande site #{sale.order_number || ""}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Saisie manuelle directe
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-emerald-700 whitespace-nowrap">
                        +{fmt(sale.amount)} FCFA
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!sale.is_delivered_order && (
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer cette vente manuelle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODALE : NOUVELLE DÉPENSE ── */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-slate-900">Enregistrer une Dépense Réelle</h3>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catégorie de charge</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, category: e.target.value as ExpenseCategory }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white"
                >
                  {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {EXPENSE_CATEGORIES[c].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Montant réel (FCFA)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="Ex: 15000"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Produit associé (Optionnel)</label>
                <select
                  value={expenseForm.product_slug}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, product_slug: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white"
                >
                  <option value="">Frais Général / Tout le catalogue</option>
                  {productsList.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description / Note explicative</label>
                <input
                  type="text"
                  placeholder="Ex: Campagne Meta Ads Game Stick ou 3 colis Calavi"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Enregistrer la dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALE : NOUVELLE VENTE MANUELLE ── */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-slate-900">Enregistrer une Vente Réelle</h3>
              </div>
              <button
                onClick={() => setShowSaleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSaleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Date d'encaissement</label>
                <input
                  type="date"
                  required
                  value={saleForm.date}
                  onChange={(e) => setSaleForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Produit vendu</label>
                <select
                  value={saleForm.product_slug}
                  onChange={(e) => setSaleForm((p) => ({ ...p, product_slug: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white"
                >
                  {productsList.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Montant Encaissé (FCFA)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    placeholder="Ex: 22900"
                    value={saleForm.amount}
                    onChange={(e) => setSaleForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quantité</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm((p) => ({ ...p, quantity: Number(e.target.value) || 1 }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nom du client ou Quartier</label>
                <input
                  type="text"
                  placeholder="Ex: Paul Dossou (Fidjrossè)"
                  value={saleForm.customer_name}
                  onChange={(e) => setSaleForm((p) => ({ ...p, customer_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Canal de vente</label>
                <input
                  type="text"
                  placeholder="Ex: Vente directe WhatsApp ou remise en main propre"
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Enregistrer la vente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

