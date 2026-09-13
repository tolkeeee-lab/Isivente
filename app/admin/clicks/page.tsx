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
  Info
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

  const defaultProducts = [
    { title: "Microscope Numérique Portable HD 1000X", slug: "microscope", price: 29900, image: "/images/microscope-monde-decouverte.jpg" },
    { title: "Brosse Démêlante Vapeur Uméi 3-en-1", slug: "umei", price: 14900, image: "/images/umei-hero-real.jpg" },
    { title: "Batterie Modulaire 3-en-1 Trozk T3 Cyberpunk™", slug: "trozk", price: 29900, image: "/images/trozk-hero.jpg" },
    { title: "Purificateur d'Air EraClean™ 10 Ans", slug: "eraclean", price: 19900, image: "/images/eraclean-studio.jpg" },
    { title: "Ventilateur Ceinture & Powerbank TurboFan™", slug: "turbofan", price: 16900, image: "/images/turbofan-studio.jpg" },
    { title: "Éplucheur Automatique ChefPeel™ Pro", slug: "peeler", price: 14900, image: "/images/peeler-hero.jpg" },
    { title: "Stabilisateur Trépied Z3 Zoom™", slug: "stabilisateur", price: 49900, image: "/images/stabilisateur-hero.jpg" },
    { title: "Veilleuse Projecteur LED 3D FRIOSZ", slug: "veilleuse", price: 14900, image: "/images/projecteur-hero.jpg" },
    { title: "Mini Caméra Espionne & Surveillance HD A9 Pro™", slug: "camera", price: 16900, image: "/images/camera-hero.jpg" },
  ];

  const loadData = async () => {
    try {
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
              {loading ? "..." : analytics.totalViews}
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
              {loading ? "..." : analytics.totalClicks}
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
              {loading ? "..." : `${analytics.ctr}%`}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {analytics.ctr >= 15 ? "🔥 Excellent engagement" : "Objectif recommandé : > 15%"}
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
              {defaultProducts.map((prod) => {
                const pa = productAnalytics.find((p) => p.slug === prod.slug);
                const views = pa?.totalViews || 0;
                const clicks = pa?.totalClicks || 0;
                const ctr = pa?.ctr || 0;
                const avgTime = pa?.formattedAvgTime || "—";
                const orders = orderCountsBySlug[prod.slug] || 0;
                const leads = leadsCountBySlug[prod.slug] || 0;

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
