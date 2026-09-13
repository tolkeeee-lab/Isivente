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

-- ==============================================================================
-- 👥 TABLE DES PROSPECTS & PANIERS ABANDONNÉS (Capture Temps Réel)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    customer_name TEXT DEFAULT 'Client intéressé',
    customer_phone TEXT NOT NULL,
    customer_phone2 TEXT,
    city TEXT DEFAULT 'Cotonou',
    address TEXT,
    product_slug TEXT NOT NULL,
    product_title TEXT NOT NULL,
    bundle_name TEXT,
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'abandoned',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on leads" ON public.leads
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 📊 TABLE DES ANALYTICS (Durée et Présence Réelle)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.analytics (
    session_id TEXT PRIMARY KEY,
    product_slug TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    clicked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on analytics" ON public.analytics
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

