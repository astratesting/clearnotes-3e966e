import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, unauthorized } from '@/lib/api'

// GET /api/integrations/zoom - Initiate Zoom OAuth flow
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user?.id) {
    return unauthorized()
  }

  const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
  const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI

  if (!ZOOM_CLIENT_ID || !ZOOM_REDIRECT_URI) {
    return NextResponse.json(
      { error: 'Zoom integration not configured' },
      { status: 500 }
    )
  }

  // Build Zoom OAuth URL
  const scopes = [
    'meeting:read',
    'meeting:write',
    'recording:read',
    'user:read',
  ].join(' ')

  const authUrl = new URL('https://zoom.us/oauth/authorize')
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', ZOOM_CLIENT_ID)
  authUrl.searchParams.append('redirect_uri', ZOOM_REDIRECT_URI)
  authUrl.searchParams.append('scope', scopes)

  // Store state for CSRF protection
  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64url')
  authUrl.searchParams.append('state', state)

  return NextResponse.redirect(authUrl.toString())
}

// POST /api/integrations/zoom/callback - Handle OAuth callback (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, state } = body

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing authorization code or state' },
        { status: 400 }
      )
    }

    const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
    const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
    const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI

    if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_REDIRECT_URI) {
      return NextResponse.json(
        { error: 'Zoom credentials not configured' },
        { status: 500 }
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: ZOOM_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Zoom token exchange failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to obtain access token' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()

    // Get user info from Zoom
    const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get Zoom user info' },
        { status: 400 }
      )
    }

    const zoomUser = await userResponse.json()

    // Store integration in database
    const { prisma } = await import('@/lib/prisma')
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())

    await prisma.integration.upsert({
      where: {
        userId_provider_accountId: {
          userId: stateData.userId,
          provider: 'zoom',
          accountId: zoomUser.id,
        },
      },
      create: {
        userId: stateData.userId,
        provider: 'zoom',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        accountId: zoomUser.id,
        accountEmail: zoomUser.email,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        isActive: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Zoom OAuth callback error:', error)
    return NextResponse.json(
      { error: 'OAuth callback failed' },
      { status: 500 }
    )
  }
}
