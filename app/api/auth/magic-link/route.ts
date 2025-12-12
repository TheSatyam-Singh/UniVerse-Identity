import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateToken } from '@/lib/crypto/password'
import { sendMagicLinkEmail } from '@/lib/email/brevo'
import { emailRateLimit } from '@/lib/redis/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const identifier = request.ip || email
    const { success } = await emailRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a magic link has been sent.',
      })
    }

    // Generate magic link token
    const token = generateToken(32)
    
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token,
        type: 'magic_link',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    })

    // Send magic link email
    await sendMagicLinkEmail(user.email, token)

    return NextResponse.json({
      message: 'If an account exists with this email, a magic link has been sent.',
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
