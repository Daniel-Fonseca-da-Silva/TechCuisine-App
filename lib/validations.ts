import { z } from 'zod'

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .pipe(z.email('Invalid email format'))
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'USERNAME_MIN_LENGTH')
    .max(50, 'USERNAME_MAX_LENGTH'),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .pipe(z.email('Invalid email format')),
  password: z
    .string()
    .min(8, 'PASSWORD_MIN_LENGTH')
    .max(255, 'Password must be less than 255 characters')
    .refine(
      (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^a-zA-Z0-9]/.test(p),
      'PASSWORD_STRENGTH',
    ),
})

export const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, 'PASSWORD_MIN_LENGTH')
      .max(255, 'Password must be less than 255 characters')
      .refine(
        (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^a-zA-Z0-9]/.test(p),
        'PASSWORD_STRENGTH',
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'PASSWORD_MISMATCH',
    path: ['confirm_password'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .pipe(z.email('Invalid email format'))

export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
