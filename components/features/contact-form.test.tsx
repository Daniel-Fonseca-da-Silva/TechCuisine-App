import React from 'react'
import { render, screen } from '@testing-library/react'
import { ContactForm } from './contact-form'

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: React.forwardRef(function MockTurnstile(
    props: { siteKey: string; onSuccess?: (t: string) => void },
    ref: React.ForwardedRef<{ reset: () => void }>
  ) {
    React.useImperativeHandle(ref, () => ({ reset: jest.fn() }))
    React.useEffect(() => {
      props.onSuccess?.('mock-turnstile-token')
    }, [props])
    return <div data-testid="turnstile-widget" data-sitekey={props.siteKey} />
  }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    useActionState: (action: unknown, initialState: unknown) => [
      initialState,
      () => {},
      false,
    ] as [typeof initialState, () => void, boolean],
  }
})

jest.mock('@/app/api/contact/contact', () => ({
  submitContactForm: jest.fn(),
}))

describe('ContactForm', () => {
  const originalPublicKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  beforeEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalPublicKey
  })

  it('renders section with title and subtitle', () => {
    render(<ContactForm />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders contact info and form', () => {
    render(<ContactForm />)
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('contact@techcuisine.com')).toBeInTheDocument()
    expect(screen.getByText('responseTime')).toBeInTheDocument()
    expect(screen.getByText('formTitle')).toBeInTheDocument()
  })

  it('renders form fields and submit button', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/emailLabel/i)).toBeInTheDocument()
    expect(screen.getByText('subject')).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sendButton/i })).toBeInTheDocument()
  })

  it('renders Turnstile when site key is configured', async () => {
    render(<ContactForm />)
    const widget = await screen.findByTestId('turnstile-widget')
    expect(widget).toHaveAttribute('data-sitekey', '1x00000000000000000000AA')
    expect(screen.getByText('turnstileLabel')).toBeInTheDocument()
  })

  it('shows generic unavailable notice when site key is missing (non-dev)', () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    render(<ContactForm />)
    expect(screen.getByText('contactFormUnavailable')).toBeInTheDocument()
    expect(screen.queryByTestId('turnstile-widget')).not.toBeInTheDocument()
  })

  it('shows technical notice when site key is missing in development', () => {
    const originalNodeEnv = process.env.NODE_ENV
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true })
    render(<ContactForm />)
    expect(screen.getByText('turnstileNotConfigured')).toBeInTheDocument()
    expect(screen.queryByTestId('turnstile-widget')).not.toBeInTheDocument()
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true })
  })
})
