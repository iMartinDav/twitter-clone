'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react'
import type { User, Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  supabaseClient: SupabaseClient<Database> | null
  profile: Database['public']['Tables']['profiles']['Row'] | null // Add this line
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  supabaseClient: null,
  profile: null // Add this line
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClientComponentClient<Database>())
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession)
          setUser(newSession?.user ?? null)
          router.refresh()
        })

        return () => subscription?.unsubscribe()
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [supabase, router, mounted])

  // Add profile fetching in useEffect
  useEffect(() => {
    if (!supabase) return

    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session?.user?.id)
          .single()
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session?.user?.id, supabase])

  const signOut = useCallback(async () => {
    if (!supabase) return
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      // Handle sign-out error, maybe show a toast
    }
  }, [supabase, router])

  const contextValue = useMemo(
    () => ({
      user,
      session,
      loading,
      signOut,
      supabaseClient: supabase,
      profile // Add this line
    }),
    [user, session, loading, signOut, supabase, profile],
  )

  if (!mounted) {
    return null // Prevent hydration issues by not rendering anything on first mount
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading ? children : (
        <div className="flex justify-center p-4">Loading authentication...</div>
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
