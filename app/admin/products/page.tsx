"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Edit2, 
  ExternalLink, 
  Copy, 
  Check, 
  Package, 
  Link as LinkIcon, 
  Sparkles,
  X,
  Trash2,
  Layers
} from "lucide-react";

interface ProductBundle {
  name: string;
  price: number;
}

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  image_url: string;
  bundles: ProductBundle[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  
  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState<number>(14900);
  const [formImage, setFormImage] = useState("");
  const [formBundles, setFormBundles] = useState<ProductBundle[]>([]);

  const defaultProducts: ProductItem[] = [
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
    },
    {
      id: "eraclean-default",
      title: "Purificateur d'Air & Anti-Odeurs EraClean™",
      slug: "eraclean",
      price: 19900,
      image_url: "/images/eraclean-studio.jpg",
      bundles: [
        { name: "Pack Solo (1 Appareil)", price: 19900 },
        { name: "Pack Duo Frigo + WC (2 Appareils)", price: 32900 },
        { name: "Pack Grand Ménage (3 Appareils)", price: 44900 }
      ]
    },
    {
      id: "turbofan-default",
      title: "Ventilateur Ceinture & Powerbank TurboFan™ Max",
      slug: "turbofan",
      price: 16900,
      image_url: "/images/turbofan-studio.jpg",
      bundles: [
        { name: "Pack Solo Fraîcheur (1 TurboFan)", price: 16900 },
        { name: "Pack Duo (2 TurboFans)", price: 27900 },
        { name: "Pack Famille / Chantier (3 TurboFans)", price: 37900 }
      ]
    },
    {
      id: "peeler-default",
      title: "Éplucheur Automatique ChefPeel™ Pro",
      slug: "peeler",
      price: 14900,
      image_url: "/images/peeler-hero.jpg",
      bundles: [
        { name: "Pack Découverte Cuisine (1 Appareil)", price: 14900 },
        { name: "Pack Duo Sérénité (2 Appareils)", price: 24900 },
        { name: "Pack Traiteur / Famille (3 Appareils)", price: 34900 }
      ]
    },
    {
      id: "stabilisateur-default",
      title: "Stabilisateur Pro-Mobile Z3 Zoom™",
      slug: "stabilisateur",
      price: 49900,
      image_url: "/images/stabilisateur-hero.jpg",
      bundles: [
        { name: "Pack Solo Créateur (1 Kit)", price: 49900 },
        { name: "Pack Duo Studio (2 Kits)", price: 89900 },
        { name: "Pack Pro Équipe & Vidéaste (3 Kits)", price: 129900 }
      ]
    },
    {
      id: "veilleuse-default",
      title: "Veilleuse Projecteur LED 3D Tactile FRIOSZ FP-032",
      slug: "veilleuse",
      price: 14900,
      image_url: "/images/projecteur-hero.jpg",
      bundles: [
        { name: "Pack Solo Découverte (1 Kit + 24 Disques)", price: 14900 },
        { name: "Pack Duo Magique (2 Kits + 48 Disques)", price: 25900 },
        { name: "Pack Trio Famille & Cadeaux (3 Kits + 72 Disques)", price: 36900 }
      ]
    }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: true });
      
      const supabaseProducts = (data || []).map((p: any) => ({
        ...p,
        image_url: p.image_url || (p.images && p.images[0]?.url) || "/images/projecteur-hero.jpg",
        bundles: p.bundles || []
      }));

      // Fusionner : Supabase a priorité, puis on ajoute les defaults manquants
      const slugsFromDb = new Set(supabaseProducts.map((p: ProductItem) => p.slug));
      const missingDefaults = defaultProducts.filter(dp => !slugsFromDb.has(dp.slug));
      const merged = [...supabaseProducts, ...missingDefaults];
      
      setProducts(merged);
    } catch (err) {
      setProducts(defaultProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const copyProductLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://isivente.vercel.app";
    const url = `${origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormTitle("");
    setFormSlug("");
    setFormPrice(15000);
    setFormImage("/images/umei-hero-real.jpg");
    setFormBundles([
      { name: "Offre Solo (1 Unité)", price: 15000 },
      { name: "Pack Duo (2 Unités)", price: 25000 }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormSlug(prod.slug);
    setFormPrice(prod.price);
    setFormImage(prod.image_url);
    setFormBundles(prod.bundles || []);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: ProductItem = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
      title: formTitle.trim(),
      slug: formSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      price: Number(formPrice),
      image_url: formImage.trim() || "/images/umei-hero-real.jpg",
      bundles: formBundles
    };

    try {
      await supabase.from("products").upsert(newProduct);
    } catch (err) {
      console.warn("Supabase upsert offline fallback");
    }

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
    } else {
      setProducts(prev => [newProduct, ...prev]);
    }

    setIsModalOpen(false);
  };

  const addBundle = () => {
    setFormBundles(prev => [...prev, { name: "Nouveau Pack", price: formPrice * 2 }]);
  };

  const removeBundle = (index: number) => {
    setFormBundles(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-8 animate-[staggerFadeUp_240ms_cubic-bezier(0.16,1,0.3,1)_both]">
      
      {/* HEADER SECTION */}
      <div className="card-figma p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1">
            Catalogue & Tunnels
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Catalogue Produits & Liens de Vente
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Générez et copiez en un clic vos pages de destination pour vos campagnes d'acquisition.
          </p>
        </div>

        <button 
          type="button"
          onClick={openNewProductModal}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 hover:bg-slate-800 shadow-sm transition-all duration-150 active:scale-[0.97] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* COMPTEUR */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
          {products.length} produit{products.length > 1 ? "s" : ""} au catalogue
        </div>
        <div className="text-[10px] text-slate-400 hidden sm:block">
          Faites défiler horizontalement pour voir tous les produits
        </div>
      </div>

      {loading ? (
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-figma p-5 space-y-4 animate-pulse min-w-[300px] w-[300px] shrink-0 snap-start">
              <div className="h-40 bg-slate-200 rounded-xl" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, idx) => {
            const productUrl = `/p/${product.slug}`;
            const isCopied = copiedSlug === product.slug;

            return (
              <div 
                key={product.id} 
                className="card-figma overflow-hidden flex flex-col hover:border-slate-300/80 hover:-translate-y-0.5 min-w-[300px] w-[300px] shrink-0 snap-start"
                style={{ 
                  animationDelay: `${idx * 40}ms`,
                  transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* PHOTO PRODUIT */}
                <div className="h-44 bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100 p-4">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="w-full h-full object-contain hover:scale-105"
                      style={{ transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                    />
                  ) : (
                    <Package className="w-12 h-12 text-slate-300" />
                  )}
                  
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold font-mono text-slate-900 shadow-sm border border-slate-200/80 tabular-nums">
                    {new Intl.NumberFormat("fr-FR").format(product.price)} F
                  </span>
                </div>

                {/* CONTENU & LIEN DU PRODUIT */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900 leading-snug mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    
                    {/* BOÎTE DU LIEN AVEC OPTION COPIER */}
                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5 border border-slate-200/60">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-semibold text-slate-600">
                        <span className="flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-slate-400" /> Lien :
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">/p/{product.slug}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => copyProductLink(product.slug)}
                        className={`w-full text-[11px] font-semibold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] ${
                          isCopied 
                            ? "bg-emerald-600 text-white shadow-sm" 
                            : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-100"
                        }`}
                        style={{ transition: "all 150ms cubic-bezier(0.2, 0, 0, 1)" }}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 stroke-[1.75]" />
                            <span>Copier l&apos;URL</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* PACKS / OFFRES */}
                    {product.bundles && product.bundles.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>Packs ({product.bundles.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {product.bundles.map((b, bIdx) => (
                            <span key={bIdx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium tabular-nums">
                              {b.name.length > 20 ? b.name.substring(0, 20) + "…" : b.name} : {new Intl.NumberFormat("fr-FR").format(b.price)} F
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                    <a
                      href={productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.97]"
                      style={{ transition: "all 150ms cubic-bezier(0.2, 0, 0, 1)" }}
                    >
                      <span>Tester</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </a>

                    <button 
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 active:scale-[0.97] cursor-pointer"
                      style={{ transition: "all 150ms cubic-bezier(0.2, 0, 0, 1)" }}
                      title="Modifier le produit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALE D'AJOUT / ÉDITION PRODUIT FIGMA-GRADE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-[staggerFadeUp_220ms_cubic-bezier(0.16,1,0.3,1)_both]">
            
            {/* MODAL HEADER */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  {editingProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
                </h3>
                <p className="text-xs text-slate-400">Paramétrez le titre, le slug URL et les offres groupées</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre du produit</label>
                <input 
                  type="text" 
                  required
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!editingProduct) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    }
                  }}
                  placeholder="Ex: Brosse Démêlante Vapeur Uméi 3-en-1"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-slate-900 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL (/p/...)</label>
                  <input 
                    type="text" 
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="umei"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-slate-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prix de base (FCFA)</label>
                  <input 
                    type="number" 
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono tabular-nums focus:border-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chemin ou URL de l'image</label>
                <input 
                  type="text" 
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="/images/umei-hero-real.jpg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-slate-900 outline-none transition-all"
                />
              </div>

              {/* BUNDLES */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">Packs / Offres Multi-Achats</label>
                  <button
                    type="button"
                    onClick={addBundle}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Ajouter un pack
                  </button>
                </div>

                <div className="space-y-2">
                  {formBundles.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={b.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormBundles(prev => prev.map((item, i) => i === idx ? { ...item, name: val } : item));
                        }}
                        placeholder="Nom du pack"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <input 
                        type="number"
                        value={b.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormBundles(prev => prev.map((item, i) => i === idx ? { ...item, price: val } : item));
                        }}
                        placeholder="Prix"
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => removeBundle(idx)}
                        className="p-1.5 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all duration-150 active:scale-[0.97] cursor-pointer"
                >
                  Enregistrer le produit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
