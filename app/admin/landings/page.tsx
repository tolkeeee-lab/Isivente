"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Store, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Tag,
  Share2,
  SlidersHorizontal,
  Flame
} from "lucide-react";
import { DEFAULT_CATALOG } from "@/lib/defaultCatalog";

export default function AdminLandingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  const filteredProducts = useMemo(() => {
    return DEFAULT_CATALOG.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.shortTitle && p.shortTitle.toLowerCase().includes(q))
      );
    });
  }, [searchTerm]);

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://isivente.vercel.app";
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* ── EN-TÊTE DE LA PAGE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Store className="w-4 h-4" />
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Catalogue des Landing Pages
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {DEFAULT_CATALOG.length} pages en ligne
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Toutes vos pages de vente optimisées au standard Isivente. Copiez vos liens avec ou sans paramètres UTM pour vos campagnes Facebook Ads, TikTok et WhatsApp.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative min-w-[260px] sm:min-w-[320px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit, slug..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── GRILLE DES LANDING PAGES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const origin = getBaseUrl();
          const cleanUrl = `${origin}/p/${prod.slug}`;
          const utmMetaUrl = `${origin}/p/${prod.slug}?utm_source=meta&utm_medium=cpc&utm_campaign=${prod.slug}_conversion`;
          const utmWaUrl = `${origin}/p/${prod.slug}?utm_source=whatsapp&utm_medium=direct&utm_campaign=${prod.slug}_relance`;

          const isCopiedClean = copiedId === `clean_${prod.slug}`;
          const isCopiedMeta = copiedId === `meta_${prod.slug}`;
          const isCopiedWa = copiedId === `wa_${prod.slug}`;

          return (
            <div
              key={prod.slug}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Entête Carte avec Visuel et Infos */}
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center p-1">
                    <img
                      src={prod.image || prod.image_url}
                      alt={prod.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Standard Master
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {prod.title}
                    </h3>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="font-mono text-sm font-extrabold text-indigo-600">
                        {fmt(prod.price)} FCFA
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        /p/{prod.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges de conformité */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Formulaire COD direct</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">Ghost Lead actif</span>
                  </div>
                </div>
              </div>

              {/* Barre d'actions & Liens */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
                
                {/* Bouton Visiter la Page en Direct */}
                <a
                  href={`/p/${prod.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                >
                  <span>Ouvrir la Landing Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </a>

                {/* Ligne des Boutons Copier avec UTM */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {/* Lien Neutre */}
                  <button
                    type="button"
                    onClick={() => handleCopy(cleanUrl, `clean_${prod.slug}`)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border inline-flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isCopiedClean
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                    title="Copier le lien direct standard"
                  >
                    {isCopiedClean ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedClean ? "Copié !" : "Direct"}</span>
                  </button>

                  {/* Lien Meta Ads */}
                  <button
                    type="button"
                    onClick={() => handleCopy(utmMetaUrl, `meta_${prod.slug}`)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border inline-flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isCopiedMeta
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                    }`}
                    title="Copier avec tracking Meta Ads (?utm_source=meta...)"
                  >
                    {isCopiedMeta ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Share2 className="w-3 h-3" />}
                    <span>{isCopiedMeta ? "Copié !" : "Meta Ads"}</span>
                  </button>

                  {/* Lien WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleCopy(utmWaUrl, `wa_${prod.slug}`)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border inline-flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isCopiedWa
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                    }`}
                    title="Copier avec tracking WhatsApp (?utm_source=whatsapp...)"
                  >
                    {isCopiedWa ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Flame className="w-3 h-3" />}
                    <span>{isCopiedWa ? "Copié !" : "WhatsApp"}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Store className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Aucune landing page trouvée</h3>
          <p className="text-xs text-slate-500">Essayez un autre mot-clé dans la barre de recherche.</p>
        </div>
      )}

    </div>
  );
}
