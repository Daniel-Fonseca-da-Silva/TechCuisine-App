jest.mock('next/server', () => ({
  NextRequest: function () {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}))

import { POST } from './route'

describe('POST /api/checkout (deprecated)', () => {
  it('returns 410 Gone — use /api/subscriptions/checkout instead', async () => {
    const response = await POST()
    expect(response.status).toBe(410)
    const data = await response.json()
    expect(data.error).toMatch(/subscriptions\/checkout/)
  })
})
