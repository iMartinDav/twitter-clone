// app/login/page.tsx
import { Suspense } from 'react'
import LoginForm from '@/components/LoginForm'
import LoadingState from './LoadingState' // Create this LoadingState component

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginWrapper />
    </Suspense>
  )
}

async function LoginWrapper() {
  return <LoginPageContent />
}

function LoginPageContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <LoginForm />
    </div>
  )
}
