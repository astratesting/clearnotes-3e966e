'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Could not create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-calm-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-calm-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-calm-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-calm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500"
          required
          minLength={8}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-ocean-600 text-white py-2.5 rounded-lg font-medium hover:bg-ocean-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}