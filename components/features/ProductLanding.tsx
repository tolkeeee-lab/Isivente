"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { trackViewContent, trackInitiateCheckout } from "@/lib/metaPixel";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Package,
  Zap,
  Star,
  BadgeCheck,
} from "lucide-react";

/* ─── Types ─── */
interface ProductBundle {
  name: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  popular?: boolean;
  description?: string;
  subtitle?: string;
  quantity?: number;
}

interface ProductData {
  id: string;
  slug: string;
  title: string;
  headline?: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url: string;
  images?: Array<{ url: string; alt?: string } | string>;
  bundles: ProductBundle[];
  whatsapp_number?: string;
  features?: { icon?: string; title: string; description: string }[];
  reviews?: { author: string; city: string; rating: number; comment: string; date: string }[];
  faq?: { q: string; a: string }[];
}

export interface PublicStoreConfig {
  id: string;
  name: string;
  slug: string;
  country?: string;
  currency?: string;
  city?: string;
  whatsapp_number?: string;
  meta_pixel_id?: string | null;
  accent_color?: string;
}

function formatRawProduct(rawProduct: any): ProductData {
  const firstImg =
    rawProduct.image_url ||
    (Array.isArray(rawProduct.images) && rawProduct.images[0]
      ? typeof rawProduct.images[0] === "string"
        ? rawProduct.images[0]
        : rawProduct.images[0].url
      : "/images/microscope-real-infographic.webp");

  return {
    ...rawProduct,
    image_url: firstImg,
    bundles:
      Array.isArray(rawProduct.bundles) && rawProduct.bundles.length > 0
        ? rawProduct.bundles
        : [{ name: rawProduct.title, price: rawProduct.price, quantity: 1 }],
    features: Array.isArray(rawProduct.features) ? rawProduct.features : [],
    reviews: Array.isArray(rawProduct.reviews)
      ? rawProduct.reviews
      : Array.isArray(rawProduct.testimonials)
      ? rawProduct.testimonials
      : [],
    faq: Array.isArray(rawProduct.faq) ? rawProduct.faq : [],
  };
}

