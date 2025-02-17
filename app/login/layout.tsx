import '../globals.css' // Consider if you need globals.css here or only in root layout
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'X Bio - It’s what’s happening / Login X Bio',
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
  return <div className={`${inter.className} h-full bg-[#16141D] text-white`}>{children}</div>
}
