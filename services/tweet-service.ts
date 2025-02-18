// services/tweet-service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import type { Tweet } from '@/types/tweet'

const supabase = createClientComponentClient<Database>()

/**
 * Fetches tweets for the dashboard feed (e.g., 'For You' or 'Following' - currently all tweets).
 *  Does not require a userId as it's intended for the main dashboard feed.
 * @returns {Promise<Tweet[]>} - An array of Tweet objects.
 */
export const fetchDashboardTweets = async (): Promise<Tweet[]> => {
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

export const insertTweet = async (content: string, userId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('tweets')
            .insert([{ content: content.trim(), user_id: userId }])

        if (error) {
            throw error
        }
    } catch (error) {
        console.error('Error inserting tweet:', error)
        throw error
    }
}
