// lib/user-hook.ts
import { useSession } from '@supabase/auth-helpers-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

export const useUser = () => {
  const session = useSession()
  const supabaseClient = useSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true)
      if (session) {
        const { data: userDetails, error: userError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session?.user?.id)
          .single()

        if (userError) {
          console.error('Error fetching user details:', userError)
        } else {
          setUser({
            ...session.user,
            user_metadata: { ...session.user.user_metadata, ...userDetails },
          })
        }
      } else {
        setUser(null)
      }
      setIsLoadingUser(false)
    }

    fetchUser()
  }, [session, supabaseClient])

  return { user, isLoadingUser, session }
}
