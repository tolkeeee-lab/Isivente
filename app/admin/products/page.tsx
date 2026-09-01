"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, ExternalLink, Copy, Check, Package, Link as LinkIcon } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await supabase.from("products").select("*");
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // Produit par défaut
          setProducts([
            {
              id: "umei-default",
              title: "Brosse Démêlante Vapeur Uméi 3-en-1",
              slug: "umei",
              price: 14900,
              image_url: "/images/umei-hero-real.jpg",
              bundles: [
                { name: "Pack Découverte (1 Brosse)", price: 14900 },
                { name: "Pack Sérénité Duo (2 Brosses)", price: 24900 },
                { name: "Pack Famille (3 Brosses)", price: 34900 }
              ]
            }
          ]);
        }
      } catch (err) {
        setProducts([
          {
            id: "umei-default",
            title: "Brosse Démêlante Vapeur Uméi 3-en-1",
            slug: "umei",
            price: 14900,
            image_url: "/images/umei-hero-real.jpg",
            bundles: [
              { name: "Pack Découverte (1 Brosse)", price: 14900 },
              { name: "Pack Sérénité Duo (2 Brosses)", price: 24900 },
              { name: "Pack Famille (3 Brosses)", price: 34900 }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const copyProductLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://isivente.vercel.app";
    const url = `${origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-premium-dark mb-1">
            Catalogue Produits & Liens
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-medium">
            Récupérez et copiez en un clic les liens directs vers vos pages de vente.
          </p>
        </div>

        <button className="bg-purple-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-purple-800 shadow-md transition-all cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Nouveau produit</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3 sm:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">📦 Catalogue (Défilement horizontal)</span>
            <span className="text-[11px] text-purple-600 font-semibold">← Glisser →</span>
          </div>

          <div className="flex overflow-x-auto snap-x md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4 md:pb-0 scrollbar-none">
            {products.map((product) => {
              const productUrl = `/p/${product.slug}`;
              const isCopied = copiedSlug === product.slug;

              return (
                <div 
                  key={product.id} 
                  className="min-w-[280px] sm:min-w-0 snap-center bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:shadow-lg transition-all"
                >
                  {/* PHOTO PRODUIT */}
                  <div className="h-52 bg-purple-50 flex items-center justify-center relative overflow-hidden border-b border-gray-100 p-4">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-purple-300" />
                    )}
                    
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-purple-900 shadow-sm border border-purple-100">
                      {product.price?.toLocaleString("fr-FR")} F
                    </span>
                  </div>

                  {/* CONTENU & LIEN DU PRODUIT */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-premium-dark leading-snug mb-2">
                        {product.title}
                      </h3>
                      
                      {/* BOÎTE DU LIEN AVEC OPTION COPIER */}
                      <div className="bg-purple-50/80 rounded-2xl p-3 space-y-2 border border-purple-100">
                        <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-purple-900">
                          <span className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3 text-purple-700" /> Lien direct :
                          </span>
                          <span className="font-mono text-[10.5px] opacity-80">/p/{product.slug}</span>
                        </div>
                        
                        <button
                          onClick={() => copyProductLink(product.slug)}
                          className={`w-full text-xs font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                            isCopied 
                              ? "bg-emerald-600 text-white" 
                              : "bg-purple-900 text-white hover:bg-purple-800"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Lien copié dans le presse-papier !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier le lien produit</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* BOUTONS D'ACTION */}
                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-premium-dark text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <span>Tester la page client</span>
                        <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
                      </a>

                      <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
