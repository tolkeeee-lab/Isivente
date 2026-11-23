-- =============================================================================
-- Migration 007 : Complément de schéma & RLS (Finances, Orders, Leads, Livreurs)
-- =============================================================================
-- Script 100 % idempotent (peut être relancé sans erreur).
-- Comble tous les derniers manques détectés entre le code Isivente et Supabase.
-- =============================================================================

-- 1. TABLE `finances` : colonnes complètes pour les ventes manuelles
ALTER TABLE public.finances
  ADD COLUMN IF NOT EXISTS product_title TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. TABLE `orders` : colonne `notes` (utilisée par /livreur et le suivi commande)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. TABLE `leads` : colonne `customer_email` pour le matching Meta Pixel / relances
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 4. TABLE `delivery_persons` : support multi-boutiques (`store_id`) + policy RLS
ALTER TABLE public.delivery_persons
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_delivery_persons_store_id
  ON public.delivery_persons(store_id);

ALTER TABLE public.delivery_persons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery_persons_tenant_all" ON public.delivery_persons;
CREATE POLICY "delivery_persons_tenant_all"
  ON public.delivery_persons
  FOR ALL
  TO authenticated
  USING (
    lower(((select auth.jwt()) ->> 'email')) = 'tolkeeee@gmail.com'
    OR (
      store_id IS NOT NULL
      AND store_id IN (
        SELECT id FROM public.stores WHERE owner_id = (select auth.uid())
      )
    )
  )
  WITH CHECK (
    lower(((select auth.jwt()) ->> 'email')) = 'tolkeeee@gmail.com'
    OR (
      store_id IS NOT NULL
      AND store_id IN (
        SELECT id FROM public.stores WHERE owner_id = (select auth.uid())
      )
    )
  );
