-- Setup Supabase pour le projet OCR Hybride
-- Exécuter ce script dans le SQL Editor de Supabase

-- 1. Créer le bucket de stockage 'documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- 2. Créer la table 'documents'
CREATE TABLE IF NOT EXISTS documents (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
	file_path TEXT NOT NULL,
	provider TEXT NOT NULL CHECK (provider IN ('mindee', 'mistral')),
	doc_type TEXT NOT NULL CHECK (doc_type IN ('facture', 'cni', 'recette', 'autre')),
	metadata JSONB NOT NULL DEFAULT '{}',
	full_text TEXT,
	status TEXT NOT NULL DEFAULT 'validated' CHECK (status IN ('validated', 'draft')),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer les policies RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Permettre aux utilisateurs authentifiés de voir leurs documents
CREATE POLICY "Users can view own documents"
ON documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Permettre aux utilisateurs authentifiés d'insérer leurs documents
CREATE POLICY "Users can insert own documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Permettre aux utilisateurs authentifiés de modifier leurs documents
CREATE POLICY "Users can update own documents"
ON documents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Permettre aux utilisateurs authentifiés de supprimer leurs documents
CREATE POLICY "Users can delete own documents"
ON documents FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Storage Policies pour le bucket 'documents'
-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Users can upload to documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permettre à tous de voir les images (public)
CREATE POLICY "Public read access to documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Permettre aux utilisateurs authentifiés de supprimer leurs fichiers
CREATE POLICY "Users can delete own files from documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_provider ON documents(provider);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
