"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Share2,
  Flame,
  BarChart3,
  Plus,
  X,
  Trash2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { DEFAULT_CATALOG } from "@/lib/defaultCatalog";
import { supabase } from "@/lib/supabase";
import {
  getCurrentUserStore,
  getStoredTenantContext,
  slugifyStoreName,
  StoreConfig,
} from "@/lib/storesStorage";

interface DbProductItem {
  id: string;
  slug: string;
  title: string;
  headline?: string;
  price: number;
  original_price?: number;
  images?: any[];
  store_id?: string | null;
  created_at?: string | null;
  is_custom_db?: boolean;
}

export default function AdminLandingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [slugDates, setSlugDates] = useState<Record<string, string>>({});

  useEffect(() => {
    setVisibleCount(9);
  }, [searchTerm, dateFilter]);
  const [userStore, setUserStore] = useState<StoreConfig | null>(null);
  const [dbProducts, setDbProducts] = useState<DbProductItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Formulaire créateur no-code
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [price, setPrice] = useState("14900");
  const [originalPrice, setOriginalPrice] = useState("25000");
  const [headline, setHeadline] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [benefitsText, setBenefitsText] = useState(
    "Qualité supérieure vérifiée avant livraison\nLivraison express en moins de 24h à domicile\nPaiement uniquement à la réception après test\nGarantie échange gratuit en cas de défaut"
  );
  const [faqText, setFaqText] = useState(
    "Comment se passe le paiement ? | Vous payez uniquement en espèces ou Mobile Money à la réception du colis après vérification.\nCombien de temps prend la livraison ? | Moins de 24h dans la ville principale."
  );

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

  const loadStoreAndProducts = async () => {
    try {
      const { store } = await getCurrentUserStore();
      setUserStore(store);

      if (store) {
        const { data } = await supabase
          .from("products")
          .select("id, slug, title, headline, price, original_price, images, store_id, created_at")
          .eq("store_id", store.id)
          .order("created_at", { ascending: false });
        if (Array.isArray(data)) {
          setDbProducts(data.map((p: any) => ({ ...p, is_custom_db: true })));
        }
      } else {
        setDbProducts([]);
      }

      // Récupérer les dates de création des produits catalogue pour le filtrage par date
      const tenantCtx = getStoredTenantContext();
      if (tenantCtx?.isFounder) {
        const { data: allProdDates } = await supabase
          .from("products")
          .select("slug, created_at");
        if (Array.isArray(allProdDates)) {
          const map: Record<string, string> = {};
          for (const row of allProdDates) {
            if (row.slug && row.created_at) {
              map[String(row.slug).toLowerCase()] = String(row.created_at);
            }
          }
          setSlugDates(map);
        }
      }
    } catch { }
  };

  useEffect(() => {
    loadStoreAndProducts();
  }, []);

  const combinedProducts = useMemo(() => {
    const tenantCtx = getStoredTenantContext();
    const isFounder = tenantCtx ? tenantCtx.isFounder : false;

    const customMapped = dbProducts.map((p) => {
      const firstImg =
        Array.isArray(p.images) && p.images[0]
          ? typeof p.images[0] === "string"
            ? p.images[0]
            : p.images[0].url
          : "/images/microscope-real-infographic.webp";
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        shortTitle: p.title,
        price: Number(p.price) || 0,
        image: firstImg,
        image_url: firstImg,
        created_at: p.created_at || null,
        isCustomDb: true,
      };
    });

    // Isolation stricte : seul le fondateur voit son catalogue historique DEFAULT_CATALOG
    if (!isFounder) {
      return customMapped;
    }

    const staticMapped = DEFAULT_CATALOG.map((p) => ({
      ...p,
      created_at: slugDates[p.slug.toLowerCase()] || null,
      isCustomDb: false,
    }));

    return [...customMapped, ...staticMapped];
  }, [dbProducts, slugDates]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return combinedProducts.filter((p) => {
      const isoDate = p.created_at ? String(p.created_at).slice(0, 10) : "";
      const frDate = p.created_at
        ? new Date(p.created_at).toLocaleDateString("fr-FR")
        : "";

      if (dateFilter && isoDate !== dateFilter) {
        return false;
      }

      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.shortTitle && p.shortTitle.toLowerCase().includes(q)) ||
        isoDate.includes(q) ||
        frDate.includes(q)
      );
    });
  }, [combinedProducts, searchTerm, dateFilter]);

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
    return "https://isivente.com";
  };

  // Compression automatique sur le téléphone/PC du vendeur (max 960px, JPEG 80% < 100 Ko)
  const compressImageFile = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.src = String(ev.target?.result || "");
      };
      reader.onerror = reject;
      img.onload = () => {
        const maxDim = 960;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : resolve(file)),
          "image/jpeg",
          0.8
        );
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - uploadedImages.length);
    if (files.length === 0) return;
    if (!userStore) {
      setCreateError("Configurez d'abord votre boutique dans « Ma Boutique » avant d'importer des photos.");
      return;
    }

    setUploadingImages(true);
    setCreateError("");
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i]);
        const filePath = `${userStore.id}/${Date.now()}-${i}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(filePath, compressed, { contentType: "image/jpeg", upsert: true });

        if (uploadErr) {
          throw new Error(
            uploadErr.message.includes("Bucket not found")
              ? "Exécutez d'abord supabase/migrations/002_storage_product_images.sql dans Supabase SQL Editor pour activer l'upload de photos."
              : uploadErr.message
          );
        }

        const { data: pub } = supabase.storage.from("product-images").getPublicUrl(filePath);
        if (pub?.publicUrl) {
          newUrls.push(pub.publicUrl);
        }
      }
      setUploadedImages((prev) => [...prev, ...newUrls].slice(0, 5));
    } catch (err: any) {
      setCreateError(err?.message || "Erreur lors de l'import des photos.");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    if (!userStore) {
      setCreateError(
        "Connectez votre compte et configurez d'abord votre boutique dans « Ma Boutique » (/admin/settings)."
      );
      return;
    }

    const cleanTitle = title.trim();
    const baseSlug = slugifyStoreName(slug || cleanTitle);
    const numPrice = Math.round(Number(price) || 0);
    const numOrig = Math.round(Number(originalPrice) || Math.round(numPrice * 1.5));

    if (cleanTitle.length < 3 || baseSlug.length < 3 || numPrice <= 0) {
      setCreateError("Veuillez saisir un titre valide, un lien (slug) et un prix supérieur à 0.");
      return;
    }

    const manualUrls = imageUrlsText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const images = [...uploadedImages, ...manualUrls]
      .slice(0, 5)
      .map((url) => ({ url, alt: cleanTitle }));

    const features = benefitsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [fTitle, fDesc] = line.split("|").map((s) => s.trim());
        return { title: fTitle, description: fDesc || "" };
      });

    const faq = faqText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [q, a] = line.split("|").map((s) => s.trim());
        return { q: q || line, a: a || "" };
      })
      .filter((item) => item.q && item.a);

    setCreating(true);
    try {
      let finalSlug = baseSlug;
      // Éviter collision avec un slug déjà pris
      const { data: existing } = await supabase
        .from("products")
        .select("slug")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (existing || DEFAULT_CATALOG.some((c) => c.slug === finalSlug)) {
        finalSlug = `${baseSlug}-${userStore.slug.slice(0, 8)}-${Math.floor(10 + Math.random() * 89)}`;
      }

      const { error } = await supabase.from("products").insert([
        {
          slug: finalSlug,
          title: cleanTitle,
          headline: headline.trim() || cleanTitle,
          description: headline.trim() || cleanTitle,
          price: numPrice,
          original_price: numOrig,
          currency: userStore.currency || "FCFA",
          images: images.length > 0 ? images : [{ url: "/images/microscope-real-infographic.webp", alt: cleanTitle }],
          features,
          bundles: [
            {
              id: "solo",
              name: cleanTitle,
              price: numPrice,
              originalPrice: numOrig,
              quantity: 1,
              popular: true,
            },
          ],
          faq,
          is_active: true,
          store_id: userStore.id,
        },
      ]);

      if (error) {
        setCreateError(error.message);
        setCreating(false);
        return;
      }

      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setHeadline("");
      setUploadedImages([]);
      setImageUrlsText("");
      setShowCreateModal(false);
      await loadStoreAndProducts();
    } catch (err: any) {
      setCreateError(err?.message || "Erreur lors de la création de la page produit.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCustomProduct = async (prodId: string, prodTitle: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Supprimer DÉFINITIVEMENT la page « ${prodTitle} » ainsi que ses photos ?\n\nCette action est irréversible.`
      )
    ) {
      return;
    }

    setDeletingId(prodId);
    setActionFeedback(null);

    try {
      // 1. Nettoyer les photos hébergées dans Supabase Storage `product-images`
      const targetProd = dbProducts.find((p) => p.id === prodId);
      if (targetProd && Array.isArray(targetProd.images)) {
        const storagePaths: string[] = [];
        const marker = "/storage/v1/object/public/product-images/";
        for (const item of targetProd.images) {
          const url = typeof item === "string" ? item : item?.url;
          if (typeof url === "string" && url.includes(marker)) {
            const path = decodeURIComponent(url.split(marker)[1] || "");
            if (path) storagePaths.push(path);
          }
        }
        if (storagePaths.length > 0) {
          await supabase.storage.from("product-images").remove(storagePaths).catch(() => { });
        }
      }

      // 2. Suppression définitive de la ligne produit en base (strictement scopée par store_id)
      let delQuery = supabase.from("products").delete().eq("id", prodId);
      if (userStore?.id) {
        delQuery = delQuery.eq("store_id", userStore.id);
      }
      const { error } = await delQuery;

      if (error) {
        if (error.code === "23503") {
          setActionFeedback({
            type: "error",
            text: `Impossible de supprimer « ${prodTitle} » tant que des commandes y sont rattachées. Désactivez-la ou supprimez d'abord les commandes de test.`,
          });
        } else {
          setActionFeedback({
            type: "error",
            text: `Erreur de suppression : ${error.message}`,
          });
        }
        return;
      }

      setDbProducts((prev) => prev.filter((p) => p.id !== prodId));
      setActionFeedback({
        type: "success",
        text: `La page « ${prodTitle} » et ses photos ont été supprimées définitivement.`,
      });
    } catch (err: any) {
      setActionFeedback({
        type: "error",
        text: err?.message || "Erreur lors de la suppression définitive.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ── SOUS-NAVIGATION PÔLE CATALOGUE & PAGES ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl w-fit">
          <span className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-xs">
            🛍️ Pages Produits ({combinedProducts.length})
          </span>
          <Link
            href="/admin/studio"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            ✨ Studio IA &amp; Visuels
          </Link>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateError("");
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors duration-150 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Créer une Page Produit (Sans coder)</span>
        </button>
      </div>

      {/* ── EN-TÊTE DE LA PAGE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f4f4f5] border border-black/[0.08] flex items-center justify-center text-[#171717]">
              <Store className="w-4 h-4" />
            </div>
            <h1 className="font-display font-semibold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Catalogue des Landing Pages
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {combinedProducts.length} pages en ligne
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Route unique unifiée <code>/p/[slug]</code> — chaque boutique SaaS est isolée avec son propre Pixel Meta et son WhatsApp.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, slug ou date..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors duration-150 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filtrer par date de création"
              className="w-full sm:w-auto pl-8 pr-3 py-2 text-xs bg-white border border-black/[0.08] rounded-xl text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors duration-150"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="ml-1.5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer shrink-0"
                title="Réinitialiser la date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── ONGLETS DE NAVIGATION DÉDIÉS : CATALOGUE vs KPIS ── */}
      <div className="flex items-center gap-2 border-b border-black/[0.08] pb-3">
        <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-xs flex items-center gap-1.5 cursor-default">
          <Store className="w-3.5 h-3.5" />
          <span>Catalogue &amp; Liens ({combinedProducts.length})</span>
        </span>
        <Link
          href="/admin/clicks"
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 flex items-center gap-1.5 border border-transparent hover:border-black/[0.08]"
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#171717]" />
          <span>KPIs &amp; Visiteurs des Pages</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </Link>
      </div>

      {/* ── FEEDBACK SUPPRESSION / ACTION ── */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 ${actionFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
        >
          <span>{actionFeedback.text}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── GRILLE DES LANDING PAGES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.slice(0, visibleCount).map((prod) => {
          const origin = getBaseUrl();
          const cleanUrl = `${origin}/p/${prod.slug}`;
          const utmMetaUrl = `${origin}/p/${prod.slug}?utm_source=meta&utm_medium=cpc&utm_campaign=${prod.slug}_conversion`;
          const utmWaUrl = `${origin}/p/${prod.slug}?utm_source=whatsapp&utm_medium=direct&utm_campaign=${prod.slug}_relance`;

          const isCopiedClean = copiedId === `clean_${prod.slug}`;
          const isCopiedMeta = copiedId === `meta_${prod.slug}`;
          const isCopiedWa = copiedId === `wa_${prod.slug}`;

          return (
            <div
              key={`${prod.isCustomDb ? "db" : "st"}_${prod.slug}`}
              className="bg-white rounded-[14px] border border-black/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:border-black/[0.08] hover:border-black/[0.16] transition-colors duration-150 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-black/[0.08] shrink-0 flex items-center justify-center p-1">
                    <img
                      src={prod.image || prod.image_url}
                      alt={prod.title}
                      className="w-full h-full object-contain transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${prod.isCustomDb
                            ? "text-[#171717] bg-[#f4f4f5] border-black/[0.08]"
                            : "text-emerald-700 bg-emerald-50 border-emerald-100"
                          }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {prod.isCustomDb ? userStore?.name || "Ma Boutique" : "Standard Master"}
                      </div>
                      {prod.isCustomDb && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomProduct(prod.id, prod.title)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Supprimer cette page produit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {prod.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-2 pt-0.5">
                      <span className="font-mono text-sm font-semibold text-[#171717]">
                        {fmt(prod.price)} {userStore?.currency || "FCFA"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded truncate">
                        /p/{prod.slug}
                      </span>
                      {prod.created_at && (
                        <span className="font-mono text-[10px] text-slate-400 inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(prod.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div className="bg-slate-50 p-2 rounded-xl border border-black/[0.08] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Formulaire COD direct</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-black/[0.08] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#171717] shrink-0" />
                    <span className="truncate">Pixel &amp; WhatsApp isolés</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-black/[0.08] space-y-2">
                <a
                  href={`/p/${prod.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-[#14281D] hover:bg-[#1E3A2B] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors duration-150 shadow-2xs"
                >
                  <span>Ouvrir la Landing Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </a>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(cleanUrl, `clean_${prod.slug}`)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border inline-flex items-center justify-center gap-1 transition-colors duration-150 cursor-pointer ${isCopiedClean
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-black/[0.08]"
                      }`}
                  >
                    {isCopiedClean ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedClean ? "Copié !" : "Direct"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(utmMetaUrl, `meta_${prod.slug}`)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border inline-flex items-center justify-center gap-1 transition-colors duration-150 cursor-pointer ${isCopiedMeta
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-[#f4f4f5] hover:bg-[#f4f4f5] text-[#171717] border-black/[0.08]"
                      }`}
                  >
                    {isCopiedMeta ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Share2 className="w-3 h-3" />}
                    <span>{isCopiedMeta ? "Copié !" : "Meta Ads"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(utmWaUrl, `wa_${prod.slug}`)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border inline-flex items-center justify-center gap-1 transition-colors duration-150 cursor-pointer ${isCopiedWa
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                  >
                    {isCopiedWa ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Flame className="w-3 h-3" />}
                    <span>{isCopiedWa ? "Copié !" : "WhatsApp"}</span>
                  </button>
                </div>

                {prod.isCustomDb && (
                  <button
                    type="button"
                    disabled={deletingId === prod.id}
                    onClick={() => handleDeleteCustomProduct(prod.id, prod.title)}
                    className="w-full py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {deletingId === prod.id
                        ? "Suppression définitive..."
                        : "Supprimer définitivement"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length > visibleCount && (
        <div className="bg-white rounded-[14px] border border-black/[0.08] px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="text-xs text-slate-500">
            Affichage de <strong className="text-slate-900">{Math.min(visibleCount, filteredProducts.length)}</strong> sur <strong className="text-slate-900">{filteredProducts.length}</strong> pages produits
          </span>
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 9)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-black/[0.1] text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            Afficher 9 pages de plus ({filteredProducts.length - visibleCount} restantes)
          </button>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-[14px] border border-black/[0.08] p-8 space-y-3">
          <Store className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Aucune landing page trouvée</h3>
          <p className="text-xs text-slate-500">Essayez un autre mot-clé dans la barre de recherche.</p>
        </div>
      )}

      {/* ── MODALE CRÉATEUR DE PAGE PRODUIT NO-CODE ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[14px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.05)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Créer une Page Produit COD en 1 minute
                </h2>
                <p className="text-xs text-slate-500">
                  Publiée instantanément sur <code>/p/[slug]</code> avec votre WhatsApp et votre Pixel Meta isolés.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!userStore && (
              <div className="p-3.5 rounded-2xl bg-[#f4f4f5] border border-black/[0.08] text-[#525252] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#525252]" />
                <span>
                  Pour isoler vos produits sur votre boutique, connectez-vous et enregistrez d&apos;abord votre boutique dans{" "}
                  <Link href="/admin/settings" className="font-bold underline">
                    Ma Boutique (/admin/settings)
                  </Link>
                  .
                </span>
              </div>
            )}

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Nom du produit *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slugTouched) setSlug(slugifyStoreName(e.target.value));
                    }}
                    placeholder="Ex: Ampoule Caméra Wi-Fi 360°"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Lien URL (/p/...) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugifyStoreName(e.target.value));
                    }}
                    placeholder="ampoule-camera-360"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Prix de vente ({userStore?.currency || "FCFA"}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] text-sm font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Prix barré (avant promo)</label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Phrase d&apos;accroche (Promesse principale)</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Ex: Surveillez votre maison ou boutique depuis votre téléphone sans aucun câble !"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Photos du produit (max 5 • compression auto ultra-rapide)
                </label>

                <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 border-dashed border-black/[0.08] hover:border-emerald-400 bg-slate-50/70 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    {uploadingImages
                      ? "Compression et envoi en cours..."
                      : "Choisir des photos depuis mon téléphone ou PC"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    JPG, PNG ou WebP • {uploadedImages.length}/5 photo(s) ajoutée(s)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingImages || uploadedImages.length >= 5}
                    onChange={handleImageFilesSelect}
                    className="hidden"
                  />
                </label>

                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/[0.08]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center cursor-pointer"
                          title="Retirer cette photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  rows={1}
                  value={imageUrlsText}
                  onChange={(e) => setImageUrlsText(e.target.value)}
                  placeholder="Ou coller un lien d'image externe (optionnel)..."
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.08] text-[11px] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Bénéfices clés (1 par ligne, format : Titre | Détail optionnel)
                </label>
                <textarea
                  rows={3}
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  FAQ (1 par ligne, format : Question ? | Réponse)
                </label>
                <textarea
                  rows={2}
                  value={faqText}
                  onChange={(e) => setFaqText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating || !userStore}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {creating ? "Publication..." : "Publier la Page Produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
