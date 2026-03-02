import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../db/hooks/useAuth'

function friendlyError(message: string, mode: 'signin' | 'signup'): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials'))
    return 'Wrong email or password. Please try again.'
  if (lower.includes('email not confirmed'))
    return 'Check your inbox and confirm your email before signing in.'
  if (lower.includes('user already registered') || lower.includes('already been registered'))
    return 'This email is already registered. Try signing in instead.'
  if (lower.includes('password') && lower.includes('at least'))
    return 'Password must be at least 6 characters.'
  if (lower.includes('rate limit') || lower.includes('too many'))
    return 'Too many attempts. Please wait a moment and try again.'
  if (lower.includes('email'))
    return 'Please enter a valid email address.'
  if (lower.includes('network') || lower.includes('fetch'))
    return 'Could not connect. Check your internet and try again.'
  if (mode === 'signin') return 'Could not sign in. Please check your details.'
  return 'Could not create account. Please try again.'
}

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error: authError } = await signUp(email, password)
      if (authError) {
        setError(friendlyError(authError.message, mode))
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } else {
      const { error: authError } = await signIn(email, password)
      if (authError) {
        setError(friendlyError(authError.message, mode))
      }
    }
    setLoading(false)
  }

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-text-primary text-center mb-2 tracking-tight">
          Gym Tracker
        </h1>
        <p className="text-sm text-text-muted text-center mb-8">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </p>

        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex mb-6 bg-[#121212] rounded-lg p-1">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === 'signin'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === 'signup'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {success && (
            <div className="flex items-start gap-2 mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-400 font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-[#121212] border border-border-input rounded-lg px-3 py-2.5 text-base text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full bg-[#121212] border border-border-input rounded-lg px-3 py-2.5 pr-11 text-base text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="h-4.5 w-4.5" />
                    : <Eye className="h-4.5 w-4.5" />
                  }
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-text-muted mt-1.5">Must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white rounded-lg font-bold text-base transition-all disabled:opacity-50"
            >
              {loading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'
              }
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-surface text-text-muted">or</span>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full py-3 bg-[#121212] border border-border-input hover:border-text-muted rounded-lg font-semibold text-sm text-text-primary transition-colors"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
