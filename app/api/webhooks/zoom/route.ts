import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Zoom webhook verification and handling
// Reference: https://developers.zoom.us/docs/api/rest/webhook-reference/

const ZOOM_WEBHOOK_SECRET = process.env.ZOOM_WEBHOOK_SECRET

function verifyZoomWebhook(payload: string, signature: string, timestamp: string): boolean {
  if (!ZOOM_WEBHOOK_SECRET) {
    console.error('ZOOM_WEBHOOK_SECRET not configured')
    return false
  }

  const message = `v0:${timestamp}:${payload}`
  const hash = crypto
    .createHmac('sha256', ZOOM_WEBHOOK_SECRET)
    .update(message)
    .digest('hex')
  const expectedSignature = `v0=${hash}`

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload = JSON.parse(body)

    // Handle Zoom webhook validation (URL verification)
    if (payload.event === 'endpoint.url_validation') {
      const plainToken = payload.payload?.plainToken
      if (!plainToken || !ZOOM_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }

      const encryptedToken = crypto
        .createHmac('sha256', ZOOM_WEBHOOK_SECRET)
        .update(plainToken)
        .digest('hex')

      return NextResponse.json({
        plainToken,
        encryptedToken,
      })
    }

    // Verify webhook signature
    const signature = request.headers.get('x-zm-signature') ?? ''
    const timestamp = request.headers.get('x-zm-request-timestamp') ?? ''

    if (!verifyZoomWebhook(body, signature, timestamp)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle different Zoom events
    const event = payload.event

    switch (event) {
      case 'meeting.started': {
        const meetingId = payload.payload?.object?.id
        const meetingTitle = payload.payload?.object?.topic ?? 'Zoom Meeting'

        // Find user by Zoom integration
        const integration = await prisma.integration.findFirst({
          where: {
            provider: 'zoom',
            accountId: payload.payload?.object?.host_id,
          },
        })

        if (integration) {
          await prisma.meeting.create({
            data: {
              title: meetingTitle,
              userId: integration.userId,
              status: 'in_progress',
              platform: 'zoom',
              platformMeetingId: meetingId,
              startedAt: new Date(),
            },
          })
        }
        break
      }

      case 'meeting.ended': {
        const meetingId = payload.payload?.object?.id

        const meeting = await prisma.meeting.findFirst({
          where: {
            platform: 'zoom',
            platformMeetingId: meetingId,
          },
        })

        if (meeting) {
          await prisma.meeting.update({
            where: { id: meeting.id },
            data: {
              status: 'completed',
              endedAt: new Date(),
            },
          })
        }
        break
      }

      case 'recording.completed': {
        // Handle recording completion - could trigger transcription processing
        const meetingId = payload.payload?.object?.id
        const downloadUrl = payload.payload?.object?.recording_files?.[0]?.download_url

        if (meetingId && downloadUrl) {
          // Store recording info for processing
          console.log(`Recording completed for meeting ${meetingId}: ${downloadUrl}`)
          // TODO: Trigger transcription processing
        }
        break
      }

      default:
        console.log(`Unhandled Zoom event: ${event}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Zoom webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
