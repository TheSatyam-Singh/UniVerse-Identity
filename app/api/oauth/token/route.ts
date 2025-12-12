import { NextRequest, NextResponse } from 'next/server'
import { exchangeAuthorizationCode, refreshAccessToken } from '@/lib/oauth/authorization'
import { apiRateLimit } from '@/lib/redis/client'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous'
    const { success } = await apiRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'too_many_requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      grant_type,
      code,
      redirect_uri,
      client_id,
      client_secret,
      code_verifier,
      refresh_token,
    } = body

    // Validate grant_type
    if (!grant_type) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'grant_type is required',
        },
        { status: 400 }
      )
    }

    // Handle authorization_code grant
    if (grant_type === 'authorization_code') {
      if (!code || !redirect_uri || !client_id) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'Missing required parameters',
          },
          { status: 400 }
        )
      }

      try {
        const tokens = await exchangeAuthorizationCode(
          code,
          client_id,
          redirect_uri,
          code_verifier
        )

        return NextResponse.json({
          access_token: tokens.accessToken,
          id_token: tokens.idToken,
          refresh_token: tokens.refreshToken,
          token_type: tokens.tokenType,
          expires_in: tokens.expiresIn,
        })
      } catch (error: any) {
        return NextResponse.json(
          {
            error: error.message,
            error_description: 'Authorization code exchange failed',
          },
          { status: 400 }
        )
      }
    }

    // Handle refresh_token grant
    if (grant_type === 'refresh_token') {
      if (!refresh_token || !client_id) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description: 'Missing required parameters',
          },
          { status: 400 }
        )
      }

      try {
        const tokens = await refreshAccessToken(refresh_token, client_id)

        return NextResponse.json({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          token_type: tokens.tokenType,
          expires_in: tokens.expiresIn,
        })
      } catch (error: any) {
        return NextResponse.json(
          {
            error: error.message,
            error_description: 'Refresh token failed',
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code and refresh_token are supported',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('OAuth token error:', error)
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'An error occurred while processing the request',
      },
      { status: 500 }
    )
  }
}
