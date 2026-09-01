"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Image as ImageIcon } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from("products").select("*");
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-semibold text-3xl mb-2 text-premium-dark">Produits</h1>
          <p className="text-gray-500 font-light">Gérez votre catalogue et vos offres (bundles).</p>
        </div>
        <button className="bg-premium-dark text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-premium-accent transition-colors">
          <Plus className="w-5 h-5" />
          Ajouter un produit
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-premium-accent/20 border-t-premium-accent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group">
              <div className="h-48 bg-gray-50 flex items-center justify-center relative border-b border-gray-100">
                <ImageIcon className="w-12 h-12 text-gray-300" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button className="bg-white text-premium-dark px-4 py-2 rounded-full text-sm font-medium shadow-md hover:text-premium-accent transition-colors flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Modifier
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-display font-bold text-xl text-premium-dark mb-1">{product.title}</h3>
                <p className="text-sm text-gray-400 mb-4 font-mono">/p/{product.slug}</p>
                <div className="mt-auto flex justify-between items-end">
                  <span className="font-bold text-premium-accent text-2xl">{product.price?.toLocaleString('fr-FR')} F</span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{product.bundles?.length || 0} packs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
