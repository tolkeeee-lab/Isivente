"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  MousePointerClick, 
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
import { getAdminDashboardProducts } from "@/lib/defaultCatalog";

export default function AdminClicksPage() {
  const [analytics, setAnalytics] = useState<AnalyticsStats>({
    totalViews: 0,
    totalClicks: 0,
    ctr: 0,
    avgTimeSpentSeconds: 0,
    formattedAvgTime: "—",
  });
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalyticsStats[]>([]);
  const [orderCountsBySlug, setOrderCountsBySlug] = useState<Record<string, number>>({});
  const [leadsCountBySlug, setLeadsCountBySlug] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const defaultProducts = getAdminDashboardProducts();

  const [productsList, setProductsList] = useState(defaultProducts);
  const [metaAdClicks, setMetaAdClicks] = useState<number>(114); // Valeur de la campagne Meta actuelle
  const [isEditingMetaClicks, setIsEditingMetaClicks] = useState(false);
  const [hasAnalyticsTable, setHasAnalyticsTable] = useState<boolean>(true);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const handleCopySql = () => {
    const sql = `CREATE TABLE IF NOT EXISTS public.analytics (
    session_id TEXT PRIMARY KEY,
    product_slug TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    clicked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

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
      // Charger les produits de Supabase
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: dbProds } = await supabase
          .from("products")
          .select("title, slug, price, image_url");
        if (dbProds && dbProds.length > 0) {
          const formatted = dbProds.map((p: any) => ({
            title: p.title,
            slug: p.slug,
            price: p.price,
            image: p.image_url || "/images/microscope-monde-decouverte.jpg",
          }));
          const existingSlugs = new Set(formatted.map((p: any) => p.slug));
          const merged = [...formatted, ...defaultProducts.filter((p) => !existingSlugs.has(p.slug))];
          setProductsList(merged);
        }
      } catch {}

      // Charger les clics Meta sauvegardés
      if (typeof window !== "undefined") {
        const savedMetaClicks = localStorage.getItem("isivente_meta_ad_clicks");
        if (savedMetaClicks) {
          setMetaAdClicks(Number(savedMetaClicks) || 114);
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
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1 flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />
            <span>Audience & Conversion Publicitaire</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Clics, Visiteurs & CTR
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Analysez le trafic réel de vos publicités Meta, l&apos;attention des visiteurs et les conversions par produit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 transition-all active:scale-[0.98]"
            title="Effacer les clics et visites de test pour repartir de zéro"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Remettre les clics à zéro</span>
          </button>
        </div>
      </div>

      {/* BANNIÈRE D'ALERTE SUPABASE SI TABLE ANALYTICS MANQUANTE */}
      {!hasAnalyticsTable && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-950 text-sm">Action requise : La table Supabase « analytics » n&apos;est pas encore créée</div>
              <p className="text-amber-800 mt-0.5">
                Vos prospects et commandes sont bien enregistrés, mais les visites brutes de vos pubs Facebook ne peuvent pas être enregistrées tant que cette table n&apos;existe pas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? "SQL copié !" : "Copier le script SQL"}</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/uelognqedzqtvupwzejh/sql/new"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-all flex items-center gap-1 shadow-xs"
            >
              <span>Ouvrir Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* SECTION COMPARATIF META ADS VS SITE REEL */}
      <div className="card-figma p-6 border-blue-200/90 bg-gradient-to-br from-blue-50/40 via-white to-slate-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-slate-900">Entonnoir Publicitaire Meta Ads</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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
                    handleSaveMetaClicks(Number(el?.value) || 114);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold"
                >
                  Valider
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingMetaClicks(true)}
                className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                title="Cliquer pour ajuster le nombre de clics de votre gestionnaire de pub Facebook"
              >
                <span>{metaAdClicks} clics Meta</span>
                <span className="text-[10px] text-blue-500">✎ Modifier</span>
              </button>
            )}
          </div>
        </div>

        {/* CALCULS DE COHÉRENCE (LES VISITEURS QUI ONT COMMANDE OU LAISSE UN NUMERO ONT NECESSAIREMENT VISITE) */}
        {(() => {
          const totalLeads = Object.values(leadsCountBySlug).reduce((a, b) => a + b, 0);
          const totalOrders = Object.values(orderCountsBySlug).reduce((a, b) => a + b, 0);
          const confirmedVisitorsTotal = Math.max(analytics.totalViews, totalLeads + totalOrders);
          const confirmedClicksTotal = Math.max(analytics.totalClicks, totalLeads + totalOrders);
          const confirmedCtr = confirmedVisitorsTotal > 0 
            ? Math.round((confirmedClicksTotal / confirmedVisitorsTotal) * 1000) / 10 
            : 0;

          return (
            <>
              {/* LES 4 ÉTAPES DU TUNNEL DE VENTE */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {/* Étape 1 : Pub Meta */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    1. Clics Pub Facebook
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {metaAdClicks}
                  </div>
                  <div className="text-[11px] text-slate-400">Clics sur lien Meta Ads</div>
                </div>

                {/* Étape 2 : Atterrissage sur le site */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    2. Visites Réelles Site
                  </span>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {confirmedVisitorsTotal}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {metaAdClicks > 0 ? `${Math.min(100, Math.round((confirmedVisitorsTotal / metaAdClicks) * 100))}% parvenus` : "—"}
                  </div>
                </div>

                {/* Étape 3 : Paniers & Contacts capturés */}
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    3. Paniers / Numéros
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-950 tabular-nums">
                    {totalLeads}
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium">À relancer sur WhatsApp</div>
                </div>

                {/* Étape 4 : Commandes */}
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
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
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Visiteurs / Vues</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/60">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
                      {loading ? "..." : confirmedVisitorsTotal}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Sessions réelles détectées</div>
                  </div>
                </div>

                {/* KPI 2 : CLICS COMMANDES */}
                <div className="card-figma p-5 flex flex-col justify-between border-indigo-200/80 bg-indigo-50/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">Clics d&apos;Intention</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-indigo-950">
                      {loading ? "..." : confirmedClicksTotal}
                    </div>
                    <div className="text-[11px] text-indigo-600 font-medium mt-1">Clics vers formulaire ou commande</div>
                  </div>
                </div>

                {/* KPI 3 : TAUX DE CLIC (CTR) */}
                <div className="card-figma p-5 flex flex-col justify-between border-emerald-200/80 bg-emerald-50/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Taux de Clic (CTR)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-950">
                      {loading ? "..." : `${confirmedCtr}%`}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-1">
                      {confirmedCtr >= 15 ? "🔥 Excellent engagement" : "Objectif recommandé : > 15%"}
                    </div>
                  </div>
                </div>

                {/* KPI 4 : TEMPS MOYEN */}
                <div className="card-figma p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Temps Moyen Passé</span>
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


      {/* TABLEAU FIGMA-GRADE PAR PRODUIT */}
      <div className="card-figma overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">Performance par Page Produit</h2>
            <p className="text-xs text-slate-500">Détail des clics, taux de clic et commandes par landing page.</p>
          </div>
          <Link
            href="/admin/prospects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Voir les paniers abandonnés</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4 text-center">Vues</th>
                <th className="py-3 px-4 text-center">Clics</th>
                <th className="py-3 px-4 text-center">CTR (Taux de Clic)</th>
                <th className="py-3 px-4 text-center">Temps Moyen</th>
                <th className="py-3 px-4 text-center">Paniers Cités</th>
                <th className="py-3 px-4 text-center">Commandes</th>
                <th className="py-3 px-4 text-right">Lien Direct</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {productsList.map((prod) => {
                const pa = productAnalytics.find((p) => p.slug === prod.slug);
                const orders = orderCountsBySlug[prod.slug] || 0;
                const leads = leadsCountBySlug[prod.slug] || 0;
                const rawViews = pa?.totalViews || 0;
                const rawClicks = pa?.totalClicks || 0;
                const views = Math.max(rawViews, leads + orders);
                const clicks = Math.max(rawClicks, leads + orders);
                const ctr = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0;
                const avgTime = pa?.formattedAvgTime || "—";

                return (
                  <tr key={prod.slug} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[260px]">{prod.title}</div>
                          <div className="text-[11px] font-mono text-slate-400">/p/{prod.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700 tabular-nums">
                      {views}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-700 tabular-nums">
                      {clicks}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${
                          ctr >= 15 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : ctr > 0 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200" 
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {ctr}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-600 tabular-nums">
                      {avgTime}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {leads > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {leads} prospect{leads > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {orders > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {orders} vente{orders > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/p/${prod.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <span>Visiter</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ENCART PÉDAGOGIQUE POUR LE COMMERÇANT */}
      <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Comprendre vos clics publicitaires Meta vs Visites réelles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-1">
            <div className="font-bold text-slate-800">1. Clics Meta Ads (114 clics)</div>
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
