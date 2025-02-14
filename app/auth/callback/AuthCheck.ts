'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Función que verifica autenticación antes de renderizar la página
export async function authCheck() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect('/')
    }
  } catch (error) {
    console.error('Auth check failed:', error)
  }
}
