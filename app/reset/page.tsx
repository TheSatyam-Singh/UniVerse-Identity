'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import Link from 'next/link'

export default function ResetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setEmailSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthCard
        title="Password Reset"
        subtitle="Your password has been updated"
      >
        <Alert variant="success">
          <p className="font-medium mb-2">Success!</p>
          <p className="text-sm">
            Your password has been reset successfully. Redirecting to login...
          </p>
        </Alert>
        <div className="mt-6 text-center">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </AuthCard>
    )
  }

  if (emailSent) {
    return (
      <AuthCard
        title="Check Your Email"
        subtitle="Password reset link sent"
      >
        <Alert variant="success">
          <p className="font-medium mb-2">Email Sent!</p>
          <p className="text-sm">
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your email and click the link to reset your password.
          </p>
        </Alert>
        <div className="mt-6 text-center">
          <Link href="/login" className="text-primary-600 hover:underline">
            Return to login
          </Link>
        </div>
      </AuthCard>
    )
  }

  // If token is present, show reset password form
  if (token) {
    return (
      <AuthCard
        title="Reset Password"
        subtitle="Enter your new password"
      >
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="text-xs text-gray-500">
            Password must be at least 8 characters with uppercase, lowercase, and numbers
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Reset Password
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-primary-600 hover:underline">
            Back to login
          </Link>
        </div>
      </AuthCard>
    )
  }

  // Show request reset form
  return (
    <AuthCard
      title="Forgot Password"
      subtitle="We'll send you a reset link"
    >
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleRequestReset} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <Button type="submit" className="w-full" loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-primary-600 hover:underline">
          Back to login
        </Link>
      </div>
    </AuthCard>
  )
}
