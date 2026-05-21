"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { FiMail, FiUserPlus, FiLoader, FiLock, FiUser } from "react-icons/fi"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { registerSchema } from "@/lib/validations"
import { ZodError } from "zod"

interface RegisterFormProps {
  className?: string
}

export function RegisterForm({ className }: RegisterFormProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const router = useRouter()
  const t = useTranslations("auth.register")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setShowSuccessAlert(false)
    setIsLoading(true)

    try {
      if (password !== passwordConfirm) {
        setErrors({ passwordConfirm: t('errors.passwordMismatch') })
        setIsLoading(false)
        return
      }

      const validatedData = registerSchema.parse({ username, email, password })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: validatedData.username,
          email: validatedData.email,
          password: validatedData.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setShowSuccessAlert(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        const isGenericValidationError =
          result.error?.includes('Invalid input data') ||
          result.error?.includes('Invalid data provided')

        if (isGenericValidationError) {
          registerSchema.parse({ username, email, password })
        } else if (result.error) {
          setErrors({ general: result.error })
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const zodErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as string
          let msg = issue.message
          if (msg === 'USERNAME_MIN_LENGTH') msg = t('errors.usernameMinLength')
          else if (msg === 'USERNAME_MAX_LENGTH') msg = t('errors.usernameMaxLength')
          else if (msg === 'PASSWORD_MIN_LENGTH') msg = t('errors.passwordMinLength')
          else if (msg === 'PASSWORD_STRENGTH') msg = t('errors.passwordStrength')
          zodErrors[fieldName] = msg
        })
        setErrors(zodErrors)
      } else {
        setErrors({ general: 'Erro inesperado. Tente novamente.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`w-full max-w-md relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl z-10 ${className}`}>
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
          <FiUserPlus className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          {t('title')}
        </CardTitle>
        <CardDescription className="text-white/90">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {showSuccessAlert && (
          <Alert className="bg-green-500/20 border-green-500/30 text-green-200">
            <AlertTitle className="text-green-100 font-semibold">
              {t('welcomeAlert.title')}
            </AlertTitle>
            <AlertDescription className="text-green-200/90">
              {t('welcomeAlert.message')}
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
            <label htmlFor="email" className="text-sm font-medium text-white/90">
              {t('email')}
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 transition-all duration-200 text-white placeholder:text-white/60 ${
                  errors.email ? 'border-red-400 focus:border-red-400' : ''
                }`}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-300 text-xs mt-1">{errors.email}</p>
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
                autoComplete="new-password"
              />
            </div>
            {errors.password && (
              <p className="text-red-300 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="passwordConfirm" className="text-sm font-medium text-white/90">
              {t('passwordConfirm')}
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                id="passwordConfirm"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={`pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 transition-all duration-200 text-white placeholder:text-white/60 ${
                  errors.passwordConfirm ? 'border-red-400 focus:border-red-400' : ''
                }`}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
            {errors.passwordConfirm && (
              <p className="text-red-300 text-xs mt-1">{errors.passwordConfirm}</p>
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
                {t('action')}...
              </>
            ) : (
              t('action')
            )}
          </Button>
        </form>

        <div className="space-y-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <span className="text-sm text-white/80">
              {t('alreadyHaveAccount')}
            </span>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 text-sm font-medium text-orange-300 hover:text-orange-200 transition-colors duration-200 hover:underline ml-2"
            >
              <FiLock className="w-4 h-4" />
              {t('login')}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
