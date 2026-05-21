import React from 'react'
import { render, screen } from '@testing-library/react'
import PaymentButton from './payment-button'

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({ id: 'stripe-mock' })),
}))

jest.mock('@stripe/react-stripe-js', () => ({
  EmbeddedCheckoutProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="embedded-checkout">{children}</div>,
  EmbeddedCheckout: () => <div data-testid="embedded-checkout-form">Checkout</div>,
}))

describe('PaymentButton', () => {
  it('renders trigger button with children text', () => {
    render(<PaymentButton>Upgrade plan</PaymentButton>)
    expect(screen.getByRole('button', { name: /Upgrade plan/i })).toBeInTheDocument()
  })
})
