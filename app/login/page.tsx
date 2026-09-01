"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-panel p-6">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-12 h-12 bg-magenta text-white rounded-xl flex items-center justify-center font-display font-bold text-2xl mb-4 shadow-sm">
            I
          </div>
          <CardTitle className="text-2xl">Isivente Admin</CardTitle>
          <p className="text-ink-soft text-sm font-medium mt-2">Connectez-vous pour gérer vos commandes</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-200">
                Identifiants incorrects.
              </div>
            )}
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple focus:ring-0 transition-colors font-medium text-sm"
                placeholder="admin@isivente.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-ink">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple focus:ring-0 transition-colors font-medium text-sm"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full mt-4 h-12"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
