import Link from 'next/link'
import { Mic, FileText, Mail, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-calm-50 to-ocean-50">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-calm-900">ClearNotes</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/signin" className="text-calm-700 hover:text-calm-900 transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-ocean-600 text-white px-5 py-2.5 rounded-full hover:bg-ocean-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="px-8 py-20 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-calm-900 mb-6 leading-tight">
          Calm meetings.<br />
          <span className="text-ocean-600">Clear action items.</span>
        </h1>
        <p className="text-xl text-calm-600 max-w-2xl mx-auto mb-10">
          AI-powered meeting transcription that extracts action items and delivers them
to your inbox. Focus on the conversation, not the notes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-ocean-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-ocean-700 transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="/demo"
            className="bg-white text-calm-700 px-8 py-4 rounded-full text-lg font-medium border border-calm-200 hover:bg-calm-50 transition-colors"
          >
            See Demo
          </Link>
        </div>
      </section>

      <section className="px-8 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Mic className="w-6 h-6" />}
            title="Real-time Transcription"
            description="Joins Zoom and Google Meet calls to transcribe conversations in real-time with high accuracy."
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Smart Action Items"
            description="AI automatically extracts tasks, decisions, and follow-ups from your meetings."
          />
          <FeatureCard
            icon={<Mail className="w-6 h-6" />}
            title="Email Delivery"
            description="Sends beautifully formatted action items to all participants after each meeting."
          />
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-calm-200 hover:border-ocean-300 transition-colors">
      <div className="w-12 h-12 bg-ocean-50 rounded-xl flex items-center justify-center text-ocean-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-calm-900 mb-2">{title}</h3>
      <p className="text-calm-600">{description}</p>
    </div>
  )
}