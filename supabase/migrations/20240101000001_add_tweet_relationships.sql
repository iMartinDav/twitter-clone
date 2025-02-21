
-- Add foreign key constraints
ALTER TABLE tweets
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES tweets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS retweet_id UUID REFERENCES tweets(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tweets_reply_to ON tweets(reply_to);
CREATE INDEX IF NOT EXISTS idx_tweets_retweet_id ON tweets(retweet_id);
