import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export interface EmailNotification {
  to: string
  subject?: string
  template: 'signin' | 'deposit' | 'withdrawal' | 'return' | 'welcome' | 'recovery'
  data: Record<string, string | number | boolean>
}

const emailTemplates = {
  signin: (data: Record<string, string | number | boolean>) => ({
    subject: 'New Sign In to Your Vault Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">New Sign In Detected</h2>
        <p>Hi ${data.fullName},</p>
        <p>Your Vault account was just signed into at <strong>${data.time}</strong>.</p>
        <p><strong>Location:</strong> ${data.location || 'Unknown'}</p>
        <p><strong>Device:</strong> ${data.device || 'Unknown'}</p>
        <p>If this wasn't you, please <a href="${data.supportLink}">contact support immediately</a>.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `,
  }),
  deposit: (data: Record<string, string | number | boolean>) => ({
    subject: `Deposit Confirmed - $${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Deposit Confirmed</h2>
        <p>Hi ${data.fullName},</p>
        <p>Your deposit has been successfully processed!</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Amount:</strong></td>
            <td style="padding: 10px 0;">$${data.amount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Date:</strong></td>
            <td style="padding: 10px 0;">${data.date}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Status:</strong></td>
            <td style="padding: 10px 0; color: #10b981;"><strong>Approved</strong></td>
          </tr>
        </table>
        <p><a href="${data.dashboardLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">View Dashboard</a></p>
      </div>
    `,
  }),
  withdrawal: (data: Record<string, string | number | boolean>) => ({
    subject: `Withdrawal Request - $${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Withdrawal Request Received</h2>
        <p>Hi ${data.fullName},</p>
        <p>Your withdrawal request has been submitted.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Amount:</strong></td>
            <td style="padding: 10px 0;">$${data.amount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Destination:</strong></td>
            <td style="padding: 10px 0;">${data.destination}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Expected Time:</strong></td>
            <td style="padding: 10px 0;">${data.expectedTime}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 14px;">Processing typically takes 1-3 business days. You'll receive another email when the transfer is complete.</p>
      </div>
    `,
  }),
  return: (data: Record<string, string | number | boolean>) => ({
    subject: `Investment Return Credited - $${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Return Credited to Your Account</h2>
        <p>Hi ${data.fullName},</p>
        <p>Your investment return has been credited!</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Amount:</strong></td>
            <td style="padding: 10px 0;">$${data.amount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Plan:</strong></td>
            <td style="padding: 10px 0;">${data.planName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 0;"><strong>Date:</strong></td>
            <td style="padding: 10px 0;">${data.date}</td>
          </tr>
        </table>
        <p>Your new balance is <strong>$${data.newBalance}</strong></p>
      </div>
    `,
  }),
  welcome: (data: Record<string, string | number | boolean>) => ({
    subject: 'Welcome to Vault Capital!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to Vault Capital!</h2>
        <p>Hi ${data.fullName},</p>
        <p>Your account has been created successfully. You're now ready to start investing with Vault.</p>
        <p><strong>Quick Start Guide:</strong></p>
        <ol>
          <li>Complete your profile in Settings</li>
          <li>Make your first deposit</li>
          <li>Choose an investment plan</li>
          <li>Start earning returns</li>
        </ol>
        <p><a href="${data.dashboardLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Go to Dashboard</a></p>
      </div>
    `,
  }),
  recovery: (data: Record<string, string | number | boolean>) => ({
    subject: 'Account Recovery Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Password Recovery Request</h2>
        <p>Hi ${data.userName},</p>
        <p>We received a request to reset your Vault account password.</p>
        <p style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
          <strong style="font-size: 24px; color: #1f2937;">${data.code}</strong><br/>
          <span style="color: #6b7280; font-size: 12px;">Use this code to reset your password. It expires in 15 minutes.</span>
        </p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `,
  }),
}

export async function sendNotificationEmail(notification: EmailNotification) {
  try {
    const template = emailTemplates[notification.template]
    const { subject, html } = template(notification.data)

    await transporter.sendMail({
      from: `Vault Capital <${process.env.EMAIL_FROM}>`,
      to: notification.to,
      subject,
      html,
    })

    console.log(`[Email] Sent ${notification.template} to ${notification.to}`)
  } catch (error) {
    console.error(`[Email] Failed to send ${notification.template}:`, error)
    throw error
  }
}
