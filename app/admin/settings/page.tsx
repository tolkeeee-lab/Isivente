"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Bell, 
  Shield, 
  Volume2, 
  Play, 
  Check, 
  Sparkles, 
  Smartphone,
  Save
} from "lucide-react";
import { 
  AVAILABLE_SOUNDS, 
  SoundType, 
  getSavedSoundType, 
  saveSoundType, 
  getSavedVolume, 
  saveVolume, 
  playOrderSound, 
  requestNotificationPermission 
} from "@/lib/soundEffects";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security">("notifications");
  const [selectedSound, setSelectedSound] = useState<SoundType>("chaching");
  const [volume, setVolume] = useState<number>(0.8);
  const [notifGranted, setNotifGranted] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<SoundType | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSelectedSound(getSavedSoundType());
    setVolume(getSavedVolume());
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifGranted(Notification.permission === "granted");
    }
  }, []);

  const handleSoundSelect = (soundId: SoundType) => {
    setSelectedSound(soundId);
    saveSoundType(soundId);
    setPlayingPreview(soundId);
    playOrderSound(soundId, volume);
    setTimeout(() => setPlayingPreview(null), 800);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    saveVolume(newVol);
  };

  const previewSound = (soundId: SoundType, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingPreview(soundId);
    playOrderSound(soundId, volume);
    setTimeout(() => setPlayingPreview(null), 800);
  };

  const enablePush = async () => {
    const ok = await requestNotificationPermission();
    setNotifGranted(ok);
    playOrderSound();
  };

  const handleSave = () => {
    setSavedSuccess(true);
    playOrderSound(selectedSound, volume);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-[staggerFadeUp_200ms_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* HEADER */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1">
          Configuration Boutique
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Paramètres & Alertes
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Personnalisez la sonnerie des commandes reçues, les notifications et les options de la boutique.
        </p>
      </div>

      {/* CONTENEUR PRINCIPAL FIGMA-GRADE */}
      <div className="card-figma overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[540px]">
          
          {/* MENU LATÉRAL ONGLETS */}
          <div className="border-b md:border-b-0 md:border-r border-slate-100 p-4 space-y-1 bg-slate-50/50">
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "notifications"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Alertes Sonores</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profil & Marque</span>
            </button>

            <button 
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "security"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Sécurité & Accès</span>
            </button>
          </div>

          {/* CONTENU SELON L'ONGLET */}
          <div className="md:col-span-3 p-6 sm:p-8 lg:p-10 space-y-8">
            
            {/* ═══ ONGLET NOTIFICATIONS & SONS ═══ */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">
                    Sonneries & Alertes de Commande en Direct
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sélectionnez le son qui retentira à chaque fois qu&apos;un client passe commande sur votre site.
                  </p>
                </div>

                {/* SÉLECTEUR DE VOLUME */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-bold text-slate-800">Volume sonore de l&apos;alerte</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald-600 tabular-nums">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>

                {/* LISTE DES 5 SONORITÉS */}
                <div className="space-y-3">
                  <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                    5 Sonorités Disponibles (Cliquez pour écouter et choisir)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_SOUNDS.map((s) => {
                      const isSelected = selectedSound === s.id;
                      const isPlaying = playingPreview === s.id;

                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSoundSelect(s.id)}
                          className={`p-4 rounded-2xl border-2 transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] ${
                            isSelected
                              ? "bg-emerald-50/60 border-emerald-500 shadow-xs"
                              : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl shrink-0">{s.emoji}</span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                                <span>{s.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                    Actif
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => previewSound(s.id, e)}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 shrink-0 transition-all ${
                              isPlaying
                                ? "bg-slate-900 text-white border-slate-900 scale-105 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                            title="Tester ce son"
                          >
                            <Play className={`w-3 h-3 ${isPlaying ? "fill-white text-white" : "text-slate-600"}`} />
                            <span className="text-[11px]">Test</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* NOTIFICATIONS PUSH NAVIGATEUR */}
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        Notifications Push (Bureau & Smartphone)
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Recevez une notification même si l&apos;onglet admin est réduit ou en arrière-plan.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={enablePush}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      notifGranted
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    }`}
                  >
                    {notifGranted ? "✓ Activé sur ce navigateur" : "Activer les notifications"}
                  </button>
                </div>

                {/* BOUTON ENREGISTRER */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium">
                    Préférences synchronisées en direct
                  </span>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-98"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Enregistré avec succès !</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Sauvegarder & Tester</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ═══ ONGLET PROFIL ═══ */}
            {activeTab === "profile" && (
              <div className="space-y-5 animate-fadeIn max-w-lg">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">Informations de la Boutique</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Détails généraux de la plateforme Isivente.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nom commercial</label>
                    <input
                      type="text"
                      defaultValue="Isivente Bénin"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Devise par défaut</label>
                    <input
                      type="text"
                      disabled
                      defaultValue="FCFA (Franc CFA BCEAO)"
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Téléphone assistance WhatsApp</label>
                    <input
                      type="text"
                      defaultValue="+229 01 92 90 18 17"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ONGLET SÉCURITÉ ═══ */}
            {activeTab === "security" && (
              <div className="space-y-5 animate-fadeIn max-w-lg">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">Accès & Sécurité</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Gestion de l&apos;authentification Supabase.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-800">Authentification Supabase Active</div>
                  <p>Vos commandes et statistiques sont synchronisées de manière chiffrée avec vos identifiants d&apos;administrateur.</p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
