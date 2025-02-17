// app/login/page.tsx
'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import LoadingState from './LoadingState'

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoginForm onLoginSuccess={() => router.replace('/dashboard')} />
    </div>
  )
}
