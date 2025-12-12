import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose'

let privateKey: any = null
let publicKey: any = null

async function getPrivateKey() {
  if (!privateKey) {
    const key = process.env.JWT_PRIVATE_KEY || ''
    privateKey = await importPKCS8(key, 'RS256')
  }
  return privateKey
}

async function getPublicKey() {
  if (!publicKey) {
    const key = process.env.JWT_PUBLIC_KEY || ''
    publicKey = await importSPKI(key, 'RS256')
  }
  return publicKey
}

export interface AccessTokenPayload {
  sub: string // user id
  email: string
  name?: string
  scope?: string
  client_id?: string
}

export interface IDTokenPayload extends AccessTokenPayload {
  email_verified?: boolean
  picture?: string
  updated_at?: number
}

export async function generateAccessToken(
  payload: AccessTokenPayload,
  expiresIn: string = '15m'
): Promise<string> {
  const key = await getPrivateKey()
  
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(process.env.JWT_ISSUER || 'https://universelabs.tech')
    .setAudience(payload.client_id || process.env.JWT_AUDIENCE || 'https://universelabs.tech')
    .setSubject(payload.sub)
    .setExpirationTime(expiresIn)
    .sign(key)
  
  return jwt
}

export async function generateIDToken(
  payload: IDTokenPayload,
  nonce?: string,
  expiresIn: string = '1h'
): Promise<string> {
  const key = await getPrivateKey()
  
  const claims: any = {
    ...payload,
    email_verified: payload.email_verified ?? false,
  }
  
  if (nonce) {
    claims.nonce = nonce
  }
  
  if (payload.picture) {
    claims.picture = payload.picture
  }
  
  const jwt = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(process.env.JWT_ISSUER || 'https://universelabs.tech')
    .setAudience(payload.client_id || process.env.JWT_AUDIENCE || 'https://universelabs.tech')
    .setSubject(payload.sub)
    .setExpirationTime(expiresIn)
    .sign(key)
  
  return jwt
}

export async function verifyToken(token: string): Promise<any> {
  const key = await getPublicKey()
  
  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: process.env.JWT_ISSUER || 'https://universelabs.tech',
    })
    return payload
  } catch (error) {
    return null
  }
}

export async function getJWKS() {
  const key = await getPublicKey()
  
  // Export the public key in JWK format
  const jwk = await crypto.subtle.exportKey('jwk', key)
  
  return {
    keys: [
      {
        ...jwk,
        alg: 'RS256',
        use: 'sig',
        kid: 'universe-identity-key-1',
      },
    ],
  }
}

// Get public key in PEM format for JWKS endpoint
export function getPublicKeyPEM(): string {
  return process.env.JWT_PUBLIC_KEY || ''
}
