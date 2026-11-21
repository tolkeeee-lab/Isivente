"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Veuillez renseigner votre adresse e-mail et votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMsg("E-mail ou mot de passe incorrect.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMsg("Veuillez confirmer votre e-mail avant de vous connecter.");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      router.push("/admin/settings");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur de connexion. Réessayez.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#14281D] flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md bg-[#FDFBF7] rounded-[16px] border border-black/[0.08] shadow-[0_12px_32px_rgba(20,40,29,0.08)] p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center">
            <img
              src="/brand/isivente-logo-couleur.svg"
              alt="Isivente"
              className="h-8 w-auto"
            />
          </Link>
          <h1 className="text-[22px] font-medium text-[#14281D] tracking-[-0.02em] pt-2">
            Connexion à votre espace vendeur
          </h1>
          <p className="text-[13px] text-[#7B7266]">
            Accédez à vos commandes, vos finances et votre boutique COD
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-[10px] bg-white border border-[#DC2626]/30 text-[#DC2626] text-[13px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 stroke-[1.5] shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#14281D] block">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 stroke-[1.5] text-[#7B7266] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-[8px] border border-black/[0.1] bg-white text-[14px] text-[#14281D] focus:outline-none focus:border-[#14281D] transition-colors duration-150"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#14281D] block">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 stroke-[1.5] text-[#7B7266] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3.5 rounded-[8px] border border-black/[0.1] bg-white text-[14px] text-[#14281D] focus:outline-none focus:border-[#14281D] transition-colors duration-150"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 px-5 rounded-[8px] bg-[#14281D] hover:bg-[#1E3A2B] text-[#FDFBF7] font-medium text-[14px] flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Connexion en cours</span>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-black/[0.08] text-center space-y-3">
          <p className="text-[13px] text-[#5E554A]">
            Pas encore de boutique sur Isivente ?{" "}
            <Link href="/register" className="font-medium text-[#14281D] underline hover:text-[#E8643C] transition-colors duration-150">
              Créer un compte
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[12px] text-[#7B7266]">
            <ShieldCheck className="w-4 h-4 stroke-[1.5] text-[#15803D]" />
            <span>Données isolées par boutique</span>
          </div>
        </div>
      </div>
    </div>
  );
}
