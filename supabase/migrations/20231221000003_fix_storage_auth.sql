BEGIN;

-- Drop all existing storage policies
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || polname || '" ON storage.objects;', E'\n')
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    );
END $$;

-- Reset bucket configurations
UPDATE storage.buckets SET public = true WHERE id IN ('avatars', 'covers');

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create simplified storage policies
CREATE POLICY "Anyone can read storage objects"
ON storage.objects FOR SELECT
USING (bucket_id IN ('avatars', 'covers'));

CREATE POLICY "Authenticated users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id IN ('avatars', 'covers')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id IN ('avatars', 'covers')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id IN ('avatars', 'covers')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Bucket policies
CREATE POLICY "Allow public bucket access"
ON storage.buckets FOR SELECT
TO public
USING (id IN ('avatars', 'covers'));

-- Grant proper permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

COMMIT;
