import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse({
      username: body.username,
      email: body.email,
      password: body.password,
    })

    const apiResponse = await fetch(`${process.env.BACKEND_API_URL}/auth/register_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
      }),
    })

    if (!apiResponse.ok) {
      if (apiResponse.status === 409) {
        const data = await apiResponse.json()
        return NextResponse.json(
          { success: false, error: data.detail || 'Username ou email já cadastrado' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Erro ao criar usuário' },
        { status: apiResponse.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid data provided' }, { status: 400 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
