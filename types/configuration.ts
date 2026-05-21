export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export type NationalityType = 'PT' | 'US' | 'FR' | 'IT' | 'ES' | 'other'

export type EmploymentStatus = 'employed' | 'unemployed'

export interface Configuration {
  id: string
  user_id: string
  gender: GenderType | null
  profession: string | null
  nationality: NationalityType | null
  avatar_picture: string | null
  full_name: string | null
  bio: string | null
  years_of_experience: number | null
  culinary_specialties: string[]
  kitchen_role: string | null
  establishment_type: string | null
  employment_status: EmploymentStatus | null
  current_salary: number | null
  migrate: boolean
}

export interface ConfigurationUpdate {
  gender?: GenderType | null
  profession?: string | null
  nationality?: NationalityType | null
  avatar_picture?: string | null
  full_name?: string | null
  bio?: string | null
  years_of_experience?: number | null
  culinary_specialties?: string[]
  kitchen_role?: string | null
  establishment_type?: string | null
  employment_status?: EmploymentStatus | null
  current_salary?: number | null
  migrate?: boolean
}
