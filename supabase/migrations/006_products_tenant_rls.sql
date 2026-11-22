-- =============================================================================
-- Migration 006 : Durcissement RLS Multi-Tenant sur la table `products`
-- =============================================================================
-- Supprime l'ancienne policy "Allow public select on products" qui avait cmd=ALL
-- (permettant à anon/autres boutiques de modifier ou supprimer un produit) et la
-- remplace par un SELECT public + INSERT/UPDATE/DELETE strictement isolés par store_id.
-- =============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on products" ON public.products;
DROP POLICY IF EXISTS "Les produits sont publics" ON public.products;
DROP POLICY IF EXISTS "products_public_select" ON public.products;
DROP POLICY IF EXISTS "products_tenant_insert" ON public.products;
DROP POLICY IF EXISTS "products_tenant_update" ON public.products;
DROP POLICY IF EXISTS "products_tenant_delete" ON public.products;

-- 1. Lecture publique (nécessaire pour afficher les landing pages /p/[slug])
CREATE POLICY "products_public_select"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Création réservée au propriétaire de la boutique (ou fondateur)
CREATE POLICY "products_tenant_insert"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR (
      store_id IS NOT NULL
      AND store_id IN (
        SELECT id FROM public.stores WHERE owner_id = (select auth.uid())
      )
    )
  );

-- 3. Modification réservée au propriétaire de la boutique (ou fondateur)
CREATE POLICY "products_tenant_update"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    ((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR (
      store_id IS NOT NULL
      AND store_id IN (
        SELECT id FROM public.stores WHERE owner_id = (select auth.uid())
      )
    )
  )
  WITH CHECK (
    ((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR (
      store_id IS NOT NULL
      AND store_id IN (
        SELECT id FROM public.stores WHERE owner_id = (select auth.uid())
      )
    )
  );

-- 4. Suppression réservée au propriétaire de la boutique (ou fondateur)
CREATE POLICY "products_tenant_delete"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (
    ((select auth.jwt()) ->> 'email') = 'tolkeeee@gmail.com'
    OR (
      store_id IS NOT NULL
      AND store_id IN (
        SELECT id FROM public.stores WHERE owner_id = (select auth.uid())
      )
    )
  );
