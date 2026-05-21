import { submitContactForm } from './contact'

const originalEnv = process.env

beforeEach(() => {
  jest.resetAllMocks()
  process.env = { ...originalEnv, BACKEND_API_URL: 'http://localhost:8080' }
})

afterEach(() => {
  process.env = originalEnv
})

function validFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  formData.set('name', 'Jane Doe')
  formData.set('email', 'jane@example.com')
  formData.set('subject', 'general')
  formData.set('message', 'Hello')
  formData.set('cf-turnstile-response', 'dummy-turnstile-token')
  for (const [k, v] of Object.entries(overrides)) {
    formData.set(k, v)
  }
  return formData
}

describe('submitContactForm', () => {
  it('returns errors when name is missing', async () => {
    const formData = new FormData()
    formData.set('email', 'test@example.com')
    formData.set('subject', 'general')
    formData.set('cf-turnstile-response', 'token')
    const result = await submitContactForm(null, formData)
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(result.errors?.name).toBeDefined()
  })

  it('returns errors when email is invalid', async () => {
    const formData = new FormData()
    formData.set('name', 'Jane')
    formData.set('email', 'not-an-email')
    formData.set('subject', 'general')
    formData.set('cf-turnstile-response', 'token')
    const result = await submitContactForm(null, formData)
    expect(result.success).toBe(false)
    expect(result.errors?.email).toBeDefined()
  })

  it('returns error when Turnstile token is missing', async () => {
    const formData = validFormData()
    formData.delete('cf-turnstile-response')
    const result = await submitContactForm(null, formData)
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/human verification/i)
  })

  it('returns success when all required fields are valid and API returns 200', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Message sent successfully' }),
    } as Response)

    const result = await submitContactForm(null, validFormData())
    expect(result.success).toBe(true)
    expect(result.message).toMatch(/success/i)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/contact',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('turnstile_token'),
      })
    )
    const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body as string)
    expect(body.turnstile_token).toBe('dummy-turnstile-token')
  })

  it('returns error when API returns non-2xx', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to send message' }),
    } as Response)

    const result = await submitContactForm(null, validFormData())
    expect(result.success).toBe(false)
    expect(result.message).toBeDefined()
  })

  it('maps API validation body using errors[0].message', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid input data',
        errors: [{ field: 'turnstiletoken', message: 'Field is required' }],
      }),
    } as Response)

    const result = await submitContactForm(null, validFormData())
    expect(result.success).toBe(false)
    expect(result.message).toBe('Field is required')
  })

  it('returns error when BACKEND_API_URL is not set', async () => {
    delete process.env.BACKEND_API_URL

    const result = await submitContactForm(null, validFormData())
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/unavailable/i)
  })

  it('returns error when fetch throws (network failure)', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'))

    const result = await submitContactForm(null, validFormData())
    expect(result.success).toBe(false)
  })
})
