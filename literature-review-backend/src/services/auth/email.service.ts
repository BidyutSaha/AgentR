import { transporter, emailTemplates } from '../../config/email';
import { config } from '../../config/env';
import logger from '../../config/logger';

/**
 * Email Service
 * Handles sending emails for authentication flows
 */

/**
 * Send email verification email
 * 
 * @param email - Recipient email address
 * @param firstName - User's first name
 * @param token - Verification token
 */
export async function sendVerificationEmail(
    email: string,
    firstName: string,
    token: string
): Promise<void> {
    try {
        const template = emailTemplates.verification(firstName, token);

        await transporter.sendMail({
            from: config.emailFrom,
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });

        logger.info(`Verification email sent to ${email}`);
    } catch (error) {
        logger.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }
}

/**
 * Send password reset email
 * 
 * @param email - Recipient email address
 * @param firstName - User's first name
 * @param token - Password reset token
 */
export async function sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string
): Promise<void> {
    try {
        const template = emailTemplates.passwordReset(firstName, token);

        await transporter.sendMail({
            from: config.emailFrom,
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });

        logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
        logger.error('Failed to send password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
}

/**
 * Send welcome email after successful verification
 * 
 * @param email - Recipient email address
 * @param firstName - User's first name
 */
export async function sendWelcomeEmail(
    email: string,
    firstName: string
): Promise<void> {
    try {
        const template = emailTemplates.welcome(firstName);

        await transporter.sendMail({
            from: config.emailFrom,
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });

        logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
        // Don't throw error for welcome email - it's not critical
        logger.error('Failed to send welcome email:', error);
    }
}

/**
 * Send a generic email
 * Useful for custom notifications
 * 
 * @param email - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content
 * @param text - Plain text content
 */
export async function sendEmail(
    email: string,
    subject: string,
    html: string,
    text?: string
): Promise<void> {
    try {
        await transporter.sendMail({
            from: config.emailFrom,
            to: email,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
        });

        logger.info(`Email sent to ${email}: ${subject}`);
    } catch (error) {
        logger.error('Failed to send email:', error);
        throw new Error('Failed to send email');
    }
}
