-- ============================================================================
-- ISIVENTE SAAS — MIGRATION 001 : ARCHITECTURE MULTI-BOUTIQUES (ZERO REGRESSION)
-- ============================================================================
-- 100% Idempotent : peut être exécuté plusieurs fois sans erreur.
-- Rétrocompatible : toutes les colonnes store_id ajoutées sont NULLABLE afin
-- qu'aucune donnée existante d'Isivente ne soit perdue ou cassée.
-- ============================================================================

-- 1. TABLE PRINCIPALE DES BOUTIQUES (TENANTS)
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country text NOT NULL DEFAULT 'BJ',
  currency text NOT NULL DEFAULT 'FCFA',
  city text NOT NULL DEFAULT 'Cotonou',
  whatsapp_number text NOT NULL DEFAULT '',
  meta_pixel_id text,
  meta_capi_token text,
  accent_color text NOT NULL DEFAULT '#0F172A',
  plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro')),
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);

-- 2. SÉCURITÉ ROW LEVEL SECURITY (RLS) SUR `stores`
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_owner_select" ON public.stores;
CREATE POLICY "store_owner_select"
  ON public.stores FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "store_owner_insert" ON public.stores;
CREATE POLICY "store_owner_insert"
  ON public.stores FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "store_owner_update" ON public.stores;
CREATE POLICY "store_owner_update"
  ON public.stores FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "store_owner_delete" ON public.stores;
CREATE POLICY "store_owner_delete"
  ON public.stores FOR DELETE
  USING (auth.uid() = owner_id);

-- Vue publique sécurisée (expose uniquement les infos vitrine, JAMAIS le token CAPI)
CREATE OR REPLACE VIEW public.public_stores AS
SELECT
  id,
  name,
  slug,
  country,
  currency,
  city,
  whatsapp_number,
  meta_pixel_id,
  accent_color,
  is_active
FROM public.stores
WHERE is_active = true;

GRANT SELECT ON public.public_stores TO anon, authenticated;

-- 3. AJOUT DE `store_id` (NULLABLE) SUR LES TABLES EXISTANTES (ZÉRO RÉGRESSION)
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);

ALTER TABLE IF EXISTS public.leads
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_leads_store_id ON public.leads(store_id);

ALTER TABLE IF EXISTS public.analytics
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_analytics_store_id ON public.analytics(store_id);

-- 4. CRÉATION PROPRE DE LA TABLE `finances` SI NON EXISTANTE (AVEC `store_id`)
CREATE TABLE IF NOT EXISTS public.finances (
  id text PRIMARY KEY,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('expense', 'sale', 'capital')),
  date text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  amount integer NOT NULL DEFAULT 0,
  product_slug text,
  description text,
  order_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finances_store_id ON public.finances(store_id);
CREATE INDEX IF NOT EXISTS idx_finances_date ON public.finances(date DESC);

-- Trigger de mise à jour automatique de `updated_at` sur `stores`
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stores_updated_at ON public.stores;
CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
