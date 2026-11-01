"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_CATALOG, DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import { playAlertNotificationSound } from "@/lib/soundEffects";
import {
  Target,
  RefreshCw,
  CheckCircle2,
  KeyRound,
  Upload,
  Filter,
  ShoppingBag,
  Users,
  MousePointerClick,
  Eye,
  Flame,
  MessageCircle,
  Copy,
  Check,
  Link2,
  Bell,
} from "lucide-react";

/* ─── Types ─── */
interface OrderRow {
  id: string;
  order_number: string;
  product_slug: string;
  product_title?: string;
  total_amount: number;
  status: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
}

interface AnalyticsRow {
  session_id: string;
  product_slug: string;
  duration_seconds: number;
  clicked: boolean;
  created_at: string;
}

interface LeadRow {
  id: string;
  product_slug: string;
  status: string;
  created_at: string;
}

interface MetaAdInsight {
  campaign_name?: string;
  adset_name?: string;
  ad_name?: string;
  spend: number;
  impressions: number;
  clicks: number;
  inline_link_clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  landing_page_views: number;
  add_to_cart: number;
  initiate_checkout: number;
  purchases: number;
  currency?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

const STATUS_CONFIRMED = new Set(["confirmed", "shipped", "delivered", "paid"]);

export default function TrackerPage() {
  // ── Filtres globaux ("all" = Tout l'historique par défaut pour voir toutes les vraies données) ──
  const [filterDays, setFilterDays] = useState<number>(0); // 0 = Tout l'historique, 1 = Aujourd'hui, 7 = 7j, 30 = 30j
  const [selectedSlug, setSelectedSlug] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedUrlParams, setCopiedUrlParams] = useState<boolean>(false);

