-- Configuration Supabase Storage pour le projet OCR Hybride
-- Exécuter ce script dans le SQL Editor de Supabase

-- 1. Créer le bucket de stockage 'documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies pour le bucket 'documents'
-- Permettre à tous de voir les images (public)
CREATE POLICY IF NOT EXISTS "Public read access to documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY IF NOT EXISTS "Users can upload to documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Permettre aux utilisateurs authentifiés de supprimer leurs fichiers
CREATE POLICY IF NOT EXISTS "Users can delete own files from documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
