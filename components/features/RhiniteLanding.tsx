"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Wind,
  Moon,
  Leaf,
  Activity,
  MapPin,
  Play
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";
import { trackMultiViewContent as trackViewContent, trackMultiAddToCart as trackAddToCart, trackMultiInitiateCheckout as trackInitiateCheckout } from "@/lib/trackingBridge";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Appareil de Thérapie Laser Anti-Rhinite",
    subtitle: "Appareil complet avec sondes nasales et boîtier de contrôle",
    price: 15900,
    originalPrice: 35000,
    savings: 19100,
    quantity: 1,
    popular: true,
  },
];

const CAROUSEL_IMAGES = [
  {
    src: "/images/rhinite/presentation.png",
    alt: "Présentation de l'appareil laser anti-rhinite"
  },
  {
    src: "/images/rhinite/therapie.png",
    alt: "Respirez mieux avec la thérapie laser"
  },
  {
    src: "/images/rhinite/dormez-paisiblement.png",
    alt: "Dormez paisiblement avec le nez dégagé"
  },
  {
    src: "/images/rhinite/naturellement.png",
    alt: "Thérapie 100% naturelle sans médicaments"
  },
  {
    src: "/images/rhinite/partout.png",
    alt: "Format portable : respirez mieux partout"
  },
  {
    src: "/images/rhinite/quotidien.png",
    alt: "Respirez librement au quotidien"
  },
  {
    src: "/images/rhinite/plus-librement.png",
    alt: "Respirez plus librement avec le laser"
  }
];

