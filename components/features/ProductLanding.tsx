"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { saveNewOrder } from "@/lib/ordersStorage";
import { trackUserSession } from "@/lib/analyticsStorage";
import { trackViewContent, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";
import { getProductUpsellConfig } from "@/lib/upsellConfig";
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
  bundles: ProductBundle[];
  whatsapp_number?: string;
  features?: { icon?: string; title: string; description: string }[];
  reviews?: { author: string; city: string; rating: number; comment: string; date: string }[];
  faq?: { q: string; a: string }[];
}

/* ─── Component ─── */
export default function ProductLanding({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedBundleIdx, setSelectedBundleIdx] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [includeBump, setIncludeBump] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Analytics
  const sessionIdRef = useRef(
    "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8)
  );
  const startTimeRef = useRef(Date.now());
  const clickedRef = useRef(false);

  /* ─── Fetch product from Supabase ─── */
  useEffect(() => {
    async function load() {
      try {
        const { data, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        if (fetchError || !data) {
          setError(true);
          setLoading(false);
          return;
        }

        const formatted: ProductData = {
          ...data,
          image_url:
            data.image_url ||
            (data.images && data.images[0]?.url) ||
            "/images/default-hero.jpg",
          bundles: data.bundles || [],
          features: data.features || [],
          reviews: data.reviews || [],
          faq: data.faq || [],
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
        setError(true);
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
    if (id === "order-form" && product) {
      trackInitiateCheckout({
        content_name: product.title,
        content_ids: [slug],
        value: selectedBundle?.price || product.price,
        currency: "XOF",
      });
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  const selectedBundle = product?.bundles?.[selectedBundleIdx] || null;
  const upsellConfig = getProductUpsellConfig(slug, product?.title, product?.price);
  const bumpPrice = includeBump && upsellConfig.bump ? upsellConfig.bump.price : 0;
  const totalWithBump = (selectedBundle ? selectedBundle.price : (product?.price || 0)) + bumpPrice;

  /* ─── Order submission ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !selectedBundle) return;
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      alert("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalBundleName = selectedBundle.name + (includeBump && upsellConfig.bump ? ` + [BUMP] ${upsellConfig.bump.title}` : "");

      const createdOrder = await saveNewOrder({
        product_slug: slug,
        product_title: product.title,
        bundle_name: finalBundleName,
        quantity: selectedBundle.quantity || 1,
        total_amount: totalWithBump,
        customer_name: customerName,
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

      const orderRef = createdOrder?.order_number || "";
      if (upsellConfig.upsell) {
        window.location.href = `/p/${slug}/upsell?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(customerPhone)}`;
      } else {
        window.location.href = `/p/${slug}/success?order=${encodeURIComponent(orderRef)}&phone=${encodeURIComponent(customerPhone)}`;
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Erreur lors de l'enregistrement. Veuillez réessayer.");
      setIsSubmitting(false);
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
            Produit introuvable
          </h1>
          <p className="text-slate-600 text-sm">
            Le produit &laquo;&nbsp;{slug}&nbsp;&raquo; n&apos;existe pas ou a été retiré du catalogue.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    );
  }

  const whatsapp = product.whatsapp_number || "2290192901817";
  const bundles = product.bundles || [];
  const reviews = product.reviews || [];
  const faqItems = product.faq || [];

  /* ─── RENDER ─── */
  return (
    <div className="bg-[#FAFBFC] min-h-screen text-slate-900 font-sans antialiased overflow-x-hidden w-full max-w-full relative selection:bg-indigo-100 selection:text-indigo-900 pb-24 md:pb-0">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 w-full">
        <nav className="flex items-center justify-between py-3.5 px-4 md:px-8 max-w-[1180px] mx-auto w-full">
          <div className="font-display text-xl font-extrabold tracking-tight text-slate-950">
            Isivente
          </div>

          <ul className="hidden md:flex gap-8 text-[14px] font-semibold text-slate-600">
            {bundles.length > 0 && (
              <li>
                <button
                  onClick={() => scrollToSection("packs")}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Offres
                </button>
              </li>
            )}
            {reviews.length > 0 && (
              <li>
                <button
                  onClick={() => scrollToSection("avis")}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Avis
                </button>
              </li>
            )}
            {faqItems.length > 0 && (
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Questions
                </button>
              </li>
            )}
          </ul>

          <button
            onClick={() => scrollToSection("commander")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-[0_6px_16px_-6px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all cursor-pointer active:scale-[0.97]"
            style={{ transition: "all 160ms cubic-bezier(0.2, 0, 0, 1)" }}
          >
            Commander
          </button>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="pt-8 md:pt-16 pb-0 px-4 md:px-8 max-w-[1180px] mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">

          {/* Image */}
          <div className="md:col-span-5 flex justify-center items-center order-1">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] mx-auto">
              <img
                src={product.image_url}
                alt={product.title}
                className="rounded-[28px] w-full shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] object-cover border border-slate-200/60"
              />
              {/* Price badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-full text-sm font-mono font-bold text-indigo-700 shadow-sm tabular-nums">
                {fmt(product.price)} FCFA
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="md:col-span-7 space-y-5 text-center md:text-left flex flex-col items-center md:items-start order-2">
            <h1 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl leading-[1.12] text-slate-950 tracking-tight max-w-xl">
              {product.title}
            </h1>

            {product.headline && (
              <p className="text-slate-600 text-sm sm:text-base md:text-lg font-medium max-w-lg leading-relaxed">
                {product.headline}
              </p>
            )}

            {product.description && (
              <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
                {product.description}
              </p>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 w-full pt-1">
              <button
                onClick={() => scrollToSection("commander")}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-full font-bold text-base shadow-[0_12px_28px_-10px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
                style={{ transition: "all 160ms cubic-bezier(0.2, 0, 0, 1)" }}
              >
                <span>Je commande — {fmt(product.price)} FCFA</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1 w-full">
              <span className="bg-white text-slate-600 text-xs font-bold py-1.5 px-3.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Paiement à la livraison
              </span>
              <span className="bg-white text-slate-600 text-xs font-bold py-1.5 px-3.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Livraison 24h–48h
              </span>
              <span className="bg-white text-slate-600 text-xs font-bold py-1.5 px-3.5 rounded-full shadow-sm border border-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Garantie 30 jours
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PACKS / BUNDLES + ORDER FORM ── */}
      {bundles.length > 0 && (
        <section id="packs" className="py-12 md:py-20 px-4 md:px-8 max-w-[1180px] mx-auto w-full">
          <div className="max-w-2xl mx-auto space-y-8">

            <div className="text-center space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Offres Spéciales
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-950">
                Choisissez votre pack
              </h2>
            </div>

            {/* Bundle cards */}
            <div className="space-y-3">
              {bundles.map((bundle, idx) => {
                const isSelected = selectedBundleIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBundleIdx(idx)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer relative ${
                      isSelected
                        ? "bg-indigo-50/40 border-indigo-600 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-600"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                    style={{
                      transition: "all 160ms cubic-bezier(0.2, 0, 0, 1)",
                      animationDelay: `${idx * 35}ms`,
                    }}
                  >
                    {bundle.badge && (
                      <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                        {bundle.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-slate-100"
                          }`}
                          style={{ transition: "all 120ms cubic-bezier(0.2, 0, 0, 1)" }}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{bundle.name}</div>
                          {(bundle.subtitle || bundle.description) && (
                            <div className="text-xs text-slate-600">
                              {bundle.subtitle || bundle.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-base text-indigo-700 tabular-nums">
                          {fmt(bundle.price)} F
                        </div>
                        {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                          <div className="text-[11px] font-mono text-slate-400 line-through tabular-nums">
                            {fmt(bundle.originalPrice)} F
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order CTA */}
            <button
              type="button"
              onClick={() => scrollToSection("commander")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/20 active:scale-[0.98] text-sm uppercase tracking-wider cursor-pointer"
              style={{ transition: "all 160ms cubic-bezier(0.2, 0, 0, 1)" }}
            >
              <Zap className="w-4 h-4 fill-current text-amber-300" />
              <span>
                Commander ({selectedBundle ? fmt(selectedBundle.price) : fmt(product.price)} FCFA)
              </span>
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Livraison 24h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Paiement à la livraison</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ORDER FORM ── */}
      <section
        id="commander"
        className="py-12 md:py-20 px-4 md:px-8 max-w-[1180px] mx-auto w-full"
      >
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl max-w-2xl mx-auto"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.9), 0 2px 8px -2px rgba(0, 0, 0, 0.06)" }}
        >
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Livraison Express Bénin (24h - 48h)
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              Commandez maintenant, payez à la livraison
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Remplissez ce formulaire en 30 secondes. Notre livreur vous contactera avant de passer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected pack summary */}
            {selectedBundle && (
              <div className="bg-slate-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-mono uppercase text-indigo-700 font-bold">
                    Pack sélectionné
                  </span>
                  <div className="font-bold text-sm text-slate-900">{selectedBundle.name}</div>
                </div>
                <div className="font-mono font-bold text-lg text-indigo-700 tabular-nums">
                  {fmt(selectedBundle.price)} FCFA
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom &amp; Prénom <span className="text-indigo-600">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex : Aminata Dossou"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium"
                style={{ transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Numéro de Téléphone (WhatsApp / Appel) <span className="text-indigo-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ex : 01 97 00 00 00"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-mono font-semibold"
                style={{ transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </div>

            {/* Phone 2 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Deuxième numéro (Optionnel)
              </label>
              <input
                type="tel"
                value={customerPhone2}
                onChange={(e) => setCustomerPhone2(e.target.value)}
                placeholder="Ex : 01 95 00 00 00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-400 font-mono"
                style={{ transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </div>

            {/* City & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ville / Commune <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex : Cotonou, Calavi..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium"
                  style={{ transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Quartier &amp; Adresse <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex : Akpakpa, près de..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 font-medium"
                  style={{ transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                />
              </div>
            </div>

            {/* ORDER BUMP OPTIONNEL PRE-PURCHASE */}
            {upsellConfig.bump && (
              <div 
                onClick={() => setIncludeBump(!includeBump)}
                className={`p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer select-none ${
                  includeBump
                    ? "bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/20"
                    : "bg-slate-50/80 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={includeBump}
                      onChange={(e) => setIncludeBump(e.target.checked)}
                      className="w-5 h-5 rounded-md text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                        {upsellConfig.bump.badge || "OFFRE EXCLUSIVE"}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {upsellConfig.bump.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {upsellConfig.bump.subtitle}
                    </p>
                    <div className="mt-2 flex items-center gap-2 font-mono text-xs">
                      <span className="line-through text-slate-400 tabular-nums">
                        {fmt(upsellConfig.bump.originalPrice)} FCFA
                      </span>
                      <span className="font-bold text-emerald-700 tabular-nums">
                        +{fmt(upsellConfig.bump.price)} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-[0.98] text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50 mt-4"
              style={{ transition: "all 160ms cubic-bezier(0.2, 0, 0, 1)" }}
            >
              {isSubmitting ? (
                <span>Enregistrement en cours...</span>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>
                    Confirmer Ma Commande ({fmt(totalWithBump)} FCFA)
                  </span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-slate-500 pt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantie Satisfait ou Échangé sous 14 jours &bull; Paiement à la réception</span>
            </div>
          </form>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      {reviews.length > 0 && (
        <section id="avis" className="py-12 px-4 md:px-8 max-w-[1180px] mx-auto w-full">
          <div className="text-center space-y-1 mb-8">
            <h2 className="font-display font-bold text-2xl text-slate-950">
              Ce qu&apos;en disent nos clients
            </h2>
            <p className="text-slate-600 text-xs">
              Retours d&apos;expérience après livraison
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-3 shadow-sm"
                style={{
                  animationDelay: `${i * 35}ms`,
                  boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.9), 0 1px 3px 0 rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{rev.author}</span>
                  <span className="text-slate-500 font-mono">{rev.city}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {faqItems.length > 0 && (
        <section id="faq" className="py-12 px-4 md:px-8 max-w-[1180px] mx-auto w-full">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-950 text-center mb-6">
              Questions Fréquentes
            </h2>

            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm"
                  style={{
                    boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.9), 0 1px 3px 0 rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-slate-900 hover:text-indigo-600"
                    style={{ transition: "color 160ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 ${isOpen ? "rotate-180 text-indigo-600" : ""}`}
                      style={{ transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── WHATSAPP FLOATING ── */}
      <a
        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour Isivente, j'ai une question sur ${product.title}`)}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs tracking-wide active:scale-90 hover:scale-105"
        style={{ transition: "all 150ms cubic-bezier(0.2, 0, 0, 1)" }}
        title="Discuter sur WhatsApp"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline">Besoin d&apos;aide ?</span>
      </a>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-600 space-y-2">
        <p className="font-bold text-slate-800">Isivente &bull; Commerce Pro Bénin</p>
        <p>Service Client WhatsApp : +229 01 92 90 18 17 &bull; Cotonou, Bénin</p>
        <p className="text-[10px] text-slate-400">&copy; 2026 Isivente. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
