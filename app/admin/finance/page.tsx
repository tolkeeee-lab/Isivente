"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Package, 
  Layers, 
  Sparkles, 
  Calculator, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { getAllOrders, OrderItem } from "@/lib/ordersStorage";
import { 
  getFinanceSettings, 
  saveFinanceSettings, 
  FinanceSettings, 
  SubscriptionItem,
  DEFAULT_FINANCE_SETTINGS 
} from "@/lib/financeStorage";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

export default function FinanceDashboardPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"all" | "today" | "week" | "month">("all");
  const [settings, setSettings] = useState<FinanceSettings>(DEFAULT_FINANCE_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Nouvel abonnement modal / form state
  const [newSubName, setNewSubName] = useState("");
  const [newSubCategory, setNewSubCategory] = useState<SubscriptionItem["category"]>("logiciel");
  const [newSubAmount, setNewSubAmount] = useState<number>(10000);
  const [showAddSub, setShowAddSub] = useState(false);

  // Charger les paramètres et les commandes
  const fetchData = async () => {
    setLoading(true);
    const [allOrders, currentSettings] = await Promise.all([
      getAllOrders(),
      Promise.resolve(getFinanceSettings()),
    ]);
    setOrders(allOrders);
    setSettings(currentSettings);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrer les commandes selon la période
  const filteredOrders = useMemo(() => {
    if (timeframe === "all") return orders;
    const now = new Date();
    return orders.filter((o) => {
      const orderDate = new Date(o.created_at || Date.now());
      if (timeframe === "today") {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeframe === "week") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= sevenDaysAgo;
      }
      if (timeframe === "month") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= thirtyDaysAgo;
      }
      return true;
    });
  }, [orders, timeframe]);

  // Prorata des abonnements selon la période
  const subscriptionCostForPeriod = useMemo(() => {
    const monthlyTotal = settings.subscriptions
      .filter((s) => s.active)
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    if (timeframe === "today") return Math.round(monthlyTotal / 30);
    if (timeframe === "week") return Math.round((monthlyTotal / 30) * 7);
    if (timeframe === "month" || timeframe === "all") return monthlyTotal;
    return monthlyTotal;
  }, [settings.subscriptions, timeframe]);

  // Calculs financiers globaux
  const calculations = useMemo(() => {
    let deliveredOrdersCount = 0;
    let shippedOrdersCount = 0;
    let pendingOrdersCount = 0;
    let cancelledOrdersCount = 0;

    let deliveredRevenue = 0;
    let shippedRevenue = 0;
    let pendingRevenue = 0;
    let totalRevenue = 0;

    let deliveredCogs = 0;
    let shippedCogs = 0;

    // Métriques par produit
    const productStats: Record<
      string,
      {
        slug: string;
        title: string;
        deliveredCount: number;
        shippedCount: number;
        deliveredRev: number;
        shippedRev: number;
        cogsUnit: number;
        totalCogs: number;
        deliveryFees: number;
        netProfit: number;
      }
    > = {};

    const productNames: Record<string, string> = {
      umei: "Brosse Démêlante Uméi 3-en-1",
      eraclean: "Purificateur EraClean™ Frigo & Auto",
      turbofan: "Ventilateur Ceinture TurboFan™ Max",
      peeler: "Éplucheur Automatique ChefPeel™",
      stabilisateur: "Stabilisateur Pro Z3 Zoom MagSafe",
      veilleuse: "Veilleuse Projecteur LED 3D FRIOSZ",
    };

    filteredOrders.forEach((order) => {
      const slug = (order.product_slug || "umei").toLowerCase();
      const amt = Number(order.total_amount || 0);
      const qty = Number(order.quantity || 1);
      const unitCogs = settings.productCogs[slug] ?? 4500;

      if (!productStats[slug]) {
        productStats[slug] = {
          slug,
          title: order.product_title || productNames[slug] || slug,
          deliveredCount: 0,
          shippedCount: 0,
          deliveredRev: 0,
          shippedRev: 0,
          cogsUnit: unitCogs,
          totalCogs: 0,
          deliveryFees: 0,
          netProfit: 0,
        };
      }

      if (order.status === "delivered") {
        deliveredOrdersCount++;
        deliveredRevenue += amt;
        totalRevenue += amt;
        const cogs = unitCogs * qty;
        deliveredCogs += cogs;

        productStats[slug].deliveredCount += qty;
        productStats[slug].deliveredRev += amt;
        productStats[slug].totalCogs += cogs;
        productStats[slug].deliveryFees += settings.deliveryCostPerSuccess;
      } else if (order.status === "shipped") {
        shippedOrdersCount++;
        shippedRevenue += amt;
        totalRevenue += amt;
        const cogs = unitCogs * qty;
        shippedCogs += cogs;

        productStats[slug].shippedCount += qty;
        productStats[slug].shippedRev += amt;
      } else if (order.status === "pending") {
        pendingOrdersCount++;
        pendingRevenue += amt;
        totalRevenue += amt;
      } else if (order.status === "cancelled") {
        cancelledOrdersCount++;
      }
    });

    // Calcul du profit net par produit (sur le livré)
    Object.values(productStats).forEach((p) => {
      p.netProfit = p.deliveredRev - p.totalCogs - p.deliveryFees;
    });

    // Coûts totaux
    const totalDeliverySuccessFees = deliveredOrdersCount * settings.deliveryCostPerSuccess;
    const totalDeliveryReturnFees = cancelledOrdersCount * settings.deliveryCostPerFailure;
    const totalLogisticsFees = totalDeliverySuccessFees + totalDeliveryReturnFees;

    const totalAdSpend = settings.adSpendTotal || 0;
    const totalSubscriptions = subscriptionCostForPeriod;

    // Bénéfice net encaissé = CA Livré - COGS Livré - Livraison Réussie - Frais Retours - Pub - Abonnements
    const netProfitDelivered =
      deliveredRevenue -
      deliveredCogs -
      totalLogisticsFees -
      totalAdSpend -
      totalSubscriptions;

    // Bénéfice projeté (si toutes les commandes en transit sont livrées avec succès)
    const projectedTransitProfit =
      shippedRevenue - shippedCogs - shippedOrdersCount * settings.deliveryCostPerSuccess;
    const netProfitProjected = netProfitDelivered + projectedTransitProfit;

    // Marges
    const netMarginPercent = deliveredRevenue > 0 ? (netProfitDelivered / deliveredRevenue) * 100 : 0;
    const avgProfitPerDeliveredOrder = deliveredOrdersCount > 0 ? netProfitDelivered / deliveredOrdersCount : 0;
    const deliverySuccessRate =
      deliveredOrdersCount + cancelledOrdersCount > 0
        ? (deliveredOrdersCount / (deliveredOrdersCount + cancelledOrdersCount)) * 100
        : 100;

    return {
      deliveredOrdersCount,
      shippedOrdersCount,
      pendingOrdersCount,
      cancelledOrdersCount,
      deliveredRevenue,
      shippedRevenue,
      pendingRevenue,
      totalRevenue,
      deliveredCogs,
      shippedCogs,
      totalDeliverySuccessFees,
      totalDeliveryReturnFees,
      totalLogisticsFees,
      totalAdSpend,
      totalSubscriptions,
      netProfitDelivered,
      netProfitProjected,
      netMarginPercent,
      avgProfitPerDeliveredOrder,
      deliverySuccessRate,
      productStats: Object.values(productStats),
    };
  }, [filteredOrders, settings, subscriptionCostForPeriod]);

  // Sauvegarder les réglages
  const handleSaveSettings = () => {
    saveFinanceSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Mettre à jour le COGS d'un produit
  const handleCogsChange = (slug: string, value: number) => {
    setSettings((prev) => ({
      ...prev,
      productCogs: {
        ...prev.productCogs,
        [slug]: Math.max(0, value),
      },
    }));
  };

  // Ajouter un nouvel abonnement
  const handleAddSubscription = () => {
    if (!newSubName.trim()) return;
    const newSub: SubscriptionItem = {
      id: "sub_" + Date.now(),
      name: newSubName.trim(),
      category: newSubCategory,
      amount: Math.max(0, newSubAmount),
      active: true,
      recurrence: "mensuel",
    };
    const updatedSubs = [...settings.subscriptions, newSub];
    const newSettings = { ...settings, subscriptions: updatedSubs };
    setSettings(newSettings);
    saveFinanceSettings(newSettings);
    setNewSubName("");
    setNewSubAmount(10000);
    setShowAddSub(false);
  };

  // Supprimer un abonnement
  const handleDeleteSubscription = (id: string) => {
    const updatedSubs = settings.subscriptions.filter((s) => s.id !== id);
    const newSettings = { ...settings, subscriptions: updatedSubs };
    setSettings(newSettings);
    saveFinanceSettings(newSettings);
  };

  // Activer / Désactiver un abonnement
  const handleToggleSubscription = (id: string) => {
    const updatedSubs = settings.subscriptions.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    const newSettings = { ...settings, subscriptions: updatedSubs };
    setSettings(newSettings);
    saveFinanceSettings(newSettings);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* ── EN-TÊTE & SÉLECTEUR DE PÉRIODE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Finance Pro & Rentabilité Nette
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            Ce que vous gagnez réellement
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bénéfice net réel après déduction des stocks (COGS), livreurs, publicité et abonnements mensuels.
          </p>
        </div>

        {/* SÉLECTEUR DE PÉRIODE */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200/90 p-1 rounded-xl shadow-sm flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeframe("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "all" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tout l'historique
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("month")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "month" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              30 Jours
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("week")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "week" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Jours
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("today")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeframe === "today" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Aujourd'hui
            </button>
          </div>

          <button
            type="button"
            onClick={fetchData}
            title="Rafraîchir les données"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 🌟 SECTION 1 : GRANDES CARTES KPIS FINANCIÈRES FIGMA-GRADE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* CARTE PRINCIPALE : BÉNÉFICE NET RÉEL ENCAISSÉ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 text-white border border-emerald-500/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_12px_32px_-8px_rgba(16,185,129,0.25)]">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Gain Net Réel Encaissé
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              {calculations.netMarginPercent.toFixed(1)}% marge
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums text-white">
            {fmt(calculations.netProfitDelivered)}{" "}
            <span className="text-sm font-sans font-normal text-emerald-400">FCFA</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Sur {calculations.deliveredOrdersCount} colis livrés</span>
            <span className="font-mono text-emerald-300 font-bold tabular-nums">
              +{fmt(calculations.avgProfitPerDeliveredOrder)} F / colis
            </span>
          </div>
        </div>

        {/* CARTE 2 : BÉNÉFICE PROJETÉ (AVEC TRANSIT) */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <span className="uppercase text-[11px] font-bold tracking-wider text-slate-600 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-600" />
              Gain Net Projeté
            </span>
            <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200/60">
              {calculations.shippedOrdersCount} en route
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums text-slate-900">
            {fmt(calculations.netProfitProjected)}{" "}
            <span className="text-xs font-sans font-normal text-slate-500">FCFA</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>En cours de livraison</span>
            <span className="font-mono font-semibold text-sky-600 tabular-nums">
              +{fmt(calculations.shippedRevenue)} F engagés
            </span>
          </div>
        </div>

        {/* CARTE 3 : CHIFFRE D'AFFAIRES BRUT ENCAISSÉ */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <span className="uppercase text-[11px] font-bold tracking-wider text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              CA Brut Encaissé
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
              {calculations.deliverySuccessRate.toFixed(0)}% succès
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums text-slate-900">
            {fmt(calculations.deliveredRevenue)}{" "}
            <span className="text-xs font-sans font-normal text-slate-500">FCFA</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>CA Total Engagé</span>
            <span className="font-mono font-semibold text-slate-700 tabular-nums">
              {fmt(calculations.totalRevenue)} F
            </span>
          </div>
        </div>

        {/* CARTE 4 : TOTAL CHARGES & ABONNEMENTS */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <span className="uppercase text-[11px] font-bold tracking-wider text-slate-600 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-rose-600" />
              Total Charges & Frais
            </span>
            <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200/60">
              Déduits
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums text-rose-600">
            -{fmt(
              calculations.deliveredCogs +
                calculations.totalLogisticsFees +
                calculations.totalAdSpend +
                calculations.totalSubscriptions
            )}{" "}
            <span className="text-xs font-sans font-normal text-slate-500">FCFA</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Abonnements seuls</span>
            <span className="font-mono font-semibold text-rose-600 tabular-nums">
              -{fmt(calculations.totalSubscriptions)} F
            </span>
          </div>
        </div>

      </div>

      {/* ── 🌟 SECTION 2 : CASCADE COMPTABLE DE RENTABILITÉ (WATERFALL BREAKDOWN) ── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-600" />
          Décomposition de la Rentabilité (Où va votre argent ?)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          
          {/* Étape 1 : CA Encaissé */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              1. CA Encaissé
            </span>
            <div className="font-mono font-black text-lg text-slate-900 tabular-nums">
              +{fmt(calculations.deliveredRevenue)} F
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Paiements clients récupérés</p>
          </div>

          {/* Étape 2 : Coût Achat Produits */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
              2. Coût Marchandises
            </span>
            <div className="font-mono font-black text-lg text-rose-600 tabular-nums">
              -{fmt(calculations.deliveredCogs)} F
            </div>
            <p className="text-[11px] text-rose-600/80 mt-1">Achat des {calculations.deliveredOrdersCount} produits</p>
          </div>

          {/* Étape 3 : Frais Livreurs & Retours */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
              3. Logistique & Livreurs
            </span>
            <div className="font-mono font-black text-lg text-amber-600 tabular-nums">
              -{fmt(calculations.totalLogisticsFees)} F
            </div>
            <p className="text-[11px] text-amber-600/80 mt-1">Courses réussies & retours</p>
          </div>

          {/* Étape 4 : Pub & Abonnements */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
              4. Pub & Abonnements
            </span>
            <div className="font-mono font-black text-lg text-indigo-600 tabular-nums">
              -{fmt(calculations.totalAdSpend + calculations.totalSubscriptions)} F
            </div>
            <p className="text-[11px] text-indigo-600/80 mt-1">Meta Ads + Outils récurrents</p>
          </div>

          {/* Étape 5 : Bénéfice Net Final */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              5. Bénéfice Net Réel
            </span>
            <div className="font-mono font-black text-lg text-emerald-700 tabular-nums">
              ={fmt(calculations.netProfitDelivered)} F
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Votre gain dans la poche</p>
          </div>

        </div>
      </div>

      {/* ── 🌟 SECTION 3 : TABLEAU DE RENTABILITÉ NETTE PAR PRODUIT ── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Rentabilité Détaillée par Produit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyse unitaire de la rentabilité de chaque article sur les commandes livrées.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4 text-center">Unités Livrées</th>
                <th className="py-3 px-4 text-center">En Transit</th>
                <th className="py-3 px-4 text-right">Prix d'Achat Unit.</th>
                <th className="py-3 px-4 text-right">CA Encaissé</th>
                <th className="py-3 px-4 text-right">Coût Stock Total</th>
                <th className="py-3 px-4 text-right">Frais Livraisons</th>
                <th className="py-3 px-4 text-right">Bénéfice Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculations.productStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucune commande enregistrée pour cette période.
                  </td>
                </tr>
              ) : (
                calculations.productStats.map((prod) => (
                  <tr key={prod.slug} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {prod.title}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-emerald-700 bg-emerald-50/30">
                      {prod.deliveredCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium tabular-nums text-sky-600">
                      {prod.shippedCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600">
                      {fmt(prod.cogsUnit)} F
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {fmt(prod.deliveredRev)} F
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-rose-600">
                      -{fmt(prod.totalCogs)} F
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-600">
                      -{fmt(prod.deliveryFees)} F
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-sm tabular-nums text-emerald-600 bg-emerald-50/40">
                      +{fmt(prod.netProfit)} F
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 🌟 SECTION 4 & 5 : ABONNEMENTS ET PARAMÈTRES DES COÛTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 4 : GESTIONNAIRE DES ABONNEMENTS & CHARGES RÉCURRENTES (7 COLS) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Abonnements & Charges Fixes Mensuelles
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Outils, hébergement, numéros WhatsApp, serveurs et forfaits d'appels.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddSub(!showAddSub)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Ajouter une charge</span>
            </button>
          </div>

          {/* FORMULAIRE D'AJOUT RAPIDE D'UN ABONNEMENT */}
          {showAddSub && (
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Nouvel Abonnement ou Charge Fixe
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  placeholder="Nom (ex: Forfait Appel Closers)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="logiciel">Logiciel / SaaS</option>
                  <option value="telecom">Téléphonie / Internet</option>
                  <option value="marketing">Marketing & Outils</option>
                  <option value="equipe">Rémunération Équipe</option>
                  <option value="autre">Autre Charge</option>
                </select>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Montant FCFA"
                    value={newSubAmount || ""}
                    onChange={(e) => setNewSubAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12 font-mono"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">FCFA/m</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddSub(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200/60 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddSubscription}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  Enregistrer l'abonnement
                </button>
              </div>
            </div>
          )}

          {/* LISTE DES ABONNEMENTS */}
          <div className="space-y-2">
            {settings.subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  sub.active ? "bg-white border-slate-200/80 shadow-sm" : "bg-slate-50 border-slate-200/40 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sub.active}
                    onChange={() => handleToggleSubscription(sub.id)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{sub.name}</div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      {sub.category} • Mensuel
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                    {fmt(sub.amount)} <span className="text-[11px] font-sans text-slate-400">F/mois</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubscription(sub.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 font-medium">
            <span>Total mensuel des abonnements actifs :</span>
            <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
              {fmt(settings.subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.amount, 0))} FCFA/mois
            </span>
          </div>
        </div>

        {/* SECTION 5 : PARAMÉTRAGE DES COÛTS VARIABLES & PUB (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Coûts Variables & Publicité
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Ajustez vos prix d'achat, livreurs et budget Ads.</p>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer ${
                saveSuccess ? "bg-emerald-600 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sauvegardé !</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3.5">
            {/* FRAIS DE LIVRAISON */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  🛵 Livré avec succès (F)
                </label>
                <input
                  type="number"
                  value={settings.deliveryCostPerSuccess}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, deliveryCostPerSuccess: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  ❌ Indemnité Retour (F)
                </label>
                <input
                  type="number"
                  value={settings.deliveryCostPerFailure}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, deliveryCostPerFailure: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* DÉPENSES PUBLICITAIRES */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                📢 Dépenses Publicitaires Totales (Meta Ads / TikTok Ads)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.adSpendTotal || 0}
                  onChange={(e) => setSettings((prev) => ({ ...prev, adSpendTotal: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-14"
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">FCFA</span>
              </div>
            </div>

            {/* COÛTS D'ACHAT PAR PRODUIT (COGS) */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
                📦 Prix d'achat unitaire fournisseur (COGS) :
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {[
                  { slug: "umei", name: "Brosse Uméi 3-en-1" },
                  { slug: "eraclean", name: "Purificateur EraClean™" },
                  { slug: "turbofan", name: "Ventilateur TurboFan™" },
                  { slug: "peeler", name: "Éplucheur ChefPeel™" },
                  { slug: "stabilisateur", name: "Stabilisateur Z3 Zoom" },
                  { slug: "veilleuse", name: "Veilleuse FRIOSZ 3D" },
                ].map((item) => (
                  <div key={item.slug} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-700 font-medium truncate">{item.name}</span>
                    <div className="relative w-28 shrink-0">
                      <input
                        type="number"
                        value={settings.productCogs[item.slug] ?? 4500}
                        onChange={(e) => handleCogsChange(item.slug, Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-right pr-6 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-2 top-1 text-[10px] font-mono text-slate-400">F</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
