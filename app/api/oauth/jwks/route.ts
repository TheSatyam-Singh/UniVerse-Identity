import { NextResponse } from 'next/server'
import * as crypto from 'crypto'

export async function GET() {
  try {
    const publicKeyPem = process.env.JWT_PUBLIC_KEY

    if (!publicKeyPem) {
      throw new Error('JWT_PUBLIC_KEY not configured')
    }

    // Extract the key from PEM format
    const publicKey = crypto.createPublicKey(publicKeyPem)
    const jwk = publicKey.export({ format: 'jwk' })

    // Add required JWKS fields
    const jwks = {
      keys: [
        {
          ...jwk,
          kid: '1',
          alg: 'RS256',
          use: 'sig',
        },
      ],
    }

    return NextResponse.json(jwks)
  } catch (error) {
    console.error('JWKS error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
