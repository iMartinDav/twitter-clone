'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiGoogle, SiApple, SiX, SiGithub, SiDiscord } from 'react-icons/si'
import { LuLoader, LuEye, LuEyeOff } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { z } from 'zod'

// Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

interface LoginFormProps {
  onLoginSuccess: () => void // Define prop for redirect on success
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  // ✅ Accept onLoginSuccess prop
  const [formState, setFormState] = useState({
    isLoading: false,
    showSignUp: false,
    email: '',
    password: '',
    showPassword: false,
    error: null as string | null,
  })

  const [isClient, setIsClient] = useState(false) // Fix hydration error
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true) // Set to true once the component mounts on the client
  }, [])

  // Form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value, error: null }))
  }, [])

  const togglePasswordVisibility = useCallback(() => {
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
  }, [])

  const handleOAuthSignIn = useCallback(
    async (provider: 'google' | 'apple' | 'github' | 'discord') => {
      try {
        setFormState((prev) => ({ ...prev, isLoading: true, error: null }))

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        toast({
          title: '🎉 Success',
          description: `You've successfully signed in with ${provider}. Welcome back!`,
        })
      } catch (error) {
        setFormState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Authentication failed',
        }))
        toast({
          title: '🚨 Error',
          description: 'Failed to sign in. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setFormState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [supabase.auth, toast],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const { showSignUp, email, password } = formState

      try {
        setFormState((prev) => ({ ...prev, isLoading: true, error: null }))
        
        // Validate form inputs
        loginSchema.parse({ email, password })

        // Remove console.log of sensitive data
        const authAction = showSignUp
          ? supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            })
          : supabase.auth.signInWithPassword({ email, password })

        const { error } = await authAction
        if (error) {
          // Only log error message, not the full error object
          console.error('Authentication error:', error.message)
          
          // Handle "User already registered" error
          if (error.message.includes('User already registered')) {
            setFormState((prev) => ({
              ...prev,
              error: 'User already registered. Please log in instead.',
            }))
            toast({
              title: '🚨 Error',
              description: 'User already registered. Please log in instead.',
              variant: 'destructive',
            })
            return
          }

          throw error
        }

        if (!showSignUp) {
          toast({
            title: '🎉 Welcome Back!',
            description: "You've successfully signed in. Redirecting...",
          })
          onLoginSuccess() // ✅ Call onLoginSuccess to trigger redirect in LoginPage
        } else {
          setFormState((prev) => ({ ...prev, showSignUp: false }))
          toast({
            title: '🎉 Account Created',
            description: 'Your account has been created. Please check your email to confirm.',
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
        setFormState((prev) => ({ ...prev, error: errorMessage }))
        toast({
          title: '🚨 Error',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setFormState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [formState, onLoginSuccess, router, supabase.auth, toast], // ✅ Add onLoginSuccess to dependencies
  )

  const handleSignIn = async (formData: FormData) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    })

    if (data.session) {
      router.refresh() // Force a server rerender
      onLoginSuccess?.()
    }
  }

  const toggleSignUp = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      showSignUp: !prev.showSignUp,
      error: null,
    }))
  }, [])

  // Social providers configuration
  const socialProviders = [
    { provider: 'google' as const, icon: <SiGoogle className="h-5 w-5" />, label: 'Google' },
    { provider: 'apple' as const, icon: <SiApple className="h-5 w-5" />, label: 'Apple' },
    { provider: 'github' as const, icon: <SiGithub className="h-5 w-5" />, label: 'GitHub' },
    { provider: 'discord' as const, icon: <SiDiscord className="h-5 w-5" />, label: 'Discord' },
  ]

  if (!isClient) {
    return null // Render nothing on the server
  }

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex relative bg-[#16141D] items-center justify-center p-12">
        <div className="text-center space-y-6">
          <SiX size={120} className="text-[#59F6E8] mx-auto animate-pulse" />
          <h2 className="text-4xl font-bold text-white">Join the conversation.</h2>
          <p className="text-xl text-gray-400 max-w-md mx-auto">
            Connect with your community and share what matters to you.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-8 bg-[#12101A]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-white">
              {formState.showSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-400">
              {formState.showSignUp ? 'Get started today!' : 'Sign in to continue'}
            </p>
          </div>

          {formState.error && (
            <Alert variant="destructive">
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formState.email}
                onChange={handleInputChange}
                required
                className="h-14 rounded-xl bg-[#222222] border-[#333333] focus:border-[#59F6E8] text-white placeholder-gray-500 text-lg px-6"
                aria-label="Email address"
                disabled={formState.isLoading}
              />
              <div className="relative">
                <Input
                  type={formState.showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formState.password}
                  onChange={handleInputChange}
                  required
                  className="h-14 rounded-xl bg-[#222222] border-[#333333] focus:border-[#59F6E8] text-white placeholder-gray-500 text-lg px-6 pr-12"
                  aria-label="Password"
                  disabled={formState.isLoading}
                  minLength={8}
                />
                <Button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  aria-label={formState.showPassword ? 'Hide password' : 'Show password'}
                >
                  {formState.showPassword ? (
                    <LuEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <LuEye className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-xl bg-[#59F6E8] hover:bg-[#4AD1C5] text-black font-semibold text-lg transition-all duration-200"
              disabled={formState.isLoading}
            >
              {formState.isLoading && <LuLoader className="mr-2 h-5 w-5 animate-spin" />}
              {formState.showSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="relative flex items-center gap-4">
            <div className="flex-grow border-t border-[#333333]" />
            <span className="text-gray-400 text-sm">or continue with</span>
            <div className="flex-grow border-t border-[#333333]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {socialProviders.map(({ provider, icon, label }) => (
              <Button
                key={provider}
                onClick={() => handleOAuthSignIn(provider)}
                disabled={formState.isLoading}
                className="h-14 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-white border border-[#333333] hover:border-[#59F6E8] transition-all duration-200"
                aria-label={`Sign in with ${label}`}
              >
                {icon}
                <span className="ml-2">{label}</span>
              </Button>
            ))}
          </div>

          <div className="space-y-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={toggleSignUp}
              className="text-[#59F6E8] hover:text-[#4AD1C5] font-medium"
            >
              {formState.showSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </Button>

            <p className="text-gray-400 text-sm">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-[#59F6E8] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#59F6E8] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
