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

// Vault Logo SVG as Data URI (Navy #3d2817 - website's professional navy)
const LOGO_DATA_URI = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTIwIDEyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxNSIgeT0iMjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI4MCIgcng9IjEyIiByeT0iMTIiIHN0cm9rZT0iIzNkMjgxNyIgc3Ryb2tlLXdpZHRoPSIyLjUiLz48cmVjdCB4PSIyNSIgeT0iMzAiIHdpZHRoPSI3MCIgaGVpZ2h0PSI2MCIgcng9IjgiIHJ5PSI4IiBmaWxsPSIjM2QyODE3IiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSIxOCIgc3Ryb2tlPSIjM2QyODE3IiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSIxNCIgc3Ryb2tlPSIjM2QyODE3IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iMyAzIiBvcGFjaXR5PSIwLjUiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQ4IiByPSIyLjUiIGZpbGw9IiMzZDI4MTciLz48bGluZSB4MT0iMzUiIHkxPSI5MCIgeDI9Ijg1IiB5Mj0iOTAiIHN0cm9rZT0iIzNkMjgxNyIgc3Ryb2tlLXdpZHRoPSIxLjUiIG9wYWNpdHk9IjAuNiIvPjxsaW5lIHgxPSIzNSIgeTE9IjEwMCIgeDI9Ijg1IiB5Mj0iMTAwIiBzdHJva2U9IiMzZDI4MTciIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC40Ii8+PHJlY3QgeD0iMTUiIHk9IjE4IiB3aWR0aD0iOTAiIGhlaWdodD0iMiIgcng9IjEiIGZpbGw9IiMzZDI4MTciLz48L3N2Zz4='

export interface EmailNotification {
  to: string
  subject?: string
  template: 'signin' | 'deposit' | 'withdrawal' | 'return' | 'welcome' | 'recovery' | 'verification'
  data: Record<string, string | number | boolean>
}

