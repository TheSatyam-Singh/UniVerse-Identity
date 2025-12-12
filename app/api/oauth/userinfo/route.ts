import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/crypto/jwt'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user info from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return OIDC standard userinfo response
    const userinfo: any = {
      sub: user.id,
      email: user.email,
      email_verified: !!user.emailVerified,
    }

    // Include optional claims based on scope
    const scopes = (payload.scope as string)?.split(' ') || []

    if (scopes.includes('profile')) {
      userinfo.name = user.name
      if (user.image) {
        userinfo.picture = user.image
      }
      userinfo.updated_at = Math.floor(user.updatedAt.getTime() / 1000)
    }

    return NextResponse.json(userinfo)
  } catch (error) {
    console.error('Userinfo error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
