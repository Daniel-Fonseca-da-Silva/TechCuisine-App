import { renderHook, act } from '@testing-library/react'
import { useRecipes } from './use-recipes'

const originalFetch = global.fetch

const mockRecipe = {
  id: 'r1',
  user_id: 'u1',
  name: 'Bolo de Chocolate',
  description: null,
  reference_portions: 8,
  status: 'pending' as const,
  chef_notes: null,
  cost_per_portion: null,
  total_recipe_cost: null,
  total_ingredient_cost: null,
  total_preparation_cost: null,
  selling_price_per_portion: null,
}

const mockRecipe2 = { ...mockRecipe, id: 'r2', name: 'Arroz de Pato' }

function mockFetchPage(items: typeof mockRecipe[], next_cursor: string | null) {
  return jest.fn().mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, data: { items, next_cursor } }),
  })
}

afterEach(() => {
  global.fetch = originalFetch
  jest.clearAllMocks()
})

describe('useRecipes - loadAll with cursor pagination', () => {
  it('loads all items across multiple pages', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [mockRecipe], next_cursor: 'cursor-1' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [mockRecipe2], next_cursor: null } }),
      })

    const { result } = renderHook(() => useRecipes())

    await act(async () => {
      await result.current.loadAll()
    })

    expect(result.current.recipes).toHaveLength(2)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain('cursor=cursor-1')
  })

  it('sets error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, error: 'Server error' }),
    })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    expect(result.current.error).toBe('Server error')
    expect(result.current.recipes).toHaveLength(0)
  })

  it('sets error on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network'))
    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })
    expect(result.current.error).toBe('Failed to load recipes')
  })

  it('sorts recipes alphabetically', async () => {
    global.fetch = mockFetchPage([mockRecipe, mockRecipe2], null)
    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })
    expect(result.current.recipes[0].name).toBe('Arroz de Pato')
    expect(result.current.recipes[1].name).toBe('Bolo de Chocolate')
  })
})

describe('useRecipes - getFilteredRecipes', () => {
  it('returns all recipes for "all" filter', async () => {
    global.fetch = mockFetchPage([mockRecipe, { ...mockRecipe2, status: 'completed' as const }], null)
    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })
    expect(result.current.getFilteredRecipes('all')).toHaveLength(2)
  })

  it('filters by status', async () => {
    global.fetch = mockFetchPage([mockRecipe, { ...mockRecipe2, status: 'completed' as const }], null)
    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })
    expect(result.current.getFilteredRecipes('pending')).toHaveLength(1)
    expect(result.current.getFilteredRecipes('completed')).toHaveLength(1)
    expect(result.current.getFilteredRecipes('canceled')).toHaveLength(0)
  })
})

describe('useRecipes - create', () => {
  it('adds created recipe to state sorted alphabetically', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [mockRecipe2], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ success: true, data: mockRecipe }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    let createResult: { recipe: typeof mockRecipe | null; error: string | null } = { recipe: null, error: null }
    await act(async () => {
      createResult = await result.current.create({
        name: 'Bolo de Chocolate',
        reference_portions: 8,
      })
    })

    expect(createResult.error).toBeNull()
    expect(createResult.recipe?.name).toBe('Bolo de Chocolate')
    expect(result.current.recipes).toHaveLength(2)
    expect(result.current.recipes[0].name).toBe('Arroz de Pato')
  })

  it('returns error when create fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ success: false, error: 'not available for your subscription plan' }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    let createResult: { recipe: null; error: string | null } = { recipe: null, error: null }
    await act(async () => {
      createResult = await result.current.create({ name: 'Test', reference_portions: 1 })
    })

    expect(createResult.error).toContain('not available for your subscription plan')
    expect(createResult.recipe).toBeNull()
  })
})

describe('useRecipes - update', () => {
  it('replaces recipe in state after update', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [mockRecipe], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { ...mockRecipe, name: 'Updated Name' } }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    await act(async () => {
      await result.current.update('r1', { name: 'Updated Name' })
    })

    expect(result.current.recipes[0].name).toBe('Updated Name')
  })

  it('returns error when update fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [mockRecipe], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Update failed' }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    let updateResult: { recipe: null; error: string | null } = { recipe: null, error: null }
    await act(async () => {
      updateResult = await result.current.update('r1', { name: 'X' })
    })

    expect(updateResult.error).toBe('Update failed')
  })
})

describe('useRecipes - remove', () => {
  it('removes recipe from state', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [mockRecipe, mockRecipe2], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    await act(async () => { await result.current.remove('r1') })

    expect(result.current.recipes).toHaveLength(1)
    expect(result.current.recipes[0].id).toBe('r2')
  })

  it('returns error when delete fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [mockRecipe], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Delete failed' }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    let removeResult: { success: boolean; error: string | null } = { success: false, error: null }
    await act(async () => {
      removeResult = await result.current.remove('r1')
    })

    expect(removeResult.success).toBe(false)
    expect(removeResult.error).toBe('Delete failed')
    expect(result.current.recipes).toHaveLength(1)
  })
})

describe('useRecipes - scale', () => {
  const mockScaleResult = {
    recipe_id: 'r1',
    reference_portions: 4,
    desired_portions: 8,
    factor: '2.0',
    ingredient_lines: [],
    total_ingredient_cost: null,
    total_preparation_cost: null,
    total_recipe_cost: '40.00',
    cost_per_portion: '5.00',
    selling_price_per_portion: null,
    total_selling_price: null,
  }

  it('returns scale result without mutating state', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [mockRecipe], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockScaleResult }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    let scaleResult: { result: typeof mockScaleResult | null; error: string | null } = { result: null, error: null }
    await act(async () => {
      scaleResult = await result.current.scale('r1', 8)
    })

    expect(scaleResult.error).toBeNull()
    expect(scaleResult.result?.factor).toBe('2.0')
    expect(scaleResult.result?.desired_portions).toBe(8)
    expect(result.current.recipes).toHaveLength(1)
  })

  it('returns error when scale fails', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Scale failed' }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })

    let scaleResult: { result: null; error: string | null } = { result: null, error: null }
    await act(async () => {
      scaleResult = await result.current.scale('r1', 8)
    })

    expect(scaleResult.error).toBe('Scale failed')
    expect(scaleResult.result).toBeNull()
  })

  it('calls the correct URL', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { items: [], next_cursor: null } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockScaleResult }),
      })

    const { result } = renderHook(() => useRecipes())
    await act(async () => { await result.current.loadAll() })
    await act(async () => { await result.current.scale('r1', 12) })

    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe('/api/recipes/r1/scale?portions=12')
  })
})
