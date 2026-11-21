-- ============================================================================
-- ISIVENTE SAAS — MIGRATION 004 : DURCISSEMENT SÉCURITÉ & RLS FINANCES
-- ============================================================================

-- 1. Policies RLS strictes multi-tenant sur `public.finances`
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "finances_tenant_all" ON public.finances;
CREATE POLICY "finances_tenant_all"
  ON public.finances
  FOR ALL
  TO authenticated
  USING (
    lower(auth.jwt() ->> 'email') = 'tolkeeee@gmail.com'
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    lower(auth.jwt() ->> 'email') = 'tolkeeee@gmail.com'
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  );

-- 2. Verrouiller le search_path de `public.set_updated_at`
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Révoquer l'exécution publique sur `public.rls_auto_enable()`
DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public;
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;
