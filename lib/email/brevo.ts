import axios from 'axios'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.SENDER_EMAIL
  const senderName = process.env.SENDER_NAME || 'UniVerse Identity'

  if (!apiKey || !senderEmail) {
    console.error('Missing Brevo configuration')
    return false
  }

  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: options.to,
          },
        ],
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text || options.html.replace(/<[^>]*>/g, ''),
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyUrl = `${appUrl}/verify?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">UniVerse Identity</h1>
        </div>
        <div style="background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          <p>Thank you for signing up! Please click the button below to verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Verify Email</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #667eea; word-break: break-all; font-size: 14px;">${verifyUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} UniVerse Identity. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - UniVerse Identity',
    html,
  })
}

export async function sendMagicLinkEmail(
  email: string,
  token: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const loginUrl = `${appUrl}/login/magic?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign In to UniVerse Identity</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">UniVerse Identity</h1>
        </div>
        <div style="background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Sign In to Your Account</h2>
          <p>Click the button below to sign in to your UniVerse Identity account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Sign In</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #667eea; word-break: break-all; font-size: 14px;">${loginUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this link, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} UniVerse Identity. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Sign In to UniVerse Identity',
    html,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">UniVerse Identity</h1>
        </div>
        <div style="background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #667eea; word-break: break-all; font-size: 14px;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} UniVerse Identity. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - UniVerse Identity',
    html,
  })
}
