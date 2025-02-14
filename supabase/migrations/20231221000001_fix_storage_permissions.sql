-- Start transaction
BEGIN;

-- First ensure buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Reset all storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Storage items are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage their own storage items" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new simplified storage policies
CREATE POLICY "Allow public viewing of storage objects"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id IN ('avatars', 'covers')
);

CREATE POLICY "Allow authenticated users to insert storage objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('avatars', 'covers')
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow authenticated users to update their storage objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('avatars', 'covers')
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow authenticated users to delete their storage objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('avatars', 'covers')
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Reset bucket policies
DROP POLICY IF EXISTS "Allow public bucket access" ON storage.buckets;

-- Create new bucket policy
CREATE POLICY "Allow bucket access"
ON storage.buckets FOR SELECT
TO public
USING (
  id IN ('avatars', 'covers')
);

-- Ensure proper permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA storage
GRANT ALL ON TABLES TO authenticated;

GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Reset profiles policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create new profile policies
CREATE POLICY "Allow public profile viewing"
ON profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow profile updates"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

COMMIT;
