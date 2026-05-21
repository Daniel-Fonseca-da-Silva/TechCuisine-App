jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
      cookies: { delete: jest.fn() },
    }),
  },
}))

jest.mock('@/lib/auth-config', () => ({
  AUTH_CONFIG: {
    ACCESS_COOKIE_NAME: 'tc-access',
    REFRESH_COOKIE_NAME: 'tc-refresh',
  },
}))

import { POST } from './route'

describe('POST /api/auth/logout', () => {
  it('returns success and deletes JWT cookies', async () => {
    const response = await POST()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(response.cookies.delete).toHaveBeenCalledWith('tc-access')
    expect(response.cookies.delete).toHaveBeenCalledWith('tc-refresh')
  })
})
