"use client";

import React, { useEffect, useState } from "react";
import { 
  getAllLeads, 
  getLocalLeads,
  updateLeadStatus, 
  deleteLead, 
  LeadRecord 
} from "@/lib/leadsStorage";
import { saveNewOrder } from "@/lib/ordersStorage";
import { 
  PhoneCall, 
  MessageSquare, 
  ShoppingBag, 
  Trash2, 
  RefreshCw, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  ExternalLink 
} from "lucide-react";

export default function ProspectsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>(() => getLocalLeads());
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return getLocalLeads().length === 0;
    }
    return false;
  });
  const [filter, setFilter] = useState<"all" | "abandoned" | "contacted" | "converted">("abandoned");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchLeads = async (silent = false) => {
    if (!silent && leads.length === 0) setLoading(true);
    const data = await getAllLeads();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    const hasLocal = getLocalLeads().length > 0;
    fetchLeads(hasLocal);

    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(() => {
      getAllLeads().then((data) => setLeads(data));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

  // Relance WhatsApp personnalisée
  const handleWhatsAppRelance = async (lead: LeadRecord) => {
    setActionLoadingId(lead.id);
    await updateLeadStatus(lead.id, "contacted");
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: "contacted" } : l))
    );

    const cleanPhone = lead.customer_phone.replace(/\D/g, "");
    const intlPhone = cleanPhone.startsWith("229") ? cleanPhone : `229${cleanPhone}`;
    const clientName = lead.customer_name && lead.customer_name !== "Client intéressé" 
      ? ` ${lead.customer_name}` 
      : "";

    const message = 
      `Bonjour${clientName}, c'est le service client Isivente.\n\n` +
      `J'ai vu que vous aviez commencé à commander notre *${lead.product_title}* (${fmt(lead.total_amount)} FCFA) sur notre site.\n\n` +
      `Avez-vous rencontré un problème lors de votre commande ?\n` +
      `Si vous le souhaitez, je peux directement valider votre livraison à *${lead.city || "Cotonou"}* avec *paiement en espèces à la livraison* (après vérification du produit).`;

    const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    setActionLoadingId(null);
  };

  // Convertir le prospect en commande officielle
  const handleConvertToOrder = async (lead: LeadRecord) => {
    const isConfirmed = window.confirm(
      `Voulez-vous valider et convertir ce prospect en commande officielle pour ${lead.customer_name} (${fmt(lead.total_amount)} FCFA) ?`
    );
    if (!isConfirmed) return;

    setActionLoadingId(lead.id);
    try {
      await saveNewOrder({
        customer_name: lead.customer_name,
        customer_phone: lead.customer_phone + (lead.customer_phone2 ? ` / ${lead.customer_phone2}` : ""),
        shipping_city: lead.city || "Cotonou",
        shipping_address: lead.address || `${lead.city || "Cotonou"} - Commande relance`,
        product_slug: lead.product_slug,
        product_title: lead.product_title,
        bundle_name: lead.bundle_name || "Offre standard",
        quantity: 1,
        total_amount: lead.total_amount,
        status: "pending",
      });

      await updateLeadStatus(lead.id, "converted");
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: "converted" } : l))
      );
      alert("Commande créée avec succès ! Elle est désormais visible dans la liste des Commandes.");
    } catch (err: any) {
      alert("Erreur lors de la création de la commande : " + err.message);
    }
    setActionLoadingId(null);
  };

  // Suppression
  const handleDelete = async (lead: LeadRecord) => {
    if (!window.confirm(`Supprimer ce prospect (${lead.customer_phone}) ?`)) return;
    await deleteLead(lead.id);
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
  };

  // Métriques
  const abandonedLeads = leads.filter((l) => l.status === "abandoned");
  const contactedLeads = leads.filter((l) => l.status === "contacted");
  const convertedLeads = leads.filter((l) => l.status === "converted");

  const recoverableAmount = abandonedLeads.reduce((sum, l) => sum + (l.total_amount || 0), 0);
  const convertedAmount = convertedLeads.reduce((sum, l) => sum + (l.total_amount || 0), 0);

  // Filtrage
  const filteredLeads = leads.filter((lead) => {
    if (filter !== "all" && lead.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.customer_name.toLowerCase().includes(q);
      const matchPhone = lead.customer_phone.includes(q);
      const matchProd = lead.product_title.toLowerCase().includes(q);
      const matchCity = (lead.city || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchProd || matchCity;
    }
    return true;
  });

  const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ── HEADER DE PAGE ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Paniers Abandonnés & Prospects
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              {abandonedLeads.length} à relancer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clients ayant renseigné leur numéro sans valider la commande. Relancez-les sur WhatsApp pour récupérer vos ventes.
          </p>
        </div>

        <button
          onClick={() => fetchLeads(false)}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Actualiser en direct</span>
        </button>
      </div>

      {/* ── CARTES KPI FIGMA-GRADE ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1 : Chiffre d'Affaires Récupérable */}
        <div className="card-figma p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              CA Récupérable
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
            {fmt(recoverableAmount)} <span className="text-xs font-normal text-slate-500 font-sans">FCFA</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Paniers non finalisés :</span>
            <span className="font-semibold text-rose-600 font-mono">{abandonedLeads.length} clients</span>
          </div>
        </div>

        {/* KPI 2 : Ventes Sauvées (Converties) */}
        <div className="card-figma p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Ventes Sauvées
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
            {fmt(convertedAmount)} <span className="text-xs font-normal text-slate-500 font-sans">FCFA</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Commandes converties :</span>
            <span className="font-semibold text-emerald-600 font-mono">{convertedLeads.length} commandes</span>
          </div>
        </div>

        {/* KPI 3 : Prospects Contactés */}
        <div className="card-figma p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Relances Effectuées
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
            {contactedLeads.length} <span className="text-xs font-normal text-slate-500 font-sans">contactés</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total prospects captés :</span>
            <span className="font-semibold text-slate-700 font-mono">{leads.length}</span>
          </div>
        </div>

      </div>

      {/* ── ONGLETS DE FILTRE & BARRE DE RECHERCHE ── */}
      <div className="card-figma p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        
        {/* Filtres par statut */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilter("abandoned")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === "abandoned"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            À relancer ({abandonedLeads.length})
          </button>
          <button
            onClick={() => setFilter("contacted")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === "contacted"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Déjà contactés ({contactedLeads.length})
          </button>
          <button
            onClick={() => setFilter("converted")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === "converted"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Convertis ({convertedLeads.length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tous ({leads.length})
          </button>
        </div>

        {/* Recherche */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher nom, numéro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
          />
        </div>

      </div>

      {/* ── LISTE DES PROSPECTS ── */}
      <div className="card-figma overflow-hidden">
        {loading && leads.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Chargement des prospects en direct...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {filter === "abandoned" 
                ? "Aucun panier abandonné pour le moment !" 
                : "Aucun prospect dans cette catégorie."}
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Dès qu'un visiteur tape son nom ou son numéro WhatsApp sur votre site, il apparaîtra immédiatement ici avec les boutons de relance directe.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => {
              const cleanPhone = lead.customer_phone.replace(/\D/g, "");
              const intlPhone = cleanPhone.startsWith("229") ? cleanPhone : `229${cleanPhone}`;

              return (
                <div 
                  key={lead.id} 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Coordonnées & Produit */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 tracking-tight">
                        {lead.customer_name || "Client intéressé"}
                      </span>
                      
                      {/* Statut Badge */}
                      {lead.status === "abandoned" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Abandonné
                        </span>
                      )}
                      {lead.status === "contacted" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          Contacté
                        </span>
                      )}
                      {lead.status === "converted" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 stroke-[2]" />
                          Converti en Commande
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-0 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(lead.updated_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      {/* Téléphone */}
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        🇧🇯 +229 {cleanPhone.replace(/^229/, "")}
                      </span>

                      {/* Ville & Quartier */}
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {lead.city || "Cotonou"} {lead.address ? `(${lead.address})` : ""}
                      </span>
                    </div>

                    {/* Détails du produit & Pack */}
                    <div className="flex items-center gap-2 text-xs pt-0.5">
                      <span className="font-semibold text-slate-700">{lead.product_title}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{lead.bundle_name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {fmt(lead.total_amount)} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Boutons d'Action Rapide */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* 1. BOUTON WHATSAPP RELANCE 1-CLIC */}
                    <button
                      onClick={() => handleWhatsAppRelance(lead)}
                      disabled={actionLoadingId === lead.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
                      title="Ouvrir la discussion WhatsApp avec message personnalisé"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>Relancer WhatsApp</span>
                    </button>

                    {/* 2. BOUTON APPEL DIRECT */}
                    <a
                      href={`tel:+${intlPhone}`}
                      className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 active:scale-[0.98] transition-all"
                      title="Appeler directement ce client"
                    >
                      <PhoneCall className="w-3.5 h-3.5 stroke-[2]" />
                    </a>

                    {/* 3. BOUTON TRANSFORMER EN COMMANDE */}
                    {lead.status !== "converted" && (
                      <button
                        onClick={() => handleConvertToOrder(lead)}
                        disabled={actionLoadingId === lead.id}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.98] transition-all cursor-pointer"
                        title="Créer la commande officielle si le client valide par téléphone"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Créer commande</span>
                      </button>
                    )}

                    {/* 4. SUPPRESSION */}
                    <button
                      onClick={() => handleDelete(lead)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer ce prospect"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
