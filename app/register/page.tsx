"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Store, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (storeName.trim().length < 2) {
      setErrorMsg("Veuillez indiquer le nom de votre boutique (minimum 2 caractères).");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            store_name: storeName.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Si Supabase exige la confirmation par e-mail (session null)
      if (!data.session) {
        setNeedsEmailConfirm(true);
        setLoading(false);
        return;
      }

      router.push("/admin/settings");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur lors de l'inscription. Réessayez.");
      setLoading(false);
    }
  };

  if (needsEmailConfirm) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] text-[#14281D] flex flex-col items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-md bg-[#FDFBF7] rounded-[16px] border border-black/[0.08] shadow-[0_12px_32px_rgba(20,40,29,0.08)] p-8 text-center space-y-4">
          <div className="w-11 h-11 rounded-[10px] bg-[#EFE9DF] text-[#15803D] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h1 className="text-[20px] font-medium text-[#14281D]">Vérifiez votre boîte e-mail</h1>
          <p className="text-[14px] text-[#5E554A] leading-relaxed">
            Votre compte pour <strong className="font-medium text-[#14281D]">{storeName}</strong> a bien été créé. Cliquez sur le lien de confirmation envoyé à{" "}
            <strong className="font-medium text-[#14281D]">{email}</strong>, puis connectez-vous pour configurer votre boutique.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-[8px] bg-[#14281D] hover:bg-[#1E3A2B] text-[#FDFBF7] font-medium text-[14px] transition-colors duration-150"
          >
            <span>Aller à la connexion</span>
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </Link>
        </div>
      </div>
    );
  }

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
            Créer votre boutique COD
          </h1>
          <p className="text-[13px] text-[#7B7266]">
            7 jours d&apos;essai gratuit · sans carte bancaire
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-[10px] bg-white border border-[#DC2626]/30 text-[#DC2626] text-[13px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 stroke-[1.5] shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#14281D] block">
              Nom de votre boutique
            </label>
            <div className="relative">
              <Store className="w-4 h-4 stroke-[1.5] text-[#7B7266] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Cotonou Express Shop"
                className="w-full h-11 pl-10 pr-3.5 rounded-[8px] border border-black/[0.1] bg-white text-[14px] text-[#14281D] focus:outline-none focus:border-[#14281D] transition-colors duration-150"
              />
            </div>
          </div>

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
              Mot de passe (6 caractères minimum)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 stroke-[1.5] text-[#7B7266] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
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
              <span>Création en cours</span>
            ) : (
              <>
                <span>Créer ma boutique</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-black/[0.08] text-center space-y-3">
          <p className="text-[13px] text-[#5E554A]">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-[#14281D] underline hover:text-[#E8643C] transition-colors duration-150">
              Se connecter
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[12px] text-[#7B7266]">
            <ShieldCheck className="w-4 h-4 stroke-[1.5] text-[#15803D]" />
            <span>Aucune carte bancaire requise</span>
          </div>
        </div>
      </div>
    </div>
  );
}
