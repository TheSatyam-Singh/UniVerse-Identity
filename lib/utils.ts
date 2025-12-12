import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  return 'http://localhost:3000'
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  )
}

export function getPasswordStrength(password: string): {
  score: number
  feedback: string
} {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) score++
  else feedback.push('at least 8 characters')

  if (password.length >= 12) score++

  if (/[a-z]/.test(password)) score++
  else feedback.push('a lowercase letter')

  if (/[A-Z]/.test(password)) score++
  else feedback.push('an uppercase letter')

  if (/[0-9]/.test(password)) score++
  else feedback.push('a number')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else feedback.push('a special character')

  let strengthText = ''
  if (score <= 2) strengthText = 'Weak'
  else if (score <= 4) strengthText = 'Medium'
  else strengthText = 'Strong'

  const feedbackText =
    feedback.length > 0
      ? `Add ${feedback.join(', ')}`
      : 'Great password!'

  return { score, feedback: `${strengthText}. ${feedbackText}` }
}
