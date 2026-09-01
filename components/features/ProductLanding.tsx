"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Star, ArrowRight, Hand } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-brutal-bg">
      <div className="text-brutal-dark font-display font-black text-4xl animate-pulse">CHARGEMENT...</div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-brutal-bg">
      <h1 className="font-display font-black text-6xl text-brutal-dark uppercase text-center leading-none">ERREUR<br/>PRODUIT<br/>INCONNU</h1>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-brutal-bg to-brutal-bg2 min-h-screen text-brutal-dark selection:bg-brutal-accent selection:text-brutal-dark overflow-x-hidden font-sans">
      
      {/* HEADER BRUTALISTE */}
      <header className="fixed w-full top-0 z-50 p-4 mix-blend-difference text-white">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto">
          <div className="font-display font-black text-3xl tracking-tighter uppercase">uméi.</div>
          <a href="#commander" className="bg-white text-black px-6 py-2 rounded-full font-bold uppercase text-sm border-2 border-transparent hover:scale-105 transition-transform">
            [ Commander ]
          </a>
        </div>
      </header>

      {/* HERO SECTION IMMERSIVE */}
      <section className="relative min-h-[100vh] w-full flex flex-col justify-center items-center overflow-hidden">
        
        {/* TEXTE GEANT EN ARRIERE PLAN */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none whitespace-nowrap">
          <h1 className="font-display font-black text-[18vw] leading-[0.8] text-brutal-dark opacity-90 uppercase mix-blend-overlay">
            UMÉI
          </h1>
          <h2 className="font-display font-black text-[18vw] leading-[0.8] text-brutal-dark opacity-90 uppercase outline-text">
            BROSSE
          </h2>
        </div>

        {/* PRODUIT CENTRAL */}
        <div className="relative z-10 mt-16 w-full max-w-[500px] aspect-square flex justify-center items-center">
          <img 
            src="/images/brosse-transparente.png" 
            alt="Brosse Uméi"
            className="w-[120%] max-w-[600px] drop-shadow-[0_40px_40px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform duration-500 cursor-none"
          />
          
          {/* BOUTON PULSANT ABSOLU */}
          <a href="#commander" className="absolute top-[30%] right-[10%] group z-50 hover:scale-110 transition-transform">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-brutal-dark rounded-full animate-pulsate"></div>
            <div className="w-16 h-16 bg-brutal-accent border-[3px] border-brutal-dark rounded-full flex items-center justify-center shadow-brutal text-brutal-dark group-hover:bg-brutal-light transition-colors">
              <Hand className="w-8 h-8" />
            </div>
          </a>
        </div>

        {/* PRIX ET CTA FLOTTANT */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 w-[90%] max-w-[400px]">
          <div className="bg-brutal-light border-[3px] border-brutal-dark rounded-2xl p-2 px-6 shadow-brutal flex gap-4 items-center -rotate-2 hover:rotate-0 transition-transform">
            <span className="font-display font-black text-3xl">{product.price.toLocaleString('fr-FR')} F</span>
            {product.original_price && <span className="font-bold text-gray-400 line-through text-lg">{product.original_price.toLocaleString('fr-FR')} F</span>}
          </div>
          <a href="#commander" className="w-full bg-brutal-dark text-brutal-light font-display font-black text-2xl uppercase py-5 rounded-[2rem] text-center shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:bg-brutal-purple hover:scale-105 transition-all">
            Acheter Maintenant
          </a>
        </div>
      </section>

      {/* MARQUEE BANNER */}
      <div className="w-full bg-brutal-accent border-y-[3px] border-brutal-dark py-4 overflow-hidden flex whitespace-nowrap z-20 relative">
        <div className="animate-[scroll_20s_linear_infinite] flex gap-12 font-display font-black text-2xl uppercase items-center">
          <span>💥 L'INNOVATION CAPILLAIRE</span>
          <span>•</span>
          <span>🚚 LIVRAISON GRATUITE AUJOURD'HUI</span>
          <span>•</span>
          <span>⭐ 4.9/5 AVIS CLIENTS</span>
          <span>•</span>
          <span>💥 L'INNOVATION CAPILLAIRE</span>
          <span>•</span>
          <span>🚚 LIVRAISON GRATUITE AUJOURD'HUI</span>
          <span>•</span>
          <span>⭐ 4.9/5 AVIS CLIENTS</span>
        </div>
      </div>

      {/* FEATURES BRUTALISTES */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="font-display font-black text-6xl md:text-8xl mb-16 uppercase leading-none text-center">Pourquoi<br/>craquer ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {product.features?.map((feat: any, idx: number) => {
            const rotations = ['-rotate-3', 'rotate-2', '-rotate-2'];
            return (
              <div key={idx} className={`bg-brutal-light border-[3px] border-brutal-dark p-8 rounded-[2rem] shadow-brutal ${rotations[idx % 3]} hover:rotate-0 hover:-translate-y-2 transition-all`}>
                <div className="w-16 h-16 bg-brutal-accent border-2 border-brutal-dark rounded-full flex items-center justify-center mb-6 shadow-brutal">
                  <Check className="w-8 h-8 text-brutal-dark" strokeWidth={3} />
                </div>
                <h3 className="font-display font-black text-2xl uppercase mb-4 leading-tight">{feat.title}</h3>
                <p className="font-bold text-gray-700 text-lg leading-snug">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CHECKOUT BRUTALISTE */}
      <section id="commander" className="py-24 bg-brutal-dark text-brutal-light border-t-[4px] border-black">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display font-black text-6xl md:text-[6rem] uppercase leading-none text-center mb-16 text-brutal-accent">Commandez.</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* OFFRES */}
            <div className="space-y-6">
              <h3 className="font-display font-black text-3xl uppercase mb-8">1. Le Pack</h3>
              {product.bundles?.map((bundle: ProductBundle) => (
                <label 
                  key={bundle.id}
                  className={`block relative p-6 border-[3px] rounded-[2rem] cursor-pointer transition-all ${selectedBundle?.id === bundle.id ? 'bg-brutal-accent border-white text-brutal-dark rotate-1 scale-105' : 'bg-transparent border-gray-600 hover:border-gray-400'}`}
                >
                  <input type="radio" name="bundle" className="sr-only" checked={selectedBundle?.id === bundle.id} onChange={() => setSelectedBundle(bundle)} />
                  {bundle.badge && (
                    <span className="absolute -top-4 right-6 bg-brutal-purple text-white font-black text-sm uppercase py-1 px-4 rounded-full border-2 border-black rotate-3 shadow-[2px_2px_0_0_#000]">{bundle.badge}</span>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-display font-black text-2xl uppercase">{bundle.name}</span>
                  </div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-display font-black text-4xl">{bundle.price.toLocaleString('fr-FR')} F</span>
                    {bundle.original_price && <span className="font-bold line-through opacity-60 text-lg">{bundle.original_price.toLocaleString('fr-FR')} F</span>}
                  </div>
                  <p className="font-bold opacity-80">{bundle.description}</p>
                </label>
              ))}
            </div>

            {/* FORMULAIRE */}
            <div className="bg-brutal-light text-brutal-dark p-8 md:p-10 rounded-[2rem] border-[3px] border-brutal-dark shadow-brutal rotate-[-1deg]">
              <h3 className="font-display font-black text-3xl uppercase mb-8">2. Vos Infos</h3>
              <form onSubmit={handleSubmit} className="space-y-6 font-bold">
                <div>
                  <label className="block mb-2 uppercase text-sm">Nom complet</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-4 bg-white border-2 border-brutal-dark rounded-xl focus:outline-none focus:ring-4 focus:ring-brutal-accent shadow-[4px_4px_0_0_#0F0F0F] transition-all" />
                </div>
                <div>
                  <label className="block mb-2 uppercase text-sm">Téléphone</label>
                  <input required type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-4 bg-white border-2 border-brutal-dark rounded-xl focus:outline-none focus:ring-4 focus:ring-brutal-accent shadow-[4px_4px_0_0_#0F0F0F] transition-all" />
                </div>
                <div>
                  <label className="block mb-2 uppercase text-sm">Ville (Bénin)</label>
                  <select value={city} onChange={e => setCity(e.target.value)} className="w-full p-4 bg-white border-2 border-brutal-dark rounded-xl focus:outline-none focus:ring-4 focus:ring-brutal-accent shadow-[4px_4px_0_0_#0F0F0F] transition-all appearance-none cursor-pointer">
                    <option value="Cotonou">Cotonou</option>
                    <option value="Abomey-Calavi">Abomey-Calavi</option>
                    <option value="Porto-Novo">Porto-Novo</option>
                    <option value="Parakou">Parakou</option>
                    <option value="Ouidah">Ouidah</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 uppercase text-sm">Quartier / Repère</label>
                  <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-4 bg-white border-2 border-brutal-dark rounded-xl focus:outline-none focus:ring-4 focus:ring-brutal-accent shadow-[4px_4px_0_0_#0F0F0F] transition-all" />
                </div>
                <div className="pt-8 mt-4 border-t-4 border-brutal-dark border-dashed">
                  <div className="flex justify-between items-center mb-6">
                    <span className="uppercase text-lg">Total</span>
                    <span className="font-display font-black text-4xl">{selectedBundle?.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-brutal-dark text-brutal-light font-display font-black uppercase text-2xl py-6 rounded-2xl shadow-[6px_6px_0_0_#CCFF00] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#CCFF00] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50">
                    {isSubmitting ? 'ENVOI...' : 'VALIDER MA COMMANDE'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brutal-dark text-brutal-light py-12 text-center border-t border-gray-800">
        <div className="font-display font-black text-4xl mb-4 tracking-tighter uppercase">uméi.</div>
        <p className="font-bold opacity-50 uppercase text-sm">© {new Date().getFullYear()} Uméi. Brutal Design.</p>
      </footer>
    </div>
  );
}
