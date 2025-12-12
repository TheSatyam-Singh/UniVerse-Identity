import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSecureToken } from '@/lib/crypto'
import { sendMagicLinkEmail } from '@/lib/email'
import { authRateLimiter } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (skip if not configured)
    if (authRateLimiter) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const { success } = await authRateLimiter.limit(ip)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, a magic link has been sent',
      })
    }

    // Create magic link token
    const token = generateSecureToken()
    await prisma.magicLinkToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    })

    // Send magic link email
    try {
      await sendMagicLinkEmail(user.email, token)
    } catch (emailError) {
      console.error('Failed to send magic link:', emailError)
    }

    return NextResponse.json({
      message: 'If an account exists, a magic link has been sent',
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
