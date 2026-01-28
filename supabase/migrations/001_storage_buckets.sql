-- ============================================================================
-- Greenfield Dental Command Center - Supabase Storage Buckets Setup
-- Migration: 001_storage_buckets.sql
--
-- Creates storage buckets and Row Level Security (RLS) policies for:
--   - assets   (public)  : library assets such as images, videos, documents
--   - attachments (private) : task attachments and internal files
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Create Storage Buckets
-- --------------------------------------------------------------------------

-- "assets" bucket - publicly accessible, used for library images/videos/docs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  52428800, -- 50 MB in bytes
  NULL      -- allow all MIME types
)
ON CONFLICT (id) DO UPDATE SET
  public          = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- "attachments" bucket - private, used for task attachments and internal files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,
  10485760, -- 10 MB in bytes
  NULL      -- allow all MIME types
)
ON CONFLICT (id) DO UPDATE SET
  public          = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- --------------------------------------------------------------------------
-- 2. RLS Policies for "assets" bucket (public)
-- --------------------------------------------------------------------------

-- SELECT: Anyone can view/download public assets (no auth required)
CREATE POLICY "assets_public_select"
ON storage.objects
FOR SELECT
USING (bucket_id = 'assets');

-- INSERT: Only authenticated users can upload to the assets bucket
CREATE POLICY "assets_authenticated_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- UPDATE: Authenticated users can update only their own uploads
CREATE POLICY "assets_owner_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assets'
  AND (storage.foldername(name))[1] = 'uploads'
  AND owner_id = auth.uid()::text
)
WITH CHECK (bucket_id = 'assets');

-- DELETE: Authenticated users can delete only their own uploads
CREATE POLICY "assets_owner_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'assets'
  AND owner_id = auth.uid()::text
);

-- --------------------------------------------------------------------------
-- 3. RLS Policies for "attachments" bucket (private)
-- --------------------------------------------------------------------------

-- SELECT: Only authenticated users can view attachment files
CREATE POLICY "attachments_authenticated_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'attachments');

-- INSERT: Only authenticated users can upload to the attachments bucket
CREATE POLICY "attachments_authenticated_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- UPDATE: Authenticated users can update only their own uploads
CREATE POLICY "attachments_owner_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND owner_id = auth.uid()::text
)
WITH CHECK (bucket_id = 'attachments');

-- DELETE: Authenticated users can delete only their own uploads
CREATE POLICY "attachments_owner_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND owner_id = auth.uid()::text
);
