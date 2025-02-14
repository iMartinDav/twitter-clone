import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export const supabase = createClientComponentClient<Database>()

// Helper function to update profile in database
export async function updateProfile(
  userId: string,
  profileData: Partial<Database['public']['Tables']['profiles']['Update']>,
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      // Remove updated_at as it's handled by the database trigger
      updated_at: undefined,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Profile update error:', error)
    throw error
  }

  return data
}

// Helper function to get profile by user ID
export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()

  if (error) {
    throw error
  }

  return data
}
