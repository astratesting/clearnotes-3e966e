import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, unauthorized } from '@/lib/api'

// GET /api/integrations/google-meet - Initiate Google OAuth flow
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user?.id) {
    return unauthorized()
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return NextResponse.json(
      { error: 'Google integration not configured' },
      { status: 500 }
    )
  }

  // Build Google OAuth URL
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
    'https://www.googleapis.com/auth/meetings.space.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID)
  authUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI)
  authUrl.searchParams.append('scope', scopes)
  authUrl.searchParams.append('access_type', 'offline')
  authUrl.searchParams.append('prompt', 'consent')

  // State for CSRF protection
  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64url')
  authUrl.searchParams.append('state', state)

  return NextResponse.redirect(authUrl.toString())
}

// POST /api/integrations/google-meet/callback - Handle OAuth callback
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

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      return NextResponse.json(
        { error: 'Google credentials not configured' },
        { status: 500 }
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Google token exchange failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to obtain access token' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get Google user info' },
        { status: 400 }
      )
    }

    const googleUser = await userInfoResponse.json()

    // Store integration
    const { prisma } = await import('@/lib/prisma')
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())

    await prisma.integration.upsert({
      where: {
        userId_provider_accountId: {
          userId: stateData.userId,
          provider: 'google',
          accountId: googleUser.id,
        },
      },
      create: {
        userId: stateData.userId,
        provider: 'google',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        accountId: googleUser.id,
        accountEmail: googleUser.email,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? undefined,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        isActive: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.json(
      { error: 'OAuth callback failed' },
      { status: 500 }
    )
  }
}
