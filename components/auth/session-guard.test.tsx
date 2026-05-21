import React from 'react'
import { render, screen } from '@testing-library/react'
import { SessionGuard } from './session-guard'

const mockUseSessionCheck = jest.fn()
jest.mock('@/hooks/use-session-check', () => ({
  useSessionCheck: () => mockUseSessionCheck(),
}))

describe('SessionGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls useSessionCheck when mounted', () => {
    render(
      <SessionGuard>
        <span>Child content</span>
      </SessionGuard>
    )
    expect(mockUseSessionCheck).toHaveBeenCalled()
  })

  it('renders children', () => {
    render(
      <SessionGuard>
        <span>Child content</span>
      </SessionGuard>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })
})
