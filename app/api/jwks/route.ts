import { NextResponse } from 'next/server'
import { exportJWK, importSPKI } from 'jose'

export async function GET() {
  try {
    const publicKeyPEM = process.env.JWT_PUBLIC_KEY || ''
    
    if (!publicKeyPEM) {
      return NextResponse.json(
        { error: 'Public key not configured' },
        { status: 500 }
      )
    }

    // Import the public key
    const publicKey = await importSPKI(publicKeyPEM, 'RS256')
    
    // Export as JWK
    const jwk = await exportJWK(publicKey)

    const jwks = {
      keys: [
        {
          ...jwk,
          alg: 'RS256',
          use: 'sig',
          kid: 'universe-identity-key-1',
        },
      ],
    }

    return NextResponse.json(jwks, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('JWKS error:', error)
    return NextResponse.json(
      { error: 'Failed to generate JWKS' },
      { status: 500 }
    )
  }
}
