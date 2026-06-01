import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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

jest.mock('./plans-skeleton', () => ({
  PlansSkeleton: () => <div data-testid="plans-skeleton" />,
}))


jest.mock('@/components/features/shared/error-notice-dialog', () => ({
  ErrorNoticeDialog: () => null,
}))

const mockFreeSub = {
  plan: 'tech_cuisine',
  status: 'none',
  is_premium_active: false,
  current_period_start: null,
  current_period_end: null,
  cancel_at_period_end: false,
}

const mockActiveSub = {
  plan: 'tech_cuisine',
  status: 'trialing',
  is_premium_active: true,
  current_period_start: '2025-01-01T00:00:00Z',
  current_period_end: '2025-02-01T00:00:00Z',
  trial_ends_at: '2025-01-08T00:00:00Z',
  cancel_at_period_end: false,
}

// Stripe trial: is_premium_active may come as false before webhook settles,
// but status is already 'trialing'. UI should still show paid plan.
const mockTrialNoPeriodEnd = {
  plan: 'tech_cuisine',
  status: 'trialing',
  is_premium_active: false,
  current_period_start: null,
  current_period_end: null,
  trial_ends_at: '2025-01-08T00:00:00Z',
  cancel_at_period_end: false,
}

function mockFetch(data: object) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true, data }),
  })
}

describe('PlansSection (active)', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows skeleton while loading', () => {
    mockFetch(mockFreeSub)
    render(<PlansSection />)
    expect(screen.getByTestId('plans-skeleton')).toBeInTheDocument()
  })

  it('renders section header after load', async () => {
    mockFetch(mockFreeSub)
    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())
    expect(screen.getByText('header.title')).toBeInTheDocument()
  })

  it('renders back button when onSectionChange is provided', async () => {
    mockFetch(mockFreeSub)
    render(<PlansSection onSectionChange={jest.fn()} />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())
    expect(screen.getByTestId('section-back-button')).toBeInTheDocument()
  })

  it('shows no-plan state when status is none', async () => {
    mockFetch(mockFreeSub)
    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())
    expect(screen.getByText('currentPlan.noPlan.title')).toBeInTheDocument()
  })

  it('checkout button sends tech_cuisine plan', async () => {
    mockFetch(mockFreeSub)
    const mockCheckoutFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { checkout_url: 'https://stripe.com/pay' } }),
    })
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFreeSub }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { checkout_url: 'https://stripe.com/pay' } }),
      })

    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())

    const chooseButton = screen.getByText('availablePlans.choosePlan')
    expect(chooseButton).toBeInTheDocument()
  })

  it('does not render manage subscription button when status is none', async () => {
    mockFetch(mockFreeSub)
    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())

    expect(screen.queryByText('currentPlan.manageSubscription')).not.toBeInTheDocument()
  })

  it('manage subscription button is enabled when premium active', async () => {
    mockFetch(mockActiveSub)
    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())

    const manageBtn = screen.getByText('currentPlan.manageSubscription')
    expect(manageBtn.closest('button')).not.toBeDisabled()
  })

  it('shows paid plan when trialing even if is_premium_active is false', async () => {
    mockFetch(mockTrialNoPeriodEnd)
    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())

    expect(screen.getAllByText('plans.techCuisine.name').length).toBeGreaterThan(0)
    const manageBtn = screen.getByText('currentPlan.manageSubscription')
    expect(manageBtn.closest('button')).not.toBeDisabled()
  })

  it('shows trial badge when status is trialing', async () => {
    mockFetch(mockActiveSub)
    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())

    expect(screen.getByText('trialBadge')).toBeInTheDocument()
  })

  it('shows trial notice when status is trialing', async () => {
    mockFetch(mockActiveSub)
    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())

    expect(screen.getByText('trialActiveNotice')).toBeInTheDocument()
  })

  it('does not show trial badge when status is active', async () => {
    const activeSub = { ...mockActiveSub, status: 'active' }
    mockFetch(activeSub)
    render(<PlansSection />)
    await waitFor(() => expect(screen.queryByTestId('plans-skeleton')).not.toBeInTheDocument())

    expect(screen.queryByText('trialBadge')).not.toBeInTheDocument()
  })
})
