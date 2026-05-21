import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SuppliersSection } from './suppliers'
import type { Supplier } from '@/types/supplier.types'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/use-suppliers', () => ({
  useSuppliers: jest.fn(),
}))

jest.mock('@/components/features/shared/section-back-button', () => ({
  SectionBackButton: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      back
    </button>
  ),
}))

jest.mock('@/components/features/shared/error-notice-dialog', () => ({
  ErrorNoticeDialog: ({
    open,
    description,
  }: {
    open: boolean
    description: string
    onOpenChange?: (v: boolean) => void
    onRetry?: () => void
  }) => (open ? <div data-testid="error-notice-description">{description}</div> : null),
}))

jest.mock('./supplier-list-skeleton', () => ({
  SupplierListSkeleton: () => <div data-testid="supplier-list-skeleton" />,
}))

import { useSuppliers } from '@/hooks/use-suppliers'

const mockSupplier: Supplier = {
  id: 'sup-1',
  user_id: 'u1',
  name: 'Acme Distributor',
  supplier_type: 'distributor',
  contact_phone: '+1-555-0001',
  contact_email: 'contact@acme.com',
  address: '123 Main St',
  notes: null,
  active: true,
}

const inactiveSupplier: Supplier = {
  id: 'sup-2',
  user_id: 'u1',
  name: 'Inactive Producer',
  supplier_type: 'producer',
  contact_phone: null,
  contact_email: null,
  address: null,
  notes: null,
  active: false,
}

function buildSupplierHook(overrides: Record<string, unknown> = {}) {
  const suppliers = (overrides.suppliers as Supplier[] | undefined) ?? []
  return {
    suppliers,
    loading: false,
    mutationLoading: false,
    error: null,
    loadAll: jest.fn().mockResolvedValue(undefined),
    getFilteredSuppliers: (search: string) => {
      const q = search.trim().toLowerCase()
      if (!q) return suppliers
      return suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.supplier_type.toLowerCase().includes(q) ||
          (s.contact_email && s.contact_email.toLowerCase().includes(q))
      )
    },
    create: jest.fn().mockResolvedValue({ supplier: null, error: null }),
    update: jest.fn().mockResolvedValue({ supplier: null, error: null }),
    remove: jest.fn().mockResolvedValue({ success: true, error: null }),
    reload: jest.fn(),
    ...overrides,
  }
}

