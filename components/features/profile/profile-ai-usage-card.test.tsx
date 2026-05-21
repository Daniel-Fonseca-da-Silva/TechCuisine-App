import React from 'react'
import { render, screen } from '@testing-library/react'
import { AiUsageProfileCard, toPercent, buildRadialData, buildBarData, formatPeriod } from './profile-ai-usage-card'
import type { AiUsage } from '@/hooks/use-ai-usage'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/use-ai-usage', () => ({
  useAiUsage: jest.fn(),
}))

// Recharts uses ResizeObserver — stub it out
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

import { useAiUsage } from '@/hooks/use-ai-usage'
const mockUseAiUsage = useAiUsage as jest.MockedFunction<typeof useAiUsage>

const baseUsage: AiUsage = {
  plan: 'Pro',
  used: 40,
  limit: 100,
  remaining: 60,
  period: '2024-03',
}

describe('AiUsageProfileCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders skeleton while loading', () => {
    mockUseAiUsage.mockReturnValue({ usage: null, isLoading: true, isError: false, refetch: jest.fn() })
    const { container } = render(<AiUsageProfileCard />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseAiUsage.mockReturnValue({ usage: null, isLoading: false, isError: true, refetch: jest.fn() })
    render(<AiUsageProfileCard />)
    expect(screen.getByText('error')).toBeInTheDocument()
  })

  it('renders normal usage with charts and metrics', () => {
    mockUseAiUsage.mockReturnValue({ usage: baseUsage, isLoading: false, isError: false, refetch: jest.fn() })
    render(<AiUsageProfileCard />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    // Metric values
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  it('renders unlimited state when limit < 0', () => {
    mockUseAiUsage.mockReturnValue({
      usage: { ...baseUsage, limit: -1, remaining: -1 },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    })
    render(<AiUsageProfileCard />)
    expect(screen.getByText('unlimited')).toBeInTheDocument()
  })

  it('renders noPlan state when limit === 0', () => {
    mockUseAiUsage.mockReturnValue({
      usage: { ...baseUsage, limit: 0, remaining: 0 },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    })
    render(<AiUsageProfileCard />)
    expect(screen.getByText('noPlan')).toBeInTheDocument()
  })
})

describe('toPercent', () => {
  it('returns correct percentage', () => expect(toPercent(40, 100)).toBe(40))
  it('caps at 100', () => expect(toPercent(120, 100)).toBe(100))
  it('returns 0 when limit is 0', () => expect(toPercent(10, 0)).toBe(0))
  it('returns 0 when limit is negative', () => expect(toPercent(10, -1)).toBe(0))
})

describe('buildRadialData', () => {
  it('builds single radial entry with percent value', () => {
    const data = buildRadialData(baseUsage)
    expect(data).toHaveLength(1)
    expect(data[0].value).toBe(40)
  })
})

describe('buildBarData', () => {
  it('builds two entries for used and remaining', () => {
    const data = buildBarData(baseUsage)
    expect(data).toHaveLength(2)
    expect(data[0]).toMatchObject({ name: 'used', value: 40 })
    expect(data[1]).toMatchObject({ name: 'remaining', value: 60 })
  })
})

describe('formatPeriod', () => {
  it('formats a YYYY-MM string to a locale date string', () => {
    const result = formatPeriod('2024-03')
    expect(result).toMatch(/2024/)
  })

  it('returns the original string when not in YYYY-MM format', () => {
    expect(formatPeriod('unknown')).toBe('unknown')
  })
})
