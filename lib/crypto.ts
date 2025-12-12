import * as crypto from 'crypto'
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose'

// Generate RSA key pair (run once and store in env vars)
export async function generateKeyPair() {
  return new Promise<{ privateKey: string; publicKey: string }>((resolve, reject) => {
    crypto.generateKeyPair(
      'rsa',
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      },
      (err, publicKey, privateKey) => {
        if (err) reject(err)
        else resolve({ privateKey, publicKey })
      }
    )
  })
}

// Get private key for signing
export async function getPrivateKey() {
  const privateKeyPem = process.env.JWT_PRIVATE_KEY
  if (!privateKeyPem) {
    throw new Error('JWT_PRIVATE_KEY not configured')
  }
  return await importPKCS8(privateKeyPem, 'RS256')
}

// Get public key for verification
export async function getPublicKey() {
  const publicKeyPem = process.env.JWT_PUBLIC_KEY
  if (!publicKeyPem) {
    throw new Error('JWT_PUBLIC_KEY not configured')
  }
  return await importSPKI(publicKeyPem, 'RS256')
}

// Create access token (JWT with RS256)
export async function createAccessToken(userId: string, scope: string = 'openid profile email') {
  const privateKey = await getPrivateKey()
  const issuer = process.env.OAUTH_ISSUER || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return await new SignJWT({
    sub: userId,
    scope,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(issuer)
    .setExpirationTime('15m')
    .sign(privateKey)
}

// Create ID token (OIDC)
export async function createIdToken(
  userId: string,
  email: string,
  name?: string | null,
  clientId?: string
) {
  const privateKey = await getPrivateKey()
  const issuer = process.env.OAUTH_ISSUER || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return await new SignJWT({
    sub: userId,
    email,
    name: name || undefined,
    email_verified: true,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(clientId || issuer)
    .setExpirationTime('1h')
    .sign(privateKey)
}

// Verify JWT token
export async function verifyToken(token: string) {
  const publicKey = await getPublicKey()
  const issuer = process.env.OAUTH_ISSUER || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { payload } = await jwtVerify(token, publicKey, {
    issuer,
  })

  return payload
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url')
}

// Hash password
export function hashPassword(password: string): string {
  const bcrypt = require('bcryptjs')
  return bcrypt.hashSync(password, 12)
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  const bcrypt = require('bcryptjs')
  return bcrypt.compareSync(password, hash)
}

// Generate PKCE code verifier
export function generateCodeVerifier(): string {
  return generateSecureToken(32)
}

// Generate PKCE code challenge from verifier
export function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')
}

// Verify PKCE code challenge
export function verifyCodeChallenge(verifier: string, challenge: string): boolean {
  return generateCodeChallenge(verifier) === challenge
}
