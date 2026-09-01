"use client";

import React from "react";
import { Settings, User, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-3xl mb-2 text-premium-dark">Paramètres</h1>
        <p className="text-gray-500 font-light">Gérez les préférences de votre boutique.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
          {/* Menu Paramètres */}
          <div className="border-r border-gray-100 p-6 space-y-2 bg-gray-50/30">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-premium-bg text-premium-accent font-medium transition-colors">
              <User className="w-5 h-5" /> Mon Profil
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Shield className="w-5 h-5" /> Sécurité
            </button>
          </div>

          {/* Contenu Paramètres */}
          <div className="md:col-span-3 p-8 lg:p-10">
            <h2 className="font-display font-semibold text-xl text-premium-dark mb-6">Informations du compte</h2>
            
            <form className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Nom de la boutique</label>
                <input 
                  type="text" 
                  defaultValue="Uméi"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-premium-accent/50 focus:border-premium-accent transition-all font-light"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email Administrateur</label>
                <input 
                  type="email" 
                  defaultValue="admin@umei.com"
                  disabled
                  className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-400 font-light cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-2">Géré depuis l'interface Supabase.</p>
              </div>

              <button type="button" className="bg-premium-dark text-white font-medium px-8 py-4 rounded-xl shadow-md hover:bg-premium-accent hover:-translate-y-1 transition-all">
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
