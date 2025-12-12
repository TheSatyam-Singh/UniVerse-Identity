import { NextRequest, NextResponse } from 'next/server'
import { introspectToken } from '@/lib/oauth/authorization'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { active: false },
        { status: 200 }
      )
    }

    const result = await introspectToken(token)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Token introspection error:', error)
    return NextResponse.json(
      { active: false },
      { status: 200 }
    )
  }
}
