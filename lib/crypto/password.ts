import * as argon2 from 'argon2'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

// Argon2 password hashing
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  })
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

// Generate secure random tokens
export function generateToken(length: number = 32): string {
  return nanoid(length)
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// PKCE (Proof Key for Code Exchange) helpers
export function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32))
}

export function generateCodeChallenge(verifier: string): string {
  return base64URLEncode(
    crypto.createHash('sha256').update(verifier).digest()
  )
}

export function verifyCodeChallenge(
  verifier: string,
  challenge: string,
  method: string
): boolean {
  if (method === 'plain') {
    return verifier === challenge
  }
  
  if (method === 'S256') {
    const computedChallenge = generateCodeChallenge(verifier)
    return computedChallenge === challenge
  }
  
  return false
}

function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Hash refresh tokens for storage
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Generate authorization code
export function generateAuthorizationCode(): string {
  return nanoid(32)
}

// Generate OAuth client credentials
export function generateClientId(): string {
  return `client_${nanoid(24)}`
}

export function generateClientSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}

// CSRF token generation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyCSRFToken(token: string, expected: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expected)
  )
}
