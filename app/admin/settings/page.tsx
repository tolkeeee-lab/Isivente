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
  Users,
  PauseCircle,
  PlayCircle,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  AFRICAN_COUNTRIES,
  AfricanCountryCode,
  StoreConfig,
  clearStoredTenantContext,
  getCurrentUserStore,
  isFounderEmail,
  listAllStoresForFounder,
  setStoredTenantContext,
  slugifyStoreName,
  updateStoreStatusByFounder,
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

  // Panneau Super-Admin (réservé uniquement au fondateur tolkeeee@gmail.com)
  const [allStores, setAllStores] = useState<StoreConfig[]>([]);
  const [togglingStoreId, setTogglingStoreId] = useState<string | null>(null);
  const [founderError, setFounderError] = useState("");

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

        if (isFounderEmail(user.email) && !missing) {
          const { stores: founderStores, error: fErr } = await listAllStoresForFounder();
          if (fErr) setFounderError(fErr);
          else setAllStores(founderStores);
        }

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
    setStoredTenantContext({
      isFounder: isFounderEmail(userEmail),
      storeId: saved.id,
      storeName: saved.name,
      storeActive: saved.is_active !== false,
      storePlan: saved.plan,
      email: userEmail,
    });
    setFeedback({
      type: "success",
      text: "Paramètres de votre boutique enregistrés avec succès !",
    });
  };

  const handleLogout = async () => {
    clearStoredTenantContext();
    await supabase.auth.signOut();
    setUserEmail(null);
    setStore(null);
    router.replace("/login");
  };

  const handleToggleStorePause = async (target: StoreConfig) => {
    setTogglingStoreId(target.id);
    setFounderError("");
    const { store: updated, error } = await updateStoreStatusByFounder(target.id, {
      is_active: !target.is_active,
    });
    if (error || !updated) {
      setFounderError(
        error ||
          "Exécutez supabase/migrations/003_founder_manage_stores.sql dans Supabase SQL Editor pour activer le contrôle fondateur."
      );
    } else {
      setAllStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
    setTogglingStoreId(null);
  };

  const handleChangeStorePlan = async (
    target: StoreConfig,
    newPlan: "trial" | "starter" | "pro"
  ) => {
    setTogglingStoreId(target.id);
    setFounderError("");
    const { store: updated, error } = await updateStoreStatusByFounder(target.id, {
      plan: newPlan,
      is_active: true,
    });
    if (error || !updated) {
      setFounderError(error || "Erreur lors du changement de plan.");
    } else {
      setAllStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
    setTogglingStoreId(null);
  };

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://isivente.vercel.app";
  const storePublicUrl = `${origin}/p/${slug || "ma-boutique"}`;

  const copyStoreUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(storePublicUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-[13px] text-[#737373]">
        Chargement des réglages de votre boutique
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* En-tête épuré */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[1.15] font-medium text-[#171717] tracking-[-0.02em]">
            Ma boutique
          </h1>
          <p className="text-[14px] text-[#737373] mt-1">
            Identité, WhatsApp, devise et Pixel Meta de votre espace vendeur
          </p>
        </div>

        {userEmail ? (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[12px] font-mono text-[#525252] bg-white border border-black/[0.08] px-3 py-1.5 rounded-[8px] truncate max-w-[200px]">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-[8px] border border-black/[0.08] bg-white hover:bg-[#f4f4f5] hover:text-[#dc2626] text-[13px] font-medium text-[#525252] transition-colors duration-150 cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[1.5]" />
              <span>Sortir</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-[8px] bg-[#14281D] hover:bg-[#1E3A2B] text-white text-[13px] font-medium transition-colors duration-150"
            >
              <LogIn className="w-4 h-4 stroke-[1.5]" />
              <span>Connexion</span>
            </Link>
            <Link
              href="/register"
              className="h-9 inline-flex items-center px-3.5 rounded-[8px] bg-white border border-black/[0.08] hover:bg-[#f4f4f5] text-[#171717] text-[13px] font-medium transition-colors duration-150"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </header>

      {/* Si non connecté */}
      {!userEmail && (
        <div className="bg-white rounded-[14px] border border-black/[0.08] p-8 text-center space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <ShieldCheck className="w-5 h-5 stroke-[1.5] text-[#737373] mx-auto" />
          <h2 className="text-[16px] font-medium text-[#171717]">
            Connectez votre compte vendeur
          </h2>
          <p className="text-[13px] text-[#737373] max-w-md mx-auto leading-relaxed">
            Créez votre compte ci-dessus pour associer votre boutique, votre WhatsApp et votre Pixel Meta en toute sécurité.
          </p>
        </div>
      )}

      {/* Alerte migration si table stores absente */}
      {userEmail && tableMissing && (
        <div className="bg-white border border-[#d97706]/30 rounded-[14px] p-4 space-y-1.5 text-[13px] text-[#525252]">
          <div className="font-medium text-[#171717] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 stroke-[1.5] text-[#d97706] shrink-0" />
            <span>Action requise dans Supabase</span>
          </div>
          <p>
            Exécutez <code>supabase/migrations/001_multi_tenant_stores.sql</code> dans Supabase SQL Editor puis rechargez cette page.
          </p>
        </div>
      )}

      {/* Formulaire de configuration boutique */}
      {userEmail && !tableMissing && (
        <form onSubmit={handleSave} className="bg-white rounded-[14px] border border-black/[0.08] p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.05)] space-y-6">
          {feedback && (
            <div
              className={`p-3.5 rounded-[10px] border text-[13px] flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-[#fafafa] border-[#15803d]/30 text-[#15803d]"
                  : "bg-[#fafafa] border-[#dc2626]/30 text-[#dc2626]"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 stroke-[1.5] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 stroke-[1.5] shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* 1. Identité */}
          <div className="space-y-4">
            <h2 className="text-[14px] font-medium text-[#171717] flex items-center gap-2">
              <Store className="w-4 h-4 stroke-[1.5] text-[#737373]" />
              <span>Identité de la boutique</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] block">Nom de la boutique</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Isivente Cotonou"
                  className="w-full h-10 px-3.5 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] text-[#171717] focus:bg-white focus:outline-none focus:border-[#171717] transition-colors duration-150"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] block">Identifiant (slug)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugifyStoreName(e.target.value));
                    }}
                    placeholder="isivente"
                    className="w-full h-10 px-3.5 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] font-mono text-[#171717] focus:bg-white focus:outline-none focus:border-[#171717] transition-colors duration-150"
                  />
                  <button
                    type="button"
                    onClick={copyStoreUrl}
                    className="h-10 w-10 rounded-[8px] border border-black/[0.08] hover:bg-[#f4f4f5] text-[#525252] inline-flex items-center justify-center cursor-pointer shrink-0 transition-colors duration-150"
                    title="Copier le lien"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 stroke-[1.5] text-[#15803d]" /> : <Copy className="w-4 h-4 stroke-[1.5]" />}
                  </button>
                </div>
                <p className="text-[12px] text-[#737373] font-mono truncate">{storePublicUrl}</p>
              </div>
            </div>
          </div>

          {/* 2. Localisation & WhatsApp */}
          <div className="space-y-4 pt-5 border-t border-black/[0.08]">
            <h2 className="text-[14px] font-medium text-[#171717] flex items-center gap-2">
              <Globe className="w-4 h-4 stroke-[1.5] text-[#737373]" />
              <span>Pays, livraison et WhatsApp</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] block">Pays principal</label>
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value as AfricanCountryCode)}
                  className="w-full h-10 px-3 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] text-[#171717] focus:bg-white focus:outline-none focus:border-[#171717] transition-colors duration-150"
                >
                  {AFRICAN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} (+{c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] block">Ville principale</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cotonou"
                  className="w-full h-10 px-3.5 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] text-[#171717] focus:bg-white focus:outline-none focus:border-[#171717] transition-colors duration-150"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] block">Devise</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="FCFA"
                  className="w-full h-10 px-3.5 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] font-mono text-[#171717] focus:bg-white focus:outline-none focus:border-[#171717] transition-colors duration-150"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] flex items-center gap-1.5">
                  <Phone className="w-4 h-4 stroke-[1.5] text-[#737373]" />
                  <span>Numéro WhatsApp (avec indicatif)</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="2290192901817"
                  className="w-full h-10 px-3.5 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] font-mono text-[#171717] focus:bg-white focus:outline-none focus:border-[#171717] transition-colors duration-150"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] flex items-center gap-1.5">
                  <Palette className="w-4 h-4 stroke-[1.5] text-[#737373]" />
                  <span>Couleur de marque</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-[8px] border border-black/[0.1] cursor-pointer p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 h-10 px-3.5 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] font-mono text-[#171717]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Attribution Meta */}
          <div className="space-y-4 pt-5 border-t border-black/[0.08]">
            <h2 className="text-[14px] font-medium text-[#171717] flex items-center gap-2">
              <Activity className="w-4 h-4 stroke-[1.5] text-[#737373]" />
              <span>Attribution Meta Pixel et CAPI</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] block">Meta Pixel ID (optionnel)</label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="2150878529184686"
                  className="w-full h-10 px-3.5 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] font-mono text-[#171717] focus:bg-white focus:outline-none focus:border-[#171717] transition-colors duration-150"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] text-[#525252] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 stroke-[1.5] text-[#737373]" />
                  <span>Token Conversions API</span>
                </label>
                <input
                  type="password"
                  value={metaCapiToken}
                  onChange={(e) => setMetaCapiToken(e.target.value)}
                  placeholder="EAA..."
                  className="w-full h-10 px-3.5 rounded-[8px] border border-black/[0.1] bg-[#fafafa] text-[14px] font-mono text-[#171717] focus:bg-white focus:outline-none focus:border-[#171717] transition-colors duration-150"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-black/[0.08] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="h-10 inline-flex items-center gap-2 px-5 rounded-[8px] bg-[#14281D] hover:bg-[#1E3A2B] text-white font-medium text-[14px] transition-colors duration-150 disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[1.5]" />
              <span>{saving ? "Enregistrement" : "Enregistrer ma boutique"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Panneau Fondateur : contrôle des boutiques inscrites */}
      {userEmail && isFounderEmail(userEmail) && !tableMissing && (
        <section className="bg-white rounded-[14px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-black/[0.08] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 stroke-[1.5] text-[#737373]" />
              <div>
                <h2 className="text-[15px] font-medium text-[#171717]">
                  Boutiques inscrites · <span className="font-mono tabular-nums text-[#737373]">{allStores.length}</span>
                </h2>
                <p className="text-[12px] text-[#737373]">
                  Mettez un compte en pause en attente de paiement ou réactivez-le en un clic
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {founderError && (
              <div className="p-3 rounded-[8px] bg-[#fafafa] border border-[#dc2626]/30 text-[#dc2626] text-[13px]">
                {founderError}
              </div>
            )}

            {allStores.length === 0 ? (
              <p className="text-[13px] text-[#737373] py-6 text-center">
                Aucune boutique inscrite pour le moment
              </p>
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {allStores.map((st) => {
                  const isOwnStore = store?.id === st.id;
                  const isPaused = st.is_active === false;
                  return (
                    <div
                      key={st.id}
                      className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-medium text-[14px] text-[#171717]">{st.name}</span>
                          <span className="text-[12px] font-mono text-[#737373]">{st.slug}</span>
                          <span className="inline-flex items-center gap-1.5 text-[12px] text-[#525252]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPaused ? "bg-[#dc2626]" : "bg-[#15803d]"
                              }`}
                            />
                            <span>{isPaused ? "En pause" : "Actif"}</span>
                          </span>
                          {isOwnStore && (
                            <span className="text-[12px] text-[#737373]">· Fondateur</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#737373]">
                          <span>
                            {st.city} ({st.country})
                          </span>
                          {st.whatsapp_number && (
                            <a
                              href={`https://wa.me/${st.whatsapp_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#15803d] hover:underline font-mono"
                            >
                              <MessageCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                              +{st.whatsapp_number}
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={st.plan || "trial"}
                          disabled={togglingStoreId === st.id}
                          onChange={(e) =>
                            handleChangeStorePlan(
                              st,
                              e.target.value as "trial" | "starter" | "pro"
                            )
                          }
                          className="h-8 px-2.5 rounded-[8px] border border-black/[0.1] bg-white text-[12px] font-medium text-[#171717] cursor-pointer"
                        >
                          <option value="trial">Essai 7j</option>
                          <option value="starter">Starter (9 900 F)</option>
                          <option value="pro">Pro (19 900 F)</option>
                        </select>

                        {!isOwnStore && (
                          <button
                            type="button"
                            disabled={togglingStoreId === st.id}
                            onClick={() => handleToggleStorePause(st)}
                            className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-[8px] text-[12px] font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 ${
                              isPaused
                                ? "bg-[#15803d] hover:bg-[#166534] text-white"
                                : "bg-white hover:bg-[#fef2f2] text-[#dc2626] border border-[#dc2626]/30"
                            }`}
                          >
                            {isPaused ? (
                              <>
                                <PlayCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                                <span>Réactiver</span>
                              </>
                            ) : (
                              <>
                                <PauseCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                                <span>Mettre en pause</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
