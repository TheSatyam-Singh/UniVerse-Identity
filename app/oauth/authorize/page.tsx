'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export default function OAuthAuthorizePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [client, setClient] = useState<any>(null)
  const [scopes, setScopes] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)

  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const scope = searchParams.get('scope') || 'openid profile email'
  const state = searchParams.get('state')
  const responseType = searchParams.get('response_type')
  const codeChallenge = searchParams.get('code_challenge')
  const codeChallengeMethod = searchParams.get('code_challenge_method')
  const nonce = searchParams.get('nonce')

  useEffect(() => {
    validateRequest()
  }, [])

  const validateRequest = async () => {
    try {
      // Check if user is logged in
      const userRes = await fetch('/api/auth/me')
      if (!userRes.ok) {
        // Redirect to login with return URL
        const loginUrl = `/login?redirect=${encodeURIComponent(window.location.href)}`
        router.push(loginUrl)
        return
      }

      const userData = await userRes.json()
      setUser(userData)

      // Validate OAuth request
      const res = await fetch('/api/oauth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          redirectUri,
          scope,
          responseType,
          codeChallenge,
          codeChallengeMethod,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid OAuth request')
        setLoading(false)
        return
      }

      setClient(data.client)
      setScopes(scope.split(' '))
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleAuthorize = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          redirectUri,
          scope,
          state,
          codeChallenge,
          codeChallengeMethod,
          nonce,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authorization failed')
      }

      // Redirect back to client with authorization code
      const redirectUrl = new URL(redirectUri!)
      redirectUrl.searchParams.set('code', data.code)
      if (state) {
        redirectUrl.searchParams.set('state', state)
      }

      window.location.href = redirectUrl.toString()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDeny = () => {
    if (redirectUri) {
      const redirectUrl = new URL(redirectUri)
      redirectUrl.searchParams.set('error', 'access_denied')
      if (state) {
        redirectUrl.searchParams.set('state', state)
      }
      window.location.href = redirectUrl.toString()
    } else {
      router.push('/')
    }
  }

  if (loading && !error) {
    return (
      <AuthCard title="Authorizing..." subtitle="">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AuthCard>
    )
  }

  if (error) {
    return (
      <AuthCard title="Authorization Error" subtitle="">
        <Alert variant="error">{error}</Alert>
        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </AuthCard>
    )
  }

  const scopeDescriptions: Record<string, string> = {
    openid: 'Access your basic profile information',
    profile: 'Access your full profile (name, picture)',
    email: 'Access your email address',
    offline_access: 'Maintain access while you\'re offline',
  }

  return (
    <AuthCard
      title="Authorize Application"
      subtitle={`${client?.name || 'An application'} wants to access your account`}
    >
      <div className="space-y-6">
        {client?.logoUrl && (
          <div className="text-center">
            <img
              src={client.logoUrl}
              alt={client.name}
              className="h-16 w-16 mx-auto rounded-lg"
            />
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            This application will be able to:
          </p>
          <ul className="space-y-2">
            {scopes.map((scope) => (
              <li key={scope} className="flex items-start text-sm text-gray-600">
                <svg
                  className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {scopeDescriptions[scope] || scope}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-gray-500 text-center">
          Signed in as <strong>{user?.email}</strong>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleDeny}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAuthorize}
            className="flex-1"
            loading={loading}
          >
            Authorize
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By authorizing, you allow this app to use your information in accordance with their terms of service and privacy policy.
        </p>
      </div>
    </AuthCard>
  )
}
