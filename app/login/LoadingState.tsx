// app/login/LoadingState.tsx (Create this file)
import { LuLoader } from 'react-icons/lu'

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <LuLoader className="animate-spin h-10 w-10 text-white" />
      <p className="mt-2">Loading...</p>
    </div>
  )
}

export default LoadingState
