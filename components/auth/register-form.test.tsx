import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RegisterForm } from './register-form'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders card with title and subtitle', () => {
    render(<RegisterForm />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders account type options and form fields', () => {
    render(<RegisterForm />)
    expect(screen.getByRole('radiogroup', { name: /accountTypeLabel/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /subtitleName2/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })

  it('renders link to login', () => {
    render(<RegisterForm />)
    const link = screen.getByRole('link', { name: /login/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/auth/login')
  })

  it('applies custom className', () => {
    const { container } = render(<RegisterForm className="custom-class" />)
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('toggles account type to business and updates subtitle', () => {
    render(<RegisterForm />)
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    fireEvent.click(screen.getByText('accountTypeBusiness'))
    expect(screen.getByText('subtitleBusiness')).toBeInTheDocument()
  })

  it('shows validation errors when submitting with invalid data', async () => {
    render(<RegisterForm />)
    fireEvent.change(screen.getByRole('textbox', { name: /subtitleName2/i }), {
      target: { value: 'Ab' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'notanemail' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /action/i }).closest('form')!)
    await waitFor(() => {
      const errorParagraphs = document.querySelectorAll('p.text-red-300')
      expect(errorParagraphs.length).toBeGreaterThan(0)
    })
  })

  it('calls register API and shows success alert when response is success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    })

    render(<RegisterForm />)
    fireEvent.change(screen.getByRole('textbox', { name: /subtitleName2/i }), {
      target: { value: 'Jane Doe Silva' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'jane@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Doe Silva',
          email: 'jane@example.com',
          account_type: 'individual',
        }),
      })
    })

    await waitFor(() => {
      expect(screen.getByText('welcomeAlert.title')).toBeInTheDocument()
    })
  })

  it('shows general error when API returns success false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: 'Internal server error' }),
    })

    render(<RegisterForm />)
    fireEvent.change(screen.getByRole('textbox', { name: /subtitleName2/i }), {
      target: { value: 'Jane Doe Silva' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'jane@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      expect(screen.getByText('Internal server error')).toBeInTheDocument()
    })
  })

  it('sends account_type business when business is selected', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    })

    render(<RegisterForm />)
    fireEvent.click(screen.getByText('accountTypeBusiness'))
    fireEvent.change(screen.getByRole('textbox', { name: /subtitleName2/i }), {
      target: { value: 'Acme Corp Ltda' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'contact@acme.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          body: JSON.stringify({
            name: 'Acme Corp Ltda',
            email: 'contact@acme.com',
            account_type: 'business',
          }),
        })
      )
    })
  })
})
