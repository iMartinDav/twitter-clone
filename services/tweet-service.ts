// services/tweet-service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import type { Tweet } from '@/types/tweet'

const supabase = createClientComponentClient<Database>()
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL

/**
 * Fetches tweets for the dashboard feed (e.g., 'For You' or 'Following' - currently all tweets).
 *  Does not require a userId as it's intended for the main dashboard feed.
 * @returns {Promise<Tweet[]>} - An array of Tweet objects.
 */
export const fetchDashboardTweets = async (customSupabase = supabase): Promise<Tweet[]> => {
    try {
        const { data, error } = await supabase
            .from('tweets')
            .select('*, user:profiles(full_name, username, avatar_url)')
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }
        return (data as Tweet[]) || []
    } catch (error) {
        console.error('Error fetching tweets for dashboard:', error)
        throw error
    }
}

/**
 * Fetches tweets specifically for a user's profile page.
 * Requires a userId to filter tweets by that user.
 * @param {string} userId - The user ID to fetch tweets for.
 * @returns {Promise<Tweet[]>} - An array of Tweet objects for the specified user.
 */
export const fetchProfileTweets = async (userId: string): Promise<Tweet[]> => {
    try {
        const { data: tweetData, error: tweetError } = await supabase
            .from('tweets')
            .select('*, user:profiles(full_name, username, avatar_url)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (tweetError) {
            throw tweetError
        }
        return (tweetData as Tweet[]) || []
    } catch (error) {
        console.error('Error fetching tweets by user ID for profile:', error)
        throw error // Re-throw to be handled in the component
    }
}

export const insertTweet = async (content: string, userId: string): Promise<Tweet> => {
    try {
        if (!content || !userId) {
            throw new Error('Missing required fields for tweet')
        }

        const { data, error } = await supabase
            .from('tweets')
            .insert([{
                content: content.trim(),
                user_id: userId
            }])
            .select(`
                *,
                user:profiles(full_name, username, avatar_url)
            `)
            .single()

        if (error) {
            console.error('Tweet creation error:', error)
            throw new Error(`Failed to create tweet: ${error.message}`)
        }

        if (!data) {
            throw new Error('No data returned from tweet creation')
        }

        return data as Tweet
    } catch (error) {
        console.error('Error creating tweet:', error)
        throw error instanceof Error ? error : new Error('Failed to create tweet')
    }
}

export const insertReply = async (content: string, replyToTweetId: string, userId: string): Promise<void> => {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) throw new Error('No access token')

        const response = await fetch(`${WORKER_URL}/tweet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ 
                content,
                reply_to: replyToTweetId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error inserting reply:', error)
        throw error
    }
}

export const fetchTweetWithReplies = async (tweetId: string): Promise<Tweet & { replies?: Tweet[] }> => {
    try {
        const [{ data: tweet }, { data: replies }] = await Promise.all([
            supabase
                .from('tweets')
                .select('*, user:profiles(full_name, username, avatar_url)')
                .eq('id', tweetId)
                .single(),
            supabase
                .from('tweets')
                .select('*, user:profiles(full_name, username, avatar_url)')
                .eq('reply_to', tweetId)
                .order('created_at', { ascending: true })
        ]);

        if (!tweet) throw new Error('Tweet not found');

        return {
            ...tweet,
            replies: replies || []
        };
    } catch (error) {
        console.error('Error fetching tweet with replies:', error)
        throw error
    }
}
