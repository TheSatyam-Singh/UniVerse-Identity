import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      )
    }

    const client = await prisma.oAuthClient.findUnique({
      where: { clientId },
      select: {
        clientId: true,
        name: true,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Client fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