describe('SuppliersSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSuppliers as jest.Mock).mockReturnValue(buildSupplierHook())
  })

  it('renders title as h1 inside aria-labelled section', () => {
    render(<SuppliersSection />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('title')
    expect(screen.getByRole('region', { name: 'title' })).toBeInTheDocument()
  })

  it('calls loadAll on mount', () => {
    const loadAll = jest.fn().mockResolvedValue(undefined)
    ;(useSuppliers as jest.Mock).mockReturnValue(buildSupplierHook({ loadAll }))
    render(<SuppliersSection />)
    expect(loadAll).toHaveBeenCalledTimes(1)
  })

  it('shows skeleton while loading', () => {
    ;(useSuppliers as jest.Mock).mockReturnValue(buildSupplierHook({ loading: true }))
    render(<SuppliersSection />)
    expect(screen.getByTestId('supplier-list-skeleton')).toBeInTheDocument()
  })

  it('shows error state and retries when retry is clicked', () => {
    const loadAll = jest.fn().mockResolvedValue(undefined)
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupplierHook({ loading: false, error: 'failed', loadAll })
    )
    render(<SuppliersSection />)
    expect(screen.getByText('errorState.title')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'errorState.retry' }))
    expect(loadAll).toHaveBeenCalledTimes(2)
  })

  it('shows empty state when there are no suppliers', () => {
    render(<SuppliersSection />)
    expect(screen.getByText('emptyState.title')).toBeInTheDocument()
  })

  it('shows no-results state when search has no matches', () => {
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupplierHook({ suppliers: [mockSupplier] })
    )
    render(<SuppliersSection />)
    fireEvent.change(screen.getByPlaceholderText('searchPlaceholder'), {
      target: { value: 'zzz' },
    })
    expect(screen.getByText('emptyState.noResults')).toBeInTheDocument()
  })

  it('keeps supplier visible when searching by contact email substring', () => {
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupplierHook({ suppliers: [mockSupplier] })
    )
    render(<SuppliersSection />)
    fireEvent.change(screen.getByPlaceholderText('searchPlaceholder'), {
      target: { value: 'acme.com' },
    })
    expect(screen.getByText('Acme Distributor')).toBeInTheDocument()
  })

  it('renders supplier row with name, type badge, active badge, phone, email and address', () => {
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupplierHook({ suppliers: [mockSupplier] })
    )
    render(<SuppliersSection />)
    expect(screen.getByText('Acme Distributor')).toBeInTheDocument()
    expect(screen.getByText('types.distributor')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('+1-555-0001')).toBeInTheDocument()
    expect(screen.getByText('contact@acme.com')).toBeInTheDocument()
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('renders inactive badge and producer badge for inactive supplier', () => {
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupplierHook({ suppliers: [inactiveSupplier] })
    )
    render(<SuppliersSection />)
    expect(screen.getByText('inactive')).toBeInTheDocument()
    expect(screen.getByText('types.producer')).toBeInTheDocument()
  })

  it('calls onSectionChange with dashboard when back is clicked', () => {
    const onSectionChange = jest.fn()
    render(<SuppliersSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByText('back'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('shows validation error when saving without a name', async () => {
    render(<SuppliersSection />)
    fireEvent.click(screen.getByRole('button', { name: /addButton/i }))
    await waitFor(() => {
      expect(screen.getByText('createDialog.title')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'form.save' }))
    expect(screen.getByText('form.nameRequired')).toBeInTheDocument()
  })

  it('opens create dialog and submits new supplier with correct payload', async () => {
    const create = jest.fn().mockResolvedValue({ supplier: null, error: null })
    ;(useSuppliers as jest.Mock).mockReturnValue(buildSupplierHook({ create }))
    render(<SuppliersSection />)
    fireEvent.click(screen.getByRole('button', { name: /addButton/i }))

    await waitFor(() => {
      expect(screen.getByText('createDialog.title')).toBeInTheDocument()
    })

    // textboxes[0] is the name field (search is inert behind the dialog)
    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'New Supplier' } })

    fireEvent.click(screen.getByRole('button', { name: 'form.save' }))

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Supplier',
          active: true,
          contact_phone: null,
          contact_email: null,
          address: null,
          notes: null,
        })
      )
    })
  })

  it('opens edit dialog pre-filled and calls update with patched name', async () => {
    const update = jest.fn().mockResolvedValue({ supplier: null, error: null })
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupplierHook({ suppliers: [mockSupplier], update })
    )
    render(<SuppliersSection />)

    fireEvent.click(screen.getByRole('button', { name: 'editButton' }))

    await waitFor(() => {
      expect(screen.getByText('editDialog.title')).toBeInTheDocument()
    })

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'Acme Updated' } })

    fireEvent.click(screen.getByRole('button', { name: 'form.save' }))

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        'sup-1',
        expect.objectContaining({ name: 'Acme Updated' })
      )
    })
  })

  it('shows delete confirmation and calls remove on confirm', async () => {
    const remove = jest.fn().mockResolvedValue({ success: true, error: null })
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupplierHook({ suppliers: [mockSupplier], remove })
    )
    render(<SuppliersSection />)

    fireEvent.click(screen.getByRole('button', { name: 'deleteButton' }))

    await waitFor(() => {
      expect(screen.getByText('deleteDialog.title')).toBeInTheDocument()
    })
    expect(screen.getByText('deleteDialog.description')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'deleteDialog.confirm' }))

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith('sup-1')
    })
  })

  it('shows error notice when delete fails', async () => {
    const remove = jest.fn().mockResolvedValue({ success: false, error: 'delete-failed' })
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupplierHook({ suppliers: [mockSupplier], remove })
    )
    render(<SuppliersSection />)

    fireEvent.click(screen.getByRole('button', { name: 'deleteButton' }))

    await waitFor(() => {
      expect(screen.getByText('deleteDialog.title')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'deleteDialog.confirm' }))

    await waitFor(() => {
      expect(screen.getByTestId('error-notice-description')).toHaveTextContent('delete-failed')
    })
  })
})
