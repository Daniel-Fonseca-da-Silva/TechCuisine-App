import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorNoticeDialog } from './error-notice-dialog'
import { DashboardNavContext } from './dashboard-nav-context'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Minimal AlertDialog stubs so we don't need Radix in tests
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div role="heading">{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
}))

describe('ErrorNoticeDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <ErrorNoticeDialog
        open={false}
        onOpenChange={jest.fn()}
        description="Some error"
      />
    )
    expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument()
  })

  it('renders description when open', () => {
    render(
      <ErrorNoticeDialog
        open={true}
        onOpenChange={jest.fn()}
        description="Something went wrong"
      />
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders custom title when provided', () => {
    render(
      <ErrorNoticeDialog
        open={true}
        onOpenChange={jest.fn()}
        title="Custom Title"
        description="An error"
      />
    )
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('falls back to i18n title key when title prop is not provided', () => {
    render(
      <ErrorNoticeDialog
        open={true}
        onOpenChange={jest.fn()}
        description="An error"
      />
    )
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('shows Retry button and calls onRetry when clicked', () => {
    const onRetry = jest.fn()
    render(
      <ErrorNoticeDialog
        open={true}
        onOpenChange={jest.fn()}
        description="An error"
        onRetry={onRetry}
      />
    )
    const retryBtn = screen.getByText('retry')
    expect(retryBtn).toBeInTheDocument()
    fireEvent.click(retryBtn)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not show Retry button when onRetry is not provided', () => {
    render(
      <ErrorNoticeDialog
        open={true}
        onOpenChange={jest.fn()}
        description="An error"
      />
    )
    expect(screen.queryByText('retry')).not.toBeInTheDocument()
  })

  describe('rate limit variant', () => {
    it('shows rateLimit title and not the generic title', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="rate limit exceeded"
        />
      )
      expect(screen.getByRole('heading')).toHaveTextContent('rateLimit.title')
      expect(screen.queryByText('title')).not.toBeInTheDocument()
    })

    it('does not render the raw API error string', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="rate limit exceeded"
        />
      )
      expect(screen.queryByText('rate limit exceeded')).not.toBeInTheDocument()
    })

    it('shows only rateLimitHint as description', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="rate limit exceeded"
        />
      )
      expect(screen.getByText('rateLimitHint')).toBeInTheDocument()
    })

    it('is case-insensitive for rate limit detection', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="Rate Limit Exceeded: 100 per 1 minute"
        />
      )
      expect(screen.getByRole('heading')).toHaveTextContent('rateLimit.title')
    })

    it('detects 429 keyword', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="Error 429 too many requests"
        />
      )
      expect(screen.getByRole('heading')).toHaveTextContent('rateLimit.title')
    })
  })

  it('calls onOpenChange(false) when OK is clicked', () => {
    const onOpenChange = jest.fn()
    render(
      <ErrorNoticeDialog
        open={true}
        onOpenChange={onOpenChange}
        description="An error"
      />
    )
    fireEvent.click(screen.getByText('ok'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  describe('plan limit variant', () => {
    it('shows planLimit title and not the generic title', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="plan limit exceeded"
        />
      )
      expect(screen.getByRole('heading')).toHaveTextContent('planLimit.title')
      expect(screen.queryByText('title')).not.toBeInTheDocument()
    })

    it('does not render the raw API error string', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="plan limit exceeded"
        />
      )
      expect(screen.queryByText('plan limit exceeded')).not.toBeInTheDocument()
    })

    it('renders all planLimit i18n keys', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="plan limit exceeded"
        />
      )
      expect(screen.getByText('planLimit.lead')).toBeInTheDocument()
      expect(screen.getByText('planLimit.resetHint')).toBeInTheDocument()
      expect(screen.getByText('planLimit.upgradeHint')).toBeInTheDocument()
    })

    it('shows upgrade CTA as text only when outside dashboard context', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="plan limit exceeded"
        />
      )
      // CTA text is present but not a clickable Cancel button (rendered as span)
      const ctaText = screen.getByText('planLimit.upgradeCta')
      expect(ctaText.tagName).not.toBe('BUTTON')
    })

    it('shows upgrade CTA as button and calls navigateToSection when inside dashboard context', () => {
      const navigateToSection = jest.fn()
      const onOpenChange = jest.fn()
      render(
        <DashboardNavContext.Provider value={{ navigateToSection }}>
          <ErrorNoticeDialog
            open={true}
            onOpenChange={onOpenChange}
            description="plan limit exceeded"
          />
        </DashboardNavContext.Provider>
      )
      const ctaBtn = screen.getByText('planLimit.upgradeCta')
      expect(ctaBtn.tagName).toBe('BUTTON')
      fireEvent.click(ctaBtn)
      expect(navigateToSection).toHaveBeenCalledWith('plans')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('is case-insensitive for plan limit detection', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="Plan Limit Exceeded"
        />
      )
      expect(screen.getByRole('heading')).toHaveTextContent('planLimit.title')
    })
  })

  describe('subscription feature variant', () => {
    const description = 'this feature is not available for your subscription plan'

    it('shows subscriptionFeature title and not the generic title', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description={description}
        />
      )
      expect(screen.getByRole('heading')).toHaveTextContent('subscriptionFeature.title')
      expect(screen.queryByText('title')).not.toBeInTheDocument()
    })

    it('does not render the raw API error string', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description={description}
        />
      )
      expect(screen.queryByText(description)).not.toBeInTheDocument()
    })

    it('renders subscriptionFeature i18n keys', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description={description}
        />
      )
      expect(screen.getByText('subscriptionFeature.lead')).toBeInTheDocument()
      expect(screen.getByText('subscriptionFeature.upgradeHint')).toBeInTheDocument()
    })

    it('shows upgrade CTA as text only when outside dashboard context', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description={description}
        />
      )
      const ctaText = screen.getByText('subscriptionFeature.upgradeCta')
      expect(ctaText.tagName).not.toBe('BUTTON')
    })

    it('shows upgrade CTA as button and calls navigateToSection when inside dashboard context', () => {
      const navigateToSection = jest.fn()
      const onOpenChange = jest.fn()
      render(
        <DashboardNavContext.Provider value={{ navigateToSection }}>
          <ErrorNoticeDialog
            open={true}
            onOpenChange={onOpenChange}
            description={description}
          />
        </DashboardNavContext.Provider>
      )
      const ctaBtn = screen.getByText('subscriptionFeature.upgradeCta')
      expect(ctaBtn.tagName).toBe('BUTTON')
      fireEvent.click(ctaBtn)
      expect(navigateToSection).toHaveBeenCalledWith('plans')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('is case-insensitive for subscription feature detection', () => {
      render(
        <ErrorNoticeDialog
          open={true}
          onOpenChange={jest.fn()}
          description="This Feature Is Not Available For Your Subscription Plan"
        />
      )
      expect(screen.getByRole('heading')).toHaveTextContent('subscriptionFeature.title')
    })
  })
})
