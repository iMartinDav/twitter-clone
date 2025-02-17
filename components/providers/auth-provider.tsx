'use client' // Important: Mark as Client Component

import { AuthProvider } from '@/contexts/auth-context' // Adjust path

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {' '}
      {/* AuthProvider is now correctly used within a Client Component */}
      {children}
    </AuthProvider>
  )
}
