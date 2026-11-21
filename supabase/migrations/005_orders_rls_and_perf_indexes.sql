-- ============================================================================
-- ISIVENTE SAAS — MIGRATION 005 : RLS STRICT SUR `orders` + INDEX PERFORMANCE
-- ============================================================================
-- 100% Idempotent : supprime les anciennes policies publiques trop ouvertes
-- sur `public.orders`, garde la commande publique (INSERT), protège la lecture/
-- modification par boutique (store_id) + fondateur, et ajoute les index manquants.
-- ============================================================================

-- 1. Nettoyage des 6 anciennes policies permissives sur `public.orders`
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public select" ON public.orders;
DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update" ON public.orders;
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_tenant_select" ON public.orders;
DROP POLICY IF EXISTS "orders_tenant_update" ON public.orders;
DROP POLICY IF EXISTS "orders_tenant_delete" ON public.orders;

-- Tout visiteur peut passer une commande COD (INSERT uniquement)
CREATE POLICY "orders_public_insert"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Seul le vendeur propriétaire (store_id) ou le fondateur peut lire/modifier/supprimer
CREATE POLICY "orders_tenant_select"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = (select auth.uid()))
  );

CREATE POLICY "orders_tenant_update"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (
    lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = (select auth.uid()))
  )
  WITH CHECK (
    lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = (select auth.uid()))
  );

CREATE POLICY "orders_tenant_delete"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (
    lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = (select auth.uid()))
  );

-- 2. RPC dédiées et cloisonnées pour la page /livreur (accès uniquement par order_number exact)
CREATE OR REPLACE FUNCTION public.get_delivery_order(p_order_number text)
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.orders
  WHERE order_number = p_order_number
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_delivery_order(
  p_order_number text,
  p_status text,
  p_notes text
)
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('delivered', 'postponed') THEN
    RAISE EXCEPTION 'Statut livreur non autorisé';
  END IF;

  RETURN QUERY
  UPDATE public.orders
  SET status = p_status,
      notes = p_notes
  WHERE order_number = p_order_number
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_delivery_order(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_delivery_order(text, text, text) TO anon, authenticated;

-- 3. Optimisation performance RLS : `(select auth.uid())` sur `stores` et `finances`
DROP POLICY IF EXISTS "store_owner_select" ON public.stores;
DROP POLICY IF EXISTS "founder_select_all_stores" ON public.stores;
CREATE POLICY "stores_select_policy"
  ON public.stores FOR SELECT
  TO authenticated
  USING (
    owner_id = (select auth.uid())
    OR lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
  );

DROP POLICY IF EXISTS "store_owner_insert" ON public.stores;
CREATE POLICY "store_owner_insert"
  ON public.stores FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "store_owner_update" ON public.stores;
DROP POLICY IF EXISTS "founder_update_all_stores" ON public.stores;
CREATE POLICY "stores_update_policy"
  ON public.stores FOR UPDATE
  TO authenticated
  USING (
    owner_id = (select auth.uid())
    OR lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
  )
  WITH CHECK (
    owner_id = (select auth.uid())
    OR lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
  );

DROP POLICY IF EXISTS "store_owner_delete" ON public.stores;
CREATE POLICY "store_owner_delete"
  ON public.stores FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "finances_tenant_all" ON public.finances;
CREATE POLICY "finances_tenant_all"
  ON public.finances FOR ALL
  TO authenticated
  USING (
    lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = (select auth.uid()))
  )
  WITH CHECK (
    lower((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR store_id IN (SELECT id FROM public.stores WHERE owner_id = (select auth.uid()))
  );

-- 4. Index manquants sur clés étrangères de `public.orders`
CREATE INDEX IF NOT EXISTS idx_orders_product_slug ON public.orders(product_slug);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_person_id ON public.orders(delivery_person_id);
