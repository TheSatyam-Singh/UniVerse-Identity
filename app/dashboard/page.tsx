import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import Link from 'next/link'

async function LogoutButton() {
  async function handleLogout() {
    'use server'
    const { logout } = await import('@/lib/session')
    await logout()
    redirect('/auth/login')
  }

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
      >
        Logout
      </button>
    </form>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">UniVerse Identity</h1>
            </div>
            <div className="flex items-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user.name}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email Verified</p>
              <p className="font-medium text-gray-900">
                {user.emailVerified ? (
                  <span className="text-green-600">✓ Verified</span>
                ) : (
                  <span className="text-yellow-600">Not verified</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">OAuth2 Provider</h3>
            <p className="text-sm text-gray-600 mb-4">
              This platform acts as an OAuth2 and OpenID Connect provider
            </p>
            <Link
              href="/.well-known/openid-configuration"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Configuration →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ RS256 JWT Tokens</li>
              <li>✓ PKCE Support</li>
              <li>✓ Rotating Refresh Tokens</li>
              <li>✓ Rate Limiting</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Email Verification</li>
              <li>✓ Magic Link Login</li>
              <li>✓ Consent Management</li>
              <li>✓ Secure Cookies</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">API Endpoints</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-mono text-sm text-gray-700">GET /api/oauth/authorize</p>
              <p className="text-xs text-gray-600">Authorization endpoint (OAuth2)</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-mono text-sm text-gray-700">POST /api/oauth/token</p>
              <p className="text-xs text-gray-600">Token endpoint (OAuth2)</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-mono text-sm text-gray-700">GET /api/oauth/userinfo</p>
              <p className="text-xs text-gray-600">UserInfo endpoint (OIDC)</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-mono text-sm text-gray-700">GET /api/oauth/jwks</p>
              <p className="text-xs text-gray-600">JSON Web Key Set</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-mono text-sm text-gray-700">GET /.well-known/openid-configuration</p>
              <p className="text-xs text-gray-600">OpenID Connect Discovery</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