const emailTemplates = {
  signin: (data: Record<string, string | number | boolean>) => ({
    subject: 'New Sign In to Your Vault Account',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3d2817 0%, #2a1c0f 100%); padding: 20px; text-align: center;">
          <tr>
            <td>
              <img src="${LOGO_DATA_URI}" alt="Vault Capital" width="40" height="40" style="margin: 0 auto; display: block; margin-bottom: 10px;"/>
              <h1 style="color: #daa520; font-size: 24px; margin: 10px 0 0 0;">Vault Capital</h1>
            </td>
          </tr>
        </table>
        
        <div style="padding: 40px 20px; background-color: white;">
          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">New Sign In Detected</h2>
          <p>Hi ${data.fullName},</p>
          <p style="color: #6b7280;">Your Vault account was just signed into at <strong>${data.time}</strong>.</p>
          <p style="color: #6b7280;"><strong>Location:</strong> ${data.location || 'Unknown'}</p>
          <p style="color: #6b7280;"><strong>Device:</strong> ${data.device || 'Unknown'}</p>
          <p style="color: #ef4444; margin-top: 20px;">If this wasn't you, please <a href="${data.supportLink}" style="color: #3b82f6; text-decoration: none;">contact support immediately</a>.</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © 2026 Vault Capital. All rights reserved.<br/>
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),
  deposit: (data: Record<string, string | number | boolean>) => ({
    subject: `Deposit Confirmed - $${data.amount}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3d2817 0%, #2a1c0f 100%); padding: 20px; text-align: center;">
          <tr>
            <td>
              <img src="${LOGO_DATA_URI}" alt="Vault Capital" width="40" height="40" style="margin: 0 auto; display: block; margin-bottom: 10px;"/>
              <h1 style="color: #daa520; font-size: 24px; margin: 10px 0 0 0;">Deposit Confirmed</h1>
            </td>
          </tr>
        </table>
        
        <div style="padding: 40px 20px; background-color: white;">
          <p style="margin: 0 0 20px 0;">Hi ${data.fullName},</p>
          <p style="color: #6b7280;">Your deposit has been successfully processed!</p>
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Amount:</strong></td>
              <td style="padding: 12px 0; color: #daa520;"><strong>$${data.amount}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Date:</strong></td>
              <td style="padding: 12px 0;">${data.date}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Status:</strong></td>
              <td style="padding: 12px 0;"><span style="color: #daa520; font-weight: bold;">✓ Approved</span></td>
            </tr>
          </table>
          <div style="text-align: center;">
            <a href="${data.dashboardLink}" style="background-color: #3d2817; color: #daa520; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 500; border: 2px solid #daa520;">View Dashboard</a>
          </div>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © 2026 Vault Capital. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
  withdrawal: (data: Record<string, string | number | boolean>) => ({
    subject: `Withdrawal Request - $${data.amount}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3d2817 0%, #2a1c0f 100%); padding: 20px; text-align: center;">
          <tr>
            <td>
              <img src="${LOGO_DATA_URI}" alt="Vault Capital" width="40" height="40" style="margin: 0 auto; display: block; margin-bottom: 10px;"/>
              <h1 style="color: #daa520; font-size: 24px; margin: 10px 0 0 0;">Withdrawal Submitted</h1>
            </td>
          </tr>
        </table>
        
        <div style="padding: 40px 20px; background-color: white;">
          <p style="margin: 0 0 20px 0;">Hi ${data.fullName},</p>
          <p style="color: #6b7280;">Your withdrawal request has been submitted and is being processed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Amount:</strong></td>
              <td style="padding: 12px 0;">$${data.amount}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Destination:</strong></td>
              <td style="padding: 12px 0;">${data.destination}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Expected Time:</strong></td>
              <td style="padding: 12px 0;">${data.expectedTime}</td>
            </tr>
          </table>
          <p style="color: #9ca3af; font-size: 13px;">Processing typically takes 1-3 business days. You'll receive another email when the transfer is complete.</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © 2026 Vault Capital. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
  return: (data: Record<string, string | number | boolean>) => ({
    subject: `Investment Return Credited - $${data.amount}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3d2817 0%, #2a1c0f 100%); padding: 20px; text-align: center;">
          <tr>
            <td>
              <img src="${LOGO_DATA_URI}" alt="Vault Capital" width="40" height="40" style="margin: 0 auto; display: block; margin-bottom: 10px;"/>
              <h1 style="color: #daa520; font-size: 24px; margin: 10px 0 0 0;">Return Credited</h1>
            </td>
          </tr>
        </table>
        
        <div style="padding: 40px 20px; background-color: white;">
          <p style="margin: 0 0 20px 0;">Hi ${data.fullName},</p>
          <p style="color: #6b7280;">Your investment return has been credited to your account!</p>
          <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Amount:</strong></td>
              <td style="padding: 12px 0; color: #10b981;"><strong>$${data.amount}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Plan:</strong></td>
              <td style="padding: 12px 0;">${data.planName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0;"><strong style="color: #1f2937;">Date:</strong></td>
              <td style="padding: 12px 0;">${data.date}</td>
            </tr>
          </table>
          <p style="color: #1f2937;">Your new balance is <strong style="color: #10b981;">$${data.newBalance}</strong></p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © 2026 Vault Capital. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
  welcome: (data: Record<string, string | number | boolean>) => ({
    subject: 'Welcome to Vault Capital! 🚀',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <!-- Header with Logo and Gradient Background -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3d2817 0%, #2a1c0f 100%); padding: 40px 20px; text-align: center;">
          <tr>
            <td>
              <img src="${LOGO_DATA_URI}" alt="Vault Capital" width="60" height="60" style="margin: 0 auto; display: block; margin-bottom: 20px;"/>
              <h1 style="color: #daa520; font-size: 32px; margin: 0; font-weight: 700;">Welcome to Vault Capital</h1>
              <p style="color: rgba(218,165,32,0.85); font-size: 16px; margin: 10px 0 0 0;">Your journey to financial freedom starts here</p>
            </td>
          </tr>
        </table>
        
        <!-- Main Content -->
        <div style="padding: 40px 20px; background-color: white;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hi ${data.fullName},</p>
          
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
            Congratulations! Your Vault Capital account has been successfully created. You're now part of a community of investors who are working towards their financial goals with confidence and security.
          </p>
          
          <!-- Quick Start Cards -->
          <div style="margin: 30px 0;">
            <p style="color: #1f2937; font-weight: 600; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px;">Quick Start Guide</p>
            
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 15px; background-color: #eff6ff; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3b82f6;">
                  <p style="color: #1e40af; font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">1. Verify Your Email</p>
                  <p style="color: #1e40af; font-size: 13px; margin: 0;">Check your inbox for the confirmation code to activate your account.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #10b981;">
                  <p style="color: #15803d; font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">2. Complete Your Profile</p>
                  <p style="color: #15803d; font-size: 13px; margin: 0;">Add your personal information and investment preferences in Settings.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #f59e0b;">
                  <p style="color: #92400e; font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">3. Make Your First Deposit</p>
                  <p style="color: #92400e; font-size: 13px; margin: 0;">Fund your account and choose from our carefully designed investment plans.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 15px; background-color: #fce7f3; border-radius: 8px; border-left: 4px solid #ec4899;">
                  <p style="color: #831843; font-weight: 600; margin: 0 0 5px 0; font-size: 14px;">4. Start Earning Returns</p>
                  <p style="color: #831843; font-size: 13px; margin: 0;">Monitor your investments and watch your portfolio grow with automated strategies.</p>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${data.dashboardLink}" style="background: linear-gradient(135deg, #3d2817 0%, #2a1c0f 100%); color: #daa520; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; transition: all 0.3s ease; border: 2px solid #daa520;">
              Go to Dashboard →
            </a>
          </div>
          
          <!-- Features Highlight -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
              <strong style="color: #1f2937;">🔒 Bank-Level Security</strong><br/>
              Your assets are protected with military-grade encryption and 24/7 monitoring.<br/><br/>
              <strong style="color: #1f2937;">📊 AI-Powered Management</strong><br/>
              Our advanced algorithms automatically optimize your portfolio for maximum returns.<br/><br/>
              <strong style="color: #1f2937;">💬 24/7 Support</strong><br/>
              Our dedicated team is always here to help you succeed.
            </p>
          </div>
          
          <!-- Footer Message -->
          <p style="color: #6b7280; font-size: 13px; margin: 30px 0 0 0;">
            If you have any questions or need assistance, please don't hesitate to <a href="mailto:support@vaultcapital.bond" style="color: #daa520; text-decoration: none;">contact our support team</a>.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
            <a href="https://vault-finance.vercel.app" style="color: #3b82f6; text-decoration: none;">Visit Vault Capital</a> • 
            <a href="https://vault-finance.vercel.app/security" style="color: #3b82f6; text-decoration: none;">Security</a> • 
            <a href="https://vault-finance.vercel.app/contact" style="color: #3b82f6; text-decoration: none;">Support</a>
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © 2026 Vault Capital. All rights reserved.<br/>
            This is an automated welcome message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),
  recovery: (data: Record<string, string | number | boolean>) => ({
    subject: 'Password Recovery - Vault Capital',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3d2817 0%, #2a1c0f 100%); padding: 20px; text-align: center;">
          <tr>
            <td>
              <img src="${LOGO_DATA_URI}" alt="Vault Capital" width="40" height="40" style="margin: 0 auto; display: block; margin-bottom: 10px;"/>
              <h1 style="color: #daa520; font-size: 24px; margin: 10px 0 0 0;">Password Recovery</h1>
            </td>
          </tr>
        </table>
        
        <div style="padding: 40px 20px; background-color: white;">
          <p>Hi ${data.userName},</p>
          <p style="color: #6b7280;">We received a request to reset your Vault account password.</p>
          <p style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 24px; color: #1f2937; font-family: 'Courier New', monospace;">${data.code}</strong><br/>
            <span style="color: #6b7280; font-size: 12px;">Use this code to reset your password. It expires in 15 minutes.</span>
          </p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © 2026 Vault Capital. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),
  verification: (data: Record<string, string | number | boolean>) => ({
    subject: 'Verify Your Vault Account',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; text-align: center;">
          <tr>
            <td>
              <img src="${LOGO_DATA_URI}" alt="Vault Capital" width="40" height="40" style="margin: 0 auto; display: block; margin-bottom: 10px;"/>
              <h1 style="color: white; font-size: 24px; margin: 10px 0 0 0;">Confirm Your Email</h1>
            </td>
          </tr>
        </table>
        
        <div style="padding: 40px 20px; background-color: white;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hi ${data.fullName || 'there'},</p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
            Welcome to Vault Capital! To complete your signup, please verify your email address by entering the confirmation code below.
          </p>
          
          <div style="background: linear-gradient(135deg, #3d2817 0%, #2a1c0f 100%); border-radius: 8px; padding: 30px; margin: 30px 0; text-align: center; border: 2px solid #daa520;">
            <p style="color: #daa520; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Your Verification Code</p>
            <p style="font-size: 42px; font-weight: bold; color: #daa520; margin: 0; letter-spacing: 5px; font-family: 'Courier New', monospace;">${data.code}</p>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0 0 30px 0;">
            This code expires in <strong>10 minutes</strong>
          </p>
          
          <div style="background-color: #f5ecde; border-left: 4px solid #daa520; padding: 15px; border-radius: 4px; margin: 30px 0;">
            <p style="color: #3d2817; font-size: 13px; margin: 0;"><strong>🔒 Security Tip:</strong> Never share this code with anyone. Vault staff will never ask for it.</p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            If you didn't create a Vault account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © 2026 Vault Capital. All rights reserved.<br/>
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),
}

export async function sendNotificationEmail(notification: EmailNotification) {
  try {
    const template = emailTemplates[notification.template]
    const { subject, html } = template(notification.data)

    const fromEmail = process.env.EMAIL_FROM || `${process.env.EMAIL_USER}`

    await transporter.sendMail({
      from: `Vault Capital <${fromEmail}>`,
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
