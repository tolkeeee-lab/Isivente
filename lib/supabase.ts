import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
  throw new Error("ERREUR CRITIQUE: NEXT_PUBLIC_SUPABASE_URL est manquante dans Vercel.");
}

if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
  throw new Error("ERREUR CRITIQUE: NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante dans Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Force new build
