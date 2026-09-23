"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Truck, 
  ChevronDown, 
  BatteryCharging, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Moon,
  SunMedium,
  Palette,
  Eye
} from "lucide-react";
import { saveNewOrder } from "@/lib/ordersStorage";
import { usePagePresence } from "@/hooks/usePagePresence";
import { markLeadConverted } from "@/lib/leadsStorage";
import { useUTM } from "@/lib/utm";
import UmeiStyleOrderSection, { BundleOption } from "@/components/features/UmeiStyleOrderSection";
import StickyMobileCtaBar from "@/components/features/StickyMobileCtaBar";

const BUNDLES: BundleOption[] = [
  {
    id: "solo",
    name: "Veilleuse Projecteur LED 3D Tactile FRIOSZ FP-032",
    subtitle: "Dôme cristal optique haute réfraction, 16 couleurs télécommandables, capteur tactile, câble de recharge USB et socle bois noble",
    price: 14900,
    originalPrice: 22000,
    savings: 7100,
    quantity: 1,
    popular: true,
  },
];

const REVIEWS_DATA = [
  {
    author: "Prisca G.",
    city: "Cotonou (Cadjehoun)",
    rating: 5,
    title: "Mes enfants s'endorment paisiblement chaque soir",
    comment: "La projection au plafond et sur les murs est tout simplement magique. La lumière est douce, sans éblouir les yeux des petits. Magnifique cadeau.",
  },
  {
    author: "Gérard T.",
    city: "Calavi",
    rating: 5,
    title: "Très belle ambiance pour le salon et la chambre",
    comment: "Les reflets de cristal sont bluffants. La télécommande permet de changer l'ambiance et l'intensité selon le moment. Très belle finition.",
  },
  {
    author: "Nadège H.",
    city: "Porto-Novo",
    rating: 5,
    title: "Batterie rechargeable très pratique",
    comment: "Pas besoin de laisser branché, on peut la poser n'importe où sur une table de chevet ou sur la terrasse le soir. Livraison rapide et conforme.",
  },
];

const FAQS_DATA = [
  {
    q: "Comment changer les couleurs d'éclairage ?",
    a: "Vous pouvez soit toucher le capteur tactile métallique sur le dessus pour faire défiler les teintes, soit utiliser la télécommande fournie pour choisir instantanément parmi 16 couleurs et régler la luminosité."
  },
  {
    q: "La lumière est-elle adaptée pour le sommeil d'un enfant ?",
    a: "Oui, la projection est relaxante et étudiée pour apaiser le système visuel. Vous pouvez baisser l'intensité lumineuse pour obtenir une veilleuse tamisée et réconfortante."
  },
  {
    q: "Combien de temps dure la batterie ?",
    a: "La batterie intégrée haute efficacité permet entre 8 et 12 heures d'éclairage selon l'intensité. Elle se recharge simplement avec le câble USB fourni."
  },
  {
    q: "Comment se déroule la livraison au Bénin ?",
    a: "Livraison en 24h à domicile à Cotonou, Calavi, Porto-Novo et environs. Vous payez en espèces ou Mobile Money uniquement après avoir déballé et testé la veilleuse."
  }
];

