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

  useEffect(() => {
    const client = createClientComponentClient<Database>()
    setSupabase(client)

    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await client.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_event, newSession) => {
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
  }, [router])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }, [supabase, router])

  const contextValue = useMemo(
    () => ({
      user,
      session,
      loading,
      signOut,
      supabaseClient: supabase,
    }),
    [user, session, loading, signOut, supabase],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading ? (
        children
      ) : (
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
