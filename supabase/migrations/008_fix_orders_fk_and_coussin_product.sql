-- =============================================================================
-- Migration 008 : Correction critique FK `orders_product_slug_fkey` + `coussin-masseur`
-- =============================================================================
-- Cause racine : depuis la migration 006 (RLS strict sur `products`), un client anonyme
-- ne peut plus auto-insérer un slug manquant dans `products`. Si un nouveau produit du
-- catalogue statique (ex: `coussin-masseur`) n'a pas encore de ligne dans `products`,
-- la clé étrangère `orders_product_slug_fkey` rejette la commande (erreur 23503) et bloque
-- l'enregistrement + la notification.
--
-- Solution définitive :
-- 1. Supprimer la contrainte `orders_product_slug_fkey` sur `orders` (une commande client
--    ne doit JAMAIS être rejetée par PostgreSQL).
-- 2. Enregistrer `coussin-masseur` dans `public.products`.
-- 3. Rétablir la commande d'Elie Salako (16 900 FCFA, Cotonou) dans `public.orders`.
-- =============================================================================

-- 1. Supprimer la clé étrangère bloquante sur orders.product_slug
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_product_slug_fkey;

-- 2. Ajouter `coussin-masseur` dans `public.products`
INSERT INTO public.products (slug, title, headline, description, price, original_price, currency, is_active)
VALUES (
  'coussin-masseur',
  'Coussin Masseur Shiatsu Chauffant 4 Têtes™ — Maison & Voiture',
  'Soulagez nuque, dos et jambes en 15 minutes avec 4 têtes rotatives chauffantes et double alimentation maison + voiture 12V.',
  'Coussin Masseur Shiatsu Chauffant 4 Têtes™ livré complet avec adaptateur maison secteur + allume-cigare voiture 12V et sangle élastique.',
  16900,
  28000,
  'FCFA',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  is_active = true;

-- 3. Rétablir la commande d'Elie Salako dans `public.orders` si absente
INSERT INTO public.orders (
  order_number,
  customer_name,
  customer_phone,
  city,
  address,
  product_slug,
  product_title,
  bundle_name,
  quantity,
  total_amount,
  status,
  created_at
)
SELECT
  'CMD-917003',
  'Elie Salako',
  '0191700322',
  'Cotonou',
  'Cotonou',
  'coussin-masseur',
  'Coussin Masseur Shiatsu Chauffant 4 Têtes™',
  'Coussin Masseur Shiatsu Chauffant 4 Têtes™',
  1,
  16900,
  'pending',
  '2026-11-24T17:13:13.462Z'
WHERE NOT EXISTS (
  SELECT 1 FROM public.orders
  WHERE customer_phone = '0191700322' AND product_slug = 'coussin-masseur'
);
