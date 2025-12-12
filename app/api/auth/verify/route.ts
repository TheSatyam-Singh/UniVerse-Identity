import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    if (verificationToken.used) {
      return NextResponse.json(
        { error: 'Token has already been used' },
        { status: 400 }
      )
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      )
    }

    // Update user email verification status
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    })

    // Mark token as used
    await prisma.verificationToken.update({
      where: { token },
      data: { used: true },
    })

    return NextResponse.json({
      message: 'Email verified successfully',
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    )
  }
}
