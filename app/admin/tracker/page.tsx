"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_CATALOG } from "@/lib/defaultCatalog";
import {
  TrendingUp,
  Target,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  KeyRound,
  Upload,
  Filter,
  ArrowRight,
  ShoppingBag,
  Users,
  MousePointerClick,
  Eye,
  DollarSign,
  Sparkles,
  Flame,
  HelpCircle,
  MessageCircle,
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
  // ── Filtres globaux ──
  const [filterDays, setFilterDays] = useState<number>(7);
  const [selectedSlug, setSelectedSlug] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  // ── Données internes Isivente (Supabase) ──
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [sessions, setSessions] = useState<AnalyticsRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);

  // ── Connexion Meta Ads API ou Saisie Rapide ──
  const [adAccountId, setAdAccountId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(615); // 1 USD = ~615 FCFA (ou 655 pour EUR, 1 pour XOF)
  const [metaConnected, setMetaConnected] = useState<boolean>(false);
  const [metaAccountName, setMetaAccountName] = useState<string>("");
  const [metaCurrency, setMetaCurrency] = useState<string>("USD");
  const [metaAds, setMetaAds] = useState<MetaAdInsight[]>([]);
  const [metaLoading, setMetaLoading] = useState<boolean>(false);
  const [metaError, setMetaError] = useState<string>("");
  const [showMetaModal, setShowMetaModal] = useState<boolean>(false);

  // ── Simulateur / Diagnostic Rapide (sans même besoin de token) ──
  const [manualSpendFcfa, setManualSpendFcfa] = useState<number>(15000);
  const [manualImpressions, setManualImpressions] = useState<number>(8500);
  const [manualLinkClicks, setManualLinkClicks] = useState<number>(160);
  const [unitProductCost, setUnitProductCost] = useState<number>(4500);
  const [unitDeliveryCost, setUnitDeliveryCost] = useState<number>(1500);

  // Charger les identifiants Meta sauvegardés localement
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
    const since = new Date();
    if (filterDays === 1) {
      since.setHours(0, 0, 0, 0);
    } else {
      since.setDate(since.getDate() - filterDays);
    }
    const sinceIso = since.toISOString();

    const [ordersRes, analyticsRes, leadsRes] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, order_number, product_slug, total_amount, status, created_at, utm_source, utm_medium, utm_campaign, utm_content"
        )
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false }),
      supabase
        .from("analytics")
        .select(
          "session_id, product_slug, duration_seconds, clicked, created_at"
        )
        .gte("created_at", sinceIso)
        .limit(10000),
      supabase
        .from("leads")
        .select("id, product_slug, status, created_at")
        .gte("created_at", sinceIso)
        .limit(5000),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data as OrderRow[]);
    if (analyticsRes.data) setSessions(analyticsRes.data as AnalyticsRow[]);
    if (leadsRes.data) setLeads(leadsRes.data as LeadRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSiteData();
  }, [filterDays]);

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
        : filterDays <= 7
        ? "last_7d"
        : filterDays <= 30
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
        setMetaCurrency(curr);
        const rate = curr === "XOF" ? 1 : curr === "EUR" ? 655 : exchangeRate;
        if (curr === "XOF") setExchangeRate(1);
        if (curr === "EUR") setExchangeRate(655);

        const rows: MetaAdInsight[] = json.rows || [];
        setMetaAds(rows);

        // Mettre à jour automatiquement les totaux du diagnostic avec les vrais chiffres Meta
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

      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
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
          getCol(["nom de la publicité", "ad name", "nom de la campagne", "campaign name"]) ||
          `Publicité #${i}`;
        const spend = parseFloat(
          getCol(["montant dépensé", "amount spent", "spend"]).replace(",", ".")
        ) || 0;
        const impressions =
          parseInt(getCol(["impressions"]).replace(/\s/g, ""), 10) || 0;
        const linkClicks =
          parseInt(
            getCol(["clics sur un lien", "link clicks", "clicks"]).replace(/\s/g, ""),
            10
          ) || 0;
        const ctr =
          parseFloat(getCol(["ctr"]).replace(",", ".").replace("%", "")) || 0;
        const lpv =
          parseInt(
            getCol(["vues de page de destination", "landing page views"]).replace(
              /\s/g,
              ""
            ),
            10
          ) || 0;
        const purchases =
          parseInt(getCol(["achats", "purchases", "résultats", "results"]), 10) || 0;

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
        const totalClk = parsedRows.reduce((s, r) => s + r.inline_link_clicks, 0);
        setManualSpendFcfa(
          Math.round(totalSpend * (totalSpend < 500 ? exchangeRate : 1))
        );
        setManualImpressions(totalImp);
        setManualLinkClicks(totalClk);
      }
    };
    reader.readAsText(file);
  };

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
        ? sessions
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

  // ── Calcul de l'Entonnoir Complet (Les 6 Étapes où les ventes se perdent) ──
  const funnel = useMemo(() => {
    const impressions = Math.max(manualImpressions, 1);
    const linkClicks = Math.max(manualLinkClicks, 0);
    const realVisitors = filteredSessions.length;
    const engagedScrollClicks = filteredSessions.filter((s) => s.clicked).length;
    const startedPhoneForm = filteredLeads.length + filteredOrders.length;
    const completedOrders = filteredOrders.length;
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

    // Ratios clés
    const ctr = impressions > 0 ? (linkClicks / impressions) * 100 : 0;
    const cpmFcfa = impressions > 0 ? (manualSpendFcfa / impressions) * 1000 : 0;
    const cpcFcfa = linkClicks > 0 ? manualSpendFcfa / linkClicks : 0;

    // Taux d'arrivée sur le site (Clics Meta -> Vrais visiteurs arrivés sur la page)
    const landingArrivalRate =
      linkClicks > 0 ? Math.min(100, (realVisitors / linkClicks) * 100) : 0;

    // Taux d'intention d'achat sur la page (Visiteurs -> Clic sur Commander ou saisie numéro)
    const intentCount = Math.max(engagedScrollClicks, startedPhoneForm, completedOrders);
    const pageIntentRate =
      realVisitors > 0 ? Math.min(100, (intentCount / realVisitors) * 100) : 0;

    // Taux de validation du formulaire (Personnes ayant commencé à taper leur numéro -> Commande validée)
    const formCompletionRate =
      startedPhoneForm > 0
        ? Math.min(100, (completedOrders / startedPhoneForm) * 100)
        : realVisitors > 0
        ? (completedOrders / realVisitors) * 100
        : 0;

    // Taux de conversion global du site (Visiteurs -> Commandes)
    const siteConversionRate =
      realVisitors > 0
        ? (completedOrders / realVisitors) * 100
        : linkClicks > 0
        ? (completedOrders / linkClicks) * 100
        : 0;

    // Coût par Achat (CPA)
    const cpaOrder =
      completedOrders > 0 ? manualSpendFcfa / completedOrders : manualSpendFcfa;

    // Profit Net estimé
    const activeOrdersCount = confirmedOrders > 0 ? confirmedOrders : completedOrders;
    const activeRevenue = confirmedOrders > 0 ? confirmedRevenue : grossRevenue;
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
      abandonedPhones: filteredLeads.filter((l) => l.status === "abandoned").length,
      completedOrders,
      confirmedOrders,
      grossRevenue,
      confirmedRevenue,
      ctr,
      cpmFcfa,
      cpcFcfa,
      landingArrivalRate,
      pageIntentRate,
      formCompletionRate,
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

  // ── Diagnostic Automatique : Pourquoi vous faites < 5 ventes au lieu de 20+ ? ──
  const bottlenecks = useMemo(() => {
    const list: {
      severity: "critical" | "warning" | "good";
      stage: string;
      title: string;
      metric: string;
      benchmark: string;
      explanation: string;
      fix: string;
    }[] = [];

    // 1. Analyse du CTR (Créa / Accroche sur Facebook & Instagram)
    if (funnel.ctr < 1.5) {
      list.push({
        severity: "critical",
        stage: "Étape 1 • Créa Publicitaire (Meta)",
        title: "Votre image/vidéo n'arrête pas assez le scroll (CTR trop bas)",
        metric: `${funnel.ctr.toFixed(2)}%`,
        benchmark: "Objectif gagnant au Bénin : > 2,2%",
        explanation:
          "Quand quelqu'un fait 20 ventes avec le même budget, sa pub obtient 2,5% à 4% de taux de clic (le clic lui coûte 35 à 60 FCFA). À moins de 1,5%, vous payez chaque clic trop cher et vous envoyez 3 fois moins de monde sur votre site.",
        fix: "Utilisez en 1ère image l'effet Avant/Après ou une vidéo de 3 secondes qui montre le résultat immédiat dès la 1ère seconde, avec le prix (14 900 F + Paiement à la livraison) écrit dans le texte de la pub pour filtrer les curieux.",
      });
    } else if (funnel.ctr < 2.2) {
      list.push({
        severity: "warning",
        stage: "Étape 1 • Créa Publicitaire (Meta)",
        title: "Taux de clic correct mais améliorable pour scaler à 20 ventes/jour",
        metric: `${funnel.ctr.toFixed(2)}%`,
        benchmark: "Objectif gagnant : > 2,5%",
        explanation:
          "Votre créa attire l'attention mais peut générer 2 fois plus de visiteurs pour le même budget si le visuel montre la transformation Avant/Après dès le premier coup d'œil.",
        fix: "Testez 3 créas dans le même ensemble de publicités : 1 image Avant/Après, 1 image Bénéfices + Prix, et 1 vidéo démonstration.",
      });
    } else {
      list.push({
        severity: "good",
        stage: "Étape 1 • Créa Publicitaire (Meta)",
        title: "Excellente créa publicitaire : les gens cliquent massivement !",
        metric: `${funnel.ctr.toFixed(2)}%`,
        benchmark: "Objectif : > 2,2%",
        explanation:
          "Le problème ne vient PAS de votre créa publicitaire : votre coût par clic est bas et les gens veulent voir le produit.",
        fix: "Gardez cette créa active, le blocage se situe plus bas sur la page ou le ciblage.",
      });
    }

    // 2. Analyse de la Perte entre le Clic Meta et l'arrivée réelle sur le site
    if (funnel.linkClicks > 15 && funnel.landingArrivalRate < 60) {
      list.push({
        severity: "critical",
        stage: "Étape 2 • Chargement & Connexion Mobile (3G/4G Bénin)",
        title: `${Math.round(100 - funnel.landingArrivalRate)}% des gens qui cliquent sur la pub quittent avant même que la page ne s'affiche`,
        metric: `${funnel.landingArrivalRate.toFixed(0)}% arrivent`,
        benchmark: "Objectif : > 75% d'arrivée",
        explanation:
          "Sur les réseaux MTN/Moov au Bénin ou dans le navigateur interne Facebook/Instagram, si l'annonce envoie beaucoup de clics accidentels (Audience Network) ou si le client clique sans savoir le prix, il referme tout de suite.",
        fix: "Dans votre ensemble de publicités Meta : décochez 'Audience Network' (gardez uniquement Fil Facebook, Fil Instagram, Reels et Stories) et optimisez toujours pour 'Ventes / Achats (Purchase)', jamais pour 'Clics sur un lien' ou 'Trafic'.",
      });
    }

    // 3. Analyse de la Conversion sur la Landing Page
    if (funnel.realVisitors >= 10 && funnel.siteConversionRate < 2.5) {
      list.push({
        severity: "critical",
        stage: "Étape 3 • Conversion de la Page & Alignement du Prix",
        title: "Beaucoup de visiteurs sur la page, mais peu valident le formulaire (< 2,5%)",
        metric: `${funnel.siteConversionRate.toFixed(1)}% de conversion`,
        benchmark: "Objectif COD Bénin : 4% à 8%",
        explanation:
          "Pour faire 20 ventes avec 15 000 F de pub (~250 visiteurs), il faut convertir au moins 6% à 8% des visiteurs. Si vous êtes sous 2,5%, soit vos visiteurs découvrent le prix sur le site et le trouvent plus élevé que ce qu'ils imaginaient, soit l'algorithme Meta vous envoie des 'visiteurs touristes' au lieu d'acheteurs.",
        fix: "1) Affichez clairement '14 900 FCFA - Paiement à la livraison' dans le texte de votre pub Facebook pour que seuls ceux qui ont les 14 900 F cliquent. 2) Ajoutez le Jeton Meta CAPI (Conversions API) sur Vercel pour que Meta sache exactement qui achète et cible uniquement les profils acheteurs au Bénin.",
      });
    } else if (funnel.realVisitors >= 10 && funnel.siteConversionRate >= 4) {
      list.push({
        severity: "good",
        stage: "Étape 3 • Conversion de la Page Produit",
        title: "Votre site convertit très bien les visiteurs en acheteurs !",
        metric: `${funnel.siteConversionRate.toFixed(1)}% de conversion`,
        benchmark: "Objectif : > 4%",
        explanation:
          "Votre landing page transforme efficacement les visiteurs en commandes.",
        fix: "Pour passer de 5 à 20 ventes, il suffit d'augmenter le nombre de clics entrants (meilleure créa ou budget).",
      });
    }

    // 4. Paniers Abandonnés (Numéros saisis sans cliquer sur Valider)
    if (funnel.abandonedPhones > 0) {
      list.push({
        severity: "warning",
        stage: "Étape 4 • Paniers Abandonnés & Hésitations",
        title: `${funnel.abandonedPhones} client(s) ont tapé leur numéro sans finaliser la commande`,
        metric: `${funnel.abandonedPhones} ventes en attente`,
        benchmark: "100% doivent être relancés en < 15 min",
        explanation:
          "Les vendeurs qui font 20+ ventes par jour au Bénin réalisent souvent 30% à 40% de leurs ventes en appelant ou en écrivant sur WhatsApp aux clients qui ont hésité sur le formulaire ou posé une question.",
        fix: "Allez dans l'onglet 'Paniers Abandonnés' ou laissez le Bot WhatsApp Awa connecté pour récupérer ces commandes automatiquement.",
      });
    }

    return list;
  }, [funnel]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── EN-TÊTE : POURQUOI MES PUBS BLOQUENT ? ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>Diagnostic Publicitaire Meta & Entonnoir de Vente</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Où bloquent vos publicités ? (Objectif 20+ ventes/jour)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Croisez les données de votre compte publicitaire Meta avec les visiteurs réels, les paniers abandonnés et les commandes validées sur votre site pour voir exactement à quelle étape vous perdez des ventes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur de période */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { label: "Aujourd'hui", val: 1 },
              { label: "7 jours", val: 7 },
              { label: "30 jours", val: 30 },
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

          {/* Bouton Connecter Compte Pub Meta */}
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

          {/* Bouton Importer CSV Meta */}
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
              <p className="text-[11px] text-slate-400 mt-1">
                Visible dans l'URL du Gestionnaire de publicités (`act=...`)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Jeton d'accès Meta (Access Token)
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAABwzLixnjYBO..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Généré dans Paramètres d'entreprise ou Explorateur API Graph (`ads_read`)
              </p>
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
              <p className="text-[11px] text-slate-400 mt-1">
                615 pour USD ($), 655 pour EUR (€), 1 pour XOF
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => syncMetaAds()}
              disabled={metaLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${metaLoading ? "animate-spin" : ""}`} />
              <span>
                {metaLoading ? "Synchronisation en cours..." : "Synchroniser mes publicités Meta"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── BARRE DE FILTRE PRODUIT & SAISIE RAPIDE DES CHIFFRES DU JOUR ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800">
              Produit analysé :
            </span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Tous les produits de la boutique ({orders.length} cmd)</option>
              {DEFAULT_CATALOG.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.shortTitle || p.title} (/p/{p.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-500">
            💡 <strong className="text-slate-700">Astuce immédiate :</strong> Entrez ci-dessous les 3 chiffres affichés sur votre pub Meta (ou connectez votre compte) pour voir instantanément où ça bloque.
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
              onChange={(e) => setManualSpendFcfa(Math.max(0, Number(e.target.value)))}
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
              onChange={(e) => setManualImpressions(Math.max(0, Number(e.target.value)))}
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
              onChange={(e) => setManualLinkClicks(Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-extrabold text-sm text-slate-900"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Coût d'achat 1 produit (F)
            </label>
            <input
              type="number"
              value={unitProductCost}
              onChange={(e) => setUnitProductCost(Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-extrabold text-sm text-slate-900"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="block text-[10px] font-bold uppercase text-slate-500">
              Frais Livreur / colis (F)
            </label>
            <input
              type="number"
              value={unitDeliveryCost}
              onChange={(e) => setUnitDeliveryCost(Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-extrabold text-sm text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* ── ENTONNOIR VISUEL EN 5 ÉTAPES : OÙ PERDEZ-VOUS VOS CLIENTS ? ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Radiographie complète de votre Tunnel (De la Pub Meta jusqu'au Cash)
            </h2>
            <p className="text-xs text-slate-500">
              Les cases en <span className="text-rose-600 font-bold">rouge</span> vous indiquent exactement où vos 20 ventes s'échappent aujourd'hui.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800">
              CPA actuel : <strong className="font-mono">{fmt(funnel.cpaOrder)} F</strong> / vente
            </span>
            <span
              className={`px-3 py-1.5 rounded-xl ${
                funnel.netProfit >= 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              Résultat Net :{" "}
              <strong className="font-mono">
                {funnel.netProfit >= 0 ? "+" : ""}
                {fmt(funnel.netProfit)} F
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Étape 1 : Impressions -> Clics */}
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
              <strong>{fmt(funnel.linkClicks)} clics</strong> sur {fmt(funnel.impressions)} vues
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              Coût par clic : <strong className="text-slate-800">{fmt(funnel.cpcFcfa)} F</strong>
            </div>
          </div>

          {/* Étape 2 : Clics -> Arrivée réelle sur la Landing Page */}
          <div
            className={`p-4 rounded-2xl border-2 space-y-2 ${
              funnel.landingArrivalRate < 60
                ? "bg-rose-50/40 border-rose-300"
                : "bg-emerald-50/40 border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
              <span>2. Arrivée sur Site</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {fmt(funnel.realVisitors)}
            </div>
            <p className="text-xs text-slate-600">
              Vrais visiteurs humains sur la page
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              Taux d'arrivée :{" "}
              <strong className="text-slate-800">
                {funnel.landingArrivalRate.toFixed(0)}%
              </strong>
            </div>
          </div>

          {/* Étape 3 : Intérêt sur la page (Scroll / Clic Commander / Début Formulaire) */}
          <div
            className={`p-4 rounded-2xl border-2 space-y-2 ${
              funnel.pageIntentRate < 15
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
              Ont cliqué sur « Commander » ou touché au formulaire
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              Engagement :{" "}
              <strong className="text-slate-800">
                {funnel.pageIntentRate.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Étape 4 : Paniers Abandonnés vs Formulaires soumis */}
          <div
            className={`p-4 rounded-2xl border-2 space-y-2 ${
              funnel.abandonedPhones > funnel.completedOrders
                ? "bg-amber-50/40 border-amber-300"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
              <span>4. Hésitations</span>
              <MessageCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-700">
              {fmt(funnel.abandonedPhones)}
            </div>
            <p className="text-xs text-slate-600">
              Numéros saisis sans valider la commande
            </p>
            <div className="pt-1 border-t border-slate-200/60 text-[11px] font-semibold text-slate-500">
              À relancer sur WhatsApp
            </div>
          </div>

          {/* Étape 5 : Vraies Commandes Validées */}
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
              Taux conv. site :{" "}
              <strong className="text-slate-800">
                {funnel.siteConversionRate.toFixed(2)}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIAGNOSTIC PRÉCIS : POURQUOI VOUS FAITES < 5 VENTES AU LIEU DE 20 ? ── */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-600" />
          <span>Diagnostic Chirurgical & Actions Correctives Immédiates</span>
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {bottlenecks.map((b, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 sm:p-5 bg-white shadow-2xs flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                b.severity === "critical"
                  ? "border-l-4 border-l-rose-600 border-slate-200"
                  : b.severity === "warning"
                  ? "border-l-4 border-l-amber-500 border-slate-200"
                  : "border-l-4 border-l-emerald-500 border-slate-200"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      b.severity === "critical"
                        ? "bg-rose-100 text-rose-700"
                        : b.severity === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {b.stage}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    Votre score : {b.metric}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({b.benchmark})
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {b.explanation}
                </p>
                <div className="pt-1.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800">
                    <strong className="text-indigo-700 font-bold">
                      ✅ Ce que vous devez faire maintenant :{" "}
                    </strong>
                    {b.fix}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPARATIF MATHÉMATIQUE : VOTRE PUB ACTUELLE vs BOUTIQUE À 20 VENTES/JOUR ── */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              La Loi Mathématique du E-Commerce au Bénin
            </span>
            <h3 className="text-base sm:text-lg font-extrabold mt-0.5">
              Pourquoi un concurrent fait 20 ventes avec {fmt(manualSpendFcfa)} FCFA et vous {funnel.completedOrders} ?
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="py-2.5 pr-4">Indicateur</th>
                <th className="py-2.5 px-4 text-rose-300">Vos chiffres actuels</th>
                <th className="py-2.5 px-4 text-emerald-300">
                  Boutique qui fait 20 ventes / jour
                </th>
                <th className="py-2.5 pl-4 text-slate-300">Où se joue la différence ?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-2.5 pr-4 font-semibold">Budget Pub Meta</td>
                <td className="py-2.5 px-4 font-mono">{fmt(manualSpendFcfa)} F</td>
                <td className="py-2.5 px-4 font-mono">{fmt(manualSpendFcfa)} F</td>
                <td className="py-2.5 pl-4 text-slate-400">Même budget dépensé</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-semibold">
                  Taux de clic sur la pub (CTR)
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-rose-300">
                  {funnel.ctr.toFixed(2)}% ({fmt(funnel.linkClicks)} clics)
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-300">
                  3,20% (~{fmt(Math.round((manualImpressions || 8500) * 0.032))} clics)
                </td>
                <td className="py-2.5 pl-4 text-slate-300">
                  Une créa à 3,2% amène <strong>2x plus de visiteurs gratuits</strong> pour le même prix
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-semibold">
                  Visiteurs qui chargent la page
                </td>
                <td className="py-2.5 px-4 font-mono">
                  {fmt(funnel.realVisitors)} visiteurs
                </td>
                <td className="py-2.5 px-4 font-mono text-emerald-300">
                  ~{fmt(Math.round((manualImpressions || 8500) * 0.032 * 0.85))} visiteurs
                </td>
                <td className="py-2.5 pl-4 text-slate-300">
                  Placement Fils/Reels uniquement (sans clics perdus Audience Network)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-semibold">
                  Taux de conversion du site
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-rose-300">
                  {funnel.siteConversionRate.toFixed(1)}% ({funnel.completedOrders} ventes)
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-300">
                  6,5% + Relances WhatsApp = 20 ventes
                </td>
                <td className="py-2.5 pl-4 text-slate-300">
                  Prix annoncé dans la pub + Pixel CAPI entraîné sur « Achat » + Relance WhatsApp
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TABLEAU DES PUBLICITÉS META SYNCHRONISÉES (SI CONNECTÉ OU CSV IMPORTÉ) ── */}
      {metaAds.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            Décision par Publicité Meta (Couper 🔴 vs Garder 🟢)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Publicité / Créa</th>
                  <th className="p-3">Dépense</th>
                  <th className="p-3">Impressions</th>
                  <th className="p-3">CTR</th>
                  <th className="p-3">Clics Lien</th>
                  <th className="p-3">Vues Page</th>
                  <th className="p-3">Achats Meta</th>
                  <th className="p-3">Verdict IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metaAds.map((ad, idx) => {
                  const rate =
                    ad.currency === "XOF"
                      ? 1
                      : ad.currency === "EUR"
                      ? 655
                      : exchangeRate;
                  const spendFcfa = Math.round(ad.spend * rate);
                  let verdict = {
                    label: "🟢 WINNER / SCALER",
                    cls: "bg-emerald-100 text-emerald-800",
                  };
                  if (spendFcfa > 3500 && ad.purchases === 0) {
                    verdict = {
                      label: "🔴 COUPER (0 vente)",
                      cls: "bg-rose-100 text-rose-700",
                    };
                  } else if (ad.ctr < 1.3 && ad.impressions > 1000) {
                    verdict = {
                      label: "🔴 CRÉA FAIBLE (CTR < 1.3%)",
                      cls: "bg-rose-100 text-rose-700",
                    };
                  } else if (ad.purchases === 0) {
                    verdict = {
                      label: "🟡 EN TEST",
                      cls: "bg-amber-100 text-amber-800",
                    };
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">
                        <div>{ad.ad_name}</div>
                        {ad.campaign_name && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {ad.campaign_name}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        {fmt(spendFcfa)} F
                      </td>
                      <td className="p-3 font-mono">{fmt(ad.impressions)}</td>
                      <td
                        className={`p-3 font-mono font-bold ${
                          ad.ctr >= 2
                            ? "text-emerald-600"
                            : ad.ctr < 1.3
                            ? "text-rose-600"
                            : "text-amber-600"
                        }`}
                      >
                        {ad.ctr.toFixed(2)}%
                      </td>
                      <td className="p-3 font-mono">
                        {fmt(ad.inline_link_clicks)}
                      </td>
                      <td className="p-3 font-mono">
                        {fmt(ad.landing_page_views)}
                      </td>
                      <td className="p-3 font-mono font-extrabold text-slate-900">
                        {ad.purchases}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold ${verdict.cls}`}
                        >
                          {verdict.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
