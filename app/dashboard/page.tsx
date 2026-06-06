import Link from 'next/link'
import { Mic, Plus, Search, Settings } from 'lucide-react'
import { MeetingList } from '@/components/MeetingList'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-calm-50 to-ocean-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-calm-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-calm-900">ClearNotes</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-calm-600 hover:text-calm-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-calm-600 hover:text-calm-900 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center text-ocean-700 font-medium">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-calm-900">Your Meetings</h1>
            <p className="text-calm-600">View and manage your meeting transcripts</p>
          </div>
          <Link
            href="/meetings/new"
            className="flex items-center gap-2 bg-ocean-600 text-white px-5 py-2.5 rounded-full hover:bg-ocean-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Meeting
          </Link>
        </div>

        <MeetingList />
      </div>
    </main>
  )
}