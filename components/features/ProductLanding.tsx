"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import { trackViewContent, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";
import { getProductUpsellConfig } from "@/lib/upsellConfig";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import UmeiStyleOrderSection from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import HorizontalCarousel from "@/components/ui/HorizontalCarousel";
import {
  Check,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Truck,
  Package,
  MessageSquare,
  Zap,
  Star,
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

/* ─── Component ─── */
export default function ProductLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedBundleIdx, setSelectedBundleIdx] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [includeBump, setIncludeBump] = useState(false);
  const [includeSecondUnit, setIncludeSecondUnit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const imagesList = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images.map((img: any) => (typeof img === "string" ? img : img.url));
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
  const sessionIdRef = useRef(
    "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8)
  );
  const startTimeRef = useRef(Date.now());
  const clickedRef = useRef(false);

  /* ─── Fetch product from Supabase avec fallback DEFAULT_CATALOG ─── */
  useEffect(() => {
    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        let rawProduct = data;

        // Fallback sur le catalogue local si absent en base
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

        const formatted: ProductData = {
          ...rawProduct,
          image_url:
            rawProduct.image_url ||
            (rawProduct.images && rawProduct.images[0]?.url) ||
            "/images/microscope-real-infographic.webp",
          bundles: rawProduct.bundles || [{ name: rawProduct.title, price: rawProduct.price }],
          features: rawProduct.features || [],
          reviews: rawProduct.reviews || [],
          faq: rawProduct.faq || [],
        };

        setProduct(formatted);

        // Meta Pixel: ViewContent
        trackViewContent({
          content_name: formatted.title,
          content_ids: [slug],
          value: formatted.price,
          currency: "XOF",
        });

        // Select the popular bundle by default, or the first one
        const popularIdx = (formatted.bundles || []).findIndex(
          (b: ProductBundle) => b.popular
        );
        setSelectedBundleIdx(popularIdx >= 0 ? popularIdx : 0);
      } catch {
        // Fallback final
        if (DEFAULT_CATALOG_MAP[slug]) {
          const cat = DEFAULT_CATALOG_MAP[slug];
          setProduct({
            id: cat.id,
            slug: cat.slug,
            title: cat.title,
            headline: cat.title,
            price: cat.price,
            image_url: cat.image_url,
            bundles: cat.bundles,
          });
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  /* ─── Analytics tracking ─── */
  useEffect(() => {
    const save = () => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      trackUserSession(slug, duration, clickedRef.current, sessionIdRef.current);
    };
    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("beforeunload", save);
    };
  }, [slug]);

  /* ─── Helpers ─── */
  const scrollToSection = (id: string) => {
    if ((id === "order-form" || id === "commander") && product) {
      trackInitiateCheckout({
        content_name: product.title,
        content_ids: [slug],
        value: selectedBundle?.price || product.price,
        currency: "XOF",
      });
    }
    const targetId = id === "order-form" || id === "commander" ? (document.getElementById("commander") ? "commander" : "order-form") : id;
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
  const upsellConfig = getProductUpsellConfig(slug, product?.title, product?.price);
  const secondUnitPrice = includeSecondUnit && upsellConfig.secondUnit ? upsellConfig.secondUnit.price : 0;
  const bumpPrice = includeBump && upsellConfig.bump ? upsellConfig.bump.price : 0;
  const totalWithBump = (selectedBundle ? selectedBundle.price : (product?.price || 0)) + secondUnitPrice + bumpPrice;

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
      const finalBundleName = selectedBundle.name 
        + (includeSecondUnit && upsellConfig.secondUnit ? ` + 2ème Exemplaire (${upsellConfig.secondUnit.title})` : "")
        + (includeBump && upsellConfig.bump ? ` + [BUMP] ${upsellConfig.bump.title}` : "");

      const createdOrder = await saveNewOrder({
        product_slug: slug,
        product_title: product.title,
        bundle_name: finalBundleName,
        quantity: (selectedBundle.quantity || 1) + (includeSecondUnit ? 1 : 0),
        total_amount: totalWithBump,
        customer_name: customerName || "Client",
        customer_phone: customerPhone + (customerPhone2 ? ` / ${customerPhone2}` : ""),
        shipping_city: city,
        city: city,
        shipping_address: address,
        address: address,
        status: "pending" as const,
      });

      // Meta Pixel: Purchase
      trackPurchase({
        content_name: product.title,
        content_ids: [slug],
        value: totalWithBump,
        currency: "XOF",
        num_items: selectedBundle.quantity || 1,
      });

      try {
        sessionStorage.setItem("isivente_last_purchase_meta", JSON.stringify({
          title: product.title,
          price: totalWithBump,
          quantity: selectedBundle.quantity || 1,
        }));
      } catch {}

      clickedRef.current = true;
      const duration = (Date.now() - startTimeRef.current) / 1000;
      await trackUserSession(slug, duration, true, sessionIdRef.current);

      const orderRef = createdOrder?.order_number || ("CMD-" + Math.floor(100000 + Math.random() * 900000));
      setOrderNumber(orderRef);
      setOrderSuccess(true);
      setIsSubmitting(false);
      isSubmittingRef.current = false;

      router.push(`/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&total=${encodeURIComponent(String(totalWithBump))}`);
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
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="h-20 bg-slate-100 rounded-2xl" />
            <div className="h-20 bg-slate-100 rounded-2xl" />
            <div className="h-20 bg-slate-100 rounded-2xl" />
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
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            ← Retour à l&apos;accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 font-sans antialiased overflow-x-hidden pb-28 md:pb-12">
      {/* ── STICKY TOP NAV ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-display font-bold text-slate-950 text-base tracking-tight">
              Isivente
            </span>
            <span className="text-xs text-slate-600 hidden sm:inline">
              • Boutique Officielle
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection("commander")}
              className="bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all transform active:scale-95 cursor-pointer"
            >
              Commander ({fmt(selectedBundle?.price || product.price)} F)
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-10 sm:space-y-14">
        {/* HERO SECTION */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Offre Spéciale Bénin • Livraison COD
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
              {product.title}
            </h1>
            {product.headline && (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {product.headline}
              </p>
            )}
          </div>

          {/* GALERIE PHOTOS HERO */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg">
              <img
                src={imagesList[activeImgIdx] || product.image_url}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-800">
                ⭐ 4.9/5 • Recommandé
              </div>
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
                        ? "border-primary ring-2 ring-primary/20 scale-95"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
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
              <div className="text-[10px] text-slate-600 font-mono">Bénin à domicile</div>
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
              const idx = (product.bundles || []).findIndex(x => x.name === b.name);
              if (idx >= 0) setSelectedBundleIdx(idx);
            }}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerPhone2={customerPhone2}
            setCustomerPhone2={setCustomerPhone2}
            city={city}
            setCity={setCity}
            address={address}
            setAddress={setAddress}
            includeBump={includeBump}
            setIncludeBump={setIncludeBump}
            bumpOffer={upsellConfig.bump}
            includeSecondUnit={includeSecondUnit}
            setIncludeSecondUnit={setIncludeSecondUnit}
            secondUnitOffer={upsellConfig.secondUnit}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            accentColor="#2563EB"
            whatsappNumber={product.whatsapp_number || "2290192901817"}
            orderSuccess={orderSuccess}
            orderNumber={orderNumber}
            onResetOrder={() => {
              setOrderSuccess(false);
              setOrderNumber("");
            }}
          />
        </section>

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
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                        openFaq === idx ? "rotate-180 text-primary" : ""
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

      {/* ── STICKY MOBILE CTA BAR ── */}
      <StickyMobileCtaBar
        price={totalWithBump}
        targetSectionId="commander"
        accentColor="#2563EB"
        whatsappNumber={product.whatsapp_number || "2290192901817"}
        whatsappMessage={`Bonjour ! Je souhaite commander ${product.title} à ${fmt(totalWithBump)} FCFA avec livraison à domicile.`}
      />
    </div>
  );
}
