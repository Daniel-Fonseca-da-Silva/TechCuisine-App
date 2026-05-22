import { NextRequest, NextResponse } from 'next/server'
import { immediateCleanup } from '@/lib/token-cleanup'

/**
 * Endpoint for manual token cleanup
 * Useful for administration and maintenance
 */
export async function POST(request: NextRequest) {
  try {
    // Check if it is an authorized request (optional)
    const authHeader = request.headers.get('authorization')
    const adminKey = process.env.ADMIN_CLEANUP_KEY
    
    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Execute immediate cleanup
    const cleanedCount = await immediateCleanup()
    
    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      cleanedTokens: cleanedCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error cleaning tokens:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Endpoint to check cleanup status
 */
export async function GET() {
  try {
    const cleanedCount = await immediateCleanup()
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup status',
      cleanedTokens: cleanedCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error checking cleanup status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