export default function VeilleuseLanding({ slug = "veilleuse" }: { slug?: string }) {
  const router = useRouter();
  const utm = useUTM();
  const { recordInteraction } = usePagePresence(slug);

  const [selectedBundle, setSelectedBundle] = useState<BundleOption>(BUNDLES[0]);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPhone2, setCustomerPhone2] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const orderSectionRef = useRef<HTMLDivElement>(null);

  const scrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");

    if (!customerName.trim()) {
      setOrderError("Veuillez renseigner votre nom complet.");
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 8) {
      setOrderError("Veuillez renseigner un numéro de téléphone valide (au moins 8 chiffres).");
      return;
    }

    setIsSubmitting(true);
    recordInteraction();

    try {
      const order = await saveNewOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: address.trim() || `${city} - Livraison à domicile`,
        shipping_city: city,
        product_slug: "veilleuse",
        product_title: "Veilleuse Projecteur LED 3D Tactile FRIOSZ",
        bundle_id: selectedBundle.id || "solo",
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity || 1,
        total_amount: selectedBundle.price,
        status: "pending",
        ...utm,
      });

      await markLeadConverted(customerPhone, "veilleuse");

      const successUrl = `/p/veilleuse/success?order=${encodeURIComponent(order.order_number || "")}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}&total=${selectedBundle.price}`;
      router.push(successUrl);
    } catch (err: any) {
      console.error("Order error:", err);
      setOrderError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre commande.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-28">
      {/* ── HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="font-bold tracking-tight text-slate-950 text-sm sm:text-base">ISIVENTE</span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• Boutique Officielle</span>
          </div>

          <button
            onClick={scrollToOrder}
            className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-1.5 rounded-full shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <span>Commander (14 900 F)</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* ── TITRE HERO & PRIX D'ACCROCHE ── */}
        <section className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200/80 text-violet-800 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 stroke-[1.75]" />
            <span>Projection Féerique Cristal & Ambiance Relaxante</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl font-black tracking-[-0.02em] text-slate-950 leading-tight">
            Veilleuse Projecteur LED 3D Tactile FRIOSZ FP-032
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            16 couleurs d&apos;ambiance, dôme en cristal à réfraction lumineuse et télécommande sans fil pour transformer vos nuits et vos soirées en un spectacle féerique.
          </p>
        </section>

        {/* ── 3 BADGES DE RÉASSURANCE PRIORITAIRES ── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <Truck className="w-5 h-5 text-emerald-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Livraison 24h</div>
            <div className="text-[10px] text-slate-500 font-mono">Bénin à domicile</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Test à Réception</div>
            <div className="text-[10px] text-slate-500 font-mono">Paiement après vérification</div>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] text-center space-y-1">
            <BatteryCharging className="w-5 h-5 text-violet-600 mx-auto stroke-[1.75]" />
            <div className="text-xs font-bold text-slate-900">Sans Fil USB</div>
            <div className="text-[10px] text-slate-500 font-mono">Rechargeable nomade</div>
          </div>
        </div>

        {/* ── FORMULAIRE DE COMMANDE COD PLACÉ PRIORITAIREMENT ── */}
        <div ref={orderSectionRef} id="commander">
          {orderError && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[1.75]" />
              <span>{orderError}</span>
            </div>
          )}

          <UmeiStyleOrderSection
            productSlug="veilleuse"
            productTitle="Veilleuse Projecteur LED 3D Tactile FRIOSZ"
            productImage="/images/microscope-real-infographic.webp"
            bundles={BUNDLES}
            selectedBundle={selectedBundle}
            onSelectBundle={(b) => setSelectedBundle(b)}
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
            accentColor="#7c3aed"
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* ── SECTION DÉTAIL DES BÉNÉFICES ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full">
              <Moon className="w-3.5 h-3.5 text-violet-600 stroke-[1.75]" />
              <span>Lumière Féerique & Apaisement</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-slate-900 leading-tight">
              3 Raisons d&apos;Adopter la Veilleuse FRIOSZ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">16 Nuances Télécommandables</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Variez les couleurs et les intensités lumineuses en 1 clic pour chaque humeur de la soirée.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <SunMedium className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Toucher Tactile Intuitif</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Posez simplement votre doigt sur le capteur supérieur pour allumer, éteindre et changer de couleur.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sommeil Doux & Sécurisant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aide les enfants qui ont peur du noir à s&apos;endormir en toute sérénité sans jamais chauffer.
              </p>
            </div>
          </div>
        </section>

        {/* ── AVIS CLIENTS VÉRIFIÉS ── */}
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Avis Clients Vérifiés (Bénin)</div>
              <div className="text-[11px] text-slate-500 font-mono">4.9 / 5 sur 134 commandes livrées</div>
            </div>
            <div className="flex text-amber-400 text-sm">★★★★★</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {REVIEWS_DATA.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{rev.author}</span>
                    <span className="text-[10px] text-slate-400">{rev.city}</span>
                  </div>
                  <div className="text-amber-400 text-xs">{"★".repeat(rev.rating)}</div>
                  <p className="text-xs font-semibold text-slate-900">« {rev.title} »</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium pt-2 border-t border-slate-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Commande vérifiée Isivente</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOIRE AUX QUESTIONS ── */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3">
          <div className="text-xs font-bold text-slate-900">Questions fréquentes</div>
          <div className="divide-y divide-slate-100">
            {FAQS_DATA.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-violet-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180 text-violet-600" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed pt-1">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── BARRE MOBILE FLOTTANTE POUR COMMANDER ── */}
      <StickyMobileCtaBar
        price={14900}
        accentColor="#7c3aed"
        buttonText="Commander"
        targetSectionId="commander"
        whatsappNumber="2290192901817"
        whatsappMessage="Bonjour Isivente, je souhaite commander la Veilleuse Projecteur LED 3D Tactile FRIOSZ à 14 900 FCFA avec livraison à domicile."
      />
    </div>
  );
}
