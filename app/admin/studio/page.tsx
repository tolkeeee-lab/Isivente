"use client";

import React, { useState, useEffect } from "react";
import { 
  Wand2, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  RefreshCw, 
  Sliders, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Maximize2
} from "lucide-react";
import { DEFAULT_CATALOG } from "@/lib/defaultCatalog";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  resolution: string;
  aspect_ratio: string;
  created_at: string;
  product_title?: string;
}

export default function MarketingStudioPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);

  // Form State
  const [selectedProductSlug, setSelectedProductSlug] = useState("");
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState<"low" | "medium" | "high">("high");
  const [resolution, setResolution] = useState<"1k" | "2k" | "4k">("2k");
  const [aspectRatio, setAspectRatio] = useState<"auto" | "1:1" | "9:16" | "16:9" | "4:3" | "3:2">("1:1");
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [modelImageUrl, setModelImageUrl] = useState("");

  // Presets State
  const [presets, setPresets] = useState<any[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // 1. Initialisation de la clé locale et de l'historique
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("isivente_hf_key");
      if (savedKey) {
        setApiKey(savedKey);
        setIsKeyConfigured(true);
      }
      const savedHistory = localStorage.getItem("isivente_studio_history");
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch {}
      }
    }
  }, []);

  const handleSaveApiKey = () => {
    if (typeof window !== "undefined") {
      if (apiKey.trim()) {
        localStorage.setItem("isivente_hf_key", apiKey.trim());
        setIsKeyConfigured(true);
      } else {
        localStorage.removeItem("isivente_hf_key");
        setIsKeyConfigured(false);
      }
    }
    setShowKeyModal(false);
  };

  // 2. Chargement des presets Higgsfield si le mode Ads est activé
  const loadPresets = async () => {
    setIsLoadingPresets(true);
    try {
      const headers: Record<string, string> = {};
      if (apiKey.trim()) headers["x-hf-key"] = apiKey.trim();

      const res = await fetch("/api/higgsfield?action=presets", { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setPresets(data.items);
        if (data.items.length > 0 && !selectedPresetId) {
          setSelectedPresetId(data.items[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load presets", err);
    } finally {
      setIsLoadingPresets(false);
    }
  };

  useEffect(() => {
    if (enhancePrompt && presets.length === 0) {
      loadPresets();
    }
  }, [enhancePrompt]);

  // 3. Sélection rapide d'un produit du catalogue
  const handleSelectProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    const prod = DEFAULT_CATALOG.find((p) => p.slug === slug);
    if (!prod) return;

    // Définir une image publique absolue ou relative
    const imgUrl = prod.image_url || prod.image || "";
    const fullUrl = imgUrl.startsWith("http") 
      ? imgUrl 
      : `${typeof window !== "undefined" ? window.location.origin : ""}${imgUrl}`;
    
    setProductImageUrl(fullUrl);

    // Suggestions de prompts selon le produit
    if (slug.includes("brosse") || slug.includes("umei")) {
      setPrompt("Photographie de campagne publicitaire ultra-luxe pour une brosse démêlante à vapeur. Posée avec élégance sur une table de salle de bain en marbre blanc avec des reflets d'eau douce, brume vaporeuse lumineuse, flacon d'huile essentielle en arrière-plan, éclairage studio doux et chaleureux, rendu commercial 8k.");
    } else if (slug.includes("matelas")) {
      setPrompt("Publicité e-commerce premium pour un matelas gonflable ergonomique pliable. Ambiance chambre moderne chaleureuse ou camping glamping de luxe sous une tente spacieuse, texture de velours vert sauge ultra-détaillée, éclairage naturel du matin, sensation de confort absolu.");
    } else if (slug.includes("masseur")) {
      setPrompt("Visuel publicitaire haut de gamme pour un masque de massage oculaire futuriste. Posé à côté d'un livre et d'une tasse de thé sur une table de chevet en bois épuré scandinave, lueurs bleues relaxantes douces, atmosphère de détente et de sérénité.");
    } else {
      setPrompt(`Visuel publicitaire e-commerce premium pour ${prod.title}. Mise en scène professionnelle en studio, composition épurée, éclairage cinématographique de pointe, fond minimaliste texturé.`);
    }
  };

  // 4. Lancement de la génération d'image
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationError("");
    setGenerationSuccess(false);

    try {
      const imageUrls: string[] = [];
      if (productImageUrl.trim()) imageUrls.push(productImageUrl.trim());
      if (modelImageUrl.trim()) imageUrls.push(modelImageUrl.trim());

      const payloadParams: any = {
        prompt: prompt.trim(),
        quality,
        resolution,
        aspect_ratio: aspectRatio,
        enhance_prompt: enhancePrompt,
      };

      if (enhancePrompt && selectedPresetId) {
        payloadParams.preset_id = selectedPresetId;
      }

      if (imageUrls.length > 0) {
        payloadParams.image_urls = imageUrls;
      }

      const res = await fetch("/api/higgsfield", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey.trim() ? { "x-hf-key": apiKey.trim() } : {}),
        },
        body: JSON.stringify({
          params: payloadParams,
          poll: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de la génération chez Higgsfield.");
      }

      if (data.images && data.images.length > 0) {
        const newImg: GeneratedImage = {
          id: data.request_id || Math.random().toString(36).substring(7),
          url: data.images[0].url,
          prompt: prompt.trim(),
          resolution,
          aspect_ratio: aspectRatio,
          created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          product_title: DEFAULT_CATALOG.find((p) => p.slug === selectedProductSlug)?.shortTitle || "Visuel Marketing",
        };

        const updatedHistory = [newImg, ...history].slice(0, 30);
        setHistory(updatedHistory);
        if (typeof window !== "undefined") {
          localStorage.setItem("isivente_studio_history", JSON.stringify(updatedHistory));
        }

        setGenerationSuccess(true);
      } else {
        throw new Error("Aucune image retournée par l'API.");
      }
    } catch (err: any) {
      console.error("Erreur génération:", err);
      setGenerationError(err.message || "Une erreur est survenue lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* ── EN-TÊTE DU STUDIO MARKETING ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Studio Marketing AI</span>
                <span className="text-[11px] font-mono font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                  Higgsfield 4K
                </span>
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Générez et retouchez des affiches publicitaires, bannières e-commerce et visuels UGC ultra-haute définition (1K à 4K) guidés par vos photos de produits.
          </p>
        </div>

        {/* Clé API Status & Modal */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => setShowKeyModal(true)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isKeyConfigured
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isKeyConfigured ? "Clé API Active" : "Configurer la Clé API"}</span>
          </button>
        </div>
      </div>

      {/* ── MODAL CONFIGURATION CLÉ API ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Identifiants API Higgsfield</span>
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Format attendu : <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">KEY_ID:KEY_SECRET</code>. 
              Vous pouvez l'enregistrer ici pour votre navigateur ou directement dans la variable <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">HF_CREDENTIALS</code> de votre serveur.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Clé API (KEY_ID:KEY_SECRET)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ex: hf_key_abc123:hf_sec_xyz789"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PANNEAU PRINCIPAL DE CRÉATION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE : FORMULAIRE DE CONTRÔLE (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            
            {/* 1. Sélecteur de Produits Isivente */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Sélectionner un produit Isivente</span>
                </label>
                <span className="text-[11px] text-slate-400">Préremplit la photo & le prompt</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEFAULT_CATALOG.slice(0, 6).map((prod) => {
                  const isSelected = selectedProductSlug === prod.slug;
                  return (
                    <button
                      key={prod.slug}
                      type="button"
                      onClick={() => handleSelectProduct(prod.slug)}
                      className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20" 
                          : "bg-slate-50 hover:bg-slate-100/70 border-slate-200/80 text-slate-700"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={prod.image_url || prod.image} alt={prod.title} className="w-full h-full object-contain p-0.5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-bold truncate text-slate-900">{prod.shortTitle || prod.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{prod.price.toLocaleString("fr-FR")} F</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Prompt Marketing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                  <span>2. Prompt de mise en scène</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">{prompt.length}/5000 caractères</span>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Décrivez la scène publicitaire souhaitée, la lumière, l'ambiance, les textures, l'atmosphère (ex: studio minimaliste, marbre, reflets d'eau, ambiance salon chaleureux...)"
                required
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-slate-800 leading-relaxed placeholder:text-slate-400"
              />
            </div>

            {/* 3. Photo du Produit & Photo du Modèle (Optionnels) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-indigo-500" />
                  <span>URL Photo du Produit</span>
                </label>
                <input
                  type="url"
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                  placeholder="https://.../produit.jpg"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-purple-500" />
                  <span>URL Référence Mannequin (Optionnel)</span>
                </label>
                <input
                  type="url"
                  value={modelImageUrl}
                  onChange={(e) => setModelImageUrl(e.target.value)}
                  placeholder="https://.../mannequin.jpg"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>
            </div>

            {/* 4. Format, Résolution & Qualité */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Format d'affichage</label>
                <select
                  value={aspectRatio}
                  onChange={(e: any) => setAspectRatio(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
                >
                  <option value="1:1">1:1 Carré (Instagram, Feed)</option>
                  <option value="9:16">9:16 Vertical (TikTok, Stories)</option>
                  <option value="16:9">16:9 Paysage (Bannière site)</option>
                  <option value="4:3">4:3 Standard</option>
                  <option value="3:2">3:2 Photo</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              {/* Résolution */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Résolution du Rendu</label>
                <select
                  value={resolution}
                  onChange={(e: any) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
                >
                  <option value="1k">1K (Rapide)</option>
                  <option value="2k">2K (Haute Qualité - Rec.)</option>
                  <option value="4k">4K (Ultra HD Bannières)</option>
                </select>
              </div>

              {/* Qualité */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Finition</label>
                <select
                  value={quality}
                  onChange={(e: any) => setQuality(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
                >
                  <option value="high">High (Maximum de détails)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

            </div>

            {/* 5. Mode Preset Ads Studio (Optionnel) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Mode Preset Ads (Higgsfield Studio)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enhancePrompt}
                    onChange={(e) => setEnhancePrompt(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {enhancePrompt && (
                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">Sélectionner un preset publicitaire :</span>
                    <button 
                      type="button" 
                      onClick={loadPresets} 
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingPresets ? "animate-spin" : ""}`} />
                      <span>Actualiser</span>
                    </button>
                  </div>

                  {presets.length > 0 ? (
                    <select
                      value={selectedPresetId}
                      onChange={(e) => setSelectedPresetId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
                    >
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.id} ({p.type || "ads"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      {isLoadingPresets ? "Chargement des presets officiels..." : "Aucun preset récupéré. Vérifiez votre clé API."}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Messages d'erreur ou succès */}
            {generationError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Erreur de génération</p>
                  <p className="leading-relaxed">{generationError}</p>
                </div>
              </div>
            )}

            {/* Bouton de Génération */}
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-pink-900/15 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rendu en cours chez Higgsfield AI (environ 10-30s)...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Générer le visuel publicitaire ({resolution.toUpperCase()})</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* COLONNE DROITE : GALERIE DES VISUELS & HISTORIQUE (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-600" />
                <span>Visuels Récents ({history.length})</span>
              </h3>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem("isivente_studio_history");
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Effacer l'historique
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2 border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="text-xs font-bold text-slate-700">Aucun visuel généré pour le moment</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Sélectionnez un produit, décrivez votre ambiance publicitaire et cliquez sur "Générer".
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5 transition-all hover:border-slate-300"
                  >
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center group">
                      <img 
                        src={item.url} 
                        alt={item.prompt} 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImageUrl(item.url)}
                          className="w-8 h-8 rounded-lg bg-white/90 text-slate-900 flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
                          title="Agrandir"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-lg bg-white/90 text-slate-900 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-800">{item.product_title}</span>
                        <span className="font-mono text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
                          {item.resolution} • {item.aspect_ratio}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-between border-t border-slate-200/70 text-[10px]">
                      <span className="text-slate-400">{item.created_at}</span>
                      <button
                        type="button"
                        onClick={() => copyUrl(item.id, item.url)}
                        className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copier l'URL HD</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── MODAL APERÇU GRAND ÉCRAN ── */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
            <img 
              src={previewImageUrl} 
              alt="Aperçu Grand Format" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl" 
            />
          </div>
        </div>
      )}

    </div>
  );
}
