import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfileSection } from './profile-section'
import type { Configuration } from '@/types/configuration'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockUpdateUser = jest.fn()
const mockUpsertConfiguration = jest.fn()
const mockRefetch = jest.fn()

const stableUser = { id: 'u1', username: 'janedoe', email: 'jane@example.com', admin: false, active: true }

const stableConfiguration: Configuration = {
  id: 'cfg1',
  user_id: 'u1',
  full_name: 'Jane Doe',
  bio: 'A chef',
  profession: 'Chef',
  nationality: 'PT',
  years_of_experience: 5,
  culinary_specialties: ['pasta', 'sushi'],
  kitchen_role: 'Head Chef',
  establishment_type: 'Restaurant',
  gender: 'female',
  employment_status: 'employed',
  current_salary: 3000,
  migrate: false,
  avatar_picture: null,
}

jest.mock('@/hooks/use-user-data', () => ({
  useUserData: () => ({
    user: stableUser,
    configuration: stableConfiguration,
    userData: {
      name: stableConfiguration.full_name ?? stableUser.username,
      email: stableUser.email,
      username: stableUser.username,
      image_url: undefined,
    },
    isLoading: false,
    error: null,
    updateUser: mockUpdateUser,
    upsertConfiguration: mockUpsertConfiguration,
    refetch: mockRefetch,
  }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}))

jest.mock('@/components/features/profile/profile-skeleton', () => ({
  ProfileSkeleton: () => <div data-testid="profile-skeleton">Loading...</div>,
}))

describe('ProfileSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders header, photo, account, culinary, and professional cards', () => {
    render(<ProfileSection />)
    expect(screen.getByText('header.title')).toBeInTheDocument()
    expect(screen.getByText('header.subtitle')).toBeInTheDocument()
    expect(screen.getByText('photo.title')).toBeInTheDocument()
    expect(screen.getByText('accountInfo.title')).toBeInTheDocument()
    expect(screen.getByText('personalInfo.title')).toBeInTheDocument()
    expect(screen.getByText('professionalInfo.title')).toBeInTheDocument()
  })

  it('hydrates username and email from user', () => {
    render(<ProfileSection />)
    expect(screen.getByDisplayValue('janedoe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument()
  })

  it('hydrates full_name and culinary_specialties from configuration', () => {
    render(<ProfileSection />)
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('pasta, sushi')).toBeInTheDocument()
  })

  it('does not render phone, country, state, city, or age inputs', () => {
    render(<ProfileSection />)
    expect(screen.queryByText('personalInfo.phone')).not.toBeInTheDocument()
    expect(screen.queryByText('personalInfo.country')).not.toBeInTheDocument()
    expect(screen.queryByText('personalInfo.state')).not.toBeInTheDocument()
    expect(screen.queryByText('personalInfo.city')).not.toBeInTheDocument()
    expect(screen.queryByText('personalInfo.age')).not.toBeInTheDocument()
  })

  it('calls onSectionChange when Back is clicked', () => {
    const onSectionChange = jest.fn()
    render(<ProfileSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByTestId('section-back-button'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('does not render Back button when onSectionChange is not provided', () => {
    render(<ProfileSection />)
    expect(screen.queryByTestId('section-back-button')).not.toBeInTheDocument()
  })

  it('renders Save button', () => {
    render(<ProfileSection />)
    expect(screen.getByRole('button', { name: /professionalInfo\.saveChanges/i })).toBeInTheDocument()
  })

  it('renders photo change button', () => {
    render(<ProfileSection />)
    expect(screen.getByText('photo.changePhoto')).toBeInTheDocument()
  })

  it('updates full_name input when changed', () => {
    render(<ProfileSection />)
    const input = screen.getByDisplayValue('Jane Doe')
    fireEvent.change(input, { target: { value: 'Jane Smith' } })
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
  })

  it('calls upsertConfiguration on save', async () => {
    mockUpsertConfiguration.mockResolvedValueOnce(undefined)
    render(<ProfileSection />)
    fireEvent.click(screen.getByRole('button', { name: /professionalInfo\.saveChanges/i }))
    await waitFor(() => expect(mockUpsertConfiguration).toHaveBeenCalled())
    const [patch] = mockUpsertConfiguration.mock.calls[0]
    expect(patch).toMatchObject({ full_name: 'Jane Doe', employment_status: 'employed' })
  })

  it('renders all four gender radio options', () => {
    render(<ProfileSection />)
    expect(screen.getByLabelText('professionalInfo.gender_male')).toBeInTheDocument()
    expect(screen.getByLabelText('professionalInfo.gender_female')).toBeInTheDocument()
    expect(screen.getByLabelText('professionalInfo.gender_other')).toBeInTheDocument()
    expect(screen.getByLabelText('professionalInfo.gender_prefer_not_to_say')).toBeInTheDocument()
  })

  it('clamps years_of_experience input to [0, 99]', () => {
    render(<ProfileSection />)
    const input = screen.getByDisplayValue('5')
    fireEvent.change(input, { target: { value: '150' } })
    expect(screen.getByDisplayValue('99')).toBeInTheDocument()
    fireEvent.change(input, { target: { value: '-5' } })
    expect(screen.getByDisplayValue('0')).toBeInTheDocument()
  })
})
