'use client'

import { AuthProvider } from '@/contexts/auth-context'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
