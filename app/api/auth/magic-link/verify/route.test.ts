jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}))

import { GET } from './route'

describe('GET /api/auth/magic-link/verify', () => {
  it('returns 410 Gone', async () => {
    const response = await GET()
    expect(response.status).toBe(410)
    const data = await response.json()
    expect(data.error).toMatch(/removed/)
  })
})
