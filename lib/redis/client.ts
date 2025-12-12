import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis configuration')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Rate limiting configurations
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
  prefix: 'ratelimit:login',
})

export const signupRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 requests per hour
  analytics: true,
  prefix: 'ratelimit:signup',
})

export const emailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 emails per hour
  analytics: true,
  prefix: 'ratelimit:email',
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:api',
})

// Session storage helpers
export async function setSession(token: string, data: any, expiresIn: number) {
  await redis.setex(`session:${token}`, expiresIn, JSON.stringify(data))
}

export async function getSession(token: string) {
  const data = await redis.get(`session:${token}`)
  return data ? JSON.parse(data as string) : null
}

export async function deleteSession(token: string) {
  await redis.del(`session:${token}`)
}

// PKCE code challenge storage
export async function storePKCEChallenge(
  code: string,
  challenge: string,
  method: string,
  expiresIn: number
) {
  await redis.setex(
    `pkce:${code}`,
    expiresIn,
    JSON.stringify({ challenge, method })
  )
}

export async function getPKCEChallenge(code: string) {
  const data = await redis.get(`pkce:${code}`)
  if (!data) return null
  return JSON.parse(data as string)
}

export async function deletePKCEChallenge(code: string) {
  await redis.del(`pkce:${code}`)
}

// Authorization code storage
export async function storeAuthCode(
  code: string,
  data: any,
  expiresIn: number
) {
  await redis.setex(`authcode:${code}`, expiresIn, JSON.stringify(data))
}

export async function getAuthCode(code: string) {
  const data = await redis.get(`authcode:${code}`)
  return data ? JSON.parse(data as string) : null
}

export async function deleteAuthCode(code: string) {
  await redis.del(`authcode:${code}`)
}

// Verification token storage
export async function storeVerificationToken(
  token: string,
  data: any,
  expiresIn: number
) {
  await redis.setex(`verification:${token}`, expiresIn, JSON.stringify(data))
}

export async function getVerificationToken(token: string) {
  const data = await redis.get(`verification:${token}`)
  return data ? JSON.parse(data as string) : null
}

export async function deleteVerificationToken(token: string) {
  await redis.del(`verification:${token}`)
}
