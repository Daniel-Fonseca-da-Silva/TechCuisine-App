import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlatesSection } from './plates'
import type { Plate } from '@/types/plate.types'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/use-plates', () => ({
  usePlates: jest.fn(),
}))

jest.mock('@/components/features/shared/section-back-button', () => ({
  SectionBackButton: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      back
    </button>
  ),
}))

jest.mock('@/components/features/shared/error-notice-dialog', () => ({
  ErrorNoticeDialog: () => null,
}))

jest.mock('./plate-list-skeleton', () => ({
  PlateListSkeleton: () => <div data-testid="plate-list-skeleton" />,
}))

import { usePlates } from '@/hooks/use-plates'

const mockPlate: Plate = {
  id: 'plate-1',
  user_id: 'u1',
  name: 'House Burger',
  currency: 'EUR',
  active: true,
  menu_section: 'Mains',
  selling_price: '14.50',
}

function buildPlatesHook(overrides: Record<string, unknown> = {}) {
  const plates = (overrides.plates as Plate[] | undefined) ?? []
  return {
    plates,
    loading: false,
    mutationLoading: false,
    error: null,
    loadAll: jest.fn().mockResolvedValue(undefined),
    getFilteredPlates: (search: string) => {
      const q = search.trim().toLowerCase()
      if (!q) return plates
      return plates.filter((p) => p.name.toLowerCase().includes(q))
    },
    create: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockResolvedValue({ error: null }),
    remove: jest.fn().mockResolvedValue({ error: null }),
    reload: jest.fn(),
    ...overrides,
  }
}

describe('PlatesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePlates as jest.Mock).mockReturnValue(buildPlatesHook())
  })

  it('renders title as h1', () => {
    render(<PlatesSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('title')
  })

  it('loads plates on mount', () => {
    const loadAll = jest.fn().mockResolvedValue(undefined)
    ;(usePlates as jest.Mock).mockReturnValue(buildPlatesHook({ loadAll }))
    render(<PlatesSection />)
    expect(loadAll).toHaveBeenCalled()
  })

  it('shows skeleton while loading', () => {
    ;(usePlates as jest.Mock).mockReturnValue(buildPlatesHook({ loading: true }))
    render(<PlatesSection />)
    expect(screen.getByTestId('plate-list-skeleton')).toBeInTheDocument()
  })

  it('shows load error state and retries when retry clicked', () => {
    const loadAll = jest.fn().mockResolvedValue(undefined)
    ;(usePlates as jest.Mock).mockReturnValue(
      buildPlatesHook({ loading: false, error: 'failed', loadAll })
    )
    render(<PlatesSection />)
    expect(screen.getByText('errorState.title')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'errorState.retry' }))
    expect(loadAll).toHaveBeenCalledTimes(2)
  })

  it('shows empty state when there are no plates', () => {
    render(<PlatesSection />)
    expect(screen.getByText('emptyState.title')).toBeInTheDocument()
  })

  it('shows no-results empty state when search has no matches', () => {
    ;(usePlates as jest.Mock).mockReturnValue(buildPlatesHook({ plates: [mockPlate] }))
    render(<PlatesSection />)
    const search = screen.getByPlaceholderText('searchPlaceholder')
    fireEvent.change(search, { target: { value: 'zzz' } })
    expect(screen.getByText('emptyState.noResults')).toBeInTheDocument()
  })

  it('renders plate row with name and price', () => {
    ;(usePlates as jest.Mock).mockReturnValue(buildPlatesHook({ plates: [mockPlate] }))
    render(<PlatesSection />)
    expect(screen.getByText('House Burger')).toBeInTheDocument()
    expect(screen.getByText(/14\.50/)).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('calls onSectionChange with dashboard when back is clicked', () => {
    const onSectionChange = jest.fn()
    render(<PlatesSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByText('back'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('opens create dialog and submits new plate', async () => {
    const create = jest.fn().mockResolvedValue({ error: null })
    ;(usePlates as jest.Mock).mockReturnValue(buildPlatesHook({ create }))
    render(<PlatesSection />)
    fireEvent.click(screen.getByRole('button', { name: /addButton/i }))

    await waitFor(() => {
      expect(screen.getByText('createDialog.title')).toBeInTheDocument()
    })

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'Soup of the day' } })

    fireEvent.click(screen.getByRole('button', { name: 'form.save' }))

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Soup of the day',
        })
      )
    })
  })
})
