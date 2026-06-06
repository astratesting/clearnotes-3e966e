import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, success, created, badRequest } from '@/lib/api'

// POST /api/transcripts - Create a transcript
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return unauthorized()
  }

  try {
    const body = await request.json()
    const { meetingId, content, actionItems, summary, speakers } = body

    if (!meetingId || !content) {
      return badRequest('Meeting ID and content are required')
    }

    // Verify meeting belongs to user
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        userId: currentUser.id,
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Check if transcript already exists
    const existingTranscript = await prisma.transcript.findUnique({
      where: { meetingId },
    })

    let transcript
    if (existingTranscript) {
      transcript = await prisma.transcript.update({
        where: { meetingId },
        data: {
          content,
          actionItems,
          summary,
          speakers,
        },
      })
    } else {
      transcript = await prisma.transcript.create({
        data: {
          meetingId,
          content,
          actionItems,
          summary,
          speakers: speakers ?? [],
        },
      })
    }

    // If action items were extracted, create them
    if (actionItems) {
      const lines = actionItems.split('\n').filter((line: string) => line.trim())
      for (const line of lines) {
        if (line.trim()) {
          await prisma.actionItem.create({
            data: {
              meetingId: meetingId,
              description: line.trim(),
            },
          })
        }
      }
    }

    return created(transcript)
  } catch (error) {
    console.error('Failed to create transcript:', error)
    return NextResponse.json(
      { error: 'Failed to create transcript' },
      { status: 500 }
    )
  }
}
