import { useState, useEffect, useCallback, useRef } from "react"
import type { Configuration, ConfigurationUpdate } from "@/types/configuration"

export interface User {
  id?: string
  username: string
  email: string
  admin?: boolean
  roles?: string[]
  active?: boolean
}

export interface UserData {
  // Raw user fields
  username: string
  email: string
  admin?: boolean
  roles?: string[]
  // Derived for backward compat with dashboard-layout
  name: string
  image_url?: string
}

export interface UserUpdate {
  username?: string
  email?: string
  password?: string
}

export function useUserData() {
  const [user, setUser] = useState<User>({ username: "", email: "" })
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [preferencesLanguage, setPreferencesLanguage] = useState<string[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const initialLoadDoneRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  const loadUserData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [userResp, cfgResp, prefResp] = await Promise.all([
        fetch('/api/user/me', { cache: 'no-store', headers: { 'Content-Type': 'application/json' } }),
        fetch('/api/configuration', { cache: 'no-store', headers: { 'Content-Type': 'application/json' } }),
        fetch('/api/preferences', { cache: 'no-store', headers: { 'Content-Type': 'application/json' } }),
      ])

      const userBody = await userResp.json()
      if (!userResp.ok || !userBody?.success) {
        throw new Error(userBody?.error || 'Failed to load user data')
      }

      const d = userBody.data
      setUser({
        id: d?.id,
        username: d?.username || "",
        email: d?.email || "",
        admin: d?.admin,
        roles: d?.roles,
        active: d?.active,
      })

      const cfgBody = await cfgResp.json()
      if (!cfgResp.ok || !cfgBody?.success) {
        // configuration errors are non-fatal
        console.warn('Configuration fetch failed:', cfgBody?.error)
        setConfiguration(null)
      } else {
        setConfiguration(cfgBody.data ?? null)
      }

      const prefBody = await prefResp.json()
      if (!prefResp.ok || !prefBody?.success) {
        // preferences errors are non-fatal
        console.warn('Preferences fetch failed:', prefBody?.error)
        setPreferencesLanguage(null)
      } else {
        setPreferencesLanguage(prefBody.data?.language ?? [])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error loading user data"
      setError(errorMessage)
      console.error("Error loading user data:", err)
    } finally {
      setIsLoading(false)
      if (!initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true
        setIsInitialLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // Derived backward-compat shape consumed by dashboard-layout.tsx
  const userData: UserData = {
    username: user.username,
    email: user.email,
    admin: user.admin,
    roles: user.roles,
    name: configuration?.full_name ?? user.username,
    image_url: configuration?.avatar_picture ?? undefined,
  }

  const updateUser = async (patch: UserUpdate) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })

      const body = await response.json()

      if (!response.ok || !body?.success) {
        throw new Error(body?.error || 'Failed to update user')
      }

      const d = body.data
      setUser(prev => ({
        ...prev,
        username: d?.username ?? prev.username,
        email: d?.email ?? prev.email,
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error updating user"
      setError(errorMessage)
      console.error("Error updating user:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const upsertConfiguration = async (patch: ConfigurationUpdate) => {
    setIsLoading(true)
    setError(null)

    try {
      if (configuration === null) {
        // Create
        const response = await fetch('/api/configuration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })

        const body = await response.json()

        if (!response.ok || !body?.success) {
          throw new Error(body?.error || 'Failed to create configuration')
        }

        setConfiguration(body.data ?? null)
      } else {
        // Update
        const response = await fetch('/api/configuration', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })

        const body = await response.json()

        if (!response.ok || !body?.success) {
          throw new Error(body?.error || 'Failed to update configuration')
        }

        setConfiguration(body.data ?? configuration)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error saving configuration"
      setError(errorMessage)
      console.error("Error saving configuration:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Legacy alias kept so existing callers (profile-section before refactor) don't break
  const updateUserData = async (patch: UserUpdate) => updateUser(patch)

  return {
    user,
    configuration,
    preferencesLanguage,
    userData,
    isLoading,
    isInitialLoading,
    error,
    updateUser,
    updateUserData,
    upsertConfiguration,
    refetch: loadUserData,
  }
}
