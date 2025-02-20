// app/login/page.tsx
'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.replace('/')
      }
    }

    checkSession()
  }, [supabase, router])

  const handleLoginSuccess = () => {
    // Force a hard reload to ensure layout re-renders properly
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  )
}
