import { supabase } from '@/lib/supabase'

export class AuthService {
  static async validateSession() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      throw new Error('Authentication error: Unable to validate session')
    }

    if (!session) {
      throw new Error('UNAUTHENTICATED')
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('UNAUTHENTICATED')
    }

    // Check session expiration
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000)
      if (expiresAt < new Date()) {
        await supabase.auth.refreshSession()
        const {
          data: { session: refreshedSession },
        } = await supabase.auth.getSession()
        if (!refreshedSession) {
          throw new Error('SESSION_EXPIRED')
        }
      }
    }

    return { session, user }
  }

  static async refreshToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession()
    if (error || !session) {
      throw new Error('Failed to refresh session')
    }
    return session
  }
}
