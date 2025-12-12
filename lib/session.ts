import { cookies } from 'next/headers'
import { prisma } from './db'
import { generateSecureToken } from './crypto'

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function createSession(userId: string) {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export async function getSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  return session
}

export async function deleteSession(token: string) {
  await prisma.session.delete({ where: { token } }).catch(() => {})
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  const session = await getSession(sessionToken)
  return session?.user || null
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function logout() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    await deleteSession(sessionToken)
  }

  await clearSessionCookie()
}
