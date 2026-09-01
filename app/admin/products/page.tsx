"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, ExternalLink, Copy, Check, Package, Sparkles } from "lucide-react";

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
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-premium-dark mb-1">
            Catalogue Produits
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Retrouvez et partagez les liens de vos pages de vente directes (COD).
          </p>
        </div>

        <button className="bg-purple-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-purple-800 shadow-md transition-all">
          <Plus className="w-4 h-4" />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-800 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const productUrl = `/p/${product.slug}`;
            const isCopied = copiedSlug === product.slug;

            return (
              <div 
                key={product.id} 
                className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:shadow-lg transition-all"
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
                  
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-purple-900 shadow-sm">
                    {product.price?.toLocaleString("fr-FR")} F
                  </span>
                </div>

                {/* CONTENU & LIEN DU PRODUIT */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-premium-dark leading-snug mb-1">
                      {product.title}
                    </h3>
                    
                    {/* LIEN DE LA LANDING PAGE */}
                    <div className="bg-purple-50 rounded-xl p-2.5 flex items-center justify-between gap-2 mt-3 border border-purple-100">
                      <span className="text-xs font-mono font-semibold text-purple-900 truncate">
                        /p/{product.slug}
                      </span>
                      
                      <button
                        onClick={() => copyProductLink(product.slug)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                          isCopied 
                            ? "bg-emerald-600 text-white" 
                            : "bg-white text-purple-800 hover:bg-purple-100 shadow-sm"
                        }`}
                        title="Copier le lien complet"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* BOUTONS D'ACTION */}
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
                    >
                      <span>Voir la page client</span>
                      <ExternalLink className="w-3.5 h-3.5" />
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
      )}

    </div>
  );
}
