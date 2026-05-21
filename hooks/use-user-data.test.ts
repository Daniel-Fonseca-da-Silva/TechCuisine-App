import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserData } from './use-user-data'

const mockUserBody = {
  success: true,
  data: { id: 'u1', username: 'johndoe', email: 'john@example.com', admin: false, active: true },
}

const mockCfgBody = {
  success: true,
  data: {
    id: 'cfg1',
    user_id: 'u1',
    full_name: 'John Doe',
    avatar_picture: 'https://example.com/avatar.jpg',
    employment_status: 'employed',
    nationality: 'PT',
    gender: 'male',
    migrate: false,
    culinary_specialties: ['pasta', 'sushi'],
    bio: null,
    profession: null,
    years_of_experience: null,
    kitchen_role: null,
    establishment_type: null,
    current_salary: null,
  },
}

function mockFetchSequence(...responses: { ok: boolean; status?: number; body: unknown }[]) {
  let call = 0
  global.fetch = jest.fn().mockImplementation(() => {
    const r = responses[call] ?? responses[responses.length - 1]
    call++
    return Promise.resolve({
      ok: r.ok,
      status: r.status ?? (r.ok ? 200 : 400),
      json: () => Promise.resolve(r.body),
    })
  })
}

describe('useUserData', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('starts with isLoading true', () => {
    mockFetchSequence({ ok: true, body: mockUserBody }, { ok: true, body: mockCfgBody })
    const { result } = renderHook(() => useUserData())
    expect(result.current.isLoading).toBe(true)
  })

  it('loads user and configuration on mount', async () => {
    mockFetchSequence({ ok: true, body: mockUserBody }, { ok: true, body: mockCfgBody })
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.user.username).toBe('johndoe')
    expect(result.current.user.email).toBe('john@example.com')
    expect(result.current.configuration?.full_name).toBe('John Doe')
    expect(result.current.configuration?.avatar_picture).toBe('https://example.com/avatar.jpg')
    expect(result.current.error).toBeNull()
  })

  it('derives userData.name from configuration.full_name', async () => {
    mockFetchSequence({ ok: true, body: mockUserBody }, { ok: true, body: mockCfgBody })
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.userData.name).toBe('John Doe')
    expect(result.current.userData.image_url).toBe('https://example.com/avatar.jpg')
  })

  it('falls back userData.name to username when configuration is null', async () => {
    mockFetchSequence(
      { ok: true, body: mockUserBody },
      { ok: true, body: { success: true, data: null } }
    )
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.configuration).toBeNull()
    expect(result.current.userData.name).toBe('johndoe')
    expect(result.current.userData.image_url).toBeUndefined()
  })

  it('sets configuration null on 404 without setting error', async () => {
    mockFetchSequence(
      { ok: true, body: mockUserBody },
      { ok: false, status: 404, body: { success: false, error: 'Not found' } }
    )
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.configuration).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('sets error when user fetch fails', async () => {
    mockFetchSequence(
      { ok: false, body: { success: false, error: 'Unauthorized' } },
      { ok: true, body: mockCfgBody }
    )
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Unauthorized')
  })

  it('updateUser sends PATCH to /api/user/me', async () => {
    mockFetchSequence({ ok: true, body: mockUserBody }, { ok: true, body: mockCfgBody })
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { username: 'newname', email: 'john@example.com' } }),
    })

    await act(async () => {
      await result.current.updateUser({ username: 'newname' })
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/user/me',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ username: 'newname' }) })
    )
    expect(result.current.user.username).toBe('newname')
  })

  it('upsertConfiguration POSTs when configuration is null', async () => {
    mockFetchSequence(
      { ok: true, body: mockUserBody },
      { ok: true, body: { success: true, data: null } }
    )
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const createdCfg = { ...mockCfgBody.data, full_name: 'New Name' }
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ success: true, data: createdCfg }),
    })

    await act(async () => {
      await result.current.upsertConfiguration({ full_name: 'New Name' })
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/configuration',
      expect.objectContaining({ method: 'POST' })
    )
    expect(result.current.configuration?.full_name).toBe('New Name')
  })

  it('upsertConfiguration PATCHes when configuration exists', async () => {
    mockFetchSequence({ ok: true, body: mockUserBody }, { ok: true, body: mockCfgBody })
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const updatedCfg = { ...mockCfgBody.data, full_name: 'Updated Name' }
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: updatedCfg }),
    })

    await act(async () => {
      await result.current.upsertConfiguration({ full_name: 'Updated Name' })
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/configuration',
      expect.objectContaining({ method: 'PATCH' })
    )
    expect(result.current.configuration?.full_name).toBe('Updated Name')
  })

  it('refetch reloads both user and configuration', async () => {
    mockFetchSequence({ ok: true, body: mockUserBody }, { ok: true, body: mockCfgBody })
    const { result } = renderHook(() => useUserData())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockUserBody) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockCfgBody) })
    global.fetch = fetchMock

    await act(async () => {
      await result.current.refetch()
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledWith('/api/user/me', expect.any(Object))
    expect(fetchMock).toHaveBeenCalledWith('/api/configuration', expect.any(Object))
  })
})
