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
  // In a real application, you might have server-side checks here,
  // but for this visual component, we'll skip authCheck for simplicity and focus on UI.
  // await authCheck(); // Uncomment and implement authCheck if needed

  return <LoginPageContent />
}

function LoginPageContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <LoginForm />
    </div>
  )
}
