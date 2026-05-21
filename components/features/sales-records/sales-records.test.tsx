import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SalesRecordsSection } from './sales-records'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/use-sales-records', () => ({
  useSalesRecords: jest.fn(),
}))

jest.mock('@/hooks/use-plates', () => ({
  usePlates: jest.fn(),
}))

jest.mock('@/components/features/shared/section-back-button', () => ({
  SectionBackButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>back</button>
  ),
}))

jest.mock('@/components/features/shared/error-notice-dialog', () => ({
  ErrorNoticeDialog: () => null,
}))

import { useSalesRecords } from '@/hooks/use-sales-records'
import { usePlates } from '@/hooks/use-plates'

const mockRecord = {
  id: 'rec-1',
  user_id: 'u1',
  plate_id: 'plate-1',
  sold_at: '2026-05-09T12:00:00Z',
  quantity: 2,
  unit_price: '12.50',
  line_total: '25.00',
  currency: 'EUR',
  channel: 'dine-in',
}

const mockPlate = { id: 'plate-1', name: 'Bacalhau à Brás', currency: 'EUR', active: true, user_id: 'u1' }

function buildHook(overrides = {}) {
  return {
    records: [],
    loading: false,
    mutationLoading: false,
    error: null,
    loadAll: jest.fn().mockResolvedValue(undefined),
    getFilteredRecords: jest.fn().mockReturnValue([]),
    create: jest.fn(),
    reload: jest.fn(),
    ...overrides,
  }
}

function buildPlatesHook(overrides = {}) {
  return {
    plates: [],
    loading: false,
    mutationLoading: false,
    error: null,
    loadAll: jest.fn().mockResolvedValue(undefined),
    getFilteredPlates: jest.fn().mockReturnValue([]),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reload: jest.fn(),
    ...overrides,
  }
}

describe('SalesRecordsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSalesRecords as jest.Mock).mockReturnValue(buildHook())
    ;(usePlates as jest.Mock).mockReturnValue(buildPlatesHook())
  })

  it('renders accessible heading', () => {
    render(<SalesRecordsSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveAttribute('id', 'sales-records-heading')
  })

  it('section has aria-labelledby pointing to heading', () => {
    render(<SalesRecordsSection />)
    const section = screen.getByRole('region')
    expect(section).toHaveAttribute('aria-labelledby', 'sales-records-heading')
  })

  it('shows skeleton when loading', () => {
    ;(useSalesRecords as jest.Mock).mockReturnValue(buildHook({ loading: true }))
    const { container } = render(<SalesRecordsSection />)
    const skeletonItems = container.querySelectorAll('.rounded-xl.bg-white\\/10.border')
    expect(skeletonItems.length).toBeGreaterThan(0)
  })

  it('shows empty state when no records', () => {
    render(<SalesRecordsSection />)
    expect(screen.getByText('emptyState.title')).toBeInTheDocument()
  })

  it('renders records with line_total and sold_at', () => {
    ;(useSalesRecords as jest.Mock).mockReturnValue(
      buildHook({ getFilteredRecords: jest.fn().mockReturnValue([mockRecord]) })
    )
    ;(usePlates as jest.Mock).mockReturnValue(
      buildPlatesHook({ plates: [mockPlate] })
    )
    render(<SalesRecordsSection />)
    expect(screen.getByText('Bacalhau à Brás')).toBeInTheDocument()
    expect(screen.getByText('total')).toBeInTheDocument()
  })

  it('opens create dialog on add button click', async () => {
    render(<SalesRecordsSection />)
    const addButton = screen.getByRole('button', { name: /addButton|add/i })
    fireEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('createDialog.title')).toBeInTheDocument()
    })
  })

  it('calls onSectionChange with dashboard when back button clicked', () => {
    const onSectionChange = jest.fn()
    render(<SalesRecordsSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByText('back'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('shows noResults when search yields nothing', () => {
    ;(useSalesRecords as jest.Mock).mockReturnValue(
      buildHook({ getFilteredRecords: jest.fn().mockReturnValue([]) })
    )
    render(<SalesRecordsSection />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'xyz' } })
    expect(screen.getByText('emptyState.noResults')).toBeInTheDocument()
  })
})
