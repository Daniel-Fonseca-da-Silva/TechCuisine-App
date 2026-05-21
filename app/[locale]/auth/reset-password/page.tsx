"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FiLock, FiArrowLeft, FiLoader } from "react-icons/fi"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { resetPasswordSchema } from "@/lib/validations"
import { ZodError } from "zod"

function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword")
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  function resolveError(code: string): string {
    if (code === "PASSWORD_MIN_LENGTH") return t("errors.passwordMinLength")
    if (code === "PASSWORD_STRENGTH") return t("errors.passwordStrength")
    if (code === "PASSWORD_MISMATCH") return t("errors.passwordMismatch")
    return code
  }

  async function handleSubmit(formData: FormData) {
    setErrors({})

    if (!token) {
      setErrors({ general: t("errors.missingToken") })
      return
    }

    const new_password = formData.get("new_password") as string
    const confirm_password = formData.get("confirm_password") as string

    try {
      resetPasswordSchema.parse({ new_password, confirm_password })
    } catch (error) {
      if (error instanceof ZodError) {
        const zodErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string
          zodErrors[field] = resolveError(issue.message)
        })
        setErrors(zodErrors)
      }
      return
    }

    setPending(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push("/auth/login"), 3000)
      } else {
        const detail: string = data.error || ""
        if (detail.toLowerCase().includes("expired")) {
          setErrors({ general: t("errors.expiredToken") })
        } else if (detail.toLowerCase().includes("invalid") || response.status === 400) {
          setErrors({ general: t("errors.invalidToken") })
        } else {
          setErrors({ general: t("errors.general") })
        }
      }
    } catch {
      setErrors({ general: t("errors.general") })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative flex items-center justify-center p-4 pt-24 pb-16 min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-lime-800" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-xl" />
          <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl" />
        </div>

        <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl z-10">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <FiLock className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {t("title")}
            </CardTitle>
            <CardDescription className="text-white/90">{t("subtitle")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {success && (
              <Alert className="bg-green-500/20 border-green-500/30 text-green-200">
                <AlertTitle className="text-green-100 font-semibold">{t("success.title")}</AlertTitle>
                <AlertDescription className="text-green-200/90">{t("success.message")}</AlertDescription>
              </Alert>
            )}

            {errors.general && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{errors.general}</p>
              </div>
            )}

            {!success && (
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="new_password" className="text-sm font-medium text-white/90">
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      id="new_password"
                      name="new_password"
                      type="password"
                      placeholder={t("newPasswordPlaceholder")}
                      className={`pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 transition-all duration-200 text-white placeholder:text-white/60 ${
                        errors.new_password ? "border-red-400 focus:border-red-400" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.new_password && (
                    <p className="text-red-300 text-xs mt-1">{errors.new_password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm_password" className="text-sm font-medium text-white/90">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      placeholder={t("confirmPasswordPlaceholder")}
                      className={`pl-10 bg-white/20 border-white/30 backdrop-blur-sm focus:bg-white/30 transition-all duration-200 text-white placeholder:text-white/60 ${
                        errors.confirm_password ? "border-red-400 focus:border-red-400" : ""
                      }`}
                      required
                    />
                  </div>
                  {errors.confirm_password && (
                    <p className="text-red-300 text-xs mt-1">{errors.confirm_password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {pending ? (
                    <>
                      <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                      {t("loading")}
                    </>
                  ) : (
                    t("action")
                  )}
                </Button>
              </form>
            )}

            <div className="text-center pt-4 border-t border-white/20">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-orange-300 hover:text-orange-200 transition-colors duration-200 hover:underline"
              >
                <FiArrowLeft className="w-4 h-4" />
                {t("backToLogin")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
