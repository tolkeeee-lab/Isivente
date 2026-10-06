"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Award,
  // Mapping icons by name
  Sun, Droplets, Leaf, Sparkles, Heart, Zap, PackageCheck
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackMultiViewContent as trackViewContent, trackMultiInitiateCheckout as trackInitiateCheckout, trackMultiPurchase as trackPurchase } from "@/lib/trackingBridge";

export interface TestimonialImage {
  name: string;
  image: string;
}

export interface Benefit {
  iconName: "Sun" | "Droplets" | "Leaf" | "Sparkles" | "Heart" | "Zap" | "PackageCheck";
  iconColorClass: string;
  title: string;
  description: React.ReactNode;
}

export interface Step {
  number: number;
  text: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface LandingTemplateProps {
  productSlug: string;
  productTitle: string;
  pageSubTitle: string;
  categoryTag: string; // e.g. "Soin Skincare K-Beauty"
  primaryColorHex: string; // e.g. "#ea580c"
  colorTheme: "orange" | "pink" | "teal" | "blue"; // For predefined tailwind classes

  heroImages: string[];
  bundles: BundleOption[];

  benefits: Benefit[];
  howItWorksSteps?: Step[];
  testimonials: TestimonialImage[];
  faqs: FAQ[];

  whatsappMessage: string;
}

const ICON_MAP = {
  Sun, Droplets, Leaf, Sparkles, Heart, Zap, PackageCheck
};

export default function UniversalLandingTemplate({
  productSlug,
  productTitle,
  pageSubTitle,
  categoryTag,
  primaryColorHex,
  colorTheme,
  heroImages,
  bundles,
  benefits,
  howItWorksSteps,
  testimonials,
  faqs,
  whatsappMessage
}: LandingTemplateProps) {
  const router = useRouter();
  const utm = useUTM();

  usePagePresence(productSlug);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // Default to popular bundle if it exists, else the second one, else the first
  const defaultBundle = bundles.find(b => b.popular) || bundles[1] || bundles[0];
  const [selectedBundle, setSelectedBundle] = useState<BundleOption | undefined>(defaultBundle);
  const [reservationDate, setReservationDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleNextImage = () => setCurrentHeroImage((p) => (p + 1) % heroImages.length);
  const handlePrevImage = () => setCurrentHeroImage((p) => (p - 1 + heroImages.length) % heroImages.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    trackViewContent({
      content_name: productTitle,
      content_ids: [productSlug],
      value: bundles[0]?.price || 0,
      currency: "XOF"
    });
  }, [productTitle, productSlug, bundles]);

  const scrollToOrder = () => {
    const el = document.getElementById("commander");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      trackInitiateCheckout({ content_name: productTitle, content_ids: [productSlug] });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bundleToSave = selectedBundle || bundles[0];

      const finalOrder = {
        product_slug: productSlug,
        product_title: productTitle,
        bundle_name: bundleToSave.name,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_phone2: "",
        city: city,
        address: address,
        total_amount: bundleToSave.price,
        status: "Nouveau" as const,
        extraData: {
          isReservation: reservationDate.trim().length > 0,
          reservationDate: reservationDate.trim() || null,
          fromOrderForm: true,
          quantity: bundleToSave.quantity || 1,
          utm: utm,
        }
      };

      const result = await saveNewOrder(finalOrder);

      if (result && result.success) {
        trackPurchase({
          content_name: productTitle,
          content_ids: [productSlug],
          value: bundleToSave.price,
          currency: "XOF",
          num_items: bundleToSave.quantity || 1
        });
        await markLeadConverted(customerPhone, productSlug);
        const orderIdParams = result.order?.id ? `&orderId=${result.order.id}` : '';
        router.push(`/p/${productSlug}/success?name=${encodeURIComponent(customerName)}${orderIdParams}`);
      } else {
        alert("Une erreur est survenue lors de la validation. Veuillez réessayer.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue. Veuillez vérifier vos informations.");
      setIsSubmitting(false);
    }
  };

  // Pre-compute theme classes
  const themeClasses = {
    orange: {
      selectionBg: "selection:bg-orange-200",
      gradientStart: "from-orange-50",
      shadowColor: "shadow-orange-900/10",
      bgTop: "bg-orange-600",
      tagBg: "bg-orange-100/80",
      tagText: "text-orange-700",
      tagBorder: "border-orange-200",
      textPrimary: "text-orange-600",
      badgeIcon: "text-orange-600",
      badgeBg: "bg-orange-50",
      badgeBorder: "border-orange-100/50",
      formWrapperBg: "bg-orange-50/50",
      formWrapperBorder: "border-orange-100/50",
      stepBg: "bg-orange-100",
    },
    pink: {
      selectionBg: "selection:bg-pink-200",
      gradientStart: "from-pink-50",
      shadowColor: "shadow-pink-900/10",
      bgTop: "bg-pink-600",
      tagBg: "bg-pink-100/80",
      tagText: "text-pink-700",
      tagBorder: "border-pink-200",
      textPrimary: "text-pink-600",
      badgeIcon: "text-pink-600",
      badgeBg: "bg-pink-50",
      badgeBorder: "border-pink-100/50",
      formWrapperBg: "bg-pink-50/50",
      formWrapperBorder: "border-pink-100/50",
      stepBg: "bg-pink-100",
    },
    teal: {
      selectionBg: "selection:bg-teal-200",
      gradientStart: "from-teal-50",
      shadowColor: "shadow-teal-900/10",
      bgTop: "bg-teal-600",
      tagBg: "bg-teal-100/80",
      tagText: "text-teal-700",
      tagBorder: "border-teal-200",
      textPrimary: "text-teal-600",
      badgeIcon: "text-teal-600",
      badgeBg: "bg-teal-50",
      badgeBorder: "border-teal-100/50",
      formWrapperBg: "bg-teal-50/50",
      formWrapperBorder: "border-teal-100/50",
      stepBg: "bg-teal-100",
    },
    blue: {
      selectionBg: "selection:bg-blue-200",
      gradientStart: "from-blue-50",
      shadowColor: "shadow-blue-900/10",
      bgTop: "bg-blue-600",
      tagBg: "bg-blue-100/80",
      tagText: "text-blue-700",
      tagBorder: "border-blue-200",
      textPrimary: "text-blue-600",
      badgeIcon: "text-blue-600",
      badgeBg: "bg-blue-50",
      badgeBorder: "border-blue-100/50",
      formWrapperBg: "bg-blue-50/50",
      formWrapperBorder: "border-blue-100/50",
      stepBg: "bg-blue-100",
    }
  };

  const tc = themeClasses[colorTheme] || themeClasses.orange;

  return (
    <div className={`min-h-screen bg-[#F8FAFC] pb-24 font-sans ${tc.selectionBg}`}>
      <main className="max-w-2xl mx-auto bg-white min-h-screen sm:shadow-2xl sm:border-x border-slate-100 overflow-hidden relative">

        {/* TOP BANNER */}
        <div className={`${tc.bgTop} text-white text-[11px] font-bold tracking-wide text-center py-2 px-4 shadow-sm relative z-10 flex items-center justify-center gap-2`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          STOCK LIMITÉ : LIVRAISON GRATUITE SUR COTONOU/CALAVI
        </div>

        {/* HERO SECTION */}
        <section className={`relative bg-gradient-to-b ${tc.gradientStart} to-white pb-6 pt-4`}>
          <div className="px-5 mb-4 text-center space-y-2">
            <div className={`inline-flex items-center justify-center gap-1.5 ${tc.tagBg} ${tc.tagText} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${tc.tagBorder}`}>
              <Award className="w-3.5 h-3.5" />
              {categoryTag}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-[1.15] tracking-tight">
              {productTitle.split(" ").slice(0, 2).join(" ")} <span className={tc.textPrimary}>{productTitle.split(" ").slice(2).join(" ")}</span>
            </h1>
            <p className="text-sm font-medium text-slate-600 leading-snug max-w-md mx-auto">
              {pageSubTitle}
            </p>
          </div>

          <div className="relative w-full aspect-square max-w-md mx-auto px-4">
            <div className={`relative w-full h-full rounded-3xl overflow-hidden shadow-2xl ${tc.shadowColor} border border-slate-100 bg-white`}>
              {heroImages.map((src, idx) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    idx === currentHeroImage ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${productTitle} vue ${idx + 1}`}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              ))}

              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-20 flex justify-between items-end">
                <div className="flex gap-1.5">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentHeroImage(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentHeroImage ? "w-6 bg-white" : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                <div className={`${tc.bgTop}/90 backdrop-blur text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg`}>
                  OFFRE SPÉCIALE
                </div>
              </div>

              {heroImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-800 rounded-full shadow-md z-20 active:scale-90 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm text-slate-800 rounded-full shadow-md z-20 active:scale-90 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-2 mt-6 max-w-sm mx-auto px-4">
            <div className={`flex flex-col items-center justify-center p-2.5 ${tc.badgeBg} rounded-2xl border ${tc.badgeBorder}`}>
              <Truck className={`w-5 h-5 ${tc.badgeIcon} mb-1`} />
              <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide">Paiement à la<br/>Livraison</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-2.5 ${tc.badgeBg} rounded-2xl border ${tc.badgeBorder}`}>
              <ShieldCheck className={`w-5 h-5 ${tc.badgeIcon} mb-1`} />
              <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide">Testé &<br/>Approuvé</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-2.5 ${tc.badgeBg} rounded-2xl border ${tc.badgeBorder}`}>
              <CheckCircle2 className={`w-5 h-5 ${tc.badgeIcon} mb-1`} />
              <span className="text-[9px] font-bold text-slate-700 text-center uppercase tracking-wide">Résultats<br/>Prouvés</span>
            </div>
          </div>
        </section>

        {/* ORDER FORM SECTION */}
        <div id="commander" className={`py-8 px-4 scroll-mt-4 ${tc.formWrapperBg} border-y ${tc.formWrapperBorder} mb-6`}>
          <div className="text-center mb-6">
             <h2 className="text-2xl font-black text-slate-900">Finaliser ma commande</h2>
             <p className="text-sm text-slate-500 mt-1">Paiement à la livraison, 100% sécurisé.</p>
          </div>
          <UmeiStyleOrderSection
            productSlug={productSlug}
            productTitle={productTitle}
            productImage={heroImages[0]}
            bundles={bundles}
            selectedBundle={selectedBundle}
            onSelectBundle={setSelectedBundle}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            address={address}
            setAddress={setAddress}
            city={city}
            setCity={setCity}
            reservationDate={reservationDate}
            setReservationDate={setReservationDate}
            isSubmitting={isSubmitting}
            onSubmit={handleOrderSubmit}
            accentColor={primaryColorHex}
          />
        </div>

        {/* HOW IT WORKS SECTION */}
        {howItWorksSteps && howItWorksSteps.length > 0 && (
          <section className="px-5 py-10 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Comment ça marche ?
              </h2>
            </div>

            <div className="max-w-sm mx-auto space-y-4">
              {howItWorksSteps.map((step) => (
                <div key={step.number} className="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
                  <div className={`w-10 h-10 rounded-full ${tc.stepBg} ${tc.textPrimary} font-bold flex items-center justify-center shrink-0`}>
                    {step.number}
                  </div>
                  <p className="text-sm text-slate-700 font-medium">{step.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BENEFITS SECTION */}
        {benefits && benefits.length > 0 && (
          <section className="px-5 py-10 bg-white border-t border-slate-100">
            <div className="text-center mb-8">
              <span className={`text-[11px] font-bold ${tc.textPrimary} uppercase tracking-wider ${tc.badgeBg} px-3 py-1 rounded-full`}>Pourquoi choisir ce produit</span>
              <h2 className="text-xl sm:text-2xl font-bold mt-3 text-slate-900 leading-tight">
                Vos avantages
              </h2>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, idx) => {
                const IconComponent = ICON_MAP[benefit.iconName] || CheckCircle2;
                return (
                  <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-4 items-start shadow-sm">
                    <div className="bg-white shadow-sm p-2.5 rounded-xl border border-slate-100 flex-shrink-0">
                      <IconComponent className={`w-6 h-6 ${benefit.iconColorClass}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px] mb-1">{benefit.title}</h3>
                      <p className="text-slate-600 text-[13px] leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TESTIMONIALS SECTION */}
        {testimonials && testimonials.length > 0 && (
          <section className="bg-slate-50 px-5 py-10 border-y border-slate-100">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
                <span className="text-slate-800 font-bold text-sm ml-1.5">4.9/5</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Ils l'ont adopté
              </h2>
            </div>

            <div className="space-y-8 max-w-sm mx-auto">
              {testimonials.map((rev, idx) => (
                <div key={idx} className="relative w-full shadow-lg rounded-2xl overflow-hidden border border-slate-100 bg-white">
                  <Image
                    src={rev.image}
                    alt={`Avis vérifié ${rev.name}`}
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover block"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ SECTION */}
        {faqs && faqs.length > 0 && (
          <section className="px-5 py-10 bg-white">
            <div className="text-center mb-8">
              <h3 className="font-bold text-slate-900 text-xl">Questions Fréquentes</h3>
              <p className="text-xs text-slate-500 mt-1">Tout ce que vous devez savoir</p>
            </div>

            <div className="divide-y divide-slate-100 max-w-md mx-auto">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className="py-3">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                    >
                      <span className={`font-semibold text-sm text-slate-800 group-hover:${tc.textPrimary} transition-colors`}>
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? `rotate-180 ${tc.textPrimary}` : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pt-2.5 pr-6 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="text-center text-xs text-slate-400 space-y-2 py-8 bg-slate-50 border-t border-slate-200">
          <p>© {new Date().getFullYear()} ISIVENTE Bénin - Tous droits réservés.</p>
          <p className="text-[11px] px-4">Boutique officielle de distribution en ligne. Service client disponible 7j/7.</p>
        </footer>

      </main>

      <StickyMobileCtaBar
        price={selectedBundle ? selectedBundle.price : bundles[0].price}
        targetSectionId="commander"
        accentColor={primaryColorHex}
        buttonText={`Commander (${selectedBundle ? selectedBundle.price : bundles[0].price} F)`}
        whatsappMessage={whatsappMessage}
      />

    </div>
  );
}
