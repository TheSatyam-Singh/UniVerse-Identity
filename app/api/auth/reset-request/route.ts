import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateToken } from '@/lib/crypto/password'
import { sendPasswordResetEmail } from '@/lib/email/brevo'
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
        message: 'If an account exists with this email, a password reset link has been sent.',
      })
    }

    // Generate reset token
    const token = generateToken(32)
    
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // Send password reset email
    await sendPasswordResetEmail(user.email, token)

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
