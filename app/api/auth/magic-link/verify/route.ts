import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/session'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find and validate magic link token
    const magicLinkToken = await prisma.magicLinkToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!magicLinkToken) {
      return NextResponse.json(
        { error: 'Invalid magic link' },
        { status: 400 }
      )
    }

    if (magicLinkToken.used) {
      return NextResponse.json(
        { error: 'Magic link already used' },
        { status: 400 }
      )
    }

    if (magicLinkToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Magic link has expired' },
        { status: 400 }
      )
    }

    // Mark token as used
    await prisma.magicLinkToken.update({
      where: { id: magicLinkToken.id },
      data: { used: true },
    })

    // Create session
    const { token: sessionToken, expiresAt } = await createSession(magicLinkToken.user.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: magicLinkToken.user.id,
        email: magicLinkToken.user.email,
        name: magicLinkToken.user.name,
      },
    })
  } catch (error) {
    console.error('Magic link verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
