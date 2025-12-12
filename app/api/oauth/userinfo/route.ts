import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/crypto'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify and decode token
    let payload
    try {
      payload = await verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'Token verification failed' },
        { status: 401 }
      )
    }

    const userId = payload.sub as string

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'User not found' },
        { status: 401 }
      )
    }

    // Return OIDC standard claims
    return NextResponse.json({
      sub: user.id,
      email: user.email,
      email_verified: user.emailVerified,
      name: user.name,
    })
  } catch (error) {
    console.error('UserInfo error:', error)
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    )
  }
}
