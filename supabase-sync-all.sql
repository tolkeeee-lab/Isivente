-- ==============================================================================
-- 🚀 SYNCHRONISATION COMPLÈTE DU PROJET SUPABASE ISIVENTE
-- À exécuter dans votre tableau de bord Supabase :
-- https://supabase.com/dashboard/project/uelognqedzqtvupwzejh/sql/new
-- ==============================================================================

-- 1. Nettoyage définitif des commandes de test
DELETE FROM public.orders WHERE order_number IN ('CMD-698659', 'CMD-840009') OR customer_phone = '97000000';

-- 2. Activation des permissions pour la table ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
CREATE POLICY "Allow public insert to orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public delete on orders" ON public.orders;
CREATE POLICY "Allow public delete on orders" ON public.orders FOR DELETE TO anon, authenticated USING (true);

-- 3. Activation des permissions pour la table PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on products" ON public.products;
CREATE POLICY "Allow public select on products" ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public insert on products" ON public.products;
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on products" ON public.products;
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public delete on products" ON public.products;
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE TO anon, authenticated USING (true);

-- 4. Insertion des 4 Produits Isivente dans la table PRODUCTS
INSERT INTO public.products (slug, title, headline, description, price, original_price, currency, images, bundles, is_active)
VALUES 
  (
    'umei',
    'Brosse Démêlante Vapeur Uméi 3-en-1',
    'La première brosse démêlante à vapeur qui libère tes cheveux d''un simple clic.',
    'Sur une brosse classique, retirer les cheveux coincés prend souvent plus de temps que le coiffage lui-même. Le mécanisme à dégagement automatique d''uméi règle ça en une seconde.',
    14900,
    20000,
    'FCFA',
    '[{"url": "/images/umei-hero-real.jpg"}]'::jsonb,
    '[{"name": "Pack Découverte (1 Brosse)", "price": 14900}, {"name": "Pack Sérénité Duo (2 Brosses)", "price": 24900}, {"name": "Pack Famille (3 Brosses)", "price": 34900}]'::jsonb,
    true
  ),
  (
    'eraclean',
    'Purificateur d''Air & Anti-Odeurs Frigo EraClean™',
    'Élimine 99.9% des odeurs et bactéries dans votre réfrigérateur, penderie et voiture sans produit chimique.',
    'Technologie d''oxydation active et d''ions négatifs. Double mode désodorisation profonde et fraîcheur longue durée 30 jours sur batterie rechargeable USB.',
    19900,
    25000,
    'FCFA',
    '[{"url": "/images/eraclean-studio.jpg"}]'::jsonb,
    '[{"name": "Pack Solo (1 Appareil)", "price": 19900}, {"name": "Pack Duo Frigo + WC (2 Appareils)", "price": 32900}, {"name": "Pack Grand Ménage (3 Appareils)", "price": 44900}]'::jsonb,
    true
  ),
  (
    'turbofan',
    'Ventilateur Ceinture & Powerbank TurboFan™ Max',
    'Fraîcheur glaciale sous vos vêtements et batterie de secours 10 000 mAh.',
    'Moteur brushless ultra-puissant à 5 vitesses, double clip de fixation ceinture et cordon tour de cou mains-libres avec sortie USB charge rapide.',
    16900,
    22000,
    'FCFA',
    '[{"url": "/images/turbofan-studio.jpg"}]'::jsonb,
    '[{"name": "Pack Solo Fraîcheur (1 TurboFan)", "price": 16900}, {"name": "Pack Duo (2 TurboFans)", "price": 27900}, {"name": "Pack Famille / Chantier (3 TurboFans)", "price": 37900}]'::jsonb,
    true
  ),
  (
    'peeler',
    'Éplucheur Automatique ChefPeel™ Pro',
    'L''épluchage automatique pour ail, pommes de terre, pommes et oignons en quelques secondes.',
    'Lames en acier inoxydable et bol rotatif électrique 1300 mAh rechargeable par USB. Idéal pour gagner un temps précieux en cuisine.',
    14900,
    20000,
    'FCFA',
    '[{"url": "/images/peeler-hero.jpg"}]'::jsonb,
    '[{"name": "Pack Découverte Cuisine (1 Appareil)", "price": 14900}, {"name": "Pack Duo Sérénité (2 Appareils)", "price": 24900}, {"name": "Pack Traiteur / Famille (3 Appareils)", "price": 34900}]'::jsonb,
    true
  )
ON CONFLICT (slug) 
DO UPDATE SET
  title = EXCLUDED.title,
  headline = EXCLUDED.headline,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  currency = EXCLUDED.currency,
  images = EXCLUDED.images,
  bundles = EXCLUDED.bundles,
  is_active = EXCLUDED.is_active;

-- 5. Activer le Realtime pour les alertes instantanées
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
