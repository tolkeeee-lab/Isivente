"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, ShieldCheck, Truck, Star, Plus, Minus, ArrowRight, StarHalf, ChevronDown, Hand } from "lucide-react";

interface ProductBundle {
  id: string;
  name: string;
  quantity: number;
  price: number;
  original_price: number;
  badge: string | null;
  description: string;
}

interface ProductFeature {
  title: string;
  desc: string;
}

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  comment: string;
  handle: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function ProductLanding({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedBundle, setSelectedBundle] = useState<ProductBundle | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+229");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) {
        setFetchError(error.message);
      }
      if (data) {
        setProduct(data);
        if (data.bundles && data.bundles.length > 0) {
          const defaultBundle = data.bundles.find((b: any) => b.id === 'duo') || data.bundles[0];
          setSelectedBundle(defaultBundle);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !selectedBundle) return;
    setIsSubmitting(true);

    try {
      const orderData = {
        product_slug: product.slug,
        product_title: product.title,
        bundle_id: selectedBundle.id,
        quantity: selectedBundle.quantity,
        total_amount: selectedBundle.price,
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_city: city,
        shipping_address: address,
        status: 'pending'
      };

      const { error } = await supabase.from("orders").insert([orderData]);
      if (error) throw error;
      window.location.href = `/p/${slug}/success`;
    } catch (err) {
      alert("Une erreur est survenue lors de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-10 h-10 border-4 border-border-light border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-8 text-center">
      <h1 className="text-3xl font-display font-bold text-text-main mb-4">Produit introuvable</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg selection:bg-accent/20 overflow-hidden">
      {/* URGENCY BAR */}
      <div className="bg-brand text-white text-center py-2.5 px-4 text-sm font-medium tracking-wide relative z-50">
        🔥 Offre de lancement : <span className="font-bold text-accent">Livraison incluse aujourd'hui</span>
      </div>

      {/* HEADER */}
      <header className="border-b border-border-light bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display font-extrabold text-2xl tracking-tighter text-brand">uméi</div>
          <a href="#commander" className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-sm">
            Commander
          </a>
        </div>
      </header>

      {/* STICKY SCROLL SECTION (HERO + FEATURES) */}
      <section className="relative bg-bg-subtle pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-visible">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: HERO TEXT + FEATURES */}
            <div className="lg:col-span-7 flex flex-col order-2 lg:order-1 relative z-20">
              
              <div className="text-center lg:text-left mb-16">
                <div className="inline-flex items-center gap-2 mb-6 mx-auto lg:mx-0 bg-white px-4 py-2 rounded-full shadow-sm border border-border-light">
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <StarHalf className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-semibold text-brand">4.9/5 (128 avis)</span>
                </div>

                <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-brand leading-[1.1] mb-6">
                  {product.headline || product.title}
                </h1>
                
                <p className="text-xl text-text-muted mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {product.description}
                </p>

                <div className="flex items-end justify-center lg:justify-start gap-4 mb-10">
                  <span className="text-5xl font-display font-bold text-brand">{product.price.toLocaleString('fr-FR')} FCFA</span>
                  {product.original_price && (
                    <span className="text-2xl text-text-muted line-through font-medium mb-1">{product.original_price.toLocaleString('fr-FR')} FCFA</span>
                  )}
                </div>

                <a 
                  href="#commander" 
                  className="w-full lg:w-max bg-accent hover:bg-accent-hover text-white text-center py-5 px-10 rounded-full font-bold text-xl shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)] transition-all flex items-center justify-center gap-3 hover:scale-105"
                >
                  Commander maintenant
                  <ArrowRight className="w-6 h-6" />
                </a>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8 text-sm font-semibold text-text-muted">
                  <div className="flex items-center gap-1.5"><Truck className="w-5 h-5 text-accent" /> Livraison 48h</div>
                  <div className="flex items-center gap-1.5"><ShieldCheck className="w-5 h-5 text-accent" /> Satisfait ou remboursé</div>
                </div>
              </div>

              {/* FEATURES EMBEDDED HERE SO IMAGE STAYS STICKY */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-border-light relative z-30 mb-8">
                <h3 className="font-display text-2xl font-bold text-brand mb-8">Pourquoi vous allez l'adorer :</h3>
                <div className="space-y-8">
                  {product.features?.map((feat: ProductFeature, idx: number) => (
                    <div key={idx} className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-bg-subtle flex items-center justify-center shrink-0 shadow-sm border border-border-light mt-1">
                        <Check className="w-6 h-6 text-brand" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand text-xl mb-2">{feat.title}</h4>
                        {feat.desc && <p className="text-text-muted text-base leading-relaxed">{feat.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: STICKY FLOATING IMAGE & PULSING BUTTON */}
            <div className="lg:col-span-5 order-1 lg:order-2 h-full relative">
              <div className="sticky top-32 pt-8 lg:pt-0 pb-12 flex justify-center h-auto">
                <div className="relative w-[110%] max-w-[450px] lg:w-[150%] lg:-mr-[30%] z-20">
                  <img 
                    src="/images/brosse-transparente.png" 
                    alt={product.title}
                    className="w-full h-auto drop-shadow-[0_30px_40px_rgba(42,26,74,0.15)] animate-float"
                  />
                  
                  {/* PULSATING BUY BUTTON */}
                  <a href="#commander" className="absolute top-[35%] right-[20%] lg:right-[30%] group z-50">
                    <div className="absolute top-0 left-0 w-full h-full border-[3px] border-brand rounded-full animate-pulsate pointer-events-none"></div>
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-border-light text-brand group-hover:bg-brand group-hover:text-white transition-all hover:scale-110">
                      <Hand className="w-5 h-5 lg:w-7 lg:h-7" />
                    </div>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CHECKOUT */}
      <section id="commander" className="py-20 lg:py-28 bg-white border-t border-border-light">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-brand mb-4">Passez votre commande</h2>
            <p className="text-lg text-text-muted">Remplissez le formulaire ci-dessous. Paiement à la livraison uniquement.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-brand text-xl mb-6">1. Choisissez votre offre</h3>
              {product.bundles?.map((bundle: ProductBundle) => (
                <label 
                  key={bundle.id}
                  className={`block relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-200 ${selectedBundle?.id === bundle.id ? 'border-accent bg-bg-subtle shadow-md' : 'border-border-light bg-white hover:border-gray-300'}`}
                >
                  <input type="radio" name="bundle" className="sr-only" checked={selectedBundle?.id === bundle.id} onChange={() => setSelectedBundle(bundle)} />
                  {bundle.badge && (
                    <span className="absolute -top-3 left-6 bg-brand text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-sm">{bundle.badge}</span>
                  )}
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedBundle?.id === bundle.id ? 'border-accent bg-accent' : 'border-gray-300'}`}>
                        {selectedBundle?.id === bundle.id && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                      <span className="font-bold text-brand text-xl">{bundle.name}</span>
                    </div>
                  </div>
                  <div className="pl-9">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-display font-bold text-brand">{bundle.price.toLocaleString('fr-FR')} F</span>
                      {bundle.original_price && <span className="text-base text-text-muted line-through">{bundle.original_price.toLocaleString('fr-FR')} F</span>}
                    </div>
                    {bundle.description && <p className="text-sm text-accent font-semibold">{bundle.description}</p>}
                  </div>
                </label>
              ))}
            </div>
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2rem] shadow-floating border border-border-light">
              <h3 className="font-bold text-brand text-xl mb-8">2. Vos coordonnées de livraison</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-brand mb-2">Nom complet</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-4 bg-bg-subtle border-0 rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all text-brand font-medium placeholder:text-text-muted" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand mb-2">Numéro de téléphone</label>
                  <input required type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-4 bg-bg-subtle border-0 rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all text-brand font-medium" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-brand mb-2">Ville (Bénin)</label>
                    <div className="relative">
                      <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-4 bg-bg-subtle border-0 rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all text-brand font-medium appearance-none">
                        <option value="Cotonou">Cotonou</option>
                        <option value="Abomey-Calavi">Abomey-Calavi</option>
                        <option value="Porto-Novo">Porto-Novo</option>
                        <option value="Parakou">Parakou</option>
                        <option value="Ouidah">Ouidah</option>
                        <option value="Autre">Autre</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand mb-2">Quartier / Repère</label>
                    <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-bg-subtle border-0 rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all text-brand font-medium placeholder:text-text-muted" />
                  </div>
                </div>
                <div className="pt-8 mt-8 border-t border-border-light">
                  <div className="flex justify-between items-center mb-8">
                    <span className="font-semibold text-text-muted text-lg">Total à payer :</span>
                    <span className="font-display font-extrabold text-3xl text-brand">{selectedBundle?.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent-hover text-white text-xl font-bold h-16 rounded-2xl transition-all shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 flex justify-center items-center gap-3">
                    {isSubmitting ? 'Traitement...' : 'Valider ma commande (COD)'}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-5 text-sm font-medium text-text-muted bg-bg-subtle py-3 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    <span>Paiement à la livraison.</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (MESSY CARDS) */}
      <section className="py-24 bg-bg-subtle overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 relative z-10">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-brand mb-4">Elles ont changé de rituel</h2>
            <p className="text-lg text-text-muted">Découvrez ce que nos clientes pensent de {product.title}.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-12 relative z-20">
            {product.testimonials?.map((t: Testimonial, idx: number) => {
              const rotationClasses = ['rotate-messy-1', 'rotate-messy-2', 'rotate-messy-3', 'rotate-messy-4'];
              const rotateClass = rotationClasses[idx % rotationClasses.length];
              return (
                <div key={idx} className={`w-full md:w-[calc(33.333%-2rem)] max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-border-light flex flex-col justify-between transition-all duration-300 hover:rotate-0 hover:-translate-y-2 hover:shadow-xl ${rotateClass}`}>
                  <div>
                    <div className="flex text-amber-400 mb-6">
                      {[...Array(t.rating || 5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <p className="text-brand font-medium leading-relaxed text-lg mb-8">"{t.comment}"</p>
                  </div>
                  <div className="flex items-center gap-4 pt-6 border-t border-border-light">
                    <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {t.handle.charAt(1).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-brand">{t.handle}</p>
                      <p className="text-sm text-text-muted">{t.name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white border-t border-border-light">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-brand">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {product.faq?.map((item: FAQItem, idx: number) => (
              <details key={idx} className="group bg-bg-subtle rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-brand text-lg select-none">
                  {item.question}
                  <span className="relative ml-4 shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand group-open:rotate-180 transition-transform duration-300 shadow-sm border border-border-light">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-2 text-text-muted leading-relaxed font-medium">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-display font-extrabold text-2xl tracking-tighter text-white">uméi</div>
          <div className="text-sm font-medium text-white/60">© {new Date().getFullYear()} Uméi. Tous droits réservés.</div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-border-light z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <a href="#commander" className="w-full bg-accent hover:bg-accent-hover text-white text-center h-14 rounded-xl font-bold text-lg shadow-[0_5px_15px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2">
          Commander - {product.price.toLocaleString('fr-FR')} F
        </a>
      </div>
    </div>
  );
}
