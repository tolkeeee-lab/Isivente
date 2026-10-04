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

interface CustomerReview {
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  initial: string;
}

const REVIEWS_DATA: CustomerReview[] = [
  {
    name: "Marius A.",
    location: "Enseignant • Cotonou (Haie Vive)",
    rating: 5,
    date: "Achat vérifié Isivente",
    title: "Le meilleur investissement contre mes allergies",
    comment: "Je souffrais d'allergies à la poussière tous les matins. Le nez complètement bouché, des éternuements à n'en plus finir. Depuis que j'utilise cet appareil 15 minutes le matin, je respire normalement toute la journée. Un vrai soulagement !",
    initial: "M"
  },
  {
    name: "Clarisse D.",
    location: "Commerçante • Calavi",
    rating: 5,
    date: "Achat vérifié Isivente",
    title: "Incroyable pour le sommeil",
    comment: "J'avais beaucoup de mal à m'endormir à cause de ma rhinite chronique. Le spray nasal ne faisait plus grand effet. Cette thérapie laser a totalement changé mes nuits. Je dors beaucoup mieux car mon nez est enfin dégagé.",
    initial: "C"
  },
  {
    name: "Dr. Boris K.",
    location: "Pharmacien • Porto-Novo",
    rating: 5,
    date: "Achat vérifié Isivente",
    title: "Une méthode naturelle efficace",
    comment: "En tant que professionnel de santé, j'étais sceptique. Mais la thérapie par lumière rouge à basse fréquence (650nm) est cliniquement prouvée pour réduire l'inflammation de la muqueuse nasale. Je l'ai testé et je le recommande vivement à mes clients.",
    initial: "B"
  },
];

const FAQS_DATA = [
  {
    q: "Est-ce que ça fait mal de mettre la lumière dans le nez ?",
    a: "Absolument pas. La lumière rouge à basse fréquence (650nm) est douce, froide et indolore. Vous ressentirez tout au plus un très léger chatouillement dû à la présence des sondes dans les narines, mais aucune sensation de brûlure ou de douleur."
  },
  {
    q: "Combien de temps faut-il l'utiliser par jour ?",
    a: "Une séance dure 15 minutes. Pour des résultats optimaux, il est recommandé de faire 2 à 3 séances par jour au début, puis de réduire à 1 séance par jour ou selon les besoins une fois les symptômes apaisés."
  },
  {
    q: "Est-ce adapté aux enfants ?",
    a: "Oui, la thérapie est sûre et naturelle. Cependant, il est recommandé pour les enfants de plus de 6 ans, sous la supervision d'un adulte."
  },
  {
    q: "Dois-je arrêter mes autres traitements (sprays, comprimés) ?",
    a: "Le laser est une solution complémentaire naturelle. Beaucoup de nos clients réduisent ou arrêtent progressivement l'usage des sprays une fois que le laser fait effet, mais vous devez consulter votre médecin avant de modifier toute prescription médicale."
  }
];

export default function RhiniteLanding() {
  const router = useRouter();
  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
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
        router.push(`/p/laser-rhinite/success?phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}&total=${selectedBundle.price}${orderIdParams}${orderNumberParams}`);
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
        <div className="max-w-md mx-auto px-3.5 pt-4 pb-20 space-y-5">
          {/* EN-TÊTE PRODUIT : TITRE & DESCRIPTION */}
          <div className="text-center space-y-2.5 px-2">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-xs">
              <Activity className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Solution Santé Naturelle</span>
            </div>

            <h1 className="text-[28px] sm:text-[34px] font-bold text-slate-900 leading-[1.15] tracking-[-0.03em]">
              Respirez Librement avec la <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">Thérapie Laser</span> Anti-Rhinite
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Dites adieu au nez bouché, aux éternuements constants et aux allergies. Une méthode 100% naturelle et cliniquement prouvée pour dégager vos voies respiratoires en quelques minutes par jour, sans médicaments.
            </p>
          </div>

          {/* GALERIE PHOTOS CARROUSEL */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 sm:p-5 space-y-3">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 flex items-center justify-center">
              <img
                src={CAROUSEL_IMAGES[currentSlide].src}
                alt={CAROUSEL_IMAGES[currentSlide].alt}
                className="w-full h-full object-contain rounded-xl mix-blend-multiply"
              />

              <div className="absolute top-3 left-3">
                <span className="bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm inline-flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  Promo -43%
                </span>
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:text-teal-600 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:text-teal-600 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {CAROUSEL_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    currentSlide === idx ? 'border-teal-600 shadow-sm' : 'border-transparent hover:border-teal-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>
          </div>

          {/* BADGES DE RÉASSURANCE */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
              <Truck className="w-5 h-5 text-teal-600 mx-auto stroke-[1.75]" />
              <div className="text-xs font-bold text-slate-900">Livraison 24h/48h</div>
              <div className="text-[10px] text-slate-500 font-mono">Partout au Bénin</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
              <div className="text-xs font-bold text-slate-900">Garantie 1 An</div>
              <div className="text-[10px] text-slate-500 font-mono">Paiement à la livraison</div>
            </div>
          </div>

          {/* FORMULAIRE DE COMMANDE */}
          <div ref={orderSectionRef} id="commander">
            {orderError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
                <span>{orderError}</span>
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

        </div>

        {/* REVIEWS SECTION */}
        <section className="bg-[#F8FAFC] py-12 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-3">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em] mb-2">
                Ce que nos clients en disent après utilisation :
              </h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto">
                Témoignages authentiques d'acheteurs vérifiés à Cotonou et Calavi ayant testé et approuvé la thérapie laser.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REVIEWS_DATA.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl shrink-0">
                        {rev.initial}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{rev.name}</div>
                        <div className="text-[11px] text-slate-500">{rev.location}</div>
                      </div>
                    </div>

                    <div className="flex text-amber-400 text-sm">
                      {"★".repeat(rev.rating)}
                    </div>

                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      « {rev.title} »
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-4 mt-4 border-t border-slate-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Achat vérifié Isivente</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── FOIRE AUX QUESTIONS ── */}
            <div className="mt-12 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-slate-900 text-center mb-6">Questions Fréquentes</h3>
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {FAQS_DATA.map((faq, idx) => (
                    <div key={idx} className="p-5">
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-left text-sm sm:text-base font-semibold text-slate-800 hover:text-teal-700 transition-colors duration-100 cursor-pointer"
                      >
                        <span className="pr-4">{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-150 ${activeFaq === idx ? "rotate-180 text-teal-600" : ""}`} />
                      </button>
                      {activeFaq === idx && (
                        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
