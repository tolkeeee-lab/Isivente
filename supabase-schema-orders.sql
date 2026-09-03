-- ==============================================================================
-- 📦 CRÉATION DE LA TABLE DES COMMANDES ISIVENTE (Supabase SQL Editor)
-- Copiez et collez ce script dans votre tableau de bord Supabase :
-- https://supabase.com/dashboard/project/biiqpaobegdukcbbskfz/sql/new
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    city TEXT DEFAULT 'Cotonou',
    address TEXT,
    product_slug TEXT NOT NULL,
    product_title TEXT NOT NULL,
    bundle_name TEXT,
    quantity INTEGER DEFAULT 1,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de la sécurité RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Permissions publiques pour insérer, lire et mettre à jour les commandes
CREATE POLICY "Allow public insert to orders" ON public.orders
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow public select on orders" ON public.orders
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public update on orders" ON public.orders
    FOR UPDATE TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public delete on orders" ON public.orders
    FOR DELETE TO anon, authenticated
    USING (true);

-- Activer la réplication Realtime pour les alertes instantanées
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
