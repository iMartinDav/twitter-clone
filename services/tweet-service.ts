// services/tweet-service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type { Tweet } from '@/types/tweet';

const supabase = createClientComponentClient<Database>();

export const getTweetsByUserId = async (userId: string): Promise<Tweet[]> => {
    try {
        const { data: tweetData, error: tweetError } = await supabase
            .from('tweets')
            .select('*, user:profiles(full_name, username, avatar_url)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (tweetError) {
            throw tweetError;
        }
        return (tweetData as Tweet[]) || [];
    } catch (error) {
        console.error('Error fetching tweets by user ID:', error);
        throw error; // Re-throw to be handled in the component
    }
};
