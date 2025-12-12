import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-4 rounded-2xl mb-8">
            <h1 className="text-4xl font-bold">UniVerse Identity</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Authentication & Identity Provider
          </h2>
          
          <p className="text-xl text-gray-600 mb-12">
            Production-ready OAuth2 and OpenID Connect provider for universelabs.tech
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">Create Account</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-primary-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure by Default</h3>
              <p className="text-gray-600 text-sm">
                RS256 JWT, PKCE, Argon2 hashing, and secure cookies
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-primary-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Redis caching, SSR, and optimized for 2G-5G networks
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-primary-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">OAuth2 & OIDC</h3>
              <p className="text-gray-600 text-sm">
                Full OAuth2 Authorization Server with OpenID Connect support
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4">For Developers</h3>
            <div className="text-left max-w-2xl mx-auto">
              <p className="text-gray-600 mb-4">
                Integrate UniVerse Identity into your applications using standard OAuth2 flows:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Authorization Code flow with PKCE for secure authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>OpenID Connect for identity verification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Refresh token rotation for enhanced security</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>JWKS endpoint for token verification</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/.well-known/openid-configuration" className="text-primary-600 hover:underline">
                  View OpenID Configuration →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
