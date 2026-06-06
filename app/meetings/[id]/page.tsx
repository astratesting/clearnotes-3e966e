import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mic, Calendar, Clock, Users, CheckCircle } from 'lucide-react'

interface MeetingPageProps {
  params: {
    id: string
  }
}

interface Meeting {
  id: string
  title: string
  date: string
  duration: string
  participants: number
  status: 'completed' | 'in_progress' | 'scheduled'
  transcript: string
  actionItems: string[]
}

const mockMeeting: Meeting = {
  id: '1',
  title: 'Product Roadmap Review',
  date: '2024-01-15 14:00',
  duration: '45 min',
  participants: 5,
  status: 'completed',
  transcript: `Sarah: Good morning everyone. Let's review the Q1 roadmap.

John: Thanks Sarah. I've prepared the timeline for the new features.

Sarah: Great. Can we start with the transcription feature?

Mike: Yes, that's on track. We should have it ready by next week.

Sarah: Perfect. And the email delivery system?

John: That's also progressing well. We've tested it with several providers.

Sarah: Excellent. Any blockers?

Mike: No major blockers at this time.

Sarah: Great, let's wrap up. Thanks everyone.`,
  actionItems: [
    'Mike to complete transcription feature by Jan 22',
    'John to finalize email delivery testing',
    'Sarah to schedule next review meeting',
  ],
}

export default function MeetingPage({ params }: MeetingPageProps) {
  const meeting = mockMeeting

  if (meeting.id !== params.id) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-calm-50 to-ocean-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-calm-200">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-calm-900">ClearNotes</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-calm-600 hover:text-calm-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="px-8 py-8 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl border border-calm-200 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-calm-900 mb-2">{meeting.title}</h1>
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
                  : 'bg-ocean-50 text-ocean-700'
              }`}
            >
              {meeting.status}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-calm-200">
            <h2 className="text-lg font-semibold text-calm-900 mb-4">Transcript</h2>
            <div className="prose prose-sm max-h-96 overflow-y-auto">
              {meeting.transcript.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-calm-700 mb-3 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-calm-200">
            <h2 className="text-lg font-semibold text-calm-900 mb-4">Action Items</h2>
            <div className="space-y-3">
              {meeting.actionItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-calm-50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
                  <span className="text-calm-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}