import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find and validate verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    if (verificationToken.used) {
      return NextResponse.json(
        { error: 'Token already used' },
        { status: 400 }
      )
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      )
    }

    // Mark token as used
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    })

    // Verify user email
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true,
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
