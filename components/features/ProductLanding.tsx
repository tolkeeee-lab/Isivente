"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, ShieldCheck, Truck, Star, Plus, Minus, ArrowRight, StarHalf, ChevronDown } from "lucide-react";

// --- Types ---
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

  // Form State
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+229");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) {
        console.error('Supabase Error:', error);
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
      console.error("Order error", err);
      alert("Une erreur est survenue lors de la commande. Veuillez ressayer.");
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
      {fetchError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-mono text-sm border border-red-100 max-w-lg overflow-auto">
          <p className="font-bold mb-2">Erreur Supabase:</p>
          <p>{fetchError}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-bg selection:bg-accent/20">
      {/* URGENCY BAR */}
      <div className="bg-brand text-white text-center py-2.5 px-4 text-sm font-medium tracking-wide">
        ? Offre de lancement : <span className="font-bold text-accent">Livraison incluse aujourd'hui</span>
      </div>

      {/* HEADER */}
      <header className="border-b border-border-light bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display font-extrabold text-2xl tracking-tighter text-brand">
            umi
          </div>
          <a href="#commander" className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-sm hover:shadow-md">
            Commander
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-8 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* GALLERY */}
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/5] sm:aspect-square bg-bg-subtle rounded-3xl overflow-hidden relative">
                <img 
                  src={product.images[currentImageIdx]?.url || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {product.images.map((img: any, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentImageIdx(idx)}
                      className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden snap-start transition-all ${currentImageIdx === idx ? 'ring-2 ring-accent ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img.url} alt={`Vue ${idx+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="flex flex-col justify-center">
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <StarHalf className="w-4 h-4 fill-current" />
                </div>
                <span className="text-sm font-semibold text-text-muted">4.9/5 (128 avis)</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-brand leading-tight mb-4">
                {product.headline || product.title}
              </h1>
              
              <p className="text-lg text-text-muted mb-8 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-display font-bold text-brand">{product.price.toLocaleString('fr-FR')} FCFA</span>
                {product.original_price && (
                  <span className="text-xl text-text-muted line-through font-medium mb-1">{product.original_price.toLocaleString('fr-FR')} FCFA</span>
                )}
              </div>

              <div className="space-y-4 mb-10">
                {product.features?.slice(0,3).map((feat: ProductFeature, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                    </div>
                    <div>
                      <span className="font-semibold text-brand">{feat.title}</span>
                      {feat.desc && <p className="text-text-muted text-sm mt-0.5">{feat.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <a 
                href="#commander" 
                className="w-full bg-accent hover:bg-accent-hover text-white text-center py-4 rounded-2xl font-bold text-lg shadow-floating transition-all flex items-center justify-center gap-2"
              >
                Commander maintenant
                <ArrowRight className="w-5 h-5" />
              </a>

              <div className="flex items-center justify-center gap-6 mt-6 text-sm font-medium text-text-muted">
                <div className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Livraison 48h</div>
                <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Satisfait ou rembours</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CHECKOUT SECTION */}
      <section id="commander" className="py-16 lg:py-24 bg-bg-subtle border-t border-border-light">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand mb-4">Passez votre commande</h2>
            <p className="text-text-muted">Remplissez le formulaire ci-dessous. Paiement  la livraison uniquement.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* BUNDLES */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-brand text-lg mb-4">1. Choisissez votre offre</h3>
              {product.bundles?.map((bundle: ProductBundle) => (
                <label 
                  key={bundle.id}
                  className={`block relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedBundle?.id === bundle.id ? 'border-accent bg-white shadow-soft' : 'border-border-light bg-transparent hover:border-gray-300'}`}
                >
                  <input 
                    type="radio" 
                    name="bundle" 
                    className="sr-only"
                    checked={selectedBundle?.id === bundle.id}
                    onChange={() => setSelectedBundle(bundle)}
                  />
                  {bundle.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[11px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      {bundle.badge}
                    </span>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBundle?.id === bundle.id ? 'border-accent bg-accent' : 'border-gray-300'}`}>
                        {selectedBundle?.id === bundle.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className="font-bold text-brand text-lg">{bundle.name}</span>
                    </div>
                  </div>
                  <div className="pl-8">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xl font-display font-bold text-brand">{bundle.price.toLocaleString('fr-FR')} F</span>
                      {bundle.original_price && (
                        <span className="text-sm text-text-muted line-through">{bundle.original_price.toLocaleString('fr-FR')} F</span>
                      )}
                    </div>
                    {bundle.description && <p className="text-sm text-accent font-medium">{bundle.description}</p>}
                  </div>
                </label>
              ))}
            </div>

            {/* FORM */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-border-light">
              <h3 className="font-bold text-brand text-lg mb-6">2. Vos coordonnes de livraison</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-brand mb-2">Nom complet</label>
                  <input 
                    required 
                    type="text" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Votre nom et prnom"
                    className="w-full p-4 bg-bg-subtle border border-border-light rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand mb-2">Numro de tlphone (WhatsApp conseill)</label>
                  <input 
                    required 
                    type="tel" 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full p-4 bg-bg-subtle border border-border-light rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-brand mb-2">Ville (Bnin)</label>
                    <select 
                      value={city} 
                      onChange={e => setCity(e.target.value)}
                      className="w-full p-4 bg-bg-subtle border border-border-light rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none"
                    >
                      <option value="Cotonou">Cotonou</option>
                      <option value="Abomey-Calavi">Abomey-Calavi</option>
                      <option value="Porto-Novo">Porto-Novo</option>
                      <option value="Parakou">Parakou</option>
                      <option value="Ouidah">Ouidah</option>
                      <option value="Autre">Autre ville</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand mb-2">Quartier / Repre</label>
                    <input 
                      required 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Ex: Akpakpa, cinma..."
                      className="w-full p-4 bg-bg-subtle border border-border-light rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-border-light">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-text-muted">Total  payer  la livraison :</span>
                    <span className="font-display font-bold text-2xl text-brand">{selectedBundle?.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-accent hover:bg-accent-hover text-white text-[18px] font-bold h-16 rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Traitement...
                      </>
                    ) : (
                      'Valider ma commande (COD)'
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-text-muted">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>Vous ne payez rien maintenant. Le paiement se fait  la livraison.</span>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand mb-4">Elles ont chang de rituel</h2>
            <p className="text-text-muted">Dcouvrez ce que nos clientes pensent de {product.title}.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.testimonials?.map((t: Testimonial, idx: number) => (
              <div key={idx} className="bg-bg-subtle p-8 rounded-3xl border border-border-light flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-brand font-medium leading-relaxed mb-6">"{t.comment}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm">
                    {t.handle.charAt(1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-brand text-sm">{t.handle}</p>
                    <p className="text-xs text-text-muted">{t.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-bg-subtle">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand">Questions frquentes</h2>
          </div>
          <div className="space-y-4">
            {product.faq?.map((item: FAQItem, idx: number) => (
              <details key={idx} className="group bg-white border border-border-light rounded-2xl [&_summary::-webkit-details-marker]:hidden shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-brand text-lg select-none">
                  {item.question}
                  <span className="relative ml-4 shrink-0 w-8 h-8 rounded-full bg-bg-subtle flex items-center justify-center text-text-muted group-open:rotate-180 transition-transform duration-300">
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-text-muted leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 border-t border-border-light">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display font-extrabold text-xl tracking-tighter text-brand">umi</div>
          <div className="text-sm text-text-muted"> {new Date().getFullYear()} Umi. Tous droits rservs.</div>
          <div className="flex gap-6 text-sm font-medium text-text-muted">
            <a href="#" className="hover:text-brand transition-colors">Contact</a>
            <a href="#" className="hover:text-brand transition-colors">Livraison (Bnin)</a>
            <a href="#" className="hover:text-brand transition-colors">Conditions</a>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-border-light z-50">
        <a href="#commander" className="w-full bg-accent hover:bg-accent-hover text-white text-center h-14 rounded-xl font-bold text-[17px] shadow-lg flex items-center justify-center gap-2">
          Commander - {product.price.toLocaleString('fr-FR')} F
        </a>
      </div>

    </div>
  );
}
