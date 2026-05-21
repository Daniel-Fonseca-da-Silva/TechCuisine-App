import {
  loginSchema,
  forgotPasswordSchema,
  registerSchema,
  emailSchema,
} from './validations'

describe('validations', () => {
  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      const result = loginSchema.safeParse({ username: 'myuser', password: 'Securepass1!' })
      expect(result.success).toBe(true)
    })

    it('rejects username shorter than 3 characters', () => {
      const result = loginSchema.safeParse({ username: 'ab', password: 'Securepass1!' })
      expect(result.success).toBe(false)
    })

    it('rejects password shorter than 8 characters', () => {
      const result = loginSchema.safeParse({ username: 'myuser', password: 'Ab1!' })
      expect(result.success).toBe(false)
    })
  })

  describe('forgotPasswordSchema', () => {
    it('accepts valid email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' })
      expect(result.success).toBe(true)
    })

    it('rejects empty email', () => {
      const result = forgotPasswordSchema.safeParse({ email: '' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email format', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    const VALID = {
      username: 'myuser',
      email: 'user@example.com',
      password: 'Securepass1!',
    }

    it('accepts valid payload', () => {
      expect(registerSchema.safeParse(VALID).success).toBe(true)
    })

    it('rejects username shorter than 3 characters', () => {
      expect(registerSchema.safeParse({ ...VALID, username: 'ab' }).success).toBe(false)
    })

    it('rejects username longer than 50 characters', () => {
      expect(registerSchema.safeParse({ ...VALID, username: 'a'.repeat(51) }).success).toBe(false)
    })

    it('rejects invalid email', () => {
      expect(registerSchema.safeParse({ ...VALID, email: 'invalid' }).success).toBe(false)
    })

    it('rejects password shorter than 8 characters', () => {
      expect(registerSchema.safeParse({ ...VALID, password: 'Ab1!' }).success).toBe(false)
    })

    it('rejects password without uppercase letter', () => {
      const result = registerSchema.safeParse({ ...VALID, password: 'securepass1!' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('PASSWORD_STRENGTH')
      }
    })

    it('rejects password without lowercase letter', () => {
      const result = registerSchema.safeParse({ ...VALID, password: 'SECUREPASS1!' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('PASSWORD_STRENGTH')
      }
    })

    it('rejects password without digit', () => {
      const result = registerSchema.safeParse({ ...VALID, password: 'Securepass!!' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('PASSWORD_STRENGTH')
      }
    })

    it('rejects password without special character', () => {
      const result = registerSchema.safeParse({ ...VALID, password: 'Securepass1' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('PASSWORD_STRENGTH')
      }
    })
  })

  describe('emailSchema', () => {
    it('accepts valid email string', () => {
      const result = emailSchema.safeParse('user@example.com')
      expect(result.success).toBe(true)
    })

    it('rejects empty string', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('rejects invalid email format', () => {
      const result = emailSchema.safeParse('not-an-email')
      expect(result.success).toBe(false)
    })

    it('rejects email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@x.com'
      const result = emailSchema.safeParse(longEmail)
      expect(result.success).toBe(false)
    })
  })
})
