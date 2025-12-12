import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      id: session.userId,
      email: session.email,
      name: session.name,
      emailVerified: session.emailVerified,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
