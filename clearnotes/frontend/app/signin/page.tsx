import Link from 'next/link'
import { SignInForm } from '@/components/SignInForm'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-calm-50 to-ocean-50 flex items-center justify-center p-8">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-calm-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-calm-900 mb-2 text-center">Welcome back</h1>
        <p className="text-calm-600 text-center mb-8">Sign in to your ClearNotes account</p>

        <SignInForm />

        <p className="text-center text-calm-600 mt-6">
          Do not have an account?{' '}
          <Link href="/signup" className="text-ocean-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}