  // ── Données internes Isivente (Supabase) ──
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [sessions, setSessions] = useState<AnalyticsRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);

  // ── Connexion Meta Ads API ou Saisie Rapide ──
  const [adAccountId, setAdAccountId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(615);
  const [metaConnected, setMetaConnected] = useState<boolean>(false);
  const [metaAccountName, setMetaAccountName] = useState<string>("");
  const [metaAds, setMetaAds] = useState<MetaAdInsight[]>([]);
  const [metaLoading, setMetaLoading] = useState<boolean>(false);
  const [metaError, setMetaError] = useState<string>("");
  const [showMetaModal, setShowMetaModal] = useState<boolean>(false);

  // ── Simulateur / Diagnostic Rapide ──
  const [manualSpendFcfa, setManualSpendFcfa] = useState<number>(15000);
  const [manualImpressions, setManualImpressions] = useState<number>(8500);
  const [manualLinkClicks, setManualLinkClicks] = useState<number>(160);
  const [unitProductCost, setUnitProductCost] = useState<number>(4500);
  const [unitDeliveryCost, setUnitDeliveryCost] = useState<number>(1500);

  const META_UTM_TEMPLATE =
    "utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}";

  const copyUtmTemplate = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(META_UTM_TEMPLATE);
      setCopiedUrlParams(true);
      setTimeout(() => setCopiedUrlParams(false), 2500);
    }
  };

  useEffect(() => {
    try {
      const savedAcc = localStorage.getItem("isivente_meta_account_id") || "";
      const savedTok = localStorage.getItem("isivente_meta_access_token") || "";
      const savedRate = Number(
        localStorage.getItem("isivente_meta_rate_fcfa") || "615"
      );
      if (savedAcc) setAdAccountId(savedAcc);
      if (savedTok) setAccessToken(savedTok);
      if (savedRate > 0) setExchangeRate(savedRate);
    } catch {}
  }, []);

  // ── Charger les vraies données du site (Commandes + Visiteurs + Paniers abandonnés) ──
  const fetchSiteData = async () => {
    setLoading(true);
    let sinceIso: string | null = null;
    if (filterDays > 0) {
      const since = new Date();
      if (filterDays === 1) {
        since.setHours(0, 0, 0, 0);
      } else {
        since.setDate(since.getDate() - filterDays);
      }
      sinceIso = since.toISOString();
    }

    let oQuery = supabase
      .from("orders")
      .select(
        "id, order_number, product_slug, product_title, total_amount, status, created_at, utm_source, utm_medium, utm_campaign, utm_content"
      )
      .order("created_at", { ascending: false })
      .limit(2000);

    let aQuery = supabase
      .from("analytics")
      .select("session_id, product_slug, duration_seconds, clicked, created_at")
      .limit(10000);

    let lQuery = supabase
      .from("leads")
      .select("id, product_slug, status, created_at")
      .limit(5000);

    if (sinceIso) {
      oQuery = oQuery.gte("created_at", sinceIso);
      aQuery = aQuery.gte("created_at", sinceIso);
      lQuery = lQuery.gte("created_at", sinceIso);
    }

    const [ordersRes, analyticsRes, leadsRes] = await Promise.all([
      oQuery,
      aQuery,
      lQuery,
    ]);

    if (ordersRes.data) setOrders(ordersRes.data as OrderRow[]);
    if (analyticsRes.data) setSessions(analyticsRes.data as AnalyticsRow[]);
    if (leadsRes.data) setLeads(leadsRes.data as LeadRow[]);
    setLoading(false);
  };

  const [liveToast, setLiveToast] = useState<{
    text: string;
    type: "order" | "lead";
  } | null>(null);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    fetchSiteData().then(() => {
      initialLoadRef.current = true;
    });
  }, [filterDays]);

  // ── Écoute en temps réel Supabase (Nouvelles Commandes & Nouveaux Prospects) ──
  useEffect(() => {
    const ordersChannel = supabase
      .channel("realtime-tracker-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as OrderRow;
          setOrders((prev) => [newOrder, ...prev]);
          if (initialLoadRef.current) {
            playAlertNotificationSound();
            setLiveToast({
              text: `Nouvelle Commande #${newOrder.order_number} (${fmt(newOrder.total_amount)} F) !`,
              type: "order",
            });
            setTimeout(() => setLiveToast(null), 5000);
          }
        }
      )
      .subscribe();

    const leadsChannel = supabase
      .channel("realtime-tracker-leads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const newLead = payload.new as LeadRow;
          setLeads((prev) => [newLead, ...prev]);
          if (initialLoadRef.current) {
            playAlertNotificationSound();
            setLiveToast({
              text: `Nouveau Panier Abandonné capturé (${newLead.product_slug}) !`,
              type: "lead",
            });
            setTimeout(() => setLiveToast(null), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(leadsChannel);
    };
  }, []);

  // ── Synchroniser avec Meta Marketing API ──
  const syncMetaAds = async (customAcc?: string, customTok?: string) => {
    const acc = (customAcc ?? adAccountId).trim();
    const tok = (customTok ?? accessToken).trim();
    if (!acc || !tok) {
      setMetaError(
        "Veuillez entrer votre ID de compte pub (ex: act_123456789) et votre jeton d'accès."
      );
      return;
    }

    setMetaLoading(true);
    setMetaError("");
    try {
      localStorage.setItem("isivente_meta_account_id", acc);
      localStorage.setItem("isivente_meta_access_token", tok);
      localStorage.setItem("isivente_meta_rate_fcfa", String(exchangeRate));
    } catch {}

    const preset =
      filterDays === 1
        ? "today"
        : filterDays === 7
        ? "last_7d"
        : filterDays === 30
        ? "last_30d"
        : "maximum";

    try {
      const res = await fetch("/api/meta-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_account_id: acc,
          access_token: tok,
          date_preset: preset,
          level: "ad",
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setMetaError(json.error || "Impossible de récupérer les données Meta.");
        setMetaConnected(false);
      } else {
        setMetaConnected(true);
        setMetaAccountName(json.account?.name || acc);
        const curr = json.account?.currency || "USD";
        const rate = curr === "XOF" ? 1 : curr === "EUR" ? 655 : exchangeRate;
        if (curr === "XOF") setExchangeRate(1);
        if (curr === "EUR") setExchangeRate(655);

        const rows: MetaAdInsight[] = json.rows || [];
        setMetaAds(rows);

        const totalSpendOrig = rows.reduce((s, r) => s + (r.spend || 0), 0);
        const totalImp = rows.reduce((s, r) => s + (r.impressions || 0), 0);
        const totalClicks = rows.reduce(
          (s, r) => s + (r.inline_link_clicks || r.clicks || 0),
          0
        );
        if (totalSpendOrig > 0 || totalImp > 0) {
          setManualSpendFcfa(Math.round(totalSpendOrig * rate));
          setManualImpressions(totalImp);
          setManualLinkClicks(totalClicks);
        }
        setShowMetaModal(false);
      }
    } catch (err: any) {
      setMetaError(err?.message || "Erreur réseau lors de l'appel à Meta.");
    } finally {
      setMetaLoading(false);
    }
  };

  // ── Import CSV exporté depuis le Gestionnaire de Publicités Meta ──
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target?.result || "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/"/g, "").trim().toLowerCase());
      const parsedRows: MetaAdInsight[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
        if (cols.length < 3) continue;

        const getCol = (keywords: string[]) => {
          const idx = headers.findIndex((h) =>
            keywords.some((kw) => h.includes(kw))
          );
          return idx >= 0 ? cols[idx] : "";
        };

        const adName =
          getCol([
            "nom de la publicité",
            "ad name",
            "nom de la campagne",
            "campaign name",
          ]) || `Publicité #${i}`;
        const spend =
          parseFloat(
            getCol(["montant dépensé", "amount spent", "spend"]).replace(
              ",",
              "."
            )
          ) || 0;
        const impressions =
          parseInt(getCol(["impressions"]).replace(/\s/g, ""), 10) || 0;
        const linkClicks =
          parseInt(
            getCol(["clics sur un lien", "link clicks", "clicks"]).replace(
              /\s/g,
              ""
            ),
            10
          ) || 0;
        const ctr =
          parseFloat(getCol(["ctr"]).replace(",", ".").replace("%", "")) || 0;
        const lpv =
          parseInt(
            getCol([
              "vues de page de destination",
              "landing page views",
            ]).replace(/\s/g, ""),
            10
          ) || 0;
        const purchases =
          parseInt(
            getCol(["achats", "purchases", "résultats", "results"]),
            10
          ) || 0;

        if (spend > 0 || impressions > 0) {
          parsedRows.push({
            ad_name: adName,
            spend,
            impressions,
            clicks: linkClicks,
            inline_link_clicks: linkClicks,
            ctr: ctr || (impressions > 0 ? (linkClicks / impressions) * 100 : 0),
            cpc: linkClicks > 0 ? spend / linkClicks : 0,
            cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
            landing_page_views: lpv,
            add_to_cart: 0,
            initiate_checkout: 0,
            purchases,
          });
        }
      }

      if (parsedRows.length > 0) {
        setMetaAds(parsedRows);
        setMetaConnected(true);
        setMetaAccountName(`Import CSV (${parsedRows.length} pubs)`);
        const totalSpend = parsedRows.reduce((s, r) => s + r.spend, 0);
        const totalImp = parsedRows.reduce((s, r) => s + r.impressions, 0);
        const totalClk = parsedRows.reduce(
          (s, r) => s + r.inline_link_clicks,
          0
        );
        setManualSpendFcfa(
          Math.round(totalSpend * (totalSpend < 500 ? exchangeRate : 1))
        );
        setManualImpressions(totalImp);
        setManualLinkClicks(totalClk);
      }
    };
    reader.readAsText(file);
  };

  // ── Tableau de Performance Réelle par Produit (100% Automatique depuis Supabase) ──
  const productScorecard = useMemo(() => {
    const map: Record<
      string,
      {
        slug: string;
        title: string;
        visitors: number;
        clicked: number;
        abandonedLeads: number;
        totalLeads: number;
        orders: number;
        confirmed: number;
        revenue: number;
        conversionRate: number;
      }
    > = {};

    const ensure = (slug: string) => {
      const clean = (slug || "autre").toLowerCase();
      if (!map[clean]) {
        const cat = DEFAULT_CATALOG_MAP[clean];
        map[clean] = {
          slug: clean,
          title: cat?.shortTitle || cat?.title || clean,
          visitors: 0,
          clicked: 0,
          abandonedLeads: 0,
          totalLeads: 0,
          orders: 0,
          confirmed: 0,
          revenue: 0,
          conversionRate: 0,
        };
      }
      return map[clean];
    };

    sessions.forEach((s) => {
      if (!s.product_slug || s.product_slug.includes("_exit_")) return;
      const item = ensure(s.product_slug);
      item.visitors += 1;
      if (s.clicked) item.clicked += 1;
    });

    leads.forEach((l) => {
      if (!l.product_slug) return;
      const item = ensure(l.product_slug);
      item.totalLeads += 1;
      if (l.status !== "converted") item.abandonedLeads += 1;
    });

    orders.forEach((o) => {
      if (!o.product_slug) return;
      const item = ensure(o.product_slug);
      item.orders += 1;
      if (STATUS_CONFIRMED.has((o.status || "").toLowerCase())) {
        item.confirmed += 1;
      }
      item.revenue += Number(o.total_amount) || 0;
    });

    return Object.values(map)
      .filter((p) => p.visitors > 0 || p.orders > 0 || p.totalLeads > 0)
      .map((p) => ({
        ...p,
        conversionRate:
          p.visitors > 0
            ? (p.orders / p.visitors) * 100
            : p.orders > 0
            ? 100
            : 0,
      }))
      .sort((a, b) => b.orders - a.orders || b.visitors - a.visitors);
  }, [sessions, leads, orders]);

  // ── Filtrage des données du site par produit ──
  const filteredOrders = useMemo(
    () =>
      selectedSlug === "all"
        ? orders
        : orders.filter((o) => o.product_slug === selectedSlug),
    [orders, selectedSlug]
  );

  const filteredSessions = useMemo(
    () =>
      selectedSlug === "all"
        ? sessions.filter((s) => !s.product_slug?.includes("_exit_"))
        : sessions.filter((s) => s.product_slug === selectedSlug),
    [sessions, selectedSlug]
  );

  const filteredLeads = useMemo(
    () =>
      selectedSlug === "all"
        ? leads
        : leads.filter((l) => l.product_slug === selectedSlug),
    [leads, selectedSlug]
  );

  // ── Calcul de l'Entonnoir Complet ──
  const funnel = useMemo(() => {
    const impressions = Math.max(manualImpressions, 1);
    const linkClicks = Math.max(manualLinkClicks, 0);
    const realVisitors = filteredSessions.length;
    const engagedScrollClicks = filteredSessions.filter((s) => s.clicked).length;
    const abandonedPhones = filteredLeads.filter(
      (l) => l.status !== "converted"
    ).length;
    const completedOrders = filteredOrders.length;
    const startedPhoneForm = abandonedPhones + completedOrders;
    const confirmedOrders = filteredOrders.filter((o) =>
      STATUS_CONFIRMED.has((o.status || "").toLowerCase())
    ).length;

    const grossRevenue = filteredOrders.reduce(
      (s, o) => s + (Number(o.total_amount) || 0),
      0
    );
    const confirmedRevenue = filteredOrders
      .filter((o) => STATUS_CONFIRMED.has((o.status || "").toLowerCase()))
      .reduce((s, o) => s + (Number(o.total_amount) || 0), 0);

    const ctr = impressions > 0 ? (linkClicks / impressions) * 100 : 0;
    const cpmFcfa = impressions > 0 ? (manualSpendFcfa / impressions) * 1000 : 0;
    const cpcFcfa = linkClicks > 0 ? manualSpendFcfa / linkClicks : 0;

    const landingArrivalRate =
      linkClicks > 0 ? Math.min(100, (realVisitors / linkClicks) * 100) : 0;

    const intentCount = Math.max(
      engagedScrollClicks,
      startedPhoneForm,
      completedOrders
    );
    const pageIntentRate =
      realVisitors > 0 ? Math.min(100, (intentCount / realVisitors) * 100) : 0;

    const siteConversionRate =
      realVisitors > 0
        ? (completedOrders / realVisitors) * 100
        : linkClicks > 0
        ? (completedOrders / linkClicks) * 100
        : 0;

    const cpaOrder =
      completedOrders > 0 ? manualSpendFcfa / completedOrders : manualSpendFcfa;

    const activeOrdersCount =
      confirmedOrders > 0 ? confirmedOrders : completedOrders;
    const activeRevenue =
      confirmedOrders > 0 ? confirmedRevenue : grossRevenue;
    const totalCosts =
      manualSpendFcfa +
      activeOrdersCount * (unitProductCost + unitDeliveryCost);
    const netProfit = activeRevenue - totalCosts;

    return {
      impressions,
      linkClicks,
      realVisitors,
      intentCount,
      startedPhoneForm,
      abandonedPhones,
      completedOrders,
      confirmedOrders,
      grossRevenue,
      confirmedRevenue,
      ctr,
      cpmFcfa,
      cpcFcfa,
      landingArrivalRate,
      pageIntentRate,
      siteConversionRate,
      cpaOrder,
      netProfit,
    };
  }, [
    manualImpressions,
    manualLinkClicks,
    manualSpendFcfa,
    filteredSessions,
    filteredLeads,
    filteredOrders,
    unitProductCost,
    unitDeliveryCost,
  ]);

  return (
    <div className="space-y-6 pb-12 relative">
      {/* ── TOAST ALERT EN TEMPS RÉEL (FLOTTANT) ── */}
      {liveToast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-xs sm:text-sm font-bold border transition-all animate-bounce ${
            liveToast.type === "order"
              ? "bg-emerald-600 border-emerald-400"
              : "bg-amber-600 border-amber-400"
          }`}
        >
          <Bell className="w-5 h-5 text-white animate-pulse" />
          <span>{liveToast.text}</span>
        </div>
      )}

      {/* ── 1. EN-TÊTE & SÉLECTEUR DE PÉRIODE ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pixel CAPI + Auto-Capture fbclid / _fbc Actifs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Tracker Publicitaire & Diagnostic Conversion (Objectif 20+ Ventes)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Visualisez en un coup d'œil quels produits convertissent vos visiteurs en acheteurs, quels produits brûlent votre budget pub, et où vos clients s'arrêtent.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { label: "Aujourd'hui", val: 1 },
              { label: "7 jours", val: 7 },
              { label: "30 jours", val: 30 },
              { label: "Tout", val: 0 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setFilterDays(p.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterDays === p.val
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMetaModal(!showMetaModal)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              metaConnected
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-xs"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>
              {metaConnected
                ? `Connecté : ${metaAccountName}`
                : "Connecter Compte Pub Meta"}
            </span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Importer CSV Meta</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ── 2. PARAMÈTRE URL DYNAMIQUE META ADS (À COPIER 1 FOIS DANS VOS PUBS) ── */}
      <div className="bg-indigo-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
            <Link2 className="w-4 h-4" />
            <span>
              Paramètre URL Dynamique Meta Ads (Pour voir automatiquement le nom de chaque pub & vidéo qui vend)
            </span>
          </div>
          <p className="text-xs text-indigo-100/90">
            Collez cette ligne dans la case <strong>« Paramètres d'URL »</strong> tout en bas de votre publicité Facebook/Instagram : Meta remplacera automatiquement le nom de la campagne et de la vidéo.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <code className="bg-indigo-900/90 border border-indigo-700 px-3 py-2 rounded-xl text-[11px] font-mono text-indigo-100 select-all">
            {META_UTM_TEMPLATE}
          </code>
          <button
            onClick={copyUtmTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-extrabold cursor-pointer shrink-0"
          >
            {copiedUrlParams ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 3. CLASSEMENT AUTOMATIQUE DE VOS PRODUITS (QUI CONVERTIT vs QUI BRÛLE LE BUDGET) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>
                Diagnostic Réel par Produit (Cliquez sur un produit pour filtrer l'entonnoir)
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Données 100% vérifiées issues de votre base Supabase : comparez le taux de conversion réel de chaque page.
            </p>
          </div>
          {selectedSlug !== "all" && (
            <button
              onClick={() => setSelectedSlug("all")}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Afficher tous les produits ({orders.length} commandes)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3">Produit</th>
                <th className="p-3">Visiteurs Réels</th>
                <th className="p-3">Paniers Abandonnés</th>
                <th className="p-3">Commandes Validées</th>
                <th className="p-3">Taux de Conversion</th>
                <th className="p-3">Chiffre d'Affaires</th>
                <th className="p-3">Verdict & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productScorecard.map((p) => {
                let badge = {
                  text: "🟡 EN TEST (Peu de trafic)",
                  cls: "bg-slate-100 text-slate-700",
                };
                if (p.conversionRate >= 4.5 && p.orders >= 1) {
                  badge = {
                    text: "🟢 WINNER À SCALER (Mettre du budget)",
                    cls: "bg-emerald-100 text-emerald-800",
                  };
                } else if (p.conversionRate >= 2.5 && p.orders >= 1) {
                  badge = {
                    text: "🟢 RENTABLE (Relancer les abandonnés)",
                    cls: "bg-blue-100 text-blue-800",
                  };
                } else if (p.visitors >= 40 && p.orders === 0) {
                  badge = {
                    text: "🔴 COUPEZ LA PUB (0 vente sur " + p.visitors + " visites)",
                    cls: "bg-rose-100 text-rose-700",
                  };
                }

                const isSelected = selectedSlug === p.slug;
                return (
                  <tr
                    key={p.slug}
                    onClick={() =>
                      setSelectedSlug(isSelected ? "all" : p.slug)
                    }
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50/70 font-semibold"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-900">
                      <div>{p.title}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        /p/{p.slug}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {fmt(p.visitors)}
                    </td>
                    <td className="p-3 font-mono">
                      {p.abandonedLeads > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                          {p.abandonedLeads} à relancer
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-extrabold text-slate-900">
                      {fmt(p.orders)}
                    </td>
                    <td className="p-3 font-mono font-extrabold">
                      <span
                        className={
                          p.conversionRate >= 4
                            ? "text-emerald-600"
                            : p.conversionRate > 0
                            ? "text-blue-600"
                            : "text-rose-600"
                        }
                      >
                        {p.conversionRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {fmt(p.revenue)} F
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PANNEAU DE CONNEXION DIRECTE API META (Affiché au clic) ── */}
      {showMetaModal && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Connexion directe à votre Compte Publicitaire Meta (Graph API)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lecture seule 100% sécurisée : récupère vos dépenses, impressions, CTR, clics et campagnes sans quitter Isivente.
              </p>
            </div>
            <button
              onClick={() => setShowMetaModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              Fermer ✕
            </button>
          </div>

          {metaError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {metaError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. ID du Compte Publicitaire (act_...)
              </label>
              <input
                type="text"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                placeholder="Ex: act_102938475610293"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Jeton d'accès Meta Marketing (avec permission ads_read)
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAABwzLixnjYBO..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Taux de conversion en FCFA (si compte en $ ou €)
              </label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value) || 615)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => syncMetaAds()}
              disabled={metaLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${metaLoading ? "animate-spin" : ""}`}
              />
              <span>
                {metaLoading
                  ? "Synchronisation en cours..."
                  : "Synchroniser mes publicités Meta"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── 4. SIMULATEUR & ENTONNOIR EN 5 ÉTAPES ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800">
              Produit sélectionné dans l'entonnoir :
            </span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">
                Tous les produits ({orders.length} commandes / {sessions.length} visites)
              </option>
              {DEFAULT_CATALOG.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.shortTitle || p.title} (/p/{p.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800">
              CPA : <strong className="font-mono">{fmt(funnel.cpaOrder)} F</strong> / vente
            </span>
            <span
              className={`px-3 py-1.5 rounded-xl ${
                funnel.netProfit >= 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              Profit Net :{" "}
              <strong className="font-mono">
                {funnel.netProfit >= 0 ? "+" : ""}
                {fmt(funnel.netProfit)} F
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Budget Pub Dépensé (FCFA)
            </label>
            <input
              type="number"
              value={manualSpendFcfa}
              onChange={(e) =>
                setManualSpendFcfa(Math.max(0, Number(e.target.value)))
              }
              className="mt-1 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-extrabold text-sm text-slate-900"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Impressions Meta
            </label>
            <input
              type="number"
              value={manualImpressions}
              onChange={(e) =>
                setManualImpressions(Math.max(0, Number(e.target.value)))
              }
              className="mt-1 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-extrabold text-sm text-slate-900"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Clics sur le lien (Meta)
            </label>
            <input
              type="number"
              value={manualLinkClicks}
              onChange={(e) =>
                setManualLinkClicks(Math.max(0, Number(e.target.value)))
              }
              className="mt-1 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-extrabold text-sm text-slate-900"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Coût Produit Unitaire (F)
            </label>
            <input
              type="number"
              value={unitProductCost}
              onChange={(e) =>
                setUnitProductCost(Math.max(0, Number(e.target.value)))
              }
              className="mt-1 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-extrabold text-sm text-slate-900"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Livraison Unitaire (F)
            </label>
            <input
              type="number"
              value={unitDeliveryCost}
              onChange={(e) =>
                setUnitDeliveryCost(Math.max(0, Number(e.target.value)))
              }
              className="mt-1 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-extrabold text-sm text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div
            className={`p-4 rounded-2xl border-2 space-y-2 ${
              funnel.ctr < 1.5
                ? "bg-rose-50/40 border-rose-300"
                : funnel.ctr < 2.2
                ? "bg-amber-50/40 border-amber-300"
                : "bg-emerald-50/40 border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
              <span>1. Pub Meta (CTR)</span>
              <Eye className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {funnel.ctr.toFixed(2)}%
            </div>
            <p className="text-xs text-slate-600">
              <strong>{fmt(funnel.linkClicks)} clics</strong> sur{" "}
              {fmt(funnel.impressions)} vues
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              CPC : <strong className="text-slate-800">{fmt(funnel.cpcFcfa)} F</strong>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 space-y-2 ${
              funnel.landingArrivalRate < 60
                ? "bg-rose-50/40 border-rose-300"
                : "bg-emerald-50/40 border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
              <span>2. Visiteurs Réels</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {fmt(funnel.realVisitors)}
            </div>
            <p className="text-xs text-slate-600">
              Visiteurs humains arrivés sur la page
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              Arrivée :{" "}
              <strong className="text-slate-800">
                {funnel.landingArrivalRate.toFixed(0)}%
              </strong>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 space-y-2 ${
              funnel.pageIntentRate < 12
                ? "bg-amber-50/40 border-amber-300"
                : "bg-emerald-50/40 border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
              <span>3. Intention d'achat</span>
              <MousePointerClick className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {fmt(funnel.intentCount)}
            </div>
            <p className="text-xs text-slate-600">
              Clics Commander / Formulaire
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              Intérêt :{" "}
              <strong className="text-slate-800">
                {funnel.pageIntentRate.toFixed(1)}%
              </strong>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 space-y-2 ${
              funnel.abandonedPhones > 0
                ? "bg-amber-50/40 border-amber-300"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
              <span>4. Paniers Abandonnés</span>
              <MessageCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-700">
              {fmt(funnel.abandonedPhones)}
            </div>
            <p className="text-xs text-slate-600">
              Ont tapé leur numéro sans valider
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              À relancer sur WhatsApp
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border-2 space-y-2 ${
              funnel.siteConversionRate < 2.5
                ? "bg-rose-50/40 border-rose-300"
                : "bg-emerald-50/40 border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
              <span>5. Commandes Site</span>
              <ShoppingBag className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {fmt(funnel.completedOrders)}
            </div>
            <p className="text-xs text-slate-600">
              CA : <strong>{fmt(funnel.grossRevenue)} F</strong>
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              Taux conv. :{" "}
              <strong className="text-slate-800">
                {funnel.siteConversionRate.toFixed(2)}%
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
