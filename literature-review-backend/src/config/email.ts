import nodemailer from 'nodemailer';
import { config } from './env';
import logger from './logger';

// Create reusable transporter
export const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

// Verify SMTP connection
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    logger.info('✓ Email service connection successful');
    return true;
  } catch (error) {
    logger.error('✗ Email service connection failed:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  verification: (firstName: string, token: string) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to Literature Review System!</h2>
        <p>Hi ${firstName || 'there'},</p>
        <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5000/v1/auth/verify-email?token=${token}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6B7280; word-break: break-all;">http://localhost:5000/v1/auth/verify-email?token=${token}</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 24 hours.<br>
          If you didn't create this account, please ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px;">
          <strong>Note:</strong> This link goes directly to the API. You'll see a JSON response confirming verification.
        </p>
      </div>
    `,
    text: `
      Welcome to Literature Review System!
      
      Hi ${firstName || 'there'},
      
      Thank you for registering! Please verify your email address by visiting:
      http://localhost:5000/v1/auth/verify-email?token=${token}
      
      This link will expire in 24 hours.
      If you didn't create this account, please ignore this email.
      
      Note: This link goes directly to the API. You'll see a JSON response confirming verification.
    `,
  }),

  passwordReset: (firstName: string, token: string) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Hi ${firstName || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/reset-password?token=${token}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6B7280; word-break: break-all;">${config.frontendUrl}/reset-password?token=${token}</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour.<br>
          If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    `,
    text: `
      Password Reset Request
      
      Hi ${firstName || 'there'},
      
      We received a request to reset your password. Visit this link to create a new password:
      ${config.frontendUrl}/reset-password?token=${token}
      
      This link will expire in 1 hour.
      If you didn't request a password reset, please ignore this email.
    `,
  }),

  welcome: (firstName: string) => ({
    subject: 'Welcome to Literature Review System!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome Aboard! 🎉</h2>
        <p>Hi ${firstName},</p>
        <p>Your email has been verified successfully! You're all set to start using the Literature Review System.</p>
        <p>Here's what you can do:</p>
        <ul style="line-height: 1.8;">
          <li>Analyze research papers with AI</li>
          <li>Discover research gaps automatically</li>
          <li>Generate literature review sections</li>
          <li>Save and organize your research</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">
          Need help? Check out our documentation or contact support.
        </p>
      </div>
    `,
    text: `
      Welcome Aboard!
      
      Hi ${firstName},
      
      Your email has been verified successfully! You're all set to start using the Literature Review System.
      
      Visit your dashboard: ${config.frontendUrl}/dashboard
    `,
  }),
};
