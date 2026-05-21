"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ProfileSkeleton } from "@/components/features/profile/profile-skeleton"
import { FiUser, FiMail, FiSave, FiCamera } from "react-icons/fi"
import { SectionBackButton } from "@/components/features/shared/section-back-button"
import { useTranslations } from "next-intl"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { useUserData } from "@/hooks/use-user-data"
import { ErrorNoticeDialog } from "@/components/features/shared/error-notice-dialog"
import type { GenderType, NationalityType, EmploymentStatus } from "@/types/configuration"

interface ProfileSectionProps {
  onSectionChange?: (section: string) => void
  onUserDataRefetch?: () => void
}

export function ProfileSection({ onSectionChange, onUserDataRefetch }: ProfileSectionProps) {
  const t = useTranslations('profileSection')
  const { user, configuration, isLoading, isInitialLoading, error, updateUser, upsertConfiguration, refetch } = useUserData()
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastUploadedUrlRef = useRef<string | null>(null)
  const [employmentValue, setEmploymentValue] = useState<EmploymentStatus | "">("")
  const [genderValue, setGenderValue] = useState<GenderType>("male")
  const [migrationValue, setMigrationValue] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  const [accountForm, setAccountForm] = useState({ username: '', email: '' })
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    profession: '',
    nationality: '' as NationalityType | '',
    years_of_experience: '',
    culinary_specialties: '',
    kitchen_role: '',
    establishment_type: '',
    current_salary: '',
  })

  const handleBackToDashboard = () => {
    if (onSectionChange) onSectionChange('dashboard')
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select only image files (JPEG, PNG, GIF, WebP)')
      return
    }

    const maxSize = 1 * 1024 * 1024
    if (file.size > maxSize) {
      alert('The file must be less than 1MB')
      return
    }

    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const response = await fetch('/api/upload/profile', { method: 'POST', body: fd })
      const body = await response.json()
      if (!response.ok || body?.success === false || !body?.url) {
        throw new Error(body?.error || 'Upload failed')
      }
      lastUploadedUrlRef.current = body.url
      setProfilePhoto(body.url)
      refetch()
      if (onUserDataRefetch) onUserDataRefetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed'
      console.error('Profile photo upload:', msg)
      alert(msg)
    } finally {
      setUploadingPhoto(false)
      event.target.value = ''
    }
  }

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveSuccess(false)

      const userChanged =
        accountForm.username !== user.username || accountForm.email !== user.email

      if (userChanged) {
        const userPatch: { username?: string; email?: string } = {}
        if (accountForm.username !== user.username) userPatch.username = accountForm.username
        if (accountForm.email !== user.email) userPatch.email = accountForm.email
        await updateUser(userPatch)
      }

      const cfgPatch = {
        full_name: profileForm.full_name || null,
        bio: profileForm.bio || null,
        profession: profileForm.profession || null,
        nationality: (profileForm.nationality as NationalityType) || null,
        years_of_experience: profileForm.years_of_experience
          ? parseInt(profileForm.years_of_experience)
          : null,
        culinary_specialties: profileForm.culinary_specialties
          ? profileForm.culinary_specialties.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        kitchen_role: profileForm.kitchen_role || null,
        establishment_type: profileForm.establishment_type || null,
        employment_status: (employmentValue as EmploymentStatus) || null,
        current_salary: profileForm.current_salary ? parseFloat(profileForm.current_salary) : null,
        migrate: migrationValue,
        gender: genderValue,
        avatar_picture: lastUploadedUrlRef.current ?? profilePhoto ?? null,
      }

      await upsertConfiguration(cfgPatch)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      // error is set on the hook
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (user) {
      setAccountForm({ username: user.username || '', email: user.email || '' })
    }
  }, [user])

  useEffect(() => {
    if (configuration) {
      setEmploymentValue(configuration.employment_status ?? "")
      setGenderValue(configuration.gender ?? "male")
      setMigrationValue(configuration.migrate)

      if (lastUploadedUrlRef.current) {
        setProfilePhoto(lastUploadedUrlRef.current)
        lastUploadedUrlRef.current = null
      } else if (configuration.avatar_picture) {
        setProfilePhoto(configuration.avatar_picture)
      }

      setProfileForm({
        full_name: configuration.full_name ?? '',
        bio: configuration.bio ?? '',
        profession: configuration.profession ?? '',
        nationality: configuration.nationality ?? '',
        years_of_experience: configuration.years_of_experience?.toString() ?? '',
        culinary_specialties: configuration.culinary_specialties.join(', '),
        kitchen_role: configuration.kitchen_role ?? '',
        establishment_type: configuration.establishment_type ?? '',
        current_salary: configuration.current_salary?.toString() ?? '',
      })
    }
  }, [configuration])

  useEffect(() => {
    if (profilePhoto) setImageLoading(true)
  }, [profilePhoto])

  if (isInitialLoading) return <ProfileSkeleton />

  return (
    <>
      <ErrorNoticeDialog
        open={!!error && !isLoading}
        onOpenChange={() => {}}
        description={error ?? ''}
        onRetry={refetch}
      />
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
              <FiUser className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-2xl font-bold text-white">{t('header.title')}</h1>
              <p className="text-white/70 text-sm lg:text-base hidden sm:block">{t('header.subtitle')}</p>
            </div>
          </div>
          {onSectionChange && <SectionBackButton onClick={handleBackToDashboard} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Profile Photo */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-center">{t('photo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24 lg:w-32 lg:h-32">
                <div
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border-4 border-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={uploadingPhoto ? undefined : handlePhotoClick}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {profilePhoto ? (
                      <Image
                        key={profilePhoto}
                        src={profilePhoto}
                        alt="Profile"
                        width={128}
                        height={128}
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                        className={`w-full h-full rounded-full object-cover transition-opacity ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                        unoptimized
                      />
                    ) : (
                      !uploadingPhoto && <FiUser className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                    )}
                    {(uploadingPhoto || (profilePhoto && imageLoading)) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/30"
                  onClick={handlePhotoClick}
                >
                  <FiCamera className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </Button>
              </div>
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={handlePhotoClick}
              >
                {t('photo.changePhoto')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="lg:col-span-2 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">{t('accountInfo.title')}</CardTitle>
              <CardDescription className="text-white/70">{t('accountInfo.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">{t('accountInfo.username')}</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      value={accountForm.username}
                      onChange={(e) => setAccountForm(p => ({ ...p, username: e.target.value }))}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">{t('accountInfo.email')}</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      value={accountForm.email}
                      onChange={(e) => setAccountForm(p => ({ ...p, email: e.target.value }))}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Culinary Profile */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">{t('personalInfo.title')}</CardTitle>
            <CardDescription className="text-white/70">{t('personalInfo.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('personalInfo.fullName')}</label>
                <Input
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-white/90">{t('personalInfo.bio')}</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-white/30 bg-white/20 px-3 py-2 text-sm text-white placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder={t('personalInfo.bioPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('personalInfo.profession')}</label>
                <Input
                  value={profileForm.profession}
                  onChange={(e) => setProfileForm(p => ({ ...p, profession: e.target.value }))}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('personalInfo.nationality')}</label>
                <select
                  value={profileForm.nationality}
                  onChange={(e) => setProfileForm(p => ({ ...p, nationality: e.target.value as NationalityType | '' }))}
                  className="w-full h-10 rounded-md border border-white/30 bg-white/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" className="bg-gray-800">{t('personalInfo.nationalityPlaceholder')}</option>
                  <option value="PT" className="bg-gray-800">Portugal</option>
                  <option value="US" className="bg-gray-800">United States</option>
                  <option value="FR" className="bg-gray-800">France</option>
                  <option value="IT" className="bg-gray-800">Italy</option>
                  <option value="ES" className="bg-gray-800">Spain</option>
                  <option value="other" className="bg-gray-800">{t('personalInfo.nationalityOther')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('personalInfo.yearsOfExperience')}</label>
                <Input
                  type="number"
                  min={0}
                  max={99}
                  step={1}
                  value={profileForm.years_of_experience}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                      setProfileForm(p => ({ ...p, years_of_experience: '' }))
                      return
                    }
                    const parsed = Math.max(0, Math.min(99, Math.floor(Number(raw))))
                    setProfileForm(p => ({ ...p, years_of_experience: String(parsed) }))
                  }}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('personalInfo.culinarySpecialties')}</label>
                <Input
                  value={profileForm.culinary_specialties}
                  onChange={(e) => setProfileForm(p => ({ ...p, culinary_specialties: e.target.value }))}
                  placeholder={t('personalInfo.culinarySpecialtiesPlaceholder')}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('personalInfo.kitchenRole')}</label>
                <Input
                  value={profileForm.kitchen_role}
                  onChange={(e) => setProfileForm(p => ({ ...p, kitchen_role: e.target.value }))}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('personalInfo.establishmentType')}</label>
                <Input
                  value={profileForm.establishment_type}
                  onChange={(e) => setProfileForm(p => ({ ...p, establishment_type: e.target.value }))}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">{t('professionalInfo.title')}</CardTitle>
            <CardDescription className="text-white/70">{t('professionalInfo.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gender */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/90">{t('professionalInfo.gender')}</label>
                <RadioGroup
                  value={genderValue}
                  onValueChange={(v) => setGenderValue(v as GenderType)}
                  className="grid grid-cols-2 gap-2"
                >
                  {(['male', 'female', 'other', 'prefer_not_to_say'] as GenderType[]).map(g => (
                    <div key={g} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={g}
                        id={`gender-${g}`}
                        className="border-white/30 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                      />
                      <label htmlFor={`gender-${g}`} className="text-white/90 cursor-pointer text-sm">
                        {t(`professionalInfo.gender_${g}`)}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Employment Status */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/90">{t('professionalInfo.employmentStatus')}</label>
                <RadioGroup
                  value={employmentValue}
                  onValueChange={(v) => setEmploymentValue(v as EmploymentStatus)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="employed"
                      id="employed"
                      className="border-white/30 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                    />
                    <label htmlFor="employed" className="text-white/90 cursor-pointer">
                      {t('professionalInfo.employed')}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="unemployed"
                      id="unemployed"
                      className="border-white/30 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                    />
                    <label htmlFor="unemployed" className="text-white/90 cursor-pointer">
                      {t('professionalInfo.unemployed')}
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Current Salary */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">{t('professionalInfo.currentSalary')}</label>
                <Input
                  placeholder={t('professionalInfo.salaryPlaceholder')}
                  value={profileForm.current_salary}
                  onChange={(e) => setProfileForm(p => ({ ...p, current_salary: e.target.value }))}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </div>

              {/* Career Migration */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/90">{t('professionalInfo.careerMigration')}</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={migrationValue}
                    onChange={(e) => setMigrationValue(e.target.checked)}
                    className="w-4 h-4 text-amber-400 bg-white/20 border-white/30 rounded focus:ring-amber-400 focus:ring-2"
                  />
                  <span className="text-white/90">{t('professionalInfo.careerMigrationText')}</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {saveSuccess && (
                <div className="text-green-400 text-sm font-medium">✓ {t('saveSuccess')}</div>
              )}
              {error && !isLoading && (
                <div className="text-red-400 text-sm font-medium">{error}</div>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    {t('professionalInfo.saveChanges')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
