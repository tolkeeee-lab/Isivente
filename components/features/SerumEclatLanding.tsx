"use client";

import { saveNewOrder } from "@/lib/ordersStorage";
import { markLeadConverted } from "@/lib/leadsStorage";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Star, ShieldCheck, Truck, Clock, Sparkles, Droplets, Leaf } from "lucide-react";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";

const BUNDLES: BundleOption[] = [
  { id: "1x", name: "1x Sérum Éclat (Cure Initiale)", price: 9900, originalPrice: 15000 },
  { id: "2x", name: "2x Sérum Éclat (Cure Complète)", price: 18000, originalPrice: 30000, popular: true },
  { id: "3x", name: "3x Sérum Éclat (Pack Anti-Taches Pro)", price: 25000, originalPrice: 45000 }
];

export default function SerumEclatLanding() {
  const [currentSlide, setCurrentSlide] = useState(0);


  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [selectedBundle, setSelectedBundle] = useState<BundleOption | undefined>(undefined);
  const [orderType, setOrderType] = useState<"immediate" | "reservation">("immediate");
  const [reservationDate, setReservationDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bundleToSave = selectedBundle || BUNDLES[0];

      const finalOrder = {
        product_slug: "serum-eclat",
        product_title: "Sérum Éclat au Curcuma & Acide Kojique",
        bundle_name: bundleToSave.name,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_phone2: "",
        city: city,
        address: address,
        total_amount: bundleToSave.price,
        status: "Nouveau",
        extraData: {
          isReservation: orderType === "reservation",
          reservationDate: orderType === "reservation" ? reservationDate : null,
          fromOrderForm: true
        }
      };

      const result = await saveNewOrder(finalOrder);

      if (result && result.success) {
        await markLeadConverted(customerPhone, "serum-eclat");
        const orderIdParams = result.order?.id ? `&orderId=${result.order.id}` : '';
        router.push(`/success?slug=serum-eclat&name=${encodeURIComponent(customerName)}${orderIdParams}`);
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



  const images = [
    "/images/serum-eclat/serum-main.png",
    "/images/serum-eclat/serum-luxe-dore.png",
    "/images/serum-eclat/serum-eclat-naturel.png",
    "/images/serum-eclat/serum-kbeauty.png",
    "/images/serum-eclat/serum-rituel.png",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-xl text-orange-600 flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            ISIVENTE
          </div>
          <div className="text-sm font-medium text-green-600 flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            Qualité Premium
          </div>
        </div>
      </header>

      <main className="pb-24">
        {/* HERO SECTION */}
        <section className="bg-white pb-6 pt-4 rounded-b-3xl shadow-sm">
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-4 text-center">
              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-2">
                Nouveau | Secret de K-Beauty
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                Sérum Éclat au Curcuma & Acide Kojique
              </h1>
              <p className="text-gray-600 text-sm font-medium mb-3">
                Révélez votre éclat naturel. Atténuez les taches, illuminez votre teint et retrouvez une peau parfaite en quelques semaines.
              </p>

              <div className="flex items-center justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
                <span className="text-sm text-gray-600 font-medium ml-1">4.9/5 (182 avis)</span>
              </div>
            </div>

            {/* CAROUSEL */}
            <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg border border-orange-100 bg-orange-50/50">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    currentSlide === idx ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Sérum Éclat vue ${idx + 1}`}
                    fill
                    className="object-contain p-2"
                    priority={idx === 0}
                  />
                </div>
              ))}

              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === idx ? "bg-orange-500 w-5" : "bg-gray-300"
                    }`}
                    aria-label={`Aller à l'image ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                -45% AUJOURD'HUI
              </div>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-2 mt-6 max-w-md mx-auto">
              <div className="flex flex-col items-center text-center bg-orange-50 p-2 rounded-xl border border-orange-100">
                <Truck className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-700 leading-tight">Livraison Rapide</span>
              </div>
              <div className="flex flex-col items-center text-center bg-orange-50 p-2 rounded-xl border border-orange-100">
                <ShieldCheck className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-700 leading-tight">Garantie Qualité</span>
              </div>
              <div className="flex flex-col items-center text-center bg-orange-50 p-2 rounded-xl border border-orange-100">
                <Clock className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-700 leading-tight">Paiement à Réception</span>
              </div>
            </div>
          </div>
        </section>

        {/* POURQUOI CHOISIR CE SÉRUM */}
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Pourquoi votre peau va l'adorer
          </h2>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
              <div className="bg-orange-100 p-3 rounded-full flex-shrink-0">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Teint Lumineux & Unifié</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  L'association puissante du Curcuma et de l'Acide Kojique cible et estompe les taches brunes, l'hyperpigmentation et les cicatrices d'acné.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
              <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
                <Droplets className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Hydratation & Anti-Âge</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Pénètre en profondeur pour repulper la peau, lisser les ridules et restaurer une barrière cutanée saine pour un "Glow" immédiat.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
              <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Inspiré de la K-Beauty</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Formulation douce aux extraits naturels purs. Convient à tous les types de peau, même les plus sensibles, sans irritation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ORDER FORM SECTION */}
        <div id="commander">
          <UmeiStyleOrderSection
    productSlug="serum-eclat"
    productTitle="Sérum Éclat au Curcuma & Acide Kojique"
    productImage="/images/serum-eclat/1.png"
    bundles={BUNDLES}
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
    onSubmit={handleSubmit}
  />
        </div>


        {/* TESTIMONIALS */}
        <section className="px-4 py-8 max-w-4xl mx-auto bg-white mt-6 rounded-t-3xl shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Elles l'ont adopté
          </h2>

          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x gap-4 hide-scrollbar">
            <div className="min-w-[280px] w-[85%] snap-center flex-shrink-0">
               <Image src="/images/serum-eclat/avis-1.png" width={400} height={400} alt="Avis 1" className="rounded-xl w-full h-auto object-cover border border-slate-100 shadow-sm" />
            </div>
            <div className="min-w-[280px] w-[85%] snap-center flex-shrink-0">
               <Image src="/images/serum-eclat/avis-2.png" width={400} height={400} alt="Avis 2" className="rounded-xl w-full h-auto object-cover border border-slate-100 shadow-sm" />
            </div>
            <div className="min-w-[280px] w-[85%] snap-center flex-shrink-0">
               <Image src="/images/serum-eclat/avis-3.png" width={400} height={400} alt="Avis 3" className="rounded-xl w-full h-auto object-cover border border-slate-100 shadow-sm" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-8 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            Questions Fréquentes
          </h2>
          <div className="space-y-4">
            <details className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Comment l'utiliser ?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Appliquez 3 à 5 gouttes sur le visage et le cou préalablement nettoyés, matin et soir. Massez doucement jusqu'à absorption complète avant d'appliquer votre crème hydratante.
              </p>
            </details>
            <details className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Est-ce adapté aux peaux sensibles ?
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Oui, sa formule inspirée de la K-Beauty est enrichie en extraits apaisants. Cependant, comme il contient de l'acide kojique, nous recommandons toujours un test cutané préalable et l'utilisation d'une protection solaire en journée.
              </p>
            </details>
          </div>
        </section>
      </main>

      {/* FLOATING CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40 pb-safe">
        <a
          href="#commander"
          className="flex items-center justify-center w-full bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          Commander mon Sérum (9 900 FCFA)
        </a>
      </div>
    </div>
  );
}
