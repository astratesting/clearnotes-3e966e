import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, unauthorized, success, created, notFound, badRequest } from '@/lib/api'

// GET /api/meetings - List all meetings for current user
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user?.id) {
    return unauthorized()
  }

  const { searchParams } = new URL(request.url)
  const skip = parseInt(searchParams.get('skip') ?? '0')
  const limit = parseInt(searchParams.get('limit') ?? '100')

  try {
    const meetings = await prisma.meeting.findMany({
      where: { userId: user.id },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        transcript: {
          select: {
            id: true,
            summary: true,
          },
        },
        _count: {
          select: {
            actionItems: true,
          },
        },
      },
    })

    return success(meetings)
  } catch (error) {
    console.error('Failed to fetch meetings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    )
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()

  if (!currentUser?.id) {
    return unauthorized()
  }

  try {
    const body = await request.json()
    const { title, scheduledAt } = body

    if (!title) {
      return badRequest('Title is required')
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        userId: currentUser.id,
        status: 'scheduled',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        transcript: true,
      },
    })

    return created(meeting)
  } catch (error) {
    console.error('Failed to create meeting:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
