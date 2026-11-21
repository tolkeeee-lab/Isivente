-- ============================================================================
-- ISIVENTE SAAS — MIGRATION 002 : BUCKET SUPABASE STORAGE `product-images`
-- ============================================================================
-- Permet aux vendeurs connectés d'importer directement les photos de leurs
-- produits depuis leur téléphone ou PC (compression auto < 100 Ko côté client).
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Lecture publique des photos produits (pour afficher les pages /p/[slug])
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Upload réservé aux vendeurs authentifiés
DROP POLICY IF EXISTS "auth_upload_product_images" ON storage.objects;
CREATE POLICY "auth_upload_product_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Mise à jour / suppression réservée aux vendeurs authentifiés
DROP POLICY IF EXISTS "auth_delete_product_images" ON storage.objects;
CREATE POLICY "auth_delete_product_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
