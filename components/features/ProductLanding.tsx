"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Star, ArrowRight, Sparkles } from "lucide-react";

interface ProductBundle {
  id: string;
  name: string;
  quantity: number;
  price: number;
  original_price: number;
  badge: string | null;
  description: string;
}

export default function ProductLanding({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+229");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();
      
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
      alert("Erreur lors de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-premium-bg">
      <div className="w-10 h-10 border-4 border-premium-accent/20 border-t-premium-accent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-premium-bg">
      <h1 className="font-display text-4xl text-premium-dark text-center">Produit introuvable.</h1>
    </div>
  );

  return (
    <div className="bg-premium-bg min-h-screen text-premium-dark selection:bg-premium-accent/20 selection:text-premium-accent overflow-x-hidden font-sans">
      
      {/* HEADER ELEGANT */}
      <header className="fixed w-full top-0 z-50 p-6 mix-blend-difference text-white">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="font-display font-bold text-3xl tracking-tight">uméi.</div>
          <a href="#commander" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2.5 rounded-full font-medium text-sm hover:bg-white hover:text-black transition-all">
            Commander
          </a>
        </div>
      </header>

      {/* 
        FIXED BACKGROUND LAYER 
        Soft, elegant parallax
      */}
      <div className="fixed inset-0 w-full h-full flex flex-col justify-center items-center pointer-events-none z-0 bg-gradient-to-br from-[#FFF0F5] to-[#E6E6FA]">
        
        {/* TEXTE GEANT FILIGRANE (Soft watermark) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center flex flex-col items-center pointer-events-none opacity-[0.03]">
          <h1 className="font-display font-black text-[30vw] md:text-[25vw] leading-[0.75] tracking-tighter">
            UMÉI
          </h1>
        </div>

        {/* PRODUIT CENTRAL STICKY */}
        <div className="relative mt-20 md:mt-16 w-full max-w-[85vw] md:max-w-[450px] aspect-square flex justify-center items-center pointer-events-auto">
          {/* Lueur (Glow) derrière le produit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white rounded-full blur-[100px] opacity-60"></div>
          
          <img 
            src="/images/brosse-transparente.png" 
            alt="Brosse Uméi"
            className="w-[120%] max-w-[400px] md:max-w-[550px] drop-shadow-[0_30px_50px_rgba(147,51,234,0.15)] hover:scale-105 transition-transform duration-700 ease-out relative z-10"
          />
          
          {/* BOUTON PULSANT ELEGANT */}
          <a href="#commander" className="absolute top-[20%] right-[10%] md:top-[25%] md:right-[5%] group z-50 transition-transform hover:scale-110">
            <div className="absolute top-0 left-0 w-full h-full border border-premium-accent/50 rounded-full animate-pulsate pointer-events-none"></div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/90 backdrop-blur-sm border border-white/40 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.1)] text-premium-accent group-hover:bg-premium-accent group-hover:text-white transition-all duration-300">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
          </a>
        </div>
      </div>

      {/* 
        SCROLLING CONTENT LAYER 
      */}
      <div className="relative z-10 w-full flex flex-col">
        
        {/* HERO SPACER */}
        <section className="h-[100vh] w-full flex flex-col justify-end items-center pb-12 md:pb-16 pointer-events-none">
          <div className="flex flex-col items-center gap-6 w-[90%] max-w-[400px] pointer-events-auto opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
            <div className="text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-premium-dark mb-2">{product.title}</h2>
              <p className="text-gray-600 text-lg md:text-xl font-light">{product.description}</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl px-8 py-4 rounded-full shadow-premium border border-white/50">
              <span className="font-display font-bold text-2xl md:text-3xl text-premium-accent">{product.price.toLocaleString('fr-FR')} F</span>
              {product.original_price && <span className="text-gray-400 line-through text-lg">{product.original_price.toLocaleString('fr-FR')} F</span>}
            </div>

            <a href="#commander" className="w-full bg-premium-dark text-white font-medium text-lg md:text-xl py-4 md:py-5 rounded-full text-center shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(147,51,234,0.3)] hover:bg-premium-accent transition-all duration-500 hover:-translate-y-1">
              Commander Maintenant
            </a>
          </div>
        </section>

        {/* FEATURES ELEGANTES (Glassmorphism) */}
        <section className="py-24 md:py-32 px-4 md:px-6 max-w-6xl mx-auto w-full z-20">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="font-display font-medium text-4xl md:text-6xl tracking-tight text-premium-dark mb-4">L'art du démêlage.</h2>
            <p className="text-xl text-gray-500 font-light">Conçu pour sublimer votre routine capillaire.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {product.features?.map((feat: any, idx: number) => (
              <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/60 p-8 md:p-10 rounded-[2.5rem] shadow-premium hover:shadow-premium-hover hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 bg-premium-accent/10 rounded-2xl flex items-center justify-center mb-8">
                  <Check className="w-6 h-6 text-premium-accent" strokeWidth={2} />
                </div>
                <h3 className="font-display font-semibold text-2xl mb-4 text-premium-dark tracking-tight">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CHECKOUT PREMIUM */}
        <section id="commander" className="py-24 md:py-32 bg-white relative z-30 rounded-t-[3rem] md:rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] mt-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="font-display font-medium text-4xl md:text-5xl tracking-tight text-premium-dark mb-4">Finalisez votre commande</h2>
              <p className="text-lg text-gray-500 font-light">Paiement sécurisé à la livraison.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
              
              {/* OFFRES */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="font-semibold text-xl mb-6 text-gray-400 uppercase tracking-widest text-sm">1. Sélection</h3>
                {product.bundles?.map((bundle: ProductBundle) => (
                  <label 
                    key={bundle.id}
                    className={`block relative p-6 md:p-8 rounded-[2rem] cursor-pointer transition-all duration-300 border ${selectedBundle?.id === bundle.id ? 'bg-premium-bg border-premium-accent/30 shadow-[0_10px_30px_rgba(147,51,234,0.1)]' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input type="radio" name="bundle" className="sr-only" checked={selectedBundle?.id === bundle.id} onChange={() => setSelectedBundle(bundle)} />
                    {bundle.badge && (
                      <span className="absolute -top-3 left-8 bg-premium-accent text-white font-medium text-xs tracking-wider py-1.5 px-4 rounded-full shadow-md">{bundle.badge}</span>
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedBundle?.id === bundle.id ? 'border-premium-accent bg-premium-accent' : 'border-gray-300'}`}>
                          {selectedBundle?.id === bundle.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span className="font-display font-semibold text-2xl">{bundle.name}</span>
                      </div>
                    </div>
                    <div className="pl-9">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="font-display font-bold text-3xl text-premium-dark">{bundle.price.toLocaleString('fr-FR')} F</span>
                        {bundle.original_price && <span className="text-gray-400 line-through text-base">{bundle.original_price.toLocaleString('fr-FR')} F</span>}
                      </div>
                      <p className="text-gray-500 font-light text-sm">{bundle.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* FORMULAIRE */}
              <div className="lg:col-span-7">
                <h3 className="font-semibold text-xl mb-6 text-gray-400 uppercase tracking-widest text-sm">2. Livraison</h3>
                <form onSubmit={handleSubmit} className="bg-premium-bg/50 p-8 md:p-10 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Nom complet</label>
                    <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-4 md:p-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-premium-accent/50 focus:border-premium-accent transition-all font-light" placeholder="Prénom et Nom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Téléphone</label>
                    <input required type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-4 md:p-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-premium-accent/50 focus:border-premium-accent transition-all font-light" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Ville (Bénin)</label>
                      <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-4 md:p-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-premium-accent/50 focus:border-premium-accent transition-all font-light appearance-none cursor-pointer">
                        <option value="Cotonou">Cotonou</option>
                        <option value="Abomey-Calavi">Abomey-Calavi</option>
                        <option value="Porto-Novo">Porto-Novo</option>
                        <option value="Parakou">Parakou</option>
                        <option value="Ouidah">Ouidah</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Quartier / Repère</label>
                      <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 md:p-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-premium-accent/50 focus:border-premium-accent transition-all font-light" placeholder="Ex: Derrière l'église..." />
                    </div>
                  </div>
                  
                  <div className="pt-8 mt-4 border-t border-gray-200">
                    <div className="flex justify-between items-end mb-8">
                      <span className="text-gray-500 font-medium">Total à payer à la livraison</span>
                      <span className="font-display font-bold text-4xl text-premium-accent">{selectedBundle?.price.toLocaleString('fr-FR')} F</span>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-premium-dark text-white font-medium text-lg py-5 md:py-6 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:bg-premium-accent hover:shadow-[0_20px_40px_rgba(147,51,234,0.25)] hover:-translate-y-1 transition-all duration-500 disabled:opacity-50">
                      {isSubmitting ? 'Traitement en cours...' : 'Confirmer la commande'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-premium-dark text-white py-16 text-center relative z-30">
          <div className="font-display font-bold text-3xl mb-6 tracking-tight">uméi.</div>
          <p className="text-gray-400 font-light text-sm">© {new Date().getFullYear()} Uméi. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
}
