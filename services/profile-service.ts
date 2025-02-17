// services/profile-service.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type { ProfileRow } from '@/types/supabase';
import { Session } from '@supabase/supabase-js'; // Import Session type

const supabase = createClientComponentClient<Database>();

export const getProfileByUsername = async (username: string): Promise<ProfileRow | null> => {
    try {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (profileError) {
            if (profileError.code === 'PGRST116') {
                return null; // Profile not found (404 equivalent)
            }
            throw profileError;
        }
        return profileData as ProfileRow;
    } catch (error) {
        console.error('Error fetching profile by username:', error);
        throw error; // Re-throw to be handled in the component
    }
};

export const updateProfileData = async (updatedProfile: Partial<ProfileRow>): Promise<ProfileRow | null> => {
    try {
        const { data } = await supabase.auth.getSession(); // Correctly destructure 'data'
        const session = data.session; // Access session from data

        if (!session?.user?.id) { // Now session is properly typed and checked
            throw new Error("No session or user ID found.");
        }

        const { data: updatedData, error } = await supabase
            .from('profiles')
            .update(updatedProfile)
            .eq('user_id', session.user.id)
            .select()
            .single();

        if (error) {
            throw error;
        }
        return updatedData as ProfileRow;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error; // Re-throw to be handled in the component
    }
};

// Explicitly type getSessionData return
export const getSessionData = async (): Promise<{ data: { session: Session | null }; error: Error | null }> => {
    return await supabase.auth.getSession();
};
