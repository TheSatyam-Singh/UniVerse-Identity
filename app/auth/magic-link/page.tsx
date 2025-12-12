'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function MagicLinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Invalid magic link')
      return
    }

    const loginWithMagicLink = async () => {
      try {
        const res = await fetch('/api/auth/magic-link/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage('Successfully logged in!')
          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          setStatus('error')
          setMessage(data.error || 'Login failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred. Please try again.')
      }
    }

    loginWithMagicLink()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Signing you in...</h2>
            <p className="mt-2 text-gray-600">Please wait</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Success!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Login Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Try Again
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  )
}
