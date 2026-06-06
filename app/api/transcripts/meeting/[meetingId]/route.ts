import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, success, notFound } from '@/lib/api'

// GET /api/transcripts/meeting/:meetingId - Get transcript for a meeting
export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return unauthorized()
  }

  const { meetingId } = params

  try {
    // Verify meeting belongs to user
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        userId: currentUser.id,
      },
    })

    if (!meeting) {
      return notFound('Meeting')
    }

    const transcript = await prisma.transcript.findUnique({
      where: { meetingId },
    })

    if (!transcript) {
      return notFound('Transcript')
    }

    return success(transcript)
  } catch (error) {
    console.error('Failed to fetch transcript:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}

// PATCH /api/transcripts/meeting/:meetingId - Update transcript for a meeting
export async function PATCH(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return unauthorized()
  }

  const { meetingId } = params

  try {
    // Verify meeting belongs to user
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        userId: currentUser.id,
      },
    })

    if (!meeting) {
      return notFound('Meeting')
    }

    const body = await request.json()
    const { content, actionItems, summary, speakers } = body

    const updateData: Record<string, unknown> = {}
    if (content !== undefined) updateData.content = content
    if (actionItems !== undefined) updateData.actionItems = actionItems
    if (summary !== undefined) updateData.summary = summary
    if (speakers !== undefined) updateData.speakers = speakers

    const transcript = await prisma.transcript.update({
      where: { meetingId },
      data: updateData,
    })

    return success(transcript)
  } catch (error) {
    console.error('Failed to update transcript:', error)
    return NextResponse.json(
      { error: 'Failed to update transcript' },
      { status: 500 }
    )
  }
}
