import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, success, notFound, badRequest } from '@/lib/api'

// GET /api/meetings/:id - Get a specific meeting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return unauthorized()
  }

  const { id } = params

  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
      include: {
        transcript: true,
        actionItems: true,
      },
    })

    if (!meeting) {
      return notFound('Meeting')
    }

    return success(meeting)
  } catch (error) {
    console.error('Failed to fetch meeting:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    )
  }
}

// PATCH /api/meetings/:id - Update a meeting
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return unauthorized()
  }

  const { id } = params

  try {
    // Check if meeting exists and belongs to user
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
    })

    if (!existingMeeting) {
      return notFound('Meeting')
    }

    const body = await request.json()
    const { title, status, startedAt, endedAt, durationMinutes } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (status !== undefined) updateData.status = status
    if (startedAt !== undefined) updateData.startedAt = new Date(startedAt)
    if (endedAt !== undefined) updateData.endedAt = new Date(endedAt)
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes

    const meeting = await prisma.meeting.update({
      where: { id },
      data: updateData,
      include: {
        transcript: true,
        actionItems: true,
      },
    })

    return success(meeting)
  } catch (error) {
    console.error('Failed to update meeting:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    )
  }
}

// DELETE /api/meetings/:id - Delete a meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return unauthorized()
  }

  const { id } = params

  try {
    // Check if meeting exists and belongs to user
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId: currentUser.id,
      },
    })

    if (!existingMeeting) {
      return notFound('Meeting')
    }

    await prisma.meeting.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Failed to delete meeting:', error)
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    )
  }
}
