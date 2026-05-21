import React from 'react'
import { render, screen } from '@testing-library/react'
import Error from './error'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('Error', () => {
  it('renders error title from translations', () => {
    render(<Error />)
    expect(screen.getByText(/Error - title/)).toBeInTheDocument()
  })
})
