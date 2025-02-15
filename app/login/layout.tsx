import '../globals.css'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Login - Your Social App',
  description: 'Login to access your social app and connect with your community.',
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function LoginRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-[#16141D]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
