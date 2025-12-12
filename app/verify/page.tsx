'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setStatus('success')
      setMessage(data.message || 'Email verified successfully!')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <AuthCard
      title={status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}
      subtitle={status === 'loading' ? 'Please wait while we verify your email' : ''}
    >
      {status === 'loading' && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Verifying your email address...</p>
        </div>
      )}

      {status === 'success' && (
        <>
          <Alert variant="success">
            <p className="font-medium mb-2">{message}</p>
            <p className="text-sm">
              Redirecting you to login...
            </p>
          </Alert>
          <div className="mt-6 text-center">
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <Alert variant="error">
            <p className="font-medium mb-2">Verification Failed</p>
            <p className="text-sm">{message}</p>
          </Alert>
          <div className="mt-6 text-center space-y-2">
            <Link href="/signup">
              <Button>Create New Account</Button>
            </Link>
            <div>
              <Link href="/login" className="text-sm text-primary-600 hover:underline">
                Return to login
              </Link>
            </div>
          </div>
        </>
      )}
    </AuthCard>
  )
}