/* ─── Component (Shopify Prestige / Apple DTC Standard) ─── */
export default function ProductLanding({
  slug,
  initialProduct,
  storeConfig,
}: {
  slug: string;
  initialProduct?: any;
  storeConfig?: PublicStoreConfig | null;
}) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(
    initialProduct ? formatRawProduct(initialProduct) : null
  );
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(false);

  const brandName = storeConfig?.name || "Isivente";
  const brandAccent = storeConfig?.accent_color || "#059669";
  const brandWhatsapp = storeConfig?.whatsapp_number || product?.whatsapp_number || "2290192901817";
  const brandCurrency = storeConfig?.currency || "FCFA";
  const defaultCity = storeConfig?.city || "Cotonou";

  const [selectedBundleIdx, setSelectedBundleIdx] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [city, setCity] = useState(defaultCity);
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const imagesList = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images
        .map((img: any) => (typeof img === "string" ? img : img.url))
        .filter(Boolean);
    }
    return product.image_url ? [product.image_url] : ["/images/microscope-real-infographic.webp"];
  }, [product]);

  // Autoplay carrousel fluide avec pause au survol
  useEffect(() => {
    if (imagesList.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % imagesList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [imagesList.length, isPaused]);

  const { recordInteraction } = usePagePresence(slug);

  useEffect(() => {
    if (initialProduct) {
      const formatted = formatRawProduct(initialProduct);
      setProduct(formatted);
      setLoading(false);
      trackViewContent({
        content_name: formatted.title,
        content_ids: [slug],
        value: formatted.price,
        currency: "XOF",
      });
      return;
    }

    async function load() {
      try {
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        let rawProduct: any = data;

        if (!rawProduct && DEFAULT_CATALOG_MAP[slug]) {
          const cat = DEFAULT_CATALOG_MAP[slug];
          rawProduct = {
            id: cat.id,
            slug: cat.slug,
            title: cat.title,
            headline: cat.headline || cat.title,
            price: cat.price,
            image_url: cat.image_url,
            bundles: cat.bundles,
            features: [],
            reviews: [],
            faq: [],
          };
        }

        if (!rawProduct) {
          setError(true);
          setLoading(false);
          return;
        }

        const formatted = formatRawProduct(rawProduct);
        setProduct(formatted);

        trackViewContent({
          content_name: formatted.title,
          content_ids: [slug],
          value: formatted.price,
          currency: "XOF",
        });

        const popularIdx = (formatted.bundles || []).findIndex(
          (b: ProductBundle) => b.popular
        );
        setSelectedBundleIdx(popularIdx >= 0 ? popularIdx : 0);
      } catch {
        if (DEFAULT_CATALOG_MAP[slug]) {
          const cat = DEFAULT_CATALOG_MAP[slug];
          setProduct(
            formatRawProduct({
              id: cat.id,
              slug: cat.slug,
              title: cat.title,
              headline: cat.title,
              price: cat.price,
              image_url: cat.image_url,
              bundles: cat.bundles,
            })
          );
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, initialProduct]);

  const scrollToSection = (id: string) => {
    if ((id === "order-form" || id === "commander") && product) {
      recordInteraction();
      trackInitiateCheckout({
        content_name: product.title,
        content_ids: [slug],
        value: selectedBundle?.price || product.price,
        currency: "XOF",
      });
    }
    const targetId =
      id === "order-form" || id === "commander"
        ? document.getElementById("commander")
          ? "commander"
          : "order-form"
        : id;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (targetId === "commander" || targetId === "order-form") {
        setTimeout(() => {
          const input = (document.getElementById("customer-name-input") ||
            el.querySelector("input[type='text'], input[type='tel']")) as HTMLInputElement | null;
          if (input) input.focus({ preventScroll: true });
        }, 400);
      }
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

  const selectedBundle = product?.bundles?.[selectedBundleIdx] || null;
  const currentPrice = selectedBundle ? selectedBundle.price : product?.price || 0;
  const originalPrice = product?.original_price || 0;
  const savings = originalPrice > currentPrice ? originalPrice - currentPrice : 0;
  const discountPct =
    originalPrice > currentPrice ? Math.round((savings / originalPrice) * 100) : 0;

  const displayedReviews = useMemo(() => {
    if (product?.reviews && product.reviews.length > 0) return product.reviews;
    return [
      {
        author: "Koffi M.",
        city: defaultCity,
        rating: 5,
        comment:
          "Livraison super rapide le jour même. J'ai pu vérifier le colis devant le livreur avant de payer, rien à dire.",
        date: "Client vérifié",
      },
      {
        author: "Amina D.",
        city: defaultCity,
        rating: 5,
        comment:
          "Conforme aux photos et très bien emballé. Service client réactif sur WhatsApp.",
        date: "Client vérifié",
      },
      {
        author: "Serge A.",
        city: defaultCity,
        rating: 5,
        comment:
          "Très satisfait de la qualité et du sérieux de la boutique. Je recommande sans hésiter.",
        date: "Client vérifié",
      },
    ];
  }, [product?.reviews, defaultCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;
    if (!product || !selectedBundle) return;
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const createdOrder = await saveNewOrder({
        store_id: storeConfig?.id || undefined,
        product_slug: slug,
        product_title: product.title,
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity || 1,
        total_amount: currentPrice,
        customer_name: customerName || "Client",
        customer_phone: customerPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        shipping_city: city,
        city: city,
        shipping_address: address,
        address: address,
        customer_email: customerEmail.trim() || undefined,
        status: "pending" as const,
      });

      try {
        sessionStorage.setItem(
          "isivente_last_purchase_meta",
          JSON.stringify({
            title: product.title,
            price: currentPrice,
            quantity: selectedBundle.quantity || 1,
            customer_email: customerEmail.trim() || undefined,
          })
        );
      } catch {}

      recordInteraction();

      const orderRef =
        createdOrder?.order_number || "CMD-" + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(orderRef);
      setOrderSuccess(true);
      setIsSubmitting(false);
      isSubmittingRef.current = false;

      if (!storeConfig) {
        router.push(
          `/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(
            customerPhone
          )}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(
            String(currentPrice)
          )}`
        );
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Erreur lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  /* ─── LOADING SKELETON ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
          <div className="lg:col-span-6 aspect-square bg-slate-100 rounded-3xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-5 w-40 bg-slate-100 rounded-full" />
            <div className="h-9 w-3/4 bg-slate-200 rounded-xl" />
            <div className="h-7 w-1/3 bg-slate-100 rounded-xl" />
            <div className="h-72 bg-slate-100 rounded-3xl mt-6" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── ERROR / NOT FOUND ─── */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <Package className="w-7 h-7 text-slate-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-950 tracking-tight">
            Produit non disponible
          </h1>
          <p className="text-slate-500 text-sm">
            Ce produit n&apos;est pas disponible actuellement ou l&apos;adresse est incorrecte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans antialiased overflow-x-hidden pb-28 md:pb-16">
      {/* ── 1. BANDEAU TOP BAR ÉPURÉ ── */}
      <div
        className="text-white text-[11px] font-semibold py-2 px-4 text-center tracking-wide"
        style={{ backgroundColor: brandAccent }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
          <span>
            Livraison Express 24h {defaultCity} • Paiement en espèces après vérification
          </span>
        </div>
      </div>

      {/* ── 2. HEADER MINIMALISTE PRESTIGE ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs"
              style={{ backgroundColor: brandAccent }}
            >
              {brandName.slice(0, 2).toUpperCase()}
            </span>
            <span className="font-display font-extrabold text-slate-950 text-base tracking-tight truncate">
              {brandName}
            </span>
          </div>

          <button
            onClick={() => scrollToSection("commander")}
            style={{ backgroundColor: brandAccent }}
            className="text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            Commander • {fmt(currentPrice)} {brandCurrency === "FCFA" ? "F" : brandCurrency}
          </button>
        </div>
      </header>

      {/* ── 3. HERO SPLIT-SCREEN PRESTIGE (2 COLONNES DESKTOP / BORD-À-BORD MOBILE) ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-0 sm:pt-8 lg:pt-12 space-y-16 sm:space-y-24">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* COLONNE GAUCHE : GALERIE IMMERSIVE (STICKY SUR DESKTOP, EDGE-TO-EDGE SUR MOBILE) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-3">
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative -mx-4 sm:mx-0 aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#F7F7F8] sm:rounded-3xl overflow-hidden sm:border sm:border-slate-200/80 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.18)] group"
            >
              <img
                src={imagesList[activeImgIdx] || product.image_url}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {/* Flèches discrètes si plusieurs images */}
              {imagesList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImgIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 flex items-center justify-center shadow-sm hover:bg-white transition-all cursor-pointer"
                    aria-label="Photo précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImgIdx((prev) => (prev + 1) % imagesList.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 flex items-center justify-center shadow-sm hover:bg-white transition-all cursor-pointer"
                    aria-label="Photo suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-mono font-bold">
                    {activeImgIdx + 1} / {imagesList.length}
                  </div>
                </>
              )}
            </div>

            {/* Pastilles & Miniatures */}
            {imagesList.length > 1 && (
              <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto py-1">
                {imagesList.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImgIdx === idx
                        ? "border-slate-950 shadow-xs"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLONNE DROITE : IDENTITÉ, PREUVE SOCIALE, PRIX & FORMULAIRE COD DIRECT */}
          <div className="lg:col-span-6 space-y-6">
            {/* Titre + Note + Prix */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-slate-900">4.9</span>
                <span className="text-slate-400">•</span>
                <span>Avis vérifiés • En stock à {defaultCity}</span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-950 tracking-[-0.025em] leading-[1.12]">
                {product.title}
              </h1>

              {product.headline && (
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  {product.headline}
                </p>
              )}

              {/* Prix & Économie */}
              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span
                  className="text-3xl font-black font-mono tracking-tight"
                  style={{ color: brandAccent }}
                >
                  {fmt(currentPrice)} {brandCurrency}
                </span>
                {originalPrice > currentPrice && (
                  <>
                    <span className="text-base text-slate-400 line-through font-mono">
                      {fmt(originalPrice)} {brandCurrency}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      -{discountPct}% • Économisez {fmt(savings)} {brandCurrency}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Barre de réassurance épurée (Zéro boîte lourde) */}
            <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-slate-100">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 text-center sm:text-left">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[1.75]" />
                <div>
                  <div className="text-[11px] font-bold text-slate-900">Livraison 24h</div>
                  <div className="text-[10px] text-slate-500">{defaultCity}</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 text-center sm:text-left">
                <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 mt-0.5 stroke-[1.75]" />
                <div>
                  <div className="text-[11px] font-bold text-slate-900">Test avant paiement</div>
                  <div className="text-[10px] text-slate-500">0 risque</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 text-center sm:text-left">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 stroke-[1.75]" />
                <div>
                  <div className="text-[11px] font-bold text-slate-900">100% Neuf</div>
                  <div className="text-[10px] text-slate-500">Garanti</div>
                </div>
              </div>
            </div>

            {/* FORMULAIRE DE COMMANDE COD IMMÉDIAT */}
            <div id="commander" className="scroll-mt-20">
              <UmeiStyleOrderSection
                productSlug={slug}
                productTitle={product.title}
                productImage={product.image_url}
                bundles={product.bundles}
                selectedBundle={selectedBundle as any}
                onSelectBundle={(b) => {
                  const idx = (product.bundles || []).findIndex((x) => x.name === b.name);
                  if (idx >= 0) setSelectedBundleIdx(idx);
                }}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                customerPhone2={customerPhone2}
                setCustomerPhone2={setCustomerPhone2}
                customerEmail={customerEmail}
                setCustomerEmail={setCustomerEmail}
                city={city}
                setCity={setCity}
                address={address}
                setAddress={setAddress}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                accentColor={brandAccent}
                whatsappNumber={brandWhatsapp}
                orderSuccess={orderSuccess}
                orderNumber={orderNumber}
                onResetOrder={() => {
                  setOrderSuccess(false);
                  setOrderNumber("");
                }}
              />
            </div>
          </div>
        </section>

        {/* ── 4. BÉNÉFICES MAJEURS (STYLE ÉDITORIAL PROPRE) ── */}
        {product.features && product.features.length > 0 && (
          <section className="space-y-8 pt-6 border-t border-slate-100">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Points forts
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-950 tracking-[-0.02em]">
                Conçu pour votre quotidien
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {product.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAFBFC] border border-slate-200/70 rounded-3xl p-6 space-y-3 hover:bg-white hover:shadow-md transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: brandAccent }}
                  >
                    <Check className="w-5 h-5 stroke-[2.25]" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-950 leading-snug">
                    {feat.title}
                  </h3>
                  {feat.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="space-y-8 pt-6 border-t border-slate-100">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-950 tracking-[-0.02em]">
              Ce que disent nos clients
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Note moyenne de 4,9/5 sur les livraisons effectuées à {defaultCity}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayedReviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-900">{rev.author}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {rev.city || defaultCity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. FAQ ACCORDÉON ÉPURÉE ── */}
        {product.faq && product.faq.length > 0 && (
          <section className="max-w-3xl mx-auto space-y-6 pt-6 border-t border-slate-100">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-950 text-center tracking-[-0.02em]">
              Questions fréquentes
            </h2>
            <div className="divide-y divide-slate-200/80 border-y border-slate-200/80">
              {product.faq.map((item, idx) => (
                <div key={idx} className="py-1">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full py-4 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-slate-900 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 text-slate-400 ${
                        openFaq === idx ? "rotate-180 text-slate-900" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="pb-4 text-sm text-slate-600 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── FOOTER PROPRE ── */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span className="font-bold text-slate-800">{brandName}</span>
        <span>© {new Date().getFullYear()} {brandName} • Paiement à la livraison après vérification.</span>
      </footer>

      {/* ── STICKY MOBILE CTA BAR ── */}
      <StickyMobileCtaBar
        price={currentPrice}
        targetSectionId="commander"
        accentColor={brandAccent}
        whatsappNumber={brandWhatsapp}
        whatsappMessage={`Bonjour ${brandName} ! Je souhaite commander ${product.title} à ${fmt(
          currentPrice
        )} ${brandCurrency} avec livraison à domicile.`}
      />
    </div>
  );
}
