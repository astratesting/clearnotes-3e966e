'use client'

import Link from 'next/link'
import { Calendar, Clock, Users } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  date: string
  duration: string
  participants: number
  status: 'completed' | 'in_progress' | 'scheduled'
}

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Product Roadmap Review',
    date: '2024-01-15 14:00',
    duration: '45 min',
    participants: 5,
    status: 'completed',
  },
  {
    id: '2',
    title: 'Weekly Team Sync',
    date: '2024-01-16 10:00',
    duration: '30 min',
    participants: 8,
    status: 'completed',
  },
  {
    id: '3',
    title: 'Design Critique',
    date: '2024-01-17 15:00',
    duration: '60 min',
    participants: 4,
    status: 'scheduled',
  },
]

export function MeetingList() {
  return (
    <div className="space-y-4">
      {mockMeetings.map((meeting) => (
        <Link
          key={meeting.id}
          href={`/meetings/${meeting.id}`}
          className="block bg-white p-6 rounded-xl border border-calm-200 hover:border-ocean-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-calm-900 mb-2">{meeting.title}</h3>
              <div className="flex items-center gap-4 text-sm text-calm-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {meeting.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {meeting.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {meeting.participants} participants
                </span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                meeting.status === 'completed'
                  ? 'bg-green-50 text-green-700'
                  : meeting.status === 'in_progress'
                  ? 'bg-ocean-50 text-ocean-700'
                  : 'bg-calm-100 text-calm-700'
              }`}
            >
              {meeting.status.replace('_', ' ')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}