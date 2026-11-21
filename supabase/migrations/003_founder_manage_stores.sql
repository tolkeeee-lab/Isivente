-- ============================================================================
-- ISIVENTE SAAS — MIGRATION 003 : DROITS SUPER-ADMIN FONDATEUR SUR `stores`
-- ============================================================================
-- Permet au compte fondateur (tolkeeee@gmail.com) de voir toutes les boutiques
-- inscrites, de les mettre en pause (is_active = false) tant qu'elles n'ont pas
-- payé, et de les réactiver / changer leur plan en 1 clic.
-- ============================================================================

DROP POLICY IF EXISTS "founder_select_all_stores" ON public.stores;
CREATE POLICY "founder_select_all_stores"
  ON public.stores FOR SELECT
  TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'tolkeeee@gmail.com');

DROP POLICY IF EXISTS "founder_update_all_stores" ON public.stores;
CREATE POLICY "founder_update_all_stores"
  ON public.stores FOR UPDATE
  TO authenticated
  USING (lower(auth.jwt() ->> 'email') = 'tolkeeee@gmail.com')
  WITH CHECK (lower(auth.jwt() ->> 'email') = 'tolkeeee@gmail.com');
