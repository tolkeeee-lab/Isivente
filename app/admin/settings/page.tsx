"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Save,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Globe,
  Phone,
  Palette,
  Activity,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  AFRICAN_COUNTRIES,
  AfricanCountryCode,
  StoreConfig,
  getCurrentUserStore,
  slugifyStoreName,
  upsertUserStore,
} from "@/lib/storesStorage";

export default function AdminStoreSettingsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Formulaire de configuration boutique
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [country, setCountry] = useState<AfricanCountryCode>("BJ");
  const [city, setCity] = useState("Cotonou");
  const [currency, setCurrency] = useState("FCFA");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [accentColor, setAccentColor] = useState("#0F172A");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaCapiToken, setMetaCapiToken] = useState("");

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUserEmail(null);
          setLoading(false);
          return;
        }

        setUserEmail(user.email || "Vendeur connecté");
        const { store: existingStore, tableMissing: missing } = await getCurrentUserStore();
        setTableMissing(missing);

        if (existingStore) {
          setStore(existingStore);
          setName(existingStore.name);
          setSlug(existingStore.slug);
          setSlugTouched(true);
          setCountry(existingStore.country || "BJ");
          setCity(existingStore.city || "Cotonou");
          setCurrency(existingStore.currency || "FCFA");
          setWhatsappNumber(existingStore.whatsapp_number || "");
          setAccentColor(existingStore.accent_color || "#0F172A");
          setMetaPixelId(existingStore.meta_pixel_id || "");
          setMetaCapiToken(existingStore.meta_capi_token || "");
        } else {
          const defaultName = (user.user_metadata?.store_name as string) || "";
          if (defaultName) {
            setName(defaultName);
            setSlug(slugifyStoreName(defaultName));
          }
        }
      } catch (err) {
        console.error("Erreur chargement réglages boutique:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleCountryChange = (newCode: AfricanCountryCode) => {
    setCountry(newCode);
    const found = AFRICAN_COUNTRIES.find((c) => c.code === newCode);
    if (found) {
      setCurrency(found.currency);
      if (!store) {
        setCity(found.defaultCity);
      }
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugTouched) {
      setSlug(slugifyStoreName(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (name.trim().length < 2) {
      setFeedback({ type: "error", text: "Le nom de la boutique doit contenir au moins 2 caractères." });
      return;
    }

    setSaving(true);
    const { store: saved, error } = await upsertUserStore(
      {
        name,
        slug: slug || slugifyStoreName(name),
        country,
        currency,
        city,
        whatsapp_number: whatsappNumber,
        accent_color: accentColor,
        meta_pixel_id: metaPixelId || null,
        meta_capi_token: metaCapiToken || null,
      },
      store?.id
    );
    setSaving(false);

    if (error || !saved) {
      setFeedback({ type: "error", text: error || "Impossible d'enregistrer les paramètres." });
      return;
    }

    setStore(saved);
    setSlug(saved.slug);
    setSlugTouched(true);
    setFeedback({
      type: "success",
      text: "Paramètres de votre boutique enregistrés avec succès !",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setStore(null);
    router.refresh();
  };

  const storePublicUrl = `https://isivente.com/s/${slug || "ma-boutique"}`;

  const copyStoreUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(storePublicUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-sm text-slate-500">
        Chargement de votre espace boutique...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* ── EN-TÊTE ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Ma Boutique &amp; Réglages SaaS
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configurez votre identité, WhatsApp, pays et Meta Pixel pour votre boutique COD.
            </p>
          </div>
        </div>

        {userEmail ? (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl truncate max-w-[180px]">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sortir</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Se connecter</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <span>Créer un compte</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── SI NON CONNECTÉ ── */}
      {!userEmail && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-base font-extrabold text-slate-900">
              Connectez votre compte vendeur pour activer le mode Multi-Boutiques
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vos pages existantes sur <code>/p/[slug]</code> continuent de fonctionner normalement. Créez votre compte vendeur ci-dessus pour associer votre boutique, votre WhatsApp et votre Pixel en toute sécurité.
            </p>
          </div>
        </div>
      )}

      {/* ── ALERTE MIGRATION SQL SI TABLE `stores` NON CRÉÉE ── */}
      {userEmail && tableMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs text-amber-900">
          <div className="font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Action requise dans Supabase (1 seule fois)</span>
          </div>
          <p className="leading-relaxed">
            La table <code>public.stores</code> n&apos;est pas encore créée dans votre base Supabase. Ouvrez{" "}
            <strong>Supabase ➔ SQL Editor</strong> et exécutez le fichier{" "}
            <code>supabase/migrations/001_multi_tenant_stores.sql</code>, puis rechargez cette page.
          </p>
        </div>
      )}

      {/* ── FORMULAIRE DE CONFIGURATION BOUTIQUE ── */}
      {userEmail && !tableMissing && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs space-y-6">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Identité */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-500" />
              1. Identité de la boutique
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Nom officiel de la boutique *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Isivente Cotonou"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Lien unique (slug) *</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugifyStoreName(e.target.value));
                    }}
                    placeholder="isivente"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={copyStoreUrl}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer shrink-0"
                    title="Copier le lien de ma boutique"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">{storePublicUrl}</p>
              </div>
            </div>
          </div>

          {/* Localisation & WhatsApp */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              2. Pays, Livraison &amp; WhatsApp
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Pays principal</label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value as AfricanCountryCode)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                >
                  {AFRICAN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} (+{c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Ville principale</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cotonou"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Devise</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="FCFA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Numéro WhatsApp (avec indicatif pays) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Ex: 2290192901817"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  Couleur principale de marque
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-11 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meta Pixel & CAPI */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              3. Attribution Publicitaire (Meta Pixel &amp; CAPI)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Meta Pixel ID (optionnel)</label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="Ex: 2150878529184686"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  Token Conversions API (CAPI)
                </label>
                <input
                  type="password"
                  value={metaCapiToken}
                  onChange={(e) => setMetaCapiToken(e.target.value)}
                  placeholder="EAA..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Enregistrement..." : "Enregistrer ma boutique"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
