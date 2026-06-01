import { NextResponse } from 'next/server'

// This route was removed. All checkout flows now go through
// /api/subscriptions/checkout which proxies to the backend with user auth.
export async function POST() {
  return NextResponse.json(
    { error: 'Use /api/subscriptions/checkout instead' },
    { status: 410 }
  )
}
