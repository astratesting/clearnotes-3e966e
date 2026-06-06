import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, unauthorized } from '@/lib/api'
import { Resend } from 'resend'

// Email service using Resend
// Requires RESEND_API_KEY environment variable

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface EmailRequest {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

// POST /api/email/send - Send an email
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user?.id) {
    return unauthorized()
  }

  if (!resend) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 }
    )
  }

  try {
    const body: EmailRequest = await request.json()
    const { to, subject, html, text, from, cc, bcc } = body

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'To and subject are required' },
        { status: 400 }
      )
    }

    if (!html && !text) {
      return NextResponse.json(
        { error: 'Either html or text content is required' },
        { status: 400 }
      )
    }

    const fromEmail = from ?? process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    const result = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
    })

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// POST /api/email/send-action-items - Send meeting action items via email
export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return unauthorized()
  }

  if (!resend) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { meetingId, to } = body

    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    const { prisma } = await import('@/lib/prisma')

    // Fetch meeting with action items
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        userId: currentUser.id,
      },
      include: {
        actionItems: true,
        transcript: true,
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    const actionItemsList = meeting.actionItems
      .map((item) => `- ${item.description}${item.isCompleted ? ' (Completed)' : ''}`)
      .join('\n')

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0ea5e9; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .action-items { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .action-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .action-item:last-child { border-bottom: none; }
    .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Meeting Action Items</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">${meeting.title}</p>
    </div>
    <div class="content">
      <h2>Action Items</h2>
      <div class="action-items">
        ${meeting.actionItems.length > 0
          ? meeting.actionItems.map(item => `
            <div class="action-item">
              ${item.isCompleted ? '✓' : '○'} ${item.description}
            </div>
          `).join('')
          : '<p>No action items identified for this meeting.</p>'
        }
      </div>
      ${meeting.transcript?.summary ? `
        <h2>Summary</h2>
        <p>${meeting.transcript.summary}</p>
      ` : ''}
    </div>
    <div class="footer">
      <p>Sent via ClearNotes</p>
    </div>
  </div>
</body>
</html>
    `

    const recipient = to || currentUser.email

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: [recipient],
      subject: `Action Items: ${meeting.title}`,
      html: htmlContent,
      text: `Meeting: ${meeting.title}\n\nAction Items:\n${actionItemsList || 'No action items identified.'}\n\n${meeting.transcript?.summary ? `Summary:\n${meeting.transcript.summary}` : ''}`,
    })

    // Record that action items were emailed
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        // You could add a field to track email sent status
      },
    })

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
    })
  } catch (error) {
    console.error('Failed to send action items email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
