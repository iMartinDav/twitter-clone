BEGIN;

-- Drop all existing policies to start fresh
DO $$ 
BEGIN
    -- Drop storage policies
    DROP POLICY IF EXISTS "Allow public viewing of storage objects" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to insert storage objects" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to update their storage objects" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to delete their storage objects" ON storage.objects;
    DROP POLICY IF EXISTS "Allow bucket access" ON storage.buckets;
    
    -- Drop any other existing policies
    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
END $$;

-- Reset bucket configurations
UPDATE storage.buckets
SET public = true
WHERE id IN ('avatars', 'covers');

-- Make sure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Bucket access policy (more permissive)
CREATE POLICY "Enable read access for all users"
ON storage.buckets FOR SELECT
USING (true);

-- Storage access policies
CREATE POLICY "Give access to own folder"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id IN ('avatars', 'covers')
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('avatars', 'covers'));

-- Ensure proper bucket access
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES
    ('avatars', 'avatars', true, false, 5242880, 
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]),
    ('covers', 'covers', true, false, 5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE
SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Ensure authenticated users have proper permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO service_role;

COMMIT;
