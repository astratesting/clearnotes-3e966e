import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

export function notFound(resource = 'Resource') {
  return NextResponse.json(
    { error: `${resource} not found` },
    { status: 404 }
  )
}

export function badRequest(message = 'Bad request') {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

export function internalError(message = 'Internal server error') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}

export function success(data: unknown) {
  return NextResponse.json(data)
}

export function created(data: unknown) {
  return NextResponse.json(data, { status: 201 })
}
