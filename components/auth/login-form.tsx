"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { FiLoader, FiLogIn, FiUserPlus, FiAlertCircle, FiClock, FiUser, FiLock } from "react-icons/fi"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { loginSchema } from "@/lib/validations"
import { ZodError } from "zod"

interface LoginFormProps {
  className?: string
}

export function LoginForm({ className }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSessionExpiredAlert, setShowSessionExpiredAlert] = useState(false)
  const [showSessionErrorAlert, setShowSessionErrorAlert] = useState(false)
  const t = useTranslations("auth.login")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const expired = searchParams.get('expired')
    const error = searchParams.get('error')

    if (expired === 'true') {
      setShowSessionExpiredAlert(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('expired')
      window.history.replaceState({}, '', url.toString())
    }

    if (error === 'session') {
      setShowSessionErrorAlert(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      const validatedData = loginSchema.parse({ username, password })

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: validatedData.username, password: validatedData.password }),
      })

      const result = await response.json()

      if (result.success) {
        router.push('/dashboard')
      } else {
        setErrors({ general: result.error || t('errorInvalidCredentials') })
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const zodErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as string
          zodErrors[fieldName] = issue.message
        })
        setErrors(zodErrors)
      } else {
        setErrors({ general: t('errorUnexpected') })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`w-full max-w-md relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl z-10 ${className}`}>
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
          <FiLogIn className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          {t('title')}
        </CardTitle>
        <CardDescription className="text-white/90">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {showSessionExpiredAlert && (
          <Alert className="bg-orange-500/20 border-orange-500/30 text-orange-200">
            <FiClock className="w-4 h-4" />
            <AlertTitle className="text-orange-100 font-semibold">
              {t('sessionExpired.title')}
            </AlertTitle>
            <AlertDescription className="text-orange-200/90">
              {t('sessionExpired.message')}
            </AlertDescription>
          </Alert>
        )}

        {showSessionErrorAlert && (
          <Alert className="bg-red-500/20 border-red-500/30 text-red-200">
            <FiAlertCircle className="w-4 h-4" />
            <AlertTitle className="text-red-100 font-semibold">
              {t('sessionError.title')}
            </AlertTitle>
            <AlertDescription className="text-red-200/90">
              {t('sessionError.message')}
            </AlertDescription>
          </Alert>
        )}

        {errors.general && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-white/90">
              {t('username')}
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                id="username"
                type="text"
                placeholder={t('usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 transition-all duration-200 text-white placeholder:text-white/60 ${
                  errors.username ? 'border-red-400 focus:border-red-400' : ''
                }`}
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <p className="text-red-300 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white/90">
              {t('password')}
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 transition-all duration-200 text-white placeholder:text-white/60 ${
                  errors.password ? 'border-red-400 focus:border-red-400' : ''
                }`}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            {errors.password && (
              <p className="text-red-300 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                {t('loading')}
              </>
            ) : (
              t('action')
            )}
          </Button>
        </form>

        <div className="space-y-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-orange-300 hover:text-orange-200 transition-colors duration-200 hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <div className="text-center">
            <span className="text-sm text-white/80">
              {t('dontHaveAccount')}
            </span>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1 text-sm font-medium text-orange-300 hover:text-orange-200 transition-colors duration-200 hover:underline ml-2"
            >
              <FiUserPlus className="w-4 h-4" />
              {t('register')}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
