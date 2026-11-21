"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  MousePointerClick, 
  BarChart3,
  ShieldCheck,
  Eye, 
  Timer, 
  TrendingUp, 
  RefreshCw, 
  RotateCcw, 
  ShoppingBag, 
  PhoneCall, 
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  AlertTriangle,
  Copy,
  Check
} from "lucide-react";
import { 
  getAnalyticsStats, 
  getAllProductsAnalytics, 
  resetAnalyticsStats, 
  AnalyticsStats, 
  ProductAnalyticsStats 
} from "@/lib/analyticsStorage";
import { getAllOrders } from "@/lib/ordersStorage";
import { getAllLeads } from "@/lib/leadsStorage";
import { getAdminDashboardProducts, DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import { getStoredTenantContext } from "@/lib/storesStorage";

export default function AdminClicksPage() {
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
  const [orderCountsBySlug, setOrderCountsBySlug] = useState<Record<string, number>>({});
  const [leadsCountBySlug, setLeadsCountBySlug] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tenantCtx = getStoredTenantContext();
  const isFounder = tenantCtx ? tenantCtx.isFounder : false;
  const defaultProducts = isFounder ? getAdminDashboardProducts() : [];

  const [productsList, setProductsList] = useState(defaultProducts);
  const [metaAdClicks, setMetaAdClicks] = useState<number>(0); // Saisi manuellement depuis le gestionnaire Meta Ads
  const [isEditingMetaClicks, setIsEditingMetaClicks] = useState(false);
  const [hasAnalyticsTable, setHasAnalyticsTable] = useState<boolean>(true);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [onlyWithTraffic, setOnlyWithTraffic] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://isivente.vercel.app";
    const url = `${origin}/p/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const handleCopySql = () => {
    const sql = `CREATE TABLE IF NOT EXISTS public.analytics (
    session_id TEXT PRIMARY KEY,
    product_slug TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    clicked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all on analytics" ON public.analytics;
CREATE POLICY "Allow public all on analytics" ON public.analytics
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const loadData = async () => {
    try {
      // 1. Vérifier si la table analytics existe dans Supabase
      try {
        const { supabase } = await import("@/lib/supabase");
        const { error: testErr } = await supabase.from("analytics").select("session_id").limit(1);
        if (testErr && testErr.code === "PGRST205") {
          setHasAnalyticsTable(false);
        } else {
          setHasAnalyticsTable(true);
        }
      } catch {
        setHasAnalyticsTable(false);
      }
      // Charger les produits officiels (Source Unique Catalog)
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: dbProds } = await supabase
          .from("products")
          .select("title, slug, price, images")
          .eq("is_active", true);
        if (dbProds && dbProds.length > 0) {
          const dbMap = new Map(dbProds.map((p: any) => [p.slug, p]));
          const formatted = defaultProducts.map((p) => {
            const dbP = dbMap.get(p.slug);
            return {
              ...p,
              price: dbP?.price || p.price,
              title: dbP?.title || p.title,
            };
          });
          setProductsList(formatted);
        } else {
          setProductsList(defaultProducts);
        }
      } catch {
        setProductsList(defaultProducts);
      }

      // Charger les clics Meta sauvegardés
      if (typeof window !== "undefined") {
        const savedMetaClicks = localStorage.getItem("isivente_meta_ad_clicks");
        if (savedMetaClicks) {
          setMetaAdClicks(Number(savedMetaClicks) || 0);
        }
      }

      const [globalStats, perProduct, orders, leads] = await Promise.all([
        getAnalyticsStats(),
        getAllProductsAnalytics(),
        getAllOrders(),
        getAllLeads(),
      ]);

      setAnalytics(globalStats);
      setProductAnalytics(perProduct);

      const orderMap: Record<string, number> = {};
      orders.forEach((o) => {
        const s = o.product_slug || "autre";
        orderMap[s] = (orderMap[s] || 0) + 1;
      });
      setOrderCountsBySlug(orderMap);

      const leadMap: Record<string, number> = {};
      leads.forEach((l) => {
        const s = l.product_slug || "autre";
        leadMap[s] = (leadMap[s] || 0) + 1;
      });
      setLeadsCountBySlug(leadMap);
    } catch (e) {
      console.error("Failed to load clicks data:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSaveMetaClicks = (val: number) => {
    setMetaAdClicks(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("isivente_meta_ad_clicks", String(val));
    }
    setIsEditingMetaClicks(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleReset = async () => {
    if (confirm("Voulez-vous remettre à zéro tous les clics et visites de test ? Seules les nouvelles visites réelles de vos pubs seront enregistrées.")) {
      await resetAnalyticsStats();
      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-[staggerFadeUp_240ms_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.06em] text-[#171717] mb-1 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-[#171717]" />
            <span>Tableau de Bord Analytics Produit</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            KPIs & Visiteurs des Landing Pages
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Suivi en temps réel des visiteurs réels, taux de clic (CTR), temps d&apos;attention et conversions par page produit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-black/[0.08] hover:bg-slate-50 transition-colors duration-150 active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#171717]" : "text-slate-500"}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 transition-colors duration-150 active:scale-[0.98]"
            title="Effacer les clics et visites de test pour repartir de zéro"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Remettre les clics à zéro</span>
          </button>
        </div>
      </div>

      {/* BANNIÈRE DE GARANTIE : EXCLUSION STRICTE DU TRAFIC ADMIN */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start sm:items-center gap-3 text-emerald-900 text-xs shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-emerald-950 flex items-center gap-2">
            <span>Filtrage Anti-Pollution Actif</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-emerald-800 text-[11px] sm:text-xs mt-0.5">
            Les consultations sur vos pages d&apos;administration (<code>/admin</code>) ainsi que vos propres tests ne sont <strong>JAMAIS comptabilisés</strong>. Seules les visites réelles des acheteurs sur vos landing pages de vente (<code>/p/[produit]</code>) sont enregistrées.
          </p>
        </div>
      </div>

      {/* BANNIÈRE D'ALERTE SUPABASE SI TABLE ANALYTICS MANQUANTE */}
      {!hasAnalyticsTable && (
        <div className="p-4 rounded-xl bg-[#f4f4f5] border border-black/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[#525252] text-xs shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#525252] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-950 text-sm">Action requise : La table Supabase « analytics » n&apos;est pas encore créée</div>
              <p className="text-[#525252] mt-0.5">
                Vos prospects et commandes sont bien enregistrés, mais les visites brutes de vos pubs Facebook ne peuvent pas être enregistrées tant que cette table n&apos;existe pas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-[#171717] text-white font-semibold text-xs hover:bg-[#262626] transition-colors duration-150 flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? "SQL copié !" : "Copier le script SQL"}</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/uelognqedzqtvupwzejh/sql/new"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-black/[0.08] text-[#525252] font-semibold text-xs hover:bg-[#f4f4f5] transition-colors duration-150 flex items-center gap-1 shadow-xs"
            >
              <span>Ouvrir Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* SECTION COMPARATIF META ADS VS SITE REEL */}
      <div className="card-figma p-6 border-black/[0.08] bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#14281D] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-slate-900">Entonnoir Publicitaire Meta Ads</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4f4f5] text-[#171717] border border-black/[0.08]">
                  Campagne en direct
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Rapprochement entre les clics sur votre publicité Facebook et les ventes réelles sur votre site.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Clics annoncés par Meta :</span>
            {isEditingMetaClicks ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  defaultValue={metaAdClicks}
                  id="metaClicksInput"
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById("metaClicksInput") as HTMLInputElement;
                    handleSaveMetaClicks(Number(el?.value) || 0);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold"
                >
                  Valider
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingMetaClicks(true)}
                className="font-mono font-bold text-xs text-[#171717] bg-[#f4f4f5] border border-black/[0.08] px-2.5 py-1.5 rounded-lg hover:bg-[#f4f4f5] transition-colors flex items-center gap-1.5"
                title="Cliquer pour ajuster le nombre de clics de votre gestionnaire de pub Facebook"
              >
                <span>{metaAdClicks} clics Meta</span>
                <span className="text-[10px] text-blue-500">✎ Modifier</span>
              </button>
            )}
          </div>
        </div>

        {/* ENTONNOIR RÉEL (données Supabase analytics + commandes + leads) */}
        {(() => {
          const totalLeads = Object.values(leadsCountBySlug).reduce((a, b) => a + b, 0);
          const totalOrders = Object.values(orderCountsBySlug).reduce((a, b) => a + b, 0);
          const realViews = analytics.totalViews;
          const realClicks = analytics.totalClicks;
          const realCtr = analytics.ctr;

          return (
            <>
              {/* LES 4 ÉTAPES DU TUNNEL DE VENTE */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {/* Étape 1 : Pub Meta */}
                <div className="p-3.5 rounded-xl bg-white border border-black/[0.08] space-y-1">
                  <span className="text-[10px] font-bold text-[#171717]">
                    1. Clics Pub Facebook
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {metaAdClicks}
                  </div>
                  <div className="text-[11px] text-slate-400">Clics sur lien Meta Ads</div>
                </div>

                {/* Étape 2 : Atterrissage sur le site */}
                <div className="p-3.5 rounded-xl bg-white border border-black/[0.08] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">
                    2. Visites Réelles Site
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {realViews}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {metaAdClicks > 0 ? `${Math.min(100, Math.round((realViews / metaAdClicks) * 100))}% parvenus` : "—"}
                  </div>
                </div>

                {/* Étape 3 : Paniers & Contacts capturés */}
                <div className="p-3.5 rounded-xl bg-[#fafafa] border border-black/[0.08] space-y-1">
                  <span className="text-[10px] font-bold text-[#525252]">
                    3. Paniers / Numéros
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-950 tabular-nums">
                    {totalLeads}
                  </div>
                  <div className="text-[11px] text-[#525252] font-medium">À relancer sur WhatsApp</div>
                </div>

                {/* Étape 4 : Commandes */}
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700">
                    4. Commandes Finales
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-950 tabular-nums">
                    {totalOrders}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">Livrables en COD</div>
                </div>
              </div>

              {/* KPI STATS ROW FIGMA-GRADE */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1 : VUES TOTALES */}
                <div className="card-figma p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-slate-400">Visiteurs / Vues</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-black/[0.08]/60">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
                      {loading ? "..." : realViews}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Sessions réelles enregistrées</div>
                  </div>
                </div>

                {/* KPI 2 : CLICS COMMANDES */}
                <div className="card-figma p-5 flex flex-col justify-between border-black/[0.08] bg-[#fafafa]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-[#171717]">Clics d&apos;Intention</span>
                    <div className="w-8 h-8 rounded-xl bg-[#f4f4f5] text-[#171717] flex items-center justify-center border border-black/[0.08]">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-indigo-950">
                      {loading ? "..." : realClicks}
                    </div>
                    <div className="text-[11px] text-[#171717] font-medium mt-1">Clics vers formulaire ou commande</div>
                  </div>
                </div>

                {/* KPI 3 : TAUX DE CLIC (CTR) */}
                <div className="card-figma p-5 flex flex-col justify-between border-emerald-200/80 bg-emerald-50/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-emerald-700">Taux de Clic (CTR)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-950">
                      {loading ? "..." : `${realCtr}%`}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-1">
                      {realCtr >= 15 ? "Excellent engagement" : "Objectif recommandé : > 15%"}
                    </div>
                  </div>
                </div>

                {/* KPI 4 : TEMPS MOYEN */}
                <div className="card-figma p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-slate-400">Temps Moyen Passé</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                      <Timer className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
                      {loading ? "..." : analytics.formattedAvgTime}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Attention réelle sur la page</div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* PERFORMANCE PAR PAGE PRODUIT (TRIÉ PAR TRAFIC + CARTES MOBILES + PAGINATION ANTI-SCROLL INFINI) */}
      {(() => {
        const enrichedRows = productsList
          .map((prod) => {
            const pa = productAnalytics.find((p) => p.slug === prod.slug);
            const orders = orderCountsBySlug[prod.slug] || 0;
            const leads = leadsCountBySlug[prod.slug] || 0;
            const views = pa?.totalViews || 0;
            const clicks = pa?.totalClicks || 0;
            const ctr = pa?.ctr ?? 0;
            const avgTime = pa?.formattedAvgTime || "—";
            return { ...prod, orders, leads, views, clicks, ctr, avgTime };
          })
          .sort((a, b) => {
            if (b.views !== a.views) return b.views - a.views;
            if (b.clicks !== a.clicks) return b.clicks - a.clicks;
            return b.orders - a.orders;
          });

        const activeRows = enrichedRows.filter((r) => r.views > 0 || r.clicks > 0 || r.orders > 0 || r.leads > 0);
        const filteredRows = onlyWithTraffic && activeRows.length > 0 ? activeRows : enrichedRows;
        const displayedRows = filteredRows.slice(0, visibleCount);
        const remainingCount = Math.max(0, filteredRows.length - displayedRows.length);

        return (
          <div className="bg-white rounded-[14px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-medium text-[#171717]">
                  Performance par page produit
                </h2>
                <p className="text-[13px] text-[#737373] mt-0.5">
                  Trié du plus visité au moins visité · {filteredRows.length} page{filteredRows.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeRows.length > 0 && activeRows.length < enrichedRows.length && (
                  <div className="inline-flex p-0.5 rounded-[8px] bg-[#f4f4f5] text-[12px]">
                    <button
                      type="button"
                      onClick={() => {
                        setOnlyWithTraffic(true);
                        setVisibleCount(8);
                      }}
                      className={`h-7 px-2.5 rounded-[6px] transition-colors duration-150 cursor-pointer ${
                        onlyWithTraffic
                          ? "bg-white text-[#171717] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                          : "text-[#737373] hover:text-[#171717]"
                      }`}
                    >
                      Actifs ({activeRows.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOnlyWithTraffic(false);
                        setVisibleCount(8);
                      }}
                      className={`h-7 px-2.5 rounded-[6px] transition-colors duration-150 cursor-pointer ${
                        !onlyWithTraffic
                          ? "bg-white text-[#171717] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                          : "text-[#737373] hover:text-[#171717]"
                      }`}
                    >
                      Tous ({enrichedRows.length})
                    </button>
                  </div>
                )}

                <Link
                  href="/admin/prospects"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#525252] hover:text-[#171717] transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Paniers abandonnés</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
            </div>

            {displayedRows.length === 0 ? (
              <div className="py-10 px-4 text-center text-[13px] text-[#737373]">
                Aucune page produit enregistrée pour le moment
              </div>
            ) : (
              <>
                {/* Vue Mobile : Cartes 100% lisibles sans scroll horizontal */}
                <div className="md:hidden divide-y divide-black/[0.06]">
                  {displayedRows.map((prod) => (
                    <div key={prod.slug} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-11 h-11 rounded-[8px] object-cover border border-black/[0.08] shrink-0 bg-[#f4f4f5]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-medium text-[#171717] line-clamp-1">
                            {prod.title}
                          </div>
                          <div className="text-[12px] font-mono text-[#737373] truncate">
                            /p/{prod.slug}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 bg-[#fafafa] border border-black/[0.06] rounded-[8px] p-2.5 text-center">
                        <div>
                          <div className="text-[11px] text-[#737373]">Vues</div>
                          <div className="text-[14px] font-mono tabular-nums font-medium text-[#171717] mt-0.5">
                            {prod.views}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#737373]">Clics</div>
                          <div className="text-[14px] font-mono tabular-nums font-medium text-[#525252] mt-0.5">
                            {prod.clicks}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#737373]">CTR</div>
                          <div className="text-[14px] font-mono tabular-nums font-medium text-[#171717] mt-0.5">
                            {prod.ctr}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] text-[#737373]">Ventes</div>
                          <div className="text-[14px] font-mono tabular-nums font-medium text-[#15803d] mt-0.5">
                            {prod.orders}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(prod.slug)}
                          className={`flex-1 h-9 rounded-[8px] text-[13px] font-medium inline-flex items-center justify-center gap-1.5 border transition-colors duration-150 cursor-pointer ${
                            copiedSlug === prod.slug
                              ? "bg-[#15803d] text-white border-[#15803d]"
                              : "bg-white hover:bg-[#f4f4f5] text-[#171717] border-black/[0.08]"
                          }`}
                        >
                          {copiedSlug === prod.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[1.5]" />
                              <span>Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 stroke-[1.5] text-[#737373]" />
                              <span>Copier lien</span>
                            </>
                          )}
                        </button>
                        <a
                          href={`/p/${prod.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-9 px-3.5 rounded-[8px] border border-black/[0.08] text-[13px] font-medium text-[#525252] hover:text-[#171717] inline-flex items-center gap-1.5"
                        >
                          <span>Ouvrir</span>
                          <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vue Desktop : Tableau complet trié */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-black/[0.08] bg-[#fafafa] text-[12px] font-normal text-[#737373]">
                        <th className="py-3 px-4 font-normal">Produit</th>
                        <th className="py-3 px-4 text-right font-normal">Vues</th>
                        <th className="py-3 px-4 text-right font-normal">Clics</th>
                        <th className="py-3 px-4 text-right font-normal">CTR</th>
                        <th className="py-3 px-4 text-right font-normal">Temps moyen</th>
                        <th className="py-3 px-4 text-right font-normal">Paniers</th>
                        <th className="py-3 px-4 text-right font-normal">Commandes</th>
                        <th className="py-3 px-4 text-right font-normal">Lien</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.06] font-sans">
                      {displayedRows.map((prod) => (
                        <tr key={prod.slug} className="hover:bg-[#fafafa] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.image}
                                alt={prod.title}
                                className="w-9 h-9 rounded-[8px] object-cover border border-black/[0.08] shrink-0 bg-white"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-[#171717] truncate max-w-[240px]">{prod.title}</div>
                                <div className="text-[12px] font-mono text-[#737373]">/p/{prod.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#171717]">
                            {prod.views}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#525252]">
                            {prod.clicks}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#525252]">
                            {prod.ctr}%
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#737373]">
                            {prod.avgTime}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-[#525252]">
                            {prod.leads > 0 ? prod.leads : "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-[#15803d]">
                            {prod.orders}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => handleCopyLink(prod.slug)}
                                className={`h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1 border transition-colors duration-150 cursor-pointer ${
                                  copiedSlug === prod.slug
                                    ? "bg-[#15803d] text-white border-[#15803d]"
                                    : "bg-white hover:bg-[#f4f4f5] text-[#171717] border-black/[0.08]"
                                }`}
                              >
                                {copiedSlug === prod.slug ? <Check className="w-3.5 h-3.5 stroke-[1.5]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.5] text-[#737373]" />}
                                <span>{copiedSlug === prod.slug ? "Copié" : "Copier"}</span>
                              </button>
                              <a
                                href={`/p/${prod.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="h-7 w-7 rounded-[6px] border border-black/[0.08] text-[#737373] hover:text-[#171717] hover:bg-[#f4f4f5] inline-flex items-center justify-center transition-colors"
                                title="Ouvrir la page"
                              >
                                <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination propre (fini le scroll infini) */}
                {remainingCount > 0 && (
                  <div className="p-4 border-t border-black/[0.08] text-center bg-[#fafafa]/60">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="h-9 px-4 rounded-[8px] bg-white hover:bg-[#f4f4f5] border border-black/[0.08] text-[13px] font-medium text-[#171717] transition-colors duration-150 cursor-pointer"
                    >
                      Afficher {Math.min(8, remainingCount)} de plus ({remainingCount} restant{remainingCount > 1 ? "s" : ""})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* ENCART PÉDAGOGIQUE POUR LE COMMERÇANT */}
      <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/[0.08] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#14281D] text-white flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Comprendre vos clics publicitaires Meta vs Visites réelles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-1">
            <div className="font-bold text-slate-800">1. Clics Pub Meta Ads ({metaAdClicks > 0 ? `${metaAdClicks} clics` : "à renseigner"})</div>
            <p>
              Facebook compte un clic dès qu&apos;un doigt effleure l&apos;annonce. Si la connexion 3G/4G est instable et que le visiteur ferme avant que la page charge, la session est perdue en route.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-800">2. Vues sur le site</div>
            <p>
              Le site ne compte une visite que lorsque le client humain est réellement sur votre page depuis plus de 2 secondes. Cela élimine les robots et les clics accidentels.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-800">3. Clic d&apos;Intention & Panier</div>
            <p>
              C&apos;est le chiffre le plus précieux : il mesure les clients qui ont cliqué sur le bouton de commande ou commencé à saisir leur numéro de téléphone pour commander.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
