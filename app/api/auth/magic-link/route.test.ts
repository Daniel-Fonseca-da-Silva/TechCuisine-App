jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}))

import { POST } from './route'

describe('POST /api/auth/magic-link', () => {
  it('returns 410 Gone', async () => {
    const response = await POST()
    expect(response.status).toBe(410)
    const data = await response.json()
    expect(data.error).toMatch(/removed/)
  })
})
