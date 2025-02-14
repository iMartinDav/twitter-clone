-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add validation for website URLs (optional)
ALTER TABLE profiles
ADD CONSTRAINT website_url_format 
CHECK (
    website IS NULL OR 
    website ~* '^https?:\/\/([\w\-]+\.)+[\w\-]+(\/[\w\-\.\/?%&=]*)?$'
);

-- Set up RLS policies for the new columns
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
