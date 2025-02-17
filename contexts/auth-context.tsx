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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  supabaseClient: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [authError, setAuthError] = useState<Error | null>(null) // State to track auth errors

  useEffect(() => {
    const client = createClientComponentClient<Database>()
    setSupabase(client)

    const initializeAuth = async () => {
      setLoading(true) // Start loading before auth initialization
      setAuthError(null) // Clear any previous auth errors
      try {
        const {
          data: { session: initialSession },
          error,
        } = await client.auth.getSession()

        if (error) {
          console.error('Initial session fetch error:', error)
          setAuthError(error) // Set auth error state
          throw error // Re-throw to be caught in finally block and setLoading(false)
        }

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession)
          setUser(newSession?.user ?? null)
          router.refresh()
        })

        return () => subscription?.unsubscribe() // Optional unsubscribe
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Optionally handle error display to user, or redirect to error page
      } finally {
        setLoading(false) // Ensure loading is set to false even after errors
      }
    }

    initializeAuth()
  }, [router])

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
      authError, // Expose auth error in context
    }),
    [user, session, loading, signOut, supabase, authError],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading ? (
        children
      ) : (
        <div className="flex justify-center p-4">Loading authentication...</div>
      )}
      {authError && ( // Optionally display an error message if auth initialization failed
        <div className="text-red-500 text-center p-2">
          Authentication failed to initialize. Please try again later.
        </div>
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
