-- Create tweets table
CREATE TABLE public.tweets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read tweets
CREATE POLICY "Allow all users to read tweets" ON public.tweets
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to create tweets
CREATE POLICY "Allow authenticated users to create tweets" ON public.tweets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to update their own tweets
CREATE POLICY "Allow users to update their own tweets" ON public.tweets
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own tweets
CREATE POLICY "Allow users to delete their own tweets" ON public.tweets
  FOR DELETE USING (auth.uid() = user_id);

