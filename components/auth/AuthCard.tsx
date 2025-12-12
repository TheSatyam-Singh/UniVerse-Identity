'use client'

import { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-xl mb-4">
            <h1 className="text-2xl font-bold">UniVerse Identity</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          {children}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Secured by UniVerse Identity • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
