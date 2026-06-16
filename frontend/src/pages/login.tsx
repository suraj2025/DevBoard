import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '../lib/schema'
import { useAuthStore } from '../store/authStore'
import { login, register } from '../api/auth'

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [serverError, setServerError] = useState('')
  const setAuth = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError('')
    try {
      const { user, token } = await login(data)
      setAuth(user, token)
      navigate('/dashboard')
    } catch (err) {
      setServerError((err as Error).message)
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your DevBoard workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...reg('email')}
            type="email"
            placeholder="dev@devboard.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            {...reg('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {serverError && (
          <p className="text-red-500 text-sm text-center">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-5">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-blue-600 hover:underline font-medium">
          Sign up
        </button>
      </p>
    </div>
  )
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('')
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      setSuccess(true)
      setTimeout(() => onSwitch(), 2000)
    } catch (err) {
      setServerError((err as Error).message)
    }
  }

  if (success) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-lg font-semibold text-gray-900">Account created!</h2>
        <p className="text-sm text-gray-500 mt-1">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
        <p className="text-sm text-gray-500 mt-1">Start tracking your tasks and habits</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            {...reg('name')}
            placeholder="Dev User"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...reg('email')}
            type="email"
            placeholder="dev@devboard.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            {...reg('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            {...reg('confirmPassword')}
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-red-500 text-sm text-center">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-5">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-blue-600 hover:underline font-medium">
          Sign in
        </button>
      </p>
    </div>
  )
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">&lt;/&gt;</span>
        </div>
        <span className="font-semibold text-gray-900 text-lg">DevBoard</span>
      </div>

      {/* Toggle */}
      <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
        <button
          onClick={() => setIsLogin(true)}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
            isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
            !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          Sign up
        </button>
      </div>

      {isLogin
        ? <LoginForm onSwitch={() => setIsLogin(false)} />
        : <RegisterForm onSwitch={() => setIsLogin(true)} />
      }
    </div>
  )
}