export default function RhiniteLanding() {
  const router = useRouter();
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const orderSectionRef = useRef<HTMLDivElement>(null);

  usePagePresence("laser-rhinite");

  useEffect(() => {
    trackViewContent({
      content_name: "Appareil de Thérapie Laser Anti-Rhinite",
      content_ids: ["laser-rhinite"],
      value: BUNDLES[0].price,
      currency: "XOF",
    });
  }, []);

  const scrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    trackInitiateCheckout({
      content_name: `Initiate Checkout - ${selectedBundle.name}`,
      content_ids: ["laser-rhinite", selectedBundle.id || "solo"],
      value: selectedBundle.price,
      currency: "XOF",
      num_items: selectedBundle.quantity || 1,
    });
  };

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % CAROUSEL_IMAGES.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError("");

    try {
      if (!customerName || !customerPhone || !city) {
        throw new Error("Veuillez remplir les champs obligatoires (Nom, Téléphone, Ville).");
      }

      const isReservation = false;

      const finalOrder = {
        product_slug: "laser-rhinite",
        product_title: "Appareil de Thérapie Laser Anti-Rhinite & Allergies",
        bundle_name: selectedBundle.name,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_phone2: customerPhone2 || "",
        city: city,
        address: address || "",
        total_amount: selectedBundle.price,
        status: "Nouveau",
        extraData: {
          quantity: selectedBundle.quantity || 1,
          isReservation: isReservation,
          reservationDate: isReservation ? reservationDate : null,
          fromOrderForm: true
        }
      };

      const result = await saveNewOrder(finalOrder);

      if (result && result.success) {
        await markLeadConverted(customerPhone, "laser-rhinite");
        const orderIdParams = result.order?.id ? `&orderId=${result.order.id}` : '';
        const orderNumberParams = result.order?.order_number ? `&orderNumber=${result.order.order_number}` : '';
        router.push(`/p/laser-rhinite/success?phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&amount=${selectedBundle.price}${orderIdParams}${orderNumberParams}`);
      } else {
        throw new Error((result as { error?: string }).error || "Erreur lors de l'enregistrement de la commande.");
      }
    } catch (error: unknown) {
      console.error("Order submit error:", error);
      setOrderError((error as Error).message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-teal-500/30">
      <StickyMobileCtaBar
        price={selectedBundle.price}
        buttonText="Commander Maintenant"
        accentColor="#0D9488"
      />

      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm">
              <Wind className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">Boutique Santé</span>
          </div>
          <button
            onClick={scrollToOrder}
            className="hidden sm:flex items-center gap-2 bg-[#0D9488] text-white px-5 py-2.5 rounded-full font-medium hover:bg-teal-800 transition-colors shadow-sm shadow-teal-500/20"
          >
            Commander
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="pb-24">
        {/* HERO SECTION */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

              {/* IMAGE CAROUSEL */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
                <div className="aspect-[4/3] sm:aspect-square relative flex items-center justify-center p-4">
                  <img
                    src={CAROUSEL_IMAGES[currentSlide].src}
                    alt={CAROUSEL_IMAGES[currentSlide].alt}
                    className="w-full h-full object-contain rounded-xl mix-blend-multiply"
                  />

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5" />
                      Promo -43%
                    </span>
                  </div>

                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-[#0D9488] transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:text-[#0D9488] transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 p-4 overflow-x-auto snap-x scrollbar-hide border-t border-gray-100 bg-white">
                  {CAROUSEL_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 snap-start border-2 transition-all ${
                        currentSlide === idx ? 'border-[#0D9488] shadow-sm' : 'border-transparent hover:border-teal-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              </div>

              {/* PRODUCT INFO */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[#0D9488] text-sm font-semibold tracking-wide uppercase mb-3">
                  <Activity className="w-4 h-4" />
                  Solution Santé Naturelle
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
                  Respirez Librement avec la <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Thérapie Laser Anti-Rhinite</span>
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Dites adieu au nez bouché, aux éternuements constants et aux allergies sans médicaments. Une méthode 100% naturelle et cliniquement prouvée pour dégager vos voies respiratoires en quelques minutes par jour.
                </p>

                <div className="flex items-end gap-3 mb-8">
                  <span className="text-4xl font-black text-gray-900 tracking-tight">15 900</span>
                  <span className="text-xl font-bold text-gray-900 mb-1">FCFA</span>
                  <span className="text-lg text-gray-400 line-through mb-1.5 ml-2">35 000 FCFA</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  <div className="flex items-center gap-3 bg-teal-50 text-teal-800 px-4 py-3 rounded-xl border border-teal-100/50">
                    <Truck className="w-5 h-5 text-teal-600 shrink-0" />
                    <span className="font-medium text-sm">Livraison Gratuite 24/48h</span>
                  </div>
                  <div className="flex items-center gap-3 bg-teal-50 text-teal-800 px-4 py-3 rounded-xl border border-teal-100/50">
                    <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                    <span className="font-medium text-sm">Garantie Efficacité 1 An</span>
                  </div>
                </div>

                <button
                  onClick={scrollToOrder}
                  className="w-full bg-[#0D9488] hover:bg-teal-800 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  Je veux respirer librement
                  <ChevronDown className="w-5 h-5" />
                </button>

                <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#0D9488]" />
                    Pourquoi choisir cette thérapie ?
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-gray-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                      <strong>Soulagement immédiat :</strong> Dégage le nez bouché et réduit l'inflammation instantanément.
                    </li>
                    <li className="flex gap-3 text-gray-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                      <strong>100% Naturel :</strong> Sans médicaments, sans somnolence ni effets secondaires.
                    </li>
                    <li className="flex gap-3 text-gray-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                      <strong>Pratique et Portable :</strong> Utilisez-le au bureau, à la maison ou en voyage.
                    </li>
                    <li className="flex gap-3 text-gray-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                      <strong>Meilleur sommeil :</strong> Retrouvez des nuits paisibles en respirant correctement.
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ORDER SECTION */}
        <section ref={orderSectionRef} className="py-12 lg:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Finalisez votre commande</h2>
              <p className="text-gray-500 text-lg">Paiement à la livraison. Remplissez simplement le formulaire ci-dessous.</p>
            </div>

            {orderError && (
              <div className="mb-8 p-4 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-3 border border-rose-100">
                <XCircle className="w-5 h-5 shrink-0" />
                <p className="font-medium">{orderError}</p>
              </div>
            )}

            <UmeiStyleOrderSection
              productSlug="laser-rhinite"
              productTitle="Appareil de Thérapie Laser Anti-Rhinite & Allergies"
              productImage="/images/rhinite/presentation.png"
              bundles={BUNDLES}
              selectedBundle={selectedBundle}
              onSelectBundle={(b) => {
                setSelectedBundle(b);
                trackAddToCart({
                  content_name: `Laser Rhinite - ${b.name}`,
                  content_ids: ["laser-rhinite", b.id || "solo"],
                  value: b.price,
                  currency: "XOF",
                  num_items: b.quantity || 1,
                });
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
              reservationDate={reservationDate}
              setReservationDate={setReservationDate}
              onSubmit={handleSubmitOrder}
              isSubmitting={isSubmitting}
              accentColor="#0D9488"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
