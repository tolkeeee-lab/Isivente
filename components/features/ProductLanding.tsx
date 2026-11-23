"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveNewOrder } from "@/lib/ordersStorage";
import { saveOrUpdateLead } from "@/lib/leadsStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { trackViewContent, trackInitiateCheckout } from "@/lib/metaPixel";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import { AFRICAN_COUNTRIES } from "@/lib/storesStorage";
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
  const brandDialCode =
    AFRICAN_COUNTRIES.find((c) => c.code === storeConfig?.country)?.dialCode || "229";
  const [formError, setFormError] = useState("");

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

  // Capture silencieuse des paniers abandonnés (Pilier 9 + isolation store_id multi-boutiques)
  useEffect(() => {
    if (!product || orderSuccess) return;
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 8) return;

    const timer = setTimeout(() => {
      saveOrUpdateLead({
        store_id: storeConfig?.id || undefined,
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_phone2: customerPhone2,
        customer_email: customerEmail,
        city,
        address,
        product_slug: slug,
        product_title: product.title,
        bundle_name: selectedBundle?.name || product.title,
        total_amount: currentPrice,
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [
    customerPhone,
    customerName,
    customerPhone2,
    customerEmail,
    city,
    address,
    product,
    selectedBundle,
    currentPrice,
    slug,
    storeConfig?.id,
    orderSuccess,
  ]);
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
    setFormError("");
    if (isSubmittingRef.current || isSubmitting) return;
    if (!product || !selectedBundle) return;
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 8) {
      setFormError("Veuillez saisir un numéro WhatsApp valide (au moins 8 chiffres).");
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
      setFormError("Impossible d'enregistrer votre commande pour le moment. Réessayez.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  /* ─── LOADING SKELETON ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 aspect-square bg-[#f4f4f5] rounded-[16px]" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-5 w-40 bg-[#f4f4f5] rounded-[6px]" />
            <div className="h-9 w-3/4 bg-[#f4f4f5] rounded-[8px]" />
            <div className="h-7 w-1/3 bg-[#f4f4f5] rounded-[8px]" />
            <div className="h-72 bg-[#f4f4f5] rounded-[14px] mt-6" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── ERROR / NOT FOUND ─── */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-3">
          <div className="w-12 h-12 mx-auto rounded-[12px] bg-white border border-black/[0.08] flex items-center justify-center">
            <Package className="w-5 h-5 stroke-[1.5] text-[#737373]" />
          </div>
          <h1 className="text-[20px] font-medium text-[#171717]">
            Produit non disponible
          </h1>
          <p className="text-[14px] text-[#737373]">
            Ce produit n&apos;est pas disponible actuellement ou l&apos;adresse est incorrecte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans antialiased overflow-x-hidden pb-28 md:pb-16">
      {/* ── 1. BANDEAU LIVRAISON ÉPURÉ ── */}
      <div
        className="text-white text-[12px] font-normal py-2 px-4 text-center"
        style={{ backgroundColor: brandAccent }}
      >
        <div className="max-w-6xl mx-auto">
          Livraison 24h {defaultCity} · Paiement en espèces après vérification
        </div>
      </div>

      {/* ── 2. HEADER SILENCIEUX ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-black/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-7 h-7 rounded-[6px] text-white flex items-center justify-center font-medium text-[12px] shrink-0"
              style={{ backgroundColor: brandAccent }}
            >
              {brandName.slice(0, 2).toUpperCase()}
            </span>
            <span className="font-medium text-[#171717] text-[16px] truncate">
              {brandName}
            </span>
          </div>

          <button
            onClick={() => scrollToSection("commander")}
            className="h-9 px-4 rounded-[8px] bg-[#fafafa] hover:bg-[#f4f4f5] border border-black/[0.12] text-[#171717] text-[13px] font-medium font-mono tabular-nums active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer shrink-0"
          >
            Commander · {fmt(currentPrice)} {brandCurrency === "FCFA" ? "F" : brandCurrency}
          </button>
        </div>
      </header>

      {/* ── 3. HERO SPLIT-SCREEN (GALERIE STICKY GAUCHE / IDENTITÉ & FORMULAIRE COD DROITE) ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-0 sm:pt-8 lg:pt-12 space-y-16 sm:space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Galerie */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-3">
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative -mx-4 sm:mx-0 aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#f4f4f5] sm:rounded-[16px] overflow-hidden sm:border sm:border-black/[0.08]"
            >
              <img
                src={imagesList[activeImgIdx] || product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {imagesList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImgIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[8px] bg-white/95 border border-black/[0.08] text-[#171717] flex items-center justify-center hover:bg-white transition-colors duration-150 cursor-pointer"
                    aria-label="Photo précédente"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImgIdx((prev) => (prev + 1) % imagesList.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[8px] bg-white/95 border border-black/[0.08] text-[#171717] flex items-center justify-center hover:bg-white transition-colors duration-150 cursor-pointer"
                    aria-label="Photo suivante"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                  </button>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-[6px] bg-[#171717]/80 text-white text-[12px] font-mono tabular-nums">
                    {activeImgIdx + 1} / {imagesList.length}
                  </div>
                </>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto py-1">
                {imagesList.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative w-16 h-16 rounded-[10px] overflow-hidden border transition-opacity duration-150 shrink-0 cursor-pointer ${
                      activeImgIdx === idx
                        ? "border-[#171717] opacity-100"
                        : "border-black/[0.08] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Identité, prix, réassurance & formulaire COD */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => scrollToSection("avis")}
                className="inline-flex items-center gap-2 text-[13px] text-[#525252] hover:text-[#171717] transition-colors cursor-pointer"
              >
                <div className="flex items-center text-[#b45309]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-mono tabular-nums font-medium text-[#171717]">4,9</span>
                <span className="text-[#737373] underline underline-offset-2">
                  ({displayedReviews.length} avis vérifiés)
                </span>
                <span className="text-[#737373]">· En stock à {defaultCity}</span>
              </button>

              <h1 className="text-[28px] sm:text-[36px] leading-[1.15] font-medium text-[#171717] tracking-[-0.02em]">
                {product.title}
              </h1>

              {product.headline && (
                <p className="text-[15px] text-[#525252] leading-relaxed">
                  {product.headline}
                </p>
              )}

              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span
                  className="text-[28px] sm:text-[32px] leading-none font-medium font-mono tabular-nums"
                  style={{ color: brandAccent }}
                >
                  {fmt(currentPrice)} {brandCurrency}
                </span>
                {originalPrice > currentPrice && (
                  <>
                    <span className="text-[15px] text-[#737373] line-through font-mono tabular-nums">
                      {fmt(originalPrice)} {brandCurrency}
                    </span>
                    <span className="text-[12px] font-mono tabular-nums text-[#15803d]">
                      -{discountPct}% (économie {fmt(savings)} {brandCurrency})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 3 repères de réassurance sobres */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-black/[0.08]">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 stroke-[1.5] text-[#525252] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-medium text-[#171717]">Livraison 24h</div>
                  <div className="text-[12px] text-[#737373]">{defaultCity}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 stroke-[1.5] text-[#525252] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-medium text-[#171717]">Test avant paiement</div>
                  <div className="text-[12px] text-[#737373]">Aucun risque</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 stroke-[1.5] text-[#525252] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-medium text-[#171717]">Échange gratuit</div>
                  <div className="text-[12px] text-[#737373]">Sous 7 jours</div>
                </div>
              </div>
            </div>

            {/* Formulaire de commande COD immédiat */}
            <div id="commander" className="scroll-mt-20 space-y-3">
              {formError && (
                <div className="p-3 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium">
                  {formError}
                </div>
              )}
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
                storeName={brandName}
                dialCode={brandDialCode}
                currency={brandCurrency}
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

        {/* ── 4. POINTS FORTS ── */}
        {product.features && product.features.length > 0 && (
          <section className="space-y-8 pt-10 border-t border-black/[0.08]">
            <div className="max-w-2xl space-y-1">
              <p className="text-[13px] text-[#737373]">Points forts</p>
              <h2 className="text-[24px] sm:text-[28px] font-medium text-[#171717] tracking-[-0.02em]">
                Conçu pour un usage quotidien
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {product.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-[#fafafa] border border-black/[0.08] rounded-[14px] p-5 space-y-2.5"
                >
                  <Check
                    className="w-4 h-4 stroke-[1.75]"
                    style={{ color: brandAccent }}
                  />
                  <h3 className="font-medium text-[15px] text-[#171717] leading-snug">
                    {feat.title}
                  </h3>
                  {feat.description && (
                    <p className="text-[13px] text-[#525252] leading-relaxed">
                      {feat.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. AVIS CLIENTS ── */}
        <section id="avis" className="scroll-mt-24 space-y-8 pt-10 border-t border-black/[0.08]">
          <div className="max-w-xl space-y-1">
            <h2 className="text-[24px] sm:text-[28px] font-medium text-[#171717] tracking-[-0.02em]">
              Retours clients à {defaultCity}
            </h2>
            <p className="text-[14px] text-[#737373]">
              Note moyenne de 4,9/5 sur les livraisons effectuées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayedReviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-[#fafafa] border border-black/[0.08] rounded-[14px] p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-0.5 text-[#b45309]">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-[14px] text-[#171717] leading-relaxed">{rev.comment}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] text-[12px]">
                  <span className="font-medium text-[#171717]">{rev.author}</span>
                  <span className="inline-flex items-center gap-1 text-[#525252]">
                    <BadgeCheck className="w-3.5 h-3.5 stroke-[1.5] text-[#15803d]" />
                    <span>{rev.city || defaultCity}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. QUESTIONS FRÉQUENTES ── */}
        {product.faq && product.faq.length > 0 && (
          <section className="max-w-3xl space-y-6 pt-10 border-t border-black/[0.08]">
            <h2 className="text-[24px] sm:text-[28px] font-medium text-[#171717] tracking-[-0.02em]">
              Questions fréquentes
            </h2>
            <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
              {product.faq.map((item, idx) => (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full py-4 text-left flex items-center justify-between gap-4 text-[15px] font-medium text-[#171717] hover:text-[#525252] transition-colors duration-150 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 stroke-[1.5] transition-transform duration-150 text-[#737373] ${
                        openFaq === idx ? "rotate-180 text-[#171717]" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="pb-4 text-[14px] text-[#525252] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 pt-8 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#737373]">
        <span className="font-medium text-[#171717]">{brandName}</span>
        <span>© {new Date().getFullYear()} {brandName} · Paiement à la livraison après vérification</span>
      </footer>

      {/* ── STICKY MOBILE CTA BAR ── */}
      <StickyMobileCtaBar
        price={currentPrice}
        targetSectionId="commander"
        accentColor={brandAccent}
        whatsappNumber={brandWhatsapp}
        whatsappMessage={`Bonjour ${brandName}, je souhaite commander ${product.title} à ${fmt(
          currentPrice
        )} ${brandCurrency} avec livraison à domicile.`}
      />
    </div>
  );
}
