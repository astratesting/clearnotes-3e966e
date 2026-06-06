'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mic } from 'lucide-react'

export default function NewMeetingPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } finally {
      setIsLoading(false)
    }
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

      <div className="px-8 py-12 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-calm-900 mb-6">Create New Meeting</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-calm-200">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-calm-700 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Product Roadmap Review"
              className="w-full px-4 py-3 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500"
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-6 py-3 border border-calm-300 rounded-lg text-calm-700 hover:bg-calm-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}