import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlansSection } from './plans-section'

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as { raw: (k: string) => string[] }).raw = () => []
    return t
  },
}))

jest.mock('@/components/features/shared/section-back-button', () => ({
  SectionBackButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="section-back-button" onClick={onClick} />
  ),
}))

// These mocks are kept so PlansSectionActive compiles when PLANS_SECTION_ENABLED is flipped back.
jest.mock('./plans-skeleton', () => ({
  PlansSkeleton: () => <div data-testid="plans-skeleton" />,
}))
jest.mock('@/components/features/profile/profile-ai-usage-card', () => ({
  AiUsageProfileCard: () => <div data-testid="ai-usage-profile-card" />,
}))
jest.mock('@/components/features/shared/error-notice-dialog', () => ({
  ErrorNoticeDialog: () => null,
}))

describe('PlansSection (coming soon placeholder)', () => {
  it('renders the section header', () => {
    render(<PlansSection />)
    expect(screen.getByText('header.title')).toBeInTheDocument()
  })

  it('renders the coming soon message', () => {
    render(<PlansSection />)
    expect(screen.getByText('comingSoon')).toBeInTheDocument()
  })

  it('renders back button when onSectionChange is provided', () => {
    render(<PlansSection onSectionChange={jest.fn()} />)
    expect(screen.getByTestId('section-back-button')).toBeInTheDocument()
  })

  it('does not render back button when onSectionChange is not provided', () => {
    render(<PlansSection />)
    expect(screen.queryByTestId('section-back-button')).not.toBeInTheDocument()
  })

  it('calls onSectionChange with dashboard when back button is clicked', () => {
    const onSectionChange = jest.fn()
    render(<PlansSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByTestId('section-back-button'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })
})
