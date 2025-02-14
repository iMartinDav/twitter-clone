BEGIN;

-- First, drop ALL existing policies to ensure clean slate
DO $$ 
BEGIN
    -- Drop all storage.objects policies
    DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload covers" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own covers" ON storage.objects;
    DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
    DROP POLICY IF EXISTS "Give public access to avatar and cover images" ON storage.objects;

    -- Drop all profiles policies
    DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
END $$;

-- Enable RLS and ensure buckets exist
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create consolidated storage policies
CREATE POLICY "Storage items are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('avatars', 'covers'));

CREATE POLICY "Authenticated users can manage their own storage items"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id IN ('avatars', 'covers')
    AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id IN ('avatars', 'covers')
    AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Create consolidated profile policies
CREATE POLICY "Profiles are publicly viewable"
ON profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage their own profile"
ON profiles FOR ALL
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Set up storage bucket access
CREATE POLICY "Public bucket access"
ON storage.buckets FOR SELECT
TO public
USING (id IN ('avatars', 'covers'));

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON profiles TO authenticated;

COMMIT;
