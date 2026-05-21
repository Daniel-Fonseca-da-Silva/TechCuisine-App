"use client"

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SettingsSkeleton } from "@/components/features/settings/settings-skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FiSettings, FiBell, FiGlobe, FiSave } from "react-icons/fi"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { useLocale } from '@/hooks/use-locale'
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from 'next/navigation'
import { languageOptions, getLanguageOption } from '@/lib/shared/language-flag'
import { primaryLocaleFromPreferences } from '@/lib/shared/user-locale'
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"

interface SettingsSectionProps {
  onSectionChange?: (section: string) => void
}
const CURRENCY_OPTIONS = ['EUR', 'USD', 'GBP', 'BRL']
const DATE_FORMAT_OPTIONS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']

export function SettingsSection({ onSectionChange }: SettingsSectionProps) {
  const t = useTranslations('settings')
  const { locale, changeLocale } = useLocale()
  const router = useRouter()

  const changeLocaleRef = useRef(changeLocale)
  const localeRef = useRef(locale)
  useEffect(() => {
    changeLocaleRef.current = changeLocale
    localeRef.current = locale
  }, [changeLocale, locale])

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const initialLoadDone = useRef(false)

  const [formData, setFormData] = useState({
    language: 'en',
    email_notifications: true,
    temperature_unit: 'celsius',
    currency: 'EUR',
    date_format: 'DD/MM/YYYY',
    decimal_separator: ',',
  })

  const handleBackToDashboard = () => {
    if (onSectionChange) {
      onSectionChange('dashboard')
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSaveSuccess(false)

      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: [formData.language],
          email_notifications: formData.email_notifications,
          temperature_unit: formData.temperature_unit,
          currency: formData.currency,
          date_format: formData.date_format,
          decimal_separator: formData.decimal_separator,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to save preferences')
      }

      setSaveSuccess(true)

      if (formData.language !== localeRef.current) {
        changeLocaleRef.current(formData.language)
      }

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error saving preferences'
      setError(msg)
      setErrorDialogOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true)
      const response = await fetch('/api/configuration', { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to delete account')
      }
      router.push('/auth/login')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error deleting account'
      setError(msg)
      setErrorDialogOpen(true)
    } finally {
      setIsDeletingAccount(false)
      setDeleteAccountDialogOpen(false)
    }
  }

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/preferences', { cache: 'no-store' })
      const body = await res.json()
      if (!res.ok || !body?.success) {
        throw new Error(body?.error || 'Failed to load preferences')
      }

      const primaryLanguage = primaryLocaleFromPreferences(body.data?.language ?? [])

      setFormData({
        language: primaryLanguage,
        email_notifications: body.data?.email_notifications ?? true,
        temperature_unit: body.data?.temperature_unit ?? 'celsius',
        currency: body.data?.currency ?? 'EUR',
        date_format: body.data?.date_format ?? 'DD/MM/YYYY',
        decimal_separator: body.data?.decimal_separator ?? ',',
      })

      if (!initialLoadDone.current) {
        initialLoadDone.current = true
        if (primaryLanguage !== localeRef.current) {
          changeLocaleRef.current(primaryLanguage)
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error'
      setError(msg)
      setErrorDialogOpen(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  if (loading) {
    return <SettingsSkeleton />
  }

  return (
    <>
      <ErrorNoticeDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        description={error ?? ''}
        onRetry={loading ? undefined : fetchPreferences}
      />
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
              <FiSettings className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-white">{t('header.title')}</h1>
              <p className="text-white/70 text-sm lg:text-base hidden sm:block">{t('header.subtitle')}</p>
            </div>
          </div>
          {onSectionChange && (
            <SectionBackButton onClick={handleBackToDashboard} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

          {/* Notifications */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <FiBell className="w-5 h-5" />
                <span>{t('notifications.title')}</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                {t('notifications.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{t('notifications.options.newsletter.title')}</p>
                  <p className="text-white/60 text-sm">{t('notifications.options.newsletter.description')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.email_notifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, email_notifications: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-red-400"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <FiGlobe className="w-5 h-5" />
                <span>{t('appearance.title')}</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                {t('appearance.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('appearance.options.language.label')}</label>
                <Select value={formData.language} onValueChange={(v) => setFormData(prev => ({ ...prev, language: v }))}>
                  <SelectTrigger className="w-full bg-white/20 border-white/30 text-white hover:text-white/80 focus:ring-white/50">
                    <SelectValue placeholder={t('appearance.options.language.label')}>
                      {getLanguageOption(formData.language) && (() => {
                        const option = getLanguageOption(formData.language)!
                        const FlagComponent = option.flag
                        return (
                          <div className="flex items-center gap-2">
                            <FlagComponent className="w-4 h-4" title={option.name} />
                            <span>{t(`appearance.options.language.options.${option.code}`)}</span>
                          </div>
                        )
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20 text-white">
                    {languageOptions.map((option) => {
                      const FlagComponent = option.flag
                      return (
                        <SelectItem key={option.code} value={option.code} className="focus:bg-white/10 focus:text-white">
                          <div className="flex items-center gap-2">
                            <FlagComponent className="w-4 h-4" title={option.name} />
                            <span>{t(`appearance.options.language.options.${option.code}`)}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Regional */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <FiSettings className="w-5 h-5" />
                <span>{t('regional.title')}</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                {t('regional.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">{t('regional.options.temperatureUnit.label')}</label>
                  <Select value={formData.temperature_unit} onValueChange={(v) => setFormData(prev => ({ ...prev, temperature_unit: v }))}>
                    <SelectTrigger className="w-full bg-white/20 border-white/30 text-white hover:text-white/80 focus:ring-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 text-white">
                      <SelectItem value="celsius" className="focus:bg-white/10 focus:text-white">{t('regional.options.temperatureUnit.celsius')}</SelectItem>
                      <SelectItem value="fahrenheit" className="focus:bg-white/10 focus:text-white">{t('regional.options.temperatureUnit.fahrenheit')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">{t('regional.options.currency.label')}</label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}>
                    <SelectTrigger className="w-full bg-white/20 border-white/30 text-white hover:text-white/80 focus:ring-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 text-white">
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c} className="focus:bg-white/10 focus:text-white">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">{t('regional.options.dateFormat.label')}</label>
                  <Select value={formData.date_format} onValueChange={(v) => setFormData(prev => ({ ...prev, date_format: v }))}>
                    <SelectTrigger className="w-full bg-white/20 border-white/30 text-white hover:text-white/80 focus:ring-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 text-white">
                      {DATE_FORMAT_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f} className="focus:bg-white/10 focus:text-white">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">{t('regional.options.decimalSeparator.label')}</label>
                  <Select value={formData.decimal_separator} onValueChange={(v) => setFormData(prev => ({ ...prev, decimal_separator: v }))}>
                    <SelectTrigger className="w-full bg-white/20 border-white/30 text-white hover:text-white/80 focus:ring-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 text-white">
                      <SelectItem value="," className="focus:bg-white/10 focus:text-white">{t('regional.options.decimalSeparator.comma')}</SelectItem>
                      <SelectItem value="." className="focus:bg-white/10 focus:text-white">{t('regional.options.decimalSeparator.period')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="space-y-3 pt-2">
                {saveSuccess && (
                  <div className="text-green-400 text-sm font-medium">
                    {t('appearance.saveSuccess')}
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('appearance.saving')}
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4 mr-2" />
                      {t('appearance.saveButton')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
        <div className="flex justify-center mt-8">
          <Button
            variant="ghost"
            onClick={() => setDeleteAccountDialogOpen(true)}
            className="text-sm text-white/45 hover:text-white/70 hover:bg-transparent"
          >
            {t('dangerZone.discreetTrigger')}
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('dangerZone.dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {t('dangerZone.dialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeletingAccount}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              {t('dangerZone.dialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingAccount ? t('dangerZone.dialog.deleting') : t('dangerZone.dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
