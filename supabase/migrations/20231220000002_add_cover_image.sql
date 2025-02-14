-- Add cover_url to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Add validation for cover_url
ALTER TABLE profiles
ADD CONSTRAINT valid_cover_url 
CHECK (
    cover_url IS NULL OR 
    cover_url ~ '^https?:\/\/'
);

-- Create cover images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for covers bucket
CREATE POLICY "Cover images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Users can upload covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
