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
  ShieldCheck,
  Truck,
  Package,
  Zap,
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

/* ─── Component ─── */
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
  const brandAccent = storeConfig?.accent_color || "#2563EB";
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
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const imagesList = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images.map((img: any) => (typeof img === "string" ? img : img.url)).filter(Boolean);
    }
    return product.image_url ? [product.image_url] : ["/images/microscope-real-infographic.webp"];
  }, [product]);

  // Autoplay carrousel photos toutes les 4.5s
  useEffect(() => {
    if (imagesList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % imagesList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [imagesList.length]);

  // Analytics
  const { recordInteraction } = usePagePresence(slug);

  /* ─── Fetch product from Supabase avec fallback DEFAULT_CATALOG ─── */
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

  /* ─── Helpers ─── */
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

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  const selectedBundle = product?.bundles?.[selectedBundleIdx] || null;
  const totalWithBump = selectedBundle ? selectedBundle.price : product?.price || 0;

  /* ─── Order submission ─── */
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
      const finalBundleName = selectedBundle.name;

      const createdOrder = await saveNewOrder({
        store_id: storeConfig?.id || undefined,
        product_slug: slug,
        product_title: product.title,
        bundle_name: finalBundleName,
        quantity: selectedBundle.quantity || 1,
        total_amount: totalWithBump,
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
            price: totalWithBump,
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

      // Si boutique d'un autre vendeur SaaS, on reste sur la vue succès qui redirige vers SON WhatsApp
      if (!storeConfig) {
        router.push(
          `/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(
            customerPhone
          )}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(
            String(totalWithBump)
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
      <div className="min-h-screen bg-[#FAFBFC]">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="aspect-[4/3] max-w-lg mx-auto bg-slate-100 rounded-3xl" />
          <div className="space-y-3 max-w-md mx-auto">
            <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-4 w-full bg-slate-100 rounded-lg" />
            <div className="h-4 w-2/3 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── ERROR / NOT FOUND ─── */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Package className="w-7 h-7 text-slate-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-950">
            Produit non disponible
          </h1>
          <p className="text-slate-600 text-sm">
            Ce produit n&apos;est pas disponible actuellement ou l&apos;adresse est incorrecte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 font-sans antialiased overflow-x-hidden pb-28 md:pb-12">
      {/* ── BANDEAU TOP BAR ANNONCE ── */}
      <div
        className="text-white text-[11px] font-bold py-2 px-4 text-center tracking-wide"
        style={{ backgroundColor: brandAccent }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>
            LIVRAISON EXPRESS 24H {defaultCity.toUpperCase()} • PAIEMENT À LA RÉCEPTION APRÈS TEST
          </span>
        </div>
      </div>

      {/* ── STICKY TOP NAV ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-display font-bold text-slate-950 text-base tracking-tight">
              {brandName}
            </span>
            <span className="text-xs text-slate-600 hidden sm:inline">
              • Boutique Officielle
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection("commander")}
              style={{ backgroundColor: brandAccent }}
              className="text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-sm hover:opacity-90 transition-all transform active:scale-95 cursor-pointer"
            >
              Commander ({fmt(selectedBundle?.price || product.price)}{" "}
              {brandCurrency === "FCFA" ? "F" : brandCurrency})
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-10 sm:space-y-14">
        {/* HERO SECTION */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-block text-xs font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Livraison Express {defaultCity} • Paiement à la Livraison
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
              {product.title}
            </h1>
            {product.headline && (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {product.headline}
              </p>
            )}
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <span
                className="text-2xl sm:text-3xl font-black font-mono tracking-tight"
                style={{ color: brandAccent }}
              >
                {fmt(selectedBundle?.price || product.price)} {brandCurrency}
              </span>
              {product.original_price && product.original_price > (selectedBundle?.price || product.price) && (
                <>
                  <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                    {fmt(product.original_price)} {brandCurrency}
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    -
                    {Math.round(
                      ((product.original_price - (selectedBundle?.price || product.price)) /
                        product.original_price) *
                        100
                    )}
                    %
                  </span>
                </>
              )}
            </div>
          </div>

          {/* GALERIE PHOTOS HERO */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg">
              <img
                src={imagesList[activeImgIdx] || product.image_url}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* THUMBNAILS */}
            {imagesList.length > 1 && (
              <div className="flex justify-center gap-2 overflow-x-auto py-1">
                {imagesList.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImgIdx === idx
                        ? "border-slate-900 scale-95"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3 BADGES DE RÉASSURANCE */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center space-y-1 shadow-xs">
              <Truck className="w-5 h-5 text-emerald-700 mx-auto" />
              <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
              <div className="text-[10px] text-slate-600 font-mono">{defaultCity} à domicile</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center space-y-1 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-700 mx-auto" />
              <div className="text-xs font-bold text-slate-900">Test à Réception</div>
              <div className="text-[10px] text-slate-600 font-mono">Paiement après vérification</div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center space-y-1 shadow-xs">
              <Zap className="w-5 h-5 text-amber-700 mx-auto" />
              <div className="text-xs font-bold text-slate-900">100% Neuf</div>
              <div className="text-[10px] text-slate-600 font-mono">Coffret d&apos;origine</div>
            </div>
          </div>
        </section>

        {/* ── SECTION COMMANDE IMMÉDIATE (COD) ── */}
        <section id="commander" className="max-w-xl mx-auto space-y-6">
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
        </section>

        {/* ── BÉNÉFICES MAJEURS ── */}
        {product.features && product.features.length > 0 && (
          <section className="max-w-3xl mx-auto space-y-5">
            <h2 className="font-display font-bold text-xl text-slate-950 text-center">
              Pourquoi choisir ce produit
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: brandAccent }}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900">{feat.title}</h3>
                    {feat.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {product.faq && product.faq.length > 0 && (
          <section className="max-w-2xl mx-auto space-y-4 pt-4">
            <h2 className="font-display font-bold text-xl text-slate-950 text-center mb-6">
              Questions Fréquentes
            </h2>
            <div className="space-y-3">
              {product.faq.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
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
      <footer className="max-w-5xl mx-auto px-4 mt-14 pt-6 border-t border-slate-200/80 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {brandName} • Paiement à la livraison après vérification.
      </footer>

      {/* ── STICKY MOBILE CTA BAR ── */}
      <StickyMobileCtaBar
        price={totalWithBump}
        targetSectionId="commander"
        accentColor={brandAccent}
        whatsappNumber={brandWhatsapp}
        whatsappMessage={`Bonjour ${brandName} ! Je souhaite commander ${product.title} à ${fmt(
          totalWithBump
        )} ${brandCurrency} avec livraison à domicile.`}
      />
    </div>
  );
}
