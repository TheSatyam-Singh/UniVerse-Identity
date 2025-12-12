import { prisma } from '@/lib/db/prisma'
import { setSession, getSession, deleteSession } from '@/lib/redis/client'
import { generateToken } from '@/lib/crypto/password'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'universe_session'
const SESSION_EXPIRY = 30 * 24 * 60 * 60 // 30 days in seconds

export interface SessionData {
  userId: string
  email: string
  name?: string
  emailVerified: boolean
  sessionId: string
}

export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  const token = generateToken(48)
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY * 1000)

  // Store in database
  const session = await prisma.session.create({
    data: {
      userId,
      token,
      userAgent,
      ipAddress,
      expiresAt,
    },
  })

  // Get user data
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
    throw new Error('User not found')
  }

  // Store session data in Redis for fast access
  const sessionData: SessionData = {
    userId: user.id,
    email: user.email,
    name: user.name || undefined,
    emailVerified: !!user.emailVerified,
    sessionId: session.id,
  }

  await setSession(token, sessionData, SESSION_EXPIRY)

  return token
}

export async function getSessionData(token: string): Promise<SessionData | null> {
  // Try Redis first for performance
  let sessionData = await getSession(token)

  if (!sessionData) {
    // Fallback to database
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
          },
        },
      },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    sessionData = {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
      emailVerified: !!session.user.emailVerified,
      sessionId: session.id,
    }

    // Restore to Redis
    const expiresIn = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)
    if (expiresIn > 0) {
      await setSession(token, sessionData, expiresIn)
    }

    // Update last used timestamp
    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    })
  }

  return sessionData
}

export async function destroySession(token: string): Promise<void> {
  // Delete from Redis
  await deleteSession(token)

  // Delete from database
  await prisma.session.deleteMany({
    where: { token },
  })
}

export async function getCurrentSession(): Promise<SessionData | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return getSessionData(token)
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = cookies()
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies()
  
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getCurrentSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  return session
}

export async function requireVerifiedEmail(): Promise<SessionData> {
  const session = await requireAuth()
  
  if (!session.emailVerified) {
    throw new Error('Email not verified')
  }
  
  return session
}
