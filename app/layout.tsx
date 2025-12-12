import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UniVerse Identity - OAuth2 & OIDC Provider',
  description: 'Secure authentication and identity management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
