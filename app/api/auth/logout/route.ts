import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { destroySession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('universe_session')?.value

    if (token) {
      await destroySession(token)
    }

    const response = NextResponse.json({
      message: 'Logged out successfully',
    })

    response.cookies.delete('universe_session')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
